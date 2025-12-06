const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const EventEmitter = require('events');

// REAL Minecraft bot library
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const minecraftData = require('minecraft-data');

class BotSystem extends EventEmitter {
  constructor() {
    super();
    this.bots = new Map();
    this.accounts = new Map();
    this.proxies = [];
    this.events = [];
    this.consoleLogs = [];
    this.tasks = [];
    this.chatHistory = [];
    
    // REAL Configuration
    this.config = {
      server: {
        host: process.env.MINECRAFT_HOST || 'gameplannet.aternos.me',
        port: parseInt(process.env.MINECRAFT_PORT) || 34286,
        version: process.env.MINECRAFT_VERSION || '1.21.10'
      },
      
      bots: {
        maxBots: parseInt(process.env.MAX_BOTS) || 4,
        types: ['builder', 'miner', 'explorer', 'socializer', 'guardian'],
        autoReconnect: true,
        maxReconnectAttempts: 5,
        reconnectDelay: 10000
      },
      
      features: {
        realConnection: true, // REAL CONNECTION
        antiAFK: true,
        autoChat: true,
        autoMovement: true,
        pathfinding: true,
        itemCollection: true
      }
    };
    
    console.log('🚀 REAL Minecraft Bot System v5.0 Initialized');
    console.log(`🎯 Target Server: ${this.config.server.host}:${this.config.server.port}`);
  }
  
  async initialize() {
    console.log('🔄 Initializing system...');
    
    await this.createDirectories();
    await this.loadData();
    this.startMonitoring();
    
    this.consoleLog('System initialized - Ready for REAL connections');
    return this;
  }
  
