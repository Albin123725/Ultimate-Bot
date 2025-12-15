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
      sleepPattern: 'normal',
      homeLocation: null,
      buildStyle: 'modern'
    },
    {
      id: 'bot_002',
      name: 'CreativeExplorer',
      personality: 'explorer',
      color: '§b',
      activities: ['exploring', 'mapping', 'discovering', 'adventuring'],
      sleepPattern: 'normal',
      homeLocation: null,
      buildStyle: 'simple'
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
    ERROR_HANDLING: true,
    AUTO_BED_BREAKING: true,
    HOME_SYSTEM: true,
    RETURN_TO_HOME: true,
    BUILDING_SYSTEM: true,
    CRASH_PROTECTION: true
  },
  SLEEP_SYSTEM: {
    BREAK_BED_AFTER_SLEEP: true,
    BREAK_DELAY: 2000,
    BREAK_TIMEOUT: 10000,
    KEEP_BED_IF_PLAYER_NEARBY: false,
    BREAK_METHOD: 'dig',
    KEEP_HOME_BED: true
  },
  BUILDING: {
    BLOCK_PLACEMENT_TIMEOUT: 8000,
    MAX_BUILD_DISTANCE: 15,
    BUILDING_BLOCKS: [
      'stone',
      'oak_planks',
      'spruce_planks',
      'birch_planks',
      'glass',
      'glowstone',
      'diamond_block',
      'gold_block',
      'iron_block',
      'bricks',
      'cobblestone',
      'stone_bricks'
    ],
    DECORATION_BLOCKS: [
      'torch',
      'lantern',
      'flower_pot',
      'chest',
      'crafting_table',
      'furnace'
    ]
  },
  HOME: {
    SET_SPAWN_AS_HOME: true,
    HOME_RADIUS: 20,
    HOME_RETURN_DISTANCE: 50,
    HOME_BED_POSITION: { x: 0, y: 65, z: 0 },
    MARK_HOME_WITH_TORCHES: true
  }
};

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
      building: '🏗️',
      travel: '🗺️'
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

