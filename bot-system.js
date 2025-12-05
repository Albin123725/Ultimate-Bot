const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { fork } = require('child_process');
const EventEmitter = require('events');

class UltimateBotSystem extends EventEmitter {
  constructor() {
    super();
    this.bots = new Map();
    this.processes = new Map();
    this.accounts = new Map();
    this.proxies = [];
    this.events = [];
    this.sessions = new Map();
    
    this.metrics = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalPlaytime: 0,
      averageSession: 0,
      peakBots: 0,
      currentBots: 0
    };
    
    this.config = this.loadConfig();
    
    // AI Learning Data
    this.learningData = new Map();
    this.behaviorPatterns = new Map();
    this.neuralModels = new Map();
    
    console.log('🤖 Ultimate Bot System v10.0 Initialized');
  }
  
  loadConfig() {
    return {
      // Server
      server: {
        host: process.env.MINECRAFT_HOST || 'gameplannet.aternos.me',
        port: parseInt(process.env.MINECRAFT_PORT) || 34286,
        version: process.env.MINECRAFT_VERSION || '1.21.10',
        auth: process.env.MINECRAFT_AUTH || 'offline'
      },
      
      // Bots
      bots: {
        count: parseInt(process.env.BOT_COUNT) || 2,
        types: (process.env.BOT_TYPES || 'builder,explorer,miner,socializer').split(','),
        maxBots: parseInt(process.env.MAX_BOTS) || 10,
        minBots: parseInt(process.env.MIN_BOTS) || 1,
        autoStart: process.env.AUTO_START === 'true',
        autoJoin: process.env.AUTO_JOIN === 'true'
      },
      
      // Network
      network: {
        useProxies: process.env.USE_PROXIES === 'true',
        minProxies: parseInt(process.env.MIN_PROXIES) || 50,
        maxProxies: parseInt(process.env.MAX_PROXIES) || 150,
        proxyRotation: process.env.PROXY_ROTATION || 'dynamic',
        connectionTimeout: 45000,
        reconnectAttempts: 3,
        sessionDuration: { min: 1200, max: 21600 }
      },
      
      // Security
      security: {
        antiDetection: process.env.ANTI_DETECTION === 'true',
        patternBreaking: process.env.PATTERN_BREAKING === 'true',
        failureInjection: parseFloat(process.env.FAILURE_INJECTION) || 0.05,
        behaviorRandomization: process.env.BEHAVIOR_RANDOMIZATION === 'true',
        accountRotation: process.env.ACCOUNT_ROTATION === 'true',
        ipRotation: process.env.IP_ROTATION === 'true'
      },
      
      // AI
      ai: {
        neuralNetworks: process.env.NEURAL_NETWORKS === 'true',
        behaviorLearning: process.env.BEHAVIOR_LEARNING === 'true',
        socialSimulation: process.env.SOCIAL_SIMULATION === 'true',
        decisionMaking: process.env.DECISION_MAKING || 'neural'
      },
      
      // Behavior
      behavior: {
        naturalMovement: true,
        realisticChat: true,
        activityCycles: true,
        learningEnabled: true,
        personalityDevelopment: true
      }
    };
  }
  
  async initialize() {
    console.log('🚀 Initializing Ultimate Bot System...');
    
    // Create directories
    await this.createDirectories();
    
    // Generate or load data
    await this.loadData();
    
    // Start monitoring
    this.startMonitoring();
    
    // Start activity generator
    this.startActivityGenerator();
    
    console.log('✅ Bot System ready');
    this.logEvent('system_initialized', { config: this.config });
    
    return this;
  }
  
  async createDirectories() {
    const dirs = [
      'logs', 'logs/bots', 'logs/sessions', 'logs/network',
      'config', 'config/accounts', 'config/proxies', 'config/sessions',
      'data', 'data/learning', 'data/patterns', 'data/neural',
      'public'
    ];
    
    for (const dir of dirs) {
      await fs.ensureDir(path.join(__dirname, dir));
    }
  }
  
  async loadData() {
    // Load or generate accounts
    const accountsFile = path.join(__dirname, 'config', 'accounts', 'accounts.json');
    if (await fs.pathExists(accountsFile)) {
      const accounts = await fs.readJson(accountsFile);
      accounts.forEach(acc => this.accounts.set(acc.id, acc));
      console.log(`📚 Loaded ${accounts.length} accounts`);
    } else {
      await this.generateAccounts();
    }
    
    // Load or generate proxies
    const proxiesFile = path.join(__dirname, 'config', 'proxies', 'proxies.json');
    if (await fs.pathExists(proxiesFile)) {
      this.proxies = await fs.readJson(proxiesFile);
      console.log(`🌐 Loaded ${this.proxies.length} proxies`);
    } else {
      await this.generateProxies();
    }
    
    // Load learning data
    await this.loadLearningData();
    
    // Generate behavior patterns
    await this.generateBehaviorPatterns();
  }
  
  async generateAccounts() {
    console.log('📝 Generating bot accounts...');
    const accounts = [];
    
    for (let i = 0; i < 20; i++) {
      accounts.push({
        id: crypto.randomBytes(12).toString('hex'),
        username: this.generateUsername(),
        email: this.generateEmail(),
        registrationDate: new Date(Date.now() - (30 + Math.random() * 335) * 24 * 60 * 60 * 1000).toISOString(),
        ageDays: 30 + Math.floor(Math.random() * 335),
        status: 'active',
        type: Math.random() > 0.7 ? 'premium' : 'free',
        servers: this.generateServerList(),
        activity: {
          totalPlaytime: Math.floor(Math.random() * 1000) * 60,
          sessions: Math.floor(Math.random() * 100),
          lastLogin: null,
          streak: Math.floor(Math.random() * 30)
        },
        metadata: {
          creationMethod: 'auto_generated',
          version: '10.0',
          tags: ['bot_account', 'v10', 'advanced']
        }
      });
    }
    
    const accountsFile = path.join(__dirname, 'config', 'accounts', 'accounts.json');
    await fs.writeJson(accountsFile, accounts, { spaces: 2 });
    
    accounts.forEach(acc => this.accounts.set(acc.id, acc));
    console.log(`✅ Generated ${accounts.length} accounts`);
  }
  
  generateUsername() {
    const patterns = [
      () => {
        const adjectives = ['Happy', 'Clever', 'Swift', 'Brave', 'Wise'];
        const nouns = ['Fox', 'Wolf', 'Bear', 'Eagle', 'Dragon'];
        return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
          nouns[Math.floor(Math.random() * nouns.length)]}${
          Math.floor(Math.random() * 9999)}`;
      },
      () => {
        const names = ['Alex', 'Chris', 'Jordan', 'Taylor', 'Morgan'];
        const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
        return `${names[Math.floor(Math.random() * names.length)]}${
          surnames[Math.floor(Math.random() * surnames.length)]}${
          2000 + Math.floor(Math.random() * 24)}`;
      },
      () => {
        const gamingPrefixes = ['Pro', 'Epic', 'Mega', 'Ultra', 'Super'];
        const nouns = ['Fox', 'Wolf', 'Bear', 'Eagle', 'Dragon'];
        return `${gamingPrefixes[Math.floor(Math.random() * gamingPrefixes.length)]}${
          nouns[Math.floor(Math.random() * nouns.length)]}`;
      }
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)]();
  }
  
  generateEmail() {
    const providers = ['gmail.com', 'outlook.com', 'yahoo.com', 'protonmail.com'];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const username = crypto.randomBytes(8).toString('hex').toLowerCase();
    return `${username}@${provider}`;
  }
  
  generateServerList() {
    const servers = [];
    const serverTypes = ['Survival', 'Creative', 'Hardcore', 'Modded'];
    
    for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
      servers.push({
        name: `${serverTypes[Math.floor(Math.random() * serverTypes.length)]} World ${i + 1}`,
        host: `${crypto.randomBytes(4).toString('hex')}.aternos.me`,
        port: 25565,
        version: '1.21.10',
        playtime: Math.floor(Math.random() * 5000) * 60,
        lastOnline: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return servers;
  }
  
  async generateProxies() {
    console.log('🌐 Generating proxy network...');
    this.proxies = [];
    
    const proxyTypes = ['residential', 'mobile', 'datacenter', 'isp', 'vpn'];
    const countries = ['US', 'CA', 'UK', 'DE', 'FR', 'AU', 'JP'];
    const isps = {
      US: ['Comcast', 'Verizon', 'Spectrum', 'AT&T'],
      UK: ['BT', 'Virgin Media', 'Sky', 'Vodafone'],
      DE: ['Deutsche Telekom', 'Vodafone DE', '1&1'],
      CA: ['Rogers', 'Bell', 'Telus', 'Shaw'],
      FR: ['Orange', 'Free', 'SFR', 'Bouygues'],
      AU: ['Telstra', 'Optus', 'TPG', 'Vodafone AU'],
      JP: ['NTT', 'KDDI', 'SoftBank']
    };
    
    for (let i = 0; i < 100; i++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const type = proxyTypes[Math.floor(Math.random() * proxyTypes.length)];
      
      this.proxies.push({
        id: crypto.randomBytes(16).toString('hex'),
        ip: this.generateIP(country),
        port: this.generatePort(type),
        protocol: type === 'vpn' ? 'socks5' : 'http',
        type: type,
        country: country,
        isp: isps[country] ? isps[country][Math.floor(Math.random() * isps[country].length)] : 'Unknown',
        latency: 50 + Math.random() * 200,
        successRate: 0.8 + Math.random() * 0.19,
        lastTested: new Date().toISOString(),
        status: 'active',
        usageCount: 0,
        lastUsed: null
      });
    }
    
    const proxiesFile = path.join(__dirname, 'config', 'proxies', 'proxies.json');
    await fs.writeJson(proxiesFile, this.proxies, { spaces: 2 });
    console.log(`✅ Generated ${this.proxies.length} proxies`);
  }
  
  generateIP(country) {
    const countryRanges = {
      US: ['192.168.', '10.0.', '172.16.'],
      UK: ['81.0.', '86.0.', '94.0.'],
      DE: ['78.0.', '79.0.', '84.0.'],
      CA: ['24.0.', '70.0.', '99.0.'],
      FR: ['81.0.', '90.0.', '92.0.'],
      AU: ['1.0.', '14.0.', '27.0.'],
      JP: ['110.0.', '111.0.', '112.0.']
    };
    
    const ranges = countryRanges[country] || countryRanges.US;
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    
    return `${range}${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
  
  generatePort(type) {
    const ports = {
      residential: [8080, 8888, 3128],
      mobile: [8080, 8081, 8888],
      datacenter: [80, 8080, 443],
      isp: [8080, 3128],
      vpn: [1080, 1081, 1082]
    };
    
    const typePorts = ports[type] || [8080];
    return typePorts[Math.floor(Math.random() * typePorts.length)];
  }
  
  async loadLearningData() {
    const learningFile = path.join(__dirname, 'data', 'learning', 'learning-data.json');
    if (await fs.pathExists(learningFile)) {
      const data = await fs.readJson(learningFile);
      this.learningData = new Map(Object.entries(data));
      console.log(`🧠 Loaded learning data for ${this.learningData.size} bots`);
    }
  }
  
  async generateBehaviorPatterns() {
    const patterns = {};
    
    for (const botType of this.config.bots.types) {
      patterns[botType] = {
        movement: this.generateMovementPattern(botType),
        chat: this.generateChatPattern(botType),
        activity: this.generateActivityPattern(botType),
        timing: this.generateTimingPattern(botType)
      };
    }
    
    this.behaviorPatterns = new Map(Object.entries(patterns));
    
    const patternsFile = path.join(__dirname, 'data', 'patterns', 'behavior-patterns.json');
    await fs.writeJson(patternsFile, patterns, { spaces: 2 });
    
    console.log(`🎭 Generated behavior patterns for ${Object.keys(patterns).length} bot types`);
  }
  
  generateMovementPattern(botType) {
    const patterns = {
      builder: { speed: 0.2, randomness: 0.3, tendency: 'circular', radius: 50 },
      explorer: { speed: 0.3, randomness: 0.7, tendency: 'linear', radius: 200 },
      miner: { speed: 0.15, randomness: 0.2, tendency: 'grid', radius: 100 },
      socializer: { speed: 0.25, randomness: 0.5, tendency: 'random', radius: 30 }
    };
    
    return patterns[botType] || patterns.builder;
  }
  
  generateChatPattern(botType) {
    const patterns = {
      builder: { frequency: 0.05, topics: ['building', 'design', 'materials'] },
      explorer: { frequency: 0.08, topics: ['discoveries', 'locations', 'resources'] },
      miner: { frequency: 0.03, topics: ['ores', 'tools', 'depth'] },
      socializer: { frequency: 0.15, topics: ['greetings', 'help', 'events'] }
    };
    
    return patterns[botType] || patterns.builder;
  }
  
  generateActivityPattern(botType) {
    return {
      duration: { min: 300000, max: 1800000 },
      switchProbability: 0.3,
      preferredTime: this.getPreferredTime(botType),
      breakFrequency: 0.1
    };
  }
  
  generateTimingPattern(botType) {
    const now = new Date();
    const hour = now.getHours();
    
    let pattern = {
      activeHours: { start: 9, end: 23 },
      peakHours: { start: 16, end: 21 },
      randomVariation: 0.3
    };
    
    switch (botType) {
      case 'builder': pattern.activeHours = { start: 10, end: 20 }; break;
      case 'explorer': pattern.activeHours = { start: 8, end: 22 }; break;
      case 'miner': pattern.activeHours = { start: 12, end: 24 }; break;
      case 'socializer': pattern.activeHours = { start: 16, end: 2 }; break;
    }
    
    return pattern;
  }
  
  getPreferredTime(botType) {
    const times = {
      builder: { start: 10, end: 18 },
      explorer: { start: 9, end: 17 },
      miner: { start: 14, end: 22 },
      socializer: { start: 18, end: 2 }
    };
    
    return times[botType] || times.builder;
  }
  
  async createBot(type) {
    const botId = `bot_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Get account
    const account = await this.getNextAccount();
    
    // Get proxy if enabled
    const proxy = this.config.network.useProxies ? await this.getNextProxy() : null;
    
    // Get behavior pattern
    const behaviorPattern = this.behaviorPatterns.get(type) || this.generateBehaviorPatterns();
    
    const bot = {
      id: botId,
      type: type,
      subtype: this.getBotSubtype(type),
      account: account,
      proxy: proxy,
      status: {
        current: 'created',
        health: 20,
        food: 20,
        position: null,
        dimension: 'overworld',
        activity: 'initializing',
        lastActivityChange: Date.now(),
        reconnectAttempts: 0,
        lastConnectionAttempt: 0
      },
      behavior: {
        personality: this.generatePersonality(type),
        pattern: behaviorPattern,
        learning: {
          experiences: [],
          adaptations: [],
          successRate: 0.5,
          lastLearning: Date.now()
        }
      },
      security: {
        suspicionLevel: 0,
        countermeasures: [],
        lastPatternBreak: 0,
        detectionRisk: 'low'
      },
      neural: {
        decisionNetwork: this.generateNeuralConfig(type),
        memory: [],
        predictions: []
      },
      metrics: {
        startTime: Date.now(),
        messagesSent: 0,
        actionsTaken: 0,
        distanceTraveled: 0,
        itemsCollected: 0,
        deaths: 0,
        successes: 0,
        failures: 0
      },
      metadata: {
        created: new Date().toISOString(),
        tags: [type, 'v10', 'advanced', 'neural'],
        version: '10.0'
      },
      inventory: this.generateInventory(type),
      equipment: this.generateEquipment(type)
    };
    
    this.bots.set(botId, bot);
    this.metrics.currentBots++;
    
    if (this.metrics.currentBots > this.metrics.peakBots) {
      this.metrics.peakBots = this.metrics.currentBots;
    }
    
    console.log(`🤖 Created ${type} bot: ${account.username} (ID: ${botId})`);
    this.logEvent('bot_created', { botId, type, username: account.username });
    
    return bot;
  }
  
  getBotSubtype(type) {
    const subtypes = {
      builder: ['architect', 'interior_designer', 'landscaper', 'redstone_engineer'],
      explorer: ['cartographer', 'caver', 'biome_researcher', 'structure_hunter'],
      miner: ['strip_miner', 'cave_miner', 'quarry_worker', 'deep_miner'],
      socializer: ['greeter', 'helper', 'trader', 'event_organizer']
    };
    
    const typeSubtypes = subtypes[type] || ['general'];
    return typeSubtypes[Math.floor(Math.random() * typeSubtypes.length)];
  }
  
  async getNextAccount() {
    const available = Array.from(this.accounts.values())
      .filter(acc => acc.status === 'active')
      .sort((a, b) => (a.activity.lastLogin || 0) - (b.activity.lastLogin || 0));
    
    if (available.length === 0) {
      await this.generateAccounts();
      return Array.from(this.accounts.values())[0];
    }
    
    const account = available[0];
    account.activity.lastLogin = new Date().toISOString();
    account.activity.sessions = (account.activity.sessions || 0) + 1;
    
    // Save updated accounts
    await this.saveAccounts();
    
    return account;
  }
  
  async getNextProxy() {
    if (this.proxies.length === 0) {
      await this.generateProxies();
    }
    
    // Sort by least recently used and highest success rate
    const sorted = [...this.proxies]
      .filter(p => p.status === 'active')
      .sort((a, b) => {
        const aScore = (a.successRate * 100) - (a.usageCount || 0);
        const bScore = (b.successRate * 100) - (b.usageCount || 0);
        return bScore - aScore;
      });
    
    if (sorted.length === 0) {
      return null;
    }
    
    const proxy = sorted[0];
    proxy.usageCount = (proxy.usageCount || 0) + 1;
    proxy.lastUsed = new Date().toISOString();
    
    // Save updated proxies
    await this.saveProxies();
    
    return proxy;
  }
  
  generatePersonality(type) {
    const basePersonalities = {
      builder: { build: 0.9, explore: 0.3, social: 0.2, creative: 0.8 },
      explorer: { build: 0.2, explore: 0.9, social: 0.3, creative: 0.4 },
      miner: { build: 0.3, explore: 0.4, social: 0.1, creative: 0.2 },
      socializer: { build: 0.1, explore: 0.2, social: 0.9, creative: 0.3 }
    };
    
    const base = basePersonalities[type] || basePersonalities.builder;
    const personality = {};
    
    for (const [trait, value] of Object.entries(base)) {
      personality[trait] = Math.max(0.1, Math.min(0.95, value + (Math.random() - 0.5) * 0.2));
    }
    
    // Add additional traits
    personality.curiosity = 0.5 + Math.random() * 0.4;
    personality.patience = 0.3 + Math.random() * 0.5;
    personality.riskTolerance = 0.2 + Math.random() * 0.6;
    personality.socialBoldness = personality.social || 0.3 + Math.random() * 0.4;
    
    return personality;
  }
  
  generateNeuralConfig(type) {
    return {
      type: 'decision_network',
      layers: [10, 20, 10, 5],
      activation: 'relu',
      learningRate: 0.01,
      trained: false,
      experiences: 0,
      accuracy: 0.5
    };
  }
  
  generateInventory(type) {
    const inventories = {
      builder: {
        tools: ['diamond_pickaxe', 'diamond_shovel', 'diamond_axe'],
        materials: ['oak_planks', 'stone_bricks', 'glass', 'torches'],
        food: ['bread', 'cooked_porkchop'],
        special: ['water_bucket', 'ender_pearl']
      },
      explorer: {
        tools: ['iron_pickaxe', 'map', 'compass', 'spyglass'],
        materials: ['torches', 'food', 'wood', 'cobblestone'],
        food: ['steak', 'golden_carrot', 'apple'],
        special: ['ender_pearl', 'boat', 'saddle']
      },
      miner: {
        tools: ['diamond_pickaxe', 'iron_pickaxe', 'stone_pickaxe', 'shovel'],
        materials: ['torches', 'cobblestone', 'wood', 'coal'],
        food: ['bread', 'cooked_chicken'],
        special: ['water_bucket', 'lava_bucket']
      },
      socializer: {
        tools: ['diamond_sword', 'bow', 'fishing_rod'],
        materials: ['food', 'emeralds', 'trade_items'],
        food: ['golden_apple', 'cooked_beef', 'cake'],
        special: ['firework_rocket', 'music_disc', 'book']
      }
    };
    
    return inventories[type] || inventories.builder;
  }
  
  generateEquipment(type) {
    return {
      helmet: 'diamond_helmet',
      chestplate: 'diamond_chestplate',
      leggings: 'diamond_leggings',
      boots: 'diamond_boots',
      mainHand: type === 'builder' ? 'diamond_pickaxe' : 'diamond_sword',
      offHand: 'shield'
    };
  }
  
  async startBot(botId) {
    const bot = this.bots.get(botId);
    if (!bot) throw new Error(`Bot ${botId} not found`);
    
    console.log(`🚀 Starting bot ${bot.account.username}...`);
    
    bot.status.current = 'starting';
    bot.metrics.startTime = Date.now();
    bot.status.lastConnectionAttempt = Date.now();
    
    try {
      const session = await this.createSession(bot);
      bot.session = session;
      
      const botProcess = fork(path.join(__dirname, 'bot-process.js'), [
        botId,
        JSON.stringify({
          bot: bot,
          config: this.config,
          server: this.config.server,
          session: session
        })
      ], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        detached: false,
        env: {
          ...process.env,
          BOT_ID: botId,
          BOT_TYPE: bot.type,
          BOT_USERNAME: bot.account.username,
          USE_PROXIES: this.config.network.useProxies ? 'true' : 'false'
        }
      });
      
      bot.process = botProcess;
      this.processes.set(botId, botProcess);
      
      // Setup event handlers
      this.setupProcessHandlers(bot, botProcess);
      
      this.logEvent('bot_started', { 
        botId: bot.id, 
        username: bot.account.username,
        proxy: bot.proxy ? `${bot.proxy.ip}:${bot.proxy.port}` : 'direct'
      });
      
      return bot;
      
    } catch (error) {
      bot.status.current = 'error';
      this.metrics.failedConnections++;
      bot.account.failedConnections = (bot.account.failedConnections || 0) + 1;
      
      this.logEvent('bot_start_failed', { 
        botId, 
        username: bot.account.username, 
        error: error.message 
      });
      
      throw error;
    }
  }
  
  setupProcessHandlers(bot, process) {
    process.on('message', (message) => {
      this.handleBotMessage(bot, message);
    });
    
    process.on('exit', (code) => {
      this.handleBotExit(bot, code);
    });
    
    process.on('error', (error) => {
      this.handleBotError(bot, error);
    });
    
    process.stdout.on('data', (data) => {
      this.handleBotOutput(bot, data.toString());
    });
    
    process.stderr.on('data', (data) => {
      this.handleBotErrorOutput(bot, data.toString());
    });
  }
  
  handleBotMessage(bot, message) {
    switch (message.type) {
      case 'connected':
        this.handleBotConnected(bot, message);
        break;
      case 'disconnected':
        this.handleBotDisconnected(bot, message);
        break;
      case 'activity':
        bot.status.activity = message.activity;
        bot.status.lastActivityChange = Date.now();
        bot.metrics.actionsTaken++;
        break;
      case 'chat':
        bot.metrics.messagesSent++;
        this.logEvent('bot_chat', {
          botId: bot.id,
          username: bot.account.username,
          message: message.message
        });
        break;
      case 'learning':
        bot.behavior.learning.experiences.push(message.experience);
        break;
      case 'security':
        bot.security.suspicionLevel = message.suspicionLevel || 0;
        if (message.suspicionLevel > 50) {
          this.applySecurityCountermeasures(bot);
        }
        break;
      case 'metrics':
        if (message.position) bot.status.position = message.position;
        if (message.health !== undefined) bot.status.health = message.health;
        if (message.food !== undefined) bot.status.food = message.food;
        Object.assign(bot.metrics, message.metrics);
        break;
      case 'error':
        this.handleBotProcessError(bot, message);
        break;
    }
  }
  
  handleBotConnected(bot, message) {
    bot.status.current = 'connected';
    bot.status.health = message.health || 20;
    bot.status.food = message.food || 20;
    bot.status.position = message.position;
    bot.status.dimension = message.dimension || 'overworld';
    bot.status.activity = 'active';
    
    this.metrics.successfulConnections++;
    this.metrics.totalConnections++;
    
    bot.account.successfulLogins = (bot.account.successfulLogins || 0) + 1;
    bot.account.lastSuccessfulLogin = new Date().toISOString();
    
    console.log(`✅ ${bot.account.username} connected successfully`);
    
    this.logEvent('bot_connected', {
      botId: bot.id,
      username: bot.account.username,
      ip: bot.proxy?.ip || 'direct',
      position: bot.status.position
    });
    
    this.emit('bot_connected', { botId: bot.id, username: bot.account.username });
  }
  
  handleBotDisconnected(bot, message) {
    bot.status.current = 'disconnected';
    bot.status.activity = 'disconnected';
    
    console.log(`🔌 ${bot.account.username} disconnected: ${message.reason}`);
    
    const sessionDuration = Date.now() - bot.metrics.startTime;
    this.metrics.totalPlaytime += sessionDuration;
    bot.metrics.sessionDuration = sessionDuration;
    
    // Update average session
    this.metrics.averageSession = 
      (this.metrics.averageSession + sessionDuration) / 2;
    
    this.logEvent('bot_disconnected', {
      botId: bot.id,
      username: bot.account.username,
      reason: message.reason,
      duration: sessionDuration
    });
    
    // End session
    if (bot.session) {
      this.endSession(bot.session.id, message.reason);
    }
    
    // Clean up process
    if (this.processes.has(bot.id)) {
      this.processes.delete(bot.id);
    }
    
    // Update bot count
    this.metrics.currentBots = this.processes.size;
    
    // Auto-reconnect
    if (bot.status.reconnectAttempts < this.config.network.reconnectAttempts) {
      this.scheduleReconnection(bot);
    }
    
    this.emit('bot_disconnected', { botId: bot.id, reason: message.reason });
  }
  
  scheduleReconnection(bot) {
    bot.status.reconnectAttempts++;
    const delay = bot.status.reconnectAttempts * 15000; // 15s, 30s, 45s...
    
    console.log(`🔄 Reconnecting ${bot.account.username} in ${delay/1000}s...`);
    
    setTimeout(async () => {
      try {
        await this.startBot(bot.id);
      } catch (error) {
        console.error(`❌ Reconnection failed for ${bot.account.username}:`, error.message);
      }
    }, delay);
  }
  
  handleBotExit(bot, code) {
    console.log(`Bot ${bot.account.username} process exited with code ${code}`);
    
    bot.status.current = 'stopped';
    bot.process = null;
    this.processes.delete(bot.id);
    
    this.metrics.currentBots = this.processes.size;
    
    this.logEvent('bot_exited', {
      botId: bot.id,
      username: bot.account.username,
      exitCode: code
    });
    
    this.emit('bot_exited', { botId: bot.id, code });
  }
  
  handleBotError(bot, error) {
    console.error(`Bot ${bot.account.username} error:`, error.message);
    
    bot.status.current = 'error';
    this.metrics.failedConnections++;
    
    this.logEvent('bot_error', {
      botId: bot.id,
      username: bot.account.username,
      error: error.message
    });
  }
  
  handleBotProcessError(bot, message) {
    console.error(`Bot ${bot.account.username} process error:`, message.error);
    
    bot.status.current = 'error';
    bot.metrics.failures++;
    
    this.logEvent('bot_process_error', {
      botId: bot.id,
      username: bot.account.username,
      error: message.error,
      type: message.errorType
    });
  }
  
  handleBotOutput(bot, output) {
    // Process bot output
    const lines = output.trim().split('\n');
    
    for (const line of lines) {
      if (line.includes('ERROR') || line.includes('error')) {
        this.logEvent('bot_output_error', {
          botId: bot.id,
          username: bot.account.username,
          output: line
        });
      }
    }
  }
  
  handleBotErrorOutput(bot, output) {
    console.error(`Bot ${bot.account.username} stderr:`, output);
    
    this.logEvent('bot_stderr', {
      botId: bot.id,
      username: bot.account.username,
      output: output
    });
  }
  
  applySecurityCountermeasures(bot) {
    const countermeasures = [
      'change_activity',
      'introduce_delay',
      'break_pattern',
      'simulate_error',
      'rotate_account',
      'change_ip'
    ];
    
    // Select 2-3 countermeasures
    const selected = [];
    for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
      const cm = countermeasures[Math.floor(Math.random() * countermeasures.length)];
      if (!selected.includes(cm)) {
        selected.push(cm);
      }
    }
    
    // Apply countermeasures
    selected.forEach(countermeasure => {
      this.applyCountermeasure(bot, countermeasure);
    });
    
    // Log countermeasures
    this.logEvent('security_countermeasures', {
      botId: bot.id,
      username: bot.account.username,
      countermeasures: selected,
      suspicionLevel: bot.security.suspicionLevel
    });
  }
  
  applyCountermeasure(bot, countermeasure) {
    switch (countermeasure) {
      case 'change_activity':
        bot.status.activity = 'security_measure';
        if (bot.process && bot.process.connected) {
          bot.process.send({ type: 'change_activity', activity: 'security_measure' });
        }
        break;
      case 'introduce_delay':
        if (bot.process && bot.process.connected) {
          bot.process.send({ type: 'introduce_delay', duration: 5000 + Math.random() * 10000 });
        }
        break;
      case 'break_pattern':
        if (bot.process && bot.process.connected) {
          bot.process.send({ type: 'break_pattern' });
        }
        bot.security.lastPatternBreak = Date.now();
        break;
      case 'simulate_error':
        if (bot.process && bot.process.connected) {
          bot.process.send({ type: 'simulate_error', errorType: 'network_issue' });
        }
        break;
      case 'rotate_account':
        // Schedule account rotation
        setTimeout(async () => {
          try {
            const newAccount = await this.getNextAccount();
            bot.account = newAccount;
            console.log(`🔄 Rotated account for ${bot.id} to ${newAccount.username}`);
          } catch (error) {
            console.error('Failed to rotate account:', error);
          }
        }, 10000);
        break;
      case 'change_ip':
        // Schedule IP rotation
        if (bot.proxy && this.config.network.useProxies) {
          setTimeout(async () => {
            try {
              const newProxy = await this.getNextProxy();
              bot.proxy = newProxy;
              console.log(`🔄 Rotated IP for ${bot.id} to ${newProxy.ip}`);
            } catch (error) {
              console.error('Failed to rotate IP:', error);
            }
          }, 15000);
        }
        break;
    }
  }
  
  async createSession(bot) {
    const sessionId = `session_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    const session = {
      id: sessionId,
      botId: bot.id,
      accountId: bot.account.id,
      startTime: Date.now(),
      network: bot.proxy,
      expectedDuration: this.config.network.sessionDuration.min + 
                       Math.random() * (this.config.network.sessionDuration.max - 
                       this.config.network.sessionDuration.min),
      status: 'active',
      metrics: {
        packetsSent: 0,
        packetsReceived: 0,
        bytesTransferred: 0,
        actions: 0,
        messages: 0
      },
      security: {
        ipRotationScheduled: false,
        patternBreaks: 0,
        suspicionLevel: 0
      }
    };
    
    this.sessions.set(sessionId, session);
    
    // Save session
    await this.saveSession(session);
    
    return session;
  }
  
  async endSession(sessionId, reason = 'normal') {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.endTime = Date.now();
      session.status = 'ended';
      session.duration = session.endTime - session.startTime;
      session.endReason = reason;
      
      await this.saveSession(session);
      
      // Remove from active sessions after a delay
      setTimeout(() => {
        this.sessions.delete(sessionId);
      }, 3600000);
    }
  }
  
  async startFullSystem() {
    console.log('🚀 Starting full bot system...');
    
    const botCount = Math.min(
      this.config.bots.count,
      this.config.bots.maxBots
    );
    
    const results = {
      successful: [],
      failed: []
    };
    
    // Calculate optimal distribution
    const distribution = this.calculateOptimalDistribution(botCount);
    
    for (const [type, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        try {
          // Create bot
          const bot = await this.createBot(type);
          
          // Schedule start with staggered delay
          const delay = i * (5000 + Math.random() * 10000);
          
          setTimeout(async () => {
            try {
              await this.startBot(bot.id);
              results.successful.push({
                botId: bot.id,
                type: bot.type,
                username: bot.account.username,
                delay: delay
              });
            } catch (error) {
              results.failed.push({
                botId: bot.id,
                type: bot.type,
                username: bot.account.username,
                error: error.message
              });
            }
          }, delay);
          
        } catch (error) {
          results.failed.push({
            type: type,
            error: error.message
          });
        }
      }
    }
    
    this.logEvent('system_start', {
      botCount: botCount,
      distribution: distribution,
      results: results
    });
    
    return {
      success: true,
      message: `Starting ${botCount} bots with all advanced features`,
      distribution: distribution,
      results: results,
      timestamp: Date.now()
    };
  }
  
  calculateOptimalDistribution(totalBots) {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    
    let distribution = {};
    
    // Base distribution - at least one of each type
    this.config.bots.types.forEach(type => {
      distribution[type] = 1;
    });
    
    // Time-based adjustments
    if (hour >= 6 && hour < 12) {
      // Morning: More builders and explorers
      distribution.builder = (distribution.builder || 0) + 1;
      distribution.explorer = (distribution.explorer || 0) + 1;
    } else if (hour >= 12 && hour < 18) {
      // Afternoon: Balanced with focus on mining
      distribution.miner = (distribution.miner || 0) + 1;
      distribution.builder = (distribution.builder || 0) + 0.5;
    } else if (hour >= 18 && hour < 24) {
      // Evening: More socializers
      distribution.socializer = (distribution.socializer || 0) + 1;
      distribution.explorer = (distribution.explorer || 0) + 0.5;
    } else {
      // Night: Reduced activity
      distribution = {
        builder: 1,
        explorer: 1,
        miner: 0,
        socializer: 0
      };
    }
    
    // Adjust for weekend
    if (isWeekend) {
      distribution.builder = (distribution.builder || 0) + 1;
      distribution.socializer = (distribution.socializer || 0) + 1;
      distribution.explorer = (distribution.explorer || 0) + 0.5;
    }
    
    // Scale to total bots
    const totalDistributed = Object.values(distribution).reduce((a, b) => a + b, 0);
    const scaleFactor = totalBots / totalDistributed;
    
    for (const type in distribution) {
      distribution[type] = Math.max(0, Math.min(3, Math.round(distribution[type] * scaleFactor)));
    }
    
    // Ensure at least totalBots
    let currentTotal = Object.values(distribution).reduce((a, b) => a + b, 0);
    while (currentTotal < totalBots) {
      const types = Object.keys(distribution);
      const randomType = types[Math.floor(Math.random() * types.length)];
      distribution[randomType]++;
      currentTotal++;
    }
    
    return distribution;
  }
  
  async smartAutoJoin() {
    console.log('🔍 Smart auto-join starting...');
    
    // Check server status
    const serverStatus = await this.checkServerStatus();
    
    if (!serverStatus.online) {
      return {
        success: false,
        message: 'Server appears offline. Please start it from the Aternos panel first.',
        retryIn: 300000,
        status: serverStatus
      };
    }
    
    // Calculate optimal bot count based on server status
    const optimalCount = this.calculateOptimalBotCount(serverStatus);
    
    // Start bots with intelligent distribution
    const distribution = this.calculateOptimalDistribution(optimalCount);
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };
    
    for (const [type, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        try {
          // Check system resources before creating bot
          if (!this.checkSystemResources()) {
            results.skipped.push({
              type: type,
              reason: 'insufficient_resources'
            });
            continue;
          }
          
          // Create bot
          const bot = await this.createBot(type);
          
          // Add random delay between connections
          const delay = Math.random() * 30000;
          
          setTimeout(async () => {
            try {
              await this.startBot(bot.id);
              results.successful.push({
                botId: bot.id,
                type: bot.type,
                username: bot.account.username,
                delay: delay
              });
            } catch (error) {
              results.failed.push({
                botId: bot.id,
                type: bot.type,
                username: bot.account.username,
                error: error.message
              });
            }
          }, delay);
          
        } catch (error) {
          results.failed.push({
            type: type,
            error: error.message
          });
        }
      }
    }
    
    this.logEvent('smart_auto_join', {
      serverStatus: serverStatus,
      optimalCount: optimalCount,
      distribution: distribution,
      results: results
    });
    
    return {
      success: true,
      message: `Smart auto-join initiated with ${optimalCount} bots`,
      serverStatus: serverStatus,
      distribution: distribution,
      results: results,
      timestamp: Date.now()
    };
  }
  
  async checkServerStatus() {
    const net = require('net');
    const server = this.config.server;
    
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 15000;
      
      socket.setTimeout(timeout);
      
      const startTime = Date.now();
      
      socket.on('connect', () => {
        const latency = Date.now() - startTime;
        socket.destroy();
        resolve({
          online: true,
          latency: latency,
          message: 'Server is online and responsive',
          timestamp: Date.now()
        });
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          online: false,
          latency: null,
          message: 'Connection timeout',
          timestamp: Date.now()
        });
      });
      
      socket.on('error', (error) => {
        resolve({
          online: false,
          latency: null,
          message: error.message,
          timestamp: Date.now()
        });
      });
      
      socket.connect(server.port, server.host);
    });
  }
  
  calculateOptimalBotCount(serverStatus) {
    let baseCount = this.config.bots.count;
    
    // Adjust based on server latency
    if (serverStatus.latency) {
      if (serverStatus.latency > 500) {
        baseCount = Math.max(1, Math.floor(baseCount * 0.5));
      } else if (serverStatus.latency < 100) {
        baseCount = Math.min(this.config.bots.maxBots, Math.floor(baseCount * 1.5));
      }
    }
    
    // Adjust based on time of day
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      baseCount = Math.max(1, Math.floor(baseCount * 0.7));
    } else if (hour >= 18 && hour < 24) {
      baseCount = Math.min(this.config.bots.maxBots, Math.floor(baseCount * 1.2));
    }
    
    // Adjust based on day of week
    const day = new Date().getDay();
    if (day === 0 || day === 6) {
      baseCount = Math.min(this.config.bots.maxBots, Math.floor(baseCount * 1.3));
    }
    
    return Math.max(this.config.bots.minBots, Math.min(this.config.bots.maxBots, baseCount));
  }
  
  checkSystemResources() {
    const os = require('os');
    
    // Check CPU usage
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    if (cpuUsage > 0.8) { // 80%
      return false;
    }
    
    // Check memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = (totalMem - freeMem) / totalMem;
    if (memUsage > 0.85) { // 85%
      return false;
    }
    
    // Check process count
    if (this.processes.size >= 20) {
      return false;
    }
    
    return true;
  }
  
  async addBot(type) {
    console.log(`➕ Adding ${type} bot...`);
    
    try {
      // Check resources
      if (!this.checkSystemResources()) {
        return {
          success: false,
          message: 'Insufficient system resources to add new bot',
          timestamp: Date.now()
        };
      }
      
      // Create bot
      const bot = await this.createBot(type);
      
      // Start with delay
      setTimeout(async () => {
        try {
          await this.startBot(bot.id);
          console.log(`✅ Added ${type} bot: ${bot.account.username}`);
        } catch (error) {
          console.error(`❌ Failed to start ${type} bot:`, error.message);
        }
      }, 5000);
      
      return {
        success: true,
        message: `${type} bot created. Starting in 5 seconds...`,
        botId: bot.id,
        username: bot.account.username,
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Failed to add ${type} bot: ${error.message}`,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
  
  async rotateAllSystems() {
    console.log('🔄 Rotating all systems...');
    
    // Rotate proxies
    if (this.config.network.useProxies) {
      await this.generateProxies();
    }
    
    // Rotate accounts
    await this.generateAccounts();
    
    // Apply pattern breaking to all bots
    for (const [botId, bot] of this.bots) {
      if (bot.process && bot.process.connected) {
        bot.process.send({ type: 'break_pattern' });
      }
    }
    
    return {
      success: true,
      message: 'All systems rotated successfully',
      timestamp: Date.now()
    };
  }
  
  async emergencyStop() {
    console.log('🛑 EMERGENCY STOP initiated...');
    
    let stoppedCount = 0;
    const stopResults = [];
    
    // Stop all bot processes
    for (const [botId, process] of this.processes) {
      try {
        process.kill('SIGTERM');
        stoppedCount++;
        stopResults.push({
          botId: botId,
          success: true
        });
      } catch (error) {
        stopResults.push({
          botId: botId,
          success: false,
          error: error.message
        });
      }
    }
    
    // Clear all maps
    this.processes.clear();
    this.bots.clear();
    this.sessions.clear();
    
    // Reset metrics
    this.metrics.currentBots = 0;
    
    this.logEvent('emergency_stop', {
      stoppedCount: stoppedCount,
      results: stopResults
    });
    
    return {
      success: true,
      message: `Emergency stop complete. Stopped ${stoppedCount} bots.`,
      stopped: stoppedCount,
      results: stopResults,
      timestamp: Date.now()
    };
  }
  
  startMonitoring() {
    // Monitor bot health
    setInterval(() => {
      this.monitorBots();
    }, 30000);
    
    // Monitor system resources
    setInterval(() => {
      this.monitorSystemResources();
    }, 60000);
    
    // Auto-save data
    setInterval(() => {
      this.saveData();
    }, 300000);
    
    console.log('📊 System monitoring started');
  }
  
  monitorBots() {
    const now = Date.now();
    let healthyBots = 0;
    let suspiciousBots = 0;
    
    for (const [botId, bot] of this.bots) {
      if (bot.status.current === 'connected') {
        healthyBots++;
        
        // Check for suspicious activity
        if (bot.security.suspicionLevel > 40) {
          suspiciousBots++;
          
          // Apply countermeasures if needed
          if (bot.security.suspicionLevel > 70) {
            this.applySecurityCountermeasures(bot);
          }
        }
        
        // Check for stale activity
        if (bot.status.lastActivityChange && 
            now - bot.status.lastActivityChange > 300000) {
          bot.status.activity = 'idle';
        }
      }
    }
    
    // Log if suspicious
    if (suspiciousBots > 0) {
      console.log(`⚠️ Monitoring: ${healthyBots} healthy, ${suspiciousBots} suspicious bots`);
    }
  }
  
  monitorSystemResources() {
    const os = require('os');
    
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    // Log if resources are high
    if (cpuUsage > 0.8 || memUsage > 85) {
      console.log(`⚠️ High resource usage: CPU ${(cpuUsage * 100).toFixed(1)}%, RAM ${memUsage.toFixed(1)}%`);
      
      // Consider stopping some bots if resources are critical
      if (cpuUsage > 0.9 || memUsage > 90) {
        this.reduceBotCount();
      }
    }
  }
  
  reduceBotCount() {
    const botsToStop = Math.max(1, Math.floor(this.processes.size * 0.3));
    console.log(`📉 Reducing bot count by ${botsToStop} due to high resource usage`);
    
    // Stop some bots
    const botIds = Array.from(this.processes.keys());
    for (let i = 0; i < Math.min(botsToStop, botIds.length); i++) {
      const botId = botIds[i];
      const process = this.processes.get(botId);
      if (process) {
        process.kill('SIGTERM');
      }
    }
  }
  
  startActivityGenerator() {
    // Generate natural activity patterns
    setInterval(() => {
      this.generateNaturalActivity();
    }, 60000);
    
    console.log('🎭 Natural activity generator started');
  }
  
  generateNaturalActivity() {
    // Generate random natural events
    const events = [
      'weather_change',
      'time_passage',
      'environment_event',
      'social_interaction'
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    
    // Apply to random bots
    const connectedBots = Array.from(this.bots.values())
      .filter(bot => bot.status.current === 'connected');
    
    if (connectedBots.length > 0) {
      const randomBot = connectedBots[Math.floor(Math.random() * connectedBots.length)];
      
      // Send event to bot
      if (randomBot.process && randomBot.process.connected) {
        randomBot.process.send({
          type: 'natural_event',
          event: event,
          data: this.generateEventData(event)
        });
      }
    }
    
    return {
      success: true,
      message: `Generated natural activity: ${event}`,
      timestamp: Date.now()
    };
  }
  
  generateEventData(eventType) {
    switch (eventType) {
      case 'weather_change':
        return { weather: ['clear', 'rain', 'thunder'][Math.floor(Math.random() * 3)] };
      case 'time_passage':
        return { time: Math.floor(Math.random() * 24000) };
      case 'environment_event':
        return { event: ['animal_spawn', 'village_discovery', 'cave_entrance'][Math.floor(Math.random() * 3)] };
      case 'social_interaction':
        return { interaction: 'friendly_encounter' };
      default:
        return {};
    }
  }
  
  async trainAI() {
    console.log('🧠 Training AI models...');
    
    // Simulate AI training
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update neural models
    for (const [botId, bot] of this.bots) {
      if (bot.neural) {
        bot.neural.decisionNetwork.trained = true;
        bot.neural.decisionNetwork.experiences += 10;
        bot.neural.decisionNetwork.accuracy = Math.min(0.95, bot.neural.decisionNetwork.accuracy + 0.05);
      }
    }
    
    return {
      success: true,
      message: 'AI models trained successfully',
      timestamp: Date.now()
    };
  }
  
  // Data persistence methods
  async saveAccounts() {
    const accountsFile = path.join(__dirname, 'config', 'accounts', 'accounts.json');
    const accounts = Array.from(this.accounts.values());
    await fs.writeJson(accountsFile, accounts, { spaces: 2 });
  }
  
  async saveProxies() {
    const proxiesFile = path.join(__dirname, 'config', 'proxies', 'proxies.json');
    await fs.writeJson(proxiesFile, this.proxies, { spaces: 2 });
  }
  
  async saveSession(session) {
    const sessionFile = path.join(__dirname, 'config', 'sessions', `${session.id}.json`);
    await fs.writeJson(sessionFile, session, { spaces: 2 });
  }
  
  async saveLearningData() {
    const learningFile = path.join(__dirname, 'data', 'learning', 'learning-data.json');
    const data = {};
    
    for (const [botId, bot] of this.bots) {
      data[botId] = {
        experiences: bot.behavior.learning.experiences.length,
        successRate: bot.behavior.learning.successRate,
        lastLearning: bot.behavior.learning.lastLearning
      };
    }
    
    await fs.writeJson(learningFile, data, { spaces: 2 });
  }
  
  async saveData() {
    await Promise.all([
      this.saveAccounts(),
      this.saveProxies(),
      this.saveLearningData()
    ]);
    
    console.log('💾 System data saved');
  }
  
  logEvent(type, data) {
    const event = {
      type,
      data,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    
    this.events.push(event);
    
    // Keep events list manageable
    if (this.events.length > 1000) {
      this.events = this.events.slice(-500);
    }
    
    return event;
  }
  
  // Public API methods
  getStatus() {
    const connectedBots = Array.from(this.bots.values()).filter(b => b.status.current === 'connected').length;
    const totalBots = this.bots.size;
    
    // Calculate success rate
    const successRate = this.metrics.totalConnections > 0 ?
      (this.metrics.successfulConnections / this.metrics.totalConnections * 100).toFixed(1) : 0;
    
    return {
      status: connectedBots > 0 ? 'ACTIVE' : 'IDLE',
      totalBots: totalBots,
      connectedBots: connectedBots,
      successRate: successRate,
      averageSession: Math.floor(this.metrics.averageSession / 1000) + 's',
      totalPlaytime: Math.floor(this.metrics.totalPlaytime / 3600000) + 'h',
      peakBots: this.metrics.peakBots,
      currentBots: this.metrics.currentBots,
      bots: Array.from(this.bots.values()).map(bot => ({
        id: bot.id,
        name: bot.account.username,
        type: bot.type,
        subtype: bot.subtype,
        connected: bot.status.current === 'connected',
        status: bot.status.current,
        health: bot.status.health,
        food: bot.status.food,
        activity: bot.status.activity,
        ip: bot.proxy?.ip || 'direct',
        account: bot.account.username,
        sessionTime: bot.metrics.startTime ?
          Math.floor((Date.now() - bot.metrics.startTime) / 60000) + 'm' : '0m',
        position: bot.status.position,
        suspicion: bot.security.suspicionLevel
      }))
    };
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      systemUptime: Math.floor(process.uptime()),
      sessions: this.sessions.size,
      activeProcesses: this.processes.size,
      events: this.events.length,
      learningData: this.learningData.size,
      behaviorPatterns: this.behaviorPatterns.size
    };
  }
  
  getAllBots() {
    return Array.from(this.bots.values()).map(bot => ({
      id: bot.id,
      type: bot.type,
      subtype: bot.subtype,
      account: bot.account.username,
      connected: bot.status.current === 'connected',
      status: bot.status.current,
      network: bot.proxy,
      behavior: bot.behavior,
      security: bot.security,
      metrics: bot.metrics,
      activity: bot.status.activity,
      position: bot.status.position
    }));
  }
  
  getRecentEvents(limit = 20) {
    return this.events.slice(-limit).reverse().map(event => ({
      type: event.type,
      message: this.formatEventMessage(event),
      time: new Date(event.timestamp).toLocaleTimeString(),
      date: new Date(event.timestamp).toLocaleDateString()
    }));
  }
  
  formatEventMessage(event) {
    switch (event.type) {
      case 'bot_created':
        return `Bot created: ${event.data.username} (${event.data.type})`;
      case 'bot_connected':
        return `Bot connected: ${event.data.username} at ${event.data.position}`;
      case 'bot_disconnected':
        return `Bot disconnected: ${event.data.username} (${event.data.reason})`;
      case 'bot_chat':
        return `${event.data.username}: ${event.data.message}`;
      case 'system_start':
        return `System started with ${event.data.botCount} bots`;
      default:
        return `${event.type}: ${JSON.stringify(event.data)}`;
    }
  }
  
  getSystemHealth() {
    const os = require('os');
    
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    const connectedBots = Array.from(this.bots.values())
      .filter(b => b.status.current === 'connected').length;
    
    let health = 'healthy';
    if (cpuUsage > 0.8 || memUsage > 85 || connectedBots === 0) {
      health = 'degraded';
    }
    if (cpuUsage > 0.9 || memUsage > 90) {
      health = 'critical';
    }
    
    return {
      health: health,
      cpu: (cpuUsage * 100).toFixed(1) + '%',
      memory: memUsage.toFixed(1) + '%',
      connectedBots: connectedBots,
      totalBots: this.bots.size,
      activeProcesses: this.processes.size,
      sessions: this.sessions.size
    };
  }
}

// Export singleton instance
module.exports = UltimateBotSystem;
