// ============================================================
// 🚀 ULTIMATE MINECRAFT BOT SYSTEM v2.5
// 😴 Smart Sleep • Home System • Basic Activities
// ============================================================

const mineflayer = require('mineflayer');
const http = require('http');
const Vec3 = require('vec3').Vec3;

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE MINECRAFT BOT SYSTEM v2.5                                 ║
║   😴 Smart Sleep • Home System • Basic Activities                      ║
║   🤖 2 Bots • Occupied Bed Handling • Emergency Sleep                  ║
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
      activity: '🎯'
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
    EMERGENCY_SLEEP: true,
    OCCUPIED_BED_HANDLING: true
  },
  SLEEP_SYSTEM: {
    BREAK_BED_AFTER_SLEEP: true,
    BREAK_DELAY: 2000,
    BREAK_TIMEOUT: 10000,
    KEEP_BED_IF_PLAYER_NEARBY: true,
    BREAK_METHOD: 'dig',
    KEEP_HOME_BED: true,
    EMERGENCY_SLEEP_DISTANCE: 15,
    STOP_ACTIVITIES_AT_NIGHT: true,
    OCCUPIED_BED_HANDLING: true,
    MAX_OCCUPIED_RETRIES: 3,
    MIN_BED_DISTANCE: 2,
    ALTERNATIVE_BED_RADIUS: 5
  },
  HOME: {
    SET_SPAWN_AS_HOME: true,
    HOME_RADIUS: 20,
    HOME_RETURN_DISTANCE: 50,
    HOME_BED_POSITION: { x: 0, y: 65, z: 0 },
    MARK_HOME_WITH_TORCHES: true
  }
};

