const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const collectBlock = require('mineflayer-collectblock').plugin;
const mcData = require('minecraft-data');

// Configuration
const config = {
    host: 'gameplannet.aternos.me',
    port: 43658,
    username: 'CraftMan',
    version: '1.21.1',
    auth: 'offline'
};

// Home location
let homeLocation = null;
let isSleeping = false;
let bot = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 50;
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
        checkTimeoutInterval: 60000,
        hideErrors: false
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(collectBlock);

    bot.on('login', () => {
        console.log(`[${new Date().toLocaleTimeString()}] Bot logged in as ${bot.username}`);
        reconnectAttempts = 0;
        
        setTimeout(() => {
            bot.chat('/op ' + bot.username);
        }, 5000);
        
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
            
            // Create a simple platform for bed
            setTimeout(() => {
                createBedPlatform();
            }, 2000);
        }
        
        ensureBedInInventory();
        startMonitoring();
        console.log('Bot is now active!');
    });

    bot.on('time', () => {
        checkTimeAndSleep();
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
            const delay = Math.min(10000 * reconnectAttempts, 60000);
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

    bot.on('message', (message) => {
        const msg = message.toString();
        const cleanMsg = msg.toLowerCase();
        
        console.log(`Chat: ${msg}`);
        
        if (cleanMsg.includes('sethome') && cleanMsg.includes('craftman')) {
            setHomeLocation();
        }
        
        if (cleanMsg.includes('sleep') && cleanMsg.includes('craftman')) {
            goToHomeAndSleep();
        }
        
        if (cleanMsg.includes('debug') && cleanMsg.includes('craftman')) {
            bot.chat(`Position: ${bot.entity.position}, Time: ${bot.time.timeOfDay}, Sleeping: ${isSleeping}`);
        }
        
        if (cleanMsg.includes('platform') && cleanMsg.includes('craftman')) {
            createBedPlatform();
        }
    });
}

// Create a platform for bed placement
async function createBedPlatform() {
    if (!bot || !homeLocation) return;
    
    console.log('Creating bed platform...');
    
    try {
        const platformSize = 3;
        const platformY = Math.floor(homeLocation.y);
        
        // Create a 3x3 platform
        for (let x = -1; x <= 1; x++) {
            for (let z = -1; z <= 1; z++) {
                const blockPos = homeLocation.offset(x, -1, z).floored();
                
                // Use creative command to place platform
                bot.chat(`/setblock ${blockPos.x} ${blockPos.y} ${blockPos.z} stone replace`);
                await sleep(100);
            }
        }
        
        console.log('Bed platform created!');
        
        // Ensure bed is placed on platform
        setTimeout(ensureBedAtHome, 1000);
        
    } catch (err) {
        console.log(`Error creating platform: ${err.message}`);
    }
}

function cleanup() {
    if (activityInterval) {
        clearInterval(activityInterval);
        activityInterval = null;
    }
    isActive = false;
    isSleeping = false;
}

function reconnectBot() {
    console.log(`[${new Date().toLocaleTimeString()}] Attempting to reconnect...`);
    cleanup();
    if (bot) {
        try {
            bot.end();
        } catch (e) {
            // Ignore
        }
    }
    setTimeout(createBot, 2000);
}

function setHomeLocation() {
    if (bot && bot.entity) {
        homeLocation = bot.entity.position.clone();
        console.log(`Home location set to: ${homeLocation}`);
        bot.chat('Home location set! Creating platform...');
        
        createBedPlatform();
    }
}

function ensureBedInInventory() {
    if (!bot) return;
    
    try {
        // Get any type of bed
        const beds = bot.inventory.items().filter(item => 
            item.name && item.name.includes('_bed')
        );
        
        if (beds.length === 0) {
            console.log('No bed in inventory, giving one...');
            // Try different bed types
            const bedTypes = ['red_bed', 'white_bed', 'blue_bed', 'black_bed'];
            bot.chat(`/give @s ${bedTypes[0]} 2`);
            console.log(`Requested ${bedTypes[0]}`);
            
            setTimeout(() => {
                const bedsCheck = bot.inventory.items().filter(item => 
                    item.name && item.name.includes('_bed')
                );
                console.log(`Beds in inventory after request: ${bedsCheck.length}`);
            }, 2000);
        } else {
            console.log(`Beds in inventory: ${beds.length}`);
        }
    } catch (err) {
        console.log(`Error checking inventory: ${err.message}`);
    }
}

async function ensureBedAtHome() {
    if (!homeLocation || !bot) return;
    
    console.log('Ensuring bed at home...');
    
    try {
        // First check if we have a bed in inventory
        const bedsInInventory = bot.inventory.items().filter(item => 
            item.name && item.name.includes('_bed')
        );
        
        if (bedsInInventory.length === 0) {
            console.log('No beds in inventory, getting one...');
            ensureBedInInventory();
            await sleep(2000);
        }
        
        // Find existing beds near home
        const radius = 5;
        let existingBed = null;
        
        for (let x = -radius; x <= radius; x++) {
            for (let y = -2; y <= 2; y++) {
                for (let z = -radius; z <= radius; z++) {
                    const pos = homeLocation.offset(x, y, z);
                    const block = bot.blockAt(pos);
                    if (block && block.name && block.name.includes('_bed')) {
                        existingBed = { block, pos };
                        break;
                    }
                }
                if (existingBed) break;
            }
            if (existingBed) break;
        }
        
        if (existingBed) {
            console.log(`Found existing bed at ${existingBed.pos}`);
            return true;
        } else {
            console.log('No existing bed found, placing new one...');
            return placeBedSimple();
        }
        
    } catch (err) {
        console.log(`Error in ensureBedAtHome: ${err.message}`);
        return false;
    }
}

// Simple bed placement at exact home location
async function placeBedSimple() {
    if (!bot || !homeLocation) return false;
    
    console.log('Placing bed using simple method...');
    
    try {
        // Get bed from inventory
        const beds = bot.inventory.items().filter(item => 
            item.name && item.name.includes('_bed')
        );
        
        if (beds.length === 0) {
            console.log('No bed in inventory for placement');
            ensureBedInInventory();
            return false;
        }
        
        const bedItem = beds[0];
        
        // Try to place bed at home position
        const bedPos = homeLocation.floored();
        
        try {
            console.log(`Placing bed at ${bedPos}...`);
            
            // Use creative command to place bed directly
            bot.chat(`/setblock ${bedPos.x} ${bedPos.y} ${bedPos.z} ${bedItem.name} replace`);
            
            console.log(`Bed placed at: ${bedPos}`);
            
            // Ensure we still have a bed in inventory
            setTimeout(ensureBedInInventory, 1000);
            
            return true;
            
        } catch (err) {
            console.log(`Failed to place bed: ${err.message}`);
            
            // Try alternative positions
            const altPositions = [
                bedPos.offset(1, 0, 0),
                bedPos.offset(0, 0, 1),
                bedPos.offset(-1, 0, 0),
                bedPos.offset(0, 0, -1)
            ];
            
            for (const altPos of altPositions) {
                try {
                    bot.chat(`/setblock ${altPos.x} ${altPos.y} ${altPos.z} ${bedItem.name} replace`);
                    console.log(`Bed placed at alternative position: ${altPos}`);
                    setTimeout(ensureBedInInventory, 1000);
                    return true;
                } catch (altErr) {
                    console.log(`Failed at ${altPos}: ${altErr.message}`);
                }
            }
            
            console.log('Could not place bed at any position');
            return false;
        }
        
    } catch (err) {
        console.log(`Error in placeBedSimple: ${err.message}`);
        return false;
    }
}

async function destroyBlock(position) {
    try {
        console.log(`Destroying block at ${position}`);
        bot.chat(`/setblock ${position.x} ${position.y} ${position.z} air replace`);
        console.log(`Destroyed block at: ${position}`);
        return true;
    } catch (err) {
        console.log(`Failed to destroy block: ${err.message}`);
        return false;
    }
}

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
        
        // Wait for arrival
        await new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (!bot.entity) {
                    clearInterval(checkInterval);
                    resolve();
                    return;
                }
                
                const distance = bot.entity.position.distanceTo(homeLocation);
                if (distance < 4) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 500);
            
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 30000);
        });
        
        // Ensure bed exists
        await ensureBedAtHome();
        
        // Try to sleep
        await trySleep();
        
    } catch (err) {
        console.log(`Error going home: ${err.message}`);
    }
}

