// ============================================================
// 🚀 ULTIMATE 2-BOT CREATIVE SYSTEM
// 🎮 Creative Mode • Auto-Sleep • Bed Management
// ============================================================

const mineflayer = require('mineflayer');
const Vec3 = require('vec3').Vec3;

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE 2-BOT CREATIVE SYSTEM                                     ║
║   🎮 Creative Mode • Auto-Sleep • Bed Management                        ║
║   🤖 2 Bots Only • Perfect Sleep System                                 ║
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
    {
      id: 'bot_001',
      name: 'CreativeMaster',
      personality: 'builder'
    },
    {
      id: 'bot_002',
      name: 'CreativeExplorer',
      personality: 'explorer'
    }
  ]
};

// ================= PERFECT SLEEP SYSTEM =================
class PerfectSleepSystem {
  constructor(botInstance) {
    this.bot = botInstance;
    this.state = {
      isSleeping: false,
      hasBedPlaced: false,
      bedPosition: null,
      bedInInventory: true,
      lastSleepTime: null
    };
  }

  // Check time and sleep immediately if night
  checkTimeAndSleep() {
    if (!this.bot || !this.bot.time) return;
    
    const time = this.bot.time.time;
    const isNight = time >= 13000 && time <= 23000;
    
    if (isNight && !this.state.isSleeping) {
      console.log(`🌙 ${this.bot.username}: Night time (${time}), sleeping immediately`);
      this.sleepImmediately();
    } else if (!isNight && this.state.isSleeping) {
      console.log(`☀️ ${this.bot.username}: Morning (${time}), waking up`);
      this.wakeAndCleanup();
    }
  }

