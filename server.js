// ============================================================
// 🚀 ULTIMATE MINECRAFT BOT SYSTEM v3.3 - PERFECT SLEEP
// 😴 Both Bots Sleep • Fixed Bed Placement • No Night Activities
// ============================================================

const mineflayer = require('mineflayer');
const http = require('http');
const Vec3 = require('vec3').Vec3;

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE MINECRAFT BOT SYSTEM v3.3                                 ║
║   😴 Both Bots Sleep • Fixed Bed Placement • Perfect Sleep             ║
║   🤖 2 Bots • Same Sleep Logic • Fixed Ground Placement               ║
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
      bed_place: '🛏️',
      cleanup: '🧹',
      home: '🏠',
      spawnpoint: '📍',
      emergency: '🚨',
      occupied_bed: '🚫🛏️',
      activity: '🎯',
      time: '⏰',
      ground_check: '🌍'
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
      sleepPattern: 'normal', // Changed to normal (same as SleepMaster)
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
    CREATIVE_MODE: true,
    AUTO_RECONNECT: true,
    CHAT_SYSTEM: true,
    ACTIVITY_SYSTEM: true,
    HEALTH_MONITORING: true,
    HOME_SYSTEM: true,
    OCCUPIED_BED_HANDLING: true,
    CONNECTION_RETRY: true,
    ONE_BED_ONLY: true,
    CLEAN_EXTRA_BEDS: true,
    AUTO_BED_REPLACEMENT: true,
    SPAWNPOINT_PROTECTION: true,
    FORCE_DAY_ACTIVITIES: true,
    DEBUG_TIME_CHECKING: false,
    STRICT_GROUND_CHECK: true, // NEW: Strict ground checking for bed placement
    FORCE_STOP_NIGHT_ACTIVITIES: true // NEW: Force stop activities at night
  },
  SLEEP_SYSTEM: {
    KEEP_HOME_BED: true,
    STOP_ACTIVITIES_AT_NIGHT: true,
    OCCUPIED_BED_HANDLING: true,
    MAX_OCCUPIED_RETRIES: 1,
    CHECK_BED_INTERVAL: 5000,
    BED_REPLACEMENT_DELAY: 2000,
    SLEEP_CHECK_INTERVAL: 3000,
    NIGHT_START: 13000,
    NIGHT_END: 23000,
    DAY_START: 0,
    DAY_END: 13000,
    BED_PLACEMENT_ATTEMPTS: 10, // NEW: More attempts to find ground
    GROUND_CHECK_RADIUS: 3, // NEW: Radius to check for ground
    MIN_GROUND_LEVEL: 60, // NEW: Minimum Y level for bed placement
    MAX_GROUND_LEVEL: 80  // NEW: Maximum Y level for bed placement
  },
  HOME: {
    SET_SPAWN_AS_HOME: true,
    HOME_RADIUS: 5,
    HOME_RETURN_DISTANCE: 30,
    HOME_BED_POSITION: { x: 0, y: 65, z: 0 },
    CLEAN_HOME_AREA: true,
    FORCE_SPAWNPOINT: true
  },
  ACTIVITIES: {
    DAYTIME_ONLY: true,
    ACTIVITY_INTERVAL: 15000,
    MAX_DISTANCE_FROM_HOME: 20,
    MIN_ACTIVITY_DURATION: 3000,
    MAX_ACTIVITY_DURATION: 8000,
    FORCE_STOP_AT_NIGHT: true // NEW: Force stop activities at night
  }
};