async function trySleep() {
    if (isSleeping || !bot || !homeLocation) return;
    
    console.log('Attempting to sleep...');
    
    try {
        // First ensure bed is at home
        if (!await ensureBedAtHome()) {
            console.log('Failed to ensure bed at home');
            return false;
        }
        
        // Find bed near home
        const radius = 5;
        let bedBlock = null;
        
        for (let x = -radius; x <= radius; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -radius; z <= radius; z++) {
                    const pos = homeLocation.offset(x, y, z);
                    const block = bot.blockAt(pos);
                    if (block && block.name && block.name.includes('_bed')) {
                        bedBlock = block;
                        break;
                    }
                }
                if (bedBlock) break;
            }
            if (bedBlock) break;
        }
        
        if (!bedBlock) {
            console.log('No bed found after ensureBedAtHome');
            return false;
        }
        
        console.log(`Found bed at ${bedBlock.position}, attempting to sleep...`);
        
        // Move to bed position
        const bedStandPos = bedBlock.position.offset(0.5, 0, 0.5);
        await bot.lookAt(bedStandPos);
        
        // Try to sleep
        try {
            await bot.sleep(bedBlock);
            isSleeping = true;
            console.log('Successfully sleeping!');
            
            // Set up wake check
            const wakeCheck = setInterval(() => {
                if (!bot || !bot.isSleeping) {
                    clearInterval(wakeCheck);
                    isSleeping = false;
                    console.log('Woke up!');
                    if (bot && bot.time) {
                        const timeOfDay = bot.time.timeOfDay;
                        const isNight = timeOfDay >= 13000 && timeOfDay <= 23000;
                        if (!isNight) {
                            startDayActivities();
                        }
                    }
                }
            }, 5000);
            
            return true;
            
        } catch (sleepErr) {
            console.log(`Cannot sleep in bed: ${sleepErr.message}`);
            
            // Bed might be obstructed or occupied
            console.log('Bed issue, replacing...');
            await destroyBlock(bedBlock.position);
            await sleep(1000);
            
            // Place new bed
            if (await placeBedSimple()) {
                console.log('New bed placed, retrying sleep...');
                await sleep(1000);
                return trySleep();
            }
        }
        
    } catch (err) {
        console.log(`Error in trySleep: ${err.message}`);
    }
    
    return false;
}