  async createDirectories() {
    const dirs = ['logs', 'config', 'data', 'backups'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(__dirname, dir));
    }
  }
  
  async loadData() {
    // Load or create accounts
    const accountsPath = path.join(__dirname, 'config', 'accounts.json');
    if (await fs.pathExists(accountsPath)) {
      const accounts = await fs.readJson(accountsPath);
      accounts.forEach(acc => this.accounts.set(acc.id, acc));
    } else {
      await this.generateAccounts(10);
    }
    
    this.consoleLog(`Loaded ${this.accounts.size} accounts`);
  }
  
  async generateAccounts(count) {
    const names = [
      'MinecraftBot1', 'MinecraftBot2', 'MinecraftBot3', 'MinecraftBot4',
      'MinecraftBot5', 'MinecraftBot6', 'MinecraftBot7', 'MinecraftBot8',
      'MinecraftBot9', 'MinecraftBot10'
    ];
    
    for (let i = 0; i < count; i++) {
      const account = {
        id: crypto.randomBytes(12).toString('hex'),
        username: names[i] || `Bot${i + 1}`,
        created: new Date().toISOString(),
        status: 'active'
      };
      this.accounts.set(account.id, account);
    }
    
    await this.saveAccounts();
  }
  
  async saveAccounts() {
    const accountsPath = path.join(__dirname, 'config', 'accounts.json');
    await fs.writeJson(accountsPath, Array.from(this.accounts.values()), { spaces: 2 });
  }
  
  async createBot(type) {
    const botId = `bot_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const account = await this.getNextAccount();
    
    const bot = {
      id: botId,
      type: type,
      name: account.username,
      account: account,
      status: 'created',
      health: 20,
      food: 20,
      position: { x: 0, y: 64, z: 0 },
      activity: 'initializing',
      // REAL bot instance (will be set when connected)
      instance: null,
      settings: {
        autoReconnect: true,
        chatEnabled: true,
        antiAFK: true
      },
      connection: {
        connected: false,
        reconnectAttempts: 0
      }
    };
    
    this.bots.set(botId, bot);
    this.consoleLog(`Created ${type} bot: ${bot.name}`);
    
    return bot;
  }
  
  async getNextAccount() {
    const accounts = Array.from(this.accounts.values())
      .filter(acc => acc.status === 'active')
      .sort((a, b) => (a.lastUsed || 0) - (b.lastUsed || 0));
    
    const account = accounts[0] || Array.from(this.accounts.values())[0];
    account.lastUsed = Date.now();
    await this.saveAccounts();
    
    return account;
  }
  
  async connectBot(botId) {
    const bot = this.bots.get(botId);
    if (!bot) throw new Error('Bot not found');
    
    this.consoleLog(`🔄 Connecting bot: ${bot.name} to ${this.config.server.host}:${this.config.server.port}`);
    
    try {
      // Test server connection first
      const serverStatus = await this.testServerConnection();
      if (!serverStatus.online) {
        throw new Error('Server is offline or unreachable');
      }
      
      // Create REAL Minecraft bot
      const options = {
        host: this.config.server.host,
        port: this.config.server.port,
        username: bot.name,
        version: this.config.server.version,
        auth: 'offline', // For offline mode (Aternos)
        viewDistance: 'tiny',
        chatLengthLimit: 256
      };
      
      this.consoleLog(`Creating Mineflayer bot for ${bot.name}...`);
      
      // Create the bot instance
      const mcBot = mineflayer.createBot(options);
      
      // Load pathfinding plugin
      mcBot.loadPlugin(pathfinder);
      
      // Store bot instance
      bot.instance = mcBot;
      bot.status = 'connecting';
      
      // Setup event handlers
      this.setupBotEvents(bot, mcBot);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout (30 seconds)'));
        }, 30000);
        
        mcBot.once('spawn', () => {
          clearTimeout(timeout);
          bot.status = 'connected';
          bot.connection.connected = true;
          bot.connection.reconnectAttempts = 0;
          bot.activity = 'online';
          
          // Get initial position
          if (mcBot.entity) {
            bot.position = {
              x: Math.floor(mcBot.entity.position.x),
              y: Math.floor(mcBot.entity.position.y),
              z: Math.floor(mcBot.entity.position.z)
            };
          }
          
          this.consoleLog(`✅ ${bot.name} successfully connected to server!`);
          this.logEvent('bot_connected', { botId: bot.id, name: bot.name });
          
          // Start bot activities
          this.startBotActivities(bot);
          
          resolve(bot);
        });
        
        mcBot.once('error', (err) => {
          clearTimeout(timeout);
          reject(new Error(`Connection error: ${err.message}`));
        });
        
        mcBot.once('kicked', (reason) => {
          clearTimeout(timeout);
          reject(new Error(`Kicked from server: ${reason}`));
        });
      });
      
    } catch (error) {
      bot.status = 'failed';
      bot.connection.connected = false;
      this.consoleLog(`❌ Failed to connect ${bot.name}: ${error.message}`, 'error');
      
      if (bot.settings.autoReconnect) {
        this.scheduleReconnection(bot);
      }
      
      throw error;
    }
  }
  
  setupBotEvents(bot, mcBot) {
    // Chat events
    mcBot.on('chat', (username, message) => {
      if (username === bot.name) return;
      
      this.addChatMessage(username, message, 'player');
      this.consoleLog(`💬 ${username}: ${message}`);
      
      // Auto-reply if socializer bot
      if (bot.type === 'socializer' && bot.settings.chatEnabled) {
        setTimeout(() => {
          if (mcBot.player) {
            const replies = [
              'Hello!',
              'How are you?',
              'Nice to meet you!',
              'Good day!',
              'What\'s up?'
            ];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            mcBot.chat(reply);
            this.addChatMessage(bot.name, reply, 'bot');
          }
        }, 1000 + Math.random() * 2000);
      }
    });
    
    // Health updates
    mcBot.on('health', () => {
      if (mcBot.health !== undefined) {
        bot.health = mcBot.health;
      }
      if (mcBot.food !== undefined) {
        bot.food = mcBot.food;
      }
    });
    
    // Position updates
    mcBot.on('move', () => {
      if (mcBot.entity) {
        bot.position = {
          x: Math.floor(mcBot.entity.position.x),
          y: Math.floor(mcBot.entity.position.y),
          z: Math.floor(mcBot.entity.position.z)
        };
      }
    });
    
    // Disconnect events
    mcBot.on('end', (reason) => {
      bot.status = 'disconnected';
      bot.connection.connected = false;
      this.consoleLog(`🔌 ${bot.name} disconnected: ${reason || 'Unknown reason'}`);
      
      if (bot.settings.autoReconnect && bot.connection.reconnectAttempts < this.config.bots.maxReconnectAttempts) {
        this.scheduleReconnection(bot);
      }
    });
    
    // Spawn events
    mcBot.on('spawn', () => {
      bot.status = 'connected';
      bot.connection.connected = true;
      this.consoleLog(`📍 ${bot.name} spawned at position`);
    });
    
    // Death events
    mcBot.on('death', () => {
      this.consoleLog(`💀 ${bot.name} died!`, 'warning');
      this.addChatMessage('System', `${bot.name} died and will respawn`, 'system');
    });
  }
  
  startBotActivities(bot) {
    if (!bot.instance || !bot.connection.connected) return;
    
    // Clear any existing interval
    if (bot.activityInterval) {
      clearInterval(bot.activityInterval);
    }
    
    bot.activityInterval = setInterval(() => {
      if (!bot.instance || !bot.connection.connected) {
        clearInterval(bot.activityInterval);
        return;
      }
      
      // Perform activities based on bot type
      this.performBotActivity(bot);
      
      // Update health/food from bot instance
      if (bot.instance.health !== undefined) bot.health = bot.instance.health;
      if (bot.instance.food !== undefined) bot.food = bot.instance.food;
      
    }, 10000 + Math.random() * 20000); // Every 10-30 seconds
    
    // Anti-AFK movement
    if (bot.settings.antiAFK) {
      bot.afkInterval = setInterval(() => {
        if (bot.instance && bot.connection.connected) {
          this.antiAFKMovement(bot);
        }
      }, 60000 + Math.random() * 120000); // Every 1-3 minutes
    }
    
    // Auto-chat for socializer bots
    if (bot.type === 'socializer' && bot.settings.chatEnabled) {
      bot.chatInterval = setInterval(() => {
        if (bot.instance && bot.connection.connected && Math.random() < 0.3) {
          this.sendBotChat(bot);
        }
      }, 30000 + Math.random() * 60000); // Every 30-90 seconds
    }
  }
  
  performBotActivity(bot) {
    if (!bot.instance || !bot.connection.connected) return;
    
    const activities = {
      builder: ['building', 'mining', 'crafting', 'placing_blocks'],
      miner: ['mining', 'digging', 'exploring_caves', 'looking_for_ores'],
      explorer: ['exploring', 'mapping', 'traveling', 'climbing'],
      socializer: ['chatting', 'trading', 'helping', 'dancing'],
      guardian: ['patrolling', 'guarding', 'watching', 'scouting']
    };
    
    const typeActivities = activities[bot.type] || ['idle'];
    bot.activity = typeActivities[Math.floor(Math.random() * typeActivities.length)];
    
    // Perform actual Minecraft actions based on activity
    switch (bot.activity) {
      case 'mining':
      case 'digging':
        this.mineRandomBlock(bot);
        break;
      case 'exploring':
      case 'traveling':
        this.randomMovement(bot);
        break;
      case 'chatting':
        if (Math.random() < 0.5) this.sendBotChat(bot);
        break;
      case 'placing_blocks':
        // Try to place a block if has one
        this.placeRandomBlock(bot);
        break;
    }
  }
  
  mineRandomBlock(bot) {
    if (!bot.instance) return;
    
    const mcData = minecraftData(bot.instance.version);
    const blocks = mcData.blocksArray.filter(block => 
      block.hardness !== undefined && block.hardness < 10
    );
    
    if (blocks.length > 0) {
      const block = blocks[Math.floor(Math.random() * blocks.length)];
      
      // Look for nearby blocks of this type
      const blockToMine = bot.instance.findBlock({
        matching: block.id,
        maxDistance: 16,
        count: 1
      });
      
      if (blockToMine) {
        bot.instance.dig(blockToMine, (err) => {
          if (!err) {
            this.consoleLog(`⛏️ ${bot.name} mined ${block.name}`);
          }
        });
      }
    }
  }
  
  randomMovement(bot) {
    if (!bot.instance) return;
    
    const randomX = bot.position.x + (Math.random() - 0.5) * 20;
    const randomZ = bot.position.z + (Math.random() - 0.5) * 20;
    
    const goal = new goals.GoalNear(randomX, bot.position.y, randomZ, 1);
    bot.instance.pathfinder.setGoal(goal);
  }
  
  antiAFKMovement(bot) {
    if (!bot.instance) return;
    
    // Small random movements to avoid AFK
    const movements = [
      () => bot.instance.setControlState('forward', true),
      () => bot.instance.setControlState('back', true),
      () => bot.instance.setControlState('left', true),
      () => bot.instance.setControlState('right', true),
      () => bot.instance.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2)
    ];
    
    const movement = movements[Math.floor(Math.random() * movements.length)];
    movement();
    
    setTimeout(() => {
      if (bot.instance) {
        bot.instance.setControlState('forward', false);
        bot.instance.setControlState('back', false);
        bot.instance.setControlState('left', false);
        bot.instance.setControlState('right', false);
      }
    }, 500);
  }
  
  sendBotChat(bot) {
    if (!bot.instance) return;
    
    const chatMessages = {
      builder: [
        'Building something great!',
        'Need more materials...',
        'This looks good!',
        'Check out my build!'
      ],
      miner: [
        'Found some ores!',
        'Digging deep...',
        'Dark down here!',
        'Need torches!'
      ],
      explorer: [
        'Beautiful view!',
        'Exploring new areas!',
        'Found something interesting!',
        'This way looks good!'
      ],
      socializer: [
        'Hello everyone!',
        'How is everyone doing?',
        'Nice server!',
        'Anyone need help?',
        'Good day!'
      ],
      guardian: [
        'All clear!',
        'Keeping watch.',
        'Nothing suspicious.',
        'Area secure.'
      ]
    };
    
    const messages = chatMessages[bot.type] || ['Hello!'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    bot.instance.chat(message);
    this.addChatMessage(bot.name, message, 'bot');
  }
  
  placeRandomBlock(bot) {
    if (!bot.instance) return;
    
    // Check if bot has blocks in inventory
    const blockItems = bot.instance.inventory.items().filter(item => 
      item && item.name.includes('_block') || 
      item && ['planks', 'stone', 'bricks', 'glass'].some(mat => item.name.includes(mat))
    );
    
    if (blockItems.length > 0) {
      const block = blockItems[0];
      const referenceBlock = bot.instance.blockAt(
        bot.instance.entity.position.offset(1, 0, 0)
      );
      
      if (referenceBlock && referenceBlock.name === 'air') {
        bot.instance.placeBlock(referenceBlock, { x: 1, y: 0, z: 0 }, (err) => {
          if (!err) {
            this.consoleLog(`🧱 ${bot.name} placed a ${block.name}`);
          }
        });
      }
    }
  }
  
  scheduleReconnection(bot) {
    bot.connection.reconnectAttempts++;
    const delay = this.config.bots.reconnectDelay * bot.connection.reconnectAttempts;
    
    this.consoleLog(`⏳ ${bot.name} will reconnect in ${delay/1000}s (attempt ${bot.connection.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connectBot(bot.id).catch(console.error);
    }, delay);
  }
  
  async startAllBots() {
    this.consoleLog('🚀 Starting ALL bots with REAL connections...');
    
    const maxBots = Math.min(this.config.bots.maxBots, 4);
    const results = { successful: [], failed: [] };
    
    // Clear existing bots first
    await this.clearInactiveBots();
    
    for (let i = 0; i < maxBots; i++) {
      try {
        const type = this.config.bots.types[i % this.config.bots.types.length];
        const bot = await this.createBot(type);
        
        const delay = i * 5000; // Stagger connections by 5 seconds
        
        setTimeout(async () => {
          try {
            await this.connectBot(bot.id);
            results.successful.push({
              botId: bot.id,
              name: bot.name,
              type: bot.type
            });
          } catch (error) {
            results.failed.push({
              botId: bot.id,
              name: bot.name,
              error: error.message
            });
          }
        }, delay);
        
      } catch (error) {
        results.failed.push({ error: error.message });
      }
    }
    
    return {
      success: true,
      message: `Started ${results.successful.length} bots`,
      results: results
    };
  }
  
  async testServerConnection() {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const startTime = Date.now();
      
      socket.setTimeout(10000);
      
      socket.on('connect', () => {
        const latency = Date.now() - startTime;
        socket.destroy();
        resolve({
          online: true,
          ping: latency,
          message: `Server is online (${latency}ms)`
        });
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          online: false,
          ping: null,
          message: 'Connection timeout'
        });
      });
      
      socket.on('error', (error) => {
        socket.destroy();
        resolve({
          online: false,
          ping: null,
          message: error.message
        });
      });
      
      try {
        socket.connect(this.config.server.port, this.config.server.host);
      } catch (error) {
        resolve({
          online: false,
          ping: null,
          message: error.message
        });
      }
    });
  }
  
  async clearInactiveBots() {
    let removed = 0;
    
    for (const [botId, bot] of this.bots) {
      if (bot.status !== 'connected') {
        // Clean up bot instance if exists
        if (bot.instance) {
          try {
            bot.instance.end();
          } catch (error) {
            // Ignore cleanup errors
          }
        }
        
        // Clear intervals
        if (bot.activityInterval) clearInterval(bot.activityInterval);
        if (bot.afkInterval) clearInterval(bot.afkInterval);
        if (bot.chatInterval) clearInterval(bot.chatInterval);
        
        this.bots.delete(botId);
        removed++;
      }
    }
    
    return { success: true, message: `Cleared ${removed} inactive bots` };
  }
  
  async emergencyStop() {
    this.consoleLog('🛑 EMERGENCY STOP - Disconnecting all bots');
    
    let stopped = 0;
    
    for (const [botId, bot] of this.bots) {
      // Clear intervals
      if (bot.activityInterval) clearInterval(bot.activityInterval);
      if (bot.afkInterval) clearInterval(bot.afkInterval);
      if (bot.chatInterval) clearInterval(bot.chatInterval);
      
      // Disconnect bot
      if (bot.instance) {
        try {
          bot.instance.end();
          bot.instance = null;
        } catch (error) {
          console.error(`Error stopping bot ${bot.name}:`, error.message);
        }
      }
      
      bot.status = 'stopped';
      bot.connection.connected = false;
      stopped++;
    }
    
    return {
      success: true,
      message: `Emergency stop complete. Stopped ${stopped} bots.`
    };
  }
  
  // Helper methods
  addChatMessage(sender, message, type = 'player') {
    const chatM
