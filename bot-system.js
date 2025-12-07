const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const EventEmitter = require('events');
const mineflayer = require('mineflayer');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class BotSystem extends EventEmitter {
  constructor(dependencies = {}) {
    super();
    
    // Inject dependencies
    this.proxyManager = dependencies.proxyManager;
    this.identityManager = dependencies.identityManager;
    this.behaviorEngine = dependencies.behaviorEngine;
    this.temporalManager = dependencies.temporalManager;
    this.neuralNetwork = dependencies.neuralNetwork;
    this.detectionEvasion = dependencies.detectionEvasion;
    this.ecosystemSimulator = dependencies.ecosystemSimulator;
    
    // Core data structures
    this.bots = new Map();
    this.accounts = new Map();
    this.events = [];
    this.consoleLogs = [];
    this.chatHistory = [];
    this.performanceMetrics = [];
    
    // CUSTOM BOT PERSONALITIES
    this.botPersonalities = {
      agent: {
        name: 'Agent',
        type: 'agent',
        behaviorProfile: {
          movementStyle: 'stealthy',
          chatFrequency: 0.3,
          miningFrequency: 0.4,
          buildingFrequency: 0.6,
          combatAggression: 0.2,
          explorationRate: 0.8
        },
        skills: ['stealth', 'surveillance', 'patrolling', 'investigation'],
        description: 'Stealth operative, surveillance expert'
      },
      cropton: {
        name: 'Cropton',
        type: 'cropton',
        behaviorProfile: {
          movementStyle: 'methodical',
          chatFrequency: 0.2,
          miningFrequency: 0.9,
          buildingFrequency: 0.3,
          combatAggression: 0.4,
          explorationRate: 0.7
        },
        skills: ['mining', 'resource_collection', 'tunnel_networks', 'ore_detection'],
        description: 'Master miner, resource collector'
      },
      craftman: {
        name: 'CraftMan',
        type: 'craftman',
        behaviorProfile: {
          movementStyle: 'deliberate',
          chatFrequency: 0.4,
          miningFrequency: 0.3,
          buildingFrequency: 0.9,
          combatAggression: 0.1,
          explorationRate: 0.3
        },
        skills: ['building', 'crafting', 'architecture', 'design'],
        description: 'Expert builder, architect, crafter'
      },
      herobrine: {
        name: 'HeroBrine',
        type: 'herobrine',
        behaviorProfile: {
          movementStyle: 'erratic',
          chatFrequency: 0.1,
          miningFrequency: 0.2,
          buildingFrequency: 0.4,
          combatAggression: 0.3,
          explorationRate: 0.9
        },
        skills: ['haunting', 'teleportation', 'illusion', 'mystery'],
        description: 'Legendary entity, mysterious, haunting'
      }
    };
    
    // Configuration
    this.config = {
      server: {
        host: process.env.MINECRAFT_HOST || 'gameplannet.aternos.me',
        port: parseInt(process.env.MINECRAFT_PORT) || 34286,
        version: process.env.MINECRAFT_VERSION || '1.21.10'
      },
      
      network: {
        maxBots: parseInt(process.env.MAX_BOTS) || 4,
        connectionStagger: 5000,
        maxReconnectAttempts: 5,
        reconnectDelay: 10000,
        sessionDuration: {
          min: 1200000, // 20 minutes
          max: 21600000 // 6 hours
        }
      },
      
      features: {
        neuralNetwork: true,
        proxyRotation: true,
        temporalPatterns: true,
        ecosystemSimulation: true,
        detectionEvasion: true,
        behaviorLearning: true
      }
    };
    
    console.log('🚀 Bot System v6.0 Initialized');
    console.log(`🎯 Bot Personalities: ${Object.keys(this.botPersonalities).join(', ')}`);
  }
  
  async initialize() {
    console.log('🔄 Initializing Bot System...');
    
    await this.createDirectories();
    await this.loadData();
    await this.initializeDependencies();
    
    this.startMonitoring();
    this.startPerformanceTracking();
    
    this.consoleLog('✅ Bot System initialized with all features');
    return this;
  }
  
  async createDirectories() {
    const dirs = ['logs', 'config', 'data', 'backups', 'models', 'sessions'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(__dirname, dir));
    }
  }
  
  async loadData() {
    // Load accounts
    const accountsPath = path.join(__dirname, 'config', 'accounts.json');
    if (await fs.pathExists(accountsPath)) {
      const accounts = await fs.readJson(accountsPath);
      accounts.forEach(acc => this.accounts.set(acc.id, acc));
    } else {
      await this.generateAccounts();
    }
    
    // Load bot configurations
    const botsPath = path.join(__dirname, 'config', 'bots.json');
    if (await fs.pathExists(botsPath)) {
      const bots = await fs.readJson(botsPath);
      bots.forEach(bot => this.bots.set(bot.id, bot));
    }
    
    this.consoleLog(`📊 Loaded ${this.accounts.size} accounts, ${this.bots.size} bots`);
  }
  
  async generateAccounts() {
    // Generate 10+ Aternos accounts with realistic data
    const accountTemplates = [
      { username: 'Agent007', emailProvider: 'gmail.com', registrationDate: '2023-05-15' },
      { username: 'CroptonMiner', emailProvider: 'outlook.com', registrationDate: '2023-06-22' },
      { username: 'CraftMaster', emailProvider: 'yahoo.com', registrationDate: '2023-07-10' },
      { username: 'HeroBrine_OG', emailProvider: 'protonmail.com', registrationDate: '2023-08-05' },
      { username: 'MinecraftPro', emailProvider: 'gmail.com', registrationDate: '2023-09-18' },
      { username: 'DiamondFinder', emailProvider: 'hotmail.com', registrationDate: '2023-10-03' },
      { username: 'BuilderExpert', emailProvider: 'icloud.com', registrationDate: '2023-11-12' },
      { username: 'NetherExplorer', emailProvider: 'gmail.com', registrationDate: '2023-12-01' },
      { username: 'RedstoneWiz', emailProvider: 'outlook.com', registrationDate: '2024-01-20' },
      { username: 'EndDragon', emailProvider: 'yahoo.com', registrationDate: '2024-02-14' }
    ];
    
    for (const template of accountTemplates) {
      const account = {
        id: uuidv4(),
        username: template.username,
        email: `${template.username.toLowerCase()}@${template.emailProvider}`,
        registrationDate: template.registrationDate,
        lastLogin: moment().subtract(Math.floor(Math.random() * 30), 'days').toISOString(),
        status: 'active',
        serverHistory: [],
        securitySettings: {
          twoFactor: Math.random() > 0.7,
          backupCodes: Math.random() > 0.5,
          recoveryEmail: Math.random() > 0.3
        }
      };
      
      // Add server history
      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        account.serverHistory.push({
          name: `Server${i + 1}`,
          type: ['survival', 'creative', 'modded'][Math.floor(Math.random() * 3)],
          lastPlayed: moment().subtract(Math.floor(Math.random() * 60), 'days').toISOString()
        });
      }
      
      this.accounts.set(account.id, account);
    }
    
    await this.saveAccounts();
  }
  
  async saveAccounts() {
    const accountsPath = path.join(__dirname, 'config', 'accounts.json');
    await fs.writeJson(accountsPath, Array.from(this.accounts.values()), { spaces: 2 });
  }
  
  async initializeDependencies() {
    // Initialize all dependency systems
    if (this.proxyManager) {
      await this.proxyManager.initialize();
    }
    
    if (this.identityManager) {
      await this.identityManager.initialize();
    }
    
    if (this.behaviorEngine) {
      await this.behaviorEngine.initialize();
    }
    
    if (this.temporalManager) {
      await this.temporalManager.initialize();
    }
    
    if (this.neuralNetwork) {
      await this.neuralNetwork.initialize();
    }
    
    if (this.detectionEvasion) {
      await this.detectionEvasion.initialize();
    }
    
    if (this.ecosystemSimulator) {
      await this.ecosystemSimulator.initialize();
    }
  }
  
  async createBot(personalityType) {
    const personality = this.botPersonalities[personalityType];
    if (!personality) {
      throw new Error(`Unknown personality type: ${personalityType}`);
    }
    
    const botId = `bot_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    
    // Get or create account
    const account = await this.getNextAccount(personality.name);
    
    // Get proxy for this bot
    const proxy = this.proxyManager ? await this.proxyManager.getNextProxy() : null;
    
    // Generate unique client signature
    const clientSignature = this.generateClientSignature();
    
    const bot = {
      id: botId,
      name: personality.name,
      type: personality.type,
      personality: personality,
      account: account,
      proxy: proxy,
      clientSignature: clientSignature,
      
      // Status
      status: 'created',
      health: 20,
      food: 20,
      experience: 0,
      level: 1,
      
      // Position & World
      position: { x: 0, y: 64, z: 0 },
      dimension: 'overworld',
      biome: 'plains',
      
      // Activity
      activity: 'initializing',
      activityHistory: [],
      currentTask: null,
      
      // Connection
      connection: {
        connected: false,
        reconnectAttempts: 0,
        sessionStart: null,
        sessionDuration: null,
        ip: proxy ? proxy.ip : 'Direct',
        port: proxy ? proxy.port : null
      },
      
      // Settings
      settings: {
        autoReconnect: true,
        antiAFK: true,
        chatEnabled: true,
        neuralControl: true,
        temporalPatterns: true
      },
      
      // Performance
      performance: {
        messagesSent: 0,
        blocksMined: 0,
        distanceTraveled: 0,
        mobsKilled: 0,
        deaths: 0
      },
      
      // Instance (will be set when connected)
      instance: null,
      activityInterval: null,
      afkInterval: null,
      chatInterval: null,
      neuralInterval: null
    };
    
    this.bots.set(botId, bot);
    this.consoleLog(`🤖 Created ${personality.type} bot: ${bot.name}`);
    this.logEvent('bot_created', { botId, name: bot.name, type: bot.type });
    
    return bot;
  }
  
  async getNextAccount(preferredName) {
    // Try to find account with matching username
    let account = Array.from(this.accounts.values())
      .find(acc => acc.username.toLowerCase().includes(preferredName.toLowerCase()));
    
    // If no matching account, get least recently used
    if (!account) {
      account = Array.from(this.accounts.values())
        .filter(acc => acc.status === 'active')
        .sort((a, b) => new Date(a.lastLogin || 0) - new Date(b.lastLogin || 0))[0];
    }
    
    if (!account) {
      // Create new account
      account = {
        id: uuidv4(),
        username: preferredName,
        email: `${preferredName.toLowerCase()}@gmail.com`,
        registrationDate: moment().toISOString(),
        lastLogin: moment().toISOString(),
        status: 'active',
        serverHistory: []
      };
      this.accounts.set(account.id, account);
      await this.saveAccounts();
    }
    
    // Update last login
    account.lastLogin = moment().toISOString();
    await this.saveAccounts();
    
    return account;
  }
  
  generateClientSignature() {
    // Generate unique client fingerprint
    const launchers = ['Official', 'MultiMC', 'GDLauncher', 'LunarClient', 'Badlion'];
    const javaVersions = ['1.8.0_351', '11.0.20', '17.0.8', '21.0.0'];
    const modLoaders = ['Forge', 'Fabric', 'Quilt', 'Vanilla'];
    
    return {
      launcher: launchers[Math.floor(Math.random() * launchers.length)],
      javaVersion: javaVersions[Math.floor(Math.random() * javaVersions.length)],
      modLoader: modLoaders[Math.floor(Math.random() * modLoaders.length)],
      renderDistance: Math.floor(Math.random() * 6) + 4,
      guiScale: Math.floor(Math.random() * 4),
      maxFps: [60, 120, 144, 240][Math.floor(Math.random() * 4)],
      resourcePackHash: crypto.randomBytes(16).toString('hex'),
      clientModifications: Math.random() > 0.5 ? ['OptiFine', 'JourneyMap'] : []
    };
  }
  
  async connectBot(botId) {
    const bot = this.bots.get(botId);
    if (!bot) throw new Error('Bot not found');
    
    this.consoleLog(`🔄 Connecting ${bot.name} (${bot.type})...`);
    
    try {
      // Test server connection
      const serverStatus = await this.testServerConnection();
      if (!serverStatus.online) {
        throw new Error('Server is offline');
      }
      
      // Get connection parameters from temporal manager
      const connectionParams = this.temporalManager 
        ? await this.temporalManager.getConnectionParameters() 
        : {};
      
      // Prepare bot options
      const options = {
        host: this.config.server.host,
        port: this.config.server.port,
        username: bot.name,
        version: this.config.server.version,
        auth: 'offline',
        
        // Client modifications
        viewDistance: bot.clientSignature.renderDistance,
        difficulty: connectionParams.difficulty || 'normal',
        
        // Add proxy if available
        ...(bot.proxy ? {
          connect: bot.proxy.createConnection(),
          agent: bot.proxy.agent
        } : {})
      };
      
      // Apply detection evasion
      if (this.detectionEvasion) {
        await this.detectionEvasion.applyConnectionModifications(options, bot);
      }
      
      // Create bot instance
      const mcBot = mineflayer.createBot(options);
      bot.instance = mcBot;
      bot.status = 'connecting';
      bot.connection.sessionStart = Date.now();
      bot.connection.sessionDuration = this.getRandomSessionDuration();
      
      // Setup event handlers
      this.setupBotEvents(bot, mcBot);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 30000);
        
        mcBot.once('spawn', () => {
          clearTimeout(timeout);
          
          bot.status = 'connected';
          bot.connection.connected = true;
          bot.connection.reconnectAttempts = 0;
          bot.activity = 'spawned';
          
          // Get initial position
          if (mcBot.entity) {
            bot.position = {
              x: Math.floor(mcBot.entity.position.x),
              y: Math.floor(mcBot.entity.position.y),
              z: Math.floor(mcBot.entity.position.z)
            };
            bot.dimension = mcBot.game.dimension;
          }
          
          this.consoleLog(`✅ ${bot.name} successfully connected!`);
          this.logEvent('bot_connected', { 
            botId: bot.id, 
            name: bot.name,
            ip: bot.connection.ip,
            sessionDuration: bot.connection.sessionDuration
          });
          
          // Start bot activities
          this.startBotActivities(bot);
          
          // Start neural network control if enabled
          if (bot.settings.neuralControl && this.neuralNetwork) {
            this.startNeuralControl(bot);
          }
          
          resolve(bot);
        });
        
        mcBot.once('error', (err) => {
          clearTimeout(timeout);
          reject(new Error(`Connection error: ${err.message}`));
        });
        
        mcBot.once('kicked', (reason) => {
          clearTimeout(timeout);
          reject(new Error(`Kicked: ${JSON.stringify(reason)}`));
        });
      });
      
    } catch (error) {
      bot.status = 'failed';
      bot.connection.connected = false;
      this.consoleLog(`❌ Failed to connect ${bot.name}: ${error.message}`, 'error');
      
      // Apply detection evasion response
      if (this.detectionEvasion) {
        await this.detectionEvasion.handleConnectionFailure(bot, error);
      }
      
      if (bot.settings.autoReconnect) {
        this.scheduleReconnection(bot);
      }
      
      throw error;
    }
  }
  
  getRandomSessionDuration() {
    const { min, max } = this.config.network.sessionDuration;
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  setupBotEvents(bot, mcBot) {
    // Health & Food
    mcBot.on('health', () => {
      if (mcBot.health !== undefined) bot.health = mcBot.health;
      if (mcBot.food !== undefined) bot.food = mcBot.food;
      if (mcBot.experience !== undefined) {
        bot.experience = mcBot.experience.level || 0;
        bot.level = mcBot.experience.level || 1;
      }
    });
    
    // Position & Movement
    mcBot.on('move', () => {
      if (mcBot.entity) {
        const oldPos = { ...bot.position };
        bot.position = {
          x: Math.floor(mcBot.entity.position.x),
          y: Math.floor(mcBot.entity.position.y),
          z: Math.floor(mcBot.entity.position.z)
        };
        
        // Track distance traveled
        const distance = Math.sqrt(
          Math.pow(bot.position.x - oldPos.x, 2) +
          Math.pow(bot.position.z - oldPos.z, 2)
        );
        bot.performance.distanceTraveled += distance;
      }
    });
    
    // Chat System
    mcBot.on('chat', (username, message, translate, jsonMsg, matches) => {
      if (username === bot.name) return;
      
      this.addChatMessage(username, message, 'player');
      this.consoleLog(`💬 ${username}: ${message}`);
      
      // Process chat with neural network
      if (bot.settings.neuralControl && this.neuralNetwork) {
        this.neuralNetwork.processChat(bot, username, message);
      }
      
      // Auto-response based on personality
      if (Math.random() < bot.personality.behaviorProfile.chatFrequency) {
        setTimeout(() => {
          if (mcBot.player && bot.connection.connected) {
            const response = this.generateChatResponse(bot, message, username);
            if (response) {
              mcBot.chat(response);
              this.addChatMessage(bot.name, response, 'bot');
              bot.performance.messagesSent++;
            }
          }
        }, 1000 + Math.random() * 3000);
      }
    });
    
    // Block Events
    mcBot.on('blockBreakProgressObserved', (block, destroyStage) => {
      // Track mining activity
      if (destroyStage === 9) { // Block fully broken
        bot.performance.blocksMined++;
        this.logEvent('block_mined', { botId: bot.id, block: block.name });
      }
    });
    
    mcBot.on('playerCollect', (collector, collected) => {
      if (collector === mcBot.entity) {
        this.logEvent('item_collected', { botId: bot.id, item: collected.name });
      }
    });
    
    // Death Events
    mcBot.on('death', () => {
      bot.performance.deaths++;
      this.consoleLog(`💀 ${bot.name} died!`, 'warning');
      this.logEvent('bot_died', { botId: bot.id });
      
      // Learn from death
      if (this.neuralNetwork) {
        this.neuralNetwork.learnFromDeath(bot);
      }
    });
    
    // Disconnect Events
    mcBot.on('end', (reason) => {
      bot.status = 'disconnected';
      bot.connection.connected = false;
      
      const sessionDuration = Date.now() - (bot.connection.sessionStart || Date.now());
      this.consoleLog(`🔌 ${bot.name} disconnected after ${Math.round(sessionDuration / 1000)}s: ${reason || 'Unknown'}`);
      
      this.logEvent('bot_disconnected', { 
        botId: bot.id, 
        reason: reason,
        sessionDuration: sessionDuration
      });
      
      // Clean up intervals
      this.cleanupBotIntervals(bot);
      
      // Schedule reconnection if enabled
      if (bot.settings.autoReconnect && bot.connection.reconnectAttempts < this.config.network.maxReconnectAttempts) {
        this.scheduleReconnection(bot);
      }
    });
    
    // Spawn Events
    mcBot.on('spawn', () => {
      bot.status = 'connected';
      bot.connection.connected = true;
      bot.activity = 'spawned';
      this.consoleLog(`📍 ${bot.name} spawned`);
    });
    
    // Entity Events (for combat)
    mcBot.on('entityHurt', (entity) => {
      if (entity === mcBot.entity) {
        this.logEvent('bot_hurt', { botId: bot.id, health: bot.health });
      }
    });
    
    mcBot.on('entityGone', (entity) => {
      if (entity.type === 'mob' && entity.killer === mcBot.entity) {
        bot.performance.mobsKilled++;
        this.logEvent('mob_killed', { botId: bot.id, mob: entity.name });
      }
    });
  }
  
  generateChatResponse(bot, message, sender) {
    const responses = {
      agent: [
        'Mission underway.',
        'Area secure.',
        'Copy that.',
        'Proceeding as planned.',
        'Affirmative.'
      ],
      cropton: [
        'Found some diamonds!',
        'Mining in progress.',
        'Strike the earth!',
        'Deep underground.',
        'Need more torches.'
      ],
      craftman: [
        'Building masterpiece!',
        'Crafting complete.',
        'Architecture in progress.',
        'Design phase.',
        'Construction underway.'
      ],
      herobrine: [
        '...',
        'Herobrine was here.',
        'Watch your back.',
        'Eyes in the shadows.',
        'The legend lives.'
      ]
    };
    
    const botResponses = responses[bot.type] || ['Hello!'];
    
    // Check if message contains bot name
    if (message.toLowerCase().includes(bot.name.toLowerCase())) {
      const directResponses = [
        `Yes ${sender}?`,
        `What do you need ${sender}?`,
        `I'm here ${sender}.`,
        `Listening ${sender}.`
      ];
      return directResponses[Math.floor(Math.random() * directResponses.length)];
    }
    
    // Check for questions
    if (message.includes('?')) {
      const questionResponses = [
        'Good question.',
        'I think so.',
        'Not sure about that.',
        'Probably.',
        'Maybe.'
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }
    
    // Random response based on frequency
    if (Math.random() < bot.personality.behaviorProfile.chatFrequency) {
      return botResponses[Math.floor(Math.random() * botResponses.length)];
    }
    
    return null;
  }
  
  startBotActivities(bot) {
    if (!bot.instance || !bot.connection.connected) return;
    
    // Clear existing intervals
    this.cleanupBotIntervals(bot);
    
    // Main activity loop
    bot.activityInterval = setInterval(() => {
      if (!bot.instance || !bot.connection.connected) {
        clearInterval(bot.activityInterval);
        return;
      }
      
      // Update bot state
      this.updateBotState(bot);
      
      // Decide next activity using neural network
      const nextActivity = this.decideNextActivity(bot);
      bot.activity = nextActivity;
      
      // Execute activity
      this.executeActivity(bot, nextActivity);
      
      // Record activity
      bot.activityHistory.push({
        activity: nextActivity,
        timestamp: Date.now(),
        position: { ...bot.position }
      });
      
      // Keep history limited
      if (bot.activityHistory.length > 100) {
        bot.activityHistory = bot.activityHistory.slice(-50);
      }
      
    }, 10000 + Math.random() * 20000); // 10-30 seconds
    
    // Anti-AFK system
    if (bot.settings.antiAFK) {
      bot.afkInterval = setInterval(() => {
        if (bot.instance && bot.connection.connected) {
          this.antiAFKMovement(bot);
        }
      }, 45000 + Math.random() * 90000); // 45-135 seconds
    }
    
    // Chat system
    if (bot.settings.chatEnabled) {
      bot.chatInterval = setInterval(() => {
        if (bot.instance && bot.connection.connected && Math.random() < 0.4) {
          this.sendRandomChat(bot);
        }
      }, 30000 + Math.random() * 90000); // 30-120 seconds
    }
    
    // Session management
    if (bot.connection.sessionDuration) {
      setTimeout(() => {
        if (bot.instance && bot.connection.connected) {
          this.initiateGracefulDisconnect(bot);
        }
      }, bot.connection.sessionDuration);
    }
  }
  
  decideNextActivity(bot) {
    // Use neural network if available
    if (this.neuralNetwork && bot.settings.neuralControl) {
      return this.neuralNetwork.decideActivity(bot);
    }
    
    // Fallback to personality-based decisions
    const profile = bot.personality.behaviorProfile;
    const activities = [
      { name: 'mining', weight: profile.miningFrequency },
      { name: 'building', weight: profile.buildingFrequency },
      { name: 'exploring', weight: profile.explorationRate },
      { name: 'combat', weight: profile.combatAggression },
      { name: 'farming', weight: 0.3 },
      { name: 'crafting', weight: 0.4 },
      { name: 'socializing', weight: profile.chatFrequency },
      { name: 'idle', weight: 0.1 }
    ];
    
    // Weighted random selection
    const totalWeight = activities.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const activity of activities) {
      if (random < activity.weight) {
        return activity.name;
      }
      random -= activity.weight;
    }
    
    return 'idle';
  }
  
  executeActivity(bot, activity) {
    if (!bot.instance || !bot.connection.connected) return;
    
    try {
      switch (activity) {
        case 'mining':
          this.executeMining(bot);
          break;
        case 'building':
          this.executeBuilding(bot);
          break;
        case 'exploring':
          this.executeExploration(bot);
          break;
        case 'combat':
          this.executeCombat(bot);
          break;
        case 'farming':
          this.executeFarming(bot);
          break;
        case 'crafting':
          this.executeCrafting(bot);
          break;
        case 'socializing':
          this.executeSocializing(bot);
          break;
        case 'idle':
          // Just update position
          break;
      }
    } catch (error) {
      this.consoleLog(`Activity error for ${bot.name}: ${error.message}`, 'error');
    }
  }
  
  async executeMining(bot) {
    const mcBot = bot.instance;
    
    // Find nearby blocks to mine
    const mineableBlocks = ['stone', 'coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore', 'redstone_ore', 'lapis_ore'];
    
    const block = mcBot.findBlock({
      matching: (block) => mineableBlocks.includes(block.name),
      maxDistance: 16,
      count: 1
    });
    
    if (block) {
      // Look at block
      await mcBot.lookAt(block.position.offset(0.5, 0.5, 0.5));
      
      // Start mining with occasional breaks
      mcBot.dig(block, (err) => {
        if (!err) {
          this.consoleLog(`⛏️ ${bot.name} mined ${block.name}`);
          bot.performance.blocksMined++;
        }
      });
    } else {
      // No mineable blocks nearby, move randomly
      this.randomMovement(bot);
    }
  }
  
  async executeBuilding(bot) {
    const mcBot = bot.instance;
    
    // Check inventory for building materials
    const buildingMaterials = mcBot.inventory.items().filter(item => 
      item && (item.name.includes('_block') || 
              ['planks', 'stone', 'bricks', 'glass', 'wool'].some(mat => item.name.includes(mat)))
    );
    
    if (buildingMaterials.length > 0) {
      const material = buildingMaterials[0];
      
      // Find suitable location to place block
      const referenceBlock = mcBot.blockAt(
        mcBot.entity.position.offset(
          Math.floor(Math.random() * 3) - 1,
          0,
          Math.floor(Math.random() * 3) - 1
        )
      );
      
      if (referenceBlock && referenceBlock.name === 'air') {
        // Look at block
        await mcBot.lookAt(referenceBlock.position.offset(0.5, 0.5, 0.5));
        
        // Place block
        setTimeout(() => {
          mcBot.placeBlock(referenceBlock, { x: 0, y: 1, z: 0 }, (err) => {
            if (!err) {
              this.consoleLog(`🧱 ${bot.name} placed ${material.name}`);
            }
          });
        }, 500);
      }
    }
  }
  
  async executeExploration(bot) {
    const mcBot = bot.instance;
    
    // Move in random direction
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    // Also look around
    mcBot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    
    // Move for random duration
    const duration = 1000 + Math.random() * 3000;
    mcBot.setControlState(direction, true);
    
    setTimeout(() => {
      if (mcBot) {
        mcBot.setControlState(direction, false);
      }
    }, duration);
  }
  
  executeCombat(bot) {
    const mcBot = bot.instance;
    
    // Find nearby hostile mobs
    const hostileMobs = Object.values(mcBot.entities).filter(entity =>
      entity.type === 'mob' &&
      ['zombie', 'skeleton', 'spider', 'creeper'].includes(entity.name) &&
      entity.position.distanceTo(mcBot.entity.position) < 16
    );
    
    if (hostileMobs.length > 0) {
      const target = hostileMobs[0];
      
      // Check health before engaging
      if (bot.health > 6) {
        // Attack mob
        mcBot.attack(target);
        
        // Dodging movement
        if (Math.random() > 0.5) {
          mcBot.setControlState('left', true);
          setTimeout(() => {
            if (mcBot) mcBot.setControlState('left', false);
          }, 500);
        }
      } else {
        // Low health, run away
        this.consoleLog(`🏃 ${bot.name} running from ${target.name}`, 'warning');
        mcBot.setControlState('back', true);
        setTimeout(() => {
          if (mcBot) mcBot.setControlState('back', false);
        }, 2000);
      }
    }
  }
  
  executeFarming(bot) {
    const mcBot = bot.instance;
    
    // Look for crops to harvest
    const crops = ['wheat', 'carrots', 'potatoes', 'beetroots'];
    
    const cropBlock = mcBot.findBlock({
      matching: (block) => crops.some(crop => block.name.includes(crop)),
      maxDistance: 10,
      count: 1
    });
    
    if (cropBlock) {
      // Harvest crop
      mcBot.dig(cropBlock, (err) => {
        if (!err) {
          this.consoleLog(`🌾 ${bot.name} harvested crops`);
        }
      });
    }
  }
  
  executeCrafting(bot) {
    const mcBot = bot.instance;
    
    // Simple crafting simulation
    if (Math.random() < 0.3) {
      // Open inventory (simulated)
      this.consoleLog(`🛠️ ${bot.name} crafting items`);
      
      // Actually crafting would require specific recipes
      // This is just simulation for behavior
    }
  }
  
  executeSocializing(bot) {
    // Already handled by chat intervals
    // Could add more social behaviors here
  }
  
  antiAFKMovement(bot) {
    if (!bot.instance) return;
    
    const mcBot = bot.instance;
    const movements = [
      () => {
        mcBot.setControlState('jump', true);
        setTimeout(() => {
          if (mcBot) mcBot.setControlState('jump', false);
        }, 200);
      },
      () => {
        mcBot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
      },
      () => {
        const dir = ['forward', 'back', 'left', 'right'][Math.floor(Math.random() * 4)];
        mcBot.setControlState(dir, true);
        setTimeout(() => {
          if (mcBot) mcBot.setControlState(dir, false);
        }, 500);
      }
    ];
    
    const movement = movements[Math.floor(Math.random() * movements.length)];
    movement();
  }
  
  randomMovement(bot) {
    if (!bot.instance) return;
    
    const mcBot = bot.instance;
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    mcBot.setControlState(direction, true);
    
    setTimeout(() => {
      if (mcBot) {
        mcBot.setControlState(direction, false);
      }
    }, 1000 + Math.random() * 2000);
  }
  
  sendRandomChat(bot) {
    if (!bot.instance) return;
    
    const messages = {
      agent: [
        'Mission accomplished.',
        'All clear.',
        'Reporting in.',
        'Target acquired.',
        'Surveillance active.'
      ],
      cropton: [
        'Found some ores!',
        'Mining in progress.',
        'Deep underground.',
        'Strike the earth!',
        'Need more torches.'
      ],
      craftman: [
        'Building masterpiece!',
        'Crafting complete.',
        'Architecture in progress.',
        'Design phase complete.',
        'Construction underway.'
      ],
      herobrine: [
        '...',
        'Herobrine was here.',
        'Watch your back.',
        'Eyes in the dark.',
        'Beware the shadows.'
      ]
    };
    
    const botMessages = messages[bot.type] || ['Hello!'];
    const message = botMessages[Math.floor(Math.random() * botMessages.length)];
    
    bot.instance.chat(message);
    this.addChatMessage(bot.name, message, 'bot');
    bot.performance.messagesSent++;
  }
  
  startNeuralControl(bot) {
    if (!this.neuralNetwork) return;
    
    bot.neuralInterval = setInterval(() => {
      if (bot.instance && bot.connection.connected) {
        // Neural network decision making
        const decision = this.neuralNetwork.makeDecision(bot);
        
        if (decision.action) {
          this.executeNeuralAction(bot, decision);
        }
      }
    }, 5000 + Math.random() * 10000);
  }
  
  executeNeuralAction(bot, decision) {
    // Execute action based on neural network decision
    switch (decision.action) {
      case 'move_to':
        // Move to specific coordinates
        break;
      case 'interact_with':
        // Interact with entity or block
        break;
      case 'change_activity':
        bot.activity = decision.target;
        break;
      // Add more actions as needed
    }
  }
  
  updateBotState(bot) {
    const mcBot = bot.instance;
    if (!mcBot) return;
    
    // Update from bot instance
    if (mcBot.health !== undefined) bot.health = mcBot.health;
    if (mcBot.food !== undefined) bot.food = mcBot.food;
    if (mcBot.experience !== undefined) {
      bot.experience = mcBot.experience.level || 0;
      bot.level = mcBot.experience.level || 1;
    }
    
    // Update dimension
    bot.dimension = mcBot.game.dimension || 'overworld';
    
    // Update biome if available
    try {
      const block = mcBot.blockAt(mcBot.entity.position);
      if (block && block.biome) {
        bot.biome = block.biome.name;
      }
    } catch (error) {
      // Ignore biome errors
    }
  }
  
  cleanupBotIntervals(bot) {
    if (bot.activityInterval) clearInterval(bot.activityInterval);
    if (bot.afkInterval) clearInterval(bot.afkInterval);
    if (bot.chatInterval) clearInterval(bot.chatInterval);
    if (bot.neuralInterval) clearInterval(bot.neuralInterval);
  }
  
  scheduleReconnection(bot) {
    bot.connection.reconnectAttempts++;
    
    // Exponential backoff with jitter
    const baseDelay = this.config.network.reconnectDelay;
    const maxDelay = baseDelay * Math.pow(2, bot.connection.reconnectAttempts);
    const jitter = Math.random() * 1000;
    const delay = Math.min(maxDelay + jitter, 60000); // Max 1 minute
    
    this.consoleLog(`⏳ ${bot.name} reconnecting in ${Math.round(delay/1000)}s (attempt ${bot.connection.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connectBot(bot.id).catch(error => {
        this.consoleLog(`❌ Reconnection failed for ${bot.name}: ${error.message}`, 'error');
      });
    }, delay);
  }
  
  initiateGracefulDisconnect(bot) {
    this.consoleLog(`👋 ${bot.name} initiating graceful disconnect`);
    
    if (bot.instance) {
      // Say goodbye
      if (Math.random() > 0.7) {
        const goodbyes = ['Goodbye!', 'See you later!', 'Logging off!', 'Bye everyone!'];
        const message = goodbyes[Math.floor(Math.random() * goodbyes.length)];
        bot.instance.chat(message);
        this.addChatMessage(bot.name, message, 'bot');
      }
      
      // Disconnect after delay
      setTimeout(() => {
        if (bot.instance) {
          bot.instance.quit();
          bot.instance = null;
        }
      }, 2000 + Math.random() * 3000);
    }
  }
  
  async startAllBots() {
    this.consoleLog('🚀 Starting ALL bots with complete feature set...');
    
    const maxBots = Math.min(this.config.network.maxBots, Object.keys(this.botPersonalities).length);
    const results = { successful: [], failed: [] };
    
    // Clear inactive bots
    await this.clearInactiveBots();
    
    // Create and connect all bot personalities
    const personalityTypes = Object.keys(this.botPersonalities);
    
    for (let i = 0; i < Math.min(maxBots, personalityTypes.length); i++) {
      try {
        const personalityType = personalityTypes[i];
        const bot = await this.createBot(personalityType);
        
        // Stagger connections
        const delay = i * this.config.network.connectionStagger;
        
        setTimeout(async () => {
          try {
            await this.connectBot(bot.id);
            results.successful.push({
              botId: bot.id,
              name: bot.name,
              type: bot.type,
              ip: bot.connection.ip
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
      message: `Started ${results.successful.length} bots with full capabilities`,
      results: results
    };
  }
  
  async smartJoin() {
    this.consoleLog('🧠 Smart Join system activating...');
    
    // Check server status
    const serverStatus = await this.testServerConnection();
    
    if (!serverStatus.online) {
      return {
        success: false,
        message: 'Server is offline',
        serverStatus: serverStatus
      };
    }
    
    // Get optimal connection parameters
    const optimalTime = this.temporalManager ? await this.temporalManager.getOptimalConnectionTime() : null;
    const recommendedBots = this.getRecommendedBotCount();
    
    this.consoleLog(`🕐 Optimal connection time: ${optimalTime ? optimalTime.time : 'Now'}`);
    this.consoleLog(`🤖 Recommended bots: ${recommendedBots}`);
    
    // Start bots
    return await this.startAllBots();
  }
  
  getRecommendedBotCount() {
    // Determine optimal bot count based on various factors
    const hour = new Date().getHours();
    
    if (hour >= 22 || hour <= 6) {
      // Night time - fewer bots
      return 2;
    } else if (hour >= 16 && hour <= 20) {
      // Peak time - more bots
      return 4;
    } else {
      // Normal time
      return 3;
    }
  }
  
  async emergencyStop() {
    this.consoleLog('🛑 EMERGENCY STOP ACTIVATED - Disconnecting all bots');
    
    let stopped = 0;
    
    for (const [botId, bot] of this.bots) {
      // Clean up intervals
      this.cleanupBotIntervals(bot);
      
      // Disconnect bot
      if (bot.instance) {
        try {
          bot.instance.quit();
          bot.instance = null;
        } catch (error) {
          this.consoleLog(`Error stopping ${bot.name}: ${error.message}`, 'error');
        }
      }
      
      bot.status = 'stopped';
      bot.connection.connected = false;
      stopped++;
      
      this.logEvent('bot_emergency_stopped', { botId: bot.id, name: bot.name });
    }
    
    return {
      success: true,
      message: `Emergency stop complete. Stopped ${stopped} bots.`,
      stopped: stopped
    };
  }
  
  async clearInactiveBots() {
    let removed = 0;
    
    for (const [botId, bot] of this.bots) {
      if (bot.status !== 'connected' && bot.status !== 'connecting') {
        // Clean up
        this.cleanupBotIntervals(bot);
        
        if (bot.instance) {
          try {
            bot.instance.end();
          } catch (error) {
            // Ignore cleanup errors
          }
        }
        
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
          message: `Server online (${latency}ms)`
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
  
  async addBot(type) {
    try {
      const bot = await this.createBot(type);
      
      setTimeout(async () => {
        try {
          await this.connectBot(bot.id);
        } catch (error) {
          this.consoleLog(`Failed to start ${bot.name}: ${error.message}`, 'error');
        }
      }, 3000);
      
      return {
        success: true,
        message: `${type} bot ${bot.name} created. Starting in 3 seconds...`,
        botId: bot.id,
        name: bot.name,
        type: bot.type
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add bot: ${error.message}`
      };
    }
  }
  
  async updateSettings(settings) {
    // Update global settings
    if (settings.serverAddress) {
      this.config.server.host = settings.serverAddress;
    }
    
    if (settings.serverPort) {
      this.config.server.port = parseInt(settings.serverPort);
    }
    
    if (settings.serverVersion) {
      this.config.server.version = settings.serverVersion;
    }
    
    if (settings.maxBots) {
      this.config.network.maxBots = parseInt(settings.maxBots);
    }
    
    // Update bot-specific settings
    for (const [botId, bot] of this.bots) {
      if (settings.autoReconnect !== undefined) {
        bot.settings.autoReconnect = settings.autoReconnect;
      }
      
      if (settings.antiAFK !== undefined) {
        bot.settings.antiAFK = settings.antiAFK;
      }
      
      if (settings.chatEnabled !== undefined) {
        bot.settings.chatEnabled = settings.chatEnabled;
      }
      
      if (settings.neuralControl !== undefined) {
        bot.settings.neuralControl = settings.neuralControl;
      }
    }
    
    return { 
      success: true, 
      message: 'Settings updated',
      settings: this.config 
    };
  }
  
  startMonitoring() {
    // Performance monitoring
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 60000); // Every minute
    
    // Auto-save
    setInterval(() => {
      this.saveSystemState();
    }, 300000); // Every 5 minutes
  }
  
  startPerformanceTracking() {
    setInterval(() => {
      const metrics = {
        timestamp: Date.now(),
        activeBots: this.getConnectedBots().length,
        totalBots: this.bots.size,
        averageHealth: this.getAverageHealth(),
        totalMessages: this.getTotalMessages(),
        totalBlocksMined: this.getTotalBlocksMined(),
        totalDistance: this.getTotalDistance(),
        systemMemory: process.memoryUsage().heapUsed / 1024 / 1024
      };
      
      this.performanceMetrics.push(metrics);
      
      // Keep only last 1000 metrics
      if (this.performanceMetrics.length > 1000) {
        this.performanceMetrics = this.performanceMetrics.slice(-500);
      }
    }, 30000); // Every 30 seconds
  }
  
  collectPerformanceMetrics() {
    const metrics = {
      timestamp: Date.now(),
      bots: this.getConnectedBots().map(bot => ({
        id: bot.id,
        name: bot.name,
        status: bot.status,
        health: bot.health,
        activity: bot.activity,
        performance: bot.performance
      })),
      system: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        connections: this.getConnectedBots().length
      }
    };
    
    // Save to file
    const metricsPath = path.join(__dirname, 'logs', `metrics-${Date.now()}.json`);
    fs.writeJson(metricsPath, metrics, { spaces: 2 }).catch(console.error);
  }
  
  async saveSystemState() {
    try {
      const state = {
        timestamp: Date.now(),
        bots: Array.from(this.bots.values()).map(bot => ({
          id: bot.id,
          name: bot.name,
          type: bot.type,
          status: bot.status,
          position: bot.position,
          activity: bot.activity,
          performance: bot.performance
        })),
        accounts: Array.from(this.accounts.values()).length,
        events: this.events.length,
        chatHistory: this.chatHistory.length
      };
      
      const statePath = path.join(__dirname, 'data', `system-state-${Date.now()}.json`);
      await fs.writeJson(statePath, state, { spaces: 2 });
      
      this.consoleLog('💾 System state saved');
    } catch (error) {
      this.consoleLog(`Failed to save system state: ${error.message}`, 'error');
    }
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
    if (this.chatHistory.length > 1000) {
      this.chatHistory = this.chatHistory.slice(-500);
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
    if (this.consoleLogs.length > 2000) {
      this.consoleLogs = this.consoleLogs.slice(-1000);
    }
    
    const prefix = level === 'error' ? '❌' : 
                  level === 'warning' ? '⚠️' : 
                  level === 'success' ? '✅' : 'ℹ️';
    
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    return log;
  }
  
  logEvent(type, data) {
    const event = {
      id: uuidv4(),
      type,
      data,
      timestamp: Date.now()
    };
    
    this.events.push(event);
    if (this.events.length > 1000) {
      this.events = this.events.slice(-500);
    }
    
    // Emit event for other systems
    this.emit(type, event);
    
    return event;
  }
  
  getConnectedBots() {
    return Array.from(this.bots.values()).filter(bot => bot.status === 'connected');
  }
  
  getAverageHealth() {
    const connectedBots = this.getConnectedBots();
    if (connectedBots.length === 0) return 20;
    
    const totalHealth = connectedBots.reduce((sum, bot) => sum + (bot.health || 20), 0);
    return Math.round(totalHealth / connectedBots.length);
  }
  
  getTotalMessages() {
    return Array.from(this.bots.values()).reduce((sum, bot) => 
      sum + (bot.performance.messagesSent || 0), 0);
  }
  
  getTotalBlocksMined() {
    return Array.from(this.bots.values()).reduce((sum, bot) => 
      sum + (bot.performance.blocksMined || 0), 0);
  }
  
  getTotalDistance() {
    return Array.from(this.bots.values()).reduce((sum, bot) => 
      sum + (bot.performance.distanceTraveled || 0), 0);
  }
  
  getChatHistory(limit = 10) {
    return this.chatHistory.slice(-limit).reverse();
  }
  
  getRecentEvents(limit = 10) {
    return this.events.slice(-limit).reverse().map(event => ({
      type: event.type,
      message: this.formatEventMessage(event),
      time: new Date(event.timestamp).toLocaleTimeString(),
      data: event.data
    }));
  }
  
  getConsoleLogs(limit = 10) {
    return this.consoleLogs.slice(-limit).reverse().map(log => ({
      time: new Date(log.timestamp).toLocaleTimeString(),
      message: log.message,
      level: log.level
    }));
  }
  
  formatEventMessage(event) {
    switch (event.type) {
      case 'bot_created':
        return `🤖 Created ${event.data.name} (${event.data.type})`;
      case 'bot_connected':
        return `✅ ${event.data.name} connected (${event.data.ip})`;
      case 'bot_disconnected':
        return `🔌 ${event.data.name} disconnected`;
      case 'bot_died':
        return `💀 ${event.data.botId} died`;
      case 'block_mined':
        return `⛏️ Bot mined block`;
      case 'item_collected':
        return `📦 Bot collected item`;
      case 'bot_emergency_stopped':
        return `🛑 Emergency stopped ${event.data.name}`;
      default:
        return `${event.type}`;
    }
  }
  
  // Public API methods
  async getStatus() {
    const connectedBots = this.getConnectedBots();
    const serverStatus = await this.testServerConnection();
    
    return {
      stats: {
        totalBots: this.bots.size,
        connectedBots: connectedBots.length,
        serverOnline: serverStatus.online,
        ping: serverStatus.ping,
        averageHealth: this.getAverageHealth(),
        totalMessages: this.getTotalMessages(),
        totalBlocksMined: this.getTotalBlocksMined(),
        uptime: Math.floor(process.uptime())
      },
      bots: connectedBots.map(bot => ({
        id: bot.id,
        name: bot.name,
        type: bot.type,
        status: bot.status,
        health: bot.health,
        food: bot.food,
        activity: bot.activity,
        ip: bot.connection.ip,
        account: bot.account.username,
        position: `${bot.position.x},${bot.position.y},${bot.position.z}`,
        dimension: bot.dimension,
        biome: bot.biome,
        performance: bot.performance
      })),
      allBots: Array.from(this.bots.values()).map(bot => ({
        id: bot.id,
        name: bot.name,
        type: bot.type,
        status: bot.status,
        ip: bot.connection.ip
      }))
    };
  }
}

module.exports = BotSystem;
