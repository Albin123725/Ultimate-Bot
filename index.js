// ============================================================
// 🚀 ULTIMATE MINECRAFT BOT SYSTEM v3.0 (Anti-Detection Simulation)
// 🛠️ Implementing all feasible features via advanced randomization and conditional logic.
// ============================================================

const mineflayer = require('mineflayer');
const http = require('http');
const Vec3 = require('vec3').Vec3;

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE MINECRAFT BOT SYSTEM v3.0 (Anti-Detection Simulation)      ║
║   🧠 Advanced Personality, Imperfection, and Scheduling Logic            ║
║   🤖 2 Bots: CreativeMaster (Builder) & ResourceFinder (Explorer)        ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

// ================= CONFIGURATION =================
const CONFIG = {
  SERVER: {
    host: process.env.MINECRAFT_HOST || 'gameplannet.aternos.me',
    port: parseInt(process.env.MINECRAFT_PORT) || 43658,
    version: process.env.MINECRAFT_VERSION || '1.21.10'
  },
  BOTS: [
    {
      id: 'bot_001',
      name: 'CreativeMaster',
      personality: 'builder', // Player A: Builder (Focus on structures)
      color: '§a',
      activities: ['building', 'crafting', 'home'] // Activities for Builder
    },
    {
      id: 'bot_002',
      name: 'ResourceFinder',
      personality: 'explorer', // Player B: Explorer/Miner (Focus on movement/loot)
      color: '§b',
      activities: ['mining', 'exploration', 'survival'] // Activities for Explorer/Miner
    }
  ],
  HEALTH_CHECK_PORT: process.env.PORT || 3000
};

// ================= ANTI-DETECTION UTILITIES (Simulations of Sections 1, 3, 7, 9) =================

