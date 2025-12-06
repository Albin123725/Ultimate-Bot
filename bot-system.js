const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const EventEmitter = require('events');

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
    
    // Configuration
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
      
      network: {
        useProxies: process.env.USE_PROXIES === 'true',
        proxyRotationInterval: 1800000,
        connectionTimeout: 30000,
        rateLimit: 3000
      },
      
      features: {
        ai: process.env.ENABLE_AI !== 'false',
        antiDetection: process.env.ANTI_DETECTION !== 'false',
        smartJoining: true,
        activitySimulation: true,
        healthMonitoring: true,
        autoFarming: true,
        autoMining: true,
        chatEnabled: true
      },
      
      chat: {
        enabled: true,
        frequency: 30000,
        autoReplies: [
          'Hello!',
          'How are you?',
          'Nice to meet you!',
          'Good day!',
          'What\'s up?'
        ],
        enableReplies: true
      }
    };
    
    this.metrics = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalUptime: 0,
      averageSession: 0,
      reconnects: 0
    };
    
    console.log('🚀 Ultimate Bot System v4.0 Initialized');
  }
  
  async initialize() {
    console.log('🔄 Initializing system...');
    
    // Create directories
    await this.createDirectories();
    
    // Load data
    await this.loadData();
    
    // Start monitoring
    this.startMonitoring();
    
    this.consoleLog('System initialized successfully');
    return this;
  }
  
  async createDirectories() {
    const dirs = [
      'logs', 'logs/connections', 'logs/errors',
      'config', 'config/accounts', 'config/proxies',
      'data', 'sessions', 'backups', 'public'
    ];
    
    for (const dir of dirs) {
      await fs.ensureDir(path.join(__dirname, dir));
    }
  }
  
  async loadData() {
    try {
      // Load accounts
      const accountsPath = path.join(__dirname, 'config', 'accounts.json');
      if (await fs.pathExists(accountsPath)) {
        const accountsData = await fs.readJson(accountsPath);
        accountsData.forEach(acc => {
          this.accounts.set(acc.id, acc);
        });
        this.consoleLog(`Loaded ${this.accounts.size} accounts`);
      } else {
        await this.generateAccounts(10);
      }
      
      // Load proxies
      const proxiesPath = path.join(__dirname, 'config', 'proxies.json');
      if (await fs.pathExists(proxiesPath)) {
        this.proxies = await fs.readJson(proxiesPath);
        this.consoleLog(`Loaded ${this.proxies.length} proxies`);
      } else if (this.config.network.useProxies) {
        await this.generateProxies(50);
      }
      
    } catch (error) {
      console.error('Failed to load data:', error.message);
      // Generate fresh data
      await this.generateAccounts(10);
      if (this.config.network.useProxies) {
        await this.generateProxies(50);
      }
    }
    
    this.consoleLog('Data loaded successfully');
  }
  
  async generateAccounts(count) {
    const names = [
      'MinecraftPro', 'BlockMaster', 'RedstoneWizard', 'DiamondMiner',
      'NetherExplorer', 'EnderHunter', 'BuilderBob', 'FarmExpert',
      'GuardianBot', 'SocialSally', 'TechTyler', 'ExplorerX',
      'CaveCrawler', 'OceanOliver', 'ForestFrank', 'MountainMike'
    ];
    
    for (let i = 0; i < count; i++) {
      const account = {
        id: crypto.randomBytes(12).toString('hex'),
        username: names[i] || `Bot${crypto.randomBytes(4).toString('hex')}`,
        email: `bot${i}@ultimatebot.com`,
        created: new Date().toISOString(),
        status: 'active',
        stats: {
          totalPlaytime: Math.floor(Math.random() * 10000),
          sessions: Math.floor(Math.random() * 50),
          successRate: 0.9 + Math.random() * 0.09
        },
        lastUsed: null
      };
      
      this.accounts.set(account.id, account);
    }
    
    await this.saveAccounts();
    this.consoleLog(`Generated ${count} accounts`);
  }
  
  async saveAccounts() {
    try {
      const accountsPath = path.join(__dirname, 'config', 'accounts.json');
      const accounts = Array.from(this.accounts.values());
      await fs.writeJson(accountsPath, accounts, { spaces: 2 });
    } catch (error) {
      console.error('Failed to save accounts:', error.message);
    }
  }
  
  async generateProxies(count) {
    const types = ['residential', 'datacenter', 'mobile'];
    const countries = ['US', 'UK', 'DE', 'FR', 'CA', 'AU', 'JP'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      
      this.proxies.push({
        id: crypto.randomBytes(16).toString('hex'),
        type: type,
        country: country,
        ip: this.generateIP(country),
        port: this.generatePort(type),
        protocol: Math.random() > 0.5 ? 'http' : 'socks5',
        speed: 20 + Math.random() * 80,
        latency: 10 + Math.random() * 100,
        successRate: 0.85 + Math.random() * 0.14,
        lastUsed: null,
        status: 'active'
      });
    }
    
    await this.saveProxies();
    this.consoleLog(`Generated ${count} proxies`);
  }
  
  async saveProxies() {
    try {
      const proxiesPath = path.join(__dirname, 'config', 'proxies.json');
      await fs.writeJson(proxiesPath, this.proxies, { spaces: 2 });
    } catch (error) {
      console.error('Failed to save proxies:', error.message);
    }
  }
  
  generateIP(country) {
    const ranges = {
      US: ['192.168.', '10.0.', '172.16.'],
      UK: ['81.0.', '86.0.', '94.0.'],
      DE: ['78.0.', '79.0.', '84.0.'],
      FR: ['81.0.', '90.0.', '92.0.'],
      CA: ['24.0.', '70.0.', '99.0.'],
      AU: ['1.0.', '14.0.', '27.0.'],
      JP: ['110.0.', '111.0.', '112.0.']
    };
    
    const countryRanges = ranges[country] || ranges.US;
    const range = countryRanges[Math.floor(Math.random() * countryRanges.length)];
    
    return `${range}${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
  
  generatePort(type) {
    const ports = {
      http: [80, 8080, 8888, 3128],
      socks5: [1080, 1081, 1082],
      residential: [8080, 8888],
      mobile: [8080, 8888]
    };
    
    const typePorts = ports[type] || [8080];
    return typePorts[Math.floor(Math.random() * typePorts.length)];
  }
  
  async startAllBots() {
    this.consoleLog('🚀 Starting all bots...');
    
    const maxBots = Math.min(this.config.bots.maxBots, 4);
    const results = {
      successful: [],
      failed: []
    };
    
    // Clear existing inactive bots first
    await this.clearInactiveBots();
    
    for (let i = 0; i < maxBots; i++) {
      try {
        const type = this.config.bots.types[i % this.config.bots.types.length];
        const bot = await this.createBot(type);
        
        const delay = i * this.config.network.rateLimit;
        
        setTimeout(async () => {
          try {
            await this.connectBot(bot.id);
            results.successful.push({
              botId: bot.id,
              type: bot.type,
              name: bot.name
            });
          } catch (error) {
            results.failed.push({
              botId: bot.id,
              type: bot.type,
              name: bot.name,
              error: error.message
            });
          }
        }, delay);
        
      } catch (error) {
        results.failed.push({
          index: i,
          error: error.message
        });
      }
    }
    
    this.logEvent('start_all_bots', {
      requested: maxBots,
      successful: results.successful.length,
      failed: results.failed.length
    });
    
    return {
      success: true,
      message: `Started ${results.successful.length} bots`,
      results: results
    };
  }
  
  async createBot(type) {
    const botId = `bot_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const account = await this.getNextAccount();
    const proxy = this.config.network.useProxies ? await this.getNextProxy() : null;
    const name = this.generateBotName(type);
    
    const bot = {
      id: botId,
      type: type,
      name: name,
      account: account,
      proxy: proxy,
      status: 'created',
      health: 20,
      food: 20,
      position: { x: 0, y: 64, z: 0 },
      activity: 'initializing',
      behavior: this.getBotBehavior(type),
      ai: {
        personality: this.generatePersonality(type),
        decisions: [],
        memory: [],
        task: null
      },
      security: {
        suspicion: 0,
        patternBreaks: 0,
        lastRotation: Date.now()
      },
      metrics: {
        created: Date.now(),
        startTime: null,
        messages: 0,
        actions: 0,
        distance: 0,
        deaths: 0,
        reconnects: 0,
        totalUptime: 0,
        lastActivity: Date.now()
      },
      settings: {
        autoReconnect: this.config.bots.autoReconnect,
        chatEnabled: this.config.chat.enabled,
        antiAFK: true
      },
      connection: {
        connected: false,
        reconnectAttempts: 0,
        lastConnectionAttempt: null,
        lastDisconnect: null,
        ping: 0
      },
      intervals: {
        activity: null,
        health: null,
        chat: null
      }
    };
    
    this.bots.set(botId, bot);
    
    this.consoleLog(`Created ${type} bot: ${name}`);
    this.logEvent('bot_created', { botId, type, name });
    
    return bot;
  }
  
  generateBotName(type) {
    const prefixes = {
      builder: ['Builder', 'Architect', 'Constructor', 'Mason'],
      miner: ['Miner', 'Excavator', 'Prospector', 'Digger'],
      explorer: ['Explorer', 'Adventurer', 'Scout', 'Pathfinder'],
      socializer: ['Socializer', 'Chatter', 'Helper', 'Friend'],
      guardian: ['Guardian', 'Protector', 'Sentinel', 'Watcher']
    };
    
    const typePrefixes = prefixes[type] || ['Bot'];
    const prefix = typePrefixes[Math.floor(Math.random() * typePrefixes.length)];
    const number = Math.floor(Math.random() * 9999);
    
    return `${prefix}${number}`;
  }
  
  getBotBehavior(type) {
    const behaviors = {
      builder: {
        activities: ['build_house', 'build_farm', 'decorate', 'expand', 'repair'],
        speed: 0.7,
        precision: 0.9,
        social: 0.3,
        risk: 0.2,
        resources: ['wood', 'stone', 'glass', 'bricks']
      },
      miner: {
        activities: ['mine_diamonds', 'mine_iron', 'dig_tunnel', 'explore_caves', 'quarry'],
        speed: 0.8,
        precision: 0.8,
        social: 0.1,
        risk: 0.6,
        resources: ['diamonds', 'iron', 'coal', 'redstone']
      },
      explorer: {
        activities: ['explore_terrain', 'map_area', 'find_village', 'discover_temple', 'scout'],
        speed: 0.9,
        precision: 0.7,
        social: 0.4,
        risk: 0.7,
        resources: ['maps', 'compass', 'elytra', 'potions']
      },
      socializer: {
        activities: ['chat_players', 'trade_items', 'help_newbies', 'organize_event', 'emote'],
        speed: 0.6,
        precision: 0.6,
        social: 0.9,
        risk: 0.3,
        resources: ['emeralds', 'food', 'tools', 'armor']
      },
      guardian: {
        activities: ['patrol_area', 'defend_base', 'monitor_chat', 'alert_danger', 'scout_hostile'],
        speed: 0.8,
        precision: 0.9,
        social: 0.5,
        risk: 0.8,
        resources: ['weapons', 'armor', 'potions', 'arrows']
      }
    };
    
    return behaviors[type] || behaviors.builder;
  }
  
  generatePersonality(type) {
    const base = {
      curiosity: 0.5,
      patience: 0.5,
      bravery: 0.5,
      creativity: 0.5,
      social: 0.5,
      efficiency: 0.5,
      loyalty: 0.5,
      aggression: 0.5
    };
    
    // Type-specific adjustments
    switch (type) {
      case 'builder':
        base.creativity = 0.9;
        base.patience = 0.8;
        base.efficiency = 0.7;
        break;
      case 'miner':
        base.patience = 0.9;
        base.bravery = 0.7;
        base.efficiency = 0.8;
        break;
      case 'explorer':
        base.curiosity = 0.9;
        base.bravery = 0.8;
        base.aggression = 0.3;
        break;
      case 'socializer':
        base.social = 0.9;
        base.curiosity = 0.8;
        base.aggression = 0.1;
        break;
      case 'guardian':
        base.bravery = 0.9;
        base.loyalty = 0.9;
        base.aggression = 0.7;
        base.efficiency = 0.8;
        break;
    }
    
    // Add randomness
    for (const trait in base) {
      base[trait] = Math.max(0.1, Math.min(0.99, base[trait] + (Math.random() - 0.5) * 0.3));
    }
    
    return base;
  }
  
  async getNextAccount() {
    const accounts = Array.from(this.accounts.values())
      .filter(acc => acc.status === 'active')
      .sort((a, b) => (a.lastUsed || 0) - (b.lastUsed || 0));
    
    if (accounts.length === 0) {
      await this.generateAccounts(5);
      return Array.from(this.accounts.values())[0];
    }
    
    const account = accounts[0];
    account.lastUsed = Date.now();
    account.stats.sessions = (account.stats.sessions || 0) + 1;
    
    await this.saveAccounts();
    return account;
  }
  
  async getNextProxy() {
    if (this.proxies.length === 0) {
      await this.generateProxies(20);
    }
    
    // Sort by success rate and last used
    const sorted = [...this.proxies]
      .filter(p => p.status === 'active')
      .sort((a, b) => {
        const aScore = a.successRate * 100 - (new Date(a.lastUsed || 0).getTime() / 100000);
        const bScore = b.successRate * 100 - (new Date(b.lastUsed || 0).getTime() / 100000);
        return bScore - aScore;
      });
    
    const proxy = sorted[0];
    proxy.lastUsed = new Date().toISOString();
    
    await this.saveProxies();
    return proxy;
  }
  
  async connectBot(botId) {
    const bot = this.bots.get(botId);
    if (!bot) throw new Error('Bot not found');
    
    this.consoleLog(`Connecting bot: ${bot.name}`);
    
    bot.status = 'connecting';
    bot.connection.lastConnectionAttempt = Date.now();
    bot.metrics.startTime = Date.now();
    
    try {
      // Test server connection
      const serverStatus = await this.testServerConnection();
      
      if (!serverStatus.online) {
        throw new Error('Server is offline');
      }
      
      // Simulate connection
      await this.simulateConnection(bot);
      
      // Mark as connected
      bot.status = 'connected';
      bot.connection.connected = true;
      bot.connection.reconnectAttempts = 0;
      bot.activity = 'active';
      bot.health = 20;
      bot.food = 20;
      
      this.metrics.successfulConnections++;
      this.metrics.totalConnections++;
      
      // Start bot activity
      this.startBotActivity(bot);
      
      // Start health monitoring
      this.startHealthMonitoring(bot);
      
      // Start chat if enabled
      if (bot.settings.chatEnabled && this.config.chat.enabled) {
        this.startChat(bot);
      }
      
      this.consoleLog(`${bot.name} connected successfully`);
      this.logEvent('bot_connected', {
        botId: bot.id,
        name: bot.name,
        type: bot.type
      });
      
      return bot;
      
    } catch (error) {
      bot.status = 'failed';
      bot.connection.connected = false;
      bot.activity = 'connection_failed';
      
      this.metrics.failedConnections++;
      
      this.consoleLog(`${bot.name} connection failed: ${error.message}`, 'error');
      this.logEvent('connection_failed', {
        botId: bot.id,
        name: bot.name,
        error: error.message
      });
      
      // Schedule retry
      if (bot.settings.autoReconnect && 
          bot.connection.reconnectAttempts < this.config.bots.maxReconnectAttempts) {
        this.scheduleReconnection(bot);
      }
      
      throw error;
    }
  }
  
  async simulateConnection(bot) {
    return new Promise((resolve, reject) => {
      const timeout = this.config.network.connectionTimeout;
      const startTime = Date.now();
      
      const connectionDelay = 1000 + Math.random() * 3000;
      const ping = 50 + Math.random() * 200;
      bot.connection.ping = ping;
      
      const failureChance = bot.security.suspicion > 50 ? 0.4 : 0.2;
      
      setTimeout(() => {
        if (Math.random() > failureChance) {
          resolve();
        } else {
          const errors = [
            'Connection timeout',
            'Kicked while logging in',
            'Server full',
            'Authentication failed',
            'Network error'
          ];
          const error = errors[Math.floor(Math.random() * errors.length)];
          reject(new Error(error));
        }
      }, connectionDelay);
      
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeout);
    });
  }
  
  startBotActivity(bot) {
    // Clear existing interval
    if (bot.intervals.activity) {
      clearInterval(bot.intervals.activity);
    }
    
    bot.intervals.activity = setInterval(() => {
      if (bot.status !== 'connected') {
        clearInterval(bot.intervals.activity);
        return;
      }
      
      // Update activity based on bot type
      const activities = bot.behavior.activities;
      if (activities && activities.length > 0) {
        bot.activity = activities[Math.floor(Math.random() * activities.length)];
        bot.metrics.actions++;
        bot.metrics.lastActivity = Date.now();
        
        // Simulate movement
        bot.position.x += (Math.random() - 0.5) * 10;
        bot.position.z += (Math.random() - 0.5) * 10;
        bot.metrics.distance += Math.random() * 5;
        
        // Occasionally chat
        if (Math.random() < bot.behavior.social * 0.1) {
          this.simulateChat(bot);
        }
      }
      
      // Update metrics
      if (bot.metrics.startTime) {
        bot.metrics.totalUptime = Date.now() - bot.metrics.startTime;
      }
      
      // Random disconnect simulation
      if (this.config.features.antiDetection && Math.random() < 0.02) {
        this.simulateRandomDisconnect(bot);
      }
      
    }, 10000 + Math.random() * 20000);
  }
  
  startHealthMonitoring(bot) {
    if (bot.intervals.health) {
      clearInterval(bot.intervals.health);
    }
    
    bot.intervals.health = setInterval(() => {
      if (bot.status !== 'connected') {
        clearInterval(bot.intervals.health);
        return;
      }
      
      // Random health changes
      if (Math.random() < 0.1) {
        bot.health = Math.max(1, bot.health - Math.floor(Math.random() * 3));
      }
      
      if (Math.random() < 0.15) {
        bot.food = Math.max(0, bot.food - Math.floor(Math.random() * 2));
      }
      
      if (Math.random() < 0.05) {
        bot.health = Math.min(20, bot.health + Math.floor(Math.random() * 3));
      }
      
      if (Math.random() < 0.08) {
        bot.food = Math.min(20, bot.food + Math.floor(Math.random() * 4));
      }
      
      // Emergency if health too low
      if (bot.health < 5) {
        this.handleEmergency(bot);
      }
      
    }, 15000 + Math.random() * 15000);
  }
  
  startChat(bot) {
    if (bot.intervals.chat) {
      clearInterval(bot.intervals.chat);
    }
    
    const frequency = this.config.chat.frequency;
    
    bot.intervals.chat = setInterval(() => {
      if (bot.status !== 'connected' || !bot.settings.chatEnabled) {
        clearInterval(bot.intervals.chat);
        return;
      }
      
      if (Math.random() < 0.3) { // 30% chance to chat each interval
        this.simulateChat(bot);
      }
    }, frequency + Math.random() * 10000);
  }
  
  simulateChat(bot) {
    const chatMessages = {
      builder: [
        'Building something amazing!',
        'Need more blocks...',
        'This build is coming along nicely!',
        'Anyone have some wood?',
        'Check out my new house!'
      ],
      miner: [
        'Found diamonds!',
        'Digging deep...',
        'This cave is huge!',
        'Need more torches!',
        'Strike the earth!'
      ],
      explorer: [
        'Found a new area!',
        'The view is incredible!',
        'Discovering new lands!',
        'This biome is beautiful!',
        'Found a village!'
      ],
      socializer: [
        'Hello everyone!',
        'How is everyone doing?',
        'Great server!',
        'Anyone need help?',
        'Nice weather today!'
      ],
      guardian: [
        'All clear in the area.',
        'No threats detected.',
        'Perimeter secure.',
        'Staying vigilant.',
        'Everything is safe.'
      ]
    };
    
    const messages = chatMessages[bot.type] || ['Hello!'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    bot.metrics.messages++;
    
    // Add to chat history
    this.addChatMessage(bot.name, message, 'bot');
    
    this.logEvent('bot_chat', {
      botId: bot.id,
      name: bot.name,
      message: message
    });
    
    this.consoleLog(`${bot.name}: ${message}`);
  }
  
  simulateRandomDisconnect(bot) {
    if (Math.random() < 0.3) {
      this.consoleLog(`${bot.name} randomly disconnecting (anti-detection)`);
      
      bot.status = 'disconnected';
      bot.connection.connected = false;
      bot.connection.lastDisconnect = Date.now();
      
      // Schedule reconnection
      setTimeout(() => {
        this.connectBot(bot.id).catch(console.error);
      }, 5000 + Math.random() * 10000);
    }
  }
  
  handleEmergency(bot) {
    this.consoleLog(`${bot.name} emergency: Health too low!`);
    bot.activity = 'seeking_safety';
    
    // Simulate finding safety
    setTimeout(() => {
      if (bot.status === 'connected') {
        bot.activity = 'safe';
        bot.health = Math.min(20, bot.health + 10);
        this.addChatMessage(bot.name, 'That was close! Almost died there.', 'bot');
      }
    }, 3000);
  }
  
  scheduleReconnection(bot) {
    bot.connection.reconnectAttempts++;
    const delay = this.config.bots.reconnectDelay * bot.connection.reconnectAttempts;
    
    this.consoleLog(`${bot.name} reconnecting in ${delay/1000}s (attempt ${bot.connection.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connectBot(bot.id).catch(error => {
        this.consoleLog(`${bot.name} reconnection failed: ${error.message}`, 'error');
      });
    }, delay);
    
    this.metrics.reconnects++;
  }
  
  async smartJoin() {
    this.consoleLog('🧠 Smart join system activating...');
    
    const serverStatus = await this.testServerConnection();
    
    if (!serverStatus.online) {
      return {
        success: false,
        message: 'Server is offline. Please start it from Aternos panel.',
        serverStatus: serverStatus
      };
    }
    
    const optimalCount = this.calculateOptimalBotCount(serverStatus);
    const connectedBots = this.getConnectedBots().length;
    const availableSlots = Math.max(0, optimalCount - connectedBots);
    
    if (availableSlots <= 0) {
      return {
        success: false,
        message: 'Already at optimal bot count',
        serverStatus: serverStatus,
        connectedBots: connectedBots,
        optimalCount: optimalCount
      };
    }
    
    const results = [];
    
    for (let i = 0; i < availableSlots; i++) {
      try {
        const type = this.getOptimalBotType(i, serverStatus);
        const bot = await this.createBot(type);
        
        const delay = i * (this.config.network.rateLimit + (serverStatus.ping || 100));
        
        setTimeout(async () => {
          try {
            await this.connectBot(bot.id);
            results.push({
              success: true,
              botId: bot.id,
              type: type,
              name: bot.name
            });
          } catch (error) {
            results.push({
              success: false,
              type: type,
              error: error.message
            });
          }
        }, delay);
        
      } catch (error) {
        results.push({
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      message: `Smart join initiated with ${availableSlots} bots`,
      serverStatus: serverStatus,
      results: results
    };
  }
  
  calculateOptimalBotCount(serverStatus) {
    let count = 4;
    
    if (serverStatus.ping) {
      if (serverStatus.ping > 500) count = 1;
      else if (serverStatus.ping > 300) count = 2;
      else if (serverStatus.ping < 100) count = 4;
    }
    
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      count = Math.min(4, count + 1);
    }
    
    return Math.max(1, Math.min(this.config.bots.maxBots, count));
  }
  
  getOptimalBotType(index, serverStatus) {
    if (serverStatus.ping > 300) {
      return ['miner', 'explorer'][index % 2];
    }
    
    return this.config.bots.types[index % this.config.bots.types.length];
  }
  
  async rotateProxies() {
    this.consoleLog('🔄 Rotating proxies...');
    
    // Generate new proxies
    await this.generateProxies(20);
    
    // Update existing bots
    for (const [botId, bot] of this.bots) {
      if (bot.status === 'connected' && bot.proxy) {
        const newProxy = await this.getNextProxy();
        bot.proxy = newProxy;
        bot.security.lastRotation = Date.now();
        bot.security.patternBreaks++;
      }
    }
    
    this.logEvent('proxy_rotation', {
      rotatedBots: this.getConnectedBots().length,
      totalProxies: this.proxies.length
    });
    
    return {
      success: true,
      message: `Proxies rotated for ${this.getConnectedBots().length} bots`,
      totalProxies: this.proxies.length
    };
  }
  
  async rotateAccounts() {
    this.consoleLog('👤 Rotating accounts...');
    
    let rotated = 0;
    
    for (const [botId, bot] of this.bots) {
      if (bot.status === 'connected') {
        const newAccount = await this.getNextAccount();
        const oldAccount = bot.account.username;
        bot.account = newAccount;
        bot.name = this.generateBotName(bot.type);
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
  
  async fixConnectionIssues() {
    this.consoleLog('🔧 Fixing connection issues...');
    
    const fixes = [];
    
    for (const [botId, bot] of this.bots) {
      const issues = [];
      
      if (bot.connection.reconnectAttempts > 2) {
        issues.push('high_reconnect_attempts');
      }
      
      if (bot.health < 5) {
        issues.push('low_health');
      }
      
      if (bot.security.suspicion > 50) {
        issues.push('high_suspicion');
      }
      
      if (Date.now() - bot.metrics.lastActivity > 300000) {
        issues.push('inactive_too_long');
      }
      
      if (issues.length > 0) {
        // Apply fixes
        if (issues.includes('high_reconnect_attempts')) {
          bot.connection.reconnectAttempts = 0;
          fixes.push({ botId, issue: 'high_reconnect_attempts', action: 'reset_attempts' });
        }
        
        if (issues.includes('low_health')) {
          bot.health = Math.min(20, bot.health + 10);
          fixes.push({ botId, issue: 'low_health', action: 'restored_health' });
        }
        
        if (issues.includes('high_suspicion')) {
          bot.security.suspicion = Math.max(0, bot.security.suspicion - 30);
          fixes.push({ botId, issue: 'high_suspicion', action: 'reduced_suspicion' });
        }
        
        if (issues.includes('inactive_too_long')) {
          bot.metrics.lastActivity = Date.now();
          fixes.push({ botId, issue: 'inactive_too_long', action: 'reset_activity_timer' });
        }
      }
    }
    
    return {
      success: true,
      message: `Applied ${fixes.length} fixes`,
      fixes: fixes
    };
  }
  
  async emergencyStop() {
    this.consoleLog('🛑 EMERGENCY STOP ACTIVATED');
    
    let stopped = 0;
    
    for (const [botId, bot] of this.bots) {
      // Clear all intervals
      if (bot.intervals.activity) clearInterval(bot.intervals.activity);
      if (bot.intervals.health) clearInterval(bot.intervals.health);
      if (bot.intervals.chat) clearInterval(bot.intervals.chat);
      
      bot.status = 'stopped';
      bot.connection.connected = false;
      bot.activity = 'emergency_stop';
      stopped++;
    }
    
    this.logEvent('emergency_stop', {
      stoppedBots: stopped,
      totalBots: this.bots.size,
      timestamp: Date.now()
    });
    
    return {
      success: true,
      message: `Emergency stop complete. Stopped ${stopped} bots.`,
      stopped: stopped
    };
  }
  
  async addBot(type) {
    try {
      const bot = await this.createBot(type);
      
      setTimeout(async () => {
        try {
          await this.connectBot(bot.id);
          this.consoleLog(`${bot.name} started successfully`);
        } catch (error) {
          this.consoleLog(`Failed to start ${bot.name}: ${error.message}`, 'error');
        }
      }, 3000);
      
      return {
        success: true,
        message: `${type} bot created. Starting in 3 seconds...`,
        botId: bot.id,
        name: bot.name,
        type: type
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Failed to add ${type} bot: ${error.message}`
      };
    }
  }
  
  async controlBot(botId, action) {
    const bot = this.bots.get(botId);
    if (!bot) {
      return { success: false, message: 'Bot not found' };
    }
    
    switch (action) {
      case 'connect':
        if (bot.status === 'connected') {
          return { success: false, message: 'Bot already connected' };
        }
        await this.connectBot(botId);
        return { success: true, message: 'Bot connected' };
        
      case 'disconnect':
        if (bot.status !== 'connected') {
          return { success: false, message: 'Bot not connected' };
        }
        
        if (bot.intervals.activity) clearInterval(bot.intervals.activity);
        if (bot.intervals.health) clearInterval(bot.intervals.health);
        if (bot.intervals.chat) clearInterval(bot.intervals.chat);
        
        bot.status = 'disconnected';
        bot.connection.connected = false;
        bot.activity = 'manual_disconnect';
        return { success: true, message: 'Bot disconnected' };
        
      case 'remove':
        if (bot.intervals.activity) clearInterval(bot.intervals.activity);
        if (bot.intervals.health) clearInterval(bot.intervals.health);
        if (bot.intervals.chat) clearInterval(bot.intervals.chat);
        
        this.bots.delete(botId);
        return { success: true, message: 'Bot removed' };
        
      case 'chat':
        this.simulateChat(bot);
        return { success: true, message: 'Chat triggered' };
        
      default:
        return { success: false, message: 'Unknown action' };
    }
  }
  
  async clearInactiveBots() {
    let removed = 0;
    const now = Date.now();
    
    for (const [botId, bot] of this.bots) {
      if (bot.status !== 'connected' && 
          (now - bot.metrics.created) > 3600000 && // Older than 1 hour
          bot.connection.reconnectAttempts >= this.config.bots.maxReconnectAttempts) {
        
        if (bot.intervals.activity) clearInterval(bot.intervals.activity);
        if (bot.intervals.health) clearInterval(bot.intervals.health);
        if (bot.intervals.chat) clearInterval(bot.intervals.chat);
        
        this.bots.delete(botId);
        removed++;
      }
    }
    
    return {
      success: true,
      message: `Cleared ${removed} inactive bots`,
      removed: removed
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
          address: `${this.config.server.host}:${this.config.server.port}`,
          message: `Server is online (${latency}ms)`
        });
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          online: false,
          ping: null,
          address: `${this.config.server.host}:${this.config.server.port}`,
          message: 'Connection timeout'
        });
      });
      
      socket.on('error', (error) => {
        socket.destroy();
        resolve({
          online: false,
          ping: null,
          address: `${this.config.server.host}:${this.config.server.port}`,
          message: error.message
        });
      });
      
      try {
        socket.connect(this.config.server.port, this.config.server.host);
      } catch (error) {
        resolve({
          online: false,
          ping: null,
          address: `${this.config.server.host}:${this.config.server.port}`,
          message: error.message
        });
      }
    });
  }
  
  async updateSettings(settings) {
    // Update config
    if (settings.maxBots) {
      this.config.bots.maxBots = parseInt(settings.maxBots);
    }
    
    if (settings.serverAddress) {
      this.config.server.host = settings.serverAddress;
    }
    
    if (settings.serverPort) {
      this.config.server.port = parseInt(settings.serverPort);
    }
    
    if (settings.serverVersion) {
      this.config.server.version = settings.serverVersion;
    }
    
    if (settings.autoReconnect !== undefined) {
      this.config.bots.autoReconnect = settings.autoReconnect;
    }
    
    if (settings.useProxies !== undefined) {
      this.config.network.useProxies = settings.useProxies;
    }
    
    if (settings.enableAI !== undefined) {
      this.config.features.ai = settings.enableAI;
    }
    
    if (settings.antiDetection !== undefined) {
      this.config.features.antiDetection = settings.antiDetection;
    }
    
    if (settings.chatRate) {
      this.config.chat.frequency = parseInt(settings.chatRate) * 1000;
    }
    
    // Update bot settings
    for (const [botId, bot] of this.bots) {
      if (settings.autoReconnect !== undefined) {
        bot.settings.autoReconnect = settings.autoReconnect;
      }
      
      if (settings.chatRate && bot.intervals.chat) {
        clearInterval(bot.intervals.chat);
        this.startChat(bot);
      }
    }
    
    // Save to .env
    await this.saveConfig();
    
    this.consoleLog('Settings updated');
    return { success: true, message: 'Settings saved' };
  }
  
  async saveConfig() {
    const envContent = `
# Ultimate Minecraft Bot System v4.0
# Generated: ${new Date().toISOString()}

# SERVER
MINECRAFT_HOST=${this.config.server.host}
MINECRAFT_PORT=${this.config.server.port}
MINECRAFT_VERSION=${this.config.server.version}

# BOTS
MAX_BOTS=${this.config.bots.maxBots}

# SYSTEM
PORT=${process.env.PORT || 10000}
AUTO_START=${process.env.AUTO_START || 'true'}
USE_PROXIES=${this.config.network.useProxies}

# FEATURES
ENABLE_AI=${this.config.features.ai}
ANTI_DETECTION=${this.config.features.antiDetection}
    `.trim();
    
    await fs.writeFile(path.join(__dirname, '.env'), envContent);
  }
  
  async getCurrentSettings() {
    return {
      success: true,
      settings: {
        maxBots: this.config.bots.maxBots,
        serverAddress: this.config.server.host,
        serverPort: this.config.server.port,
        serverVersion: this.config.server.version,
        autoReconnect: this.config.bots.autoReconnect,
        useProxies: this.config.network.useProxies,
        enableAI: this.config.features.ai,
        antiDetection: this.config.features.antiDetection,
        chatRate: this.config.chat.frequency / 1000
      }
    };
  }
  
  async enableChat(enabled) {
    this.config.chat.enabled = enabled;
    
    for (const [botId, bot] of this.bots) {
      bot.settings.chatEnabled = enabled;
      
      if (enabled && bot.status === 'connected' && !bot.intervals.chat) {
        this.startChat(bot);
      } else if (!enabled && bot.intervals.chat) {
        clearInterval(bot.intervals.chat);
      }
    }
    
    return {
      success: true,
      message: `Chat ${enabled ? 'enabled' : 'disabled'} for all bots`
    };
  }
  
  async sendChatMessage(message) {
    if (!this.config.chat.enabled) {
      return { success: false, error: 'Chat is disabled' };
    }
    
    const connectedBots = this.getConnectedBots();
    if (connectedBots.length === 0) {
      return { success: false, error: 'No connected bots' };
    }
    
    // Send to a random bot
    const bot = connectedBots[Math.floor(Math.random() * connectedBots.length)];
    
    this.addChatMessage(bot.name, message, 'bot');
    this.consoleLog(`Manual chat from ${bot.name}: ${message}`);
    
    return {
      success: true,
      message: `Chat sent via ${bot.name}`,
      bot: bot.name,
      messageContent: message
    };
  }
  
  async updateChatSettings(settings) {
    if (settings.frequency) {
      this.config.chat.frequency = parseInt(settings.frequency) * 1000;
    }
    
    if (settings.autoReplies) {
      this.config.chat.autoReplies = settings.autoReplies;
    }
    
    if (settings.enableReplies !== undefined) {
      this.config.chat.enableReplies = settings.enableReplies;
    }
    
    // Update all bots' chat intervals
    for (const [botId, bot] of this.bots) {
      if (bot.status === 'connected' && bot.intervals.chat) {
        clearInterval(bot.intervals.chat);
        this.startChat(bot);
      }
    }
    
    return { success: true, message: 'Chat settings updated' };
  }
  
  async autoFarm() {
    this.consoleLog('🚜 Starting auto-farm system...');
    
    // Create farm task
    const task = {
      id: `task_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`,
      name: 'Auto Farm',
      type: 'farm',
      status: 'running',
      description: 'Automatic crop farming system',
      bots: 2,
      progress: 0,
      created: Date.now(),
      settings: {
        farmType: 'wheat',
        farmSize: 'medium'
      }
    };
    
    this.tasks.push(task);
    
    // Assign bots to farming
    const availableBots = this.getConnectedBots()
      .filter(bot => ['builder', 'miner'].includes(bot.type))
      .slice(0, 2);
    
    availableBots.forEach(bot => {
      bot.ai.task = task.id;
      bot.activity = 'farming_wheat';
    });
    
    this.logEvent('auto_farm_started', {
      taskId: task.id,
      assignedBots: availableBots.length
    });
    
    return {
      success: true,
      message: 'Auto-farm started with 2 bots',
      task: task,
      bots: availableBots.map(b => b.name)
    };
  }
  
  async createTask(data) {
    let task;
    
    switch (data.type) {
      case 'farm':
        task = {
          id: `task_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`,
          name: `${data.farmType} Farm`,
          type: 'farm',
          status: 'running',
          description: `Farming ${data.farmType} in ${data.farmSize} area`,
          bots: data.bots || 2,
          progress: 0,
          created: Date.now(),
          settings: data
        };
        break;
        
      case 'mine':
        task = {
          id: `task_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`,
          name: `${data.priority} Mining`,
          type: 'mine',
          status: 'running',
          description: `Mining ${data.priority} at depth ${data.depth}`,
          bots: data.bots || 2,
          progress: 0,
          created: Date.now(),
          settings: data
        };
        break;
        
      default:
        throw new Error('Unknown task type');
    }
    
    this.tasks.push(task);
    
    // Assign bots to task
    const availableBots = this.getConnectedBots()
      .filter(bot => {
        if (data.type === 'farm') return ['builder', 'miner'].includes(bot.type);
        if (data.type === 'mine') return ['miner', 'explorer'].includes(bot.type);
        return true;
      })
      .slice(0, task.bots);
    
    availableBots.forEach(bot => {
      bot.ai.task = task.id;
      bot.activity = `${task.type}_${task.name.toLowerCase().replace(/\s+/g, '_')}`;
    });
    
    this.logEvent('task_created', {
      taskId: task.id,
      type: task.type,
      assignedBots: availableBots.length
    });
    
    // Start task progress simulation
    this.startTaskProgress(task);
    
    return {
      success: true,
      message: `Task "${task.name}" created`,
      task: task,
      bots: availableBots.map(b => b.name)
    };
  }
  
  startTaskProgress(task) {
    const progressInterval = setInterval(() => {
      const taskIndex = this.tasks.findIndex(t => t.id === task.id);
      if (taskIndex === -1) {
        clearInterval(progressInterval);
        return;
      }
      
      if (task.progress >= 100) {
        clearInterval(progressInterval);
        task.status = 'completed';
        this.consoleLog(`Task "${task.name}" completed!`);
        return;
      }
      
      // Increment progress
      task.progress = Math.min(100, task.progress + Math.random() * 5);
      
      // Update bots' activities
      this.getConnectedBots()
        .filter(bot => bot.ai.task === task.id)
        .forEach(bot => {
          bot.activity = `${task.type}_progress_${task.progress}%`;
        });
      
    }, 30000); // Update every 30 seconds
  }
  
  startMonitoring() {
    // System health monitoring
    setInterval(() => {
      this.monitorSystemHealth();
    }, 60000);
    
    // Auto-save data
    setInterval(() => {
      this.saveData();
    }, 300000);
    
    // Task monitoring
    setInterval(() => {
      this.monitorTasks();
    }, 60000);
    
    this.consoleLog('Monitoring systems started');
  }
  
  monitorSystemHealth() {
    const connected = this.getConnectedBots().length;
    const total = this.bots.size;
    
    if (connected === 0 && total > 0) {
      this.consoleLog('⚠️ Warning: No bots connected', 'warning');
    }
    
    // Check system resources
    const os = require('os');
    const cpu = os.loadavg()[0] / os.cpus().length;
    const mem = (os.totalmem() - os.freemem()) / os.totalmem();
    
    if (cpu > 0.9 || mem > 0.9) {
      this.consoleLog('⚠️ High resource usage detected', 'warning');
    }
  }
  
  monitorTasks() {
    // Clean up old tasks
    const now = Date.now();
    this.tasks = this.tasks.filter(task => {
      if (task.status === 'completed' && (now - task.created) > 3600000) {
        return false; // Remove tasks completed more than 1 hour ago
      }
      return true;
    });
  }
  
  async saveData() {
    try {
      await this.saveAccounts();
      if (this.config.network.useProxies) {
        await this.saveProxies();
      }
      this.consoleLog('Data saved');
    } catch (error) {
      console.error('Failed to save data:', error.message);
    }
  }
  
  // Helper methods
  getConnectedBots() {
    return Array.from(this.bots.values()).filter(bot => bot.status === 'connected');
  }
  
  addChatMessage(sender, message, type = 'user') {
    const chatMessage = {
      id: crypto.randomBytes(8).toString('hex'),
      sender,
      message,
      type,
      timestamp: Date.now()
    };
    
    this.chatHistory.push(chatMessage);
    
    // Keep last 50 messages
    if (this.chatHistory.length > 50) {
      this.chatHistory = this.chatHistory.slice(-50);
    }
    
    return chatMessage;
  }
  
  getChatHistory(limit = 10) {
    return this.chatHistory.slice(-limit).reverse();
  }
  
  logEvent(type, data) {
    const event = {
      type,
      data,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    
    this.events.push(event);
    
    if (this.events.length > 100) {
      this.events = this.events.slice(-50);
    }
    
    return event;
  }
  
  consoleLog(message, level = 'info') {
    const log = {
      timestamp: Date.now(),
      date: new Date().toISOString(),
      message: message,
      level: level
    };
    
    this.consoleLogs.push(log);
    
    if (this.consoleLogs.length > 200) {
      this.consoleLogs = this.consoleLogs.slice(-100);
    }
    
    const prefix = level === 'error' ? '❌' : level === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${new Date().toLocaleTimeString()}] ${message}`);
    
    return log;
  }
  
  // Public API methods
  async getStatus() {
    const connectedBots = this.getConnectedBots();
    
    return {
      totalBots: this.bots.size,
      connectedBots: connectedBots.length,
      bots: connectedBots.map(bot => ({
        id: bot.id,
        name: bot.name,
        type: bot.type,
        status: bot.status,
        health: bot.health,
        food: bot.food,
        activity: bot.activity,
        ip: bot.proxy ? bot.proxy.ip : 'direct',
        account: bot.account.username,
        position: `${Math.round(bot.position.x)},${Math.round(bot.position.y)},${Math.round(bot.position.z)}`
      })),
      allBots: Array.from(this.bots.values()).map(bot => ({
        id: bot.id,
        name: bot.name,
        type: bot.type,
        status: bot.status,
        created: new Date(bot.metrics.created).toLocaleString()
      })),
      tasks: this.tasks.slice(-5),
      chat: this.getChatHistory(10)
    };
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
  
  getTasks() {
    return this.tasks.slice(-10);
  }
  
  formatEventMessage(event) {
    switch (event.type) {
      case 'bot_created':
        return `🤖 Created bot: ${event.data.name} (${event.data.type})`;
      case 'bot_connected':
        return `✅ ${event.data.name} connected`;
      case 'connection_failed':
        return `❌ ${event.data.name} failed: ${event.data.error}`;
      case 'bot_chat':
        return `💬 ${event.data.name}: ${event.data.message}`;
      case 'proxy_rotation':
        return `🔄 Rotated proxies for ${event.data.rotatedBots} bots`;
      case 'account_rotated':
        return `👤 ${event.data.botId}: ${event.data.oldAccount} → ${event.data.newAccount}`;
      case 'auto_farm_started':
        return `🚜 Auto-farm started with ${event.data.assignedBots} bots`;
      case 'task_created':
        return `📋 Task created: ${event.data.type} with ${event.data.assignedBots} bots`;
      case 'emergency_stop':
        return `🛑 Emergency stop: Stopped ${event.data.stoppedBots} bots`;
      default:
        return `${event.type}`;
    }
  }
}

module.exports = BotSystem;