  async sleepImmediately() {
    if (this.state.isSleeping) return;
    
    // Stop all activities
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
      const bed = this.bot.findBlock({
        matching: block => block && block.name && block.name.includes('bed'),
        maxDistance: 10
      });
      return bed;
    } catch (error) {
      return null;
    }
  }

  async placeBedAndSleep() {
    console.log(`🛏️ ${this.bot.username}: No bed found, placing one`);
    
    // Get bed from creative
    if (!this.state.bedInInventory) {
      await this.getBedFromCreative();
    }
    
    // Find placement location
    const bedPos = await this.findBedPlacementLocation();
    if (!bedPos) {
      console.log(`❌ ${this.bot.username}: No place for bed`);
      return;
    }
    
    // Place bed
    const placed = await this.placeBedAt(bedPos);
    if (placed) {
      this.state.hasBedPlaced = true;
      this.state.bedPosition = bedPos;
      this.state.bedInInventory = false;
      
      console.log(`✅ ${this.bot.username}: Bed placed at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`);
      
      // Sleep in placed bed
      await this.sleepInPlacedBed(bedPos);
    }
  }

  async getBedFromCreative() {
    try {
      this.bot.chat(`/give ${this.bot.username} bed`);
      await this.delay(2000);
      this.state.bedInInventory = true;
      console.log(`📦 ${this.bot.username}: Got bed from creative`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async findBedPlacementLocation() {
    const pos = this.bot.entity.position;
    
    // Try positions around player
    const positions = [
      { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) },
      { x: Math.floor(pos.x) + 1, y: Math.floor(pos.y), z: Math.floor(pos.z) },
      { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) + 1 },
      { x: Math.floor(pos.x) - 1, y: Math.floor(pos.y), z: Math.floor(pos.z) },
      { x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) - 1 }
    ];
    
    for (const position of positions) {
      // Create Vec3 properly
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

  async placeBedAt(position) {
    try {
      this.bot.setQuickBarSlot(0);
      
      // Create Vec3 for looking
      const lookPos = new Vec3(position.x, position.y, position.z);
      await this.bot.lookAt(lookPos);
      
      // Create Vec3 for block below
      const referenceBlockPos = new Vec3(position.x, position.y - 1, position.z);
      const referenceBlock = this.bot.blockAt(referenceBlockPos);
      
      if (referenceBlock) {
        // Create offset Vec3
        const offset = new Vec3(0, 1, 0);
        await this.bot.placeBlock(referenceBlock, offset);
        return true;
      }
    } catch (error) {
      console.log(`❌ ${this.bot.username}: Failed to place bed: ${error.message}`);
    }
    
    return false;
  }

  async sleepInPlacedBed(bedPosition) {
    try {
      // Create Vec3 for bed position
      const bedPos = new Vec3(bedPosition.x, bedPosition.y, bedPosition.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock && bedBlock.name.includes('bed')) {
        await this.sleepInBed(bedBlock);
      }
    } catch (error) {
      console.log(`❌ ${this.bot.username}: Failed to sleep in placed bed`);
    }
  }

  async sleepInBed(bedBlock) {
    try {
      // Move close to bed
      const distance = this.bot.entity.position.distanceTo(bedBlock.position);
      if (distance > 2) {
        await this.bot.lookAt(bedBlock.position);
        this.bot.setControlState('forward', true);
        await this.delay(Math.min(distance * 200, 1000));
        this.bot.setControlState('forward', false);
        await this.delay(500);
      }
      
      // Sleep
      await this.bot.sleep(bedBlock);
      this.state.isSleeping = true;
      this.state.lastSleepTime = Date.now();
      
      console.log(`💤 ${this.bot.username}: Successfully sleeping`);
      
    } catch (error) {
      console.log(`❌ ${this.bot.username}: Failed to sleep: ${error.message}`);
    }
  }

  async wakeAndCleanup() {
    if (!this.state.isSleeping) return;
    
    try {
      if (this.bot.isSleeping) {
        this.bot.wake();
      }
      
      this.state.isSleeping = false;
      
      console.log(`✅ ${this.bot.username}: Woke up`);
      
      // Break bed if we placed it
      if (this.state.hasBedPlaced && this.state.bedPosition) {
        await this.breakBed(this.state.bedPosition);
      }
      
      // Reset state
      this.state.hasBedPlaced = false;
      this.state.bedPosition = null;
      this.state.bedInInventory = true;
      
      console.log(`🧹 ${this.bot.username}: Bed cleaned up`);
      
    } catch (error) {
      console.log(`❌ ${this.bot.username}: Wake up error: ${error.message}`);
    }
  }

  async breakBed(position) {
    try {
      // Create Vec3 for bed position
      const bedPos = new Vec3(position.x, position.y, position.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock && bedBlock.name.includes('bed')) {
        await this.bot.dig(bedBlock);
        await this.delay(1000);
        console.log(`⛏️ ${this.bot.username}: Broke bed`);
        return true;
      }
    } catch (error) {
      console.log(`❌ ${this.bot.username}: Failed to break bed`);
    }
    return false;
  }

  stopAllActivities() {
    ['forward', 'back', 'left', 'right', 'jump', 'sprint'].forEach(control => {
      if (this.bot.getControlState(control)) {
        this.bot.setControlState(control, false);
      }
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ================= CREATIVE BOT =================
class CreativeBot {
  constructor(config, index) {
    this.config = config;
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
      activity: 'Initializing',
      creativeMode: true
    };
    
    this.intervals = [];
    console.log(`🤖 Created ${this.state.username} (${this.state.personality})`);
  }

  async connect() {
    try {
      this.state.status = 'connecting';
      
      console.log(`🔄 ${this.state.username}: Connecting to server...`);
      
      // Create bot
      this.bot = mineflayer.createBot({
        host: CONFIG.SERVER.host,
        port: CONFIG.SERVER.port,
        username: this.state.username,
        version: CONFIG.SERVER.version,
        auth: 'offline',
        viewDistance: 10,
        chatLengthLimit: 256
      });
      
      // Setup sleep system
      this.sleepSystem = new PerfectSleepSystem(this.bot);
      
      // Setup event handlers
      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
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
      this.onSpawn();
    });
    
    this.bot.on('health', () => {
      this.state.health = this.bot.health || 20;
      this.state.food = this.bot.food || 20;
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
    
    this.bot.on('time', () => {
      // Check for sleep
      if (this.sleepSystem) {
        this.sleepSystem.checkTimeAndSleep();
      }
      
      // Update sleep state
      this.state.isSleeping = this.bot.isSleeping || false;
      this.state.activity = this.state.isSleeping ? 'Sleeping' : this.state.activity;
      
      // Log time occasionally
      if (this.bot.time && this.bot.time.time % 1000 < 50) {
        console.log(`⏰ ${this.state.username}: Time: ${this.bot.time.time}`);
      }
    });
    
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      
      console.log(`💬 ${username}: ${message}`);
      
      // Auto-response (30% chance)
      if (Math.random() < 0.3) {
        setTimeout(() => {
          if (this.bot && this.bot.player) {
            const response = this.getChatResponse(message, username);
            this.bot.chat(response);
            console.log(`🤖 ${this.bot.username}: ${response}`);
          }
        }, 1000 + Math.random() * 2000);
      }
    });
    
    this.bot.on('sleep', () => {
      console.log(`😴 ${this.state.username}: Started sleeping`);
      this.state.isSleeping = true;
      this.state.activity = 'Sleeping';
    });
    
    this.bot.on('wake', () => {
      console.log(`☀️ ${this.state.username}: Woke up`);
      this.state.isSleeping = false;
      this.state.activity = 'Waking up';
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

  onSpawn() {
    this.state.status = 'connected';
    this.state.position = this.getPosition();
    
    console.log(`✅ ${this.state.username}: Connected successfully!`);
    
    // Initialize creative mode
    this.initializeCreativeMode();
    
    // Start activity loop
    this.startActivityLoop();
    
    // Start time checking
    this.startTimeChecking();
  }

  initializeCreativeMode() {
    if (!this.bot) return;
    
    console.log(`🎮 ${this.state.username}: Initializing Creative Mode...`);
    
    // Give creative items after 3 seconds
    setTimeout(() => {
      this.giveCreativeItems();
    }, 3000);
    
    // Set game mode to creative after 5 seconds
    setTimeout(() => {
      if (this.bot) {
        this.bot.chat('/gamemode creative');
        console.log(`⚡ ${this.state.username}: Set to creative mode`);
      }
    }, 5000);
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
      }, index * 100);
    });
    
    console.log(`📦 ${this.state.username}: Creative items given`);
  }

  startActivityLoop() {
    const activityInterval = setInterval(() => {
      if (!this.bot || !this.bot.entity || this.state.isSleeping) {
        return;
      }
      
      // Don't do activities at night
      if (this.bot.time && this.bot.time.time >= 13000 && this.bot.time.time <= 23000) {
        return;
      }
      
      // Perform personality-based activity
      const activity = this.getActivity();
      this.state.activity = activity;
      this.performActivity(activity);
      
    }, 15000 + Math.random() * 10000); // 15-25 second intervals
    
    this.intervals.push(activityInterval);
    console.log(`🎯 ${this.state.username}: Activity loop started`);
  }

  startTimeChecking() {
    const timeInterval = setInterval(() => {
      if (this.sleepSystem) {
        this.sleepSystem.checkTimeAndSleep();
      }
    }, 5000); // Check every 5 seconds
    
    this.intervals.push(timeInterval);
    console.log(`⏰ ${this.state.username}: Time checking started`);
  }

  getActivity() {
    const activities = {
      builder: ['Building', 'Decorating', 'Planning structure', 'Collecting materials', 'Designing layout'],
      explorer: ['Exploring', 'Mapping area', 'Looking for landmarks', 'Climbing hills', 'Checking coordinates']
    };
    
    const personalityActivities = activities[this.state.personality] || activities.builder;
    return personalityActivities[Math.floor(Math.random() * personalityActivities.length)];
  }

  performActivity(activity) {
    console.log(`🎯 ${this.state.username}: ${activity}`);
    
    if (activity.includes('Building') || activity.includes('Decorating') || activity.includes('Designing')) {
      this.performBuildingActivity();
    } else if (activity.includes('Exploring') || activity.includes('Mapping') || activity.includes('Climbing')) {
      this.performExplorationActivity();
    } else {
      this.performIdleActivity();
    }
  }

  performBuildingActivity() {
    if (!this.bot) return;
    
    // Look around for building
    this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    
    // Occasionally place blocks (20% chance)
    if (Math.random() < 0.2) {
      setTimeout(() => {
        if (this.bot) {
          this.placeCreativeBlock();
        }
      }, 500);
    }
  }

  performExplorationActivity() {
    if (!this.bot) return;
    
    // Move in random direction
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    this.bot.setControlState(direction, true);
    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState(direction, false);
      }
    }, 1000 + Math.random() * 2000);
    
    // Look around while moving
    this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
  }

  performIdleActivity() {
    if (!this.bot) return;
    
    // Gentle looking around
    this.bot.look(Math.random() * Math.PI * 0.2, Math.random() * Math.PI * 0.2 - Math.PI * 0.1);
  }

  placeCreativeBlock() {
    try {
      const creativeBlocks = ['stone', 'oak_planks', 'glass', 'glowstone'];
      const blockType = creativeBlocks[Math.floor(Math.random() * creativeBlocks.length)];
      
      // Find placement position
      const pos = this.bot.entity.position;
      const offsetX = Math.floor(Math.random() * 5) - 2;
      const offsetZ = Math.floor(Math.random() * 5) - 2;
      
      // Create Vec3 for position
      const Vec3 = require('vec3').Vec3;
      const placePos = new Vec3(
        Math.floor(pos.x) + offsetX,
        Math.floor(pos.y),
        Math.floor(pos.z) + offsetZ
      );
      
      const block = this.bot.blockAt(placePos);
      if (block && block.name === 'air') {
        // Give block first
        this.bot.chat(`/give ${this.bot.username} ${blockType}`);
        
        // Then place it
        setTimeout(() => {
          if (this.bot) {
            this.bot.placeBlock(block, new Vec3(0, 1, 0));
            console.log(`🧱 ${this.state.username}: Placed ${blockType}`);
          }
        }, 100);
      }
    } catch (error) {
      // Ignore placement errors in creative
    }
  }

  getChatResponse(message, sender) {
    const lowerMessage = message.toLowerCase();
    
    // Direct mention responses
    if (lowerMessage.includes(this.state.username.toLowerCase())) {
      const directResponses = [
        `Yes ${sender}?`,
        `What's up ${sender}?`,
        `Hey ${sender}!`,
        `Need something ${sender}?`,
        `I'm here ${sender}!`
      ];
      return directResponses[Math.floor(Math.random() * directResponses.length)];
    }
    
    // Question responses
    if (message.includes('?')) {
      const questionResponses = [
        "Good question!",
        "I think so!",
        "Not sure about that.",
        "Probably!",
        "Maybe!",
        "Interesting question!"
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }
    
    // Personality-based responses
    if (this.state.personality === 'builder') {
      const builderResponses = [
        "Working on my masterpiece!",
        "Just building something amazing!",
        "Check out this structure I'm making!",
        "Building is so relaxing!",
        "Need any building help?"
      ];
      return builderResponses[Math.floor(Math.random() * builderResponses.length)];
    } else {
      const explorerResponses = [
        "Found some cool terrain!",
        "Exploring new areas!",
        "The world is so vast!",
        "On an adventure!",
        "Discovering new places!"
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
    // Clear all intervals
    this.intervals.forEach(interval => {
      try {
        clearInterval(interval);
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    
    this.intervals = [];
    
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
      position: this.state.position,
      activity: this.state.activity,
      isSleeping: this.state.isSleeping,
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
    console.log('🚀 STARTING 2-BOT CREATIVE SYSTEM');
    console.log('='.repeat(80));
    console.log(`🌐 Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`);
    console.log(`🤖 Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`);
    console.log(`🎮 Mode: Creative • Auto-Sleep • Bed Management`);
    console.log('='.repeat(80) + '\n');
    
    this.isRunning = true;
    
    // Initial delay
    await this.delay(5000);
    
    // Start bots with delays
    for (let i = 0; i < CONFIG.BOTS.length; i++) {
      const botConfig = CONFIG.BOTS[i];
      const bot = new CreativeBot(botConfig, i);
      this.bots.set(botConfig.id, bot);
      
      // Stagger connections (5 seconds between bots)
      if (i > 0) {
        console.log(`⏳ Waiting 5 seconds before next bot...`);
        await this.delay(5000);
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
    }, 30000);
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
    
    if (connectedBots.length === 0) {
      console.log('No bots currently connected');
      console.log('Bots will auto-reconnect...');
    } else {
      connectedBots.forEach(bot => {
        const status = bot.getStatus();
        const sleepIcon = status.isSleeping ? '💤' : '☀️';
        const activityIcon = status.activity === 'Sleeping' ? '😴' : 
                           status.activity.includes('Building') ? '🏗️' :
                           status.activity.includes('Exploring') ? '🗺️' : '🎮';
        
        console.log(`${sleepIcon} ${status.username} (${status.personality})`);
        console.log(`  Status: ${status.status} | Activity: ${activityIcon} ${status.activity}`);
        console.log(`  Position: ${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}`);
        console.log(`  Health: ${status.health}/20 | Creative: ${status.creativeMode ? '✅' : '❌'}`);
        console.log('');
      });
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
    for (const [id, bot] of this.bots) {
      try {
        bot.cleanup();
        if (bot.bot) {
          bot.bot.quit();
        }
        stopped++;
        console.log(`✅ Stopped ${bot.state.username}`);
      } catch (error) {
        console.error(`❌ Failed to stop ${bot.state.username}: ${error.message}`);
      }
    }
    
    console.log(`\n🎮 Stopped ${stopped} bots`);
    return stopped;
  }
}

// ================= MAIN EXECUTION =================
async function main() {
  try {
    console.log('🚀 Initializing 2-Bot Creative System...');
    
    const botManager = new BotManager();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n👋 Shutting down gracefully...');
      await botManager.stop();
      console.log('🎮 System stopped. Goodbye!\n');
      process.exit(0);
    });
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start bot manager
    await botManager.start();
    
    console.log('✅ System running!');
    console.log('🤖 Bots will automatically sleep at night with bed management');
    console.log('🎮 Check console for real-time status\n');
    
    // Keep process alive
    setInterval(() => {
      // Keep-alive heartbeat
    }, 60000);
    
  } catch (error) {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Start the system
main();