// ================= PERFECT SLEEP SYSTEM =================
class PerfectSleepSystem {
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
      bedReplacements: 0,
      lastBedCheck: 0,
      isCheckingBed: false,
      isReplacingBed: false,
      spawnpointSet: false,
      lastTimeCheck: 0,
      currentTime: 0,
      isNight: false,
      isDay: true,
      activitiesStopped: false,
      bedPlacementAttempts: 0
    };
    
    this.nightCheckInterval = null;
    this.morningCheckInterval = null;
    this.bedCheckInterval = null;
    this.bedReplacementTimeout = null;
    this.timeUpdateInterval = null;
    this.activityStopTimeout = null;
  }

  // ================= INITIALIZE HOME SYSTEM =================
  async initializeHomeSystem() {
    try {
      logger.log('Setting up home system...', 'home', this.botName);
      
      // Get spawn position
      const spawnPos = this.bot.entity.position;
      const homePosition = {
        x: Math.floor(spawnPos.x),
        y: Math.floor(spawnPos.y),
        z: Math.floor(spawnPos.z)
      };
      
      logger.log(`Home location: ${homePosition.x}, ${homePosition.y}, ${homePosition.z}`, 'home', this.botName);
      
      // Get bed from creative
      await this.getBedFromCreative();
      
      // Find and place home bed WITH GROUND CHECK
      const bedPlaced = await this.placeHomeBedWithGroundCheck(homePosition);
      
      if (bedPlaced) {
        // Set spawnpoint
        await this.setSpawnpoint();
        
        // Start bed checking
        this.startBedChecking();
        
        // Start time monitoring
        this.startTimeMonitoring();
        
        logger.log('✅ Home system initialized!', 'success', this.botName);
        return true;
      }
      
    } catch (error) {
      logger.log(`Failed to initialize home: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  // ================= IMPROVED BED PLACEMENT WITH GROUND CHECK =================
  async placeHomeBedWithGroundCheck(nearPosition) {
    logger.log('Finding ground for home bed...', 'ground_check', this.botName);
    
    // Reset attempts
    this.state.bedPlacementAttempts = 0;
    
    // Try to find ground position first
    const groundPosition = await this.findGroundPosition(nearPosition);
    
    if (!groundPosition) {
      logger.log('❌ Could not find suitable ground for bed', 'error', this.botName);
      return false;
    }
    
    logger.log(`Found ground at ${groundPosition.x}, ${groundPosition.y}, ${groundPosition.z}`, 'ground_check', this.botName);
    
    // Try positions around the ground position
    const positions = [
      { x: groundPosition.x, y: groundPosition.y + 1, z: groundPosition.z },
      { x: groundPosition.x + 1, y: groundPosition.y + 1, z: groundPosition.z },
      { x: groundPosition.x, y: groundPosition.y + 1, z: groundPosition.z + 1 },
      { x: groundPosition.x - 1, y: groundPosition.y + 1, z: groundPosition.z },
      { x: groundPosition.x, y: groundPosition.y + 1, z: groundPosition.z - 1 }
    ];
    
    for (const position of positions) {
      logger.log(`Trying bed position: ${position.x}, ${position.y}, ${position.z}`, 'debug', this.botName);
      
      if (await this.isSuitableForBed(position)) {
        const placed = await this.placeBed(position);
        if (placed) {
          this.state.homeBedPosition = position;
          this.state.hasHomeBed = true;
          this.state.bedReplacements++;
          logger.log(`✅ Home bed placed at ${position.x}, ${position.y}, ${position.z}`, 'success', this.botName);
          return true;
        }
      }
    }
    
    logger.log('❌ Could not place home bed on any position', 'error', this.botName);
    return false;
  }

  async findGroundPosition(nearPosition) {
    logger.log(`Looking for ground near ${nearPosition.x}, ${nearPosition.y}, ${nearPosition.z}`, 'ground_check', this.botName);
    
    // Check positions in a radius
    for (let radius = 0; radius <= CONFIG.SLEEP_SYSTEM.GROUND_CHECK_RADIUS; radius++) {
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          if (x === 0 && z === 0 && radius === 0) continue;
          
          const checkX = nearPosition.x + x;
          const checkZ = nearPosition.z + z;
          
          // Find ground level at this X,Z
          const groundY = await this.findGroundLevel(checkX, checkZ);
          
          if (groundY !== null) {
            // Check if Y level is within limits
            if (groundY >= CONFIG.SLEEP_SYSTEM.MIN_GROUND_LEVEL && 
                groundY <= CONFIG.SLEEP_SYSTEM.MAX_GROUND_LEVEL) {
              logger.log(`Found ground at ${checkX}, ${groundY}, ${checkZ}`, 'ground_check', this.botName);
              return { x: checkX, y: groundY, z: checkZ };
            }
          }
        }
      }
    }
    
    // If no ground found in radius, try the spawn position
    const spawnGroundY = await this.findGroundLevel(nearPosition.x, nearPosition.z);
    if (spawnGroundY !== null) {
      return { x: nearPosition.x, y: spawnGroundY, z: nearPosition.z };
    }
    
    return null;
  }

  async findGroundLevel(x, z) {
    // Start from max level and go down
    for (let y = CONFIG.SLEEP_SYSTEM.MAX_GROUND_LEVEL; y >= CONFIG.SLEEP_SYSTEM.MIN_GROUND_LEVEL; y--) {
      const blockPos = new Vec3(x, y, z);
      const blockAbovePos = new Vec3(x, y + 1, z);
      const blockBelowPos = new Vec3(x, y - 1, z);
      
      const block = this.bot.blockAt(blockPos);
      const blockAbove = this.bot.blockAt(blockAbovePos);
      const blockBelow = this.bot.blockAt(blockBelowPos);
      
      // Ground is a solid block with air above it
      if (block && this.isSolidBlock(block) && 
          blockAbove && blockAbove.name === 'air' &&
          blockBelow && this.isSolidBlock(blockBelow)) {
        return y;
      }
    }
    
    return null;
  }

  isSolidBlock(block) {
    if (!block) return false;
    
    // List of non-solid blocks
    const nonSolidBlocks = [
      'air', 'water', 'lava', 'grass', 'tall_grass', 'fern', 
      'flower', 'vine', 'snow', 'torch', 'sign', 'pressure_plate'
    ];
    
    return !nonSolidBlocks.includes(block.name);
  }

  // ================= TIME MONITORING =================
  startTimeMonitoring() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    
    this.timeUpdateInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
    
    logger.log('✅ Time monitoring started', 'time', this.botName);
  }

  updateTime() {
    try {
      if (!this.bot || !this.bot.time) {
        return;
      }
      
      // Get current Minecraft time
      const time = this.bot.time.time;
      this.state.currentTime = time;
      this.state.lastTimeCheck = Date.now();
      
      // Check if it's night (13000-23000)
      const isNight = time >= CONFIG.SLEEP_SYSTEM.NIGHT_START && time <= CONFIG.SLEEP_SYSTEM.NIGHT_END;
      const isDay = time >= CONFIG.SLEEP_SYSTEM.DAY_START && time < CONFIG.SLEEP_SYSTEM.DAY_END;
      
      // Handle time changes
      if (isNight && !this.state.isNight) {
        this.state.isNight = true;
        this.state.isDay = false;
        logger.log(`🌙 Night time detected (${time}) - Stopping activities`, 'night', this.botName);
        this.handleNightTime();
      }
      
      if (isDay && !this.state.isDay) {
        this.state.isDay = true;
        this.state.isNight = false;
        logger.log(`☀️ Day time detected (${time})`, 'day', this.botName);
        this.handleDayTime();
      }
      
      // If sleeping and it's morning, wake up
      if (this.state.isSleeping && isDay) {
        logger.log('☀️ Morning detected while sleeping - Waking up', 'day', this.botName);
        this.wakeUp();
      }
      
      // If night and not sleeping, try to sleep
      if (isNight && !this.state.isSleeping && !this.state.activitiesStopped) {
        logger.log('🌙 Night and not sleeping - Going to sleep', 'night', this.botName);
        this.handleNightTime();
      }
      
    } catch (error) {
      // Ignore time errors
    }
  }

  handleNightTime() {
    if (this.state.isSleeping) {
      logger.log('Already sleeping at night', 'sleep', this.botName);
      return;
    }
    
    // Stop all activities immediately
    this.stopAllActivities();
    this.state.activitiesStopped = true;
    
    logger.log('🌙 Night time - Stopped all activities, going to sleep', 'night', this.botName);
    
    // Try to sleep after a short delay
    setTimeout(() => {
      this.sleep();
    }, 1000);
  }

  handleDayTime() {
    if (this.state.isSleeping) {
      logger.log('Waking up for daytime', 'wake', this.botName);
      this.wakeUp();
    }
    
    // Allow activities again
    this.state.activitiesStopped = false;
    
    // Clean beds in morning
    if (this.state.alternativeBedPlaced) {
      setTimeout(() => {
        this.cleanAlternativeBed();
      }, 2000);
    }
  }

  stopAllActivities() {
    try {
      const controls = ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'];
      controls.forEach(control => {
        if (this.bot.getControlState(control)) {
          this.bot.setControlState(control, false);
        }
      });
      
      // Also stop any movement
      this.bot.clearControlStates();
      
    } catch (error) {
      // Ignore errors
    }
  }

  // ================= SLEEP SYSTEM =================
  async sleep() {
    if (this.state.isSleeping) {
      logger.log('Already sleeping', 'sleep', this.botName);
      return;
    }
    
    if (!this.state.isNight) {
      logger.log('Not night time, not sleeping', 'info', this.botName);
      return;
    }
    
    logger.log('Attempting to sleep...', 'sleep', this.botName);
    
    // First check if home bed exists
    await this.checkHomeBed();
    
    // Try sleeping in home bed
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
      if (!this.state.homeBedPosition) {
        logger.log('No home bed position', 'warn', this.botName);
        return false;
      }
      
      const bedPos = new Vec3(
        this.state.homeBedPosition.x,
        this.state.homeBedPosition.y,
        this.state.homeBedPosition.z
      );
      
      // Check if bed exists
      const bedBlock = this.bot.blockAt(bedPos);
      if (!bedBlock || !this.isBedBlock(bedBlock)) {
        logger.log('Home bed missing', 'warn', this.botName);
        return false;
      }
      
      // Check if bed is occupied
      if (this.isBedOccupied(this.state.homeBedPosition)) {
        logger.log('Home bed is occupied', 'occupied_bed', this.botName);
        return false;
      }
      
      // Walk to bed if needed
      const distance = this.bot.entity.position.distanceTo(bedPos);
      if (distance > 2) {
        logger.log(`Walking to bed (${Math.round(distance)} blocks away)`, 'sleep', this.botName);
        await this.bot.lookAt(bedPos);
        this.bot.setControlState('forward', true);
        await this.delay(Math.min(distance * 200, 1000));
        this.bot.setControlState('forward', false);
        await this.delay(500);
      }
      
      // Try to sleep
      try {
        await this.bot.sleep(bedBlock);
        this.state.isSleeping = true;
        this.state.lastSleepTime = Date.now();
        this.state.sleepCycles++;
        this.state.failedSleepAttempts = 0;
        
        logger.log(`😴 Successfully sleeping in home bed`, 'sleep', this.botName);
        return true;
      } catch (sleepError) {
        logger.log(`Sleep attempt failed: ${sleepError.message}`, 'error', this.botName);
        return false;
      }
      
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
      await this.getBedFromCreative();
      
      // Find position for alternative bed WITH GROUND CHECK
      logger.log('Finding ground for alternative bed...', 'ground_check', this.botName);
      const altPosition = await this.findAlternativeBedPositionWithGround();
      
      if (!altPosition) {
        logger.log('Could not find ground for alternative bed', 'error', this.botName);
        return;
      }
      
      logger.log(`Found ground at ${altPosition.x}, ${altPosition.y}, ${altPosition.z}`, 'ground_check', this.botName);
      
      // Place alternative bed ON GROUND (y + 1)
      const bedPosition = { x: altPosition.x, y: altPosition.y + 1, z: altPosition.z };
      
      // Check if position is suitable
      if (!await this.isSuitableForBed(bedPosition)) {
        logger.log('Alternative bed position not suitable', 'warn', this.botName);
        return;
      }
      
      const placed = await this.placeBed(bedPosition);
      if (!placed) {
        logger.log('Failed to place alternative bed', 'error', this.botName);
        return;
      }
      
      this.state.alternativeBedPlaced = true;
      this.state.alternativeBedPosition = bedPosition;
      
      logger.log(`Alternative bed placed at ${bedPosition.x}, ${bedPosition.y}, ${bedPosition.z}`, 'bed_place', this.botName);
      
      // Sleep in alternative bed
      const bedPos = new Vec3(bedPosition.x, bedPosition.y, bedPosition.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock) {
        try {
          // Walk to bed
          const distance = this.bot.entity.position.distanceTo(bedPos);
          if (distance > 2) {
            await this.bot.lookAt(bedPos);
            this.bot.setControlState('forward', true);
            await this.delay(Math.min(distance * 200, 1000));
            this.bot.setControlState('forward', false);
            await this.delay(500);
          }
          
          await this.bot.sleep(bedBlock);
          this.state.isSleeping = true;
          this.state.lastSleepTime = Date.now();
          this.state.sleepCycles++;
          this.state.failedSleepAttempts = 0;
          
          logger.log(`😴 Sleeping in alternative bed`, 'sleep', this.botName);
        } catch (sleepError) {
          logger.log(`Failed to sleep in alternative bed: ${sleepError.message}`, 'error', this.botName);
        }
      }
      
    } catch (error) {
      logger.log(`Failed to sleep with alternative bed: ${error.message}`, 'error', this.botName);
      this.state.failedSleepAttempts++;
    }
  }

  async findAlternativeBedPositionWithGround() {
    const basePos = this.state.hasHomeBed ? this.state.homeBedPosition : this.bot.entity.position;
    
    // Try positions in increasing radius
    for (let radius = 1; radius <= 5; radius++) {
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          if (x === 0 && z === 0) continue;
          
          const checkX = Math.floor(basePos.x) + x;
          const checkZ = Math.floor(basePos.z) + z;
          
          // Skip if this is home bed position
          if (this.state.hasHomeBed &&
              checkX === this.state.homeBedPosition.x &&
              checkZ === this.state.homeBedPosition.z) {
            continue;
          }
          
          // Find ground level
          const groundY = await this.findGroundLevel(checkX, checkZ);
          
          if (groundY !== null) {
            // Check if position is suitable (ground + 1 should be air)
            const bedY = groundY + 1;
            const bedPosition = { x: checkX, y: bedY, z: checkZ };
            
            if (await this.isSuitableForBed(bedPosition)) {
              return { x: checkX, y: groundY, z: checkZ };
            }
          }
        }
      }
    }
    
    return null;
  }

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
        await this.cleanAlternativeBed();
      }
      
      // Clean any other extra beds
      await this.cleanExtraBeds();
      
      // Check home bed
      await this.checkHomeBed();
      
    } catch (error) {
      logger.log(`Wake up error: ${error.message}`, 'error', this.botName);
    }
  }

  async cleanAlternativeBed() {
    if (this.state.alternativeBedPlaced && this.state.alternativeBedPosition) {
      await this.breakBed(this.state.alternativeBedPosition);
      this.state.alternativeBedPlaced = false;
      this.state.alternativeBedPosition = null;
      logger.log('Cleaned alternative bed', 'cleanup', this.botName);
    }
  }

  // ================= BED CHECKING SYSTEM =================
  startBedChecking() {
    if (this.bedCheckInterval) {
      clearInterval(this.bedCheckInterval);
    }
    
    this.bedCheckInterval = setInterval(() => {
      this.checkHomeBed();
    }, CONFIG.SLEEP_SYSTEM.CHECK_BED_INTERVAL);
    
    logger.log('✅ Bed checking system started', 'success', this.botName);
  }

  async checkHomeBed() {
    if (this.state.isCheckingBed || this.state.isReplacingBed || !this.state.hasHomeBed) {
      return;
    }
    
    this.state.isCheckingBed = true;
    this.state.lastBedCheck = Date.now();
    
    try {
      const bedPos = new Vec3(
        this.state.homeBedPosition.x,
        this.state.homeBedPosition.y,
        this.state.homeBedPosition.z
      );
      
      const bedBlock = this.bot.blockAt(bedPos);
      const isBed = bedBlock && this.isBedBlock(bedBlock);
      
      if (!isBed) {
        logger.log('🚨 Home bed is missing!', 'warn', this.botName);
        await this.replaceHomeBed();
      } else {
        // Bed exists, check if spawnpoint is set
        if (!this.state.spawnpointSet && CONFIG.FEATURES.SPAWNPOINT_PROTECTION) {
          await this.setSpawnpoint();
        }
      }
      
    } catch (error) {
      logger.log(`Bed check error: ${error.message}`, 'debug', this.botName);
    } finally {
      this.state.isCheckingBed = false;
    }
  }

  async replaceHomeBed() {
    if (this.state.isReplacingBed || !this.state.hasHomeBed) {
      return;
    }
    
    this.state.isReplacingBed = true;
    logger.log('Replacing home bed...', 'bed_place', this.botName);
    
    try {
      // Get bed from creative
      await this.getBedFromCreative();
      
      // Clean the position first
      await this.clearBedPosition(this.state.homeBedPosition);
      
      // Wait a bit
      await this.delay(CONFIG.SLEEP_SYSTEM.BED_REPLACEMENT_DELAY);
      
      // Place new bed at same position
      const placed = await this.placeBed(this.state.homeBedPosition);
      
      if (placed) {
        this.state.bedReplacements++;
        
        // Set spawnpoint again
        await this.setSpawnpoint();
        
        logger.log(`✅ Home bed replaced at ${this.state.homeBedPosition.x}, ${this.state.homeBedPosition.y}, ${this.state.homeBedPosition.z}`, 'success', this.botName);
        
        // If it's night and we're not sleeping, try to sleep
        if (this.state.isNight && !this.state.isSleeping) {
          setTimeout(() => {
            this.sleep();
          }, 2000);
        }
      } else {
        logger.log('❌ Failed to replace home bed', 'error', this.botName);
      }
      
    } catch (error) {
      logger.log(`Bed replacement error: ${error.message}`, 'error', this.botName);
    } finally {
      this.state.isReplacingBed = false;
    }
  }

  async clearBedPosition(position) {
    try {
      const bedPos = new Vec3(position.x, position.y, position.z);
      const block = this.bot.blockAt(bedPos);
      
      if (block && block.name !== 'air') {
        await this.bot.dig(block);
        await this.delay(500);
      }
    } catch (error) {
      // Ignore errors
    }
  }

  // ================= SPAWNPOINT MANAGEMENT =================
  async setSpawnpoint() {
    if (!this.state.hasHomeBed || !this.state.homeBedPosition) {
      return false;
    }
    
    try {
      const bedPos = this.state.homeBedPosition;
      this.bot.chat(`/spawnpoint ${this.bot.username} ${bedPos.x} ${bedPos.y} ${bedPos.z}`);
      
      await this.delay(1000);
      
      this.state.spawnpointSet = true;
      logger.log(`📍 Spawnpoint set to ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'spawnpoint', this.botName);
      
      return true;
    } catch (error) {
      logger.log(`Failed to set spawnpoint: ${error.message}`, 'error', this.botName);
      return false;
    }
  }

  // ================= HELPER METHODS =================
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
              return true;
            }
            
            if (distance < 1.5) {
              return true;
            }
          }
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async cleanExtraBeds() {
    if (!CONFIG.FEATURES.CLEAN_EXTRA_BEDS) return;
    
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
          await this.delay(300);
        }
      }
      
    } catch (error) {
      // Ignore errors
    }
  }

  async breakBed(position) {
    try {
      const bedPos = new Vec3(position.x, position.y, position.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock && this.isBedBlock(bedBlock)) {
        await this.bot.dig(bedBlock);
        await this.delay(500);
        return true;
      }
    } catch (error) {
      // Ignore errors
    }
    return false;
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
      return true;
    } catch (error) {
      logger.log(`Failed to get bed: ${error.message}`, 'error', this.botName);
      return false;
    }
  }

  async isSuitableForBed(position) {
    const blockPos = new Vec3(position.x, position.y, position.z);
    const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
    
    const block = this.bot.blockAt(blockPos);
    const blockBelow = this.bot.blockAt(blockBelowPos);
    
    // Check if position is suitable for bed
    if (!block || block.name !== 'air') {
      logger.log(`Position ${position.x},${position.y},${position.z} not air: ${block ? block.name : 'null'}`, 'debug', this.botName);
      return false;
    }
    
    if (!blockBelow || blockBelow.name === 'air' || 
        blockBelow.name === 'lava' || blockBelow.name === 'water') {
      logger.log(`Block below ${position.x},${position.y-1},${position.z} not solid: ${blockBelow ? blockBelow.name : 'null'}`, 'debug', this.botName);
      return false;
    }
    
    const blockAbovePos = new Vec3(position.x, position.y + 1, position.z);
    const blockAbove = this.bot.blockAt(blockAbovePos);
    if (!blockAbove || blockAbove.name !== 'air') {
      logger.log(`Block above ${position.x},${position.y+1},${position.z} not air: ${blockAbove ? blockAbove.name : 'null'}`, 'debug', this.botName);
      return false;
    }
    
    logger.log(`Position ${position.x},${position.y},${position.z} is suitable for bed`, 'debug', this.botName);
    return true;
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
      bedReplacements: this.state.bedReplacements,
      spawnpointSet: this.state.spawnpointSet,
      currentTime: this.state.currentTime,
      isNight: this.state.isNight,
      isDay: this.state.isDay,
      activitiesStopped: this.state.activitiesStopped,
      failedSleepAttempts: this.state.failedSleepAttempts,
      lastSleepTime: this.state.lastSleepTime ? 
        new Date(this.state.lastSleepTime).toLocaleTimeString() : 'Never'
    };
  }
}

