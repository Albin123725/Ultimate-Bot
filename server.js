const mineflayer = require('mineflayer');
require('dotenv').config();

console.log(`
╔══════════════════════════════════════════════════════════╗
║   🚀 MINECRAFT BOT SYSTEM - AUTO START                 ║
║   ⚡ No Dashboard • Auto-Join on Render.com            ║
╚══════════════════════════════════════════════════════════╝
`);

// Configuration
const CONFIG = {
  SERVER: {
    host: process.env.MINECRAFT_HOST || 'gameplannet.aternos.me',
    port: parseInt(process.env.MINECRAFT_PORT) || 43658,
    version: process.env.MINECRAFT_VERSION || '1.21.10'
  },
  BOTS: [
    { name: 'Agent007', type: 'agent' },
    { name: 'CroptonMiner', type: 'cropton' }
  ],
  CONNECT_DELAY: 5000, // 5 seconds between bot connections
  ACTIVITY_INTERVAL: 10000 // 10 seconds between activities
};

// Store bot instances
const bots = new Map();
const logs = [];

// Logging system
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  logs.push(logEntry);
  
  const prefix = type === 'error' ? '❌' : 
                type === 'success' ? '✅' : 
                type === 'warning' ? '⚠️' : 'ℹ️';
  
  console.log(`${prefix} ${message}`);
  
  // Keep only last 100 logs
  if (logs.length > 100) logs.shift();
}

// Create and connect bot
async function createBot(botConfig) {
  const { name, type } = botConfig;
  const botId = `${name}_${Date.now()}`;
  
  log(`Creating bot: ${name} (${type})`, 'info');
  
  const botData = {
    id: botId,
    name: name,
    type: type,
    status: 'creating',
    health: 20,
    food: 20,
    position: null,
    activity: 'Initializing...',
    instance: null,
    intervals: [],
    stats: {
      messagesSent: 0,
      blocksMined: 0,
      mobsKilled: 0,
      distance: 0
    }
  };
  
  bots.set(botId, botData);
  
  try {
    const mcBot = mineflayer.createBot({
      host: CONFIG.SERVER.host,
      port: CONFIG.SERVER.port,
      username: name,
      version: CONFIG.SERVER.version,
      auth: 'offline'
    });
    
    botData.instance = mcBot;
    botData.status = 'connecting';
    
    // Event handlers
    mcBot.on('login', () => {
      log(`${name} logged in to server`, 'info');
    });
    
    mcBot.on('spawn', () => {
      botData.status = 'connected';
      log(`✅ ${name} successfully spawned in world!`, 'success');
      
      // Start bot activities
      startBotActivities(botData);
    });
    
    mcBot.on('health', () => {
      botData.health = mcBot.health;
      botData.food = mcBot.food;
    });
    
    mcBot.on('move', () => {
      if (mcBot.entity) {
        botData.position = {
          x: Math.floor(mcBot.entity.position.x),
          y: Math.floor(mcBot.entity.position.y),
          z: Math.floor(mcBot.entity.position.z)
        };
      }
    });
    
    mcBot.on('chat', (username, message) => {
      if (username === name) return;
      
      log(`💬 ${username}: ${message}`, 'info');
      
      // Auto-response (30% chance)
      if (Math.random() < 0.3) {
        setTimeout(() => {
          if (mcBot.player) {
            const response = generateChatResponse(type, message, username);
            if (response) {
              mcBot.chat(response);
              botData.stats.messagesSent++;
              log(`🤖 ${name}: ${response}`, 'info');
            }
          }
        }, 1000 + Math.random() * 2000);
      }
    });
    
    mcBot.on('blockBreakProgressObserved', (block, destroyStage) => {
      if (destroyStage === 9) {
        botData.stats.blocksMined++;
        log(`⛏️ ${name} mined ${block.name}`, 'info');
      }
    });
    
    mcBot.on('death', () => {
      log(`💀 ${name} died!`, 'warning');
      botData.health = 20;
    });
    
    mcBot.on('error', (err) => {
      botData.status = 'error';
      log(`❌ ${name} error: ${err.message}`, 'error');
    });
    
    mcBot.on('kicked', (reason) => {
      botData.status = 'kicked';
      log(`🚫 ${name} kicked: ${JSON.stringify(reason)}`, 'error');
      cleanupBot(botData);
      
      // Try to reconnect after 30 seconds
      setTimeout(() => {
        if (botData.status === 'kicked') {
          log(`🔄 Attempting to reconnect ${name}...`, 'info');
          createBot(botConfig);
        }
      }, 30000);
    });
    
    mcBot.on('end', () => {
      botData.status = 'disconnected';
      log(`🔌 ${name} disconnected from server`, 'warning');
      cleanupBot(botData);
    });
    
    return botData;
    
  } catch (error) {
    botData.status = 'failed';
    log(`❌ Failed to create ${name}: ${error.message}`, 'error');
    return null;
  }
}

