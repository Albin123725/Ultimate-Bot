// ============================================================
// 🚀 ULTIMATE MINECRAFT BOT SYSTEM v2.0
// 🎮 Complete Features • Creative Mode • Auto-Sleep
// ============================================================

const mineflayer = require('mineflayer');
const http = require('http');

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE MINECRAFT BOT SYSTEM v2.0                                 ║
║   🎮 Creative Mode • Auto-Sleep • All Features Fixed                    ║
║   🤖 2 Bots • Perfect Sleep System • Render.com Ready                   ║
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
      personality: 'builder',
      color: '§a',
      activities: ['building', 'designing', 'crafting', 'planning'],
      sleepPattern: 'normal'
    },
    {
      id: 'bot_002',
      name: 'CreativeExplorer',
      personality: 'explorer',
      color: '§b',
      activities: ['exploring', 'mapping', 'discovering', 'adventuring'],
      sleepPattern: 'normal'
    }
  ],
  SYSTEM: {
    PORT: process.env.PORT || 3000,
    INITIAL_DELAY: 10000,
    BOT_DELAY: 8000,
    STATUS_INTERVAL: 30000,
    LOG_LEVEL: 'info'
  },
  FEATURES: {
    AUTO_SLEEP: true,
    BED_MANAGEMENT: true,
    CREATIVE_MODE: true,
    AUTO_RECONNECT: true,
    CHAT_SYSTEM: true,
    ACTIVITY_SYSTEM: true,
    HEALTH_MONITORING: true,
    POSITION_TRACKING: true,
    TIME_AWARENESS: true,
    ANTI_AFK: true,
    ERROR_HANDLING: true
  }
};

// ================= ADVANCED LOGGING =================
class Logger {
  constructor() {
    this.levels = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      success: '✅',
      debug: '🐛',
      sleep: '😴',
      wake: '☀️',
      night: '🌙',
      day: '☀️',
      chat: '💬',
      bot: '🤖',
      connect: '🔄',
      disconnect: '🔌',
      kick: '🚫'
    };
  }

  log(message, type = 'info', botName = 'SYSTEM') {
    const timestamp = new Date().toLocaleTimeString();
    const icon = this.levels[type] || '📝';
    
    const formattedMessage = `[${timestamp}] ${icon} ${botName}: ${message}`;
    
    if (type === 'error') {
      console.error(formattedMessage);
    } else if (type === 'warn') {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
    
    return formattedMessage;
  }
}

const logger = new Logger();

// ================= PERFECT SLEEP SYSTEM =================
class PerfectSleepSystem {
  constructor(botInstance, botName) {
    this.bot = botInstance;
    this.botName = botName;
    this.state = {
      isSleeping: false,
      hasBedPlaced: false,
      bedPosition: null,
      bedInInventory: true,
      lastSleepTime: null,
      sleepCycles: 0,
      bedPlacements: 0
    };
  }

  checkTimeAndSleep() {
    if (!this.bot || !this.bot.time || !CONFIG.FEATURES.AUTO_SLEEP) return;
    
    const time = this.bot.time.time;
    const isNight = time >= 13000 && time <= 23000;
    
    if (this.bot.isSleeping !== undefined) {
      this.state.isSleeping = this.bot.isSleeping;
    }
    
    if (isNight && !this.state.isSleeping) {
      logger.log(`Night time detected (${time}) - Sleeping immediately`, 'night', this.botName);
      this.sleepImmediately();
    } else if (!isNight && this.state.isSleeping) {
      logger.log(`Morning detected (${time}) - Waking up`, 'day', this.botName);
      this.wakeAndCleanup();
    }
  }

  async sleepImmediately() {
    if (this.state.isSleeping) return;
    
    logger.log('Initiating immediate sleep sequence', 'sleep', this.botName);
    
    this.stopAllActivities();
    
    const existingBed = await this.findNearbyBed();
    
    if (existingBed) {
      await this.sleepInBed(existingBed);
    } else {
      await this.placeBedAndSleep();
    }
  }

  async findNearbyBed() {
    try {
      const bed = this.bot.findBlock({
        matching: block => block && block.name && block.name.includes('bed'),
        maxDistance: 10
      });
      
      if (bed) {
        logger.log(`Found nearby bed at ${bed.position.x}, ${bed.position.y}, ${bed.position.z}`, 'info', this.botName);
      }
      
      return bed;
    } catch (error) {
      logger.log(`Bed search error: ${error.message}`, 'debug', this.botName);
      return null;
    }
  }

