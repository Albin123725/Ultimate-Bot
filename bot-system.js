const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const EventEmitter = require('events');

// REAL Minecraft bot library
const mineflayer = require('mineflayer');

class BotSystem extends EventEmitter {
  constructor() {
    super();
    this.bots = new Map();
    this.accounts = new Map();
    this.events = [];
    this.consoleLogs = [];
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
        autoReconnect: true,
        reconnectDelay: 10000
      }
    };
    
    console.log('🚀 REAL Minecraft Bot System v5.0 Initialized');
    console.log(`🎯 Target Server: ${this.config.server.host}:${this.config.server.port}`);
  }
  
  async initialize() {
    console.log('🔄 Initializing system...');
    
    await this.createDirectories();
    await this.loadData();
    
    this.consoleLog('✅ System initialized - Ready for REAL connections');
    return this;
  }
  
  async createDirectories() {
    const dirs = ['logs', 'config', 'data'];
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
    
    this.consoleLog(`✅ Loaded ${this.accounts.size} accounts`);
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
  
  async getNextAccount() {
    const accounts = Array.from(this.accounts.values())
      .filter(acc => acc.status === 'active')
      .sort((a, b) => (a.lastUsed || 0) - (b.lastUsed || 0));
    
    const account = accounts[0] || Array.from(this.accounts.values())[0];
    account.lastUsed = Date.now();
    await this.saveAccounts();
    
    return account;
  }
  
  async createBot() {
    const botId = `bot_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const account = await this.getNextAccount();
    
    const bot = {
      id: botId,
      name: account.username,
      account: account,
      status: 'created',
      health: 20,
      food: 20,
      position: { x: 0, y: 64, z: 0 },
      activity: 'initializing',
      instance: null,
      settings: {
        autoReconnect: true
      },
      connection: {
        connected: false,
        reconnectAttempts: 0
      }
    };
    
    this.bots.set(botId, bot);
    this.consoleLog(`🤖 Created bot: ${bot.name}`);
    
    return bot;
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
        auth: 'offline' // For Aternos (offline mode)
      };
      
      this.consoleLog(`Creating Mineflayer bot for ${bot.name}...`);
      
      // Create the bot instance
      const mcBot = mineflayer.createBot(options);
      
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
      
      // Auto-reply to messages mentioning the bot
      if (message.toLowerCase().includes(bot.name.toLowerCase()) || Math.random() < 0.3) {
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
      
      if (bot.settings.autoReconnect && bot.connection.reconnectAttempts < 5) {
        this.scheduleReconnection(bot);
      }
    });
    
    // Spawn events
    mcBot.on('spawn', () => {
      bot.status = 'connected';
      bot.connection.connected = true;
      this.consoleLog(`📍 ${bot.name} spawned in world`);
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
      
      // Perform random activities
      this.performRandomActivity(bot);
      
      // Update health/food from bot instance
      if (bot.instance.health !== undefined) bot.health = bot.instance.health;
      if (bot.instance.food !== undefined) bot.food = bot.instance.food;
      
    }, 15000 + Math.random() * 15000); // Every 15-30 seconds
    
    // Anti-AFK movement
    if (bot.afkInterval) clearInterval(bot.afkInterval);
    bot.afkInterval = setInterval(() => {
      if (bot.instance && bot.connection.connected) {
        this.antiAFKMovement(bot);
      }
    }, 60000 + Math.random() * 60000); // Every 1-2 minutes
    
    // Auto-chat
    if (bot.chatInterval) clearInterval(bot.chatInterval);
    bot.chatInterval = setInterval(() => {
      if (bot.instance && bot.connection.connected && Math.random() < 0.4) {
        this.sendBotChat(bot);
      }
    }, 30000 + Math.random() * 60000); // Every 30-90 seconds
  }
  
  performRandomActivity(bot) {
    if (!bot.instance || !bot.connection.connected) return;
    
    const activities = [
      'exploring', 'mining', 'building', 'chatting', 
      'guarding', 'farming', 'fishing', 'crafting'
    ];
    
    bot.activity = activities[Math.floor(Math.random() * activities.length)];
    
    // Perform actual Minecraft actions
    switch (bot.activity) {
      case 'mining':
        this.mineRandomBlock(bot);
        break;
      case 'exploring':
        this.randomMovement(bot);
        break;
      case 'chatting':
        this.sendBotChat(bot);
        break;
    }
  }
  
  mineRandomBlock(bot) {
    if (!bot.instance) return;
    
    // Look for nearby blocks to mine
    const block = bot.instance.findBlock({
      matching: (block) => {
        return block && block.name && 
               ['stone', 'dirt', 'grass', 'gravel', 'sand', 'coal_ore'].includes(block.name);
      },
      maxDistance: 16,
      count: 1
    });
    
    if (block) {
      bot.instance.dig(block, (err) => {
        if (!err) {
          this.consoleLog(`⛏️ ${bot.name} mined ${block.name}`);
        }
      });
    }
  }
  
  randomMovement(bot) {
    if (!bot.instance) return;
    
    // Move in random direction
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    bot.instance.setControlState(direction, true);
    
    setTimeout(() => {
      if (bot.instance) {
        bot.instance.setControlState(direction, false);
      }
    }, 1000 + Math.random() * 2000);
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
    
    const chatMessages = [
      'Hello everyone!',
      'How is everyone doing?',
      'Nice server!',
      'Anyone need help?',
      'Good day!',
      'Building something great!',
      'Found some ores!',
      'Beautiful view!',
      'Exploring new areas!',
      'All clear here!'
    ];
    
    const message = chatMessages[Math.floor(Math.random() * chatMessages.length)];
    
    bot.instance.chat(message);
    this.addChatMessage(bot.name, message, 'bot');
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
    
    // Clear existing disconnected bots first
    await this.clearInactiveBots();
    
    for (let i = 0; i < maxBots; i++) {
      try {
        const bot = await this.createBot();
        
        const delay = i * 5000; // Stagger connections by 5 seconds
        
        setTimeout(async () => {
          try {
            await this.connectBot(bot.id);
            results.successful.push({
              botId: bot.id,
              name: bot.name
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
  
  async stopAllBots() {
    this.consoleLog('🛑 Stopping all bots...');
    
    let stopped = 0;
    
    for (const [botId, bot] of this.bots) {
      if (bot.instance) {
        try {
          bot.instance.end();
          bot.instance = null;
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      
      // Clear intervals
      if (bot.activityInterval) clearInterval(bot.activityInterval);
      if (bot.afkInterval) clearInterval(bot.afkInterval);
      if (bot.chatInterval) clearInterval(bot.chatInterval);
      
      bot.status = 'stopped';
      bot.connection.connected = false;
      stopped++;
    }
    
    return {
      success: true,
      message: `Stopped ${stopped} bots`
    };
  }
  
  async emergencyStop() {
    this.consoleLog('🚨 EMERGENCY STOP - Disconnecting all bots');
    
    let stopped = 0;
    
    for (const [botId, bot] of this.bots) {
      // Clear intervals
      if (bot.activityInterval) clearInterval(bot.activityInterval);
      if (bot.afkInterval) clearInterval(bot.afkInterval);
      if (bot.chatInterval) clearInterval(bot.chatInterval);
      
      // Disconnect bot immediately
      if (bot.instance) {
        try {
          bot.instance.quit();
          bot.instance = null;
        } catch (error) {
          console.error(`Error stopping bot ${bot.name}:`, error.message);
        }
      }
      
      bot.status = 'emergency_stopped';
      bot.connection.connected = false;
      stopped++;
    }
    
    return {
      success: true,
      message: `Emergency stop complete. Stopped ${stopped} bots.`
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
  
  async rotateAccounts() {
    this.consoleLog('👤 Rotating accounts...');
    
    let rotated = 0;
    
    for (const [botId, bot] of this.bots) {
      if (bot.status === 'connected') {
        const newAccount = await this.getNextAccount();
        const oldAccount = bot.account.username;
        bot.account = newAccount;
        bot.name = newAccount.username;
        rotated++;
        
        this.logEvent('account_rotated', {
          botId: bot.id,
          oldAccount: oldAccount,
          newAccount: newAccount.username
        });
      }
    }
    
    await this.saveAccounts();
    
    return {
      success: true,
      message: `Accounts rotated for ${rotated} bots`,
      rotated: rotated
    };
  }
  
  // Helper methods
  addChatMessage(sender, message, type = 'player') {
    const chatMessage = {
      id: crypto.randomBytes(8).toString('hex'),
      sender,
      message,
      type,
      timestamp: Date.now()
    };
    
    this.chatHistory.push(chatMessage);
    if (this.chatHistory.length > 100) {
      this.chatHistory = this.chatHistory.slice(-50);
    }
    
    return chatMessage;
  }
  
  consoleLog(message, level = 'info') {
    const log = {
      timestamp: Date.now(),
      message,
      level
    };
    
    this.consoleLogs.push(log);
    if (this.consoleLogs.length > 200) {
      this.consoleLogs = this.consoleLogs.slice(-100);
    }
    
    const prefix = level === 'error' ? '❌' : level === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${new Date().toLocaleTimeString()}] ${message}`);
    
    return log;
  }
  
  logEvent(type, data) {
    const event = {
      type,
      data,
      timestamp: Date.now()
    };
    
    this.events.push(event);
    if (this.events.length > 100) {
      this.events = this.events.slice(-50);
    }
    
    return event;
  }
  
  getConnectedBots() {
    return Array.from(this.bots.values()).filter(bot => bot.status === 'connected');
  }
  
  getChatHistory(limit = 10) {
    return this.chatHistory.slice(-limit).reverse();
  }
  
  getRecentEvents(limit = 10) {
    return this.events.slice(-limit).reverse().map(event => ({
      type: event.type,
      message: this.formatEventMessage(event),
      time: new Date(event.timestamp).toLocaleTimeString()
    }));
  }
  
  getConsoleLogs(limit = 10) {
    return this.consoleLogs.slice(-limit).reverse().map(log => 
      `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`
    );
  }
  
  formatEventMessage(event) {
    switch (event.type) {
      case 'bot_connected':
        return `✅ ${event.data.name} connected to server`;
      case 'account_rotated':
        return `👤 ${event.data.oldAccount} → ${event.data.newAccount}`;
      default:
        return `${event.type}`;
    }
  }
  
  // Public API methods
  async getStatus() {
    const connectedBots = this.getConnectedBots();
    const serverStatus = await this.testServerConnection();
    
    // Calculate average health
    const avgHealth = connectedBots.length > 0 
      ? Math.round(connectedBots.reduce((sum, bot) => sum + (bot.health || 20), 0) / connectedBots.length)
      : 20;
    
    return {
      stats: {
        totalBots: this.bots.size,
        connectedBots: connectedBots.length,
        serverOnline: serverStatus.online,
        ping: serverStatus.ping,
        chatMessages: this.chatHistory.length,
        avgHealth: avgHealth,
        uptime: Math.floor(process.uptime())
      },
      bots: connectedBots.map(bot => ({
        id: bot.id,
        name: bot.name,
        type: 'bot',
        status: bot.status,
        health: bot.health,
        food: bot.food,
        activity: bot.activity,
        position: `${bot.position.x},${bot.position.y},${bot.position.z}`,
        account: bot.account.username
      }))
    };
  }
}

module.exports = BotSystem;