// ================= ENHANCED PERFECT SLEEP SYSTEM WITH OCCUPIED BED HANDLING =================
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
      returningHome: false,
      emergencySleepMode: false,
      stoppedActivities: false,
      lastBedOccupiedCheck: 0,
      occupiedBedRetries: 0,
      maxOccupiedRetries: 3
    };
    
    this.bedBreakingInterval = null;
    this.wakeCheckInterval = null;
    this.returnHomeTimeout = null;
    this.nightCheckInterval = null;
    this.occupiedBedCheckInterval = null;
  }

  // ================= OCCUPIED BED DETECTION =================
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
              logger.log(`Player ${player.username} is near bed at ${bedPosition.x},${bedPosition.y},${bedPosition.z}`, 'info', this.botName);
              return true;
            }
          }
        }
      }
      
      const bedBlock = this.bot.blockAt(bedPos);
      if (bedBlock && this.isBedBlock(bedBlock)) {
        const metadata = bedBlock.metadata;
        if (metadata !== undefined && metadata !== 0) {
          logger.log(`Bed at ${bedPosition.x},${bedPosition.y},${bedPosition.z} appears occupied (metadata: ${metadata})`, 'info', this.botName);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.log(`Bed occupation check error: ${error.message}`, 'debug', this.botName);
      return false;
    }
  }

  async findAvailableBed() {
    logger.log('Searching for available bed', 'sleep', this.botName);
    
    if (this.state.hasHomeBed && this.state.homeBedPosition) {
      if (!this.isBedOccupied(this.state.homeBedPosition)) {
        const bedBlock = this.bot.blockAt(new Vec3(
          this.state.homeBedPosition.x,
          this.state.homeBedPosition.y,
          this.state.homeBedPosition.z
        ));
        
        if (bedBlock && this.isBedBlock(bedBlock)) {
          logger.log('Home bed is available', 'sleep', this.botName);
          return { bed: bedBlock, location: this.state.homeBedPosition, type: 'home' };
        }
      } else {
        logger.log('Home bed is occupied, looking for alternative', 'warn', this.botName);
      }
    }
    
    try {
      const beds = this.bot.findBlocks({
        matching: block => {
          if (!block) return false;
          const name = this.bot.registry.blocks[block.type]?.name;
          return name && name.includes('bed');
        },
        maxDistance: 15,
        count: 10
      });
      
      if (beds && beds.length > 0) {
        logger.log(`Found ${beds.length} nearby bed(s)`, 'sleep', this.botName);
        
        const botPos = this.bot.entity.position;
        beds.sort((a, b) => {
          const distA = botPos.distanceTo(new Vec3(a.x, a.y, a.z));
          const distB = botPos.distanceTo(new Vec3(b.x, b.y, b.z));
          return distA - distB;
        });
        
        for (const bedPos of beds) {
          const position = { x: bedPos.x, y: bedPos.y, z: bedPos.z };
          
          if (!this.isBedOccupied(position)) {
            const bedBlock = this.bot.blockAt(new Vec3(position.x, position.y, position.z));
            
            if (bedBlock && this.isBedBlock(bedBlock)) {
              logger.log(`Found available bed at ${position.x}, ${position.y}, ${position.z}`, 'sleep', this.botName);
              return { bed: bedBlock, location: position, type: 'existing' };
            }
          } else {
            logger.log(`Bed at ${position.x},${position.y},${position.z} is occupied, skipping`, 'info', this.botName);
          }
        }
      }
    } catch (error) {
      logger.log(`Bed search error: ${error.message}`, 'debug', this.botName);
    }
    
    logger.log('No available beds found nearby', 'warn', this.botName);
    return null;
  }

  async placeAlternativeBed(occupiedPosition = null) {
    logger.log('Placing alternative bed for sleeping', 'sleep', this.botName);
    
    if (!this.state.bedInInventory) {
      const success = await this.getBedFromCreative();
      if (!success) {
        logger.log('Failed to get bed from creative', 'warn', this.botName);
        return null;
      }
    }
    
    const bedPosition = await this.findAlternativeBedLocation(occupiedPosition);
    
    if (!bedPosition) {
      logger.log('Could not find suitable location for alternative bed', 'warn', this.botName);
      return null;
    }
    
    const placed = await this.safePlaceBed(bedPosition);
    
    if (placed) {
      this.state.hasBedPlaced = true;
      this.state.bedPosition = bedPosition;
      this.state.bedInInventory = false;
      this.state.bedPlacements++;
      this.state.failedSleepAttempts = 0;
      this.state.occupiedBedRetries = 0;
      
      logger.log(`Alternative bed placed at ${bedPosition.x}, ${bedPosition.y}, ${bedPosition.z}`, 'success', this.botName);
      
      const bedBlock = this.bot.blockAt(new Vec3(bedPosition.x, bedPosition.y, bedPosition.z));
      return bedBlock;
    } else {
      logger.log('Failed to place alternative bed', 'warn', this.botName);
      return null;
    }
  }

  async findAlternativeBedLocation(occupiedPosition = null) {
    if (!this.bot.entity) return null;
    
    const pos = this.bot.entity.position;
    const baseX = Math.floor(pos.x);
    const baseY = Math.floor(pos.y);
    const baseZ = Math.floor(pos.z);
    
    for (let radius = 1; radius <= 5; radius++) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const offsetX = Math.round(Math.cos(angle) * radius);
        const offsetZ = Math.round(Math.sin(angle) * radius);
        
        const checkX = baseX + offsetX;
        const checkZ = baseZ + offsetZ;
        
        if (occupiedPosition && 
            checkX === occupiedPosition.x && 
            checkZ === occupiedPosition.z) {
          continue;
        }
        
        const position = { x: checkX, y: baseY, z: checkZ };
        
        if (await this.isSuitableForBed(position)) {
          if (occupiedPosition) {
            const dx = checkX - occupiedPosition.x;
            const dz = checkZ - occupiedPosition.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 2) {
              continue;
            }
          }
          
          return position;
        }
      }
    }
    
    return await this.findBedPlacementLocation();
  }

  async sleepImmediately() {
    if (this.state.isSleeping) return;
    
    logger.log('Initiating sleep sequence with occupied bed checking', 'sleep', this.botName);
    
    this.stopAllActivities();
    
    const time = this.bot.time ? this.bot.time.time : 0;
    const isNight = time >= 13000 && time <= 23000;
    
    if (isNight) {
      this.state.emergencySleepMode = true;
      await this.emergencySleep();
      return;
    }
    
    const availableBed = await this.findAvailableBed();
    
    if (availableBed) {
      await this.sleepInBed(availableBed.bed);
    } else {
      await this.placeBedAndSleepWithRetry();
    }
  }

  async placeBedAndSleepWithRetry() {
    logger.log('No available beds found - Placing new bed', 'info', this.botName);
    
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
    
    if (this.isBedOccupied(bedPos)) {
      logger.log(`Intended bed position is occupied, finding alternative`, 'warn', this.botName);
      await this.placeAlternativeBed(bedPos);
      return;
    }
    
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

  async sleepInBed(bedBlock) {
    try {
      const bedPos = bedBlock.position;
      if (this.isBedOccupied({ x: bedPos.x, y: bedPos.y, z: bedPos.z })) {
        logger.log(`Bed at ${bedPos.x},${bedPos.y},${bedPos.z} became occupied, finding alternative`, 'warn', this.botName);
        
        this.state.occupiedBedRetries++;
        
        if (this.state.occupiedBedRetries <= this.state.maxOccupiedRetries) {
          logger.log(`Attempt ${this.state.occupiedBedRetries}/${this.state.maxOccupiedRetries} to find alternative bed`, 'info', this.botName);
          
          const alternativeBed = await this.placeAlternativeBed({ x: bedPos.x, y: bedPos.y, z: bedPos.z });
          
          if (alternativeBed) {
            await this.sleepInBed(alternativeBed);
          } else {
            await this.tryDirectSleep();
          }
        } else {
          logger.log(`Max occupied bed retries reached (${this.state.maxOccupiedRetries})`, 'warn', this.botName);
          await this.tryDirectSleep();
        }
        
        return;
      }
      
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
      this.state.occupiedBedRetries = 0;
      
      logger.log(`Successfully sleeping in bed at ${bedPos.x},${bedPos.y},${bedPos.z}`, 'sleep', this.botName);
      
      this.startMorningMonitor();
      
      setTimeout(() => {
        if (this.state.isSleeping && this.bot && this.bot.isSleeping) {
          this.wakeAndCleanup();
        }
      }, 45000);
      
      this.startOccupiedBedMonitoring(bedPos);
      
    } catch (error) {
      logger.log(`Sleep attempt failed: ${error.message}`, 'error', this.botName);
      this.state.isSleeping = false;
      this.state.failedSleepAttempts++;
      
      if (error.message.includes('occupied') || error.message.includes('not available')) {
        this.state.occupiedBedRetries++;
        
        if (this.state.occupiedBedRetries <= this.state.maxOccupiedRetries) {
          logger.log(`Bed appears occupied (${this.state.occupiedBedRetries}/${this.state.maxOccupiedRetries}), placing alternative`, 'warn', this.botName);
          
          const alternativeBed = await this.placeAlternativeBed(bedBlock.position);
          if (alternativeBed) {
            await this.sleepInBed(alternativeBed);
          } else {
            await this.tryDirectSleep();
          }
        } else {
          logger.log(`Max occupied bed retries reached, trying direct sleep`, 'warn', this.botName);
          await this.tryDirectSleep();
        }
      } else if (this.state.failedSleepAttempts < 2) {
        await this.delay(1000);
        await this.tryDirectSleep();
      }
    }
  }

  startOccupiedBedMonitoring(bedPosition) {
    if (this.occupiedBedCheckInterval) {
      clearInterval(this.occupiedBedCheckInterval);
    }
    
    this.occupiedBedCheckInterval = setInterval(() => {
      if (!this.bot || !this.state.isSleeping) {
        clearInterval(this.occupiedBedCheckInterval);
        return;
      }
      
      if (this.isBedOccupied(bedPosition)) {
        logger.log('Bed became occupied while sleeping - Waking up and finding alternative', 'warn', this.botName);
        
        if (this.bot.isSleeping) {
          this.bot.wake();
        }
        
        this.state.isSleeping = false;
        clearInterval(this.occupiedBedCheckInterval);
        
        setTimeout(async () => {
          await this.handleOccupiedBedSituation(bedPosition);
        }, 1000);
      }
    }, 3000);
  }

  async handleOccupiedBedSituation(occupiedPosition) {
    logger.log('Handling occupied bed situation', 'sleep', this.botName);
    
    const time = this.bot.time ? this.bot.time.time : 0;
    const isNight = time >= 13000 && time <= 23000;
    
    if (!isNight) {
      logger.log('It\'s no longer night, stopping sleep attempt', 'info', this.botName);
      return;
    }
    
    const availableBed = await this.findAvailableBed();
    
    if (availableBed) {
      logger.log('Found alternative bed, attempting to sleep', 'sleep', this.botName);
      await this.sleepInBed(availableBed.bed);
    } else {
      logger.log('Placing new bed away from occupied bed', 'sleep', this.botName);
      const alternativeBed = await this.placeAlternativeBed(occupiedPosition);
      
      if (alternativeBed) {
        await this.sleepInBed(alternativeBed);
      } else {
        logger.log('Could not place alternative bed, trying direct sleep', 'warn', this.botName);
        await this.tryDirectSleep();
      }
    }
  }

  startNightMonitoring() {
    if (this.nightCheckInterval) {
      clearInterval(this.nightCheckInterval);
    }
    
    this.nightCheckInterval = setInterval(() => {
      if (!this.bot || !this.bot.time) return;
      
      const time = this.bot.time.time;
      const isNight = time >= 13000 && time <= 23000;
      
      if (isNight && !this.state.stoppedActivities && CONFIG.SLEEP_SYSTEM.STOP_ACTIVITIES_AT_NIGHT) {
        this.emergencyNightProcedure();
      }
      
      if (isNight && !this.state.isSleeping && this.state.emergencySleepMode) {
        this.emergencySleep();
      }
      
      if (!isNight && this.state.emergencySleepMode) {
        this.state.emergencySleepMode = false;
        this.state.stoppedActivities = false;
        logger.log('Daytime - emergency mode deactivated', 'day', this.botName);
      }
      
    }, 5000);
  }

  emergencyNightProcedure() {
    logger.log('⚠️ Night detected - Stopping all activities immediately', 'night', this.botName);
    
    this.state.stoppedActivities = true;
    this.state.emergencySleepMode = true;
    
    this.stopAllActivities();
    
    if (this.state.hasHomeBed) {
      const distanceFromHome = this.getDistanceFromHome();
      
      if (distanceFromHome > CONFIG.HOME.HOME_RETURN_DISTANCE) {
        logger.log(`Far from home (${Math.round(distanceFromHome)} blocks) - Emergency return initiated`, 'emergency', this.botName);
        this.emergencyReturnHome();
      } else {
        setTimeout(() => {
          this.emergencySleep();
        }, 2000);
      }
    } else {
      setTimeout(() => {
        this.emergencySleep();
      }, 2000);
    }
  }

  async emergencyReturnHome() {
    if (this.state.returningHome) return;
    
    this.state.returningHome = true;
    logger.log('EMERGENCY: Returning home for night', 'emergency', this.botName);
    
    try {
      this.stopAllActivities();
      await this.quickNavigateToHome();
      await this.emergencySleepAtHome();
      
    } catch (error) {
      logger.log(`Emergency return failed: ${error.message} - Finding nearby sleep spot`, 'error', this.botName);
      await this.findEmergencySleepSpot();
    } finally {
      this.state.returningHome = false;
    }
  }

  async quickNavigateToHome() {
    if (!this.state.homeBedPosition || !this.bot.entity) return;
    
    const homePos = this.state.homeBedPosition;
    const targetVec = new Vec3(homePos.x, homePos.y, homePos.z);
    
    logger.log(`Emergency navigation to home at ${homePos.x}, ${homePos.y}, ${homePos.z}`, 'emergency', this.botName);
    
    await this.bot.lookAt(targetVec);
    this.bot.setControlState('sprint', true);
    this.bot.setControlState('forward', true);
    
    await this.delay(15000);
    
    this.bot.setControlState('forward', false);
    this.bot.setControlState('sprint', false);
    
    const currentPos = this.bot.entity.position;
    const distance = currentPos.distanceTo(targetVec);
    
    if (distance < 10) {
      logger.log('Emergency navigation successful - Close to home', 'success', this.botName);
    } else {
      logger.log(`Still ${Math.round(distance)} blocks from home - Will sleep nearby`, 'warn', this.botName);
    }
  }

  async emergencySleep() {
    if (this.state.isSleeping) return;
    
    logger.log('⚠️ EMERGENCY SLEEP ACTIVATED - Finding sleep spot', 'emergency', this.botName);
    
    this.stopAllActivities();
    
    if (this.state.hasHomeBed) {
      if (!this.isBedOccupied(this.state.homeBedPosition)) {
        const success = await this.trySleepInHomeBed();
        if (success) return;
      } else {
        logger.log('Home bed is occupied during emergency', 'warn', this.botName);
      }
    }
    
    const availableBed = await this.findAvailableBed();
    if (availableBed) {
      await this.sleepInBed(availableBed.bed);
      return;
    }
    
    await this.emergencyPlaceBedAndSleep();
  }

  async emergencySleepAtHome() {
    if (!this.state.hasHomeBed || !this.state.homeBedPosition) {
      logger.log('No home bed - Creating emergency home bed', 'emergency', this.botName);
      await this.createEmergencyHomeBed();
    }
    
    const bedPos = this.state.homeBedPosition;
    const bedBlock = this.bot.blockAt(new Vec3(bedPos.x, bedPos.y, bedPos.z));
    
    if (bedBlock && this.isBedBlock(bedBlock)) {
      await this.sleepInBed(bedBlock);
    } else {
      logger.log('Home bed missing - Placing emergency bed', 'emergency', this.botName);
      await this.emergencyPlaceBedAtHome();
    }
  }

  async createEmergencyHomeBed() {
    try {
      this.bot.chat(`/give ${this.bot.username} bed 1`);
      await this.delay(1000);
      
      const pos = this.bot.entity.position;
      const bedPos = {
        x: Math.floor(pos.x),
        y: Math.floor(pos.y),
        z: Math.floor(pos.z)
      };
      
      const placed = await this.safePlaceBed(bedPos);
      if (placed) {
        this.state.homeBedPosition = bedPos;
        this.state.hasHomeBed = true;
        logger.log(`Emergency home bed placed at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'emergency', this.botName);
        return true;
      }
    } catch (error) {
      logger.log(`Emergency home bed creation failed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async emergencyPlaceBedAtHome() {
    if (!this.state.homeBedPosition) return;
    
    const homePos = this.state.homeBedPosition;
    
    const positions = [
      { x: homePos.x, y: homePos.y, z: homePos.z },
      { x: homePos.x + 1, y: homePos.y, z: homePos.z },
      { x: homePos.x, y: homePos.y, z: homePos.z + 1 },
      { x: homePos.x - 1, y: homePos.y, z: homePos.z },
      { x: homePos.x, y: homePos.y, z: homePos.z - 1 }
    ];
    
    for (const position of positions) {
      const placed = await this.safePlaceBed(position);
      if (placed) {
        this.state.homeBedPosition = position;
        this.state.hasHomeBed = true;
        
        const bedBlock = this.bot.blockAt(new Vec3(position.x, position.y, position.z));
        if (bedBlock) {
          await this.sleepInBed(bedBlock);
          return true;
        }
      }
    }
    
    return false;
  }

  async findEmergencySleepSpot() {
    logger.log('Searching for emergency sleep spot', 'emergency', this.botName);
    
    const pos = this.bot.entity.position;
    
    for (let radius = 0; radius <= CONFIG.SLEEP_SYSTEM.EMERGENCY_SLEEP_DISTANCE; radius++) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const checkX = Math.floor(pos.x + Math.cos(angle) * radius);
        const checkZ = Math.floor(pos.z + Math.sin(angle) * radius);
        
        const groundLevel = await this.findGroundLevel(checkX, checkZ);
        if (groundLevel === null) continue;
        
        const position = { x: checkX, y: groundLevel, z: checkZ };
        
        if (await this.isSuitableForBed(position)) {
          logger.log(`Found emergency sleep spot at ${position.x}, ${position.y}, ${position.z}`, 'emergency', this.botName);
          
          const placed = await this.safePlaceBed(position);
          if (placed) {
            const bedBlock = this.bot.blockAt(new Vec3(position.x, position.y, position.z));
            if (bedBlock) {
              await this.sleepInBed(bedBlock);
              return true;
            }
          }
        }
      }
    }
    
    logger.log('No emergency sleep spot found - Trying direct ground sleep', 'emergency', this.botName);
    await this.tryDirectSleep();
    return false;
  }

  async emergencyPlaceBedAndSleep() {
    logger.log('Placing emergency bed with occupancy check', 'emergency', this.botName);
    
    await this.getBedFromCreative();
    
    const pos = this.bot.entity.position;
    
    for (let radius = 1; radius <= 3; radius++) {
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          if (x === 0 && z === 0) continue;
          
          const checkX = Math.floor(pos.x) + x;
          const checkY = Math.floor(pos.y);
          const checkZ = Math.floor(pos.z) + z;
          
          const position = { x: checkX, y: checkY, z: checkZ };
          
          if (await this.isSuitableForBed(position) && !this.isBedOccupied(position)) {
            const placed = await this.safePlaceBed(position);
            if (placed) {
              const bedBlock = this.bot.blockAt(new Vec3(position.x, position.y, position.z));
              if (bedBlock) {
                await this.sleepInBed(bedBlock);
                return true;
              }
            }
          }
        }
      }
    }
    
    logger.log('Emergency bed placement failed - Trying direct sleep', 'emergency', this.botName);
    await this.tryDirectSleep();
    return false;
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

  async safePlaceBed(position) {
    try {
      this.bot.setQuickBarSlot(0);
      
      const lookPos = new Vec3(position.x, position.y, position.z);
      await this.bot.lookAt(lookPos);
      
      const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
      const referenceBlock = this.bot.blockAt(blockBelowPos);
      
      if (referenceBlock) {
        const offset = new Vec3(0, 1, 0);
        
        return await this.safePlaceBlockWithTimeout(referenceBlock, offset, 'bed');
      }
    } catch (error) {
      logger.log(`Safe bed placement failed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async safePlaceBlockWithTimeout(block, offset, blockType = '') {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logger.log(`Block placement timeout for ${blockType} - Skipping`, 'warn', this.botName);
        resolve(false);
      }, 8000);
      
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

  async trySleepInHomeBed() {
    if (!this.state.hasHomeBed || !this.state.homeBedPosition) return false;
    
    const bedPos = this.state.homeBedPosition;
    const bedBlock = this.bot.blockAt(new Vec3(bedPos.x, bedPos.y, bedPos.z));
    
    if (bedBlock && this.isBedBlock(bedBlock)) {
      await this.sleepInBed(bedBlock);
      return true;
    }
    return false;
  }

  isBedBlock(block) {
    if (!block) return false;
    const name = this.bot.registry.blocks[block.type]?.name;
    return name && name.includes('bed');
  }

  async findGroundLevel(x, z) {
    for (let y = 100; y >= 0; y--) {
      const block = this.bot.blockAt(new Vec3(x, y, z));
      const blockAbove = this.bot.blockAt(new Vec3(x, y + 1, z));
      
      if (block && block.name !== 'air' && 
          block.name !== 'water' && block.name !== 'lava' &&
          blockAbove && blockAbove.name === 'air') {
        return y + 1;
      }
    }
    return null;
  }

  async isSuitableForBed(position) {
    const blockPos = new Vec3(position.x, position.y, position.z);
    const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
    
    const block = this.bot.blockAt(blockPos);
    const blockBelow = this.bot.blockAt(blockBelowPos);
    
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
      }
      
      this.state.isSleeping = false;
      logger.log('Successfully woke up', 'wake', this.botName);
      
      await this.delay(CONFIG.SLEEP_SYSTEM.BREAK_DELAY);
      
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
    
    if (this.state.hasHomeBed && this.state.bedPosition && 
        this.state.bedPosition.x === this.state.homeBedPosition.x &&
        this.state.bedPosition.y === this.state.homeBedPosition.y &&
        this.state.bedPosition.z === this.state.homeBedPosition.z &&
        CONFIG.SLEEP_SYSTEM.KEEP_HOME_BED) {
      logger.log('Keeping home bed', 'home', this.botName);
      this.resetState();
      return;
    }
    
    if (this.isBedOccupied(this.state.bedPosition)) {
      logger.log(`Cannot break bed at ${this.state.bedPosition.x},${this.state.bedPosition.y},${this.state.bedPosition.z} - It's occupied`, 'warn', this.botName);
      this.resetState();
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
        
        return await this.safeDigWithTimeout(bedBlock);
      } else {
        logger.log('No bed found at expected position', 'warn', this.botName);
      }
    } catch (error) {
      logger.log(`Failed to break bed at position: ${error.message}`, 'error', this.botName);
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
            if (player.entity.isSleeping !== undefined && player.entity.isSleeping) {
              logger.log(`Player ${player.username} is sleeping nearby`, 'info', this.botName);
              return true;
            }
            
            if (this.state.bedPosition) {
              const bedPos = new Vec3(this.state.bedPosition.x, this.state.bedPosition.y, this.state.bedPosition.z);
              const distanceToBed = player.entity.position.distanceTo(bedPos);
              if (distanceToBed < 3) {
                logger.log(`Player ${player.username} is near our bed`, 'info', this.botName);
                return true;
              }
            }
            
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
    this.state.occupiedBedRetries = 0;
    
    if (this.bedBreakingInterval) {
      clearInterval(this.bedBreakingInterval);
      this.bedBreakingInterval = null;
    }
    
    if (this.wakeCheckInterval) {
      clearInterval(this.wakeCheckInterval);
      this.wakeCheckInterval = null;
    }
    
    if (this.occupiedBedCheckInterval) {
      clearInterval(this.occupiedBedCheckInterval);
      this.occupiedBedCheckInterval = null;
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
      
      if (this.occupiedBedCheckInterval) {
        clearInterval(this.occupiedBedCheckInterval);
        this.occupiedBedCheckInterval = null;
      }
      
      if (CONFIG.FEATURES.BED_MANAGEMENT && this.state.hasBedPlaced && this.state.bedPosition) {
        if (this.isBedOccupied(this.state.bedPosition)) {
          logger.log(`Cannot break bed - It's occupied`, 'warn', this.botName);
        } else if (CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP) {
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

  checkTimeAndSleep() {
    if (!this.bot || !this.bot.time || !CONFIG.FEATURES.AUTO_SLEEP) return;
    
    const time = this.bot.time.time;
    const isNight = time >= 13000 && time <= 23000;
    
    if (this.bot.isSleeping !== undefined) {
      this.state.isSleeping = this.bot.isSleeping;
    }
    
    if (isNight && !this.state.isSleeping) {
      if (!this.state.emergencySleepMode) {
        this.state.emergencySleepMode = true;
        this.emergencySleep();
      }
    } else if (!isNight && this.state.isSleeping) {
      logger.log(`Morning detected (${time}) - Waking up`, 'day', this.botName);
      this.wakeAndCleanup();
      this.state.emergencySleepMode = false;
      this.state.stoppedActivities = false;
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
      lastSleepTime: this.state.lastSleepTime ? 
        new Date(this.state.lastSleepTime).toLocaleTimeString() : 'Never',
      autoBedBreaking: CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP,
      hasHomeBed: this.state.hasHomeBed,
      homeLocation: this.state.homeBedPosition,
      emergencyMode: this.state.emergencySleepMode,
      stoppedActivities: this.state.stoppedActivities,
      occupiedBedRetries: this.state.occupiedBedRetries,
      maxOccupiedRetries: this.state.maxOccupiedRetries
    };
  }

  async initializeHomeSystem() {
    if (!CONFIG.FEATURES.HOME_SYSTEM || !this.bot.entity) return;
    
    try {
      if (CONFIG.HOME.SET_SPAWN_AS_HOME) {
        const spawnPos = this.bot.entity.position;
        this.state.homeBedPosition = {
          x: Math.floor(spawnPos.x),
          y: Math.floor(spawnPos.y),
          z: Math.floor(spawnPos.z)
        };
        
        logger.log(`Home location set at ${this.state.homeBedPosition.x}, ${this.state.homeBedPosition.y}, ${this.state.homeBedPosition.z}`, 'home', this.botName);
        
        await this.placeHomeBed();
        
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
      
      await this.getBedFromCreative();
      
      const bedPos = await this.findBedPlacementNearHome();
      if (!bedPos) {
        logger.log('Could not find position for home bed', 'warn', this.botName);
        return false;
      }
      
      const placed = await this.safePlaceBed(bedPos);
      if (placed) {
        this.state.homeBedPosition = bedPos;
        this.state.hasHomeBed = true;
        this.state.bedInInventory = false;
        
        logger.log(`Home bed placed at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'success', this.botName);
        
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
          
          const referenceBlock = this.bot.blockAt(new Vec3(position.x, position.y - 1, position.z));
          if (referenceBlock) {
            await this.safePlaceBlockWithTimeout(referenceBlock, new Vec3(0, 1, 0), 'torch');
          }
          await this.delay(200);
        }
      }
      
      logger.log('Home marked with torches', 'home', this.botName);
    } catch (error) {
      // Ignore errors in decoration
    }
  }
}

// ================= SIMPLIFIED CREATIVE BOT =================
class SimpleCreativeBot {
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
    this.activityTimeout = null;
    this.dayActivityInterval = null;
    
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
    
    this.bot.on('blockBroken', () => {
      this.state.metrics.blocksBroken++;
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
    
    setTimeout(() => {
      this.initializeCreativeMode();
    }, 2000);
    
    setTimeout(() => {
      this.initializeHomeSystem();
    }, 5000);
    
    setTimeout(() => {
      this.sleepSystem.startNightMonitoring();
      this.startDaytimeActivitySystem();
      this.startAntiAFKSystem();
    }, 8000);
    
    logger.log(`All systems initialized`, 'success', this.state.username);
    logger.log(`😴 Smart Sleep: ${CONFIG.FEATURES.AUTO_SLEEP ? 'ENABLED' : 'DISABLED'}`, 'sleep', this.state.username);
    logger.log(`🚫🛏️ Occupied Bed Handling: ${CONFIG.FEATURES.OCCUPIED_BED_HANDLING ? 'ENABLED' : 'DISABLED'}`, 'occupied_bed', this.state.username);
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
          this.giveBasicItems();
        }, 3000);
      }
    };
    
    setCreativeMode();
    setTimeout(setCreativeMode, 5000);
    setTimeout(setCreativeMode, 10000);
  }

  giveBasicItems() {
    if (!this.bot) return;
    
    const items = [
      'bed',
      'white_bed',
      'stone 64',
      'oak_planks 64',
      'torch 64',
      'crafting_table',
      'chest',
      'furnace'
    ];
    
    items.forEach((item, index) => {
      setTimeout(() => {
        if (this.bot) {
          this.bot.chat(`/give ${this.bot.username} ${item}`);
        }
      }, index * 200);
    });
    
    logger.log(`Basic items granted`, 'success', this.state.username);
  }

  startDaytimeActivitySystem() {
    if (this.dayActivityInterval) {
      clearInterval(this.dayActivityInterval);
    }
    
    this.dayActivityInterval = setInterval(() => {
      if (!this.bot || !this.bot.entity || this.state.isSleeping) {
        return;
      }
      
      if (!this.canPerformDaytimeActivities()) {
        return;
      }
      
      const activity = this.selectDaytimeActivity();
      this.state.activity = activity;
      this.performDaytimeActivity(activity);
      
    }, 15000 + Math.random() * 10000);
    
    logger.log(`Daytime activity system started`, 'success', this.state.username);
  }

  canPerformDaytimeActivities() {
    if (!this.bot || !this.bot.time) return false;
    
    const time = this.bot.time.time;
    const isDaytime = time >= 0 && time < 13000;
    
    if (this.sleepSystem && this.sleepSystem.state.emergencySleepMode) {
      return false;
    }
    
    if (this.sleepSystem && this.sleepSystem.state.stoppedActivities) {
      return false;
    }
    
    return isDaytime;
  }

  selectDaytimeActivity() {
    const activities = this.config.activities || ['exploring'];
    
    if (this.config.personality === 'relaxed') {
      const weighted = [
        'exploring', 'exploring', 'exploring',
        'socializing', 'socializing',
        'resting',
        'simple_block_activity'
      ];
      return weighted[Math.floor(Math.random() * weighted.length)];
    } else {
      const weighted = [
        'patrolling', 'patrolling', 'patrolling',
        'observing', 'observing',
        'guarding',
        'simple_block_activity'
      ];
      return weighted[Math.floor(Math.random() * weighted.length)];
    }
  }

  performDaytimeActivity(activity) {
    logger.log(`Performing daytime activity: ${activity}`, 'activity', this.state.username);
    
    if (!this.bot) return;
    
    switch (activity) {
      case 'exploring':
      case 'patrolling':
        this.performExplorationActivity();
        break;
        
      case 'socializing':
      case 'observing':
        this.performObservationActivity();
        break;
        
      case 'resting':
      case 'guarding':
        this.performRestingActivity();
        break;
        
      case 'simple_block_activity':
        this.performSimpleBlockActivity();
        break;
        
      default:
        this.performIdleActivity();
    }
  }

  performSimpleBlockActivity() {
    logger.log('Performing simple block activity', 'activity', this.state.username);
    
    // Place a block
    const pos = this.bot.entity.position;
    const blockPos = {
      x: Math.floor(pos.x) + Math.floor(Math.random() * 3) - 1,
      y: Math.floor(pos.y),
      z: Math.floor(pos.z) + Math.floor(Math.random() * 3) - 1
    };
    
    // Get a random block
    const blocks = ['stone', 'oak_planks', 'dirt', 'cobblestone'];
    const blockType = blocks[Math.floor(Math.random() * blocks.length)];
    
    // Give block first
    this.bot.chat(`/give ${this.bot.username} ${blockType} 1`);
    
    setTimeout(() => {
      // Try to place block
      const targetVec = new Vec3(blockPos.x, blockPos.y, blockPos.z);
      this.bot.lookAt(targetVec);
      
      setTimeout(() => {
        const blockBelowPos = new Vec3(blockPos.x, blockPos.y - 1, blockPos.z);
        const referenceBlock = this.bot.blockAt(blockBelowPos);
        
        if (referenceBlock) {
          this.bot.placeBlock(referenceBlock, new Vec3(0, 1, 0))
            .then(() => {
              logger.log(`Placed ${blockType} block`, 'activity', this.state.username);
              
              // Wait a bit then break it
              setTimeout(() => {
                const placedBlock = this.bot.blockAt(targetVec);
                if (placedBlock) {
                  this.bot.dig(placedBlock)
                    .then(() => {
                      logger.log(`Broke ${blockType} block`, 'activity', this.state.username);
                    })
                    .catch(() => {
                      // Ignore errors
                    });
                }
              }, 2000 + Math.random() * 3000);
            })
            .catch(() => {
              // Ignore placement errors
            });
        }
      }, 500);
    }, 1000);
  }

  performExplorationActivity() {
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    this.bot.setControlState(direction, true);
    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState(direction, false);
      }
    }, 2000 + Math.random() * 2000);
    
    this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
  }

  performObservationActivity() {
    this.bot.look(Math.random() * Math.PI * 2, -Math.PI / 4);
    
    // Occasionally turn head
    setTimeout(() => {
      if (this.bot) {
        this.bot.look(Math.random() * Math.PI, -Math.PI / 6);
      }
    }, 1000 + Math.random() * 2000);
  }

  performRestingActivity() {
    this.bot.look(Math.random() * Math.PI * 0.5, Math.random() * Math.PI * 0.5 - Math.PI * 0.25);
    
    // Occasionally look around
    if (Math.random() < 0.3) {
      setTimeout(() => {
        if (this.bot) {
          this.bot.look(Math.random() * Math.PI, 0);
        }
      }, 1000);
    }
  }

  performIdleActivity() {
    this.bot.look(Math.random() * Math.PI * 0.3, Math.random() * Math.PI * 0.3 - Math.PI * 0.15);
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
    
    if (this.config.personality === 'relaxed') {
      const relaxedResponses = [
        "Just enjoying the day!",
        "It's so peaceful here.",
        "Taking it easy today.",
        "Nice weather we're having!",
        "Just resting for a bit.",
        "What a beautiful place!"
      ];
      return relaxedResponses[Math.floor(Math.random() * relaxedResponses.length)];
    } else {
      const vigilantResponses = [
        "Keeping watch over the area.",
        "Everything seems secure.",
        "Staying vigilant!",
        "Just doing my rounds.",
        "All quiet on my watch.",
        "Keeping an eye out."
      ];
      return vigilantResponses[Math.floor(Math.random() * vigilantResponses.length)];
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
    
    if (this.dayActivityInterval) {
      clearInterval(this.dayActivityInterval);
      this.dayActivityInterval = null;
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
      metrics: {
        messages: this.state.metrics.messagesSent,
        blocksPlaced: this.state.metrics.blocksPlaced,
        blocksBroken: this.state.metrics.blocksBroken,
        distance: this.state.metrics.distanceTraveled,
        sleepCycles: sleepStatus.sleepCycles || 0,
        connectionAttempts: this.state.metrics.connectionAttempts
      },
      sleepInfo: {
        bedPlacements: sleepStatus.bedPlacements || 0,
        failedAttempts: sleepStatus.failedSleepAttempts || 0,
        bedsBroken: sleepStatus.bedsBroken || 0,
        autoBedBreaking: sleepStatus.autoBedBreaking || false,
        lastBedBreakTime: sleepStatus.lastBedBreakTime || 'Never',
        hasHomeBed: sleepStatus.hasHomeBed || false,
        emergencyMode: sleepStatus.emergencyMode || false,
        occupiedBedRetries: sleepStatus.occupiedBedRetries || 0
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
    logger.log('🚀 STARTING ULTIMATE BOT SYSTEM v2.5', 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log(`Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`, 'info', 'SYSTEM');
    logger.log(`Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`, 'info', 'SYSTEM');
    logger.log(`Features: Smart Sleep • Occupied Bed Handling • Home System`, 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'SYSTEM');
    
    this.isRunning = true;
    
    logger.log(`Initial delay: ${CONFIG.SYSTEM.INITIAL_DELAY / 1000} seconds`, 'info', 'SYSTEM');
    await this.delay(CONFIG.SYSTEM.INITIAL_DELAY);
    
    for (let i = 0; i < CONFIG.BOTS.length; i++) {
      const botConfig = CONFIG.BOTS[i];
      const bot = new SimpleCreativeBot(botConfig, i);
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
    
    logger.log(`🎯 KEY FEATURES v2.5:`, 'info', 'SYSTEM');
    logger.log(`   • 😴 Smart Sleep System - Automatic night detection`, 'sleep', 'SYSTEM');
    logger.log(`   • 🚫🛏️ Occupied Bed Handling - Places alternative beds`, 'occupied_bed', 'SYSTEM');
    logger.log(`   • 🏠 Home System - Permanent home bed location`, 'home', 'SYSTEM');
    logger.log(`   • ⚠️ Emergency Sleep - Stops activities at night`, 'emergency', 'SYSTEM');
    logger.log(`   • 🔄 Auto-Reconnect - Automatic reconnection on disconnect`, 'connect', 'SYSTEM');
    logger.log(`   • 🎯 Basic Activities - Simple exploration and block activities`, 'activity', 'SYSTEM');
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
    
    const emergencyBots = connectedBots
      .filter(bot => bot.sleepSystem && bot.sleepSystem.state.emergencySleepMode);
    
    const totalBlocksPlaced = connectedBots
      .reduce((total, bot) => total + (bot.state.metrics.blocksPlaced || 0), 0);
    
    const totalBlocksBroken = connectedBots
      .reduce((total, bot) => total + (bot.state.metrics.blocksBroken || 0), 0);
    
    logger.log(`\n${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`📊 BOT STATUS - ${new Date().toLocaleTimeString()}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`Connected: ${connectedBots.length}/${this.bots.size}`, 'info', 'STATUS');
    logger.log(`Sleeping: ${sleepingBots.length}`, 'info', 'STATUS');
    logger.log(`Emergency Mode: ${emergencyBots.length}`, 'info', 'STATUS');
    logger.log(`Blocks Placed/Broken: ${totalBlocksPlaced}/${totalBlocksBroken}`, 'info', 'STATUS');
    logger.log(`Occupied Bed Handling: ${CONFIG.FEATURES.OCCUPIED_BED_HANDLING ? '✅ ACTIVE' : '❌ INACTIVE'}`, 'info', 'STATUS');
    logger.log(`Home System: ${CONFIG.FEATURES.HOME_SYSTEM ? '✅ ACTIVE' : '❌ INACTIVE'}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    
    if (connectedBots.length === 0) {
      logger.log('No bots currently connected - Auto-reconnect enabled', 'warn', 'STATUS');
    } else {
      connectedBots.forEach(bot => {
        const status = bot.getStatus();
        const sleepIcon = status.isSleeping ? '💤' : '☀️';
        const activityIcon = status.activity.includes('Sleep') ? '😴' : 
                           status.activity.includes('Explore') ? '🗺️' : 
                           status.activity.includes('Block') ? '🧱' : '🎯';
        
        const emergencyMode = bot.sleepSystem && bot.sleepSystem.state.emergencySleepMode;
        const occupiedRetries = status.sleepInfo?.occupiedBedRetries || 0;
        
        logger.log(`${sleepIcon} ${status.username} (${status.personality}) ${emergencyMode ? '⚠️' : ''}`, 'info', 'STATUS');
        logger.log(`  Status: ${status.status} | Activity: ${activityIcon} ${status.activity}`, 'info', 'STATUS');
        logger.log(`  Position: ${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}`, 'info', 'STATUS');
        logger.log(`  Home: ${status.homeLocation ? `${status.homeLocation.x}, ${status.homeLocation.y}, ${status.homeLocation.z}` : 'Not set'}`, 'info', 'STATUS');
        logger.log(`  Health: ${status.health}/20 | Blocks: ${status.metrics.blocksPlaced || 0} placed, ${status.metrics.blocksBroken || 0} broken`, 'info', 'STATUS');
        logger.log(`  Sleep Cycles: ${status.metrics.sleepCycles || 0} | Beds Broken: ${status.sleepInfo?.bedsBroken || 0}`, 'info', 'STATUS');
        
        if (occupiedRetries > 0) {
          logger.log(`  🚫🛏️ Occupied Bed Retries: ${occupiedRetries}`, 'occupied_bed', 'STATUS');
        }
        
        if (emergencyMode) {
          logger.log(`  ⚠️ EMERGENCY MODE: Night detected, activities stopped`, 'emergency', 'STATUS');
        }
        
        logger.log(``, 'info', 'STATUS');
      });
    }
    
    logger.log(`${'='.repeat(70)}\n`, 'info', 'STATUS');
  }
  
  printSystemReport() {
    let totalMessages = 0;
    let totalBlocksPlaced = 0;
    let totalBlocksBroken = 0;
    let totalSleepCycles = 0;
    let totalBedPlacements = 0;
    let totalBedsBroken = 0;
    let totalOccupiedRetries = 0;
    let connectedCount = 0;
    
    this.bots.forEach(bot => {
      const status = bot.getStatus();
      totalMessages += status.metrics.messages || 0;
      totalBlocksPlaced += status.metrics.blocksPlaced || 0;
      totalBlocksBroken += status.metrics.blocksBroken || 0;
      totalSleepCycles += status.metrics.sleepCycles || 0;
      totalBedPlacements += status.sleepInfo.bedPlacements || 0;
      totalBedsBroken += status.sleepInfo.bedsBroken || 0;
      totalOccupiedRetries += status.sleepInfo.occupiedBedRetries || 0;
      if (status.status === 'connected') connectedCount++;
    });
    
    logger.log(`\n${'='.repeat(70)}`, 'info', 'REPORT');
    logger.log(`📈 SYSTEM REPORT - ${new Date().toLocaleTimeString()}`, 'info', 'REPORT');
    logger.log(`${'='.repeat(70)}`, 'info', 'REPORT');
    logger.log(`Connected Bots: ${connectedCount}/${this.bots.size}`, 'info', 'REPORT');
    logger.log(`Total Messages Sent: ${totalMessages}`, 'info', 'REPORT');
    logger.log(`Total Blocks Placed: ${totalBlocksPlaced}`, 'info', 'REPORT');
    logger.log(`Total Blocks Broken: ${totalBlocksBroken}`, 'info', 'REPORT');
    logger.log(`Total Sleep Cycles: ${totalSleepCycles}`, 'info', 'REPORT');
    logger.log(`Total Bed Placements: ${totalBedPlacements}`, 'info', 'REPORT');
    logger.log(`Total Beds Broken: ${totalBedsBroken}`, 'info', 'REPORT');
    logger.log(`Total Occupied Bed Retries: ${totalOccupiedRetries}`, 'info', 'REPORT');
    logger.log(`Auto-Bed Breaking: ${CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
    logger.log(`Home System: ${CONFIG.FEATURES.HOME_SYSTEM ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
    logger.log(`Occupied Bed Handling: ${CONFIG.FEATURES.OCCUPIED_BED_HANDLING ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
    logger.log(`Emergency Sleep: ${CONFIG.FEATURES.EMERGENCY_SLEEP ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
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
      const emergency = Object.values(statuses).filter(s => s.sleepInfo?.emergencyMode).length;
      const totalBlocksPlaced = Object.values(statuses).reduce((total, s) => total + (s.metrics.blocksPlaced || 0), 0);
      const totalBlocksBroken = Object.values(statuses).reduce((total, s) => total + (s.metrics.blocksBroken || 0), 0);
      const totalOccupiedRetries = Object.values(statuses).reduce((total, s) => total + (s.sleepInfo?.occupiedBedRetries || 0), 0);
      
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
    <title>Ultimate Minecraft Bot System v2.5</title>
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
        .stat-card.blocks { border-color: #ffaa00; }
        .stat-card.emergency { border-color: #ff3333; }
        .stat-card.occupied { border-color: #ff55ff; }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 10px 0;
        }
        .connected-color { color: #00ff88; }
        .sleeping-color { color: #00ccff; }
        .blocks-color { color: #ffaa00; }
        .emergency-color { color: #ff3333; }
        .occupied-color { color: #ff55ff; }
        
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
        .bot-card.has-home {
            border-color: #00ff88;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
        }
        .bot-card.emergency {
            border-color: #ff3333;
            box-shadow: 0 0 20px rgba(255, 51, 51, 0.2);
            animation: pulse 2s infinite;
        }
        .bot-card.occupied {
            border-color: #ff55ff;
            box-shadow: 0 0 20px rgba(255, 85, 255, 0.2);
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 20px rgba(255, 51, 51, 0.2); }
            50% { box-shadow: 0 0 30px rgba(255, 51, 51, 0.4); }
            100% { box-shadow: 0 0 20px rgba(255, 51, 51, 0.2); }
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
        .emergency-badge { background: rgba(255, 51, 51, 0.2); color: #ff3333; }
        .occupied-badge { background: rgba(255, 85, 255, 0.2); color: #ff55ff; }
        
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
            background: rgba(0, 255, 136, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(0, 255, 136, 0.3);
        }
        
        .sleep-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(0, 204, 255, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(0, 204, 255, 0.3);
        }
        
        .emergency-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(255, 51, 51, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 51, 51, 0.3);
        }
        
        .occupied-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(255, 85, 255, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 85, 255, 0.3);
        }
        
        .block-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(255, 170, 0, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 170, 0, 0.3);
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
        .feature.sleep-feature {
            background: rgba(0, 204, 255, 0.1);
            border: 1px solid rgba(0, 204, 255, 0.3);
        }
        .feature.emergency-feature {
            background: rgba(255, 51, 51, 0.1);
            border: 1px solid rgba(255, 51, 51, 0.3);
        }
        .feature.occupied-feature {
            background: rgba(255, 85, 255, 0.1);
            border: 1px solid rgba(255, 85, 255, 0.3);
        }
        .feature.home-feature {
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid rgba(0, 255, 136, 0.3);
        }
        .feature.activity-feature {
            background: rgba(255, 170, 0, 0.1);
            border: 1px solid rgba(255, 170, 0, 0.3);
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
            <h1>🚀 Ultimate Minecraft Bot System <span class="version">v2.5</span></h1>
            <p class="subtitle">Smart Sleep • Occupied Bed Handling • Home System</p>
            
            <div class="stats">
                <div class="stat-card connected">
                    <div>Connected Bots</div>
                    <div class="stat-value connected-color">${connected}</div>
                </div>
                <div class="stat-card sleeping">
                    <div>Sleeping</div>
                    <div class="stat-value sleeping-color">${sleeping}</div>
                </div>
                <div class="stat-card blocks">
                    <div>Blocks Placed/Broken</div>
                    <div class="stat-value blocks-color">${totalBlocksPlaced}/${totalBlocksBroken}</div>
                </div>
                <div class="stat-card emergency">
                    <div>Emergency Mode</div>
                    <div class="stat-value emergency-color">${emergency}</div>
                </div>
                <div class="stat-card occupied">
                    <div>Occupied Retries</div>
                    <div class="stat-value occupied-color">${totalOccupiedRetries}</div>
                </div>
            </div>
        </div>
        
        <h2 style="margin-bottom: 20px;">🤖 Bot Status</h2>
        <div class="bots-grid">
            ${Object.entries(statuses).map(([id, status]) => {
              const emergencyMode = status.sleepInfo?.emergencyMode || false;
              const occupiedRetries = status.sleepInfo?.occupiedBedRetries || 0;
              const hasHome = status.homeLocation ? true : false;
              const blocksActivity = (status.metrics.blocksPlaced || 0) + (status.metrics.blocksBroken || 0) > 0;
              
              return `
            <div class="bot-card ${status.isSleeping ? 'sleeping' : emergencyMode ? 'emergency' : occupiedRetries > 0 ? 'occupied' : hasHome ? 'has-home' : ''}">
                <div class="bot-header">
                    <div>
                        <div class="bot-name">${status.username}</div>
                        <div class="bot-personality">${status.personality.toUpperCase()}</div>
                    </div>
                    <div class="status-badge ${status.status === 'connected' ? 
                        emergencyMode ? 'emergency-badge' : 
                        occupiedRetries > 0 ? 'occupied-badge' : 
                        'connected-badge' : 'disconnected-badge'}">
                        ${emergencyMode ? '⚠️ EMERGENCY' : occupiedRetries > 0 ? '🚫🛏️ OCCUPIED' : status.status.toUpperCase()}
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Activity</div>
                        <div class="info-value">${status.activity} ${status.isSleeping ? '😴' : emergencyMode ? '⚠️' : '🎯'}</div>
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
                        <div class="info-label">Status</div>
                        <div class="info-value">${status.status}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Blocks Placed</div>
                        <div class="info-value">${status.metrics.blocksPlaced || 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Blocks Broken</div>
                        <div class="info-value">${status.metrics.blocksBroken || 0}</div>
                    </div>
                </div>
                
                ${status.homeLocation ? `
                <div class="home-info">
                    <div class="info-label">🏠 Home Location</div>
                    <div class="info-value">${status.homeLocation.x}, ${status.homeLocation.y}, ${status.homeLocation.z}</div>
                    <div style="margin-top: 5px; font-size: 0.9rem; color: #00ff88;">
                        Permanent home bed • Spawn point set • Returns at night
                    </div>
                </div>
                ` : ''}
                
                ${blocksActivity ? `
                <div class="block-info">
                    <div class="info-label">🧱 Block Activity</div>
                    <div class="info-value">${status.metrics.blocksPlaced || 0} placed, ${status.metrics.blocksBroken || 0} broken</div>
                    <div style="margin-top: 5px; font-size: 0.9rem; color: #ffaa00;">
                        Simple block placement and breaking activities
                    </div>
                </div>
                ` : ''}
                
                ${occupiedRetries > 0 ? `
                <div class="occupied-info">
                    <div class="info-label">🚫🛏️ Occupied Bed Handling</div>
                    <div class="info-value">${occupiedRetries} retry attempt(s)</div>
                    <div style="margin-top: 5px; font-size: 0.9rem; color: #ff55ff;">
                        Found occupied beds • Placed alternative beds • Adaptive sleeping
                    </div>
                </div>
                ` : ''}
                
                ${emergencyMode ? `
                <div class="emergency-info">
                    <div class="info-label">⚠️ EMERGENCY MODE</div>
                    <div class="info-value">NIGHTTIME - ACTIVITIES STOPPED</div>
                    <div style="margin-top: 5px; font-size: 0.9rem; color: #ff3333;">
                        All activities stopped • Emergency sleep activated • Will resume at dawn
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
            `}).join('')}
        </div>
        
        <div class="features">
            <h2>⚡ Active Features v2.5</h2>
            <div class="features-grid">
                <div class="feature">🎮 Creative Mode</div>
                <div class="feature sleep-feature">😴 Smart Sleep</div>
                <div class="feature sleep-feature">🌙 Night Detection</div>
                <div class="feature occupied-feature">🚫🛏️ Occupied Bed Handling</div>
                <div class="feature emergency-feature">⚠️ Emergency Sleep</div>
                <div class="feature home-feature">🏠 Home System</div>
                <div class="feature home-feature">📍 Return to Home</div>
                <div class="feature activity-feature">🧱 Block Activities</div>
                <div class="feature activity-feature">🎯 Basic Activities</div>
                <div class="feature">🔄 Auto-Reconnect</div>
                <div class="feature">💬 Smart Chat</div>
                <div class="feature">⚡ Anti-AFK</div>
                <div class="feature">📊 Web Interface</div>
                <div class="feature">🛡️ Crash Protection</div>
                <div class="feature">🔧 Error Recovery</div>
            </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #777; font-size: 0.9rem;">
            <p>✅ System Status: Fully Operational • All Features Active • Crash Protection Enabled</p>
            <p>🚀 <strong>v2.5 SIMPLIFIED:</strong> Removed building feature • Focus on sleep and basic activities</p>
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
        version: '2.5',
        bots: Object.keys(botManager.getAllStatuses()).length,
        features: CONFIG.FEATURES,
        occupied_bed_handling: CONFIG.FEATURES.OCCUPIED_BED_HANDLING
      }));
      
    } else if (url === '/api/status') {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        version: '2.5',
        server: CONFIG.SERVER,
        timestamp: new Date().toISOString(),
        features: CONFIG.FEATURES,
        sleep_system: CONFIG.SLEEP_SYSTEM,
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
    logger.log(`😴 Smart Sleep: ${CONFIG.FEATURES.AUTO_SLEEP ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'sleep', 'WEB');
    logger.log(`🚫🛏️ Occupied Bed Handling: ${CONFIG.FEATURES.OCCUPIED_BED_HANDLING ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'occupied_bed', 'WEB');
    logger.log(`🏠 Home System: ${CONFIG.FEATURES.HOME_SYSTEM ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'home', 'WEB');
  });
  
  return server;
}

// ================= MAIN EXECUTION =================
async function main() {
  try {
    logger.log('🚀 Initializing Ultimate Minecraft Bot System v2.5...', 'info', 'SYSTEM');
    logger.log('✅ Simplified version - Building feature removed', 'success', 'SYSTEM');
    logger.log('✅ Occupied bed handling enabled!', 'success', 'SYSTEM');
    
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
    
    logger.log('\n🎯 BOT DAILY ROUTINE v2.5:', 'info', 'SYSTEM');
    logger.log('   1. ☀️ DAYTIME (0-12000 ticks):', 'day', 'SYSTEM');
    logger.log('      • Basic exploration and patrolling', 'activity', 'SYSTEM');
    logger.log('      • Simple block placement and breaking', 'activity', 'SYSTEM');
    logger.log('      • Social interaction and observation', 'activity', 'SYSTEM');
    logger.log('      • Anti-AFK activities', 'activity', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log('   2. 🌙 NIGHT APPROACHING (12000-13000):', 'night', 'SYSTEM');
    logger.log('      • Stop all activities', 'emergency', 'SYSTEM');
    logger.log('      • Emergency mode activated', 'emergency', 'SYSTEM');
    logger.log('      • Return to home location if far', 'travel', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log('   3. 🌃 NIGHTTIME (13000-23000):', 'night', 'SYSTEM');
    logger.log('      • Check home bed availability', 'sleep', 'SYSTEM');
    logger.log('      • If occupied, find alternative bed', 'occupied_bed', 'SYSTEM');
    logger.log('      • Place new bed if no beds available', 'sleep', 'SYSTEM');
    logger.log('      • Sleep until morning', 'sleep', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log('   4. ☀️ MORNING (23000-24000/0):', 'day', 'SYSTEM');
    logger.log('      • Wake up from sleep', 'wake', 'SYSTEM');
    logger.log('      • Break temporary beds (if not occupied)', 'bed_break', 'SYSTEM');
    logger.log('      • Keep home bed permanent', 'home', 'SYSTEM');
    logger.log('      • Resume daytime activities', 'success', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log('📊 Check web interface for sleep statistics and occupied bed handling!', 'info', 'SYSTEM');
    
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
