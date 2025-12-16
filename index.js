// ============================================================
// 🚀 ULTIMATE MINECRAFT BOT SYSTEM v2.3
// 🎮 Complete Features • Home System • Building • Crash Protection               
// ============================================================

const mineflayer = require('mineflayer');
const http = require('http');
const Vec3 = require('vec3').Vec3;

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE MINECRAFT BOT SYSTEM v2.3                                 ║
║   🎮 Home System • Building • Crash Protection • All Features           ║
║   🤖 2 Bots • Perfect Sleep System • Home Location • Building           ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

// ================= CONFIGURATION =================
const CONFIG = {
  SERVER: {
    // Uses environment variables from render.yaml
    host: process.env.MINECRAFT_HOST || 'gameplannet.aternos.me',
    port: parseInt(process.env.MINECRAFT_PORT) || 43658,
    version: process.env.MINECRAFT_VERSION || '1.21.10'
  },
  BOTS: [
    {
      id: 'bot_001',
      name: 'CreativeMaster',
      personality: 'builder',
      color: '§a',
      activities: ['building', 'designing', 'crafting', 'socializing']
    },
    {
      id: 'bot_002',
      name: 'ResourceFinder',
      personality: 'miner',
      color: '§b',
      activities: ['mining', 'caving', 'socializing', 'fishing']
    }
  ],
  // Render's health check will use the PORT environment variable (default 10000)
  HEALTH_CHECK_PORT: process.env.PORT || 3000
};

// ================= LOGGING UTILITY =================
const logger = {
  log: (message, type = 'info', botName = 'System') => {
    const timestamp = new Date().toLocaleTimeString();
    let prefix;
    switch (type) {
      case 'info':
        prefix = '🔵 [INFO]';
        break;
      case 'success':
        prefix = '🟢 [SUCCESS]';
        break;
      case 'error':
        prefix = '🔴 [ERROR]';
        break;
      case 'warn':
        prefix = '🟠 [WARN]';
        break;
      default:
        prefix = '[LOG]';
    }
    console.log(`${timestamp} ${prefix} [${botName}] ${message}`);
  }
};

// ================= CORE BOT CLASS =================

class UltimateBot {
  constructor(botConfig) {
    this.config = botConfig;
    this.state = {
      id: botConfig.id,
      username: botConfig.name,
      personality: botConfig.personality,
      isBuilding: false,
      isSleeping: false,
      isPatrolling: false,
      home: null,
      target: null,
      currentBuild: null,
      metrics: {
        reconnects: 0,
        crashes: 0,
        blocksPlaced: 0,
        blocksMined: 0,
        perfectStructures: 0,
        structuresBuilt: 0,
        buildingTime: 0, // milliseconds
        uptime: Date.now()
      }
    };
    this.bot = null;
    this.reconnectTimeout = null;
    this.activityInterval = null;
    this.homeSystem = {
      isSet: false,
      location: null,
      bedPos: null
    };
    logger.log(`Initialized bot: ${this.state.username} (${this.state.personality})`, 'info', this.state.username);
    this.connect();
  }

  // --- CONNECTION & CRASH HANDLING ---

  connect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    const botOptions = {
      host: CONFIG.SERVER.host,
      port: CONFIG.SERVER.port,
      username: this.state.username,
      version: CONFIG.SERVER.version,
      // FIX: Use 'offline' auth for cracked servers
      auth: 'offline' 
    };

