const mineflayer = require('mineflayer');

console.log(`
╔══════════════════════════════════════════════════════════╗
║   🚀 MINECRAFT BOT SYSTEM - ANTI-THROTTLING MODE       ║
║   ⚡ Smart Connection • No Errors • Auto-Retry         ║
╚══════════════════════════════════════════════════════════╝
`);

// Configuration
const CONFIG = {
  SERVER: {
    host: 'gameplannet.aternos.me',
    port: 43658,
    version: '1.21.10'
  },
  BOTS: [
    { 
      name: 'Agent007', 
      type: 'agent',
      skinUrl: 'https://mc-heads.net/avatar/MHF_Steve'
    },
    { 
      name: 'CroptonMiner', 
      type: 'cropton',
      skinUrl: 'https://mc-heads.net/avatar/MHF_Alex'
    }
  ],
  // Anti-throttling settings
  CONNECTION: {
    initialDelay: 60000, // Wait 60 seconds before first connection
    betweenBots: 45000,  // 45 seconds between bots
    reconnectDelay: 90000, // 90 seconds before reconnection attempts
    maxRetries: 3,
    randomizeDelay: true
  }
};

// Global state
const activeBots = new Map();
const connectionQueue = [];
let isConnecting = false;
let connectionAttempts = {};

// Logging system
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    error: '❌',
    success: '✅', 
    warning: '⚠️',
    info: 'ℹ️',
    debug: '🐛'
  }[type] || 'ℹ️';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// Parse wait time from kick message
function parseWaitTime(kickMessage) {
  const match = kickMessage.match(/wait (\d+) seconds/);
  return match ? parseInt(match[1]) * 1000 : 60000; // Default 60 seconds
}

// Schedule bot connection with anti-throttling
async function scheduleBotConnection(botConfig, delay = 0) {
  const botName = botConfig.name;
  
  if (!connectionAttempts[botName]) {
    connectionAttempts[botName] = 0;
  }
  
  connectionAttempts[botName]++;
  
  if (connectionAttempts[botName] > CONFIG.CONNECTION.maxRetries) {
    log(`Max retries (${CONFIG.CONNECTION.maxRetries}) reached for ${botName}. Waiting 5 minutes...`, 'warning');
    setTimeout(() => {
      connectionAttempts[botName] = 0;
      scheduleBotConnection(botConfig, 300000); // 5 minutes
    }, 300000);
    return;
  }
  
  setTimeout(async () => {
    await connectBot(botConfig);
  }, delay);
}

// Connect bot with error handling
async function connectBot(botConfig) {
  const { name, type, skinUrl } = botConfig;
  
  log(`Attempting to connect ${name} (${type})...`);
  
  if (activeBots.has(name) && activeBots.get(name).status === 'connected') {
    log(`${name} is already connected`, 'warning');
    return;
  }
  
  try {
    const bot = mineflayer.createBot({
      host: CONFIG.SERVER.host,
      port: CONFIG.SERVER.port,
      username: name,
      version: CONFIG.SERVER.version,
      auth: 'offline',
      viewDistance: 'tiny',
      colorsEnabled: false,
      defaultChatPatterns: false,
      hideErrors: true
    });
    
    // Store bot data
    const botData = {
      name,
      type,
      instance: bot,
      status: 'connecting',
      health: 20,
      food: 20,
      position: null,
      activity: 'Connecting...',
      intervals: [],
      stats: {
        messages: 0,
        mined: 0,
        kills: 0,
        connectedAt: Date.now(),
        connectionAttempts: connectionAttempts[name] || 0
      },
      metadata: {
        skinUrl,
        lastChat: 0
      }
    };
    
    activeBots.set(name, botData);
    
    // Setup event handlers
    setupBotEvents(botData);
    
  } catch (error) {
    log(`Failed to create bot ${name}: ${error.message}`, 'error');
    scheduleBotConnection(botConfig, CONFIG.CONNECTION.reconnectDelay);
  }
}

