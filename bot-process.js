#!/usr/bin/env node

const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const { GoalNear } = require('mineflayer-pathfinder').goals;
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// Parse arguments
const botId = process.argv[2];
const configData = JSON.parse(process.argv[3]);

// Extract configuration
const botConfig = configData.bot;
const systemConfig = configData.config;
const serverConfig = configData.server;
const session = configData.session;

console.log(`🤖 Bot ${botConfig.account.username} starting...`);

// Bot state
let bot = null;
let isConnected = false;
let lastActivity = Date.now();
let activityInterval = null;
let securityCheckInterval = null;
let learningData = [];
let suspicionLevel = 0;

// Behavior patterns
const behavior = botConfig.behavior;
const personality = behavior.personality;
const pattern = behavior.pattern;

// Metrics
let metrics = {
  startTime: Date.now(),
  messagesSent: 0,
  actionsTaken: 0,
  distanceTraveled: 0,
  itemsCollected: 0,
  deaths: 0,
  successes: 0,
  failures: 0
};

// Process communication
function sendToParent(type, data) {
  if (process.send) {
    process.send({ type, ...data });
  }
}

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  console.log(logMessage);
  
  // Send to parent for dashboard
  if (level === 'error' || level === 'warn') {
    sendToParent(level, { message });
  }
}

// Create bot instance
function createBot() {
  const options = {
    host: serverConfig.host,
    port: serverConfig.port,
    username: botConfig.account.username,
    version: serverConfig.version,
    auth: serverConfig.auth
  };
  
  // Add proxy if configured
  if (botConfig.proxy && systemConfig.network.useProxies) {
    options.proxy = {
      host: botConfig.proxy.ip,
      port: botConfig.proxy.port,
      protocol: botConfig.proxy.protocol
    };
    log(`Using proxy: ${botConfig.proxy.ip}:${botConfig.proxy.port}`);
  }
  
  bot = mineflayer.createBot(options);
  
  // Load pathfinder plugin
  bot.loadPlugin(pathfinder);
  
  setupEventHandlers();
  setupBehaviors();
  
  return bot;
}

function setupEventHandlers() {
  // Connection events
  bot.on('login', () => {
    log(`Logged in as ${bot.username}`);
    isConnected = true;
    
    // Send connected message to parent
    sendToParent('connected', {
      health: bot.health,
      food: bot.food,
      position: bot.entity.position,
      dimension: bot.game.dimension
    });
  });
  
  bot.on('spawn', () => {
    log('Spawned in world');
    
    // Start activity loop
    startActivityLoop();
    
    // Start security monitoring
    startSecurityMonitoring();
    
    // Start learning system
    startLearningSystem();
  });
  
  bot.on('death', () => {
    log('Bot died');
    metrics.deaths++;
    sendToParent('activity', { activity: 'died' });
  });
  
  bot.on('kicked', (reason) => {
    log(`Kicked: ${reason}`, 'warn');
    handleDisconnect('kicked');
  });
  
  bot.on('error', (err) => {
    log(`Error: ${err.message}`, 'error');
    sendToParent('error', { error: err.message, errorType: 'bot_error' });
  });
  
  bot.on('end', (reason) => {
    log(`Disconnected: ${reason}`);
    handleDisconnect(reason || 'unknown');
  });
  
  // Chat events
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    
    // Random chance to respond
    if (Math.random() < pattern.chat.frequency) {
      setTimeout(() => {
        respondToChat(username, message);
      }, 1000 + Math.random() * 3000);
    }
    
    // Update security
    updateSuspicion('chat_received', 1);
  });
  
  // Health events
  bot.on('health', () => {
    if (bot.health < 10) {
      // Take evasive action if health is low
      takeEvasiveAction();
    }
    
    // Send metrics update
    sendMetricsUpdate();
  });
  
  // Entity events
  bot.on('entityHurt', (entity) => {
    if (entity === bot.entity) {
      updateSuspicion('damage_taken', 5);
    }
  });
}

