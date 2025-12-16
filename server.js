// ============================================================
// 🚀 ULTIMATE MINECRAFT BOT SYSTEM v3.0 - SIMPLIFIED
// 😴 ONE Bed System • Smart Sleep • Basic Activities
// ============================================================

const mineflayer = require('mineflayer');
const http = require('http');
const Vec3 = require('vec3').Vec3;

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE MINECRAFT BOT SYSTEM v3.0                                 ║
║   😴 ONE Bed System • Smart Sleep • Basic Activities                   ║
║   🤖 2 Bots • One Home Bed • Simple Sleep                              ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

// ================= ENHANCED LOGGING =================
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
      kick: '🚫',
      bed_break: '⛏️',
      cleanup: '🧹',
      home: '🏠',
      travel: '🗺️',
      emergency: '🚨',
      occupied_bed: '🚫🛏️',
      activity: '🎯',
      retry: '🔁',
      timeout: '⏱️'
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

// ================= SIMPLIFIED CONFIGURATION =================
const CONFIG = {
  SERVER: {
    host: process.env.MINECRAFT_HOST || 'gameplannet.aternos.me',
    port: parseInt(process.env.MINECRAFT_PORT) || 43658,
    version: process.env.MINECRAFT_VERSION || '1.21.10'
  },
  BOTS: [
    {
      id: 'bot_001',
      name: 'SleepMaster',
      personality: 'relaxed',
      color: '§a',
      activities: ['exploring', 'socializing', 'resting'],
      sleepPattern: 'normal',
      homeLocation: null
    },
    {
      id: 'bot_002',
      name: 'NightWatcher',
      personality: 'vigilant',
      color: '§b',
      activities: ['patrolling', 'observing', 'guarding'],
      sleepPattern: 'normal',
      homeLocation: null
    }
  ],
  SYSTEM: {
    PORT: process.env.PORT || 3000,
    INITIAL_DELAY: 10000,
    BOT_DELAY: 8000,
    STATUS_INTERVAL: 30000,
    LOG_LEVEL: 'info',
    MAX_CONNECTION_RETRIES: 5,
    RETRY_DELAY: 30000
  },
  CONNECTION: {
    TIMEOUT: 60000,
    KEEP_ALIVE: true,
    CHECK_TIMEOUT_INTERVAL: 10000,
    CONNECT_TIMEOUT: 60000,
    RESPONSE_TIMEOUT: 30000
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
    ERROR_HANDLING: true,
    HOME_SYSTEM: true,
    RETURN_TO_HOME: true,
    EMERGENCY_SLEEP: false, // Disabled for simplicity
    OCCUPIED_BED_HANDLING: true,
    CONNECTION_RETRY: true,
    ONE_BED_ONLY: true, // NEW: Only place ONE bed
    CLEAN_EXTRA_BEDS: true // NEW: Clean extra beds in home area
  },
  SLEEP_SYSTEM: {
    BREAK_BED_AFTER_SLEEP: false, // Don't break home bed
    KEEP_HOME_BED: true, // Always keep home bed
    EMERGENCY_SLEEP_DISTANCE: 10,
    STOP_ACTIVITIES_AT_NIGHT: true,
    OCCUPIED_BED_HANDLING: true,
    MAX_OCCUPIED_RETRIES: 1, // Only try once
    MIN_BED_DISTANCE: 2,
    ONE_ALTERNATIVE_BED: true // Place only ONE alternative bed
  },
  HOME: {
    SET_SPAWN_AS_HOME: true,
    HOME_RADIUS: 5, // Smaller home radius
    HOME_RETURN_DISTANCE: 30,
    HOME_BED_POSITION: { x: 0, y: 65, z: 0 },
    MARK_HOME_WITH_TORCHES: false, // Disabled for simplicity
    CLEAN_HOME_AREA: true // Clean extra beds in home area
  }
};

// ================= SIMPLE ONE-BED SLEEP SYSTEM =================
class SimpleSleepSystem {
  constructor(botInstance, botName) {
    this.bot = botInstance;
    this.botName = botName;
    this.state = {
      isSleeping: false,
      hasHomeBed: false,
      homeBedPosition: null,
      alternativeBedPlaced: false,
      alternativeBedPosition: null,
      lastSleepTime: null,
      sleepCycles: 0,
      failedSleepAttempts: 0,
      lastBedBreakTime: null,
      occupiedBedRetries: 0,
      isCleaningBeds: false,
      hasBedInInventory: false
    };
    
    this.nightCheckInterval = null;
    this.morningCheckInterval = null;
  }

