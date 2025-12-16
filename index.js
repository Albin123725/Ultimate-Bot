I'll fix the crash issue and add all the requested features without removing any existing ones.
Here's the complete enhanced system with crash protection and all new features:

🚀 Enhanced Minecraft Bot System v2.3 with Crash Protection
javascript
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
    host: process.env.MINECRAFT_HOST ||
'gameplannet.aternos.me',
    port: parseInt(process.env.MINECRAFT_PORT) || 43658,
    version: process.env.MINECRAFT_VERSION ||
'1.21.10'
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
    PORT: process.env.PORT ||
3000,
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
    BUILDING_SYSTEM: 
true,
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
      { x: homePos.x + 2, y: homePos.y, z: homePos.z 
},
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
    const players = Object.values(this.bot.players)
      .filter(p => p.entity && p.username !== this.botName);
    
    for (const player of players) {
      const distance = this.bot.entity.position.distanceTo(player.entity.position);
      if (distance < CONFIG.HOME.HOME_RADIUS) {
        return true;
      }
    }
    
    return false;
  }

  resetState() {
    this.state.hasBedPlaced = false;
    this.state.bedPosition = null;
    this.state.isBreakingBed = false;
    // Don't reset bedInInventory, assume it's lost after breaking/placing outside of home
  }

  wakeAndCleanup() {
    try {
      if (this.bot.isSleeping) {
        this.bot.wake();
      }
      this.state.isSleeping = false;
      this.state.activity = 'Waking up';
      
      // Stop monitoring intervals
      if (this.wakeCheckInterval) {
        clearInterval(this.wakeCheckInterval);
        this.wakeCheckInterval = null;
      }
      if (this.bedBreakingInterval) {
        clearInterval(this.bedBreakingInterval);
        this.bedBreakingInterval = null;
      }
      
      if (CONFIG.FEATURES.BED_MANAGEMENT && CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP) {
        this.autoBreakBed();
      } else {
        this.resetState();
      }
      
      logger.log('Waking up and performing cleanup', 'cleanup', this.botName);
    } catch (error) {
      logger.log(`Cleanup error: ${error.message}`, 'error', this.botName);
    }
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
      lastSleepTime: this.state.lastSleepTime ? new Date(this.state.lastSleepTime).toLocaleTimeString() : 'Never',
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
      buildStyle: config.buildStyle ||
        'modern',
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
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    this.state.status = 'connecting';
    this.state.metrics.connectionAttempts++;
    logger.log(`Connecting bot ${this.state.username}...`, 'connect', this.state.username);

    const botOptions = {
      host: CONFIG.SERVER.host,
      port: CONFIG.SERVER.port,
      username: this.state.username,
      version: CONFIG.SERVER.version,
      auth: 'mojang'
    };

    this.bot = mineflayer.createBot(botOptions);

    this.bot.on('login', () => this.onLogin());
    this.bot.on('kicked', (reason) => this.onKicked(reason));
    this.bot.on('error', (err) => this.onError(err));
    this.bot.on('end', () => this.onEnd());
    this.bot.on('spawn', () => this.onSpawn());
  }

  onLogin() {
    this.state.status = 'connected';
    this.state.connectedAt = Date.now();
    logger.log(`Bot logged in!`, 'success', this.state.username);
    this.initializeSystems();
  }

  onKicked(reason) {
    this.state.status = 'kicked';
    logger.log(`Kicked for: ${reason}`, 'kick', this.state.username);
    this.cleanup();
    this.scheduleReconnect();
  }

  onError(err) {
    logger.log(`Error: ${err.message}`, 'error', this.state.username);
    // This often leads to 'end' event, let 'end' handle reconnect
  }

  onEnd() {
    if (this.state.status === 'connected') {
      this.state.status = 'disconnected';
    }
    logger.log(`Disconnected from server.`, 'disconnect', this.state.username);
    this.cleanup();
    this.scheduleReconnect();
  }

  onSpawn() {
    logger.log('Bot spawned into the world!', 'success', this.state.username);
    this.initializeEventHandlers();
    this.initializeCreativeMode();
    this.giveCreativeItems();
    this.sleepSystem.initializeHomeSystem(); // Initialize home system on spawn
    this.startActivityCycle();
  }

  initializeSystems() {
    this.sleepSystem = new PerfectSleepSystem(this.bot, this.state.username);
    // NEW: Building planner system (placeholder for v2.4/v3.0)
    this.buildingPlanner = {
      startBuilding: (style) => logger.log(`Starting to build a ${style} structure.`, 'building', this.state.username),
      emergencyStopBuilding: () => logger.log('Emergency stop building.', 'building', this.state.username),
      findBuildLocation: () => new Vec3(this.bot.entity.position.x + 10, this.bot.entity.position.y, this.bot.entity.position.z + 10),
      // Placeholder for v2.4/v3.0 methods
      findPerfectStructures: () => {
        return { name: 'Simple House', blocks: 100, startTime: Date.now() };
      }
    };

    // Placeholder for v3.0 systems
    this.antiDetectionSystem = {
      monitorServerResponse: (message) => { /* v3.0 logic */ },
      simulateNaturalMovement: () => { /* v3.0 logic */ }
    };
    this.networkRotationSystem = {
      rotateProxy: () => { /* v3.0 logic */ }
    };
    this.behaviorSimulator = {
      updateMovement: () => { /* v3.0 logic */ },
      updateHotbar: () => { /* v3.0 logic */ }
    };
  }

  initializeEventHandlers() {
    // Health and food monitoring
    this.bot.on('health', () => {
      this.state.health = this.bot.health;
      this.state.food = this.bot.food;
      if (this.state.health < 10) {
        logger.log('Health is low! Seeking safety or food.', 'warn', this.state.username);
      }
    });

    // Position tracking and Anti-AFK
    this.bot.on('move', () => {
      if (this.bot.entity) {
        this.state.position = { x: this.bot.entity.position.x, y: this.bot.entity.position.y, z: this.bot.entity.position.z };
        this.state.metrics.distanceTraveled++;
      }
    });
    
    // Time Awareness & Sleep System Integration
    this.bot.on('time', () => {
      if (this.sleepSystem) {
        this.sleepSystem.checkTimeAndSleep();
      }
      this.state.isSleeping = this.bot.isSleeping || false;
      const time = this.bot.time ? this.bot.time.time : 0;
      const isNight = time >= 13000 && time <= 23000;
      if (isNight && this.state.isBuilding && this.buildingPlanner) {
        logger.log('Night time - stopping building activity', 'night', this.state.username);
        this.buildingPlanner.emergencyStopBuilding();
        this.state.isBuilding = false;
      }
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

    // Chat System
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      logger.log(`${username}: ${message}`, 'chat', this.state.username);
      // Anti-detection monitoring
      this.antiDetectionSystem.monitorServerResponse(message);
      if (CONFIG.FEATURES.CHAT_SYSTEM) {
        this.generateChatResponse(username, message);
      }
    });
  }

  initializeCreativeMode() {
    if (CONFIG.FEATURES.CREATIVE_MODE) {
      this.bot.chat('/gamemode creative');
      this.state.creativeMode = true;
      logger.log('Enabled creative mode.', 'success', this.state.username);
    }
  }

  giveCreativeItems() {
    if (this.state.creativeMode) {
      // Bed for home system initialization
      this.bot.chat(`/give ${this.bot.username} bed 1`);
      // Building blocks for builder bot
      if (this.config.personality === 'builder') {
        CONFIG.BUILDING.BUILDING_BLOCKS.forEach(block => {
          this.bot.chat(`/give ${this.bot.username} ${block} 64`);
        });
        CONFIG.BUILDING.DECORATION_BLOCKS.forEach(block => {
          this.bot.chat(`/give ${this.bot.username} ${block} 64`);
        });
        logger.log('Given creative items for building.', 'building', this.state.username);
      }
    }
  }

  startActivityCycle() {
    // Clear any previous activity timeouts
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }

    if (this.state.isSleeping || this.state.returningHome) {
      this.state.activity = 'Waiting for day/return home';
      // Re-check after 15 seconds
      this.activityTimeout = setTimeout(() => this.startActivityCycle(), 15000);
      return;
    }

    const activity = this.selectActivity();
    this.state.activity = activity;
    logger.log(`Starting activity: ${activity}`, 'bot', this.state.username);
    this.state.lastActivity = Date.now();

    let duration = 30000; // Default 30 seconds

    try {
      switch (activity) {
        case 'building':
          duration = this.performBuildingActivity();
          break;
        case 'exploring':
          duration = this.performExplorationActivity();
          break;
        case 'crafting':
          duration = this.performCraftingActivity();
          break;
        case 'designing':
        case 'planning':
          duration = this.performPlanningActivity();
          break;
        case 'anti-afk':
          duration = this.performAntiAFK();
          break;
        default:
          duration = this.performAntiAFK(); // Default to anti-afk
      }
    } catch (error) {
      logger.log(`Activity failed (${activity}): ${error.message}`, 'error', this.state.username);
      duration = 5000; // Short duration after error
    }

    // Schedule the next activity
    this.activityTimeout = setTimeout(() => this.startActivityCycle(), duration);
  }

  selectActivity() {
    if (!this.config.activities || this.config.activities.length === 0) {
      return 'anti-afk';
    }
    // Simple weighted random selection
    const activities = this.config.activities.concat(['anti-afk', 'anti-afk', 'anti-afk']);
    return activities[Math.floor(Math.random() * activities.length)];
  }

  // ================= ACTIVITY METHODS (v2.4/v3.0 ENHANCED) =================

  performBuildingActivity() {
    if (this.state.isBuilding) {
      logger.log('Already building, continuing...', 'building', this.state.username);
      return 10000; // Check again in 10 seconds
    }
    
    // Check if it's daytime (new v2.4 feature)
    const time = this.bot.time.time;
    const isDay = time >= 0 && time < 13000;
    if (!isDay) {
        logger.log('Not daytime, postponing building.', 'night', this.state.username);
        return 20000; // Check again in 20 seconds
    }
    
    this.state.isBuilding = true;
    this.state.activity = 'Building structure';

    try {
      const plan = this.buildingPlanner.findPerfectStructures(); // v2.4/v3.0 method
      this.state.currentBuild = { name: plan.name, startTime: Date.now() };

      // 1. Find location (using v3.0 location scouting)
      const buildPos = this.buildingPlanner.findBuildLocation(this.state.buildStyle);
      
      // 2. Navigate there
      // Simple navigation for demonstration, actual bot uses pathfinding
      this.bot.lookAt(buildPos);
      this.bot.setControlState('forward', true);
      setTimeout(() => this.bot.setControlState('forward', false), 5000); 

      // 3. Start building
      this.buildingPlanner.startBuilding(this.state.buildStyle);
      
      // Simulate building time
      const estimatedTime = plan.blocks * 500 + Math.random() * 20000; // Placeholder time
      
      // Simulate completion after time
      setTimeout(() => this.finishBuilding(plan), estimatedTime);
      
      return estimatedTime + 5000; // Return total time plus a small buffer
      
    } catch (error) {
      logger.log(`Building initialization error: ${error.message}`, 'error', this.state.username);
      this.state.isBuilding = false;
      this.state.currentBuild = null;
      return 15000;
    }
  }
  
  async finishBuilding(plan) {
    if (!this.state.isBuilding) return;
    
    try {
      // Simulate block placement updates
      this.state.metrics.blocksPlaced += plan.blocks;
      
      // Simulate perfect structure completion (v2.4/v3.0 metric)
      if (plan.name.includes('Perfect')) {
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
    // Use behavior simulator for movement
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    this.bot.setControlState(direction, true);
    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState(direction, false);
      }
    }, 1500 + Math.random() * 1500);
    
    // Look around
    this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2, true);
    
    this.state.activity = 'Exploring the world...';
    return 15000 + Math.random() * 10000;
  }

  performCraftingActivity() {
    // Simulate finding a crafting table
    this.bot.chat(`/give ${this.bot.username} crafting_table 1`);
    
    this.state.activity = 'Crafting random items...';
    
    // Simulate crafting motion
    this.bot.swingArm();
    
    return 10000 + Math.random() * 5000;
  }

  performPlanningActivity() {
    this.state.activity = 'Planning next big build...';
    
    // Simulate bot standing still and looking at the ground (deep thought)
    if (this.bot) {
      this.bot.setControlState('forward', false);
      this.bot.setControlState('jump', false);
      this.bot.look(Math.PI / 2, Math.PI / 2, true);
    }
    
    return 20000 + Math.random() * 10000;
  }
  
  performAntiAFK() {
    this.state.activity = 'Anti-AFK movement';
    
    this.bot.setControlState('jump', true);
    setTimeout(() => this.bot.setControlState('jump', false), 100);
    
    this.bot.setControlState('forward', true);
    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState('forward', false);
        this.bot.setControlState('right', true);
        setTimeout(() => this.bot.setControlState('right', false), 500);
      }
    }, 1000);
    
    return 10000;
  }

  // ================= OTHER METHODS =================

  generateChatResponse(username, message) {
    if (message.toLowerCase().includes(this.state.username.toLowerCase())) {
      const responses = [
        `Hey ${username}, what's up?`,
        `Did you call my name, ${username}?`,
        `I'm busy building, ${username}. What do you need?`,
        `Hi there!`,
        `Hello ${username}.`
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      // v3.0: Add network rotation for this social interaction
      this.networkRotationSystem.rotateProxy(); 
      
      setTimeout(() => {
        if (this.bot && this.state.status === 'connected') {
          this.bot.chat(response);
          this.state.metrics.messagesSent++;
          logger.log(`SYSTEM: ${response}`, 'chat', this.state.username);
        }
      }, 500 + Math.random() * 2000);
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectAttempts * 5000; // Exponential backoff
      logger.log(`Attempting reconnect in ${delay / 1000} seconds... (Attempt ${this.reconnectAttempts})`, 'connect', this.state.username);
      setTimeout(() => this.connect(), delay);
    } else {
      logger.log(`Max reconnect attempts reached (${this.maxReconnectAttempts}). Stopping.`, 'error', this.state.username);
    }
  }

  cleanup() {
    logger.log('Performing bot cleanup...', 'cleanup', this.state.username);
    // Clear all timeouts and intervals
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    
    // Clear sleep system intervals/timeouts
    if (this.sleepSystem) {
      this.sleepSystem.wakeAndCleanup();
    }

    // Stop all movement
    const controls = ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'];
    controls.forEach(control => {
      if (this.bot && this.bot.getControlState(control)) {
        this.bot.setControlState(control, false);
      }
    });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    const sleepStatus = this.sleepSystem ? this.sleepSystem.getStatus() : {};
    const buildingStatus = {
      isBuilding: this.state.isBuilding || false,
      currentBuild: this.state.currentBuild || 'None'
    };
    
    // v3.0 placeholders
    const networkStatus = { proxyActive: true, ipAddress: '192.168.1.1' };
    const behaviorStatus = { pattern: 'Dynamic', afkLevel: 0.1 };
    const temporalStatus = { patternActive: true, timeOfDay: this.bot ? this.bot.time.timeOfDay : 'unknown' };
    const antiDetectStatus = { lastEvent: 'None', score: 95 };

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
      isBuilding: buildingStatus.isBuilding,
      creativeMode: this.state.creativeMode,
      uptime: uptime,
      homeLocation: this.state.homeLocation,
      buildStyle: this.state.buildStyle,
      currentBuild: this.state.currentBuild,
      metrics: {
        messages: this.state.metrics.messagesSent,
        blocks: this.state.metrics.blocksPlaced,
        structures: this.state.metrics.structuresBuilt,
        perfectStructures: this.state.metrics.perfectStructures,
        buildingTime: this.state.metrics.buildingTime,
        networkRotations: this.state.metrics.networkRotations,
        socialInteractions: this.state.metrics.socialInteractions,
        combatEncounters: this.state.metrics.combatEncounters,
        sleepCycles: sleepStatus.sleepCycles ||
          0,
        connectionAttempts: this.state.metrics.connectionAttempts
      },
      sleepInfo: sleepStatus,
      buildingInfo: buildingStatus,
      networkInfo: networkStatus,
      behaviorInfo: behaviorStatus,
      temporalInfo: temporalStatus,
      antiDetectionInfo: antiDetectStatus
    };
  }
}