function setupBehaviors() {
  // Natural movement patterns
  if (systemConfig.behavior.naturalMovement) {
    setupNaturalMovement();
  }
  
  // Chat behavior
  if (systemConfig.behavior.realisticChat) {
    setupChatBehavior();
  }
  
  // AI decision making
  if (systemConfig.ai.neuralNetworks) {
    setupNeuralDecisionMaking();
  }
}

function setupNaturalMovement() {
  // Random movement pattern based on bot type
  const movementPattern = pattern.movement;
  
  setInterval(() => {
    if (!isConnected || !bot.entity) return;
    
    // Only move occasionally
    if (Math.random() > movementPattern.speed) return;
    
    const currentPos = bot.entity.position;
    
    // Calculate new position based on pattern
    let newX, newY, newZ;
    
    switch (movementPattern.tendency) {
      case 'circular':
        const angle = Math.random() * Math.PI * 2;
        const radius = movementPattern.radius * (0.5 + Math.random());
        newX = currentPos.x + Math.cos(angle) * radius;
        newZ = currentPos.z + Math.sin(angle) * radius;
        newY = currentPos.y;
        break;
        
      case 'linear':
        newX = currentPos.x + (Math.random() - 0.5) * movementPattern.radius * 2;
        newZ = currentPos.z + (Math.random() - 0.5) * movementPattern.radius * 2;
        newY = currentPos.y;
        break;
        
      case 'grid':
        newX = currentPos.x + (Math.random() > 0.5 ? movementPattern.radius : -movementPattern.radius);
        newZ = currentPos.z + (Math.random() > 0.5 ? movementPattern.radius : -movementPattern.radius);
        newY = currentPos.y;
        break;
        
      default: // random
        newX = currentPos.x + (Math.random() - 0.5) * movementPattern.radius;
        newZ = currentPos.z + (Math.random() - 0.5) * movementPattern.radius;
        newY = currentPos.y;
    }
    
    // Add randomness
    newX += (Math.random() - 0.5) * movementPattern.randomness * 10;
    newZ += (Math.random() - 0.5) * movementPattern.randomness * 10;
    
    // Move to new position
    const goal = new GoalNear(newX, newY, newZ, 1);
    bot.pathfinder.setGoal(goal);
    
    metrics.distanceTraveled += Math.sqrt(
      Math.pow(newX - currentPos.x, 2) + 
      Math.pow(newZ - currentPos.z, 2)
    );
    
    sendToParent('activity', { activity: 'moving' });
  }, 1000);
}

function setupChatBehavior() {
  const chatPattern = pattern.chat;
  
  setInterval(() => {
    if (!isConnected) return;
    
    // Random chance to say something
    if (Math.random() < chatPattern.frequency * personality.social) {
      const topic = chatPattern.topics[Math.floor(Math.random() * chatPattern.topics.length)];
      const message = generateChatMessage(topic);
      
      bot.chat(message);
      metrics.messagesSent++;
      
      sendToParent('chat', { 
        message, 
        target: 'all',
        chatType: 'random'
      });
      
      updateSuspicion('chat_sent', 2);
    }
  }, 30000 + Math.random() * 60000); // Every 30-90 seconds
}