// ================= ENHANCED BOT =================
class EnhancedBot {
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
      isPerformingActivity: false,
      currentActivity: null,
      activityStartTime: null,
      metrics: {
        messagesSent: 0,
        blocksPlaced: 0,
        blocksBroken: 0,
        distanceTraveled: 0,
        sleepCycles: 0,
        connectionAttempts: 0,
        bedReplacements: 0,
        activitiesPerformed: 0
      }
    };
    
    this.intervals = [];
    this.activityInterval = null;
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
        defaultChatPatterns: false,
        hideErrors: false,
        connectTimeout: CONFIG.CONNECTION.CONNECT_TIMEOUT
      });
      
      this.sleepSystem = new PerfectSleepSystem(this.bot, this.state.username);
      
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
      this.stopCurrentActivity();
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
      this.startActivitySystem();
    }, 8000);
    
    logger.log(`Bot ready!`, 'success', this.state.username);
  }

  async initializeHomeSystem() {
    if (CONFIG.FEATURES.HOME_SYSTEM) {
      const success = await this.sleepSystem.initializeHomeSystem();
      if (success && this.sleepSystem.state.homeBedPosition) {
        this.state.homeLocation = this.sleepSystem.state.homeBedPosition;
        this.state.metrics.bedReplacements = this.sleepSystem.state.bedReplacements;
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
      this.bot.chat(`/give ${this.bot.username} oak_planks 64`);
    }, 2000);
  }

  // ================= ACTIVITY SYSTEM =================
  startActivitySystem() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
    }
    
    this.activityInterval = setInterval(() => {
      this.checkAndPerformActivity();
    }, CONFIG.ACTIVITIES.ACTIVITY_INTERVAL);
    
    logger.log(`✅ Activity system started`, 'activity', this.state.username);
  }

  checkAndPerformActivity() {
    // Don't perform activities if sleeping
    if (this.state.isSleeping) {
      this.state.activity = 'Sleeping';
      return;
    }
    
    // Check sleep system status
    const sleepStatus = this.sleepSystem ? this.sleepSystem.getStatus() : { isDay: false, activitiesStopped: false };
    
    // Don't perform activities at night
    if (!sleepStatus.isDay && CONFIG.ACTIVITIES.FORCE_STOP_AT_NIGHT) {
      this.state.activity = 'Waiting for daytime';
      return;
    }
    
    // Don't perform activities if sleep system stopped them
    if (sleepStatus.activitiesStopped) {
      this.state.activity = 'Activities stopped (night)';
      return;
    }
    
    // Don't start new activity if already performing one
    if (this.state.isPerformingActivity) {
      return;
    }
    
    // Perform an activity
    this.performRandomActivity();
  }

  performRandomActivity() {
    const activities = [
      'explore',
      'look_around',
      'simple_block',
      'jump_around',
      'turn_around'
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    this.performActivity(activity);
  }

  performActivity(activityType) {
    this.state.activity = activityType;
    this.state.isPerformingActivity = true;
    this.state.currentActivity = activityType;
    this.state.activityStartTime = Date.now();
    this.state.metrics.activitiesPerformed++;
    
    logger.log(`Performing activity: ${activityType}`, 'activity', this.state.username);
    
    // Clear any existing timeout
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }
    
    switch (activityType) {
      case 'explore':
        this.performExploration();
        break;
      case 'look_around':
        this.performLooking();
        break;
      case 'simple_block':
        this.performBlockActivity();
        break;
      case 'jump_around':
        this.performJumping();
        break;
      case 'turn_around':
        this.performTurning();
        break;
    }
  }

  performExploration() {
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    this.bot.setControlState(direction, true);
    
    const duration = CONFIG.ACTIVITIES.MIN_ACTIVITY_DURATION + 
                     Math.random() * (CONFIG.ACTIVITIES.MAX_ACTIVITY_DURATION - CONFIG.ACTIVITIES.MIN_ACTIVITY_DURATION);
    
    this.activityTimeout = setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState(direction, false);
      }
      this.stopCurrentActivity();
    }, duration);
    
    // Look in random direction
    this.bot.look(Math.random() * Math.PI * 2, 0);
  }

  performLooking() {
    this.bot.look(Math.random() * Math.PI * 2, -Math.PI / 4);
    
    const duration = 2000 + Math.random() * 3000;
    
    this.activityTimeout = setTimeout(() => {
      if (this.bot) {
        this.bot.look(Math.random() * Math.PI, 0);
      }
      
      // Look again after a delay
      setTimeout(() => {
        this.stopCurrentActivity();
      }, 1000);
    }, duration);
  }

  performBlockActivity() {
    if (Math.random() < 0.5) {
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
                      this.stopCurrentActivity();
                    })
                    .catch(() => {
                      this.stopCurrentActivity();
                    });
                } else {
                  this.stopCurrentActivity();
                }
              }, 2000);
            })
            .catch(() => {
              this.stopCurrentActivity();
            });
        } else {
          this.stopCurrentActivity();
        }
      }, 500);
    } else {
      // Skip block activity this time
      this.stopCurrentActivity();
    }
  }

  performJumping() {
    this.bot.setControlState('jump', true);
    
    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState('jump', false);
      }
      
      // Jump 2-4 times
      let jumps = 2 + Math.floor(Math.random() * 3);
      let currentJump = 0;
      
      const jumpInterval = setInterval(() => {
        if (currentJump >= jumps) {
          clearInterval(jumpInterval);
          this.stopCurrentActivity();
          return;
        }
        
        if (this.bot) {
          this.bot.setControlState('jump', true);
          setTimeout(() => {
            if (this.bot) {
              this.bot.setControlState('jump', false);
            }
          }, 200);
        }
        
        currentJump++;
      }, 500);
    }, 200);
  }

  performTurning() {
    const startYaw = Math.random() * Math.PI * 2;
    this.bot.look(startYaw, 0);
    
    setTimeout(() => {
      const endYaw = Math.random() * Math.PI * 2;
      this.bot.look(endYaw, 0);
      
      setTimeout(() => {
        this.stopCurrentActivity();
      }, 1000);
    }, 1000);
  }

  stopCurrentActivity() {
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
      this.activityTimeout = null;
    }
    
    // Stop all movement
    if (this.bot) {
      const controls = ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'];
      controls.forEach(control => {
        this.bot.setControlState(control, false);
      });
    }
    
    this.state.isPerformingActivity = false;
    this.state.currentActivity = null;
    this.state.activityStartTime = null;
    
    // Set idle activity
    this.state.activity = 'Idle';
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
    
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
      this.activityTimeout = null;
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
    
    // Update sleeping status from sleep system
    this.state.isSleeping = sleepStatus.isSleeping || false;
    
    return {
      username: this.state.username,
      personality: this.config.personality,
      status: this.state.status,
      health: this.state.health,
      food: this.state.food,
      position: this.state.position,
      activity: this.state.activity,
      isSleeping: this.state.isSleeping,
      uptime: uptime,
      homeLocation: this.state.homeLocation,
      currentTime: sleepStatus.currentTime || 0,
      isDay: sleepStatus.isDay || false,
      isNight: sleepStatus.isNight || false,
      activitiesStopped: sleepStatus.activitiesStopped || false,
      metrics: {
        messages: this.state.metrics.messagesSent,
        blocksPlaced: this.state.metrics.blocksPlaced,
        blocksBroken: this.state.metrics.blocksBroken,
        sleepCycles: sleepStatus.sleepCycles || 0,
        bedReplacements: sleepStatus.bedReplacements || 0,
        activitiesPerformed: this.state.metrics.activitiesPerformed
      },
      sleepInfo: {
        hasHomeBed: sleepStatus.hasHomeBed || false,
        spawnpointSet: sleepStatus.spawnpointSet || false,
        alternativeBedPlaced: sleepStatus.alternativeBedPlaced || false,
        failedAttempts: sleepStatus.failedSleepAttempts || 0,
        bedPlacementAttempts: sleepStatus.bedPlacementAttempts || 0
      }
    };
  }
}