// Generate chat response based on bot type
function generateChatResponse(botType, message, sender) {
  const responses = {
    agent: [
      'Mission underway.',
      'Area secure.',
      'Copy that.',
      'Proceeding as planned.',
      'Affirmative.',
      'All clear.',
      'Reporting in.'
    ],
    cropton: [
      'Found some diamonds!',
      'Mining in progress.',
      'Strike the earth!',
      'Deep underground.',
      'Need more torches.',
      'Rich ore vein here!',
      'Mining expedition!'
    ]
  };
  
  const botResponses = responses[botType] || ['Hello!'];
  
  // If mentioned directly
  if (message.toLowerCase().includes('agent') || message.toLowerCase().includes('cropton')) {
    return `Yes ${sender}?`;
  }
  
  // Random response
  return botResponses[Math.floor(Math.random() * botResponses.length)];
}

// Start bot activities
function startBotActivities(botData) {
  if (!botData.instance) return;
  
  // Clear any existing intervals
  cleanupBotIntervals(botData);
  
  // Main activity loop
  const activityInterval = setInterval(() => {
    if (!botData.instance || botData.status !== 'connected') {
      clearInterval(activityInterval);
      return;
    }
    
    const activity = getRandomActivity(botData.type);
    botData.activity = activity;
    
    executeActivity(botData, activity);
    
  }, CONFIG.ACTIVITY_INTERVAL + Math.random() * 5000);
  
  botData.intervals.push(activityInterval);
  
  // Anti-AFK system
  const afkInterval = setInterval(() => {
    if (botData.instance && botData.status === 'connected') {
      antiAFKMovement(botData);
    }
  }, 45000 + Math.random() * 90000);
  
  botData.intervals.push(afkInterval);
  
  // Random chat messages
  const chatInterval = setInterval(() => {
    if (botData.instance && botData.status === 'connected' && Math.random() < 0.3) {
      sendRandomChat(botData);
    }
  }, 60000 + Math.random() * 120000);
  
  botData.intervals.push(chatInterval);
}

// Get random activity based on bot type
function getRandomActivity(botType) {
  const activities = {
    agent: ['exploring', 'surveillance', 'patrolling', 'observing', 'scouting'],
    cropton: ['mining', 'digging', 'exploring', 'resource gathering', 'tunnel digging']
  };
  
  const botActivities = activities[botType] || ['exploring'];
  return botActivities[Math.floor(Math.random() * botActivities.length)];
}

