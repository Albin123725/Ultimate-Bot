// ============================================================
// 🚀 ULTIMATE CREATIVE MODE BOT SYSTEM v12.0
// 🎮 Always Creative • Auto-Sleep • Bed Management
// ============================================================

const mineflayer = require('mineflayer');
const crypto = require('crypto');
const moment = require('moment');
const Chance = require('chance');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const geoip = require('geoip-lite');
const axios = require('axios');

// Initialize
const chance = new Chance();

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE CREATIVE MODE BOT SYSTEM v12.0                           ║
║   🎮 Always Creative • Auto-Sleep • Bed Management                     ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

// ================= CONFIGURATION =================
const CONFIG = {
  SERVER: {
    host: 'gameplannet.aternos.me',
    port: 43658,
    version: '1.21.10'
  },
  BOTS: [
    { name: 'CreativeBob', personality: 'builder' },
    { name: 'CreativeEve', personality: 'explorer' },
    { name: 'CreativeMike', personality: 'miner' },
    { name: 'CreativeSally', personality: 'socializer' }
  ],
  CREATIVE_MODE: true,
  AUTO_SLEEP: true,
  BED_MANAGEMENT: true,
  CONNECTION_DELAY: 60000, // 60 seconds between bots
  MAX_RECONNECT_ATTEMPTS: 10
};

// ================= CREATIVE MODE BOT CLASS =================
class CreativeModeBot {
  constructor(config, index) {
    this.config = config;
    this.index = index;
    this.bot = null;
    this.state = {
      username: config.name,
      personality: config.personality,
      status: 'initializing',
      health: 20,
      food: 20,
      position: null,
      activity: 'Starting up...',
      hasBedInInventory: true,
      placedBed: null,
      isSleeping: false,
      lastSleepTime: null,
      bedPlacementAttempts: 0,
      creativeMode: true,
      dayCycle: {
        currentTime: 0,
        isNight: false,
        lastTimeCheck: 0
      }
    };
    
    this.sleepTimer = null;
    this.activityInterval = null;
    this.timeCheckInterval = null;
    
    console.log(`🤖 Created ${this.state.username} (${this.state.personality})`);
  }
  