// ================= BOT MANAGER =================
class BotManager {
  constructor() {
    this.bots = new Map();
    this.statusInterval = null;
    this.isRunning = false;
  }
  
  async start() {
    logger.log(`\n${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log('🚀 PERFECT SLEEP SYSTEM v3.3', 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log(`Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`, 'info', 'SYSTEM');
    logger.log(`Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`, 'info', 'SYSTEM');
    logger.log(`Features: Both Bots Sleep • Fixed Bed Placement • No Night Activities`, 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'SYSTEM');
    
    this.isRunning = true;
    
    await this.delay(CONFIG.SYSTEM.INITIAL_DELAY);
    
    for (let i = 0; i < CONFIG.BOTS.length; i++) {
      const botConfig = CONFIG.BOTS[i];
      const bot = new EnhancedBot(botConfig, i);
      this.bots.set(botConfig.id, bot);
      
      if (i > 0) {
        await this.delay(CONFIG.SYSTEM.BOT_DELAY);
      }
      
      bot.connect().catch(error => {
        logger.log(`Bot ${botConfig.name} failed: ${error.message}`, 'error', 'SYSTEM');
      });
    }
    
    this.startStatusMonitoring();
    
    logger.log(`\n✅ Both bots scheduled!`, 'success', 'SYSTEM');
    logger.log(`📊 Status updates every ${CONFIG.SYSTEM.STATUS_INTERVAL / 1000} seconds`, 'info', 'SYSTEM');
    logger.log(`🌐 Web interface on port ${CONFIG.SYSTEM.PORT}\n`, 'info', 'SYSTEM');
    
    logger.log(`🎯 FIXED FOR NIGHTWATCHER:`, 'info', 'SYSTEM');
    logger.log(`   🛏️ Same sleep logic as SleepMaster`, 'sleep', 'SYSTEM');
    logger.log(`   🌍 Ground checking for bed placement`, 'ground_check', 'SYSTEM');
    logger.log(`   🚫 No activities at night`, 'night', 'SYSTEM');
    logger.log(`   🔄 Perfect sleep cycle`, 'success', 'SYSTEM');
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
    
    const totalBedReplacements = connectedBots
      .reduce((total, bot) => total + (bot.state.metrics.bedReplacements || 0), 0);
    
    const totalActivities = connectedBots
      .reduce((total, bot) => total + (bot.state.metrics.activitiesPerformed || 0), 0);
    
    // Get time info from first connected bot
    let timeInfo = 'Unknown';
    let isDay = false;
    let isNight = false;
    
    if (connectedBots.length > 0) {
      const status = connectedBots[0].getStatus();
      timeInfo = `Time: ${status.currentTime}`;
      isDay = status.isDay || false;
      isNight = status.isNight || false;
    }
    
    const timeIcon = isNight ? '🌙' : isDay ? '☀️' : '⏰';
    const timeStatus = isNight ? 'NIGHT (Should sleep)' : isDay ? 'DAY (Activities)' : 'UNKNOWN';
    
    logger.log(`\n${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`📊 PERFECT SLEEP STATUS - ${new Date().toLocaleTimeString()}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`${timeIcon} ${timeStatus} | ${timeInfo}`, 'time', 'STATUS');
    logger.log(`Connected: ${connectedBots.length}/${this.bots.size}`, 'info', 'STATUS');
    logger.log(`Sleeping: ${sleepingBots.length} (Both should sleep at night)`, 'info', 'STATUS');
    logger.log(`With Home Bed: ${hasHomeBed}`, 'info', 'STATUS');
    logger.log(`Bed Replacements: ${totalBedReplacements}`, 'info', 'STATUS');
    logger.log(`Both Bots Same Logic: ✅ YES`, 'info', 'STATUS');
    logger.log(`Ground Bed Placement: ✅ FIXED`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    
    connectedBots.forEach(bot => {
      const status = bot.getStatus();
      const sleepIcon = status.isSleeping ? '💤' : '☀️';
      const bedIcon = status.sleepInfo?.hasHomeBed ? '🛏️' : '❌';
      const timeIcon = status.isNight ? '🌙' : status.isDay ? '☀️' : '⏰';
      const shouldSleep = status.isNight && !status.isSleeping ? '🚨 SHOULD SLEEP' : '';
      
      logger.log(`${sleepIcon} ${status.username} (${status.personality}) ${timeIcon} ${shouldSleep}`, 'info', 'STATUS');
      logger.log(`  Activity: ${status.activity} | Time: ${status.currentTime}`, 'info', 'STATUS');
      logger.log(`  Position: ${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}`, 'info', 'STATUS');
      logger.log(`  Home: ${status.homeLocation ? `${status.homeLocation.x}, ${status.homeLocation.y}, ${status.homeLocation.z}` : 'Not set'}`, 'info', 'STATUS');
      logger.log(`  Bed: ${bedIcon} | Sleeps: ${status.metrics.sleepCycles} | Failed: ${status.sleepInfo?.failedAttempts || 0}`, 'info', 'STATUS');
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
    logger.log('\n🛑 Stopping system...', 'info', 'SYSTEM');
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

// ================= WEB SERVER =================
function createWebServer(botManager) {
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    
    if (url === '/' || url === '') {
      const statuses = botManager.getAllStatuses();
      const connected = Object.values(statuses).filter(s => s.status === 'connected').length;
      const sleeping = Object.values(statuses).filter(s => s.isSleeping).length;
      const hasHomeBed = Object.values(statuses).filter(s => s.homeLocation).length;
      const totalSleepCycles = Object.values(statuses).reduce((total, s) => total + (s.metrics.sleepCycles || 0), 0);
      const totalBedReplacements = Object.values(statuses).reduce((total, s) => total + (s.metrics.bedReplacements || 0), 0);
      const totalActivities = Object.values(statuses).reduce((total, s) => total + (s.metrics.activitiesPerformed || 0), 0);
      
      // Get time from first bot
      let currentTime = 0;
      let isDay = false;
      let isNight = false;
      const firstBot = Object.values(statuses).find(s => s.status === 'connected');
      if (firstBot) {
        currentTime = firstBot.currentTime || 0;
        isDay = firstBot.isDay || false;
        isNight = firstBot.isNight || false;
      }
      
      const timeStatus = isNight ? '🌙 NIGHT (Both should sleep)' : isDay ? '☀️ DAY (Activities)' : '⏰ UNKNOWN';
      const shouldSleep = isNight && sleeping < connected ? '🚨 Some bots not sleeping!' : '';
      
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
    <title>Perfect Sleep System v3.3</title>
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
            border: 1px solid rgba(0, 255, 136, 0.3);
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
        .time-display {
            background: ${isNight ? 'rgba(0, 204, 255, 0.2)' : 'rgba(255, 170, 0, 0.2)'};
            padding: 10px;
            border-radius: 10px;
            margin: 10px 0;
            font-size: 1.2rem;
            border: 1px solid ${isNight ? 'rgba(0, 204, 255, 0.3)' : 'rgba(255, 170, 0, 0.3)'};
        }
        .warning {
            background: rgba(255, 51, 51, 0.2);
            padding: 10px;
            border-radius: 10px;
            margin: 10px 0;
            border: 1px solid rgba(255, 51, 51, 0.3);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 10px rgba(255, 51, 51, 0.3); }
            50% { box-shadow: 0 0 15px rgba(255, 51, 51, 0.5); }
            100% { box-shadow: 0 0 10px rgba(255, 51, 51, 0.3); }
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
        .stat-label {
            font-size: 0.9rem;
            color: #aaa;
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
            transition: all 0.3s;
        }
        .bot-card.sleeping {
            border-color: #00ccff;
            box-shadow: 0 0 10px rgba(0, 204, 255, 0.3);
        }
        .bot-card.day-active {
            border-color: #ffaa00;
            box-shadow: 0 0 10px rgba(255, 170, 0, 0.3);
        }
        .bot-card.should-sleep {
            border-color: #ff3333;
            box-shadow: 0 0 10px rgba(255, 51, 51, 0.3);
            animation: pulse 2s infinite;
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
        .active { background: rgba(255, 170, 0, 0.2); color: #ffaa00; }
        .should-sleep { background: rgba(255, 51, 51, 0.2); color: #ff3333; }
        
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
        
        .sleep-status {
            margin-top: 10px;
            padding: 10px;
            border-radius: 5px;
            font-size: 0.9rem;
            text-align: center;
        }
        .sleeping-status { background: rgba(0, 204, 255, 0.1); border: 1px solid rgba(0, 204, 255, 0.3); }
        .should-sleep-status { background: rgba(255, 51, 51, 0.1); border: 1px solid rgba(255, 51, 51, 0.3); }
        .awake-status { background: rgba(255, 170, 0, 0.1); border: 1px solid rgba(255, 170, 0, 0.3); }
        
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
            border: 1px solid rgba(0, 255, 136, 0.3);
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
            <h1>😴 Perfect Sleep System <span class="version">v3.3</span></h1>
            <p>Both Bots Sleep • Fixed Ground Placement • No Night Activities</p>
            
            <div class="time-display">
                ${timeStatus} | Time: ${currentTime} ticks
            </div>
            
            ${shouldSleep ? `
            <div class="warning">
                ${shouldSleep}
            </div>
            ` : ''}
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-label">Connected Bots</div>
                    <div class="stat-value">${connected}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Sleeping</div>
                    <div class="stat-value">${sleeping}</div>
                    <div class="stat-label">${sleeping}/${connected} sleeping</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">With Home Bed</div>
                    <div class="stat-value">${hasHomeBed}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Sleep Cycles</div>
                    <div class="stat-value">${totalSleepCycles}</div>
                </div>
            </div>
        </div>
        
        <h2 style="margin-bottom: 15px;">🤖 Bot Status</h2>
        <div class="bots-grid">
            ${Object.entries(statuses).map(([id, status]) => {
              const isSleeping = status.isSleeping || false;
              const isDaytime = status.isDay || false;
              const isNighttime = status.isNight || false;
              const shouldSleepNow = isNighttime && !isSleeping;
              
              return `
            <div class="bot-card ${isSleeping ? 'sleeping' : shouldSleepNow ? 'should-sleep' : isDaytime ? 'day-active' : ''}">
                <div class="bot-header">
                    <div class="bot-name">${status.username}</div>
                    <div class="bot-status ${isSleeping ? 'sleeping' : shouldSleepNow ? 'should-sleep' : isDaytime ? 'active' : 'connected'}">
                        ${isSleeping ? '💤 SLEEPING' : shouldSleepNow ? '🚨 SHOULD SLEEP' : isDaytime ? '🎯 ACTIVE' : '⏰ WAITING'}
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
                        <div class="info-label">Time</div>
                        <div class="info-value">${status.currentTime}</div>
                    </div>
                </div>
                
                <div class="sleep-status ${isSleeping ? 'sleeping-status' : shouldSleepNow ? 'should-sleep-status' : 'awake-status'}">
                    ${isSleeping ? '😴 Sleeping well' : shouldSleepNow ? '🚨 Should be sleeping! (Night time)' : isDaytime ? '☀️ Day time - Activities OK' : '⏰ Unknown time'}
                </div>
                
                <div style="margin-top: 10px; font-size: 0.9rem; color: #aaa;">
                    Sleeps: ${status.metrics.sleepCycles} | 
                    Bed Rep: ${status.metrics.bedReplacements} | 
                    Failed: ${status.sleepInfo?.failedAttempts || 0}
                </div>
            </div>
            `}).join('')}
        </div>
        
        <div class="features">
            <h2>⚡ Fixed for NightWatcher</h2>
            <div class="features-grid">
                <div class="feature">🛏️ Same Sleep Logic</div>
                <div class="feature">🌍 Ground Checking</div>
                <div class="feature">🚫 No Night Activities</div>
                <div class="feature">😴 Auto Sleep at Night</div>
                <div class="feature">📍 Auto Spawnpoint</div>
                <div class="feature">🔍 Bed Monitoring</div>
                <div class="feature">🚨 Auto Replacement</div>
                <div class="feature">🧹 Clean Extra Beds</div>
            </div>
        </div>
        
        <div class="footer">
            <p>✅ Both bots use SAME sleep logic • Bed placement on GROUND only • No activities at night</p>
            <p>✅ Night (13000-23000): Both sleep • Day (0-13000): Activities • Auto bed replacement</p>
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
        version: '3.3',
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
    logger.log('🚀 Starting Perfect Sleep System v3.3...', 'info', 'SYSTEM');
    logger.log('✅ Both bots sleep • Fixed ground placement • No night activities', 'success', 'SYSTEM');
    
    const botManager = new BotManager();
    
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
    
    logger.log('\n🎯 FIXED FOR BOTH BOTS:', 'info', 'SYSTEM');
    logger.log('   1. 🛏️ Same sleep system for both bots', 'sleep', 'SYSTEM');
    logger.log('   2. 🌍 Ground checking before bed placement', 'ground_check', 'SYSTEM');
    logger.log('   3. 🚫 No activities at night (13000-23000)', 'night', 'SYSTEM');
    logger.log('   4. 😴 Auto sleep when night detected', 'sleep', 'SYSTEM');
    logger.log('   5. ☀️ Activities only during day (0-13000)', 'day', 'SYSTEM');
    logger.log('   6. ✅ Both should sleep perfectly!', 'success', 'SYSTEM');
    
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