function startMonitoring() {
    if (activityInterval) {
        clearInterval(activityInterval);
    }
    
    activityInterval = setInterval(() => {
        if (bot && bot.entity && bot.time) {
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

function checkTimeAndSleep() {
    if (!bot || !bot.time || isSleeping) return;
    
    const timeOfDay = bot.time.timeOfDay;
    const isNight = timeOfDay >= 13000 && timeOfDay <= 23000;
    
    console.log(`Time check: ${timeOfDay}, Is night: ${isNight}, Is sleeping: ${isSleeping}`);
    
    if (isNight && !isSleeping) {
        console.log(`Night detected (time: ${timeOfDay}), going to sleep...`);
        goToHomeAndSleep();
    } else if (timeOfDay < 13000 && isSleeping) {
        if (bot.isSleeping) {
            bot.wake();
            isSleeping = false;
            console.log('Daytime, waking up!');
            startDayActivities();
        }
    }
}

function startDayActivities() {
    if (!bot || !homeLocation || isActive || isSleeping) return;
    
    console.log('Starting day activities...');
    isActive = true;
    
    bot.pathfinder.setGoal(null);
    performDayActivity();
}

async function performDayActivity() {
    if (!bot || !homeLocation || !isActive || isSleeping) return;
    
    try {
        // Check time
        const timeOfDay = bot.time ? bot.time.timeOfDay : 0;
        const isNight = timeOfDay >= 13000 && timeOfDay <= 23000;
        
        if (isNight) {
            console.log('Night falling, stopping activities...');
            isActive = false;
            return;
        }
        
        // Simple activities
        console.log('Performing day activity...');
        
        // Just look around slowly
        const yaw = Math.random() * Math.PI * 2;
        const pitch = -0.3 + Math.random() * 0.6;
        await bot.look(yaw, pitch);
        
        // Schedule next activity
        if (isActive && !isSleeping) {
            setTimeout(performDayActivity, 15000 + Math.random() * 15000);
        }
        
    } catch (err) {
        console.log(`Error in day activity: ${err.message}`);
        if (isActive && !isSleeping) {
            setTimeout(performDayActivity, 10000);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the bot
createBot();

// Handle process signals
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
console.log('CraftMan Bot - Enhanced Bed System');
console.log('Server: gameplannet.aternos.me:43658');
console.log('========================================');
console.log('\nFeatures:');
console.log('1. Creates platform for bed placement');
console.log('2. Uses /setblock for reliable bed placement');
console.log('3. Better bed detection and management');
console.log('4. Improved sleep logic');
console.log('\nCommands in chat:');
console.log('- "sethome craftman" - Set home location');
console.log('- "platform craftman" - Create bed platform');
console.log('- "sleep craftman" - Force sleep');
console.log('- "debug craftman" - Show bot status');
console.log('========================================');