  async placeBedAndSleep() {
    logger.log('No bed found nearby - Placing new bed', 'info', this.botName);
    
    if (!this.state.bedInInventory) {
      const success = await this.getBedFromCreative();
      if (!success) {
        logger.log('Failed to get bed from creative', 'warn', this.botName);
        return;
      }
    }
    
    const bedPos = await this.findBedPlacementLocation();
    if (!bedPos) {
      logger.log('Could not find suitable bed placement location', 'warn', this.botName);
      return;
    }
    
    const placed = await this.placeBedAt(bedPos);
    if (placed) {
      this.state.hasBedPlaced = true;
      this.state.bedPosition = bedPos;
      this.state.bedInInventory = false;
      this.state.bedPlacements++;
      
      logger.log(`Bed placed successfully at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'success', this.botName);
      
      await this.sleepInPlacedBed(bedPos);
    }
  }

  async getBedFromCreative() {
    try {
      this.bot.chat(`/give ${this.bot.username} bed 1`);
      await this.delay(2000);
      
      this.state.bedInInventory = true;
      logger.log('Obtained bed from creative inventory', 'success', this.botName);
      return true;
    } catch (error) {
      logger.log(`Failed to get bed: ${error.message}`, 'error', this.botName);
      return false;
    }
  }

  async findBedPlacementLocation() {
    if (!this.bot.entity) return null;
    
    const pos = this.bot.entity.position;
    
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const checkX = Math.floor(pos.x) + x;
        const checkY = Math.floor(pos.y);
        const checkZ = Math.floor(pos.z) + z;
        
        const block = this.bot.blockAt(this.bot.vec3(checkX, checkY, checkZ));
        const blockBelow = this.bot.blockAt(this.bot.vec3(checkX, checkY - 1, checkZ));
        
        if (block && block.name === 'air' && 
            blockBelow && blockBelow.name !== 'air' && 
            blockBelow.name !== 'lava' && blockBelow.name !== 'water') {
          return { x: checkX, y: checkY, z: checkZ };
        }
      }
    }
    
    return null;
  }

  async placeBedAt(position) {
    try {
      this.bot.setQuickBarSlot(0);
      
      await this.bot.lookAt(this.bot.vec3(position.x, position.y, position.z));
      
      const blockBelowPos = this.bot.vec3(position.x, position.y - 1, position.z);
      const referenceBlock = this.bot.blockAt(blockBelowPos);
      
      if (referenceBlock) {
        await this.bot.placeBlock(referenceBlock, this.bot.vec3(0, 1, 0));
        logger.log(`Bed placement successful`, 'success', this.botName);
        return true;
      }
    } catch (error) {
      logger.log(`Bed placement failed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async sleepInPlacedBed(bedPosition) {
    try {
      const bedBlock = this.bot.blockAt(this.bot.vec3(bedPosition.x, bedPosition.y, bedPosition.z));
      if (bedBlock && bedBlock.name.includes('bed')) {
        await this.sleepInBed(bedBlock);
      }
    } catch (error) {
      logger.log(`Failed to sleep in placed bed: ${error.message}`, 'error', this.botName);
    }
  }

  async sleepInBed(bedBlock) {
    try {
      const distance = this.bot.entity.position.distanceTo(bedBlock.position);
      if (distance > 2) {
        await this.bot.lookAt(bedBlock.position);
        this.bot.setControlState('forward', true);
        await this.delay(Math.min(distance * 200, 1000));
        this.bot.setControlState('forward', false);
        await this.delay(500);
      }
      
      await this.bot.sleep(bedBlock);
      this.state.isSleeping = true;
      this.state.lastSleepTime = Date.now();
      this.state.sleepCycles++;
      
      logger.log(`Successfully sleeping in bed`, 'sleep', this.botName);
      
      setTimeout(() => {
        if (this.state.isSleeping && this.bot && this.bot.isSleeping) {
          this.wakeAndCleanup();
        }
      }, 45000);
      
    } catch (error) {
      logger.log(`Sleep attempt failed: ${error.message}`, 'error', this.botName);
      this.state.isSleeping = false;
    }
  }

  async wakeAndCleanup() {
    if (!this.state.isSleeping) return;
    
    try {
      if (this.bot.isSleeping) {
        this.bot.wake();
      }
      
      this.state.isSleeping = false;
      
      logger.log(`Successfully woke up`, 'wake', this.botName);
      
      if (CONFIG.FEATURES.BED_MANAGEMENT && this.state.hasBedPlaced && this.state.bedPosition) {
        await this.breakBed(this.state.bedPosition);
      }
      
      this.state.hasBedPlaced = false;
      this.state.bedPosition = null;
      this.state.bedInInventory = true;
      
      logger.log(`Bed management completed`, 'success', this.botName);
      
    } catch (error) {
      logger.log(`Wake/cleanup error: ${error.message}`, 'error', this.botName);
    }
  }

  async breakBed(position) {
    try {
      const bedBlock = this.bot.blockAt(this.bot.vec3(position.x, position.y, position.z));
      if (bedBlock && bedBlock.name.includes('bed')) {
        await this.bot.dig(bedBlock);
        await this.delay(1000);
        logger.log(`Bed successfully broken`, 'info', this.botName);
        return true;
      }
    } catch (error) {
      logger.log(`Failed to break bed: ${error.message}`, 'error', this.botName);
    }
    return false;
  }

  stopAllActivities() {
    const controls = ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'];
    controls.forEach(control => {
      if (this.bot.getControlState(control)) {
        this.bot.setControlState(control, false);
      }
    });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isSleeping: this.state.isSleeping,
      hasBedPlaced: this.state.hasBedPlaced,
      bedInInventory: this.state.bedInInventory,
      sleepCycles: this.state.sleepCycles,
      bedPlacements: this.state.bedPlacements,
      lastSleepTime: this.state.lastSleepTime ? 
        new Date(this.state.lastSleepTime).toLocaleTimeString() : 'Never'
    };
  }
}

// ================= ADVANCED CREATIVE BOT =================
class AdvancedCreativeBot {
  constructor(config, index) {
    this.config = config;
    this.index = index;
    this.bot = null;
    this.sleepSystem = null;
    
    this.state = {
      id: config.id,
      username: config.name,
      personality: config.personality,
      status: 'initializing',
      health: 20,
      food: 20,
      position: null,
      isSleeping: false,
      activity: 'Initializing...',
      creativeMode: true,
      connectedAt: null,
      lastActivity: null,
      metrics: {
        messagesSent: 0,
        blocksPlaced: 0,
        distanceTraveled: 0,
        sleepCycles: 0,
        connectionAttempts: 0
      }
    };
    
    this.intervals = [];
    this.activityTimeout = null;
    
    logger.log(`Bot instance created (${config.personality})`, 'bot', config.name);
  }

  async connect() {
    try {
      this.state.status = 'connecting';
      this.state.metrics.connectionAttempts++;
      
      logger.log(`Connecting to ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`, 'connect', this.state.username);
      
      await this.delay(this.index * CONFIG.SYSTEM.BOT_DELAY);
      
      this.bot = mineflayer.createBot({
        host: CONFIG.SERVER.host,
        port: CONFIG.SERVER.port,
        username: this.state.username,
        version: CONFIG.SERVER.version,
        auth: 'offline',
        viewDistance: 8,
        chatLengthLimit: 256,
        colorsEnabled: false,
        defaultChatPatterns: false
      });
      
      this.sleepSystem = new PerfectSleepSystem(this.bot, this.state.username);
      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.state.status = 'timeout';
          logger.log('Connection timeout', 'error', this.state.username);
          reject(new Error('Connection timeout'));
        }, 30000);
        
        this.bot.once('spawn', () => {
          clearTimeout(timeout);
          this.onSpawn();
          resolve(this);
        });
        
        this.bot.once('error', (err) => {
          clearTimeout(timeout);
          this.state.status = 'error';
          logger.log(`Connection error: ${err.message}`, 'error', this.state.username);
          reject(err);
        });
      });
      
    } catch (error) {
      this.state.status = 'failed';
      logger.log(`Connection failed: ${error.message}`, 'error', this.state.username);
      throw error;
    }
  }

  setupEventHandlers() {
    if (!this.bot) return;
    
    this.bot.on('spawn', () => {
      this.onSpawn();
    });
    
    this.bot.on('health', () => {
      if (this.bot.health !== undefined) this.state.health = this.bot.health;
      if (this.bot.food !== undefined) this.state.food = this.bot.food;
    });
    
    this.bot.on('move', () => {
      if (this.bot.entity) {
        const pos = this.bot.entity.position;
        this.state.position = {
          x: Math.floor(pos.x),
          y: Math.floor(pos.y),
          z: Math.floor(pos.z)
        };
        this.state.metrics.distanceTraveled++;
      }
    });
    
    this.bot.on('time', () => {
      if (this.sleepSystem) {
        this.sleepSystem.checkTimeAndSleep();
      }
      this.state.isSleeping = this.bot.isSleeping || false;
    });
    
    this.bot.on('sleep', () => {
      logger.log('Started sleeping', 'sleep', this.state.username);
      this.state.isSleeping = true;
      this.state.activity = 'Sleeping';
    });
    
    this.bot.on('wake', () => {
      logger.log('Woke up', 'wake', this.state.username);
      this.state.isSleeping = false;
      this.state.activity = 'Waking up';
    });
    
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      
      logger.log(`${username}: ${message}`, 'chat', this.state.username);
      
      if (CONFIG.FEATURES.CHAT_SYSTEM && Math.random() < 0.4) {
        setTimeout(() => {
          if (this.bot && this.bot.player) {
            const response = this.generateChatResponse(message, username);
            this.bot.chat(response);
            this.state.metrics.messagesSent++;
            logger.log(`Response: ${response}`, 'chat', this.state.username);
          }
        }, 1000 + Math.random() * 3000);
      }
    });
    
    this.bot.on('blockPlaced', () => {
      this.state.metrics.blocksPlaced++;
    });
    
    this.bot.on('kicked', (reason) => {
      logger.log(`Kicked: ${JSON.stringify(reason)}`, 'kick', this.state.username);
      this.state.status = 'kicked';
      this.cleanup();
      this.scheduleReconnect();
    });
    
    this.bot.on('end', () => {
      logger.log('Disconnected from server', 'disconnect', this.state.username);
      this.state.status = 'disconnected';
      this.cleanup();
      this.scheduleReconnect();
    });
    
    this.bot.on('error', (err) => {
      logger.log(`Bot error: ${err.message}`, 'error', this.state.username);
      this.state.status = 'error';
    });
  }

  onSpawn() {
    this.state.status = 'connected';
    this.state.connectedAt = Date.now();
    this.state.position = this.getPosition();
    
    logger.log(`Successfully spawned in world!`, 'success', this.state.username);
    
    this.initializeCreativeMode();
    this.startActivitySystem();
    this.startAntiAFKSystem();
    
    logger.log(`All systems initialized`, 'success', this.state.username);
  }

  initializeCreativeMode() {
    if (!this.bot) return;
    
    logger.log(`Initializing creative mode...`, 'info', this.state.username);
    
    setTimeout(() => {
      if (this.bot) {
        this.bot.chat('/gamemode creative');
        logger.log(`Creative mode enabled`, 'success', this.state.username);
      }
    }, 2000);
    
    setTimeout(() => {
      if (this.bot) {
        this.giveCreativeItems();
      }
    }, 4000);
  }

  giveCreativeItems() {
    if (!this.bot) return;
    
    const items = [
      'bed',
      'white_bed',
      'stone 64',
      'oak_planks 64',
      'glass 64',
      'glowstone 64',
      'diamond_block 16',
      'crafting_table',
      'chest',
      'torch 64'
    ];
    
    items.forEach((item, index) => {
      setTimeout(() => {
        if (this.bot) {
          this.bot.chat(`/give ${this.bot.username} ${item}`);
        }
      }, index * 200);
    });
    
    logger.log(`Creative items granted`, 'success', this.state.username);
  }

  startActivitySystem() {
    const activityInterval = setInterval(() => {
      if (!this.bot || !this.bot.entity || this.state.isSleeping) {
        return;
      }
      
      if (this.bot.time && this.bot.time.time >= 13000 && this.bot.time.time <= 23000) {
        return;
      }
      
      const activity = this.selectActivity();
      this.state.activity = activity;
      this.performActivity(activity);
      
    }, 12000 + Math.random() * 8000);
    
    this.intervals.push(activityInterval);
    logger.log(`Activity system started`, 'success', this.state.username);
  }

  startAntiAFKSystem() {
    const afkInterval = setInterval(() => {
      if (!this.bot || !this.bot.entity || this.state.isSleeping) {
        return;
      }
      
      this.performAntiAFK();
      
    }, 45000 + Math.random() * 30000);
    
    this.intervals.push(afkInterval);
    logger.log(`Anti-AFK system started`, 'success', this.state.username);
  }

  selectActivity() {
    const activities = this.config.activities || ['exploring'];
    return activities[Math.floor(Math.random() * activities.length)];
  }

  performActivity(activity) {
    logger.log(`Performing activity: ${activity}`, 'info', this.state.username);
    
    if (!this.bot) return;
    
    switch (activity) {
      case 'building':
      case 'designing':
      case 'crafting':
        this.performBuildingActivity();
        break;
        
      case 'exploring':
      case 'mapping':
      case 'discovering':
      case 'adventuring':
        this.performExplorationActivity();
        break;
        
      case 'planning':
        this.performPlanningActivity();
        break;
        
      default:
        this.performIdleActivity();
    }
  }

  performBuildingActivity() {
    this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    
    if (Math.random() < 0.25) {
      setTimeout(() => {
        if (this.bot) {
          this.placeRandomBlock();
        }
      }, 500);
    }
  }

  performExplorationActivity() {
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    this.bot.setControlState(direction, true);
    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState(direction, false);
      }
    }, 1500 + Math.random() * 1500);
    
    this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
  }

  performPlanningActivity() {
    this.bot.look(Math.random() * Math.PI * 0.5, Math.random() * Math.PI * 0.5 - Math.PI * 0.25);
  }

  performIdleActivity() {
    this.bot.look(Math.random() * Math.PI * 0.3, Math.random() * Math.PI * 0.3 - Math.PI * 0.15);
  }

  performAntiAFK() {
    if (!this.bot) return;
    
    const actions = [
      () => {
        this.bot.setControlState('jump', true);
        setTimeout(() => {
          if (this.bot) this.bot.setControlState('jump', false);
        }, 200);
      },
      () => {
        this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
      },
      () => {
        const dir = ['forward', 'back', 'left', 'right'][Math.floor(Math.random() * 4)];
        this.bot.setControlState(dir, true);
        setTimeout(() => {
          if (this.bot) this.bot.setControlState(dir, false);
        }, 300);
      }
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    action();
    
    logger.log(`Performed anti-AFK action`, 'debug', this.state.username);
  }

  placeRandomBlock() {
    try {
      const blocks = ['stone', 'oak_planks', 'glass', 'glowstone'];
      const blockType = blocks[Math.floor(Math.random() * blocks.length)];
      
      this.bot.chat(`/give ${this.bot.username} ${blockType} 1`);
      
      const pos = this.bot.entity.position;
      const offsetX = Math.floor(Math.random() * 3) - 1;
      const offsetZ = Math.floor(Math.random() * 3) - 1;
      
      const placePos = this.bot.vec3(
        Math.floor(pos.x) + offsetX,
        Math.floor(pos.y),
        Math.floor(pos.z) + offsetZ
      );
      
      const block = this.bot.blockAt(placePos);
      if (block && block.name === 'air') {
        setTimeout(() => {
          if (this.bot) {
            this.bot.placeBlock(block, this.bot.vec3(0, 1, 0));
            logger.log(`Placed ${blockType} block`, 'info', this.state.username);
          }
        }, 200);
      }
    } catch (error) {
      // Ignore placement errors
    }
  }

  generateChatResponse(message, sender) {
    const lowerMessage = message.toLowerCase();
    const botNameLower = this.state.username.toLowerCase();
    
    if (lowerMessage.includes(botNameLower) || lowerMessage.includes(this.config.personality)) {
      const directResponses = [
        `Yes ${sender}?`,
        `What's up ${sender}?`,
        `Hey ${sender}!`,
        `Need something ${sender}?`,
        `I'm here ${sender}!`,
        `Yes, ${sender}? What do you need?`
      ];
      return directResponses[Math.floor(Math.random() * directResponses.length)];
    }
    
    if (message.includes('?')) {
      const questionResponses = [
        "Good question!",
        "I think so!",
        "Not sure about that.",
        "Probably!",
        "Maybe!",
        "Interesting question!",
        "Let me think about that...",
        "That's a tough one!"
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }
    
    if (this.config.personality === 'builder') {
      const builderResponses = [
        "Working on my masterpiece!",
        "Just building something amazing!",
        "Check out this structure I'm making!",
        "Building is so relaxing!",
        "Need any building help?",
        "The architecture here is inspiring!",
        "Placement is everything in building!"
      ];
      return builderResponses[Math.floor(Math.random() * builderResponses.length)];
    } else {
      const explorerResponses = [
        "Found some cool terrain!",
        "Exploring new areas!",
        "The world is so vast!",
        "On an adventure!",
        "Discovering new places!",
        "This landscape is breathtaking!",
        "There's so much to explore here!"
      ];
      return explorerResponses[Math.floor(Math.random() * explorerResponses.length)];
    }
  }

  getPosition() {
    if (!this.bot || !this.bot.entity) return null;
    
    const pos = this.bot.entity.position;
    return {
      x: Math.floor(pos.x),
      y: Math.floor(pos.y),
      z: Math.floor(pos.z)
    };
  }

  scheduleReconnect() {
    if (!CONFIG.FEATURES.AUTO_RECONNECT) return;
    
    const delay = 30000 + Math.random() * 30000;
    
    logger.log(`Reconnecting in ${Math.round(delay / 1000)} seconds`, 'info', this.state.username);
    
    setTimeout(() => {
      if (this.state.status !== 'connected') {
        logger.log(`Attempting to reconnect...`, 'connect', this.state.username);
        this.connect().catch(() => {
          this.scheduleReconnect();
        });
      }
    }, delay);
  }

  cleanup() {
    this.intervals.forEach(interval => {
      try {
        clearInterval(interval);
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    
    this.intervals = [];
    
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
      this.activityTimeout = null;
    }
    
    if (this.bot) {
      try {
        this.bot.removeAllListeners();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    const sleepStatus = this.sleepSystem ? this.sleepSystem.getStatus() : { isSleeping: false };
    
    let uptime = 'N/A';
    if (this.state.connectedAt) {
      const uptimeMs = Date.now() - this.state.connectedAt;
      const hours = Math.floor(uptimeMs / 3600000);
      const minutes = Math.floor((uptimeMs % 3600000) / 60000);
      uptime = `${hours}h ${minutes}m`;
    }
    
    return {
      username: this.state.username,
      personality: this.config.personality,
      status: this.state.status,
      health: this.state.health,
      food: this.state.food,
      position: this.state.position,
      activity: this.state.activity,
      isSleeping: sleepStatus.isSleeping,
      creativeMode: this.state.creativeMode,
      uptime: uptime,
      metrics: {
        messages: this.state.metrics.messagesSent,
        blocks: this.state.metrics.blocksPlaced,
        sleepCycles: sleepStatus.sleepCycles || 0,
        connectionAttempts: this.state.metrics.connectionAttempts
      }
    };
  }
}

// ================= BOT MANAGER =================
class BotManager {
  constructor() {
    this.bots = new Map();
    this.statusInterval = null;
    this.reportInterval = null;
    this.isRunning = false;
  }
  
  async start() {
    logger.log(`\n${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log('🚀 STARTING ULTIMATE BOT SYSTEM', 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log(`Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`, 'info', 'SYSTEM');
    logger.log(`Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`, 'info', 'SYSTEM');
    logger.log(`Features: Auto-Sleep • Creative Mode • Bed Management`, 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'SYSTEM');
    
    this.isRunning = true;
    
    logger.log(`Initial delay: ${CONFIG.SYSTEM.INITIAL_DELAY / 1000} seconds`, 'info', 'SYSTEM');
    await this.delay(CONFIG.SYSTEM.INITIAL_DELAY);
    
    for (let i = 0; i < CONFIG.BOTS.length; i++) {
      const botConfig = CONFIG.BOTS[i];
      const bot = new AdvancedCreativeBot(botConfig, i);
      this.bots.set(botConfig.id, bot);
      
      if (i > 0) {
        const delay = CONFIG.SYSTEM.BOT_DELAY;
        logger.log(`Waiting ${delay / 1000} seconds before next bot...`, 'info', 'SYSTEM');
        await this.delay(delay);
      }
      
      bot.connect().catch(error => {
        logger.log(`Bot ${botConfig.name} failed: ${error.message}`, 'error', 'SYSTEM');
      });
    }
    
    this.startStatusMonitoring();
    this.startSystemReports();
    
    logger.log(`\n✅ All bots scheduled for connection!`, 'success', 'SYSTEM');
    logger.log(`📊 Status updates every ${CONFIG.SYSTEM.STATUS_INTERVAL / 1000} seconds`, 'info', 'SYSTEM');
    logger.log(`🌐 Web interface available on port ${CONFIG.SYSTEM.PORT}\n`, 'info', 'SYSTEM');
  }
  
  startStatusMonitoring() {
    this.statusInterval = setInterval(() => {
      this.printStatus();
    }, CONFIG.SYSTEM.STATUS_INTERVAL);
  }
  
  startSystemReports() {
    this.reportInterval = setInterval(() => {
      this.printSystemReport();
    }, 3600000);
  }
  
  printStatus() {
    const connectedBots = Array.from(this.bots.values())
      .filter(bot => bot.state.status === 'connected');
    
    const sleepingBots = connectedBots
      .filter(bot => bot.state.isSleeping);
    
    logger.log(`\n${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`📊 BOT STATUS - ${new Date().toLocaleTimeString()}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`Connected: ${connectedBots.length}/${this.bots.size}`, 'info', 'STATUS');
    logger.log(`Sleeping: ${sleepingBots.length}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    
    if (connectedBots.length === 0) {
      logger.log('No bots currently connected - Auto-reconnect enabled', 'warn', 'STATUS');
    } else {
      connectedBots.forEach(bot => {
        const status = bot.getStatus();
        const sleepIcon = status.isSleeping ? '💤' : '☀️';
        const activityIcon = status.activity.includes('Sleep') ? '😴' : 
                           status.activity.includes('Build') ? '🏗️' :
                           status.activity.includes('Explore') ? '🗺️' : '🎯';
        
        logger.log(`${sleepIcon} ${status.username} (${status.personality})`, 'info', 'STATUS');
        logger.log(`  Status: ${status.status} | Activity: ${activityIcon} ${status.activity}`, 'info', 'STATUS');
        logger.log(`  Position: ${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}`, 'info', 'STATUS');
        logger.log(`  Health: ${status.health}/20 | Creative: ${status.creativeMode ? '✅' : '❌'}`, 'info', 'STATUS');
        logger.log(`  Uptime: ${status.uptime} | Blocks: ${status.metrics.blocks}`, 'info', 'STATUS');
        logger.log(``, 'info', 'STATUS');
      });
    }
    
    logger.log(`${'='.repeat(70)}\n`, 'info', 'STATUS');
  }
  
  printSystemReport() {
    let totalMessages = 0;
    let totalBlocks = 0;
    let totalSleepCycles = 0;
    let connectedCount = 0;
    
    this.bots.forEach(bot => {
      const status = bot.getStatus();
      totalMessages += status.metrics.messages || 0;
      totalBlocks += status.metrics.blocks || 0;
      totalSleepCycles += status.metrics.sleepCycles || 0;
      if (status.status === 'connected') connectedCount++;
    });
    
    logger.log(`\n${'='.repeat(70)}`, 'info', 'REPORT');
    logger.log(`📈 SYSTEM REPORT - ${new Date().toLocaleTimeString()}`, 'info', 'REPORT');
    logger.log(`${'='.repeat(70)}`, 'info', 'REPORT');
    logger.log(`Connected Bots: ${connectedCount}/${this.bots.size}`, 'info', 'REPORT');
    logger.log(`Total Messages Sent: ${totalMessages}`, 'info', 'REPORT');
    logger.log(`Total Blocks Placed: ${totalBlocks}`, 'info', 'REPORT');
    logger.log(`Total Sleep Cycles: ${totalSleepCycles}`, 'info', 'REPORT');
    logger.log(`System Uptime: ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`, 'info', 'REPORT');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'REPORT');
  }
  
  getAllStatuses() {
    const statuses = {};
    this.bots.forEach((bot, id) => {
      statuses[id] = bot.getStatus();
    });
    return statuses;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async stop() {
    logger.log('\n🛑 Stopping bot system...', 'info', 'SYSTEM');
    this.isRunning = false;
    
    if (this.statusInterval) clearInterval(this.statusInterval);
    if (this.reportInterval) clearInterval(this.reportInterval);
    
    let stoppedCount = 0;
    for (const [id, bot] of this.bots) {
      try {
        bot.cleanup();
        if (bot.bot) {
          bot.bot.quit();
        }
        stoppedCount++;
        logger.log(`Stopped ${bot.state.username}`, 'success', 'SYSTEM');
      } catch (error) {
        logger.log(`Failed to stop ${bot.state.username}: ${error.message}`, 'error', 'SYSTEM');
      }
    }
    
    logger.log(`\n🎮 System stopped. ${stoppedCount} bots terminated.`, 'success', 'SYSTEM');
    return stoppedCount;
  }
}

// ================= WEB SERVER =================
function createWebServer(botManager) {
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    
    if (url === '/' || url === '') {
      const statuses = botManager.getAllStatuses();
      const connected = Object.values(statuses).filter(s => s.status === 'connected').length;
      const sleeping = Object.values(statuses).filter(s => s.isSleeping).length;
      
      res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ultimate Minecraft Bot System</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #00ff88, #00ccff);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        .subtitle {
            color: #aaa;
            margin-bottom: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
            border-color: #00ff88;
        }
        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 10px 0;
        }
        .connected { color: #00ff88; }
        .sleeping { color: #00ccff; }
        .disconnected { color: #ff5555; }
        
        .bots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }
        .bot-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
        }
        .bot-card.sleeping {
            border-color: #00ccff;
            box-shadow: 0 0 20px rgba(0, 204, 255, 0.2);
        }
        .bot-card.awake {
            border-color: #00ff88;
        }
        .bot-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .bot-name {
            font-size: 1.5rem;
            font-weight: bold;
        }
        .bot-personality {
            background: rgba(255, 255, 255, 0.1);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
        }
        .connected-badge { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
        .disconnected-badge { background: rgba(255, 85, 85, 0.2); color: #ff5555; }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 20px;
        }
        .info-item {
            background: rgba(255, 255, 255, 0.03);
            padding: 10px;
            border-radius: 10px;
        }
        .info-label {
            font-size: 0.9rem;
            color: #aaa;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 1.1rem;
            font-weight: bold;
        }
        
        .features {
            margin-top: 40px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .feature {
            background: rgba(0, 255, 136, 0.1);
            padding: 10px;
            border-radius: 10px;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            .header {
                padding: 20px;
            }
            h1 {
                font-size: 2rem;
            }
            .bots-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Ultimate Minecraft Bot System</h1>
            <p class="subtitle">Advanced creative mode bots with perfect sleep system</p>
            
            <div class="stats">
                <div class="stat-card">
                    <div>Total Bots</div>
                    <div class="stat-value">${Object.keys(statuses).length}</div>
                </div>
                <div class="stat-card">
                    <div>Connected</div>
                    <div class="stat-value connected">${connected}</div>
                </div>
                <div class="stat-card">
                    <div>Sleeping</div>
                    <div class="stat-value sleeping">${sleeping}</div>
                </div>
                <div class="stat-card">
                    <div>Server</div>
                    <div style="font-size: 1.2rem; margin-top: 10px;">${CONFIG.SERVER.host}:${CONFIG.SERVER.port}</div>
                </div>
            </div>
        </div>
        
        <h2 style="margin-bottom: 20px;">🤖 Bot Status</h2>
        <div class="bots-grid">
            ${Object.entries(statuses).map(([id, status]) => `
            <div class="bot-card ${status.isSleeping ? 'sleeping' : 'awake'}">
                <div class="bot-header">
                    <div>
                        <div class="bot-name">${status.username}</div>
                        <div class="bot-personality">${status.personality.toUpperCase()}</div>
                    </div>
                    <div class="status-badge ${status.status === 'connected' ? 'connected-badge' : 'disconnected-badge'}">
                        ${status.status.toUpperCase()}
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Activity</div>
                        <div class="info-value">${status.activity} ${status.isSleeping ? '😴' : status.activity.includes('Building') ? '🏗️' : status.activity.includes('Exploring') ? '🗺️' : '🎯'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Health</div>
                        <div class="info-value">${status.health}/20</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Position</div>
                        <div class="info-value">${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Uptime</div>
                        <div class="info-value">${status.uptime}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Messages</div>
                        <div class="info-value">${status.metrics.messages || 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Blocks</div>
                        <div class="info-value">${status.metrics.blocks || 0}</div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
        
        <div class="features">
            <h2>⚡ Active Features</h2>
            <div class="features-grid">
                <div class="feature">🎮 Creative Mode</div>
                <div class="feature">😴 Auto-Sleep</div>
                <div class="feature">🛏️ Bed Management</div>
                <div class="feature">🔄 Auto-Reconnect</div>
                <div class="feature">💬 Smart Chat</div>
                <div class="feature">🎯 Activity System</div>
                <div class="feature">⚡ Anti-AFK</div>
                <div class="feature">📊 Web Interface</div>
            </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #777; font-size: 0.9rem;">
            <p>System running on Render.com • Bots auto-sleep at night • Perfect bed management</p>
            <p>Last updated: ${new Date().toLocaleTimeString()}</p>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>`;
      
      res.end(html);
      
    } else if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        bots: Object.keys(botManager.getAllStatuses()).length
      }));
      
    } else if (url === '/api/status') {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(botManager.getAllStatuses()));
      
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Not Found</h1><p>The requested page does not exist.</p>');
    }
  });
  
  server.listen(CONFIG.SYSTEM.PORT, () => {
    logger.log(`🌐 Web server running on port ${CONFIG.SYSTEM.PORT}`, 'success', 'WEB');
    logger.log(`📱 Status page: http://localhost:${CONFIG.SYSTEM.PORT}`, 'info', 'WEB');
    logger.log(`🩺 Health check: http://localhost:${CONFIG.SYSTEM.PORT}/health`, 'info', 'WEB');
  });
  
  return server;
}

// ================= MAIN EXECUTION =================
async function main() {
  try {
    logger.log('🚀 Initializing Ultimate Minecraft Bot System...', 'info', 'SYSTEM');
    
    // Create bot manager
    const botManager = new BotManager();
    
    // Create web server for Render.com
    createWebServer(botManager);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.log('\n\n🛑 Received shutdown signal...', 'warn', 'SYSTEM');
      await botManager.stop();
      logger.log('👋 System shutdown complete. Goodbye!', 'success', 'SYSTEM');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.log('\n\n🛑 Received termination signal...', 'warn', 'SYSTEM');
      await botManager.stop();
      logger.log('👋 System terminated.', 'success', 'SYSTEM');
      process.exit(0);
    });
    
    // Wait for web server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start bot system
    await botManager.start();
    
    logger.log('✅ System is fully operational!', 'success', 'SYSTEM');
    logger.log('🤖 Bot Features:', 'info', 'SYSTEM');
    logger.log('   • Sleeps IMMEDIATELY when night comes (13000-23000)', 'info', 'SYSTEM');
    logger.log('   • Auto-bed placement from creative inventory', 'info', 'SYSTEM');
    logger.log('   • Bed breaking in morning', 'info', 'SYSTEM');
    logger.log('   • Creative mode with /give commands', 'info', 'SYSTEM');
    logger.log('   • 2 Personality types: Builder & Explorer', 'info', 'SYSTEM');
    logger.log('   • Auto-reconnect on disconnect', 'info', 'SYSTEM');
    logger.log('   • Anti-AFK system', 'info', 'SYSTEM');
    logger.log('   • Smart chat responses', 'info', 'SYSTEM');
    logger.log('\n📊 Check the web interface for real-time status!', 'info', 'SYSTEM');
    
    // Keep process alive indefinitely
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
    
  } catch (error) {
    logger.log(`❌ Fatal system error: ${error.message}`, 'error', 'SYSTEM');
    logger.log(error.stack, 'error', 'SYSTEM');
    process.exit(1);
  }
}

// Start everything
main();