// Execute bot activity
function executeActivity(botData, activity) {
  if (!botData.instance) return;
  
  const mcBot = botData.instance;
  
  try {
    switch (activity) {
      case 'mining':
      case 'digging':
      case 'resource gathering':
        // Look at ground and occasionally dig
        mcBot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
        
        if (Math.random() < 0.3) {
          const block = mcBot.blockAt(mcBot.entity.position.offset(0, -1, 0));
          if (block && block.name !== 'air') {
            mcBot.dig(block, (err) => {
              if (!err) {
                log(`⛏️ ${botData.name} successfully mined ${block.name}`, 'info');
              }
            });
          }
        }
        break;
        
      case 'exploring':
      case 'scouting':
      case 'patrolling':
        // Move in random direction
        const directions = ['forward', 'back', 'left', 'right'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        mcBot.setControlState(direction, true);
        
        setTimeout(() => {
          if (mcBot) mcBot.setControlState(direction, false);
        }, 1000 + Math.random() * 2000);
        
        // Look around
        mcBot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
        break;
        
      case 'surveillance':
      case 'observing':
        // Just look around
        mcBot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
        break;
        
      default:
        // Idle - occasional movement
        if (Math.random() < 0.2) {
          mcBot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
        }
    }
  } catch (error) {
    log(`Activity error for ${botData.name}: ${error.message}`, 'error');
  }
}

// Anti-AFK movement
function antiAFKMovement(botData) {
  if (!botData.instance) return;
  
  const mcBot = botData.instance;
  const actions = [
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
  
  const action = actions[Math.floor(Math.random() * actions.length)];
  action();
}

// Send random chat message
function sendRandomChat(botData) {
  if (!botData.instance) return;
  
  const messages = {
    agent: [
      'Mission accomplished.',
      'All clear.',
      'Reporting in.',
      'Surveillance active.',
      'Area secure.',
      'Proceeding as planned.'
    ],
    cropton: [
      'Found some ores!',
      'Mining in progress.',
      'Deep underground.',
      'Strike the earth!',
      'Need more torches.',
      'Rich mineral deposit!'
    ]
  };
  
  const botMessages = messages[botData.type] || ['Hello everyone!'];
  const message = botMessages[Math.floor(Math.random() * botMessages.length)];
  
  botData.instance.chat(message);
  botData.stats.messagesSent++;
  log(`💬 ${botData.name}: ${message}`, 'info');
}

// Cleanup bot intervals
function cleanupBotIntervals(botData) {
  botData.intervals.forEach(interval => clearInterval(interval));
  botData.intervals = [];
}

// Cleanup bot completely
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

// Start all bots
async function startAllBots() {
  log('🚀 Starting all bots automatically...', 'info');
  log(`🎯 Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`, 'info');
  log(`🤖 Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`, 'info');
  
  const results = [];
  
  for (let i = 0; i < CONFIG.BOTS.length; i++) {
    const botConfig = CONFIG.BOTS[i];
    
    try {
      log(`🤖 Creating bot ${i + 1}/${CONFIG.BOTS.length}: ${botConfig.name}`, 'info');
      
      const bot = await createBot(botConfig);
      results.push({
        name: botConfig.name,
        success: true,
        status: bot ? bot.status : 'failed'
      });
      
      // Stagger connections (except for last bot)
      if (i < CONFIG.BOTS.length - 1) {
        log(`⏳ Waiting ${CONFIG.CONNECT_DELAY / 1000} seconds before next bot...`, 'info');
        await sleep(CONFIG.CONNECT_DELAY);
      }
      
    } catch (error) {
      results.push({
        name: botConfig.name,
        success: false,
        error: error.message
      });
      log(`❌ Failed to start ${botConfig.name}: ${error.message}`, 'error');
    }
  }
  
  // Log summary
  const successful = results.filter(r => r.success).length;
  log(`✅ ${successful}/${CONFIG.BOTS.length} bots started successfully`, 'success');
  
  // Start monitoring
  startStatusMonitoring();
  
  return results;
}

// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Monitor and display status periodically
function startStatusMonitoring() {
  let lastPrint = Date.now();
  
  setInterval(() => {
    const now = Date.now();
    
    // Print status every 30 seconds
    if (now - lastPrint > 30000) {
      printStatus();
      lastPrint = now;
    }
    
    // Check for disconnected bots and attempt to reconnect
    Array.from(bots.values()).forEach(bot => {
      if (bot.status === 'disconnected' || bot.status === 'kicked') {
        const timeSinceDisconnect = now - (bot.lastDisconnect || 0);
        if (timeSinceDisconnect > 60000) { // Wait 60 seconds before reconnect
          log(`🔄 Attempting to reconnect ${bot.name}...`, 'info');
          const botConfig = CONFIG.BOTS.find(b => b.name === bot.name);
          if (botConfig) {
            createBot(botConfig);
          }
        }
      }
    });
    
  }, 10000);
}

// Print current status
function printStatus() {
  const connectedBots = Array.from(bots.values()).filter(b => b.status === 'connected');
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 BOT STATUS REPORT');
  console.log('='.repeat(60));
  console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
  console.log(`🌐 Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`);
  console.log(`🤖 Connected: ${connectedBots.length}/${bots.size}`);
  console.log('='.repeat(60));
  
  if (connectedBots.length === 0) {
    console.log('No bots currently connected');
  } else {
    connectedBots.forEach(bot => {
      const uptime = bot.instance ? Math.floor((Date.now() - bot.instance._client.startTime) / 1000) : 0;
      const uptimeStr = `${Math.floor(uptime / 60)}m ${uptime % 60}s`;
      
      console.log(`${bot.name} (${bot.type})`);
      console.log(`  Status: ${bot.status} | Health: ${bot.health}/20 | Food: ${bot.food}/20`);
      console.log(`  Activity: ${bot.activity}`);
      console.log(`  Position: ${bot.position ? `${bot.position.x}, ${bot.position.y}, ${bot.position.z}` : 'Unknown'}`);
      console.log(`  Uptime: ${uptimeStr} | Messages: ${bot.stats.messagesSent} | Mined: ${bot.stats.blocksMined}`);
      console.log('');
    });
  }
  
  console.log('='.repeat(60));
  console.log('System running... (Press Ctrl+C to stop)\n');
}

// Handle graceful shutdown
function setupShutdownHandler() {
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down bots gracefully...');
    
    let stopped = 0;
    Array.from(bots.values()).forEach(bot => {
      if (bot.instance) {
        try {
          bot.instance.quit();
          stopped++;
        } catch (error) {
          // Ignore errors during shutdown
        }
      }
    });
    
    console.log(`✅ Stopped ${stopped} bots`);
    console.log('👋 Goodbye!\n');
    process.exit(0);
  });
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 MINECRAFT BOT SYSTEM - AUTO START MODE');
  console.log('='.repeat(60));
  console.log('⚡ Starting in 3 seconds...');
  console.log('📝 Note: No web dashboard - bots will auto-connect');
  console.log('🔧 Press Ctrl+C to stop all bots');
  console.log('='.repeat(60));
  
  // Wait 3 seconds before starting
  await sleep(3000);
  
  // Setup shutdown handler
  setupShutdownHandler();
  
  // Start all bots
  await startAllBots();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ SYSTEM STARTED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log('🤖 Bots will run continuously');
  console.log('📊 Status updates every 30 seconds');
  console.log('🔄 Auto-reconnect enabled');
  console.log('='.repeat(60) + '\n');
}

// Start the application
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

// Export for testing if needed
module.exports = {
  bots,
  logs,
  createBot,
  startAllBots
};