function generateChatMessage(topic) {
  const messages = {
    building: [
      'I love building structures!',
      'Anyone want to help build?',
      'Check out my latest build!',
      'Need building materials?'
    ],
    design: [
      'The architecture here is amazing!',
      'I have some design ideas...',
      'Love the aesthetic!'
    ],
    materials: [
      'Anyone have spare wood?',
      'I found some great resources!',
      'Trading materials?'
    ],
    discoveries: [
      'Found an amazing cave!',
      'Check out this view!',
      'Discovered a new biome!'
    ],
    locations: [
      'The spawn area is beautiful!',
      'Anyone know a good mining spot?',
      'Great location for a base!'
    ],
    resources: [
      'Found diamonds!',
      'Need some iron?',
      'Resources are plentiful here!'
    ],
    ores: [
      'Mining is going well!',
      'Found a vein of coal!',
      'Anyone need ores?'
    ],
    tools: [
      'My pickaxe is almost broken!',
      'Crafted a new sword!',
      'Tools are important!'
    ],
    depth: [
      'Going deep mining!',
      'The lower levels are dangerous!',
      'Found lava at Y=-54!'
    ],
    greetings: [
      'Hello everyone!',
      'How is everyone doing?',
      'Nice to see you all!'
    ],
    help: [
      'Need any help?',
      'I can assist with that!',
      'Let me know if you need anything!'
    ],
    events: [
      'Anyone want to do an event?',
      'Let\'s organize something!',
      'Great server event!'
    ]
  };
  
  const topicMessages = messages[topic] || ['Hello!'];
  return topicMessages[Math.floor(Math.random() * topicMessages.length)];
}

function respondToChat(username, message) {
  const responses = {
    hello: ['Hi!', 'Hello!', 'Hey there!'],
    help: ['I can help!', 'What do you need?', 'Sure!'],
    thanks: ['You\'re welcome!', 'No problem!', 'Anytime!'],
    default: ['Nice!', 'Interesting!', 'Cool!']
  };
  
  let responseType = 'default';
  
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    responseType = 'hello';
  } else if (message.toLowerCase().includes('help')) {
    responseType = 'help';
  } else if (message.toLowerCase().includes('thank')) {
    responseType = 'thanks';
  }
  
  const response = responses[responseType][Math.floor(Math.random() * responses[responseType].length)];
  bot.chat(response);
  metrics.messagesSent++;
  
  sendToParent('chat', {
    message: response,
    target: username,
    chatType: 'response'
  });
}

function setupNeuralDecisionMaking() {
  // Simple neural decision making simulation
  setInterval(() => {
    if (!isConnected) return;
    
    // Make decisions based on personality and situation
    const decisions = [
      { action: 'explore', weight: personality.explore },
      { action: 'build', weight: personality.build },
      { action: 'mine', weight: personality.build * 0.8 }, // Builders also mine
      { action: 'social', weight: personality.social },
      { action: 'rest', weight: 0.3 }
    ];
    
    // Add randomness
    decisions.forEach(d => d.weight += Math.random() * 0.2 - 0.1);
    
    // Select highest weight decision
    const decision = decisions.reduce((best, current) => 
      current.weight > best.weight ? current : best
    );
    
    // Execute decision
    executeDecision(decision.action);
    
    // Learn from outcome
    learnFromDecision(decision.action, Math.random() > 0.3); // 70% success rate
    
  }, 60000 + Math.random() * 120000); // Every 1-3 minutes
}

function executeDecision(action) {
  switch (action) {
    case 'explore':
      exploreArea();
      break;
    case 'build':
      attemptBuild();
      break;
    case 'mine':
      attemptMining();
      break;
    case 'social':
      initiateSocial();
      break;
    case 'rest':
      takeBreak();
      break;
  }
  
  sendToParent('activity', { activity: action });
}

function exploreArea() {
  if (!bot.entity) return;
  
  const currentPos = bot.entity.position;
  const radius = pattern.movement.radius;
  
  const goalX = currentPos.x + (Math.random() - 0.5) * radius * 2;
  const goalZ = currentPos.z + (Math.random() - 0.5) * radius * 2;
  const goalY = currentPos.y;
  
  const goal = new GoalNear(goalX, goalY, goalZ, 2);
  bot.pathfinder.setGoal(goal);
  
  log('Exploring area');
}

function attemptBuild() {
  if (!bot.entity) return;
  
  // Simple building simulation
  const buildMessages = [
    'Building a small house',
    'Creating a garden',
    'Working on a structure',
    'Decorating my base'
  ];
  
  const message = buildMessages[Math.floor(Math.random() * buildMessages.length)];
  log(message);
  
  // Simulate building time
  setTimeout(() => {
    metrics.successes++;
    sendToParent('learning', {
      experienceType: 'building',
      learned: 'improved_building_skill',
      success: true
    });
  }, 5000 + Math.random() * 10000);
}