// Setup bot event handlers
function setupBotEvents(botData) {
  const { instance: bot, name } = botData;
  
  bot.on('login', () => {
    log(`${name} logging in...`);
  });
  
  bot.on('spawn', () => {
    botData.status = 'connected';
    botData.activity = 'Spawned';
    botData.stats.connectedAt = Date.now();
    connectionAttempts[name] = 0; // Reset attempts on success
    
    log(`✅ ${name} successfully connected and spawned!`, 'success');
    
    // Wait 5 seconds before starting activities
    setTimeout(() => {
      startBotActivities(botData);
    }, 5000);
  });
  
  bot.on('health', () => {
    botData.health = bot.health;
    botData.food = bot.food;
  });
  
  bot.on('move', () => {
    if (bot.entity) {
      botData.position = {
        x: Math.floor(bot.entity.position.x),
        y: Math.floor(bot.entity.position.y),
        z: Math.floor(bot.entity.position.z)
      };
    }
  });
  
  bot.on('chat', (username, message) => {
    if (username === name) return;
    
    const now = Date.now();
    if (now - botData.metadata.lastChat < 5000) return; // Rate limit
    
    log(`💬 ${username}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
    
    // Auto-response (15% chance, only if not spamming)
    if (Math.random() < 0.15 && now - botData.metadata.lastChat > 10000) {
      setTimeout(() => {
        if (bot.player && botData.status === 'connected') {
          const response = getBotResponse(botData.type, message, username, name);
          if (response) {
            bot.chat(response);
            botData.stats.messages++;
            botData.metadata.lastChat = now;
            log(`🤖 ${name}: ${response}`);
          }
        }
      }, 2000 + Math.random() * 3000);
    }
  });
  
  bot.on('death', () => {
    log(`💀 ${name} died`, 'warning');
    botData.health = 20;
  });
  
  bot.on('error', (err) => {
    log(`Error (${name}): ${err.message}`, 'error');
    botData.status = 'error';
  });
  
  bot.on('kicked', (reason) => {
    log(`🚫 ${name} kicked: ${JSON.stringify(reason)}`, 'warning');
    botData.status = 'kicked';
    cleanupBot(botData);
    
    // Parse wait time from kick message
    const waitTime = parseWaitTime(reason);
    const extraDelay = CONFIG.CONNECTION.randomizeDelay ? 
      Math.random() * 30000 : 0;
    
    log(`⏳ ${name} will retry in ${Math.round((waitTime + extraDelay) / 1000)} seconds`);
    
    scheduleBotConnection(
      { name, type: botData.type, skinUrl: botData.metadata.skinUrl },
      waitTime + extraDelay
    );
  });
  
  bot.on('end', () => {
    log(`🔌 ${name} disconnected`, 'warning');
    botData.status = 'disconnected';
    cleanupBot(botData);
    
    // Schedule reconnection
    scheduleBotConnection(
      { name, type: botData.type, skinUrl: botData.metadata.skinUrl },
      CONFIG.CONNECTION.reconnectDelay + Math.random() * 30000
    );
  });
}

// Fixed getBotResponse function
function getBotResponse(botType, message, sender, botName) {
  const responses = {
    agent: [
      'Mission underway.',
      'Area secure.',
      'Copy that.',
      'Proceeding as planned.',
      'Affirmative.',
      'All clear.',
      'Reporting in.',
      'Surveillance active.',
      'Roger that.',
      'Target acquired.'
    ],
    cropton: [
      'Found some diamonds!',
      'Mining in progress.',
      'Strike the earth!',
      'Deep underground.',
      'Need more torches.',
      'Rich ore vein here!',
      'Tunnel expanding.',
      'Found some iron!',
      'Digging deep!',
      'Mining expedition!'
    ]
  };
  
  const botResponses = responses[botType] || ['Hello!'];
  
  // Check if bot is mentioned (using botName parameter, not undefined 'name')
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes(botName.toLowerCase()) || 
      lowerMessage.includes(botType) ||
      lowerMessage.includes('bot')) {
    const directResponses = [
      `Yes ${sender}?`,
      `What do you need ${sender}?`,
      `I'm here ${sender}.`,
      `Listening ${sender}.`,
      `Yes?`,
      `What's up ${sender}?`
    ];
    return directResponses[Math.floor(Math.random() * directResponses.length)];
  }
  
  // Question response
  if (message.includes('?')) {
    const answers = [
      'Good question.',
      'I think so.',
      'Not sure about that.',
      'Probably.',
      'Maybe.',
      'Let me check.',
      'Interesting question.',
      'I wonder that too.'
    ];
    return answers[Math.floor(Math.random() * answers.length)];
  }
  
  // Random response (50% chance)
  if (Math.random() < 0.5) {
    return botResponses[Math.floor(Math.random() * botResponses.length)];
  }
  
  return null;
}

// Start bot activities
function startBotActivities(botData) {
  if (!botData.instance || botData.status !== 'connected') return;
  
  // Clear existing intervals
  cleanupBotIntervals(botData);
  
  const bot = botData.instance;
  
  // Main activity loop
  const activityInterval = setInterval(() => {
    if (!bot || botData.status !== 'connected') {
      clearInterval(activityInterval);
      return;
    }
    
    const activity = getRandomActivity(botData.type);
    botData.activity = activity;
    
    try {
      executeActivity(botData, activity);
    } catch (error) {
      // Silent fail for activity errors
    }
    
  }, 15000 + Math.random() * 15000); // 15-30 seconds
  
  botData.intervals.push(activityInterval);
  
  // Anti-AFK system
  const afkInterval = setInterval(() => {
    if (bot && botData.status === 'connected') {
      antiAFKMovement(botData);
    }
  }, 60000 + Math.random() * 60000); // 60-120 seconds
  
  botData.intervals.push(afkInterval);
  
  // Random chat messages
  const chatInterval = setInterval(() => {
    if (bot && botData.status === 'connected' && Math.random() < 0.2) {
      sendRandomChat(botData);
    }
  }, 120000 + Math.random() * 120000); // 2-4 minutes
  
  botData.intervals.push(chatInterval);
}

// Get random activity
function getRandomActivity(botType) {
  const activities = {
    agent: ['exploring', 'surveillance', 'patrolling', 'observing', 'scouting', 'guarding'],
    cropton: ['mining', 'digging', 'resource gathering', 'tunnel digging', 'ore hunting', 'cave exploring']
  };
  
  const botActivities = activities[botType] || ['exploring'];
  return botActivities[Math.floor(Math.random() * botActivities.length)];
}

// Execute activity
function executeActivity(botData, activity) {
  const bot = botData.instance;
  if (!bot) return;
  
  try {
    switch (activity) {
      case 'mining':
      case 'digging':
      case 'tunnel digging':
        bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
        break;
        
      case 'exploring':
      case 'patrolling':
      case 'scouting':
        const directions = ['forward', 'back', 'left', 'right'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        bot.setControlState(direction, true);
        
        setTimeout(() => {
          if (bot) bot.setControlState(direction, false);
        }, 1000 + Math.random() * 2000);
        
        bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
        break;
        
      default:
        bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    }
  } catch (error) {
    // Activity error - ignore
  }
}

// Anti-AFK movement
function antiAFKMovement(botData) {
  const bot = botData.instance;
  if (!bot) return;
  
  const actions = [
    () => {
      bot.setControlState('jump', true);
      setTimeout(() => {
        if (bot) bot.setControlState('jump', false);
      }, 200);
    },
    () => {
      bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    }
  ];
  
  const action = actions[Math.floor(Math.random() * actions.length)];
  action();
}

// Send random chat
function sendRandomChat(botData) {
  const bot = botData.instance;
  if (!bot || botData.status !== 'connected') return;
  
  const now = Date.now();
  if (now - botData.metadata.lastChat < 30000) return; // 30 second cooldown
  
  const messages = {
    agent: [
      'Mission accomplished.',
      'All clear.',
      'Reporting in.',
      'Area secure.',
      'Proceeding as planned.',
      'Surveillance ongoing.'
    ],
    cropton: [
      'Found some ores!',
      'Mining in progress.',
      'Deep underground.',
      'Strike the earth!',
      'Rich minerals here!',
      'Tunnel expanding.'
    ]
  };
  
  const msgList = messages[botData.type] || ['Hello!'];
  const message = msgList[Math.floor(Math.random() * msgList.length)];
  
  bot.chat(message);
  botData.stats.messages++;
  botData.metadata.lastChat = now;
  log(`💬 ${botData.name}: ${message}`);
}

// Cleanup bot intervals
function cleanupBotIntervals(botData) {
  if (botData.intervals && botData.intervals.length > 0) {
    botData.intervals.forEach(interval => {
      try {
        clearInterval(interval);
      } catch (error) {
        // Ignore interval clearing errors
      }
    });
    botData.intervals = [];
  }
}

// Cleanup bot
function cleanupBot(botData) {
  cleanupBotIntervals(botData);
  
  if (botData.instance) {
    try {
      botData.instance.quit();
    } catch (error) {
      // Ignore quit errors
    }
    botData.instance = null;
  }
}

// Start all bots with anti-throttling
async function startAllBots() {
  log('='.repeat(60));
  log('🚀 STARTING BOTS WITH ANTI-THROTTLING');
  log('='.repeat(60));
  log(`🌐 Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`);
  log(`🤖 Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`);
  log(`⏳ Initial delay: ${CONFIG.CONNECTION.initialDelay / 1000} seconds`);
  log(`⏳ Between bots: ${CONFIG.CONNECTION.betweenBots / 1000} seconds`);
  log('='.repeat(60));
  
  // Wait initial delay
  log(`⏳ Waiting ${CONFIG.CONNECTION.initialDelay / 1000} seconds before first connection...`);
  await sleep(CONFIG.CONNECTION.initialDelay);
  
  // Start bots with delays
  for (let i = 0; i < CONFIG.BOTS.length; i++) {
    const botConfig = CONFIG.BOTS[i];
    const delay = i * CONFIG.CONNECTION.betweenBots;
    
    if (delay > 0) {
      log(`⏳ Waiting ${delay / 1000} seconds before next bot...`);
      await sleep(delay);
    }
    
    await scheduleBotConnection(botConfig, 0);
  }
  
  log('✅ All bots scheduled for connection!');
  log('📊 Status monitor starting...');
  log('='.repeat(60));
}

// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Display status periodically
function startStatusMonitor() {
  setInterval(() => {
    const connectedBots = Array.from(activeBots.values())
      .filter(b => b.status === 'connected');
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 BOT STATUS - ' + new Date().toLocaleTimeString());
    console.log('='.repeat(60));
    
    if (connectedBots.length === 0) {
      console.log('No bots currently connected');
      console.log('Bots will auto-reconnect with anti-throttling');
    } else {
      console.log(`Connected: ${connectedBots.length} bot(s)`);
      
      connectedBots.forEach(bot => {
        const uptime = Math.floor((Date.now() - bot.stats.connectedAt) / 1000);
        const minutes = Math.floor(uptime / 60);
        const seconds = uptime % 60;
        
        console.log(`\n${bot.name} (${bot.type})`);
        console.log(`  Status: ${bot.status} | Health: ${bot.health}/20`);
        console.log(`  Activity: ${bot.activity}`);
        console.log(`  Uptime: ${minutes}m ${seconds}s | Messages: ${bot.stats.messages}`);
        console.log(`  Position: ${bot.position ? `${bot.position.x}, ${bot.position.y}, ${bot.position.z}` : 'Unknown'}`);
      });
    }
    
    // Show queued connections
    const queued = Object.entries(connectionAttempts)
      .filter(([name, attempts]) => attempts > 0 && 
        (!activeBots.has(name) || activeBots.get(name).status !== 'connected'))
      .map(([name, attempts]) => `${name} (${attempts} attempts)`);
    
    if (queued.length > 0) {
      console.log('\n🔄 Queued/Retrying: ' + queued.join(', '));
    }
    
    console.log('\n' + '='.repeat(60));
  }, 45000); // Every 45 seconds
}

// Minimal HTTP server for Render.com
function startMinimalServer() {
  const http = require('http');
  
  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/status') {
      const connectedBots = Array.from(activeBots.values())
        .filter(b => b.status === 'connected');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Minecraft Bots - Anti-Throttling Mode</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: monospace; background: #0a0a0a; color: #0f0; padding: 20px; }
            .status { background: #1a1a1a; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .connected { border-left: 5px solid #0f0; }
            .connecting { border-left: 5px solid #ff0; }
            .disconnected { border-left: 5px solid #f00; }
          </style>
        </head>
        <body>
          <h1>🤖 Minecraft Bot System - ANTI-THROTTLING MODE</h1>
          <p>Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}</p>
          <p>Connected Bots: ${connectedBots.length}</p>
          <p>Mode: Anti-Throttling Active (Smart Connection Timing)</p>
          <hr>
          <h3>Bot Status:</h3>
          ${Array.from(activeBots.values()).map(bot => `
            <div class="status ${bot.status}">
              <strong>${bot.name} (${bot.type}) - ${bot.status.toUpperCase()}</strong><br>
              Health: ${bot.health}/20 | Activity: ${bot.activity}<br>
              Messages: ${bot.stats.messages} | Connection Attempts: ${bot.stats.connectionAttempts}
            </div>
          `).join('')}
          ${activeBots.size === 0 ? '<p>Bots initializing with anti-throttling delay...</p>' : ''}
          <hr>
          <p><small>This system automatically manages connection timing to avoid server throttling.</small></p>
        </body>
        </html>
      `);
    } else {
      res.writeHead(404);
      res.end('Not Found - Bot System Running');
    }
  });
  
  const PORT = process.env.PORT || 10000;
  server.listen(PORT, () => {
    log(`🌐 Minimal status server on port ${PORT}`);
  });
  
  return server;
}

// Graceful shutdown
function setupShutdownHandler() {
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down bots gracefully...');
    
    let stopped = 0;
    activeBots.forEach(bot => {
      cleanupBot(bot);
      stopped++;
    });
    
    console.log(`✅ Stopped ${stopped} bots`);
    console.log('👋 Goodbye!\n');
    process.exit(0);
  });
}

// Main function
async function main() {
  log('Initializing Minecraft Bot System with Anti-Throttling...');
  
  // Start minimal server for Render.com
  startMinimalServer();
  
  // Setup shutdown handler
  setupShutdownHandler();
  
  // Wait 2 seconds
  await sleep(2000);
  
  // Start all bots with anti-throttling
  await startAllBots();
  
  // Start status monitor
  startStatusMonitor();
  
  log('✅ System initialized!');
  log('🤖 Bots will connect with anti-throttling delays');
  log('📊 Check Render.com logs for connection status');
}

// Start everything
main().catch(error => {
  console.error('❌ FATAL ERROR:', error);
  process.exit(1);
});