  // ================= SIMPLE BED OCCUPATION CHECK =================
  isBedOccupied(bedPosition) {
    try {
      if (!this.bot.players || !bedPosition) return false;
      
      const players = Object.values(this.bot.players);
      const bedPos = new Vec3(bedPosition.x, bedPosition.y, bedPosition.z);
      
      for (const player of players) {
        if (player.username !== this.bot.username && player.entity) {
          const playerPos = player.entity.position;
          const distance = playerPos.distanceTo(bedPos);
          
          if (distance < 2) {
            if (player.entity.isSleeping !== undefined && player.entity.isSleeping) {
              logger.log(`Bed at ${bedPosition.x},${bedPosition.y},${bedPosition.z} is occupied by ${player.username}`, 'occupied_bed', this.botName);
              return true;
            }
            
            if (distance < 1.5) {
              logger.log(`Player ${player.username} is near bed`, 'info', this.botName);
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      logger.log(`Bed check error: ${error.message}`, 'debug', this.botName);
      return false;
    }
  }

  // ================= SET HOME BED (ONLY ONE) =================
  async setHomeBed() {
    if (this.state.hasHomeBed) {
      logger.log('Home bed already set', 'home', this.botName);
      return true;
    }
    
    try {
      // Get spawn position
      const spawnPos = this.bot.entity.position;
      const homePosition = {
        x: Math.floor(spawnPos.x),
        y: Math.floor(spawnPos.y),
        z: Math.floor(spawnPos.z)
      };
      
      logger.log(`Setting home bed at ${homePosition.x}, ${homePosition.y}, ${homePosition.z}`, 'home', this.botName);
      
      // Get bed from creative
      await this.getBedFromCreative();
      
      // Find suitable position near spawn
      const bedPos = await this.findSuitableBedPosition(homePosition);
      
      if (!bedPos) {
        logger.log('Could not find position for home bed', 'warn', this.botName);
        return false;
      }
      
      // Place the bed
      const placed = await this.placeBed(bedPos);
      if (!placed) {
        logger.log('Failed to place home bed', 'error', this.botName);
        return false;
      }
      
      this.state.homeBedPosition = bedPos;
      this.state.hasHomeBed = true;
      this.state.hasBedInInventory = false;
      
      // Set spawn point
      this.bot.chat(`/spawnpoint ${this.bot.username} ${bedPos.x} ${bedPos.y} ${bedPos.z}`);
      logger.log(`Home bed placed and spawn point set!`, 'success', this.botName);
      
      return true;
      
    } catch (error) {
      logger.log(`Failed to set home bed: ${error.message}`, 'error', this.botName);
      return false;
    }
  }

  // ================= FIND SUITABLE BED POSITION =================
  async findSuitableBedPosition(nearPosition) {
    // Try positions around the given position
    const positions = [
      { x: nearPosition.x, y: nearPosition.y, z: nearPosition.z },
      { x: nearPosition.x + 1, y: nearPosition.y, z: nearPosition.z },
      { x: nearPosition.x, y: nearPosition.y, z: nearPosition.z + 1 },
      { x: nearPosition.x - 1, y: nearPosition.y, z: nearPosition.z },
      { x: nearPosition.x, y: nearPosition.y, z: nearPosition.z - 1 }
    ];
    
    for (const position of positions) {
      if (await this.isSuitableForBed(position)) {
        return position;
      }
    }
    
    return null;
  }

  async isSuitableForBed(position) {
    const blockPos = new Vec3(position.x, position.y, position.z);
    const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
    
    const block = this.bot.blockAt(blockPos);
    const blockBelow = this.bot.blockAt(blockBelowPos);
    
    // Check if position is suitable for bed
    if (!block || block.name !== 'air') return false;
    if (!blockBelow || blockBelow.name === 'air' || 
        blockBelow.name === 'lava' || blockBelow.name === 'water') {
      return false;
    }
    
    const blockAbovePos = new Vec3(position.x, position.y + 1, position.z);
    const blockAbove = this.bot.blockAt(blockAbovePos);
    if (!blockAbove || blockAbove.name !== 'air') return false;
    
    return true;
  }

  async placeBed(position) {
    try {
      this.bot.setQuickBarSlot(0);
      
      const lookPos = new Vec3(position.x, position.y, position.z);
      await this.bot.lookAt(lookPos);
      
      const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
      const referenceBlock = this.bot.blockAt(blockBelowPos);
      
      if (referenceBlock) {
        await this.bot.placeBlock(referenceBlock, new Vec3(0, 1, 0));
        await this.delay(500);
        return true;
      }
    } catch (error) {
      logger.log(`Failed to place bed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async getBedFromCreative() {
    try {
      this.bot.chat(`/give ${this.bot.username} bed 1`);
      await this.delay(2000);
      this.state.hasBedInInventory = true;
      return true;
    } catch (error) {
      logger.log(`Failed to get bed: ${error.message}`, 'error', this.botName);
      return false;
    }
  }

  // ================= SIMPLE SLEEP LOGIC =================
  async sleep() {
    if (this.state.isSleeping) {
      logger.log('Already sleeping', 'sleep', this.botName);
      return;
    }
    
    logger.log('Attempting to sleep...', 'sleep', this.botName);
    
    // Try sleeping in home bed first
    if (this.state.hasHomeBed) {
      const success = await this.sleepInHomeBed();
      if (success) return;
    }
    
    // Home bed failed or doesn't exist
    logger.log('Home bed not available, placing alternative bed', 'warn', this.botName);
    await this.sleepWithAlternativeBed();
  }

  async sleepInHomeBed() {
    try {
      if (!this.state.homeBedPosition) return false;
      
      const bedPos = new Vec3(
        this.state.homeBedPosition.x,
        this.state.homeBedPosition.y,
        this.state.homeBedPosition.z
      );
      
      // Check if bed is occupied
      if (this.isBedOccupied(this.state.homeBedPosition)) {
        logger.log('Home bed is occupied', 'occupied_bed', this.botName);
        return false;
      }
      
      const bedBlock = this.bot.blockAt(bedPos);
      if (!bedBlock || !this.isBedBlock(bedBlock)) {
        logger.log('Home bed missing', 'warn', this.botName);
        return false;
      }
      
      // Walk to bed if needed
      const distance = this.bot.entity.position.distanceTo(bedPos);
      if (distance > 2) {
        await this.bot.lookAt(bedPos);
        this.bot.setControlState('forward', true);
        await this.delay(Math.min(distance * 200, 1000));
        this.bot.setControlState('forward', false);
        await this.delay(500);
      }
      
      // Sleep in bed
      await this.bot.sleep(bedBlock);
      this.state.isSleeping = true;
      this.state.lastSleepTime = Date.now();
      this.state.sleepCycles++;
      this.state.failedSleepAttempts = 0;
      
      logger.log(`Sleeping in home bed`, 'sleep', this.botName);
      return true;
      
    } catch (error) {
      logger.log(`Failed to sleep in home bed: ${error.message}`, 'error', this.botName);
      this.state.failedSleepAttempts++;
      return false;
    }
  }

  async sleepWithAlternativeBed() {
    try {
      // Clean any extra beds first
      await this.cleanExtraBeds();
      
      // Get bed if needed
      if (!this.state.hasBedInInventory) {
        await this.getBedFromCreative();
      }
      
      // Find position for alternative bed
      const altPosition = await this.findAlternativeBedPosition();
      if (!altPosition) {
        logger.log('Could not find position for alternative bed', 'error', this.botName);
        return;
      }
      
      // Place alternative bed
      const placed = await this.placeBed(altPosition);
      if (!placed) {
        logger.log('Failed to place alternative bed', 'error', this.botName);
        return;
      }
      
      this.state.alternativeBedPlaced = true;
      this.state.alternativeBedPosition = altPosition;
      this.state.hasBedInInventory = false;
      
      logger.log(`Alternative bed placed at ${altPosition.x}, ${altPosition.y}, ${altPosition.z}`, 'success', this.botName);
      
      // Sleep in alternative bed
      const bedPos = new Vec3(altPosition.x, altPosition.y, altPosition.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock) {
        await this.bot.sleep(bedBlock);
        this.state.isSleeping = true;
        this.state.lastSleepTime = Date.now();
        this.state.sleepCycles++;
        this.state.failedSleepAttempts = 0;
        
        logger.log(`Sleeping in alternative bed`, 'sleep', this.botName);
      }
      
    } catch (error) {
      logger.log(`Failed to sleep with alternative bed: ${error.message}`, 'error', this.botName);
      this.state.failedSleepAttempts++;
    }
  }

  async findAlternativeBedPosition() {
    const basePos = this.state.hasHomeBed ? this.state.homeBedPosition : this.bot.entity.position;
    
    // Try positions in a small radius
    for (let radius = 1; radius <= 3; radius++) {
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          if (x === 0 && z === 0) continue; // Skip center
          
          const checkPos = {
            x: Math.floor(basePos.x) + x,
            y: Math.floor(basePos.y),
            z: Math.floor(basePos.z) + z
          };
          
          // Skip if this is home bed position
          if (this.state.hasHomeBed &&
              checkPos.x === this.state.homeBedPosition.x &&
              checkPos.z === this.state.homeBedPosition.z) {
            continue;
          }
          
          if (await this.isSuitableForBed(checkPos)) {
            return checkPos;
          }
        }
      }
    }
    
    return null;
  }

  // ================= CLEAN EXTRA BEDS =================
  async cleanExtraBeds() {
    if (this.state.isCleaningBeds || !CONFIG.FEATURES.CLEAN_EXTRA_BEDS) return;
    
    this.state.isCleaningBeds = true;
    logger.log('Cleaning extra beds in home area...', 'cleanup', this.botName);
    
    try {
      const homePos = this.state.hasHomeBed ? this.state.homeBedPosition : this.bot.entity.position;
      
      // Find all beds in home radius
      const beds = this.bot.findBlocks({
        matching: block => {
          if (!block) return false;
          const name = this.bot.registry.blocks[block.type]?.name;
          return name && name.includes('bed');
        },
        maxDistance: CONFIG.HOME.HOME_RADIUS,
        count: 20
      });
      
      if (beds && beds.length > 0) {
        logger.log(`Found ${beds.length} beds in home area`, 'cleanup', this.botName);
        
        for (const bedPos of beds) {
          const position = { x: bedPos.x, y: bedPos.y, z: bedPos.z };
          
          // Skip home bed
          if (this.state.hasHomeBed &&
              position.x === this.state.homeBedPosition.x &&
              position.y === this.state.homeBedPosition.y &&
              position.z === this.state.homeBedPosition.z) {
            continue;
          }
          
          // Skip alternative bed if we're using it
          if (this.state.alternativeBedPlaced &&
              position.x === this.state.alternativeBedPosition.x &&
              position.y === this.state.alternativeBedPosition.y &&
              position.z === this.state.alternativeBedPosition.z) {
            continue;
          }
          
          // Break the bed
          await this.breakBed(position);
          await this.delay(500);
        }
      }
      
    } catch (error) {
      logger.log(`Error cleaning beds: ${error.message}`, 'error', this.botName);
    } finally {
      this.state.isCleaningBeds = false;
    }
  }

  async breakBed(position) {
    try {
      const bedPos = new Vec3(position.x, position.y, position.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock && this.isBedBlock(bedBlock)) {
        await this.bot.dig(bedBlock);
        await this.delay(1000);
        logger.log(`Broke extra bed at ${position.x}, ${position.y}, ${position.z}`, 'bed_break', this.botName);
        return true;
      }
    } catch (error) {
      logger.log(`Failed to break bed: ${error.message}`, 'debug', this.botName);
    }
    return false;
  }

  // ================= WAKE UP AND CLEAN =================
  async wakeUp() {
    if (!this.state.isSleeping) return;
    
    try {
      if (this.bot.isSleeping) {
        this.bot.wake();
      }
      
      this.state.isSleeping = false;
      logger.log('Woke up', 'wake', this.botName);
      
      await this.delay(1000);
      
      // Clean alternative bed if it was placed
      if (this.state.alternativeBedPlaced && this.state.alternativeBedPosition) {
        await this.breakBed(this.state.alternativeBedPosition);
        this.state.alternativeBedPlaced = false;
        this.state.alternativeBedPosition = null;
      }
      
      // Clean any other extra beds
      await this.cleanExtraBeds();
      
    } catch (error) {
      logger.log(`Wake up error: ${error.message}`, 'error', this.botName);
    }
  }

  // ================= TIME CHECKING =================
  startTimeMonitoring() {
    if (this.nightCheckInterval) {
      clearInterval(this.nightCheckInterval);
    }
    
    this.nightCheckInterval = setInterval(() => {
      if (!this.bot || !this.bot.time) return;
      
      const time = this.bot.time.time;
      const isNight = time >= 13000 && time <= 23000;
      const isMorning = time >= 0 && time < 13000;
      
      if (isNight && !this.state.isSleeping) {
        logger.log('Night detected - Going to sleep', 'night', this.botName);
        this.sleep();
      }
      
      if (isMorning && this.state.isSleeping) {
        logger.log('Morning detected - Waking up', 'day', this.botName);
        this.wakeUp();
      }
      
    }, 5000);
  }

  isBedBlock(block) {
    if (!block) return false;
    const name = this.bot.registry.blocks[block.type]?.name;
    return name && name.includes('bed');
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isSleeping: this.state.isSleeping,
      hasHomeBed: this.state.hasHomeBed,
      homeBedPosition: this.state.homeBedPosition,
      alternativeBedPlaced: this.state.alternativeBedPlaced,
      sleepCycles: this.state.sleepCycles,
      lastSleepTime: this.state.lastSleepTime ? 
        new Date(this.state.lastSleepTime).toLocaleTimeString() : 'Never',
      failedSleepAttempts: this.state.failedSleepAttempts,
      occupiedBedRetries: this.state.occupiedBedRetries
    };
  }
}

// ================= SIMPLE BOT =================
class SimpleBot {
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
      homeLocation: null,
      metrics: {
        messagesSent: 0,
        blocksPlaced: 0,
        blocksBroken: 0,
        distanceTraveled: 0,
        sleepCycles: 0,
        connectionAttempts: 0
      }
    };
    
    this.intervals = [];
    this.activityInterval = null;
    
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
        defaultChatPatterns: false,
        hideErrors: false,
        connectTimeout: CONFIG.CONNECTION.CONNECT_TIMEOUT
      });
      
      this.sleepSystem = new SimpleSleepSystem(this.bot, this.state.username);
      
      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, CONFIG.CONNECTION.CONNECT_TIMEOUT);
        
        this.bot.once('spawn', () => {
          clearTimeout(timeout);
          this.onSpawn();
          resolve(this);
        });
        
        this.bot.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
      
    } catch (error) {
      this.state.status = 'failed';
      logger.log(`Connection failed: ${error.message}`, 'error', this.state.username);
      
      if (CONFIG.FEATURES.CONNECTION_RETRY && 
          this.state.metrics.connectionAttempts < CONFIG.SYSTEM.MAX_CONNECTION_RETRIES) {
        this.scheduleReconnect();
      }
      
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
      }
    });
    
    this.bot.on('sleep', () => {
      this.state.isSleeping = true;
      this.state.activity = 'Sleeping';
      logger.log('Started sleeping', 'sleep', this.state.username);
    });
    
    this.bot.on('wake', () => {
      this.state.isSleeping = false;
      this.state.activity = 'Waking up';
      logger.log('Woke up', 'wake', this.state.username);
    });
    
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      
      if (CONFIG.FEATURES.CHAT_SYSTEM && Math.random() < 0.3) {
        setTimeout(() => {
          if (this.bot && this.bot.player) {
            const response = this.generateChatResponse(message, username);
            this.bot.chat(response);
            this.state.metrics.messagesSent++;
          }
        }, 1000 + Math.random() * 2000);
      }
    });
    
    this.bot.on('kicked', (reason) => {
      logger.log(`Kicked: ${JSON.stringify(reason)}`, 'kick', this.state.username);
      this.state.status = 'kicked';
      this.cleanup();
      this.scheduleReconnect();
    });
    
    this.bot.on('end', () => {
      logger.log('Disconnected', 'disconnect', this.state.username);
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
    
    logger.log(`Successfully spawned!`, 'success', this.state.username);
    
    setTimeout(() => {
      this.initializeCreativeMode();
    }, 2000);
    
    setTimeout(() => {
      this.initializeHomeSystem();
    }, 5000);
    
    setTimeout(() => {
      this.startDaytimeActivities();
      this.sleepSystem.startTimeMonitoring();
    }, 8000);
    
    logger.log(`Bot ready!`, 'success', this.state.username);
  }

  async initializeHomeSystem() {
    if (CONFIG.FEATURES.HOME_SYSTEM) {
      const success = await this.sleepSystem.setHomeBed();
      if (success && this.sleepSystem.state.homeBedPosition) {
        this.state.homeLocation = this.sleepSystem.state.homeBedPosition;
      }
    }
  }

  initializeCreativeMode() {
    if (!this.bot) return;
    
    this.bot.chat('/gamemode creative');
    logger.log(`Creative mode enabled`, 'success', this.state.username);
    
    setTimeout(() => {
      this.bot.chat(`/give ${this.bot.username} bed 1`);
      this.bot.chat(`/give ${this.bot.username} stone 64`);
    }, 2000);
  }

  startDaytimeActivities() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
    }
    
    this.activityInterval = setInterval(() => {
      if (!this.bot || !this.bot.entity || this.state.isSleeping) {
        return;
      }
      
      if (!this.canPerformActivities()) {
        return;
      }
      
      this.performActivity();
      
    }, 20000 + Math.random() * 10000);
  }

  canPerformActivities() {
    if (!this.bot || !this.bot.time) return false;
    
    const time = this.bot.time.time;
    const isDaytime = time >= 0 && time < 13000;
    
    return isDaytime;
  }

  performActivity() {
    const activities = [
      'explore',
      'look_around',
      'simple_block'
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    this.state.activity = activity;
    
    switch (activity) {
      case 'explore':
        this.explore();
        break;
      case 'look_around':
        this.lookAround();
        break;
      case 'simple_block':
        this.simpleBlockActivity();
        break;
    }
  }

  explore() {
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    this.bot.setControlState(direction, true);
    setTimeout(() => {
      if (this.bot) this.bot.setControlState(direction, false);
    }, 1500 + Math.random() * 1500);
    
    this.bot.look(Math.random() * Math.PI * 2, 0);
  }

  lookAround() {
    this.bot.look(Math.random() * Math.PI * 2, -Math.PI / 4);
    
    setTimeout(() => {
      if (this.bot) {
        this.bot.look(Math.random() * Math.PI, 0);
      }
    }, 1000 + Math.random() * 2000);
  }

  simpleBlockActivity() {
    if (Math.random() < 0.3) { // 30% chance to do block activity
      const pos = this.bot.entity.position;
      const blockPos = {
        x: Math.floor(pos.x) + Math.floor(Math.random() * 3) - 1,
        y: Math.floor(pos.y),
        z: Math.floor(pos.z) + Math.floor(Math.random() * 3) - 1
      };
      
      const targetVec = new Vec3(blockPos.x, blockPos.y, blockPos.z);
      this.bot.lookAt(targetVec);
      
      setTimeout(() => {
        const blockBelowPos = new Vec3(blockPos.x, blockPos.y - 1, blockPos.z);
        const referenceBlock = this.bot.blockAt(blockBelowPos);
        
        if (referenceBlock) {
          this.bot.placeBlock(referenceBlock, new Vec3(0, 1, 0))
            .then(() => {
              this.state.metrics.blocksPlaced++;
              
              setTimeout(() => {
                const placedBlock = this.bot.blockAt(targetVec);
                if (placedBlock) {
                  this.bot.dig(placedBlock)
                    .then(() => {
                      this.state.metrics.blocksBroken++;
                    })
                    .catch(() => {});
                }
              }, 2000);
            })
            .catch(() => {});
        }
      }, 500);
    }
  }

  generateChatResponse(message, sender) {
    const responses = [
      `Hey ${sender}!`,
      `What's up?`,
      `Nice day!`,
      `Just hanging out.`,
      `How's it going?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
    
    const delay = CONFIG.SYSTEM.RETRY_DELAY + Math.random() * 20000;
    
    logger.log(`Reconnecting in ${Math.round(delay / 1000)} seconds`, 'retry', this.state.username);
    
    setTimeout(() => {
      if (this.state.status !== 'connected') {
        this.connect().catch(() => {});
      }
    }, delay);
  }

  cleanup() {
    this.intervals.forEach(interval => {
      try {
        clearInterval(interval);
      } catch (error) {}
    });
    
    this.intervals = [];
    
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
    
    if (this.bot) {
      try {
        this.bot.removeAllListeners();
      } catch (error) {}
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    const sleepStatus = this.sleepSystem ? this.sleepSystem.getStatus() : {};
    
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
      isSleeping: sleepStatus.isSleeping || false,
      uptime: uptime,
      homeLocation: this.state.homeLocation,
      metrics: {
        messages: this.state.metrics.messagesSent,
        blocksPlaced: this.state.metrics.blocksPlaced,
        blocksBroken: this.state.metrics.blocksBroken,
        sleepCycles: sleepStatus.sleepCycles || 0
      },
      sleepInfo: {
        hasHomeBed: sleepStatus.hasHomeBed || false,
        alternativeBedPlaced: sleepStatus.alternativeBedPlaced || false,
        failedAttempts: sleepStatus.failedSleepAttempts || 0
      }
    };
  }
}

// ================= SIMPLE BOT MANAGER =================
class SimpleBotManager {
  constructor() {
    this.bots = new Map();
    this.statusInterval = null;
    this.isRunning = false;
  }
  
  async start() {
    logger.log(`\n${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log('🚀 SIMPLE BOT SYSTEM v3.0 - ONE BED ONLY', 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log(`Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`, 'info', 'SYSTEM');
    logger.log(`Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`, 'info', 'SYSTEM');
    logger.log(`Features: ONE Bed • Simple Sleep • Clean Home Area`, 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'SYSTEM');
    
    this.isRunning = true;
    
    await this.delay(CONFIG.SYSTEM.INITIAL_DELAY);
    
    for (let i = 0; i < CONFIG.BOTS.length; i++) {
      const botConfig = CONFIG.BOTS[i];
      const bot = new SimpleBot(botConfig, i);
      this.bots.set(botConfig.id, bot);
      
      if (i > 0) {
        await this.delay(CONFIG.SYSTEM.BOT_DELAY);
      }
      
      bot.connect().catch(error => {
        logger.log(`Bot ${botConfig.name} failed: ${error.message}`, 'error', 'SYSTEM');
      });
    }
    
    this.startStatusMonitoring();
    
    logger.log(`\n✅ All bots scheduled!`, 'success', 'SYSTEM');
    logger.log(`📊 Status updates every ${CONFIG.SYSTEM.STATUS_INTERVAL / 1000} seconds`, 'info', 'SYSTEM');
    logger.log(`🌐 Web interface on port ${CONFIG.SYSTEM.PORT}\n`, 'info', 'SYSTEM');
    
    logger.log(`🎯 SIMPLE ROUTINE:`, 'info', 'SYSTEM');
    logger.log(`   1. ☀️ DAY: Basic activities near home`, 'day', 'SYSTEM');
    logger.log(`   2. 🌙 NIGHT: Sleep in ONE home bed`, 'night', 'SYSTEM');
    logger.log(`   3. 🚫 BED OCCUPIED: Place ONE alternative bed`, 'occupied_bed', 'SYSTEM');
    logger.log(`   4. ☀️ MORNING: Clean extra beds, keep home bed`, 'cleanup', 'SYSTEM');
    logger.log(`   5. 🔁 REPEAT: Simple cycle`, 'success', 'SYSTEM');
  }
  
  startStatusMonitoring() {
    this.statusInterval = setInterval(() => {
      this.printStatus();
    }, CONFIG.SYSTEM.STATUS_INTERVAL);
  }
  
  printStatus() {
    const connectedBots = Array.from(this.bots.values())
      .filter(bot => bot.state.status === 'connected');
    
    const sleepingBots = connectedBots
      .filter(bot => bot.state.isSleeping);
    
    const hasHomeBed = connectedBots
      .filter(bot => bot.state.homeLocation).length;
    
    logger.log(`\n${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`📊 SIMPLE STATUS - ${new Date().toLocaleTimeString()}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`Connected: ${connectedBots.length}/${this.bots.size}`, 'info', 'STATUS');
    logger.log(`Sleeping: ${sleepingBots.length}`, 'info', 'STATUS');
    logger.log(`With Home Bed: ${hasHomeBed}`, 'info', 'STATUS');
    logger.log(`ONE Bed System: ✅ ACTIVE`, 'info', 'STATUS');
    logger.log(`Clean Extra Beds: ${CONFIG.FEATURES.CLEAN_EXTRA_BEDS ? '✅ ACTIVE' : '❌ INACTIVE'}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    
    connectedBots.forEach(bot => {
      const status = bot.getStatus();
      const sleepIcon = status.isSleeping ? '💤' : '☀️';
      
      logger.log(`${sleepIcon} ${status.username} (${status.personality})`, 'info', 'STATUS');
      logger.log(`  Activity: ${status.activity} | Position: ${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}`, 'info', 'STATUS');
      logger.log(`  Home: ${status.homeLocation ? `${status.homeLocation.x}, ${status.homeLocation.y}, ${status.homeLocation.z}` : 'Not set'}`, 'info', 'STATUS');
      logger.log(`  Sleep Cycles: ${status.metrics.sleepCycles} | Health: ${status.health}/20`, 'info', 'STATUS');
      logger.log(``, 'info', 'STATUS');
    });
    
    logger.log(`${'='.repeat(70)}\n`, 'info', 'STATUS');
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
    logger.log('\n🛑 Stopping simple bot system...', 'info', 'SYSTEM');
    this.isRunning = false;
    
    if (this.statusInterval) clearInterval(this.statusInterval);
    
    let stoppedCount = 0;
    for (const [id, bot] of this.bots) {
      try {
        bot.cleanup();
        if (bot.bot) {
          bot.bot.quit();
        }
        stoppedCount++;
      } catch (error) {}
    }
    
    logger.log(`🎮 System stopped. ${stoppedCount} bots terminated.`, 'success', 'SYSTEM');
  }
}

// ================= SIMPLE WEB SERVER =================
function createWebServer(botManager) {
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    
    if (url === '/' || url === '') {
      const statuses = botManager.getAllStatuses();
      const connected = Object.values(statuses).filter(s => s.status === 'connected').length;
      const sleeping = Object.values(statuses).filter(s => s.isSleeping).length;
      const hasHomeBed = Object.values(statuses).filter(s => s.homeLocation).length;
      const totalSleepCycles = Object.values(statuses).reduce((total, s) => total + (s.metrics.sleepCycles || 0), 0);
      
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
    <title>Simple Minecraft Bot System v3.0</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif;
            background: #1a1a2e;
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            text-align: center;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 10px;
            color: #00ff88;
        }
        .version {
            background: rgba(0, 255, 136, 0.2);
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.8rem;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            border: 1px solid rgba(0, 255, 136, 0.3);
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #00ff88;
            margin: 5px 0;
        }
        
        .bots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .bot-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .bot-card.sleeping {
            border-color: #00ccff;
            box-shadow: 0 0 10px rgba(0, 204, 255, 0.3);
        }
        .bot-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .bot-name {
            font-size: 1.2rem;
            font-weight: bold;
        }
        .bot-status {
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
        }
        .connected { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
        .sleeping { background: rgba(0, 204, 255, 0.2); color: #00ccff; }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 10px;
        }
        .info-item {
            background: rgba(255, 255, 255, 0.03);
            padding: 8px;
            border-radius: 5px;
        }
        .info-label {
            font-size: 0.8rem;
            color: #aaa;
        }
        .info-value {
            font-size: 1rem;
            font-weight: bold;
        }
        
        .home-info {
            margin-top: 10px;
            padding: 10px;
            background: rgba(0, 255, 136, 0.1);
            border-radius: 5px;
            border: 1px solid rgba(0, 255, 136, 0.3);
        }
        
        .features {
            margin-top: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        .feature {
            background: rgba(0, 255, 136, 0.1);
            padding: 8px;
            border-radius: 5px;
            text-align: center;
            font-size: 0.9rem;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #777;
            font-size: 0.8rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Simple Minecraft Bot System <span class="version">v3.0</span></h1>
            <p>ONE Bed System • Simple Sleep • Clean Home Area</p>
            
            <div class="stats">
                <div class="stat-card">
                    <div>Connected Bots</div>
                    <div class="stat-value">${connected}</div>
                </div>
                <div class="stat-card">
                    <div>Sleeping</div>
                    <div class="stat-value">${sleeping}</div>
                </div>
                <div class="stat-card">
                    <div>With Home Bed</div>
                    <div class="stat-value">${hasHomeBed}</div>
                </div>
                <div class="stat-card">
                    <div>Sleep Cycles</div>
                    <div class="stat-value">${totalSleepCycles}</div>
                </div>
            </div>
        </div>
        
        <h2 style="margin-bottom: 15px;">🤖 Bot Status</h2>
        <div class="bots-grid">
            ${Object.entries(statuses).map(([id, status]) => `
            <div class="bot-card ${status.isSleeping ? 'sleeping' : ''}">
                <div class="bot-header">
                    <div class="bot-name">${status.username}</div>
                    <div class="bot-status ${status.isSleeping ? 'sleeping' : 'connected'}">
                        ${status.isSleeping ? '💤 SLEEPING' : '☀️ AWAKE'}
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Activity</div>
                        <div class="info-value">${status.activity}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Health</div>
                        <div class="info-value">${status.health}/20</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Position</div>
                        <div class="info-value">${status.position ? `${status.position.x}, ${status.position.z}` : 'Unknown'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value">${status.status}</div>
                    </div>
                </div>
                
                ${status.homeLocation ? `
                <div class="home-info">
                    <div class="info-label">🏠 Home Bed</div>
                    <div class="info-value">${status.homeLocation.x}, ${status.homeLocation.y}, ${status.homeLocation.z}</div>
                </div>
                ` : ''}
                
                <div style="margin-top: 10px; font-size: 0.9rem; color: #aaa;">
                    Sleep Cycles: ${status.metrics.sleepCycles} | Blocks: ${status.metrics.blocksPlaced}/${status.metrics.blocksBroken}
                </div>
            </div>
            `).join('')}
        </div>
        
        <div class="features">
            <h2>⚡ Features</h2>
            <div class="features-grid">
                <div class="feature">ONE Home Bed</div>
                <div class="feature">😴 Simple Sleep</div>
                <div class="feature">🏠 Spawn Point Set</div>
                <div class="feature">🧹 Clean Extra Beds</div>
                <div class="feature">🎯 Basic Activities</div>
                <div class="feature">🔗 Auto-Reconnect</div>
                <div class="feature">💬 Simple Chat</div>
                <div class="feature">📊 Web Interface</div>
            </div>
        </div>
        
        <div class="footer">
            <p>✅ ONE Bed System: Each bot has ONE permanent home bed</p>
            <p>✅ Clean Home Area: Extra beds cleaned every morning</p>
            <p>✅ Simple Cycle: Day activities → Night sleep → Repeat</p>
            <p>Last updated: ${new Date().toLocaleTimeString()} • Auto-refresh: 30s</p>
        </div>
    </div>
    
    <script>
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>`;
      
      res.end(html);
      
    } else if (url === '/api/status') {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        version: '3.0',
        server: CONFIG.SERVER,
        timestamp: new Date().toISOString(),
        features: CONFIG.FEATURES,
        bots: botManager.getAllStatuses()
      }));
      
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  
  server.listen(CONFIG.SYSTEM.PORT, () => {
    logger.log(`🌐 Web server on port ${CONFIG.SYSTEM.PORT}`, 'success', 'WEB');
    logger.log(`📱 Status: http://localhost:${CONFIG.SYSTEM.PORT}`, 'info', 'WEB');
  });
  
  return server;
}

// ================= MAIN =================
async function main() {
  try {
    logger.log('🚀 Starting Simple Bot System v3.0...', 'info', 'SYSTEM');
    logger.log('✅ ONE Bed System • Simple Sleep • Clean Home', 'success', 'SYSTEM');
    
    const botManager = new SimpleBotManager();
    
    createWebServer(botManager);
    
    process.on('SIGINT', async () => {
      logger.log('\n🛑 Shutting down...', 'warn', 'SYSTEM');
      await botManager.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.log('\n🛑 Terminating...', 'warn', 'SYSTEM');
      await botManager.stop();
      process.exit(0);
    });
    
    await botManager.start();
    
    logger.log('\n🎯 SIMPLE CYCLE:', 'info', 'SYSTEM');
    logger.log('   ☀️ Day: Basic activities near home', 'day', 'SYSTEM');
    logger.log('   🌙 Night: Sleep in ONE home bed', 'night', 'SYSTEM');
    logger.log('   🚫 Bed Occupied: Place ONE alternative bed', 'occupied_bed', 'SYSTEM');
    logger.log('   ☀️ Morning: Clean extra beds, keep home bed', 'cleanup', 'SYSTEM');
    logger.log('   🔁 Repeat: Simple and clean', 'success', 'SYSTEM');
    
    // Keep running
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
    
  } catch (error) {
    logger.log(`❌ Fatal error: ${error.message}`, 'error', 'SYSTEM');
    process.exit(1);
  }
}

// Start
main();