function attemptMining() {
  if (!bot.entity) return;
  
  // Mining simulation
  log('Going mining');
  
  // Look for blocks to mine
  const block = bot.findBlock({
    point: bot.entity.position,
    maxDistance: 10,
    matching: (block) => {
      return block && block.name.includes('ore');
    }
  });
  
  if (block) {
    // Mine the block
    bot.dig(block, (err) => {
      if (!err) {
        metrics.itemsCollected++;
        metrics.successes++;
        
        sendToParent('learning', {
          experienceType: 'mining',
          learned: 'found_resources',
          success: true
        });
      }
    });
  }
}

function initiateSocial() {
  // Social interaction
  const socialActions = [
    'Looking for players to chat with',
    'Organizing a gathering',
    'Offering help to others',
    'Trading items'
  ];
  
  const action = socialActions[Math.floor(Math.random() * socialActions.length)];
  log(action);
  
  // Random chat
  if (Math.random() < 0.7) {
    const messages = [
      'Anyone want to chat?',
      'How is everyone?',
      'Great server!',
      'Having fun!'
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    bot.chat(message);
    metrics.messagesSent++;
  }
}

function takeBreak() {
  log('Taking a break');
  // Do nothing for a while
  sendToParent('activity', { activity: 'resting' });
}

function learnFromDecision(action, success) {
  const experience = {
    action,
    success,
    timestamp: Date.now(),
    context: {
      health: bot.health,
      food: bot.food,
      position: bot.entity ? bot.entity.position : null
    }
  };
  
  learningData.push(experience);
  
  // Keep only recent experiences
  if (learningData.length > 20) {
    learningData = learningData.slice(-20);
  }
  
  sendToParent('learning', {
    experienceType: 'decision',
    data: experience,
    learned: success ? 'successful_action' : 'failed_action',
    success: success
  });
}

function startActivityLoop() {
  if (activityInterval) clearInterval(activityInterval);
  
  activityInterval = setInterval(() => {
    if (!isConnected) return;
    
    // Random activity based on bot type
    const activities = getBotActivities();
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    executeActivity(activity);
    
    lastActivity = Date.now();
    
  }, 30000 + Math.random() * 60000); // Every 30-90 seconds
}

function getBotActivities() {
  const activities = {
    builder: [
      'gathering_materials',
      'building_structure',
      'planning_design',
      'decorating'
    ],
    explorer: [
      'mapping_area',
      'cave_exploring',
      'finding_resources',
      'discovering_biomes'
    ],
    miner: [
      'strip_mining',
      'cave_mining',
      'ore_processing',
      'resource_organizing'
    ],
    socializer: [
      'chatting',
      'helping_others',
      'trading',
      'organizing'
    ]
  };
  
  return activities[botConfig.type] || activities.builder;
}

function executeActivity(activity) {
  switch (activity) {
    case 'gathering_materials':
      gatherMaterials();
      break;
    case 'building_structure':
      buildStructure();
      break;
    case 'mapping_area':
      mapArea();
      break;
    case 'cave_exploring':
      exploreCave();
      break;
    case 'strip_mining':
      stripMine();
      break;
    case 'chatting':
      initiateChat();
      break;
    case 'helping_others':
      offerHelp();
      break;
  }
  
  sendToParent('activity', { activity });
  metrics.actionsTaken++;
}

function gatherMaterials() {
  log('Gathering building materials');
  // Simulate material gathering
  setTimeout(() => {
    metrics.itemsCollected += Math.floor(Math.random() * 5) + 1;
  }, 3000);
}

function buildStructure() {
  log('Building a structure');
  // Building simulation
}

function mapArea() {
  log('Mapping the area');
  exploreArea();
}

function exploreCave() {
  log('Exploring caves');
  // Look for cave entrances
}

function stripMine() {
  log('Strip mining');
  attemptMining();
}

function initiateChat() {
  const greetings = [
    'Hello everyone!',
    'How is the server today?',
    'Great weather in-game!',
    'Anyone need help?'
  ];
  
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  bot.chat(greeting);
  metrics.messagesSent++;
}

function offerHelp() {
  bot.chat('I can help with building or resources if anyone needs!');
  metrics.messagesSent++;
}

function takeEvasiveAction() {
  log('Health low, taking evasive action!');
  
  // Move away from danger
  if (bot.entity) {
    const currentPos = bot.entity.position;
    const safeX = currentPos.x + (Math.random() - 0.5) * 20;
    const safeZ = currentPos.z + (Math.random() - 0.5) * 20;
    
    const goal = new GoalNear(safeX, currentPos.y, safeZ, 2);
    bot.pathfinder.setGoal(goal);
  }
  
  // Eat food if available
  const foodItems = ['bread', 'apple', 'cooked_beef', 'cooked_porkchop'];
  for (const item of foodItems) {
    const food = bot.inventory.items().find(i => i.name.includes(item));
    if (food) {
      bot.equip(food, 'hand');
      bot.consume();
      break;
    }
  }
}

function startSecurityMonitoring() {
  if (securityCheckInterval) clearInterval(securityCheckInterval);
  
  securityCheckInterval = setInterval(() => {
    // Check for suspicious patterns
    checkForSuspiciousActivity();
    
    // Send security update
    sendToParent('security', {
      suspicionLevel: suspicionLevel,
      event: 'periodic_check'
    });
    
    // Natural suspicion decay
    if (suspicionLevel > 0) {
      suspicionLevel = Math.max(0, suspicionLevel - 1);
    }
    
  }, 60000); // Every minute
}

function checkForSuspiciousActivity() {
  // Check message rate
  const recentMessages = metrics.messagesSent;
  if (recentMessages > 20) { // Too many messages
    updateSuspicion('high_message_rate', 10);
  }
  
  // Check movement patterns
  if (metrics.distanceTraveled > 1000) { // Too much movement
    updateSuspicion('excessive_movement', 5);
  }
  
  // Check activity timing
  const timeSinceLastActivity = Date.now() - lastActivity;
  if (timeSinceLastActivity > 300000) { // 5 minutes no activity
    updateSuspicion('inactivity', 3);
  }
  
  // Random detection chance (simulating anti-cheat)
  if (Math.random() < 0.01) { // 1% chance
    updateSuspicion('random_detection', 15);
  }
}

function updateSuspicion(reason, amount) {
  suspicionLevel = Math.min(100, suspicionLevel + amount);
  
  log(`Suspicion increased: ${reason} (+${amount}) = ${suspicionLevel}`);
  
  if (suspicionLevel > 50) {
    log('High suspicion level! Applying countermeasures...', 'warn');
    applyCountermeasures();
  }
}

function applyCountermeasures() {
  const countermeasures = [
    'change_behavior',
    'introduce_delay',
    'simulate_human_error',
    'reduce_activity'
  ];
  
  const countermeasure = countermeasures[Math.floor(Math.random() * countermeasures.length)];
  
  switch (countermeasure) {
    case 'change_behavior':
      // Change to different activity
      const activities = getBotActivities();
      const newActivity = activities[Math.floor(Math.random() * activities.length)];
      executeActivity(newActivity);
      log('Changed behavior to: ' + newActivity);
      break;
      
    case 'introduce_delay':
      // Take a break
      const delay = 5000 + Math.random() * 10000;
      log(`Introducing delay: ${Math.round(delay/1000)}s`);
      setTimeout(() => {
        log('Delay complete, resuming activities');
      }, delay);
      break;
      
    case 'simulate_human_error':
      // Make a mistake
      const errors = [
        'Oops, I made a mistake!',
        'That didn\'t work as planned...',
        'Let me try that again',
        'My bad!'
      ];
      const errorMsg = errors[Math.floor(Math.random() * errors.length)];
      bot.chat(errorMsg);
      log('Simulated human error: ' + errorMsg);
      break;
      
    case 'reduce_activity':
      // Reduce activity level
      if (activityInterval) {
        clearInterval(activityInterval);
        // Restart with longer interval
        setTimeout(() => {
          startActivityLoop();
        }, 30000);
      }
      log('Reduced activity level');
      break;
  }
  
  // Reset suspicion after countermeasure
  suspicionLevel = Math.max(0, suspicionLevel - 30);
}

function startLearningSystem() {
  // Periodic learning updates
  setInterval(() => {
    if (learningData.length > 5) {
      const successRate = learningData.filter(e => e.success).length / learningData.length;
      
      sendToParent('learning', {
        experienceType: 'summary',
        data: {
          totalExperiences: learningData.length,
          successRate: successRate,
          recentActions: learningData.slice(-3)
        },
        learned: 'updated_success_rate'
      });
    }
  }, 300000); // Every 5 minutes
}

function sendMetricsUpdate() {
  const position = bot.entity ? bot.entity.position : null;
  
  sendToParent('metrics', {
    position: position,
    health: bot.health,
    food: bot.food,
    metrics: metrics
  });
}

function handleDisconnect(reason) {
  isConnected = false;
  
  // Clean up intervals
  if (activityInterval) clearInterval(activityInterval);
  if (securityCheckInterval) clearInterval(securityCheckInterval);
  
  // Send disconnect message
  sendToParent('disconnected', {
    reason: reason,
    metrics: metrics,
    learningData: learningData.length,
    suspicionLevel: suspicionLevel
  });
  
  // Exit process after delay
  setTimeout(() => {
    process.exit(0);
  }, 5000);
}

// Handle parent messages
process.on('message', (message) => {
  if (!bot || !isConnected) return;
  
  switch (message.type) {
    case 'break_pattern':
      applyCountermeasures();
      log('Pattern break requested by parent');
      break;
      
    case 'introduce_delay':
      const delay = message.duration || 5000;
      log(`Introducing delay: ${Math.round(delay/1000)}s`);
      // Pause activities
      if (activityInterval) clearInterval(activityInterval);
      setTimeout(() => {
        startActivityLoop();
        log('Delay complete');
      }, delay);
      break;
      
    case 'change_activity':
      executeActivity(message.activity || 'resting');
      log(`Activity changed to: ${message.activity}`);
      break;
      
    case 'simulate_error':
      const errors = ['network', 'client', 'server'];
      const errorType = message.errorType || errors[Math.floor(Math.random() * errors.length)];
      log(`Simulating ${errorType} error`);
      // Could simulate disconnection here
      break;
      
    case 'natural_event':
      handleNaturalEvent(message.event, message.data);
      break;
  }
});

function handleNaturalEvent(event, data) {
  switch (event) {
    case 'weather_change':
      log(`Weather changed to: ${data.weather}`);
      if (data.weather === 'rain') {
        bot.chat('It\'s raining!');
      } else if (data.weather === 'thunder') {
        bot.chat('Thunderstorm! Be careful!');
      }
      break;
      
    case 'time_passage':
      log(`Time advanced to: ${data.time}`);
      break;
      
    case 'environment_event':
      log(`Environment event: ${data.event}`);
      if (data.event === 'animal_spawn') {
        bot.chat('Look at all these animals!');
      }
      break;
      
    case 'social_interaction':
      log('Social interaction opportunity');
      initiateSocial();
      break;
  }
}

// Handle process termination
process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down...');
  if (bot) {
    bot.quit('Shutting down');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  log('Received SIGINT, shutting down...');
  if (bot) {
    bot.quit('Interrupted');
  }
  process.exit(0);
});

// Start the bot
try {
  createBot();
} catch (error) {
  log(`Failed to create bot: ${error.message}`, 'error');
  sendToParent('error', { error: error.message, errorType: 'creation_failed' });
  process.exit(1);
}