// ================= ENHANCED PERFECT SLEEP SYSTEM =================
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
      bedPlacements: 0,
      failedSleepAttempts: 0,
      bedsBroken: 0,
      lastBedBreakTime: null,
      isBreakingBed: false,
      homeBedPosition: null,
      hasHomeBed: false,
      returningHome: false
    };
    
    this.bedBreakingInterval = null;
    this.wakeCheckInterval = null;
    this.returnHomeTimeout = null;
  }

  // ================= NEW: HOME SYSTEM =================
  async initializeHomeSystem() {
    if (!CONFIG.FEATURES.HOME_SYSTEM || !this.bot.entity) return;
    
    try {
      // Set spawn point as home
      if (CONFIG.HOME.SET_SPAWN_AS_HOME) {
        const spawnPos = this.bot.entity.position;
        this.state.homeBedPosition = {
          x: Math.floor(spawnPos.x),
          y: Math.floor(spawnPos.y),
          z: Math.floor(spawnPos.z)
        };
        
        logger.log(`Home location set at ${this.state.homeBedPosition.x}, ${this.state.homeBedPosition.y}, ${this.state.homeBedPosition.z}`, 'home', this.botName);
        
        // Place permanent bed at home
        await this.placeHomeBed();
        
        // Mark home with torches if enabled
        if (CONFIG.HOME.MARK_HOME_WITH_TORCHES) {
          await this.markHomeLocation();
        }
      }
    } catch (error) {
      logger.log(`Home system initialization failed: ${error.message}`, 'error', this.botName);
    }
  }

  async placeHomeBed() {
    try {
      if (this.state.hasHomeBed) {
        logger.log('Home bed already placed', 'home', this.botName);
        return true;
      }
      
      // Get bed from creative
      await this.getBedFromCreative();
      
      // Find good position for bed near home
      const bedPos = await this.findBedPlacementNearHome();
      if (!bedPos) {
        logger.log('Could not find position for home bed', 'warn', this.botName);
        return false;
      }
      
      // Place bed with timeout protection
      const placed = await this.safePlaceBed(bedPos);
      if (placed) {
        this.state.homeBedPosition = bedPos;
        this.state.hasHomeBed = true;
        this.state.bedInInventory = false;
        
        logger.log(`Home bed placed at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'success', this.botName);
        
        // Set this as the spawn point
        this.bot.chat(`/spawnpoint ${this.bot.username} ${bedPos.x} ${bedPos.y} ${bedPos.z}`);
        logger.log('Spawn point set to home bed', 'home', this.botName);
        
        return true;
      }
    } catch (error) {
      logger.log(`Failed to place home bed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async findBedPlacementNearHome() {
    if (!this.state.homeBedPosition) return null;
    
    const homePos = this.state.homeBedPosition;
    
    // Try positions around home location
    const positions = [
      { x: homePos.x, y: homePos.y, z: homePos.z },
      { x: homePos.x + 1, y: homePos.y, z: homePos.z },
      { x: homePos.x, y: homePos.y, z: homePos.z + 1 },
      { x: homePos.x - 1, y: homePos.y, z: homePos.z },
      { x: homePos.x, y: homePos.y, z: homePos.z - 1 },
      { x: homePos.x + 2, y: homePos.y, z: homePos.z },
      { x: homePos.x, y: homePos.y, z: homePos.z + 2 }
    ];
    
    for (const position of positions) {
      const blockPos = new Vec3(position.x, position.y, position.z);
      const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
      
      const block = this.bot.blockAt(blockPos);
      const blockBelow = this.bot.blockAt(blockBelowPos);
      
      if (block && block.name === 'air' && 
          blockBelow && blockBelow.name !== 'air' && 
          blockBelow.name !== 'lava' && blockBelow.name !== 'water') {
        return position;
      }
    }
    
    return null;
  }

  async markHomeLocation() {
    try {
      if (!this.state.homeBedPosition) return;
      
      const homePos = this.state.homeBedPosition;
      
      // Place torches around home
      const torchPositions = [
        { x: homePos.x + 1, y: homePos.y + 1, z: homePos.z },
        { x: homePos.x - 1, y: homePos.y + 1, z: homePos.z },
        { x: homePos.x, y: homePos.y + 1, z: homePos.z + 1 },
        { x: homePos.x, y: homePos.y + 1, z: homePos.z - 1 }
      ];
      
      for (const position of torchPositions) {
        const torchPos = new Vec3(position.x, position.y, position.z);
        const block = this.bot.blockAt(torchPos);
        
        if (block && block.name === 'air') {
          this.bot.chat(`/give ${this.bot.username} torch 64`);
          await this.delay(500);
          
          await this.safePlaceBlock(torchPos, 'torch');
          await this.delay(200);
        }
      }
      
      logger.log('Home marked with torches', 'home', this.botName);
    } catch (error) {
      // Ignore errors in decoration
    }
  }

  // ================= ENHANCED SLEEP SYSTEM WITH HOME RETURN =================
  checkTimeAndSleep() {
    if (!this.bot || !this.bot.time || !CONFIG.FEATURES.AUTO_SLEEP) return;
    
    const time = this.bot.time.time;
    const isNight = time >= 13000 && time <= 23000;
    
    if (this.bot.isSleeping !== undefined) {
      this.state.isSleeping = this.bot.isSleeping;
    }
    
    if (isNight && !this.state.isSleeping) {
      // Check if we should return home first
      if (CONFIG.FEATURES.RETURN_TO_HOME && this.state.hasHomeBed) {
        const distanceFromHome = this.getDistanceFromHome();
        
        if (distanceFromHome > CONFIG.HOME.HOME_RETURN_DISTANCE) {
          logger.log(`Night time and far from home (${Math.round(distanceFromHome)} blocks) - Returning home`, 'travel', this.botName);
          this.returnHomeAndSleep();
          return;
        }
      }
      
      logger.log(`Night time detected (${time}) - Sleeping immediately`, 'night', this.botName);
      this.sleepImmediately();
    } else if (!isNight && this.state.isSleeping) {
      logger.log(`Morning detected (${time}) - Waking up`, 'day', this.botName);
      this.wakeAndCleanup();
    }
  }

  getDistanceFromHome() {
    if (!this.state.homeBedPosition || !this.bot.entity) return 0;
    
    const botPos = this.bot.entity.position;
    const homePos = this.state.homeBedPosition;
    
    return Math.sqrt(
      Math.pow(botPos.x - homePos.x, 2) +
      Math.pow(botPos.y - homePos.y, 2) +
      Math.pow(botPos.z - homePos.z, 2)
    );
  }

  async returnHomeAndSleep() {
    if (this.state.returningHome) return;
    
    this.state.returningHome = true;
    logger.log('Starting journey back home', 'travel', this.botName);
    
    try {
      // Stop current activities
      this.stopAllActivities();
      
      // Navigate to home
      await this.navigateToHome();
      
      // Sleep at home
      await this.sleepAtHome();
      
    } catch (error) {
      logger.log(`Failed to return home: ${error.message}`, 'error', this.botName);
      // Fall back to regular sleep
      await this.sleepImmediately();
    } finally {
      this.state.returningHome = false;
    }
  }

  async navigateToHome() {
    if (!this.state.homeBedPosition || !this.bot.entity) return;
    
    const homePos = this.state.homeBedPosition;
    const botPos = this.bot.entity.position;
    
    logger.log(`Navigating to home at ${homePos.x}, ${homePos.y}, ${homePos.z}`, 'travel', this.botName);
    
    // Simple pathfinding: look at home and move forward
    const targetVec = new Vec3(homePos.x, homePos.y, homePos.z);
    await this.bot.lookAt(targetVec);
    
    // Move toward home
    this.bot.setControlState('forward', true);
    
    // Check distance periodically
    const checkInterval = setInterval(() => {
      if (!this.bot.entity) {
        clearInterval(checkInterval);
        return;
      }
      
      const currentPos = this.bot.entity.position;
      const distance = currentPos.distanceTo(targetVec);
      
      if (distance < 3) {
        // Close enough to home
        clearInterval(checkInterval);
        this.bot.setControlState('forward', false);
        logger.log('Arrived at home!', 'success', this.botName);
      }
    }, 1000);
    
    // Timeout after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      this.bot.setControlState('forward', false);
      logger.log('Navigation timeout, continuing with sleep', 'warn', this.botName);
    }, 30000);
    
    await this.delay(30000); // Wait for navigation
  }

  async sleepAtHome() {
    if (!this.state.hasHomeBed || !this.state.homeBedPosition) {
      logger.log('No home bed found, placing one', 'warn', this.botName);
      await this.placeHomeBed();
    }
    
    // Sleep in home bed
    const bedPos = this.state.homeBedPosition;
    const bedBlock = this.bot.blockAt(new Vec3(bedPos.x, bedPos.y, bedPos.z));
    
    if (bedBlock && this.isBedBlock(bedBlock)) {
      await this.sleepInBed(bedBlock);
    } else {
      logger.log('Home bed not found, placing new one', 'warn', this.botName);
      await this.placeBedAndSleep();
    }
  }

  // ================= CRASH PROTECTION METHODS =================
  async safePlaceBed(position) {
    try {
      this.bot.setQuickBarSlot(0);
      
      const lookPos = new Vec3(position.x, position.y, position.z);
      await this.bot.lookAt(lookPos);
      
      const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
      const referenceBlock = this.bot.blockAt(blockBelowPos);
      
      if (referenceBlock) {
        const offset = new Vec3(0, 1, 0);
        
        // Use safe placement with timeout
        return await this.safePlaceBlockWithTimeout(referenceBlock, offset, 'bed');
      }
    } catch (error) {
      logger.log(`Safe bed placement failed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async safePlaceBlockWithTimeout(block, offset, blockType = '') {
    if (!CONFIG.FEATURES.CRASH_PROTECTION) {
      try {
        await this.bot.placeBlock(block, offset);
        return true;
      } catch (error) {
        logger.log(`Block placement failed: ${error.message}`, 'error', this.botName);
        return false;
      }
    }
    
    // With timeout protection
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logger.log(`Block placement timeout for ${blockType} - Skipping`, 'warn', this.botName);
        resolve(false);
      }, CONFIG.BUILDING.BLOCK_PLACEMENT_TIMEOUT);
      
      this.bot.placeBlock(block, offset)
        .then(() => {
          clearTimeout(timeout);
          resolve(true);
        })
        .catch((error) => {
          clearTimeout(timeout);
          logger.log(`Block placement failed: ${error.message}`, 'debug', this.botName);
          resolve(false);
        });
    });
  }

  async safePlaceBlock(position, blockType) {
    try {
      const blockPos = new Vec3(position.x, position.y, position.z);
      const block = this.bot.blockAt(blockPos);
      
      if (block && block.name === 'air') {
        // Give block first
        this.bot.chat(`/give ${this.bot.username} ${blockType} 1`);
        await this.delay(500);
        
        // Find block below for placement
        const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
        const referenceBlock = this.bot.blockAt(blockBelowPos);
        
        if (referenceBlock) {
          const offset = new Vec3(0, 1, 0);
          return await this.safePlaceBlockWithTimeout(referenceBlock, offset, blockType);
        }
      }
    } catch (error) {
      logger.log(`Safe block placement failed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async safeDigWithTimeout(block) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logger.log('Digging timeout - Skipping', 'warn', this.botName);
        resolve(false);
      }, 8000);
      
      this.bot.dig(block)
        .then(() => {
          clearTimeout(timeout);
          setTimeout(() => resolve(true), 1000);
        })
        .catch((error) => {
          clearTimeout(timeout);
          logger.log(`Digging failed: ${error.message}`, 'debug', this.botName);
          resolve(false);
        });
    });
  }

  // ================= EXISTING METHODS (ENHANCED) =================
  async sleepImmediately() {
    if (this.state.isSleeping) return;
    
    logger.log('Initiating immediate sleep sequence', 'sleep', this.botName);
    
    this.stopAllActivities();
    
    // Check for existing bed
    const existingBed = await this.findNearbyBed();
    
    if (existingBed) {
      await this.sleepInBed(existingBed);
    } else {
      await this.placeBedAndSleep();
    }
  }

  async findNearbyBed() {
    try {
      const beds = this.bot.findBlocks({
        matching: block => {
          if (!block) return false;
          const name = this.bot.registry.blocks[block.type]?.name;
          return name && name.includes('bed');
        },
        maxDistance: 10,
        count: 1
      });
      
      if (beds && beds.length > 0) {
        const bedPos = beds[0];
        logger.log(`Found nearby bed at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'info', this.botName);
        
        const bedBlock = this.bot.blockAt(new Vec3(bedPos.x, bedPos.y, bedPos.z));
        return bedBlock;
      }
      
      return null;
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
      this.state.failedSleepAttempts++;
      
      if (this.state.failedSleepAttempts < 3) {
        await this.delay(2000);
        await this.tryDirectSleep();
      }
      return;
    }
    
    // Use safe placement
    const placed = await this.safePlaceBed(bedPos);
    if (placed) {
      this.state.hasBedPlaced = true;
      this.state.bedPosition = bedPos;
      this.state.bedInInventory = false;
      this.state.bedPlacements++;
      this.state.failedSleepAttempts = 0;
      
      logger.log(`Bed placed successfully at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'success', this.botName);
      
      await this.sleepInPlacedBed(bedPos);
    } else {
      this.state.failedSleepAttempts++;
      logger.log('Failed to place bed, trying direct sleep', 'warn', this.botName);
      await this.tryDirectSleep();
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
        
        const blockPos = new Vec3(checkX, checkY, checkZ);
        const blockBelowPos = new Vec3(checkX, checkY - 1, checkZ);
        
        const block = this.bot.blockAt(blockPos);
        const blockBelow = this.bot.blockAt(blockBelowPos);
        
        if (block && block.name === 'air' && 
            blockBelow && blockBelow.name !== 'air' && 
            blockBelow.name !== 'lava' && blockBelow.name !== 'water' &&
            blockBelow.name !== 'bed') {
          return { x: checkX, y: checkY, z: checkZ };
        }
      }
    }
    
    return null;
  }

  async tryDirectSleep() {
    try {
      logger.log('Attempting direct sleep without bed', 'info', this.botName);
      
      const pos = this.bot.entity.position;
      const floorPos = new Vec3(Math.floor(pos.x), Math.floor(pos.y) - 1, Math.floor(pos.z));
      const floorBlock = this.bot.blockAt(floorPos);
      
      if (floorBlock && floorBlock.name !== 'air') {
        await this.bot.sleep(floorBlock);
        this.state.isSleeping = true;
        this.state.lastSleepTime = Date.now();
        logger.log('Direct sleep successful', 'sleep', this.botName);
      }
    } catch (error) {
      logger.log(`Direct sleep failed: ${error.message}`, 'warn', this.botName);
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

  async sleepInPlacedBed(bedPosition) {
    try {
      const bedPos = new Vec3(bedPosition.x, bedPosition.y, bedPosition.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock && this.isBedBlock(bedBlock)) {
        await this.sleepInBed(bedBlock);
        return true;
      }
    } catch (error) {
      logger.log(`Failed to sleep in placed bed: ${error.message}`, 'error', this.botName);
    }
    return false;
  }

  isBedBlock(block) {
    if (!block) return false;
    const name = this.bot.registry.blocks[block.type]?.name;
    return name && name.includes('bed');
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
      
      this.startMorningMonitor();
      
      setTimeout(() => {
        if (this.state.isSleeping && this.bot && this.bot.isSleeping) {
          this.wakeAndCleanup();
        }
      }, 45000);
      
    } catch (error) {
      logger.log(`Sleep attempt failed: ${error.message}`, 'error', this.botName);
      this.state.isSleeping = false;
      this.state.failedSleepAttempts++;
      
      if (this.state.failedSleepAttempts < 2) {
        await this.delay(1000);
        await this.tryDirectSleep();
      }
    }
  }

  startMorningMonitor() {
    if (this.wakeCheckInterval) {
      clearInterval(this.wakeCheckInterval);
    }
    
    this.wakeCheckInterval = setInterval(() => {
      if (!this.bot || !this.bot.time) return;
      
      const time = this.bot.time.time;
      const isMorning = time >= 0 && time < 13000;
      
      if (isMorning && this.state.isSleeping) {
        logger.log('Morning detected while sleeping - Waking up to break bed', 'day', this.botName);
        this.wakeAndBreakBed();
        clearInterval(this.wakeCheckInterval);
      }
    }, 5000);
  }

  async wakeAndBreakBed() {
    try {
      if (this.bot.isSleeping) {
        this.bot.wake();
        await this.delay(1000);
      }
      
      this.state.isSleeping = false;
      logger.log('Successfully woke up', 'wake', this.botName);
      
      await this.delay(CONFIG.SLEEP_SYSTEM.BREAK_DELAY);
      
      // Don't break home bed if configured to keep it
      if (this.state.hasHomeBed && this.state.bedPosition && 
          this.state.bedPosition.x === this.state.homeBedPosition.x &&
          this.state.bedPosition.y === this.state.homeBedPosition.y &&
          this.state.bedPosition.z === this.state.homeBedPosition.z &&
          CONFIG.SLEEP_SYSTEM.KEEP_HOME_BED) {
        logger.log('Keeping home bed', 'home', this.botName);
      } else if (CONFIG.FEATURES.BED_MANAGEMENT && this.state.hasBedPlaced && this.state.bedPosition) {
        await this.autoBreakBed();
      } else {
        await this.findAndBreakNearbyBed();
      }
      
    } catch (error) {
      logger.log(`Wake/break bed error: ${error.message}`, 'error', this.botName);
    }
  }

  async autoBreakBed() {
    if (!CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP) {
      logger.log('Auto-bed breaking disabled in config', 'info', this.botName);
      return;
    }
    
    if (this.state.isBreakingBed) {
      logger.log('Already breaking bed', 'debug', this.botName);
      return;
    }
    
    this.state.isBreakingBed = true;
    
    try {
      logger.log('Starting auto-bed breaking process', 'bed_break', this.botName);
      
      if (CONFIG.SLEEP_SYSTEM.KEEP_BED_IF_PLAYER_NEARBY && this.arePlayersNearby()) {
        logger.log('Players nearby, keeping bed for them', 'info', this.botName);
        this.resetState();
        return;
      }
      
      const success = await this.breakBedAtPosition(this.state.bedPosition);
      
      if (success) {
        this.state.bedsBroken++;
        this.state.lastBedBreakTime = Date.now();
        logger.log(`✅ Auto-bed breaking successful! Beds broken: ${this.state.bedsBroken}`, 'success', this.botName);
      } else {
        logger.log('Failed to break bed, trying alternative methods', 'warn', this.botName);
        await this.tryAlternativeBedBreaking();
      }
      
      this.resetState();
      
    } catch (error) {
      logger.log(`Auto-bed breaking error: ${error.message}`, 'error', this.botName);
      this.state.isBreakingBed = false;
    }
  }

  async breakBedAtPosition(position) {
    try {
      const bedPos = new Vec3(position.x, position.y, position.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock && this.isBedBlock(bedBlock)) {
        logger.log(`Breaking bed at ${position.x}, ${position.y}, ${position.z}`, 'bed_break', this.botName);
        
        await this.bot.lookAt(bedPos);
        await this.delay(500);
        
        // Use safe digging with timeout
        return await this.safeDigWithTimeout(bedBlock);
      } else {
        logger.log('No bed found at expected position', 'warn', this.botName);
      }
    } catch (error) {
      logger.log(`Failed to break bed at position: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async findAndBreakNearbyBed() {
    try {
      logger.log('Searching for nearby bed to break', 'bed_break', this.botName);
      
      const beds = this.bot.findBlocks({
        matching: block => {
          if (!block) return false;
          const name = this.bot.registry.blocks[block.type]?.name;
          return name && name.includes('bed');
        },
        maxDistance: 5,
        count: 5
      });
      
      if (beds && beds.length > 0) {
        logger.log(`Found ${beds.length} nearby beds`, 'info', this.botName);
        
        for (const bedPos of beds) {
          const position = { x: bedPos.x, y: bedPos.y, z: bedPos.z };
          const success = await this.breakBedAtPosition(position);
          
          if (success) {
            this.state.bedsBroken++;
            this.state.lastBedBreakTime = Date.now();
            break;
          }
        }
      } else {
        logger.log('No nearby beds found to break', 'info', this.botName);
      }
    } catch (error) {
      logger.log(`Error finding nearby beds: ${error.message}`, 'error', this.botName);
    }
  }

  async tryAlternativeBedBreaking() {
    logger.log('Trying alternative bed breaking methods', 'bed_break', this.botName);
    
    try {
      this.bot.chat(`/setblock ${this.state.bedPosition.x} ${this.state.bedPosition.y} ${this.state.bedPosition.z} air`);
      await this.delay(2000);
      logger.log('Used creative command to remove bed', 'success', this.botName);
      return true;
    } catch (error) {
      logger.log('Creative command failed', 'debug', this.botName);
    }
    
    try {
      this.bot.swingArm();
      await this.delay(300);
      this.bot.swingArm();
      await this.delay(300);
      this.bot.swingArm();
      logger.log('Simulated breaking bed with arm swings', 'info', this.botName);
    } catch (error) {
      // Ignore errors
    }
    
    return false;
  }

  arePlayersNearby() {
    try {
      const players = Object.values(this.bot.players);
      const botPos = this.bot.entity.position;
      
      for (const player of players) {
        if (player.username !== this.bot.username) {
          const distance = botPos.distanceTo(player.entity.position);
          if (distance < 10) {
            return true;
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return false;
  }

  resetState() {
    this.state.hasBedPlaced = false;
    this.state.bedPosition = null;
    this.state.bedInInventory = true;
    this.state.failedSleepAttempts = 0;
    this.state.isBreakingBed = false;
    
    if (this.bedBreakingInterval) {
      clearInterval(this.bedBreakingInterval);
      this.bedBreakingInterval = null;
    }
    
    if (this.wakeCheckInterval) {
      clearInterval(this.wakeCheckInterval);
      this.wakeCheckInterval = null;
    }
    
    logger.log('Sleep system state reset', 'cleanup', this.botName);
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
        if (CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP) {
          await this.autoBreakBed();
        } else {
          await this.breakBed(this.state.bedPosition);
        }
      }
      
      this.resetState();
      
      logger.log(`Bed management completed`, 'success', this.botName);
      
    } catch (error) {
      logger.log(`Wake/cleanup error: ${error.message}`, 'error', this.botName);
    }
  }

  async breakBed(position) {
    try {
      const bedPos = new Vec3(position.x, position.y, position.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock && this.isBedBlock(bedBlock)) {
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
      failedSleepAttempts: this.state.failedSleepAttempts,
      bedsBroken: this.state.bedsBroken,
      lastBedBreakTime: this.state.lastBedBreakTime ? 
        new Date(this.state.lastBedBreakTime).toLocaleTimeString() : 'Never',
      lastSleepTime: this.state.lastSleepTime ? 
        new Date(this.state.lastSleepTime).toLocaleTimeString() : 'Never',
      autoBedBreaking: CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP,
      hasHomeBed: this.state.hasHomeBed,
      homeLocation: this.state.homeBedPosition
    };
  }
}

// ================= ADVANCED CREATIVE BOT WITH BUILDING =================
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
      homeLocation: null,
      buildStyle: config.buildStyle || 'modern',
      metrics: {
        messagesSent: 0,
        blocksPlaced: 0,
        distanceTraveled: 0,
        sleepCycles: 0,
        connectionAttempts: 0,
        structuresBuilt: 0
      }
    };
    
    this.intervals = [];
    this.activityTimeout = null;
    this.buildingQueue = [];
    this.isBuilding = false;
    
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
        hideErrors: false
      });
      
      this.sleepSystem = new PerfectSleepSystem(this.bot, this.state.username);
      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.state.status = 'timeout';
          logger.log('Connection timeout', 'error', this.state.username);
          reject(new Error('Connection timeout'));
        }, 45000);
        
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
    
    // Initialize systems with delays
    setTimeout(() => {
      this.initializeCreativeMode();
    }, 2000);
    
    setTimeout(() => {
      this.initializeHomeSystem();
    }, 5000);
    
    setTimeout(() => {
      this.startActivitySystem();
      this.startAntiAFKSystem();
    }, 8000);
    
    logger.log(`All systems initialized`, 'success', this.state.username);
  }

  async initializeHomeSystem() {
    if (CONFIG.FEATURES.HOME_SYSTEM && this.sleepSystem) {
      await this.sleepSystem.initializeHomeSystem();
      if (this.sleepSystem.state.homeBedPosition) {
        this.state.homeLocation = this.sleepSystem.state.homeBedPosition;
      }
    }
  }

  initializeCreativeMode() {
    if (!this.bot) return;
    
    logger.log(`Initializing creative mode...`, 'info', this.state.username);
    
    const setCreativeMode = () => {
      if (this.bot) {
        this.bot.chat('/gamemode creative');
        logger.log(`Creative mode enabled`, 'success', this.state.username);
        
        setTimeout(() => {
          this.giveCreativeItems();
        }, 3000);
      }
    };
    
    setCreativeMode();
    setTimeout(setCreativeMode, 5000);
    setTimeout(setCreativeMode, 10000);
  }

  giveCreativeItems() {
    if (!this.bot) return;
    
    const items = [
      'bed',
      'white_bed',
      'stone 64',
      'oak_planks 64',
      'spruce_planks 64',
      'birch_planks 64',
      'glass 64',
      'glowstone 64',
      'diamond_block 16',
      'gold_block 16',
      'iron_block 16',
      'crafting_table',
      'chest',
      'torch 64',
      'lantern 16',
      'flower_pot 16',
      'furnace'
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
      
      // Skip activities at night
      if (this.bot.time && this.bot.time.time >= 13000 && this.bot.time.time <= 23000) {
        return;
      }
      
      // Select and perform activity
      const activity = this.selectActivity();
      this.state.activity = activity;
      this.performActivity(activity);
      
    }, 15000 + Math.random() * 10000); // 15-25 second intervals
    
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
        this.performBuildingActivity();
        break;
        
      case 'crafting':
        this.performCraftingActivity();
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

  // ================= NEW: BUILDING SYSTEM =================
  async performBuildingActivity() {
    logger.log('Starting building activity', 'building', this.state.username);
    
    // Choose a building project
    const project = this.selectBuildingProject();
    this.state.activity = `Building: ${project}`;
    
    // Get building materials
    await this.getBuildingMaterials();
    
    // Build the structure
    await this.buildStructure(project);
    
    this.state.metrics.structuresBuilt++;
    logger.log(`Building project completed: ${project}`, 'success', this.state.username);
  }

  selectBuildingProject() {
    const projects = [
      'Small House',
      'Tower',
      'Wall',
      'Garden',
      'Fountain',
      'Bridge',
      'Monument'
    ];
    
    if (this.config.personality === 'builder') {
      return projects[Math.floor(Math.random() * projects.length)];
    } else {
      return 'Simple Structure';
    }
  }

  async getBuildingMaterials() {
    if (!this.bot) return;
    
    const blocks = CONFIG.BUILDING.BUILDING_BLOCKS;
    const selectedBlocks = blocks.slice(0, 4); // Get first 4 blocks
    
    selectedBlocks.forEach((block, index) => {
      setTimeout(() => {
        if (this.bot) {
          this.bot.chat(`/give ${this.bot.username} ${block} 32`);
        }
      }, index * 500);
    });
    
    logger.log(`Got building materials`, 'building', this.state.username);
  }

  async buildStructure(project) {
    if (!this.bot || !this.bot.entity) return;
    
    const pos = this.bot.entity.position;
    const buildPos = {
      x: Math.floor(pos.x) + Math.floor(Math.random() * 5) - 2,
      y: Math.floor(pos.y),
      z: Math.floor(pos.z) + Math.floor(Math.random() * 5) - 2
    };
    
    logger.log(`Building ${project} at ${buildPos.x}, ${buildPos.y}, ${buildPos.z}`, 'building', this.state.username);
    
    // Look at build location
    await this.bot.lookAt(new Vec3(buildPos.x, buildPos.y, buildPos.z));
    
    // Build based on project type
    switch (project) {
      case 'Small House':
        await this.buildSmallHouse(buildPos);
        break;
      case 'Tower':
        await this.buildTower(buildPos);
        break;
      case 'Wall':
        await this.buildWall(buildPos);
        break;
      default:
        await this.buildSimpleStructure(buildPos);
    }
  }

  async buildSmallHouse(position) {
    const blocks = ['oak_planks', 'glass', 'stone'];
    
    // Foundation
    for (let x = 0; x < 5; x++) {
      for (let z = 0; z < 5; z++) {
        await this.safePlaceBlockAt({
          x: position.x + x,
          y: position.y,
          z: position.z + z
        }, blocks[0]);
        await this.delay(100);
      }
    }
    
    // Walls
    for (let y = 1; y <= 3; y++) {
      for (let x = 0; x < 5; x++) {
        await this.safePlaceBlockAt({
          x: position.x + x,
          y: position.y + y,
          z: position.z
        }, blocks[0]);
        await this.safePlaceBlockAt({
          x: position.x + x,
          y: position.y + y,
          z: position.z + 4
        }, blocks[0]);
      }
      for (let z = 1; z < 4; z++) {
        await this.safePlaceBlockAt({
          x: position.x,
          y: position.y + y,
          z: position.z + z
        }, blocks[0]);
        await this.safePlaceBlockAt({
          x: position.x + 4,
          y: position.y + y,
          z: position.z + z
        }, blocks[0]);
      }
      await this.delay(200);
    }
    
    // Windows
    await this.safePlaceBlockAt({
      x: position.x + 2,
      y: position.y + 2,
      z: position.z
    }, blocks[1]);
    
    // Door opening
    await this.safePlaceBlockAt({
      x: position.x + 2,
      y: position.y + 1,
      z: position.z
    }, 'air');
    await this.safePlaceBlockAt({
      x: position.x + 2,
      y: position.y + 2,
      z: position.z
    }, 'air');
    
    // Roof
    for (let x = -1; x < 6; x++) {
      for (let z = -1; z < 6; z++) {
        await this.safePlaceBlockAt({
          x: position.x + x,
          y: position.y + 4,
          z: position.z + z
        }, blocks[2]);
        await this.delay(50);
      }
    }
  }

  async buildTower(position) {
    const height = 8 + Math.floor(Math.random() * 4);
    const blockType = CONFIG.BUILDING.BUILDING_BLOCKS[Math.floor(Math.random() * CONFIG.BUILDING.BUILDING_BLOCKS.length)];
    
    for (let y = 0; y < height; y++) {
      // Base
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          await this.safePlaceBlockAt({
            x: position.x + x,
            y: position.y + y,
            z: position.z + z
          }, blockType);
          await this.delay(50);
        }
      }
      
      // Windows every 3 levels
      if (y % 3 === 0 && y > 0 && y < height - 1) {
        await this.safePlaceBlockAt({
          x: position.x + 1,
          y: position.y + y,
          z: position.z
        }, 'glass');
        await this.safePlaceBlockAt({
          x: position.x - 1,
          y: position.y + y,
          z: position.z
        }, 'glass');
      }
    }
    
    // Top platform
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        await this.safePlaceBlockAt({
          x: position.x + x,
          y: position.y + height,
          z: position.z + z
        }, blockType);
        await this.delay(50);
      }
    }
  }

  async buildWall(position) {
    const length = 10;
    const height = 3;
    const blockType = 'stone_bricks';
    
    for (let x = 0; x < length; x++) {
      for (let y = 0; y < height; y++) {
        await this.safePlaceBlockAt({
          x: position.x + x,
          y: position.y + y,
          z: position.z
        }, blockType);
        await this.delay(100);
      }
    }
  }

  async buildSimpleStructure(position) {
    const size = 3 + Math.floor(Math.random() * 3);
    const blockType = CONFIG.BUILDING.BUILDING_BLOCKS[Math.floor(Math.random() * CONFIG.BUILDING.BUILDING_BLOCKS.length)];
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          await this.safePlaceBlockAt({
            x: position.x + x,
            y: position.y + y,
            z: position.z + z
          }, blockType);
          await this.delay(50);
        }
      }
    }
  }

  async safePlaceBlockAt(position, blockType) {
    if (!this.bot || !this.sleepSystem) return false;
    
    try {
      // Use the sleep system's safe placement method
      return await this.sleepSystem.safePlaceBlock(position, blockType);
    } catch (error) {
      logger.log(`Failed to place block: ${error.message}`, 'error', this.state.username);
      return false;
    }
  }

  async performCraftingActivity() {
    logger.log('Performing crafting activity', 'info', this.state.username);
    
    // Place crafting table
    const pos = this.bot.entity.position;
    const tablePos = {
      x: Math.floor(pos.x) + 1,
      y: Math.floor(pos.y),
      z: Math.floor(pos.z)
    };
    
    await this.safePlaceBlockAt(tablePos, 'crafting_table');
    
    // Look at crafting table
    await this.bot.lookAt(new Vec3(tablePos.x, tablePos.y, tablePos.z));
    
    // Simulate crafting
    this.bot.swingArm();
    await this.delay(1000);
    this.bot.swingArm();
    
    logger.log('Crafting simulation complete', 'info', this.state.username);
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
      },
      () => {
        this.bot.swingArm();
      }
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    action();
    
    logger.log(`Performed anti-AFK action`, 'debug', this.state.username);
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
      homeLocation: this.state.homeLocation,
      buildStyle: this.state.buildStyle,
      metrics: {
        messages: this.state.metrics.messagesSent,
        blocks: this.state.metrics.blocksPlaced,
        structures: this.state.metrics.structuresBuilt,
        sleepCycles: sleepStatus.sleepCycles || 0,
        connectionAttempts: this.state.metrics.connectionAttempts
      },
      sleepInfo: {
        bedPlacements: sleepStatus.bedPlacements || 0,
        failedAttempts: sleepStatus.failedSleepAttempts || 0,
        bedsBroken: sleepStatus.bedsBroken || 0,
        autoBedBreaking: sleepStatus.autoBedBreaking || false,
        lastBedBreakTime: sleepStatus.lastBedBreakTime || 'Never',
        hasHomeBed: sleepStatus.hasHomeBed || false
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
    logger.log('🚀 STARTING ULTIMATE BOT SYSTEM v2.3', 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log(`Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`, 'info', 'SYSTEM');
    logger.log(`Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`, 'info', 'SYSTEM');
    logger.log(`Features: Home System • Building • Crash Protection`, 'info', 'SYSTEM');
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
    
    const buildingBots = connectedBots
      .filter(bot => bot.state.activity.includes('Building'));
    
    logger.log(`\n${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`📊 BOT STATUS - ${new Date().toLocaleTimeString()}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`Connected: ${connectedBots.length}/${this.bots.size}`, 'info', 'STATUS');
    logger.log(`Sleeping: ${sleepingBots.length}`, 'info', 'STATUS');
    logger.log(`Building: ${buildingBots.length}`, 'info', 'STATUS');
    logger.log(`Auto-Bed Breaking: ${CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP ? '✅ ENABLED' : '❌ DISABLED'}`, 'info', 'STATUS');
    logger.log(`Home System: ${CONFIG.FEATURES.HOME_SYSTEM ? '✅ ENABLED' : '❌ DISABLED'}`, 'info', 'STATUS');
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
        logger.log(`  Home: ${status.homeLocation ? `${status.homeLocation.x}, ${status.homeLocation.y}, ${status.homeLocation.z}` : 'Not set'}`, 'info', 'STATUS');
        logger.log(`  Health: ${status.health}/20 | Blocks: ${status.metrics.blocks}`, 'info', 'STATUS');
        logger.log(`  Structures: ${status.metrics.structures} | Sleep Cycles: ${status.metrics.sleepCycles}`, 'info', 'STATUS');
        logger.log(`  Beds Broken: ${status.sleepInfo.bedsBroken || 0} | Home Bed: ${status.sleepInfo.hasHomeBed ? '✅' : '❌'}`, 'info', 'STATUS');
        logger.log(``, 'info', 'STATUS');
      });
    }
    
    logger.log(`${'='.repeat(70)}\n`, 'info', 'STATUS');
  }
  
  printSystemReport() {
    let totalMessages = 0;
    let totalBlocks = 0;
    let totalStructures = 0;
    let totalSleepCycles = 0;
    let totalBedPlacements = 0;
    let totalBedsBroken = 0;
    let connectedCount = 0;
    
    this.bots.forEach(bot => {
      const status = bot.getStatus();
      totalMessages += status.metrics.messages || 0;
      totalBlocks += status.metrics.blocks || 0;
      totalStructures += status.metrics.structures || 0;
      totalSleepCycles += status.metrics.sleepCycles || 0;
      totalBedPlacements += status.sleepInfo.bedPlacements || 0;
      totalBedsBroken += status.sleepInfo.bedsBroken || 0;
      if (status.status === 'connected') connectedCount++;
    });
    
    logger.log(`\n${'='.repeat(70)}`, 'info', 'REPORT');
    logger.log(`📈 SYSTEM REPORT - ${new Date().toLocaleTimeString()}`, 'info', 'REPORT');
    logger.log(`${'='.repeat(70)}`, 'info', 'REPORT');
    logger.log(`Connected Bots: ${connectedCount}/${this.bots.size}`, 'info', 'REPORT');
    logger.log(`Total Messages Sent: ${totalMessages}`, 'info', 'REPORT');
    logger.log(`Total Blocks Placed: ${totalBlocks}`, 'info', 'REPORT');
    logger.log(`Total Structures Built: ${totalStructures}`, 'info', 'REPORT');
    logger.log(`Total Sleep Cycles: ${totalSleepCycles}`, 'info', 'REPORT');
    logger.log(`Total Bed Placements: ${totalBedPlacements}`, 'info', 'REPORT');
    logger.log(`Total Beds Broken: ${totalBedsBroken}`, 'info', 'REPORT');
    logger.log(`Auto-Bed Breaking: ${CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
    logger.log(`Home System: ${CONFIG.FEATURES.HOME_SYSTEM ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
    logger.log(`Building System: ${CONFIG.FEATURES.BUILDING_SYSTEM ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
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
      const building = Object.values(statuses).filter(s => s.activity.includes('Building')).length;
      
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
    <title>Ultimate Minecraft Bot System v2.3</title>
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
        .version {
            background: rgba(0, 204, 255, 0.2);
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 0.9rem;
            display: inline-block;
            margin-left: 10px;
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
        }
        .stat-card.connected { border-color: #00ff88; }
        .stat-card.sleeping { border-color: #00ccff; }
        .stat-card.building { border-color: #ffaa00; }
        .stat-card.home { border-color: #ff55ff; }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 10px 0;
        }
        .connected-color { color: #00ff88; }
        .sleeping-color { color: #00ccff; }
        .building-color { color: #ffaa00; }
        .home-color { color: #ff55ff; }
        
        .bots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
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
        .bot-card.building {
            border-color: #ffaa00;
            box-shadow: 0 0 20px rgba(255, 170, 0, 0.2);
        }
        .bot-card.has-home {
            border-color: #ff55ff;
            box-shadow: 0 0 20px rgba(255, 85, 255, 0.2);
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
        .building-badge { background: rgba(255, 170, 0, 0.2); color: #ffaa00; }
        
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
        
        .home-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(255, 85, 255, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 85, 255, 0.3);
        }
        
        .building-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(255, 170, 0, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 170, 0, 0.3);
        }
        
        .sleep-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(0, 204, 255, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(0, 204, 255, 0.3);
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
            transition: transform 0.3s;
        }
        .feature:hover {
            transform: scale(1.05);
        }
        .feature.new {
            background: rgba(255, 170, 0, 0.1);
            border: 1px solid rgba(255, 170, 0, 0.3);
        }
        .feature.home-feature {
            background: rgba(255, 85, 255, 0.1);
            border: 1px solid rgba(255, 85, 255, 0.3);
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
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Ultimate Minecraft Bot System <span class="version">v2.3</span></h1>
            <p class="subtitle">Complete system with Home Location, Building, and Crash Protection</p>
            
            <div class="stats">
                <div class="stat-card connected">
                    <div>Connected Bots</div>
                    <div class="stat-value connected-color">${connected}</div>
                </div>
                <div class="stat-card sleeping">
                    <div>Sleeping</div>
                    <div class="stat-value sleeping-color">${sleeping}</div>
                </div>
                <div class="stat-card building">
                    <div>Building</div>
                    <div class="stat-value building-color">${building}</div>
                </div>
                <div class="stat-card home">
                    <div>Home System</div>
                    <div class="stat-value home-color">${CONFIG.FEATURES.HOME_SYSTEM ? '✅ ON' : '❌ OFF'}</div>
                </div>
            </div>
        </div>
        
        <h2 style="margin-bottom: 20px;">🤖 Bot Status</h2>
        <div class="bots-grid">
            ${Object.entries(statuses).map(([id, status]) => `
            <div class="bot-card ${status.isSleeping ? 'sleeping' : status.activity.includes('Building') ? 'building' : status.homeLocation ? 'has-home' : ''}">
                <div class="bot-header">
                    <div>
                        <div class="bot-name">${status.username}</div>
                        <div class="bot-personality">${status.personality.toUpperCase()}</div>
                    </div>
                    <div class="status-badge ${status.status === 'connected' ? status.activity.includes('Building') ? 'building-badge' : 'connected-badge' : 'disconnected-badge'}">
                        ${status.status.toUpperCase()}
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Activity</div>
                        <div class="info-value">${status.activity} ${status.isSleeping ? '😴' : status.activity.includes('Building') ? '🏗️' : status.activity.includes('Explore') ? '🗺️' : '🎯'}</div>
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
                        <div class="info-label">Build Style</div>
                        <div class="info-value">${status.buildStyle}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Blocks Placed</div>
                        <div class="info-value">${status.metrics.blocks || 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Structures</div>
                        <div class="info-value">${status.metrics.structures || 0}</div>
                    </div>
                </div>
                
                ${status.homeLocation ? `
                <div class="home-info">
                    <div class="info-label">🏠 Home Location</div>
                    <div class="info-value">${status.homeLocation.x}, ${status.homeLocation.y}, ${status.homeLocation.z}</div>
                    <div style="margin-top: 5px; font-size: 0.9rem; color: #ffaa00;">
                        Returns home at night • Permanent bed • Spawn point
                    </div>
                </div>
                ` : ''}
                
                ${status.activity.includes('Building') ? `
                <div class="building-info">
                    <div class="info-label">🏗️ Current Project</div>
                    <div class="info-value">${status.activity.replace('Building: ', '')}</div>
                    <div style="margin-top: 5px; font-size: 0.9rem; color: #00ff88;">
                        Building with ${status.buildStyle} style
                    </div>
                </div>
                ` : ''}
                
                <div class="sleep-info">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <div>
                            <div class="info-label">Sleep Cycles</div>
                            <div class="info-value">${status.metrics.sleepCycles || 0}</div>
                        </div>
                        <div>
                            <div class="info-label">Beds Broken</div>
                            <div class="info-value">${status.sleepInfo?.bedsBroken || 0}</div>
                        </div>
                        <div>
                            <div class="info-label">Home Bed</div>
                            <div class="info-value">${status.sleepInfo?.hasHomeBed ? '✅' : '❌'}</div>
                        </div>
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
                <div class="feature new">🏠 Home System</div>
                <div class="feature new">🏗️ Building System</div>
                <div class="feature">⛏️ Auto-Bed Breaking</div>
                <div class="feature home-feature">📍 Return to Home</div>
                <div class="feature">🔄 Auto-Reconnect</div>
                <div class="feature">💬 Smart Chat</div>
                <div class="feature">🎯 Activity System</div>
                <div class="feature">⚡ Anti-AFK</div>
                <div class="feature">📊 Web Interface</div>
                <div class="feature new">🛡️ Crash Protection</div>
                <div class="feature">🔧 Error Recovery</div>
                <div class="feature">🌙 Time Awareness</div>
            </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #777; font-size: 0.9rem;">
            <p>✅ System Status: Fully Operational • All Features Active • Crash Protection Enabled</p>
            <p>🚀 <strong>NEW:</strong> Home System • Building Projects • Return Home at Night</p>
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
        version: '2.3',
        bots: Object.keys(botManager.getAllStatuses()).length,
        features: CONFIG.FEATURES,
        crash_protection: CONFIG.FEATURES.CRASH_PROTECTION
      }));
      
    } else if (url === '/api/status') {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        version: '2.3',
        server: CONFIG.SERVER,
        timestamp: new Date().toISOString(),
        features: CONFIG.FEATURES,
        sleep_system: CONFIG.SLEEP_SYSTEM,
        building_system: CONFIG.BUILDING,
        home_system: CONFIG.HOME,
        bots: botManager.getAllStatuses()
      }));
      
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Not Found</h1><p>The requested page does not exist.</p>');
    }
  });
  
  server.listen(CONFIG.SYSTEM.PORT, () => {
    logger.log(`🌐 Web server running on port ${CONFIG.SYSTEM.PORT}`, 'success', 'WEB');
    logger.log(`📱 Status page: http://localhost:${CONFIG.SYSTEM.PORT}`, 'info', 'WEB');
    logger.log(`🩺 Health check: http://localhost:${CONFIG.SYSTEM.PORT}/health`, 'info', 'WEB');
    logger.log(`📊 JSON API: http://localhost:${CONFIG.SYSTEM.PORT}/api/status`, 'info', 'WEB');
    logger.log(`🏠 Home System: ${CONFIG.FEATURES.HOME_SYSTEM ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'home', 'WEB');
    logger.log(`🏗️ Building System: ${CONFIG.FEATURES.BUILDING_SYSTEM ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'building', 'WEB');
    logger.log(`🛡️ Crash Protection: ${CONFIG.FEATURES.CRASH_PROTECTION ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'success', 'WEB');
  });
  
  return server;
}

// ================= MAIN EXECUTION =================
async function main() {
  try {
    logger.log('🚀 Initializing Ultimate Minecraft Bot System v2.3...', 'info', 'SYSTEM');
    logger.log('✅ Crash protection enabled with timeout safety!', 'success', 'SYSTEM');
    
    const botManager = new BotManager();
    
    createWebServer(botManager);
    
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
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await botManager.start();
    
    logger.log('✅ System is fully operational with all new features!', 'success', 'SYSTEM');
    logger.log('🎯 NEW FEATURES ADDED:', 'info', 'SYSTEM');
    logger.log('   • 🏠 Home Location System - Spawn point becomes home', 'home', 'SYSTEM');
    logger.log('   • 🛡️ Crash Protection - Timeout safety for all operations', 'success', 'SYSTEM');
    logger.log('   • 🏗️ Building System - Creates structures with building blocks', 'building', 'SYSTEM');
    logger.log('   • 📍 Return to Home - Goes back home at night to sleep', 'home', 'SYSTEM');
    logger.log('   • 🛏️ Permanent Home Bed - Bed stays at home location', 'home', 'SYSTEM');
    logger.log('\n🤖 Bot Daily Routine:', 'info', 'SYSTEM');
    logger.log('   1. ☀️ Daytime - Explore and build structures', 'building', 'SYSTEM');
    logger.log('   2. 🌙 Night comes - Return home if far away', 'travel', 'SYSTEM');
    logger.log('   3. 🏠 At Home - Sleep in permanent home bed', 'sleep', 'SYSTEM');
    logger.log('   4. ⛏️ Morning - Break temporary beds, keep home bed', 'bed_break', 'SYSTEM');
    logger.log('   5. 🔄 Repeat - Continue activities next day', 'success', 'SYSTEM');
    logger.log('\n📊 Check the web interface for building progress and home locations!', 'info', 'SYSTEM');
    
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
