const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const collectBlock = require('mineflayer-collectblock').plugin;
const mcData = require('minecraft-data');

// Configuration
const config = {
    host: 'gameplannet.aternos.me',
    port: 43658,
    username: 'CraftMan',
    version: '1.21.1', // Aternos likely uses 1.21.1
    auth: 'offline' // For cracked server
};

// Home location
let homeLocation = null;
let isSleeping = false;
let bot = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 50; // Higher for Render
let activityInterval = null;
let isActive = false;

// Function to create and configure bot
function createBot() {
    console.log(`[${new Date().toLocaleTimeString()}] Creating bot...`);
    
    bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: config.version,
        auth: config.auth,
        checkTimeoutInterval: 60000, // Increase timeout for Aternos
        hideErrors: false
    });

    // Load plugins
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(collectBlock);

    // Bot event handlers
    bot.on('login', () => {
        console.log(`[${new Date().toLocaleTimeString()}] Bot logged in as ${bot.username}`);
        reconnectAttempts = 0;
        
        // Request OP
        setTimeout(() => {
            bot.chat('/op ' + bot.username);
        }, 5000);
        
        // Set to creative mode
        setTimeout(() => {
            bot.chat('/gamemode creative');
            console.log('Set to creative mode');
        }, 7000);
    });

    bot.on('spawn', () => {
        console.log(`[${new Date().toLocaleTimeString()}] Bot spawned at ${bot.entity.position}`);
        
        if (!homeLocation) {
            homeLocation = bot.entity.position.clone();
            console.log(`Home location auto-set to: ${homeLocation}`);
            bot.chat('Home location auto-set!');
        }
        
        // Make sure bot has bed in inventory
        ensureBedInInventory();
        
        // Start monitoring
        startMonitoring();
        console.log('Bot is now active!');
    });

    bot.on('time', () => {
        checkTimeAndSleep();
    });

    bot.on('playerCollect', (collector, collected) => {
        if (collector === bot.entity) {
            console.log(`Collected: ${collected.name}`);
        }
    });

    bot.on('death', () => {
        console.log('Bot died, respawning...');
        isSleeping = false;
        setTimeout(() => {
            if (bot && bot.entity) {
                goToHomeAndSleep();
            }
        }, 3000);
    });

    bot.on('kicked', (reason) => {
        console.log(`Bot kicked: ${reason}`);
        if (reason.toString().includes('restart') || 
            reason.toString().includes('Shutdown') ||
            reason.toString().includes('closed') ||
            reason.toString().includes('timeout')) {
            console.log('Server restart/timeout detected, will reconnect...');
            setTimeout(reconnectBot, 10000);
        }
    });

    bot.on('error', (err) => {
        console.log(`Bot error: ${err.message}`);
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
            console.log('Connection error, reconnecting in 15 seconds...');
            setTimeout(reconnectBot, 15000);
        }
    });

    bot.on('end', (reason) => {
        console.log(`Bot disconnected: ${reason}`);
        cleanup();
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = Math.min(10000 * reconnectAttempts, 60000); // Exponential backoff
            console.log(`Reconnecting in ${delay/1000} seconds... Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
            setTimeout(reconnectBot, delay);
        } else {
            console.log('Max reconnection attempts reached. Waiting 5 minutes before retrying...');
            setTimeout(() => {
                reconnectAttempts = 0;
                reconnectBot();
            }, 300000);
        }
    });

    // Chat handler
    bot.on('message', (message) => {
        const msg = message.toString();
        const cleanMsg = msg.toLowerCase();
        
        // Log all chat
        console.log(`Chat: ${msg}`);
        
        // Set home location via command
        if (cleanMsg.includes('sethome') && cleanMsg.includes('craftman')) {
            setHomeLocation();
        }
        
        // Manual sleep command
        if (cleanMsg.includes('sleep') && cleanMsg.includes('craftman')) {
            goToHomeAndSleep();
        }
        
        // Debug commands
        if (cleanMsg.includes('debug') && cleanMsg.includes('craftman')) {
            bot.chat(`Position: ${bot.entity.position}, Time: ${bot.time.timeOfDay}, Sleeping: ${isSleeping}`);
        }
    });
}

// Cleanup function
function cleanup() {
    if (activityInterval) {
        clearInterval(activityInterval);
        activityInterval = null;
    }
    isActive = false;
    isSleeping = false;
}

// Reconnect function
function reconnectBot() {
    console.log(`[${new Date().toLocaleTimeString()}] Attempting to reconnect...`);
    cleanup();
    if (bot) {
        try {
            bot.end();
        } catch (e) {
            // Ignore errors during cleanup
        }
    }
    setTimeout(createBot, 2000);
}

// Set home location
function setHomeLocation() {
    if (bot && bot.entity) {
        homeLocation = bot.entity.position.clone();
        console.log(`Home location set to: ${homeLocation}`);
        bot.chat('Home location set!');
        
        // Ensure bed at home
        setTimeout(() => {
            ensureBedAtHome();
        }, 1000);
    }
}

// Ensure bed in inventory
function ensureBedInInventory() {
    if (!bot) return;
    
    try {
        const bedItem = mcData(bot.version).itemsByName.red_bed || 
                       mcData(bot.version).itemsByName.bed;
        
        if (bedItem) {
            const beds = bot.inventory.items().filter(item => 
                item.name.includes('bed')
            );
            
            if (beds.length === 0) {
                console.log('No bed in inventory, requesting one...');
                bot.chat('/give @s red_bed 1');
                setTimeout(() => {
                    // Check again
                    const bedsCheck = bot.inventory.items().filter(item => 
                        item.name.includes('bed')
                    );
                    console.log(`Beds in inventory after request: ${bedsCheck.length}`);
                }, 2000);
            } else {
                console.log(`Beds in inventory: ${beds.length}`);
            }
        }
    } catch (err) {
        console.log(`Error checking inventory: ${err.message}`);
    }
}

// Ensure bed at home
async function ensureBedAtHome() {
    if (!homeLocation || !bot) return;
    
    try {
        // Find beds near home (radius 4 blocks)
        const bedsNearHome = [];
        const radius = 4;
        
        for (let x = -radius; x <= radius; x++) {
            for (let y = -2; y <= 2; y++) {
                for (let z = -radius; z <= radius; z++) {
                    const block = bot.blockAt(homeLocation.offset(x, y, z));
                    if (block && block.name && block.name.includes('bed')) {
                        bedsNearHome.push(block);
                    }
                }
            }
        }
        
        console.log(`Found ${bedsNearHome.length} beds near home`);
        
        // Destroy extra beds (keep only one)
        if (bedsNearHome.length > 1) {
            for (let i = 1; i < bedsNearHome.length; i++) {
                try {
                    await destroyBlock(bedsNearHome[i].position);
                    await sleep(500); // Delay between destruction
                } catch (err) {
                    console.log(`Could not destroy bed: ${err.message}`);
                }
            }
        }
        
        // Place bed if none found
        if (bedsNearHome.length === 0) {
            await placeBedAtHome();
        }
        
    } catch (err) {
        console.log(`Error in ensureBedAtHome: ${err.message}`);
    }
}

// Place bed at perfect location
async function placeBedAtHome() {
    if (!homeLocation || !bot) return false;
    
    try {
        // Find suitable location near home (prefer positions at same Y level)
        const possibleLocations = [
            homeLocation.offset(1, 0, 0),
            homeLocation.offset(-1, 0, 0),
            homeLocation.offset(0, 0, 1),
            homeLocation.offset(0, 0, -1),
            homeLocation.offset(1, 0, 1),
            homeLocation.offset(-1, 0, -1)
        ];
        
        for (const loc of possibleLocations) {
            const floorLoc = loc.clone().floored();
            const blockBelow = bot.blockAt(floorLoc.offset(0, -1, 0));
            const blockAtPos = bot.blockAt(floorLoc);
            
            // Check if position is suitable
            if (blockBelow && blockBelow.boundingBox === 'block' && 
                (!blockAtPos || blockAtPos.boundingBox === 'empty')) {
                
                // Get bed from inventory
                const bedItem = bot.inventory.items().find(item => 
                    item.name.includes('bed')
                );
                
                if (bedItem) {
                    try {
                        // Equip bed
                        await bot.equip(bedItem, 'hand');
                        
                        // Look at position
                        await bot.lookAt(floorLoc.plus(new mineflayer.Vec3(0.5, 0, 0.5)));
                        
                        // Small delay
                        await sleep(500);
                        
                        // Place bed
                        await bot.placeBlock(bot.blockAt(floorLoc), new mineflayer.Vec3(0, 1, 0));
                        console.log(`Bed placed at: ${floorLoc}`);
                        
                        // Get another bed for inventory
                        setTimeout(ensureBedInInventory, 1000);
                        
                        return true;
                    } catch (placeErr) {
                        console.log(`Failed to place bed at ${floorLoc}: ${placeErr.message}`);
                        continue; // Try next location
                    }
                }
            }
        }
        
        console.log('Could not find suitable location for bed');
        return false;
        
    } catch (err) {
        console.log(`Error placing bed: ${err.message}`);
        return false;
    }
}

// Destroy block
async function destroyBlock(position) {
    try {
        const block = bot.blockAt(position);
        if (block && block.diggable) {
            await bot.dig(block);
            console.log(`Destroyed block at: ${position}`);
            return true;
        }
    } catch (err) {
        console.log(`Failed to destroy block: ${err.message}`);
    }
    return false;
}

// Go to home and sleep
async function goToHomeAndSleep() {
    if (!homeLocation || !bot || isSleeping) return;
    
    console.log('Going to home location...');
    isActive = false;
    
    try {
        // Set up pathfinder
        const movements = new Movements(bot, mcData(bot.version));
        movements.canDig = false;
        movements.allowParkour = false;
        bot.pathfinder.setMovements(movements);
        
        // Go to home
        const goal = new goals.GoalNear(homeLocation.x, homeLocation.y, homeLocation.z, 2);
        bot.pathfinder.setGoal(goal);
        
        // Wait until reached or timeout
        await Promise.race([
            new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (!bot.entity) {
                        clearInterval(checkInterval);
                        resolve();
                        return;
                    }
                    
                    const distance = bot.entity.position.distanceTo(homeLocation);
                    if (distance < 3) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 500);
                
                // Timeout after 30 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 30000);
            }),
            sleep(30000) // Max 30 seconds to reach home
        ]);
        
        // Try to sleep
        await trySleep();
        
    } catch (err) {
        console.log(`Error going home: ${err.message}`);
    }
}

// Try to sleep
async function trySleep() {
    if (isSleeping || !bot || !homeLocation) return;
    
    console.log('Attempting to sleep...');
    
    try {
        // First ensure we have a bed at home
        await ensureBedAtHome();
        
        // Find bed near home
        const radius = 4;
        let bedFound = null;
        
        for (let x = -radius; x <= radius; x++) {
            for (let y = -1; y <= 2; y++) {
                for (let z = -radius; z <= radius; z++) {
                    const block = bot.blockAt(homeLocation.offset(x, y, z));
                    if (block && block.name && block.name.includes('bed')) {
                        bedFound = block;
                        break;
                    }
                }
                if (bedFound) break;
            }
            if (bedFound) break;
        }
        
        if (bedFound) {
            try {
                console.log(`Found bed at ${bedFound.position}, attempting to sleep...`);
                await bot.sleep(bedFound);
                isSleeping = true;
                console.log('Successfully sleeping!');
                
                // Set up wake check
                const wakeCheck = setInterval(() => {
                    if (!bot.isSleeping) {
                        clearInterval(wakeCheck);
                        isSleeping = false;
                        console.log('Woke up!');
                        startDayActivities();
                    }
                }, 5000);
                
                return true;
            } catch (sleepErr) {
                console.log(`Cannot sleep: ${sleepErr.message}`);
                
                // If bed is occupied or obstructed
                if (sleepErr.message.includes('occupied') || 
                    sleepErr.message.includes('obstructed') ||
                    sleepErr.message.includes('not valid')) {
                    
                    console.log('Bed issue detected, placing new bed...');
                    
                    // Destroy problematic bed
                    await destroyBlock(bedFound.position);
                    await sleep(1000);
                    
                    // Place new bed
                    if (await placeBedAtHome()) {
                        return trySleep(); // Try again
                    }
                }
            }
        } else {
            console.log('No bed found, placing one...');
            if (await placeBedAtHome()) {
                return trySleep(); // Try again
            }
        }
    } catch (err) {
        console.log(`Error in trySleep: ${err.message}`);
    }
    
    return false;
}

// Start monitoring
function startMonitoring() {
    // Clear existing interval
    if (activityInterval) {
        clearInterval(activityInterval);
    }
    
    // Monitor time every 10 seconds
    activityInterval = setInterval(() => {
        if (bot && bot.entity) {
            checkTimeAndSleep();
        }
    }, 10000);
    
    // Start day activities if it's day
    setTimeout(() => {
        if (bot && bot.time) {
            const timeOfDay = bot.time.timeOfDay;
            const isNight = timeOfDay >= 13000 && timeOfDay <= 23000;
            
            if (!isNight && !isSleeping && !isActive) {
                startDayActivities();
            }
        }
    }, 5000);
}

// Check time and sleep
function checkTimeAndSleep() {
    if (!bot || !bot.time || isSleeping) return;
    
    const timeOfDay = bot.time.timeOfDay;
    const isNight = timeOfDay >= 13000 && timeOfDay <= 23000;
    
    if (isNight && !isSleeping) {
        console.log(`Night detected (time: ${timeOfDay}), going to sleep...`);
        goToHomeAndSleep();
    } else if (timeOfDay < 13000 && isSleeping) {
        // Wake up if sleeping during day
        if (bot.isSleeping) {
            bot.wake();
            isSleeping = false;
            console.log('Daytime, waking up!');
        }
    }
}

// Day activities
function startDayActivities() {
    if (!bot || !homeLocation || isActive) return;
    
    console.log('Starting day activities...');
    isActive = true;
    
    // Stop any existing pathfinding
    bot.pathfinder.setGoal(null);
    
    // Simple patrol pattern around home
    performDayActivity();
}

async function performDayActivity() {
    if (!bot || !homeLocation || !isActive || isSleeping) return;
    
    try {
        // Check if it's still day
        const timeOfDay = bot.time ? bot.time.timeOfDay : 0;
        const isNight = timeOfDay >= 13000 && timeOfDay <= 23000;
        
        if (isNight) {
            console.log('Night falling, stopping activities...');
            isActive = false;
            return;
        }
        
        // Random activity
        const activity = Math.floor(Math.random() * 3);
        
        switch (activity) {
            case 0:
                // Stay near home
                console.log('Activity: Staying near home');
                break;
                
            case 1:
                // Look around
                console.log('Activity: Looking around');
                const yaw = Math.random() * Math.PI * 2;
                const pitch = Math.random() * Math.PI - Math.PI / 2;
                await bot.look(yaw, pitch);
                break;
                
            case 2:
                // Move to random nearby position
                console.log('Activity: Exploring nearby');
                if (bot.entity) {
                    const movements = new Movements(bot, mcData(bot.version));
                    movements.canDig = false;
                    bot.pathfinder.setMovements(movements);
                    
                    const randomX = homeLocation.x + (Math.random() * 10 - 5);
                    const randomZ = homeLocation.z + (Math.random() * 10 - 5);
                    const goal = new goals.GoalNear(randomX, homeLocation.y, randomZ, 3);
                    
                    bot.pathfinder.setGoal(goal, () => {
                        // When reached, schedule next activity
                        if (isActive && !isSleeping) {
                            setTimeout(performDayActivity, 5000 + Math.random() * 10000);
                        }
                    });
                    
                    // Timeout for this movement
                    setTimeout(() => {
                        if (isActive && !isSleeping) {
                            bot.pathfinder.setGoal(null);
                            setTimeout(performDayActivity, 5000);
                        }
                    }, 15000);
                    
                    return; // Exit early since pathfinder callback handles next
                }
                break;
        }
        
        // Schedule next activity if still active
        if (isActive && !isSleeping) {
            setTimeout(performDayActivity, 10000 + Math.random() * 15000);
        }
        
    } catch (err) {
        console.log(`Error in day activity: ${err.message}`);
        if (isActive && !isSleeping) {
            setTimeout(performDayActivity, 10000);
        }
    }
}

// Utility sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the bot
createBot();

// Keep process alive
process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
});

process.on('SIGINT', () => {
    console.log('Shutting down...');
    cleanup();
    if (bot) {
        bot.end();
    }
    process.exit();
});

console.log('========================================');
console.log('CraftMan Bot for Minecraft 1.21.10');
console.log('Deployed on Render');
console.log('Server: gameplannet.aternos.me:43658');
console.log('========================================');
console.log('\nBot will automatically:');
console.log('1. Reconnect on server restart');
console.log('2. Sleep at night at home location');
console.log('3. Maintain exactly one bed at home');
console.log('4. Do activities during the day');
console.log('5. Run 24/7');
console.log('\nUse "sethome craftman" in chat to set home');
console.log('Make sure to OP the bot with "/op CraftMan"');
console.log('========================================');