const antiDetection = {
    // Section 1: Connection Timing (Variable Connection Intervals)
    getReconnectDelay: () => {
        // Random delay between 10s and 30s
        return 10000 + Math.random() * 20000;
    },

    // Section 7: Activity Patterns (Timezone-Aligned Activity & Weekend/Weekday)
    getActivityMultiplier: () => {
        const date = new Date();
        const hour = date.getHours(); 
        const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
        let multiplier = 0.5; // Base low activity

        // Weekday (Mon-Fri: 1 to 5)
        if (day >= 1 && day <= 5) {
            // Peak: 4PM-10PM (16-22)
            if (hour >= 16 && hour <= 22) multiplier = 1.0;
            // Low: 1PM-4PM (13-16)
            else if (hour >= 13 && hour < 16) multiplier = 0.7;
            // Offline/Sleep: 2AM-7AM (2-7) - reduced chance of being active
            else if (hour >= 2 && hour < 7) multiplier = 0.2;
        } 
        // Weekend (Sat/Sun: 0 or 6)
        else {
            // Peak: 10AM-2AM (10-2) - extended play
            if (hour >= 10 || hour < 2) multiplier = 1.2;
            // Sleep: 2AM-7AM (2-7)
            else if (hour >= 2 && hour < 7) multiplier = 0.3;
        }

        return multiplier;
    },
    
    // Section 3: Client Diversity (Variable Render Distance, GUI Scale)
    getClientOptions: () => {
        // Simulates different client settings
        return {
            viewDistance: Math.floor(Math.random() * (10 - 4 + 1)) + 4, // 4-10 chunks
            // GUI scale, Java version, etc., are external, but can be logged as simulation
            simulatedGuiScale: [1, 2, 3][Math.floor(Math.random() * 3)],
            simulatedJavaVersion: ['8', '11', '17', '21'][Math.floor(Math.random() * 4)],
        };
    },

    // Section 9: Imperfection Engineering (Failure Injection, Block Placement Mistakes)
    shouldFail: (chance = 0.05) => {
        return Math.random() < chance; // Default 5% failure chance
    },
    
    // Section 5: Combat & Survival (Variable Reaction Times)
    getReactionTime: () => {
        // 150-400ms reaction time
        return 150 + Math.random() * 250;
    }
};

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
      isAfk: false, // Simulates Real-Life Interruptions (Section 7)
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
        buildingTime: 0, 
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

  // --- CONNECTION & CLIENT FEATURES (Sections 1, 2, 3) ---

  connect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Dynamic Username (Section 2: Unique Username Patterns & Section 1: Proxy bypass)
    const reconnectCount = this.state.metrics.reconnects;
    let uniqueUsername = this.state.username;
    if (reconnectCount > 0) {
      // Name includes a randomized tag to simulate a new session/IP
      uniqueUsername = `${this.state.username}_R${reconnectCount}_${Math.random().toString(36).substring(7)}`;
    }
    
    // Client Diversity Simulation (Section 3)
    const clientOpts = antiDetection.getClientOptions();
    logger.log(`Simulated Client: Java ${clientOpts.simulatedJavaVersion}, Render Distance: ${clientOpts.viewDistance}`, 'info', this.state.username);

    const botOptions = {
      host: CONFIG.SERVER.host,
      port: CONFIG.SERVER.port,
      username: uniqueUsername, 
      version: CONFIG.SERVER.version,
      auth: 'offline',
      // The viewDistance will be ignored by mineflayer, but used for simulation
      // This is the closest we can get to Client Diversity simulation
    };

    try {
      this.bot = mineflayer.createBot(botOptions);
      this.setupListeners();
      logger.log(`Attempting to connect as ${uniqueUsername}...`, 'info', this.state.username);
    } catch (error) {
      logger.log(`FATAL: Failed to create bot instance: ${error.message}`, 'error', this.state.username);
      this.scheduleReconnect(5000); 
    }
  }

  setupListeners() {
    this.bot.on('kicked', (reason) => {
      // Natural Disconnect Patterns (Section 1): Randomly extend sleep time after a kick
      const extraDelay = antiDetection.shouldFail(0.1) ? 60000 : 0; // 10% chance of 1 min extra 'vacation'
      logger.log(`Kicked for reason: ${reason}. Adding ${extraDelay/1000}s 'Vacation Simulation'.`, 'error', this.state.username); 
      this.state.metrics.crashes++;
      this.scheduleReconnect(extraDelay);
    });

    this.bot.on('error', (err) => {
      // Error Generation (Section 3): Log the error
      logger.log(`Bot error (Natural Error Logs): ${err.message}`, 'error', this.state.username);
      this.state.metrics.crashes++;
      this.scheduleReconnect();
    });

    this.bot.on('end', (reason) => {
      logger.log(`Disconnected. Reason: ${reason}`, 'warn', this.state.username);
      this.state.metrics.crashes++;
      this.scheduleReconnect();
    });

    this.bot.on('login', () => {
      this.state.metrics.reconnects = 0; 
      logger.log(`Successfully logged in. Game version: ${this.bot.version}`, 'success', this.state.username);
      this.bot.chat(`Hello! I am ${this.state.personality}. Online and ready.`);
      this.startActivities();
    });
    
    this.bot.on('spawn', () => {
      logger.log('Spawned in world.', 'info', this.state.username);
      if (this.state.home) {
          this.goHome();
      }
      this.simulateRealLifeInterruption(); // Random check for AFK upon spawning
    });

    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return; 
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
    
    // Plugins
    this.bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);
    this.bot.loadPlugin(require('mineflayer-collectblock').plugin);
    this.bot.loadPlugin(require('mineflayer-auto-eat').plugin);
    
    if (this.bot.autoEat) {
        // Food Consumption Timing (Section 5)
        this.bot.autoEat.options = {
            priority: 'foodPoints',
            startAt: 16 + Math.floor(Math.random() * 4), // Random hunger level (16-20)
            bannedFood: []
        }
    }
  }

  scheduleReconnect(extraDelay = 0) {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.bot) {
        this.bot.removeAllListeners();
        this.bot = null;
    }
    
    // Variable Connection Intervals (Section 1)
    const delay = antiDetection.getReconnectDelay() + extraDelay;
    this.state.metrics.reconnects++;
    logger.log(`Scheduled reconnect attempt #${this.state.metrics.reconnects} in ${delay / 1000}s...`, 'warn', this.state.username);
    this.reconnectTimeout = setTimeout(() => this.connect(), delay);
  }
  
  // --- REAL-LIFE INTERRUPTIONS (Section 7) ---
  simulateRealLifeInterruption() {
      // 10% chance to go AFK for a randomized duration (5min - 30min)
      if (Math.random() < 0.1 && !this.state.isAfk) {
          const afkDuration = 300000 + Math.random() * 1500000; // 5-30 minutes
          this.state.isAfk = true;
          this.stopActivity();
          this.bot.chat(`/me is AFK (real-life interruption). Back in ${Math.round(afkDuration / 60000)} minutes.`);
          logger.log(`Going AFK for ${afkDuration / 60000} minutes.`, 'warn', this.state.username);
          
          setTimeout(() => {
              if (this.bot) {
                  this.state.isAfk = false;
                  this.bot.chat('/me is back! Time to work.');
                  this.startActivities();
                  logger.log('Back from AFK.', 'success', this.state.username);
              }
          }, afkDuration);
      }
  }

  // --- ACTIVITY MANAGEMENT (Section 7) ---
  
  startActivities() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
    }
    if (this.state.isAfk) return;

    // Temporal & Scheduling (Section 7)
    const multiplier = antiDetection.getActivityMultiplier();
    const baseInterval = 15000 + Math.random() * 15000; // 15-30 seconds base
    const actualInterval = baseInterval / multiplier; // Faster intervals during peak

    logger.log(`Activity multiplier is ${multiplier.toFixed(1)}. Interval set to ${Math.round(actualInterval/1000)}s.`, 'info', this.state.username);

    this.activityInterval = setInterval(() => {
      if (this.state.isSleeping || this.state.isBuilding || this.state.isAfk) return;

      const availableActivities = this.config.activities;
      const randomActivity = availableActivities[Math.floor(Math.random() * availableActivities.length)];
      
      // Multi-Player Simulation (Section 6: Personality Logic)
      if (this.state.personality === 'builder') {
          if (randomActivity === 'building' && Math.random() < 0.6) this.findAndStartBuilding();
          else if (randomActivity === 'crafting') this.performCraftingActivity();
          else if (randomActivity === 'home') this.goHome(); // Stays in same area
      } else if (this.state.personality === 'explorer') {
          if (randomActivity === 'mining' && Math.random() < 0.7) this.performMiningActivity(); // Underground focus
          else if (randomActivity === 'exploration') this.performExplorationActivity(); // Constant movement
          else if (randomActivity === 'survival') this.checkSurvival(); // Combat check, potion, armor (Simulation)
      }

      // Social Simulation (Section 5)
      if (Math.random() < 0.15 * multiplier) { 
          this.performSocialActivity();
      }
      
    }, actualInterval); 
  }
  
  stopActivity() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
    if (this.bot) {
      // Defensive stop checks (Fix from previous turn)
      if (this.bot.pathfinder && typeof this.bot.pathfinder.stop === 'function') {
        this.bot.pathfinder.stop();
      }
      if (this.bot.collectBlock && typeof this.bot.collectBlock.stop === 'function') {
        this.bot.collectBlock.stop();
      }
      this.bot.clearControlStates(); 
    }
    this.state.isBuilding = false;
    this.state.isPatrolling = false;
    this.state.target = null;
  }
  
  // --- IN-GAME PLAYER FEATURES (Section 5) ---

  async checkSurvival() {
      if (!this.bot) return;
      this.stopActivity();
      
      const healthThreshold = 10;
      const hungerThreshold = 18;

      // Injury Response (Section 5): Actually runs from mobs when low health (simulated by random movement)
      if (this.bot.health < healthThreshold) {
          this.bot.chat('/me is wounded and needs to escape!');
          logger.log('Low health detected. Initiating escape.', 'warn', this.state.username);
          this.performExplorationActivity(true); // Flee mode
          return;
      }

      // Potion Usage Strategy (Section 5): Simple simulation
      if (this.bot.health < 15 && Math.random() < 0.3) {
          this.bot.chat('I should probably brew some potions later.');
          // Logic for Brewing Stand Usage (Section 5) would go here
      }
      
      // Armor Switching (Section 5): Simple simulation
      if (this.bot.armor < 10 && this.state.personality === 'explorer') {
          this.bot.chat('My armor is low. I need to find some iron.');
      }
  }

  async performMiningActivity() {
    if (!this.bot || this.state.personality !== 'explorer') return;
    this.stopActivity();
    
    // Mining Pattern Variations (Section 5): 50/50 chance for strip (stone) or cave (ore) mining
    const isStripMining = Math.random() < 0.5;
    const blocksToMine = isStripMining ? ['stone'] : ['coal_ore', 'iron_ore', 'gold_ore'];
    const mineType = isStripMining ? 'strip-mining' : 'cave-mining (ore)';
    
    logger.log(`Starting mining activity: ${mineType}`, 'info', this.state.username);
    
    const blockToMine = this.bot.findBlock({
      matching: (block) => blocksToMine.includes(block.name),
      maxDistance: 32,
      count: 1
    });

    if (!blockToMine) {
      logger.log(`No suitable ${mineType} block found. Exploring instead.`, 'info', this.state.username);
      this.performExplorationActivity();
      return;
    }
    
    // Tool Degradation Awareness (Section 5): Check inventory for the right tool
    const requiredTool = this.bot.registry.tools.find(tool => 
        tool.name.includes('pickaxe') && 
        this.bot.inventory.items().some(item => item.name === tool.name)
    );
    
    if (!requiredTool) {
        this.bot.chat("I need a pickaxe to mine this, but I don't have one!");
        return;
    }
    
    this.bot.chat(`Mining some ${blockToMine.name} using my ${requiredTool.name}.`);

    try {
      await this.bot.collectBlock.collect(blockToMine);
      this.state.metrics.blocksMined++;
      logger.log(`Finished mining ${blockToMine.name}.`, 'success', this.state.username);
    } catch (error) {
      logger.log(`Failed to mine block: ${error.message}`, 'error', this.state.username);
    }
  }

  async performCraftingActivity() {
    if (!this.bot || this.state.personality !== 'builder') return;
    this.stopActivity();
    logger.log('Starting crafting activity (Builder)...', 'info', this.state.username);

    // Crafting Sequence Variations (Section 5): Craft logs into planks, then planks into sticks/chests
    const logItem = this.bot.registry.itemsByName.oak_log;
    const chestItem = this.bot.registry.itemsByName.chest;

    if (!logItem || !chestItem) {
        logger.log('Cannot find log or chest item in registry.', 'error', this.state.username);
        return;
    }
    
    const logsCount = this.bot.inventory.count(logItem.id);
    if (logsCount < 4) {
        this.bot.chat("I need logs to craft something useful.");
        return;
    }

    const recipe = this.bot.recipesFor(chestItem.id, null, 1)[0];
    if (!recipe) {
        this.bot.chat("I don't know the recipe for chests.");
        return;
    }
    
    try {
        this.bot.chat('Crafting a chest for storage...');
        await this.bot.craft(recipe, 1, null); 
        this.bot.chat('Finished crafting a chest!');
        // Logic for Storage System Usage (Section 5) would go here
    } catch (error) {
        logger.log(`Failed to craft: ${error.message}`, 'error', this.state.username);
        this.bot.chat("I failed to craft the item.");
    }
  }
  
  async startBuilding(planKey) {
    if (!this.bot || this.state.isBuilding || this.state.personality !== 'builder') return;

    const plan = this.BUILDING_PLANS[planKey.toLowerCase()];

    if (!plan) {
      this.bot.chat(`I don't have a plan for a '${planKey}'. Available plans: ${Object.keys(this.BUILDING_PLANS).join(', ')}.`);
      return;
    }

    this.stopActivity();
    this.state.isBuilding = true;
    this.state.currentBuild = { name: plan.name, plan: plan, startTime: Date.now(), perfect: true };

    logger.log(`Starting to build: ${plan.name} with ${plan.material}`, 'info', this.state.username);
    this.bot.chat(`Starting to build a ${plan.name} now!`);

    const materialItem = this.bot.registry.itemsByName[plan.material];
    if (!materialItem || this.bot.inventory.count(materialItem.id) < plan.blocks.length) {
      this.bot.chat(`I need at least ${plan.blocks.length} ${plan.material} to build this.`);
      this.state.isBuilding = false;
      this.state.currentBuild = null;
      return;
    }

    const basePos = this.bot.entity.position.offset(2, 0, 0).floored();

    try {
      for (const blockData of plan.blocks) {
        // Imperfection Engineering (Section 9): 5% chance of Block Placement Mistakes (Section 5)
        if (antiDetection.shouldFail(0.05)) {
            this.state.currentBuild.perfect = false;
            this.bot.chat("Oops! I made a mistake and have to stop this build.");
            throw new Error('Deliberate placement mistake/failure injection.');
        }

        const targetPos = basePos.offset(blockData.x, blockData.y, blockData.z);
        const referenceBlock = this.bot.blockAt(targetPos.offset(0, -1, 0));

        if (this.bot.blockAt(targetPos).name !== 'air' || referenceBlock.name === 'air') {
            this.state.currentBuild.perfect = false;
            this.bot.chat(`Can't place block here. Moving on.`);
            continue;
        }

        // Simulates Building Progression (visible structure growth)
        await this.bot.pathfinder.goto(new this.bot.pathfinder.goals.GoalPlaceBlock(targetPos, this.bot.world, { material: plan.material }));
        await this.bot.placeBlock(referenceBlock, new Vec3(0, 1, 0)); 
        this.state.metrics.blocksPlaced++;
      }
      
      // Final metrics and announcement
      if (this.state.currentBuild.perfect) {
        this.state.metrics.perfectStructures++;
        this.state.metrics.structuresBuilt++;
        logger.log(`✅ Perfect structure built: ${plan.name}`, 'success', this.state.username);
      }
      
    } catch (error) {
      logger.log(`Building error: ${error.message}`, 'error', this.state.username);
    } finally {
      this.state.isBuilding = false;
      this.state.currentBuild = null;
    }
  }
  
  performExplorationActivity(flee = false) {
    if (!this.bot || this.state.personality !== 'explorer') return;
    this.state.isPatrolling = true;
    logger.log(flee ? 'Fleeing from danger!' : 'Starting exploration (Constant movement)...', 'info', this.state.username);

    // Movement System (Section 5)
    // Terrain Adaptation and Environmental Awareness (simulated by pathfinding goal)
    const randomDest = this.bot.entity.position.offset(
        Math.floor(Math.random() * 64) - 32, 
        0, 
        Math.floor(Math.random() * 64) - 32
    );

    const goal = new this.bot.pathfinder.goals.GoalBlock(randomDest.x, randomDest.y, randomDest.z);
    
    const moveDuration = 2000 + Math.random() * 3000; // 2-5 seconds movement
    
    // Fatigue Simulation (Section 5): Slows after extended running
    const speed = (Math.random() < 0.2) ? 0.8 : 1.0; // 20% chance to run at 80% speed
    
    setTimeout(async () => {
        try {
            this.bot.pathfinder.setMoveOptions({
                maxSpeed: speed // Simulates fatigue/slowness
            });
            await this.bot.pathfinder.goto(goal);
        } catch (e) {
            // Pathfinding failed (simulates environmental awareness issues, e.g., avoiding lava)
            logger.log('Exploration failed: path not found.', 'warn', this.state.username);
        } finally {
            if (this.bot) {
                this.state.isPatrolling = false;
                this.bot.clearControlStates();
            }
        }
    }, antiDetection.getReactionTime()); // Variable Reaction Times (Section 5)
  }

  performSocialActivity() {
    if (!this.bot) return;
    
    // Natural Language Chat (Section 5) - GPT-like responses simulated with context
    const messages = {
        'builder': [
            "I need more cobblestone for my next project.",
            "Does anyone have some extra oak wood?",
            "I'm planning a new house design, any suggestions?",
            "Building is so relaxing."
        ],
        'explorer': [
            "Just came back from a deep cave, found some iron!",
            "Anyone seen a jungle biome nearby? I need cocoa.",
            "I keep dying to skeletons, sigh.",
            "Time to enchant my pickaxe."
        ]
    };

    const personalityMessages = messages[this.state.personality];
    const message = personalityMessages[Math.floor(Math.random() * personalityMessages.length)];
    
    // Gift Giving (Section 5) - Explorer shares loot
    if (this.state.personality === 'explorer' && Math.random() < 0.2) {
        // The actual code to drop an item is complex, so we simulate it with a chat message
        setTimeout(() => {
            this.bot.chat("Hey, I'm sharing some of my finds!");
            this.bot.chat(`/me drops some coal for a nearby player.`);
        }, 3000);
    }
    
    this.bot.chat(message);
    logger.log(`Chatting: ${message}`, 'info', this.state.username);
  }
  
  // --- UTILITY AND DATA (Remainder of the file) ---

  // Simple hardcoded building plans
  BUILDING_PLANS = {
    'cobblestone pillar': {
      name: 'Cobblestone Pillar',
      material: 'cobblestone',
      blocks: [
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
        { x: 0, y: 3, z: 0 }, { x: 0, y: 4, z: 0 }
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

  // (goHome, goToSleep, wakeUp, followPlayer are kept from the previous code)
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
    } catch (err) {
        logger.log(`Failed to sleep: ${err.message}`, 'error', this.state.username);
        this.bot.chat("I couldn't get into the bed. Maybe something is blocking it.");
    }
  }
  
  async wakeUp() {
    if (!this.bot || !this.state.isSleeping) return;
    try {
        await this.bot.wake();
    } catch (err) {
        logger.log(`Failed to wake up: ${err.message}`, 'error', this.state.username);
        this.bot.chat("I tried to wake up, but something went wrong.");
    }
  }
  
  setHome() {
    if (!this.bot) return;
    this.state.home = this.bot.entity.position.clone();
    const bed = this.bot.findBlock({ matching: block => this.bot.isABed(block), maxDistance: 10, count: 1 });
    if (bed) {
      this.homeSystem.isSet = true;
      this.homeSystem.location = this.state.home;
      this.homeSystem.bedPos = bed.position;
      this.bot.chat(`Home set successfully!`);
      logger.log('Home and bed set.', 'success', this.state.username);
    } else {
      this.bot.chat(`Home set, but no bed found nearby.`);
      this.homeSystem.isSet = true;
      this.homeSystem.location = this.state.home;
      this.homeSystem.bedPos = null;
      logger.log('Home set, no bed found.', 'warn', this.state.username);
    }
  }
  
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

  findAndStartBuilding() {
    if (this.state.personality !== 'builder') return;
    const plans = Object.keys(this.BUILDING_PLANS);
    const randomPlanKey = plans[Math.floor(Math.random() * plans.length)];
    this.startBuilding(randomPlanKey);
  }

  handleChatCommand(username, message) {
    const args = message.trim().split(/\s+/);
    const command = args[0].toLowerCase();
    
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
        if (this.state.personality === 'builder' && args.length >= 2) {
          const structureName = args.slice(1).join(' ');
          this.startBuilding(structureName);
        } else {
          this.bot.chat(`I'm an ${this.state.personality}, I focus on other tasks.`);
        }
        break;

      case 'metrics':
        this.reportMetrics();
        break;
        
      default:
        // Command Usage Variations (Section 5)
        if (Math.random() < 0.2) { 
            this.bot.chat(`/tpa ${username}`);
            logger.log(`Simulated /tpa to ${username}`, 'info', this.state.username);
        } else {
            this.bot.chat(`Unknown command: ${command}. Try !status, !come, !home, !sleep, !build, !stop.`);
        }
        break;
    }
  }
  
  getCurrentStatus() {
    if (this.state.isAfk) return `${this.config.color}AFK (Interrupted)`;
    if (this.state.isSleeping) return `${this.config.color}Sleeping`;
    if (this.state.isBuilding) return `${this.config.color}Building ${this.state.currentBuild ? this.state.currentBuild.name : 'something'}`;
    if (this.state.isPatrolling) return `${this.config.color}Exploring/Patrolling`;
    return `${this.config.color}Idle`;
  }
  
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

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(CONFIG.HEALTH_CHECK_PORT, () => {
    logger.log(`Health check server running on port ${CONFIG.HEALTH_CHECK_PORT}`, 'info', 'HealthCheck');
});


// ================= MAIN EXECUTION =================

const bots = [];

// Load plugins needed for pathfinder to work correctly
try {
    require('minecraft-data'); 
    require('mineflayer-pathfinder');
    require('mineflayer-collectblock');
    require('mineflayer-auto-eat');
} catch (e) {
    logger.log(`FATAL: Failed to load necessary plugins: ${e.message}`, 'error', 'System');
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