    try {
      this.bot = mineflayer.createBot(botOptions);
      this.setupListeners();
      logger.log('Attempting to connect...', 'info', this.state.username);
    } catch (error) {
      logger.log(`FATAL: Failed to create bot instance: ${error.message}`, 'error', this.state.username);
      this.scheduleReconnect(5000); // 5 seconds initial delay
    }
  }

  setupListeners() {
    this.bot.on('kicked', (reason) => {
      logger.log(`Kicked for reason: ${reason}`, 'error', this.state.username);
      this.state.metrics.crashes++;
      this.scheduleReconnect();
    });

    this.bot.on('error', (err) => {
      logger.log(`Bot error: ${err.message}`, 'error', this.state.username);
      this.state.metrics.crashes++;
      this.scheduleReconnect();
    });

    this.bot.on('end', (reason) => {
      logger.log(`Disconnected. Reason: ${reason}`, 'warn', this.state.username);
      this.state.metrics.crashes++;
      this.scheduleReconnect();
    });

    this.bot.on('login', () => {
      logger.log(`Successfully logged in. Game version: ${this.bot.version}`, 'success', this.state.username);
      this.bot.chat('Hello! I am online and ready to work.');
      this.startActivities();
    });
    
    this.bot.on('spawn', () => {
      logger.log('Spawned in world.', 'info', this.state.username);
      if (this.state.home) {
          this.goHome();
      }
    });

    this.bot.on('chat', (username, message) => {
      if (username === this.state.username) return; // Ignore self
      this.handleChatCommand(username, message);
    });

    this.bot.on('sleep', () => {
      this.state.isSleeping = true;
      logger.log('Zzz... Entering sleep mode.', 'info', this.state.username);
    });

    this.bot.on('wake', () => {
      this.state.isSleeping = false;
      logger.log('Good morning! Woke up.', 'info', this.state.username);
    });
    
    // Inventory and Physics (for better pathfinding)
    this.bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);
    this.bot.loadPlugin(require('mineflayer-collectblock').plugin);
    this.bot.loadPlugin(require('mineflayer-auto-eat').plugin);
    
    // Configure auto-eat (if needed)
    // *** FIX: Added a check for this.bot.autoEat to prevent the "Cannot set properties of undefined (setting 'options')" error
    if (this.bot.autoEat) {
        this.bot.autoEat.options = {
            priority: 'foodPoints',
            startAt: 14,
            bannedFood: []
        }
    } else {
        logger.log('WARN: mineflayer-auto-eat failed to load correctly.', 'warn', this.state.username);
    }
  }

  scheduleReconnect(delay = 10000) {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    // Only attempt to reconnect if the bot object exists
    if (this.bot) {
        this.bot.removeAllListeners();
        this.bot = null;
    }

    this.state.metrics.reconnects++;
    logger.log(`Scheduled reconnect attempt #${this.state.metrics.reconnects} in ${delay / 1000}s...`, 'warn', this.state.username);
    this.reconnectTimeout = setTimeout(() => this.connect(), delay);
  }

  // --- COMMAND HANDLING ---

  handleChatCommand(username, message) {
    const args = message.trim().split(/\s+/);
    const command = args[0].toLowerCase();
    
    // Command Prefix
    if (!command.startsWith('!')) return;
    
    const cmd = command.substring(1);

    logger.log(`Received command: ${message} from ${username}`, 'info', this.state.username);

    switch (cmd) {
      case 'status':
        this.bot.chat(`${this.state.username} is currently: ${this.getCurrentStatus()}.`);
        break;

      case 'come':
        this.followPlayer(username);
        break;

      case 'stop':
        this.stopActivity();
        this.bot.chat('All activities stopped.');
        break;

      case 'home':
        if (args.length === 2 && args[1].toLowerCase() === 'set') {
          this.setHome();
        } else {
          this.goHome();
        }
        break;
      
      case 'sleep':
        this.goToSleep();
        break;

      case 'wake':
        this.wakeUp();
        break;

      case 'build':
        if (args.length >= 2) {
          const structureName = args.slice(1).join(' ');
          this.startBuilding(structureName);
        } else {
          this.bot.chat('Usage: !build <structure_name> (e.g., !build cobblestone pillar)');
        }
        break;

      case 'metrics':
        this.reportMetrics();
        break;
        
      default:
        this.bot.chat(`Unknown command: ${command}. Try !status, !come, !home, !sleep, !build, !stop.`);
        break;
    }
  }
  
  // --- ACTIVITY MANAGEMENT ---
  
  getCurrentStatus() {
    if (this.state.isSleeping) return `${this.config.color}Sleeping`;
    if (this.state.isBuilding) return `${this.config.color}Building ${this.state.currentBuild.name}`;
    if (this.state.isPatrolling) return `${this.config.color}Exploring/Patrolling`;
    // Note: The original code had a pathfinder check which was incomplete, replacing with a generic path check.
    if (this.bot && this.bot.pathfinder.is ) return `${this.config.color}Navigating`;
    return `${this.config.color}Idle`;
  }

  startActivities() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
    }

    // Main activity loop (e.g., every 15-30 seconds)
    this.activityInterval = setInterval(() => {
      if (this.state.isSleeping || this.state.isBuilding) return;

      const availableActivities = this.config.activities.filter(a => a !== 'socializing');
      const randomActivity = availableActivities[Math.floor(Math.random() * availableActivities.length)];

      switch (randomActivity) {
        case 'building':
          this.findAndStartBuilding();
          break;
        case 'mining':
          this.performMiningActivity();
          break;
        case 'crafting':
          this.performCraftingActivity();
          break;
        case 'designing':
        case 'caving':
        case 'fishing':
        default:
          this.performExplorationActivity();
          break;
      }
      
      // Socializing is a background activity
      if (Math.random() < 0.1) {
          this.performSocialActivity();
      }
      
    }, 15000 + Math.random() * 15000); 
  }
  
  stopActivity() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
    if (this.bot) {
      this.bot.pathfinder.stop();
      this.bot.collectBlock.stop();
      // Stop all controls
      this.bot.clearControlStates(); 
    }
    this.state.isBuilding = false;
    this.state.isPatrolling = false;
    this.state.target = null;
  }

  // --- HOME SYSTEM ---
  
  setHome() {
    if (!this.bot) return;

    // Set home location (exact position)
    this.state.home = this.bot.entity.position.clone();
    
    // Find the nearest bed and set it as the preferred sleep location
    const bed = this.bot.findBlock({
      matching: block => this.bot.isABed(block),
      maxDistance: 10,
      count: 1
    });

    if (bed) {
      this.homeSystem.isSet = true;
      this.homeSystem.location = this.state.home;
      this.homeSystem.bedPos = bed.position;
      this.bot.chat(`Home set successfully! Location: (${this.state.home.x.toFixed(0)}, ${this.state.home.y.toFixed(0)}, ${this.state.home.z.toFixed(0)}) and bed found.`);
      logger.log('Home and bed set.', 'success', this.state.username);
    } else {
      this.bot.chat(`Home set, but no bed found nearby.`);
      this.homeSystem.isSet = true;
      this.homeSystem.location = this.state.home;
      this.homeSystem.bedPos = null;
      logger.log('Home set, no bed found.', 'warn', this.state.username);
    }
  }

  async goHome() {
    if (!this.bot) return;
    if (!this.homeSystem.isSet) {
      this.bot.chat("I don't have a home set yet. Use !home set first.");
      return;
    }

    this.stopActivity();
    this.bot.chat('Heading back home...');
    
    const goal = new this.bot.pathfinder.goals.GoalBlock(
        this.homeSystem.location.x, 
        this.homeSystem.location.y, 
        this.homeSystem.location.z
    );

    try {
      await this.bot.pathfinder.goto(goal);
      this.bot.chat('I have arrived home.');
      logger.log('Reached home.', 'success', this.state.username);
    } catch (err) {
      logger.log(`Failed to pathfind home: ${err.message}`, 'error', this.state.username);
      this.bot.chat("I couldn't find a path home.");
    }
  }

  async goToSleep() {
    if (!this.bot) return;
    if (this.bot.time.day) {
        this.bot.chat('It is daytime, I cannot sleep yet.');
        return;
    }
    if (!this.homeSystem.bedPos) {
        this.bot.chat("I don't know where my bed is. Use !home set near a bed.");
        return;
    }

    this.stopActivity();
    this.bot.chat('Time for bed...');
    
    const bed = this.bot.blockAt(this.homeSystem.bedPos);

    if (!bed || !this.bot.isABed(bed)) {
        this.bot.chat('My bed is gone! I need a new one.');
        this.homeSystem.bedPos = null;
        return;
    }

    try {
        await this.bot.sleep(bed);
        // The 'sleep' event listener handles state change
    } catch (err) {
        logger.log(`Failed to sleep: ${err.message}`, 'error', this.state.username);
        this.bot.chat("I couldn't get into the bed. Maybe something is blocking it.");
    }
  }
  
  async wakeUp() {
    if (!this.bot || !this.state.isSleeping) return;
    try {
        await this.bot.wake();
        // The 'wake' event listener handles state change
    } catch (err) {
        logger.log(`Failed to wake up: ${err.message}`, 'error', this.state.username);
        this.bot.chat("I tried to wake up, but something went wrong.");
    }
  }

  // --- PATHFINDING & MOVEMENT ---

  async followPlayer(username) {
    if (!this.bot) return;
    this.stopActivity();
    
    const player = this.bot.players[username];
    if (!player || !player.entity) {
        this.bot.chat(`I can't see ${username}.`);
        return;
    }
    
    this.bot.chat(`Following ${username}.`);

    const goal = new this.bot.pathfinder.goals.GoalFollow(player.entity, 3);
    
    try {
        await this.bot.pathfinder.goto(goal);
        this.bot.chat(`Reached ${username}'s location.`);
    } catch (err) {
        logger.log(`Failed to follow player: ${err.message}`, 'error', this.state.username);
        this.bot.chat("I lost the path while trying to follow you.");
    }
  }

  // --- MINING / GATHERING ---

  async performMiningActivity() {
    if (!this.bot) return;
    this.stopActivity();
    logger.log('Starting mining activity...', 'info', this.state.username);

    // Prioritize an easily minable block (e.g., dirt, cobblestone)
    const blockToMine = this.bot.findBlock({
      matching: (block) => block.name === 'dirt' || block.name === 'stone' || block.name === 'coal_ore',
      maxDistance: 32,
      count: 1
    });

    if (!blockToMine) {
      logger.log('No suitable block to mine found nearby.', 'info', this.state.username);
      this.performExplorationActivity();
      return;
    }

    this.bot.chat(`Mining ${blockToMine.name} at ${blockToMine.position.x}, ${blockToMine.position.y}, ${blockToMine.position.z}`);
    
    try {
      // Use collectBlock plugin for robust mining and gathering
      await this.bot.collectBlock.collect(blockToMine);
      this.state.metrics.blocksMined++;
      logger.log(`Finished mining ${blockToMine.name}.`, 'success', this.state.username);
      
    } catch (error) {
      logger.log(`Failed to mine block: ${error.message}`, 'error', this.state.username);
    }
  }

  // --- CRAFTING ---

  async performCraftingActivity() {
    if (!this.bot) return;
    this.stopActivity();
    logger.log('Starting crafting activity (e.g., making sticks)...', 'info', this.state.username);

    // Example: Crafting sticks (requires wood planks)
    const stickItem = this.bot.registry.itemsByName.stick;
    const plankItem = this.bot.registry.itemsByName.oak_planks || this.bot.registry.itemsByName.birch_planks;
    
    if (!stickItem || !plankItem) {
        logger.log('Cannot find stick or plank item in registry.', 'error', this.state.username);
        return;
    }
    
    const planksCount = this.bot.inventory.count(plankItem.id);
    if (planksCount < 1) {
        this.bot.chat("I need wood planks to craft sticks.");
        logger.log("Insufficient planks for crafting.", 'warn', this.state.username);
        return;
    }

    const recipe = this.bot.recipesFor(stickItem.id, null, 1, plankItem.id)[0];
    if (!recipe) {
        this.bot.chat("I don't know the recipe for sticks.");
        return;
    }
    
    try {
        this.bot.chat('Crafting 64 sticks...');
        await this.bot.craft(recipe, 64, null); // Craft 64 items (max amount)
        this.bot.chat('Finished crafting sticks!');
        logger.log('Crafting complete.', 'success', this.state.username);
    } catch (error) {
        logger.log(`Failed to craft: ${error.message}`, 'error', this.state.username);
        this.bot.chat("I failed to craft the item.");
    }
  }
  
  // --- BUILDING SYSTEM ---

  // Simple hardcoded building plans
  BUILDING_PLANS = {
    'cobblestone pillar': {
      name: 'Cobblestone Pillar',
      material: 'cobblestone',
      blocks: [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: 2, z: 0 },
        { x: 0, y: 3, z: 0 },
        { x: 0, y: 4, z: 0 }
      ]
    },
    'small wall': {
      name: 'Small Wall',
      material: 'oak_planks',
      blocks: [
        { x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 },
        { x: -1, y: 1, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }
      ]
    }
  };

  findAndStartBuilding() {
    if (this.state.personality !== 'builder') return;
    
    const plans = Object.keys(this.BUILDING_PLANS);
    const randomPlanKey = plans[Math.floor(Math.random() * plans.length)];
    this.startBuilding(randomPlanKey);
  }

  async startBuilding(planKey) {
    if (!this.bot || this.state.isBuilding) return;

    const plan = this.BUILDING_PLANS[planKey.toLowerCase()];

    if (!plan) {
      this.bot.chat(`I don't have a plan for a '${planKey}'. Available plans: ${Object.keys(this.BUILDING_PLANS).join(', ')}.`);
      return;
    }

    this.stopActivity();
    this.state.isBuilding = true;
    this.state.currentBuild = {
      name: plan.name,
      plan: plan,
      startTime: Date.now(),
      perfect: true // Assume perfect until a block is misplaced
    };

    logger.log(`Starting to build: ${plan.name} with ${plan.material}`, 'info', this.state.username);
    this.bot.chat(`Starting to build a ${plan.name} now!`);

    // 1. Check for materials
    const materialItem = this.bot.registry.itemsByName[plan.material];
    if (!materialItem || this.bot.inventory.count(materialItem.id) < plan.blocks.length) {
      this.bot.chat(`I need at least ${plan.blocks.length} ${plan.material} to build this.`);
      logger.log('Insufficient materials.', 'warn', this.state.username);
      this.state.isBuilding = false;
      this.state.currentBuild = null;
      return;
    }

    // 2. Determine base location (near bot)
    const basePos = this.bot.entity.position.offset(2, 0, 0).floored();

    // 3. Place blocks
    try {
      for (const blockData of plan.blocks) {
        const targetPos = basePos.offset(blockData.x, blockData.y, blockData.z);
        
        // Safety check: is the space available?
        const existingBlock = this.bot.blockAt(targetPos);
        if (existingBlock.name !== 'air') {
            logger.log(`Block space at ${targetPos} is occupied by ${existingBlock.name}. Skipping structure.`, 'warn', this.state.username);
            this.state.currentBuild.perfect = false;
            this.bot.chat(`The spot for my build is blocked by ${existingBlock.name}. I'll stop.`);
            throw new Error('Space occupied');
        }

        // Find a reference block to place on (usually the block below, or one beside)
        let referenceBlock;
        if (blockData.y > 0) {
            // Place on the block below
            referenceBlock = this.bot.blockAt(targetPos.offset(0, -1, 0));
        } else {
            // Place on the ground
            referenceBlock = this.bot.blockAt(targetPos.offset(0, -1, 0));
        }
        
        // Need to check if the reference block is valid (i.e., not air)
        if (referenceBlock.name === 'air') {
            logger.log('Cannot place block: no solid reference block found.', 'warn', this.state.username);
            this.state.currentBuild.perfect = false;
            this.bot.chat(`I need solid ground to build on!`);
            throw new Error('No solid reference');
        }

        // Place the block
        // GoalPlaceBlock navigates to a position where a block can be placed at targetPos
        await this.bot.pathfinder.goto(new this.bot.pathfinder.goals.GoalPlaceBlock(targetPos, this.bot.world, { material: plan.material }));
        // Then place the block on the reference block, with the correct face (top of the block below)
        await this.bot.placeBlock(referenceBlock, new Vec3(0, 1, 0)); 
        
        this.state.metrics.blocksPlaced++;
        logger.log(`Placed ${plan.material} at ${targetPos.x}, ${targetPos.y}, ${targetPos.z}`, 'info', this.state.username);
      }
      
      // Final metrics and announcement
      if (this.state.currentBuild.perfect) {
        this.state.metrics.perfectStructures++;
        this.state.metrics.structuresBuilt++;
        
        const buildTime = Date.now() - this.state.currentBuild.startTime;
        this.state.metrics.buildingTime += buildTime;
        
        logger.log(`✅ Perfect structure built: ${plan.name} in ${Math.round(buildTime/1000)}s`, 'success', this.state.username);
        
        // Social announcement
        if (Math.random() < 0.3) {
          setTimeout(() => {
            if (this.bot) {
              this.bot.chat(`Just finished building a ${plan.name}!`);
            }
          }, 2000);
        }
      }
      
    } catch (error) {
      logger.log(`Building error: ${error.message}`, 'error', this.state.username);
    } finally {
      this.state.isBuilding = false;
      this.state.currentBuild = null;
    }
  }

  performExplorationActivity() {
    if (!this.bot) return;
    this.state.isPatrolling = true;
    logger.log('Starting exploration...', 'info', this.state.username);

    // Use behavior simulator for movement
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    this.bot.setControlState(direction, true);
    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState(direction, false);
        this.state.isPatrolling = false; // Stop after movement
      }
    }, 1500 + Math.random() * 1500);
    
    // Look around
    this.bot.look(Math.random() * Math.PI * 2, 0, true);
  }

  performSocialActivity() {
    if (!this.bot) return;
    const messages = [
        'How is everyone doing?',
        'This server is great!',
        'Anyone need help with anything?',
        'Gotta love a stable connection. :D',
        'Zzz... I might nap soon if it gets dark.'];
        
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.bot.chat(message);
    logger.log(`Chatting: ${message}`, 'info', this.state.username);
  }

  // --- METRICS ---
  
  reportMetrics() {
    const uptimeSeconds = Math.round((Date.now() - this.state.metrics.uptime) / 1000);
    const buildingTimeMinutes = Math.round(this.state.metrics.buildingTime / 60000);

    const report = [
        `📊 ${this.state.username} Metrics Report 📊`,
        `Uptime: ${uptimeSeconds} seconds`,
        `Reconnects: ${this.state.metrics.reconnects}`,
        `Crashes: ${this.state.metrics.crashes}`,
        `Blocks Placed: ${this.state.metrics.blocksPlaced}`,
        `Blocks Mined: ${this.state.metrics.blocksMined}`,
        `Structures Built: ${this.state.metrics.structuresBuilt} (Perfect: ${this.state.metrics.perfectStructures})`,
        `Total Building Time: ${buildingTimeMinutes} minutes`
    ].join(' | ');

    this.bot.chat(report);
    logger.log('Metrics reported.', 'info', this.state.username);
  }
}

// ================= RENDER HEALTH CHECK =================
// Required by Render to know the service is alive

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Use the PORT set by Render, or 3000 as a fallback
server.listen(CONFIG.HEALTH_CHECK_PORT, () => {
    logger.log(`Health check server running on port ${CONFIG.HEALTH_CHECK_PORT}`, 'info', 'HealthCheck');
});


// ================= MAIN EXECUTION =================

const bots = [];

// Load plugins needed for pathfinder to work correctly
try {
    require('minecraft-data'); // Ensures data is loaded
    require('mineflayer-pathfinder');
    require('mineflayer-collectblock');
    require('mineflayer-auto-eat');
} catch (e) {
    logger.log(`Failed to load necessary plugins: ${e.message}`, 'error', 'System');
    process.exit(1);
}

// Instantiate and connect all bots
CONFIG.BOTS.forEach(botConfig => {
  bots.push(new UltimateBot(botConfig));
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.log('Received SIGINT. Shutting down bots and server...', 'warn', 'System');
    bots.forEach(botInstance => {
        if (botInstance.bot) {
            botInstance.bot.end('Server shutting down.');
        }
    });
    server.close(() => {
        logger.log('Health check server closed.', 'warn', 'System');
        process.exit(0);
    });
});