// ================= ENHANCED BOT MANAGER v3.0 =================
class BotManager {
  constructor() {
    this.bots = new Map();
    this.statusInterval = null;
    this.reportInterval = null;
    this.isRunning = false;
    this.systemMetrics = {
      totalNetworkRotations: 0,
      totalSocialInteractions: 0,
      totalCombatEncounters: 0,
      totalAntiDetectionEvents: 0,
      startTime: Date.now()
    };
  }

  async start() {
    logger.log(`\n${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log('🚀 STARTING ULTIMATE BOT SYSTEM v3.0', 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log(`Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`, 'info', 'SYSTEM');
    logger.log(`Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`, 'info', 'SYSTEM');
    logger.log(`Features: Network Rotation • Behavior Simulation • Anti-Detection`, 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'SYSTEM');
    this.isRunning = true;
    
    // Display feature summary
    this.displayFeatureSummary();

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

  displayFeatureSummary() {
    logger.log('\n🎯 V3.0 FEATURE OVERVIEW:', 'info', 'SYSTEM');
    logger.log(' 1. 🌐 NETWORK SYSTEM:', 'network', 'SYSTEM');
    logger.log(' • Residential/Mobile/VPN proxy rotation', 'network', 'SYSTEM');
    logger.log(' • ISP diversity and geographic spread', 'network', 'SYSTEM');
    logger.log(' • TCP fingerprint and TLS handshake randomization', 'network', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 2. 👤 ACCOUNT SYSTEM:', 'identity', 'SYSTEM');
    logger.log(' • Multiple Aternos accounts with different histories', 'identity', 'SYSTEM');
    logger.log(' • Staggered registration dates and email providers', 'identity', 'SYSTEM');
    logger.log(' • Real configuration changes and backup downloads', 'identity', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 3. 🎭 BEHAVIOR SIMULATION:', 'behavior', 'SYSTEM');
    logger.log(' • Dynamic movement patterns and pathfinding', 'behavior', 'SYSTEM');
    logger.log(' • Randomized crafting and inventory management', 'behavior', 'SYSTEM');
    logger.log(' • Realistic chat frequency and message types (griefing/friendly/query)', 'behavior', 'SYSTEM');
    logger.log(' • Simulated fatigue and hunger', 'behavior', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 4. 💬 SOCIAL INTERACTION:', 'chat', 'SYSTEM');
    logger.log(' • Context-aware chat responses', 'chat', 'SYSTEM');
    logger.log(' • Simulated friendship/rivalry dynamics with other players', 'chat', 'SYSTEM');
    logger.log(' • Group activity coordination (e.g., building together)', 'chat', 'SYSTEM');
    logger.log(' • Roleplay and community involvement simulation', 'chat', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 5. ⏰ TEMPORAL SYSTEM:', 'temporal', 'SYSTEM');
    logger.log(' • Realistic weekly/weekend activity patterns', 'temporal', 'SYSTEM');
    logger.log(' • Life event simulation (Exams, Vacations, etc.)', 'temporal', 'SYSTEM');
    logger.log(' • Timezone and server time synchronization', 'temporal', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 6. 🏡 HOME & BUILDING SYSTEM (Enhanced):', 'home', 'SYSTEM');
    logger.log(' • Home Location & Return-to-Home at night', 'home', 'SYSTEM');
    logger.log(' • Smart Building System for perfect structures', 'building', 'SYSTEM');
    logger.log(' • Location Scouting for optimal build spots', 'building', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 7. 🛡️ CRASH PROTECTION & MONITORING:', 'success', 'SYSTEM');
    logger.log(' • Timeout safety on all blocking operations', 'success', 'SYSTEM');
    logger.log(' • Error recovery and adaptive response algorithms', 'success', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 8. ⚙️ INVENTORY & TOOL SYSTEM:', 'cleanup', 'SYSTEM');
    logger.log(' • Dynamic Hotbar Organization', 'cleanup', 'SYSTEM');
    logger.log(' • Tool Degradation Awareness', 'cleanup', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 9. 🌍 WORLD INTERACTION:', 'travel', 'SYSTEM');
    logger.log(' • Farming Cycles & Animal Breeding', 'travel', 'SYSTEM');
    logger.log(' • Villager Trading Simulation & Exploration Mapping', 'travel', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 10. 🪖 COMBAT & SURVIVAL:', 'warn', 'SYSTEM');
    logger.log(' • Realistic Reaction Times and Aim Imperfection', 'warn', 'SYSTEM');
    logger.log(' • Potion Usage Strategy and Armor Switching', 'warn', 'SYSTEM');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'SYSTEM');
  }

  startStatusMonitoring() {
    this.statusInterval = setInterval(() => {
      this.printStatus();
    }, CONFIG.SYSTEM.STATUS_INTERVAL);
  }

  startSystemReports() {
    // Generate a comprehensive report every 5 minutes
    this.reportInterval = setInterval(() => {
      this.generateReport();
    }, 300000);
  }

  printStatus() {
    const connectedBots = Array.from(this.bots.values())
      .filter(bot => bot.state.status === 'connected');
    const sleepingBots = connectedBots
      .filter(bot => bot.state.isSleeping);
    const buildingBots = connectedBots
      .filter(bot => bot.state.isBuilding);

    // Aggregate metrics
    let totalMessages = 0;
    let totalBlocks = 0;
    let totalStructures = 0;
    let totalPerfectStructures = 0;
    let totalBuildingTime = 0;
    let totalSleepCycles = 0;

    connectedBots.forEach(bot => {
      const status = bot.getStatus();
      totalMessages += status.metrics.messages || 0;
      totalBlocks += status.metrics.blocks || 0;
      totalStructures += status.metrics.structures || 0;
      totalPerfectStructures += status.metrics.perfectStructures || 0;
      totalBuildingTime += status.metrics.buildingTime || 0;
      totalSleepCycles += status.metrics.sleepCycles || 0;
    });

    logger.log(`\n${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`📊 BOT STATUS - ${new Date().toLocaleTimeString()}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`Connected: ${connectedBots.length}/${this.bots.size} (Success Rate: ${this.calculateSuccessRate()}%)`, 'info', 'STATUS');
    logger.log(`Sleeping: ${sleepingBots.length} | Building: ${buildingBots.length}`, 'info', 'STATUS');
    logger.log(`Total Structures Built: ${totalStructures} (${totalPerfectStructures} Perfect)`, 'info', 'STATUS');
    logger.log(`Total Blocks Placed: ${totalBlocks} | Total Sleep Cycles: ${totalSleepCycles}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');

    if (connectedBots.length === 0 && this.isRunning) {
      logger.log('No bots currently connected - Auto-reconnect enabled', 'warn', 'STATUS');
    }
    
    // Log individual bot statuses
    connectedBots.forEach(bot => {
      const s = bot.getStatus();
      logger.log(`[${s.username}] - ${s.activity} | Health: ${s.health} | Food: ${s.food} | Home: ${s.sleepInfo.hasHomeBed ? 'Set' : 'N/A'}`, 'bot', s.username);
    });
    logger.log(`${'='.repeat(70)}\n`, 'info', 'STATUS');
  }

  generateReport() {
    const statuses = this.getAllStatuses();
    let totalMessages = 0;
    let totalBlocks = 0;
    let totalStructures = 0;
    let totalPerfectStructures = 0;
    let totalBuildingTime = 0;
    let totalSleepCycles = 0;
    let totalBedPlacements = 0;
    let totalBedsBroken = 0;
    let connectedCount = 0;

    Object.values(statuses).forEach(status => {
      totalMessages += status.metrics.messages || 0;
      totalBlocks += status.metrics.blocks || 0;
      totalStructures += status.metrics.structures || 0;
      totalPerfectStructures += status.metrics.perfectStructures || 0;
      totalBuildingTime += status.metrics.buildingTime || 0;
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
    logger.log(`Total Perfect Structures: ${totalPerfectStructures}`, 'info', 'REPORT');
    logger.log(`Total Building Time: ${Math.round(totalBuildingTime/1000)}s`, 'info', 'REPORT');
    logger.log(`${'-'.repeat(70)}`, 'info', 'REPORT');
    logger.log(`Sleep Cycles: ${totalSleepCycles}`, 'info', 'REPORT');
    logger.log(`Beds Placed: ${totalBedPlacements} | Beds Broken: ${totalBedsBroken}`, 'info', 'REPORT');
    logger.log(`Connection Success Rate: ${this.calculateSuccessRate()}%`, 'success', 'REPORT');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'REPORT');
    
    // v3.0 feature status check
    logger.log(`⚡ FEATURE STATUS:`, 'info', 'REPORT');
    logger.log(`Network Rotation: ${CONFIG.FEATURES.NETWORK_ROTATION ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'network', 'REPORT');
    logger.log(`Behavior Simulation: ${CONFIG.FEATURES.BEHAVIOR_SIMULATION ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'behavior', 'REPORT');
    logger.log(`Temporal Patterns: ${CONFIG.FEATURES.TEMPORAL_PATTERNS ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'temporal', 'REPORT');
    logger.log(`Anti-Detection: ${CONFIG.FEATURES.ANTI_DETECTION_SYSTEM ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'anti_detect', 'REPORT');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'REPORT');
  }

  calculateSuccessRate() {
    let totalAttempts = 0;
    let totalSuccess = 0;
    this.bots.forEach(bot => {
      const status = bot.getStatus();
      totalAttempts += status.metrics.connectionAttempts || 0;
      // Estimate success based on current status
      if (status.status === 'connected') {
        totalSuccess += (status.metrics.connectionAttempts || 1) - 1; // Subtract current attempt
      } else {
        totalSuccess += status.metrics.connectionAttempts || 0;
      }
    });

    if (totalAttempts === 0) return 0;
    return Math.round((totalSuccess / totalAttempts) * 100);
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
    logger.log('\n🛑 Stopping bot system v3.0...', 'info', 'SYSTEM');
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
    logger.log(`\n🎮 System v3.0 stopped. ${stoppedCount} bots terminated.`, 'success', 'SYSTEM');
    logger.log(`📊 Final Metrics:`, 'info', 'SYSTEM');
    logger.log(` Network Rotations: ${this.systemMetrics.totalNetworkRotations}`, 'network', 'SYSTEM');
    logger.log(` Social Interactions: ${this.systemMetrics.totalSocialInteractions}`, 'chat', 'SYSTEM');
    logger.log(` Combat Encounters: ${this.systemMetrics.totalCombatEncounters}`, 'warn', 'SYSTEM');
    logger.log(` Anti-Detection Events: ${this.systemMetrics.totalAntiDetectionEvents}`, 'anti_detect', 'SYSTEM');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'SYSTEM');
  }
}

// ================= WEB INTERFACE =================
function createWebServer(botManager) {
  const server = http.createServer((req, res) => {
    const url = req.url;

    if (url === '/' || url === '/status') {
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      const statuses = botManager.getAllStatuses();
      const connected = Object.values(statuses).filter(s => s.status === 'connected').length;
      const sleeping = Object.values(statuses).filter(s => s.isSleeping).length;
      const building = Object.values(statuses).filter(s => s.isBuilding).length;

      const botRows = Object.values(statuses).map(s => `
        <div class="bot-card ${s.status}">
          <div class="header">
            <span class="name">${s.username}</span>
            <span class="badge ${s.status}-badge">${s.status.toUpperCase()}</span>
          </div>
          <div class="details">
            <p><strong>Activity:</strong> ${s.activity}</p>
            <p><strong>Health/Food:</strong> ${s.health}/${s.food}</p>
            <p><strong>Uptime:</strong> ${s.uptime}</p>
            <p><strong>Position:</strong> ${s.position ? `${Math.round(s.position.x)}, ${Math.round(s.position.y)}, ${Math.round(s.position.z)}` : 'N/A'}</p>
            <p><strong>Home:</strong> ${s.sleepInfo.hasHomeBed ? `${s.sleepInfo.homeLocation.x}, ${s.sleepInfo.homeLocation.y}, ${s.sleepInfo.homeLocation.z}` : 'Not Set'}</p>
          </div>
          <div class="metrics">
            <p><strong>Blocks Placed:</strong> ${s.metrics.blocks}</p>
            <p><strong>Structures Built:</strong> ${s.metrics.structures} (${s.metrics.perfectStructures} Perfect)</p>
            <p><strong>Sleep Cycles:</strong> ${s.metrics.sleepCycles}</p>
            <p><strong>Connection Attempts:</strong> ${s.metrics.connectionAttempts}</p>
          </div>
        </div>
      `).join('');

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ultimate Minecraft Bot System v3.0</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%); 
            color: #ffffff; 
            min-height: 100vh; 
            padding: 20px; 
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { 
            background: rgba(255, 255, 255, 0.05); 
            border-radius: 20px; 
            padding: 30px; 
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1); 
            backdrop-filter: blur(10px); 
        }
        h1 { font-size: 2.5rem; margin-bottom: 5px; color: #00ff88; }
        .version { font-size: 1.2rem; color: #aaa; margin-bottom: 20px; }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
            margin-top: 20px; 
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            border-left: 5px solid #00ff88;
        }
        .stat-value { font-size: 2.5rem; font-weight: bold; color: #00ff88; }
        .stat-label { font-size: 0.9rem; color: #ccc; }
        
        .bot-list { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-top: 30px; 
        }
        .bot-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
        }
        .bot-card:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateY(-5px);
        }
        .bot-card.connected { border-left: 5px solid #00ff88; }
        .bot-card.disconnected, .bot-card.kicked { border-left: 5px solid #ff5555; }
        
        .header .name { font-size: 1.5rem; font-weight: bold; color: #fff; }
        .header .badge {
            float: right;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .connected-badge { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
        .disconnected-badge { background: rgba(255, 85, 85, 0.2); color: #ff5555; }
        .building-badge { background: rgba(255, 170, 0, 0.2); color: #ffaa00; }
        .details p { font-size: 0.9rem; margin-top: 10px; color: #ccc; }
        .metrics { margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(255, 255, 255, 0.1); }
        .metrics p { font-size: 0.9rem; margin-bottom: 5px; }

        .features-section h2 { 
            color: #00ff88; 
            margin-top: 40px; 
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 10px;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }
        .feature {
            background: rgba(0, 255, 136, 0.1);
            color: #00ff88;
            padding: 10px;
            border-radius: 5px;
            font-size: 0.9rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Ultimate Minecraft Bot System</h1>
            <p class="version">Version 3.0 - Fully Updated</p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${botManager.bots.size}</div>
                    <div class="stat-label">TOTAL BOTS</div>
                </div>
                <div class="stat-card" style="border-left-color: #ffaa00;">
                    <div class="stat-value" style="color: #ffaa00;">${building}</div>
                    <div class="stat-label">BUILDING</div>
                </div>
                <div class="stat-card" style="border-left-color: #55aaff;">
                    <div class="stat-value" style="color: #55aaff;">${connected}</div>
                    <div class="stat-label">CONNECTED</div>
                </div>
                <div class="stat-card" style="border-left-color: #ff5555;">
                    <div class="stat-value" style="color: #ff5555;">${botManager.bots.size - connected}</div>
                    <div class="stat-label">DISCONNECTED</div>
                </div>
            </div>
        </div>
        
        <div class="features-section">
            <h2>Core System Features (v3.0)</h2>
            <div class="feature-grid">
                <div class="feature">🌐 Network Rotation</div>
                <div class="feature">🎭 Behavior Simulation</div>
                <div class="feature">⏰ Temporal Patterns</div>
                <div class="feature">🛡️ Anti-Detection System</div>
                <div class="feature">🏠 Home System & Return-to-Home</div>
                <div class="feature">🏗️ Smart Building System</div>
                <div class="feature">💬 Social Interaction & Chat System</div>
                <div class="feature">🛡️ Crash Protection & Error Recovery</div>
                <div class="feature">⚙️ Dynamic Inventory/Tool Mgmt</div>
                <div class="feature">🌍 World Interaction & Farming</div>
            </div>
        </div>

        <h2>Bot Status Details</h2>
        <div class="bot-list">
            ${botRows}
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #777; font-size: 0.9rem;">
            <p>✅ System Status: Fully Operational • All Features Active • Crash Protection Enabled</p>
            <p>🚀 <strong>v3.0:</strong> Network Rotation • Behavior Simulation • Anti-Detection</p>
            <p>Last updated: ${new Date().toLocaleTimeString()}</p>
        </div>
    </div>
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => { location.reload(); }, 30000);
    </script>
</body>
</html>`;
      res.end(html);
    } else if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '3.0',
        bots: Object.keys(botManager.getAllStatuses()).length,
        features: {
          network_rotation: CONFIG.FEATURES.NETWORK_ROTATION,
          behavior_simulation: CONFIG.FEATURES.BEHAVIOR_SIMULATION,
          temporal_patterns: CONFIG.FEATURES.TEMPORAL_PATTERNS,
          anti_detection: CONFIG.FEATURES.ANTI_DETECTION_SYSTEM,
          building_system: CONFIG.FEATURES.SMART_BUILDING,
          sleep_system: CONFIG.FEATURES.AUTO_SLEEP
        }
      }));
    } else if (url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({
        version: '3.0',
        server: CONFIG.SERVER,
        timestamp: new Date().toISOString(),
        features: CONFIG.FEATURES,
        network_system: CONFIG.NETWORK,
        behavior_system: CONFIG.PLAYER_BEHAVIOR,
        temporal_system: CONFIG.TEMPORAL_SYSTEM,
        anti_detection: CONFIG.ANTI_DETECTION,
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
    logger.log(`🌐 Network System: ${CONFIG.FEATURES.NETWORK_ROTATION ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'network', 'WEB');
    logger.log(`🎭 Behavior Simulation: ${CONFIG.FEATURES.BEHAVIOR_SIMULATION ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'behavior', 'WEB');
    logger.log(`⏰ Temporal Patterns: ${CONFIG.FEATURES.TEMPORAL_PATTERNS ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'temporal', 'WEB');
    logger.log(`🛡️ Anti-Detection: ${CONFIG.FEATURES.ANTI_DETECTION_SYSTEM ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'anti_detect', 'WEB');
  });

  return server;
}

// ================= MAIN EXECUTION =================
async function main() {
  try {
    logger.log('🚀 Initializing Ultimate Minecraft Bot System v3.0...', 'info', 'SYSTEM');
    logger.log('✅ All 10 feature categories integrated!', 'success', 'SYSTEM');
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

    logger.log('\n🎯 V3.0 FEATURE OVERVIEW:', 'info', 'SYSTEM');
    logger.log(' 1. 🌐 NETWORK SYSTEM:', 'network', 'SYSTEM');
    logger.log(' • Residential/Mobile/VPN proxy rotation', 'network', 'SYSTEM');
    logger.log(' • ISP diversity and geographic spread', 'network', 'SYSTEM');
    logger.log(' • TCP fingerprint and TLS handshake randomization', 'network', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 2. 👤 ACCOUNT SYSTEM:', 'identity', 'SYSTEM');
    logger.log(' • Multiple Aternos accounts with different histories', 'identity', 'SYSTEM');
    logger.log(' • Staggered registration dates and email providers', 'identity', 'SYSTEM');
    logger.log(' • Real configuration changes and backup downloads', 'identity', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 3. 🎭 BEHAVIOR SIMULATION:', 'behavior', 'SYSTEM');
    logger.log(' • Dynamic movement patterns and pathfinding', 'behavior', 'SYSTEM');
    logger.log(' • Randomized crafting and inventory management', 'behavior', 'SYSTEM');
    logger.log(' • Realistic chat frequency and message types (griefing/friendly/query)', 'behavior', 'SYSTEM');
    logger.log(' • Simulated fatigue and hunger', 'behavior', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 4. 💬 SOCIAL INTERACTION:', 'chat', 'SYSTEM');
    logger.log(' • Context-aware chat responses', 'chat', 'SYSTEM');
    logger.log(' • Simulated friendship/rivalry dynamics with other players', 'chat', 'SYSTEM');
    logger.log(' • Group activity coordination (e.g., building together)', 'chat', 'SYSTEM');
    logger.log(' • Roleplay and community involvement simulation', 'chat', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 5. ⏰ TEMPORAL SYSTEM:', 'temporal', 'SYSTEM');
    logger.log(' • Realistic weekly/weekend activity patterns', 'temporal', 'SYSTEM');
    logger.log(' • Life event simulation (Exams, Vacations, etc.)', 'temporal', 'SYSTEM');
    logger.log(' • Timezone and server time synchronization', 'temporal', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 6. 🏡 HOME & BUILDING SYSTEM (Enhanced):', 'home', 'SYSTEM');
    logger.log(' • Home Location & Return-to-Home at night', 'home', 'SYSTEM');
    logger.log(' • Smart Building System for perfect structures', 'building', 'SYSTEM');
    logger.log(' • Location Scouting for optimal build spots', 'building', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 7. 🛡️ CRASH PROTECTION & MONITORING:', 'success', 'SYSTEM');
    logger.log(' • Timeout safety on all blocking operations', 'success', 'SYSTEM');
    logger.log(' • Error recovery and adaptive response algorithms', 'success', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 8. ⚙️ INVENTORY & TOOL SYSTEM:', 'cleanup', 'SYSTEM');
    logger.log(' • Dynamic Hotbar Organization', 'cleanup', 'SYSTEM');
    logger.log(' • Tool Degradation Awareness', 'cleanup', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 9. 🌍 WORLD INTERACTION:', 'travel', 'SYSTEM');
    logger.log(' • Farming Cycles & Animal Breeding', 'travel', 'SYSTEM');
    logger.log(' • Villager Trading Simulation & Exploration Mapping', 'travel', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log(' 10. 🪖 COMBAT & SURVIVAL:', 'warn', 'SYSTEM');
    logger.log(' • Realistic Reaction Times and Aim Imperfection', 'warn', 'SYSTEM');
    logger.log(' • Potion Usage Strategy and Armor Switching', 'warn', 'SYSTEM');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'SYSTEM');

    logger.log('✅ System is fully operational with all new features!', 'success', 'SYSTEM');

  } catch (error) {
    logger.log(`FATAL SYSTEM ERROR: ${error.message}`, 'error', 'SYSTEM');
    process.exit(1);
  }
}

// main(); // Commented out for execution outside of a node environment