  async connect() {
    try {
      console.log(`🔄 ${this.state.username}: Connecting to server...`);
      
      this.bot = mineflayer.createBot({
        host: CONFIG.SERVER.host,
        port: CONFIG.SERVER.port,
        username: this.state.username,
        version: CONFIG.SERVER.version,
        auth: 'offline',
        viewDistance: 10,
        chatLengthLimit: 256,
        colorsEnabled: false
      });
      
      this.setupEventHandlers();
      this.state.status = 'connecting';
      
      // Wait for spawn
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 30000);
        
        this.bot.once('spawn', () => {
          clearTimeout(timeout);
          this.state.status = 'connected';
          console.log(`✅ ${this.state.username}: Connected successfully!`);
          this.initializeCreativeMode();
          this.startSystems();
          resolve(this);
        });
        
        this.bot.once('error', (err) => {
          clearTimeout(timeout);
          this.state.status = 'error';
          console.error(`❌ ${this.state.username}: Connection error - ${err.message}`);
          reject(err);
        });
      });
      
    } catch (error) {
      console.error(`❌ ${this.state.username}: Failed to connect - ${error.message}`);
      this.state.status = 'failed';
      throw error;
    }
  }
  
  setupEventHandlers() {
    if (!this.bot) return;
    
    this.bot.on('spawn', () => {
      console.log(`📍 ${this.state.username}: Spawned in world`);
      this.state.position = this.getPosition();
    });
    
    this.bot.on('health', () => {
      if (this.bot.health !== undefined) {
        this.state.health = this.bot.health;
      }
      if (this.bot.food !== undefined) {
        this.state.food = this.bot.food;
      }
    });
    
    this.bot.on('move', () => {
      this.state.position = this.getPosition();
    });
    
    this.bot.on('time', () => {
      if (this.bot.time && this.bot.time.time !== undefined) {
        const oldTime = this.state.dayCycle.currentTime;
        const newTime = this.bot.time.time;
        this.state.dayCycle.currentTime = newTime;
        this.state.dayCycle.lastTimeCheck = Date.now();
        
        // Check for day/night transition
        const wasNight = this.isNightTime(oldTime);
        const isNight = this.isNightTime(newTime);
        this.state.dayCycle.isNight = isNight;
        
        if (wasNight !== isNight) {
          console.log(`🌅 ${this.state.username}: ${isNight ? 'Night fell' : 'Morning came'} (Time: ${newTime})`);
          this.handleDayNightTransition(isNight);
        }
        
        // Log time occasionally
        if (newTime % 1000 < 10) {
          const timeDesc = this.getTimeDescription(newTime);
          console.log(`⏰ ${this.state.username}: ${timeDesc} (${newTime})`);
        }
      }
    });
    
    this.bot.on('chat', (username, message) => {
      if (username === this.state.username) return;
      
      console.log(`💬 ${username}: ${message}`);
      
      // Auto-response based on personality
      if (Math.random() < 0.4) {
        setTimeout(() => {
          if (this.bot && this.bot.player) {
            const response = this.getChatResponse(message, username);
            if (response) {
              this.bot.chat(response);
              console.log(`🤖 ${this.state.username}: ${response}`);
            }
          }
        }, 1000 + Math.random() * 2000);
      }
    });
    
    this.bot.on('sleep', () => {
      console.log(`😴 ${this.state.username}: Started sleeping`);
      this.state.isSleeping = true;
      this.state.lastSleepTime = Date.now();
      this.state.activity = 'Sleeping';
    });
    
    this.bot.on('wake', () => {
      console.log(`☀️ ${this.state.username}: Woke up`);
      this.state.isSleeping = false;
      this.state.activity = 'Waking up';
    });
    
    this.bot.on('playerCollect', (collector, collected) => {
      if (collector === this.bot.entity && collected.name === 'bed') {
        console.log(`🛏️ ${this.state.username}: Collected bed`);
        this.state.hasBedInInventory = true;
      }
    });
    
    this.bot.on('blockBreakProgressObserved', (block, destroyStage) => {
      if (destroyStage === 9 && block.name.includes('bed')) {
        console.log(`⛏️ ${this.state.username}: Broke a bed`);
        this.state.hasBedInInventory = true;
        this.state.placedBed = null;
      }
    });
    
    this.bot.on('kicked', (reason) => {
      console.log(`🚫 ${this.state.username}: Kicked - ${JSON.stringify(reason)}`);
      this.state.status = 'kicked';
      this.cleanup();
      this.scheduleReconnect();
    });
    
    this.bot.on('end', () => {
      console.log(`🔌 ${this.state.username}: Disconnected`);
      this.state.status = 'disconnected';
      this.cleanup();
      this.scheduleReconnect();
    });
    
    this.bot.on('error', (err) => {
      console.error(`❌ ${this.state.username}: Error - ${err.message}`);
      this.state.status = 'error';
    });
  }
  
  initializeCreativeMode() {
    if (!this.bot) return;
    
    console.log(`🎮 ${this.state.username}: Initializing Creative Mode...`);
    
    // Give creative items (assuming creative mode on server)
    if (CONFIG.CREATIVE_MODE) {
      // Give bed and essentials
      setTimeout(() => {
        this.giveCreativeItems();
        this.state.hasBedInInventory = true;
        console.log(`📦 ${this.state.username}: Creative inventory ready`);
      }, 3000);
    }
    
    // Set game mode to creative (if OP)
    setTimeout(() => {
      this.bot.chat('/gamemode creative');
      console.log(`⚡ ${this.state.username}: Set to creative mode`);
    }, 5000);
  }
  
  giveCreativeItems() {
    if (!this.bot) return;
    
    const items = [
      'bed',
      'white_bed',
      'red_bed',
      'blue_bed',
      'torch',
      'crafting_table',
      'chest',
      'diamond_pickaxe',
      'diamond_sword',
      'bread 64',
      'cooked_beef 64'
    ];
    
    items.forEach(item => {
      setTimeout(() => {
        if (this.bot) {
          this.bot.chat(`/give ${this.state.username} ${item}`);
        }
      }, 100);
    });
  }
  
  startSystems() {
    console.log(`⚙️ ${this.state.username}: Starting all systems...`);
    
    // Start time monitoring
    this.startTimeMonitoring();
    
    // Start activity system
    this.startActivitySystem();
    
    // Initial time check
    setTimeout(() => {
      this.checkTimeAndSleep();
    }, 5000);
    
    console.log(`✅ ${this.state.username}: All systems started`);
  }
  
  startTimeMonitoring() {
    this.timeCheckInterval = setInterval(() => {
      this.checkTimeAndSleep();
    }, 5000); // Check every 5 seconds
    
    console.log(`⏰ ${this.state.username}: Time monitoring started`);
  }
  
  startActivitySystem() {
    this.activityInterval = setInterval(() => {
      this.performDaytimeActivity();
    }, 15000 + Math.random() * 15000); // 15-30 seconds
    
    console.log(`🎯 ${this.state.username}: Activity system started`);
  }
  
  // ================= SLEEP SYSTEM =================
  checkTimeAndSleep() {
    if (!this.bot || !this.bot.time || !CONFIG.AUTO_SLEEP) return;
    
    const time = this.bot.time.time;
    const isNight = this.isNightTime(time);
    
    // Update state
    this.state.dayCycle.currentTime = time;
    this.state.dayCycle.isNight = isNight;
    
    if (isNight && !this.state.isSleeping) {
      console.log(`🌙 ${this.state.username}: Night detected (${time}), attempting to sleep...`);
      this.handleNightTime();
    } else if (!isNight && this.state.isSleeping) {
      console.log(`☀️ ${this.state.username}: Morning detected (${time}), waking up...`);
      this.handleMorning();
    }
  }
  
  isNightTime(minecraftTime) {
    // Minecraft night: 13000-23000
    return minecraftTime >= 13000 && minecraftTime <= 23000;
  }
  
  getTimeDescription(time) {
    if (time < 1000) return 'Dawn';
    if (time < 6000) return 'Morning';
    if (time < 12000) return 'Day';
    if (time < 13000) return 'Noon';
    if (time < 18000) return 'Afternoon';
    if (time < 19000) return 'Dusk';
    if (time < 22000) return 'Night';
    return 'Midnight';
  }
  
  handleNightTime() {
    if (this.state.isSleeping) return;
    
    console.log(`🌃 ${this.state.username}: Handling night time...`);
    this.state.activity = 'Preparing for sleep';
    
    // First, try to find existing bed
    this.findAndSleepInBed();
  }
  
  async findAndSleepInBed() {
    if (!this.bot) return;
    
    try {
      // Look for nearby bed
      const bed = this.bot.findBlock({
        matching: block => {
          const name = block?.name || '';
          return name.includes('bed') && 
                 !name.includes('occupied') &&
                 !name.includes('broken');
        },
        maxDistance: 10,
        useExtraInfo: true
      });
      
      if (bed) {
        console.log(`🛏️ ${this.state.username}: Found bed nearby, attempting to sleep`);
        this.state.placedBed = bed.position;
        await this.attemptSleep(bed);
      } else {
        console.log(`🚫 ${this.state.username}: No bed found nearby, placing one`);
        await this.placeBedAndSleep();
      }
    } catch (error) {
      console.error(`❌ ${this.state.username}: Bed search error - ${error.message}`);
      await this.placeBedAndSleep();
    }
  }
  
  async placeBedAndSleep() {
    if (!this.bot) return;
    
    console.log(`🏗️ ${this.state.username}: Placing bed...`);
    this.state.activity = 'Placing bed';
    
    // Check if we have bed in inventory
    if (!this.state.hasBedInInventory) {
      console.log(`📦 ${this.state.username}: No bed in inventory, getting one`);
      await this.getBedFromCreative();
    }
    
    // Find suitable location for bed
    const bedPosition = await this.findBedLocation();
    if (!bedPosition) {
      console.log(`❌ ${this.state.username}: Could not find suitable bed location`);
      return;
    }
    
    // Place the bed
    const placed = await this.placeBedAt(bedPosition);
    if (placed) {
      console.log(`✅ ${this.state.username}: Bed placed successfully`);
      this.state.placedBed = bedPosition;
      this.state.bedPlacementAttempts = 0;
      
      // Wait a moment then sleep
      setTimeout(async () => {
        await this.sleepInPlacedBed(bedPosition);
      }, 1000);
    } else {
      console.log(`❌ ${this.state.username}: Failed to place bed`);
      this.state.bedPlacementAttempts++;
      
      if (this.state.bedPlacementAttempts < 3) {
        setTimeout(() => this.placeBedAndSleep(), 2000);
      }
    }
  }
  
  async getBedFromCreative() {
    if (!this.bot) return false;
    
    try {
      // Give bed via creative command
      this.bot.chat(`/give ${this.state.username} bed`);
      console.log(`🎁 ${this.state.username}: Requested bed from creative`);
      
      // Wait for item to be received
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.state.hasBedInInventory = true;
      return true;
    } catch (error) {
      console.error(`❌ ${this.state.username}: Failed to get bed - ${error.message}`);
      return false;
    }
  }
  
  async findBedLocation() {
    if (!this.bot || !this.bot.entity) return null;
    
    const pos = this.bot.entity.position;
    
    // Try positions around the player
    const positions = [
      { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) },
      { x: Math.floor(pos.x) + 1, y: Math.floor(pos.y), z: Math.floor(pos.z) },
      { x: Math.floor(pos.x) - 1, y: Math.floor(pos.y), z: Math.floor(pos.z) },
      { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) + 1 },
      { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) - 1 },
      { x: Math.floor(pos.x) + 1, y: Math.floor(pos.y), z: Math.floor(pos.z) + 1 }
    ];
    
    for (const position of positions) {
      const block = this.bot.blockAt(new this.bot.vec3(position.x, position.y, position.z));
      const blockBelow = this.bot.blockAt(new this.bot.vec3(position.x, position.y - 1, position.z));
      const blockAbove = this.bot.blockAt(new this.bot.vec3(position.x, position.y + 1, position.z));
      
      // Check if position is suitable for bed
      if (block && block.name === 'air' &&
          blockBelow && blockBelow.name !== 'air' && 
          blockBelow.name !== 'lava' && blockBelow.name !== 'water' &&
          (!blockAbove || blockAbove.name === 'air')) {
        return position;
      }
    }
    
    return null;
  }
  
  async placeBedAt(position) {
    if (!this.bot) return false;
    
    try {
      // Select bed in hotbar (assuming slot 0 has bed)
      this.bot.setQuickBarSlot(0);
      
      // Look at the position
      await this.bot.lookAt(new this.bot.vec3(position.x, position.y, position.z));
      
      // Place the bed
      const referenceBlock = this.bot.blockAt(new this.bot.vec3(position.x, position.y - 1, position.z));
      if (referenceBlock) {
        await this.bot.placeBlock(referenceBlock, new this.bot.vec3(0, 1, 0));
        console.log(`🛏️ ${this.state.username}: Bed placed at ${position.x}, ${position.y}, ${position.z}`);
        this.state.hasBedInInventory = false;
        return true;
      }
    } catch (error) {
      console.error(`❌ ${this.state.username}: Failed to place bed - ${error.message}`);
    }
    
    return false;
  }
  
  async sleepInPlacedBed(bedPosition) {
    if (!this.bot) return;
    
    try {
      const bedBlock = this.bot.blockAt(new this.bot.vec3(bedPosition.x, bedPosition.y, bedPosition.z));
      if (bedBlock && bedBlock.name.includes('bed')) {
        await this.attemptSleep(bedBlock);
      }
    } catch (error) {
      console.error(`❌ ${this.state.username}: Failed to sleep in placed bed - ${error.message}`);
    }
  }
  
  async attemptSleep(bedBlock) {
    if (!this.bot) return;
    
    try {
      console.log(`😴 ${this.state.username}: Attempting to sleep...`);
      this.state.activity = 'Attempting to sleep';
      
      // Walk to bed if not close enough
      const distance = this.bot.entity.position.distanceTo(bedBlock.position);
      if (distance > 3) {
        await this.bot.lookAt(bedBlock.position);
        const direction = bedBlock.position.minus(this.bot.entity.position).normalize();
        this.bot.setControlState('forward', true);
        setTimeout(() => {
          if (this.bot) this.bot.setControlState('forward', false);
        }, Math.min(distance * 200, 2000));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Try to sleep
      await this.bot.sleep(bedBlock);
      
      console.log(`💤 ${this.state.username}: Successfully sleeping`);
      this.state.isSleeping = true;
      this.state.lastSleepTime = Date.now();
      this.state.activity = 'Sleeping';
      
      // Set auto-wake timer (for safety)
      this.sleepTimer = setTimeout(() => {
        if (this.state.isSleeping) {
          this.wakeUp();
        }
      }, 30000); // Wake after 30 seconds if not already awake
      
    } catch (error) {
      console.error(`❌ ${this.state.username}: Failed to sleep - ${error.message}`);
      
      // Bed might be occupied or obstructed, try placing new one
      if (error.message.includes('occupied') || error.message.includes('obstructed')) {
        console.log(`🔄 ${this.state.username}: Bed occupied/obstructed, breaking it`);
        await this.breakBed(bedBlock);
        await this.placeBedAndSleep();
      }
    }
  }
  
  handleMorning() {
    if (!this.state.isSleeping) return;
    
    console.log(`☀️ ${this.state.username}: Handling morning...`);
    this.state.activity = 'Waking up';
    
    // Wake up
    this.wakeUp();
    
    // Break bed after waking
    setTimeout(() => {
      this.breakPlacedBed();
    }, 2000);
    
    // Start daytime activities
    setTimeout(() => {
      this.performDaytimeActivity();
    }, 3000);
  }
  
  wakeUp() {
    if (!this.bot || !this.state.isSleeping) return;
    
    try {
      this.bot.wake((err) => {
        if (err) {
          console.error(`❌ ${this.state.username}: Failed to wake up - ${err.message}`);
        } else {
          console.log(`✅ ${this.state.username}: Woke up successfully`);
        }
      });
    } catch (error) {
      console.error(`❌ ${this.state.username}: Error during wake up - ${error.message}`);
    } finally {
      this.state.isSleeping = false;
      if (this.sleepTimer) {
        clearTimeout(this.sleepTimer);
        this.sleepTimer = null;
      }
    }
  }
  
  async breakPlacedBed() {
    if (!this.bot || !this.state.placedBed || !CONFIG.BED_MANAGEMENT) return;
    
    try {
      const bedBlock = this.bot.blockAt(new this.bot.vec3(
        this.state.placedBed.x,
        this.state.placedBed.y,
        this.state.placedBed.z
      ));
      
      if (bedBlock && bedBlock.name.includes('bed')) {
        console.log(`⛏️ ${this.state.username}: Breaking bed...`);
        await this.breakBed(bedBlock);
        this.state.placedBed = null;
      }
    } catch (error) {
      console.error(`❌ ${this.state.username}: Failed to break bed - ${error.message}`);
    }
  }
  
  async breakBed(bedBlock) {
    if (!this.bot) return;
    
    try {
      // Equip a tool if available
      const tool = this.bot.inventory.items().find(item => 
        item.name.includes('pickaxe') || item.name.includes('axe')
      );
      
      if (tool) {
        await this.bot.equip(tool, 'hand');
      }
      
      // Break the bed
      await this.bot.dig(bedBlock);
      console.log(`✅ ${this.state.username}: Bed broken`);
      
      // Wait for bed to drop
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ ${this.state.username}: Failed to break bed - ${error.message}`);
    }
  }
  
  handleDayNightTransition(isNight) {
    if (isNight) {
      console.log(`🌙 ${this.state.username}: Transition to night`);
      // Clear any daytime activities
      if (this.activityInterval) {
        clearInterval(this.activityInterval);
      }
    } else {
      console.log(`☀️ ${this.state.username}: Transition to day`);
      // Restart activity system
      this.startActivitySystem();
    }
  }
  
  // ================= DAYTIME ACTIVITIES =================
  performDaytimeActivity() {
    if (!this.bot || this.state.isSleeping || this.state.dayCycle.isNight) {
      return;
    }
    
    const activities = {
      builder: [
        'Building a house',
        'Decorating area',
        'Planning structure',
        'Collecting building materials',
        'Designing layout'
      ],
      explorer: [
        'Exploring surroundings',
        'Mapping area',
        'Looking for landmarks',
        'Climbing hills',
        'Checking coordinates'
      ],
      miner: [
        'Digging underground',
        'Creating tunnels',
        'Mining resources',
        'Exploring caves',
        'Setting up mining area'
      ],
      socializer: [
        'Looking for players',
        'Preparing to chat',
        'Organizing inventory',
        'Planning social events',
        'Decorating meeting area'
      ]
    };
    
    const personalityActivities = activities[this.state.personality] || activities.builder;
    const activity = chance.pickone(personalityActivities);
    
    console.log(`🎯 ${this.state.username}: ${activity}`);
    this.state.activity = activity;
    
    // Perform the activity
    this.executeActivity(activity);
  }
  
  executeActivity(activity) {
    if (!this.bot) return;
    
    try {
      if (activity.includes('Building') || activity.includes('Decorating')) {
        this.performBuildingActivity();
      } else if (activity.includes('Exploring') || activity.includes('Mapping')) {
        this.performExplorationActivity();
      } else if (activity.includes('Digging') || activity.includes('Mining')) {
        this.performMiningActivity();
      } else if (activity.includes('Looking for players') || activity.includes('Social')) {
        this.performSocialActivity();
      } else {
        this.performRandomMovement();
      }
    } catch (error) {
      console.error(`❌ ${this.state.username}: Activity error - ${error.message}`);
    }
  }
  
  performBuildingActivity() {
    if (!this.bot) return;
    
    // Look around for building
    const yaw = Math.random() * Math.PI * 2;
    const pitch = Math.random() * Math.PI - Math.PI / 2;
    this.bot.look(yaw, pitch);
    
    // Occasionally place blocks
    if (Math.random() < 0.3) {
      setTimeout(() => {
        if (this.bot) {
          this.placeRandomBlock();
        }
      }, 500);
    }
  }
  
  performExplorationActivity() {
    if (!this.bot) return;
    
    // Move in random direction
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = chance.pickone(directions);
    
    this.bot.setControlState(direction, true);
    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState(direction, false);
      }
    }, 1000 + Math.random() * 2000);
    
    // Look around while moving
    this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
  }
  
  performMiningActivity() {
    if (!this.bot) return;
    
    // Look at ground as if mining
    this.bot.look(Math.random() * Math.PI * 2, -Math.PI / 2);
    
    // Occasionally swing tool
    if (Math.random() < 0.4) {
      setTimeout(() => {
        if (this.bot) {
          this.bot.swingArm();
        }
      }, 300);
    }
  }
  
  performSocialActivity() {
    if (!this.bot) return;
    
    // Look around for players
    this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    
    // Occasionally wave or jump
    if (Math.random() < 0.2) {
      this.bot.setControlState('jump', true);
      setTimeout(() => {
        if (this.bot) {
          this.bot.setControlState('jump', false);
        }
      }, 200);
    }
  }
  
  performRandomMovement() {
    if (!this.bot) return;
    
    const actions = [
      () => {
        this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
      },
      () => {
        const dir = chance.pickone(['forward', 'back', 'left', 'right']);
        this.bot.setControlState(dir, true);
        setTimeout(() => {
          if (this.bot) this.bot.setControlState(dir, false);
        }, 500 + Math.random() * 1000);
      },
      () => {
        this.bot.swingArm();
      }
    ];
    
    chance.pickone(actions)();
  }
  
  placeRandomBlock() {
    if (!this.bot) return;
    
    try {
      // Find block in inventory
      const blocks = this.bot.inventory.items().filter(item => 
        item.name.includes('block') || 
        item.name.includes('planks') ||
        item.name.includes('stone') ||
        item.name.includes('bricks')
      );
      
      if (blocks.length > 0) {
        const block = chance.pickone(blocks);
        this.bot.equip(block, 'hand');
        
        // Find placement position
        const pos = this.bot.entity.position;
        const offset = new this.bot.vec3(
          Math.floor(Math.random() * 3) - 1,
          0,
          Math.floor(Math.random() * 3) - 1
        );
        
        const placePos = pos.plus(offset);
        const placeBlock = this.bot.blockAt(placePos);
        
        if (placeBlock && placeBlock.name === 'air') {
          this.bot.placeBlock(placeBlock, new this.bot.vec3(0, 1, 0));
          console.log(`🧱 ${this.state.username}: Placed ${block.name}`);
        }
      }
    } catch (error) {
      // Ignore placement errors
    }
  }
  
  // ================= CHAT SYSTEM =================
  getChatResponse(message, sender) {
    const responses = {
      builder: [
        `Working on my build, ${sender}!`,
        `Check out my new structure, ${sender}!`,
        `Need any building help, ${sender}?`,
        `Just placing some blocks, ${sender}.`,
        `The architecture is coming along, ${sender}!`
      ],
      explorer: [
        `Found anything interesting, ${sender}?`,
        `Exploring the area, ${sender}!`,
        `Just mapping things out, ${sender}.`,
        `The terrain here is amazing, ${sender}!`,
        `On an adventure, ${sender}!`
      ],
      miner: [
        `Digging deep, ${sender}!`,
        `Found some good ores, ${sender}!`,
        `Just mining away, ${sender}.`,
        `The caves are extensive, ${sender}!`,
        `Underground exploring, ${sender}!`
      ],
      socializer: [
        `Hi ${sender}! How are you?`,
        `Good to see you, ${sender}!`,
        `What's up, ${sender}?`,
        `Enjoying the server, ${sender}?`,
        `Nice to chat with you, ${sender}!`
      ]
    };
    
    const personalityResponses = responses[this.state.personality] || responses.socializer;
    
    // Check for direct questions
    if (message.toLowerCase().includes(this.state.username.toLowerCase()) ||
        message.toLowerCase().includes('?')) {
      const questionResponses = [
        `Yes ${sender}?`,
        `What's up ${sender}?`,
        `Need something ${sender}?`,
        `I'm here ${sender}!`,
        `How can I help ${sender}?`
      ];
      return chance.pickone(questionResponses);
    }
    
    return chance.pickone(personalityResponses);
  }
  
  // ================= UTILITY METHODS =================
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
    const delay = 30000 + Math.random() * 30000; // 30-60 seconds
    
    console.log(`⏳ ${this.state.username}: Reconnecting in ${Math.round(delay / 1000)} seconds`);
    
    setTimeout(() => {
      if (this.state.status !== 'connected') {
        console.log(`🔄 ${this.state.username}: Attempting to reconnect...`);
        this.connect().catch(error => {
          console.error(`❌ ${this.state.username}: Reconnect failed - ${error.message}`);
        });
      }
    }, delay);
  }
  
  cleanup() {
    // Clear all intervals and timers
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
    
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
      this.timeCheckInterval = null;
    }
    
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
      this.sleepTimer = null;
    }
    
    // Remove event listeners
    if (this.bot) {
      try {
        this.bot.removeAllListeners();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
  
  getStatus() {
    return {
      username: this.state.username,
      personality: this.state.personality,
      status: this.state.status,
      health: this.state.health,
      food: this.state.food,
      activity: this.state.activity,
      position: this.state.position,
      isSleeping: this.state.isSleeping,
      hasBed: this.state.hasBedInInventory || !!this.state.placedBed,
      time: this.state.dayCycle.currentTime,
      isNight: this.state.dayCycle.isNight,
      creativeMode: this.state.creativeMode
    };
  }
}

// ================= BOT MANAGER =================
class BotManager {
  constructor() {
    this.bots = new Map();
    this.isRunning = false;
    this.statusInterval = null;
  }
  
  async start() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 STARTING ULTIMATE CREATIVE BOT SYSTEM');
    console.log('='.repeat(80));
    console.log(`🌐 Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`);
    console.log(`🤖 Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`);
    console.log(`🎮 Mode: Creative (Auto-Sleep: ${CONFIG.AUTO_SLEEP}, Bed Management: ${CONFIG.BED_MANAGEMENT})`);
    console.log('='.repeat(80) + '\n');
    
    this.isRunning = true;
    
    // Start bots with delays
    for (let i = 0; i < CONFIG.BOTS.length; i++) {
      const botConfig = CONFIG.BOTS[i];
      const bot = new CreativeModeBot(botConfig, i);
      this.bots.set(botConfig.name, bot);
      
      // Stagger connections
      const delay = i * CONFIG.CONNECTION_DELAY;
      if (delay > 0) {
        console.log(`⏳ Waiting ${delay / 1000} seconds before next bot...`);
        await this.delay(delay);
      }
      
      // Start bot
      bot.connect().catch(error => {
        console.error(`❌ Failed to start ${botConfig.name}: ${error.message}`);
      });
    }
    
    // Start status monitoring
    this.startStatusMonitoring();
    
    console.log('\n✅ All bots scheduled for connection!');
    console.log('📊 Status updates every 30 seconds...\n');
  }
  
  startStatusMonitoring() {
    this.statusInterval = setInterval(() => {
      this.printStatus();
    }, 30000); // Every 30 seconds
  }
  
  printStatus() {
    const connectedBots = Array.from(this.bots.values())
      .filter(bot => bot.state.status === 'connected');
    
    const sleepingBots = connectedBots
      .filter(bot => bot.state.isSleeping);
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 BOT STATUS - ' + new Date().toLocaleTimeString());
    console.log('='.repeat(80));
    console.log(`Connected: ${connectedBots.length}/${this.bots.size}`);
    console.log(`Sleeping: ${sleepingBots.length}`);
    console.log('='.repeat(80));
    
    connectedBots.forEach(bot => {
      const status = bot.getStatus();
      const sleepIcon = status.isSleeping ? '💤' : '☀️';
      const nightIcon = status.isNight ? '🌙' : '☀️';
      
      console.log(`${sleepIcon} ${status.username} (${status.personality})`);
      console.log(`  Status: ${status.status} | ${nightIcon} ${status.time}`);
      console.log(`  Activity: ${status.activity}`);
      console.log(`  Position: ${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}`);
      console.log(`  Has Bed: ${status.hasBed ? '✅' : '❌'} | Health: ${status.health}/20`);
      console.log('');
    });
    
    if (connectedBots.length === 0) {
      console.log('No bots currently connected');
      console.log('Bots will auto-reconnect...');
    }
    
    console.log('='.repeat(80) + '\n');
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async stop() {
    console.log('\n🛑 Stopping all bots...');
    this.isRunning = false;
    
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    
    let stopped = 0;
    for (const [name, bot] of this.bots) {
      try {
        bot.cleanup();
        if (bot.bot) {
          bot.bot.quit();
        }
        stopped++;
        console.log(`✅ Stopped ${name}`);
      } catch (error) {
        console.error(`❌ Failed to stop ${name}: ${error.message}`);
      }
    }
    
    console.log(`\n🎮 Stopped ${stopped} bots`);
    return stopped;
  }
  
  getBotStatus(name) {
    const bot = this.bots.get(name);
    return bot ? bot.getStatus() : null;
  }
  
  getAllStatuses() {
    const statuses = {};
    for (const [name, bot] of this.bots) {
      statuses[name] = bot.getStatus();
    }
    return statuses;
  }
}

// ================= MINIMAL WEB SERVER (for Render.com) =================
function startWebServer() {
  const http = require('http');
  
  const botManager = new BotManager();
  
  const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
      const statuses = botManager.getAllStatuses();
      const connected = Object.values(statuses).filter(s => s.status === 'connected').length;
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Creative Bot System</title>
          <style>
            body { font-family: monospace; background: #0a0a0a; color: #0f0; padding: 20px; }
            .bot-card { background: #1a1a1a; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .sleeping { border-left: 5px solid #0af; }
            .awake { border-left: 5px solid #0f0; }
            .night { color: #aaf; }
            .day { color: #ff0; }
          </style>
        </head>
        <body>
          <h1>🤖 CREATIVE MODE BOT SYSTEM</h1>
          <p>Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}</p>
          <p>Connected: ${connected}/${Object.keys(statuses).length}</p>
          <p>Mode: Creative • Auto-Sleep • Bed Management</p>
          <hr>
          ${Object.entries(statuses).map(([name, status]) => `
            <div class="bot-card ${status.isSleeping ? 'sleeping' : 'awake'}">
              <h3>${name} (${status.personality})</h3>
              <p>Status: ${status.status} | ${status.isSleeping ? '💤 SLEEPING' : '☀️ AWAKE'}</p>
              <p class="${status.isNight ? 'night' : 'day'}">
                Time: ${status.time} (${status.isNight ? 'NIGHT' : 'DAY'})
              </p>
              <p>Activity: ${status.activity}</p>
              <p>Position: ${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}</p>
              <p>Has Bed: ${status.hasBed ? '✅' : '❌'} | Health: ${status.health}/20</p>
            </div>
          `).join('')}
          ${Object.keys(statuses).length === 0 ? '<p>Bots starting up...</p>' : ''}
        </body>
        </html>
      `);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  
  const PORT = process.env.PORT || 10000;
  server.listen(PORT, () => {
    console.log(`🌐 Web interface: http://localhost:${PORT}`);
  });
  
  return { server, botManager };
}

// ================= MAIN EXECUTION =================
async function main() {
  try {
    console.log('🚀 Initializing Creative Bot System...');
    
    // Start web server
    const { botManager } = startWebServer();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n👋 Shutting down gracefully...');
      await botManager.stop();
      console.log('🎮 System stopped. Goodbye!\n');
      process.exit(0);
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start bot manager
    await botManager.start();
    
    console.log('✅ System running!');
    console.log('🤖 Bots will automatically sleep at night with bed management');
    console.log('🎮 Check web interface for real-time status\n');
    
  } catch (error) {
    console.error(`❌ Fatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Start the system
main();
