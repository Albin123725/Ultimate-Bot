const mineflayer = require('mineflayer');

console.log(`
╔══════════════════════════════════════════════════════════╗
║   🚀 MINECRAFT BOT SYSTEM - AUTO START MODE            ║
║   ⚡ No Dashboard • Direct Connection                  ║
╚══════════════════════════════════════════════════════════╝
`);

// Configuration for gameplannet.aternos.me:43658
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
      activities: ['exploring', 'surveillance', 'patrolling', 'observing']
    },
    { 
      name: 'CroptonMiner', 
      type: 'cropton',
      activities: ['mining', 'digging', 'exploring', 'resource gathering']
    }
  ]
};

// Store active bots
const activeBots = new Map();

// Log function
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : 
                type === 'success' ? '✅' : 
                type === 'warning' ? '⚠️' : 'ℹ️';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// Create and connect a bot
function createBot(botConfig, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const { name, type } = botConfig;
      
      log(`Creating bot: ${name} (${type})`);
      
      try {
        const bot = mineflayer.createBot({
          host: CONFIG.SERVER.host,
          port: CONFIG.SERVER.port,
          username: name,
          version: CONFIG.SERVER.version,
          auth: 'offline'
        });
        
        const botData = {
          id: `${name}_${Date.now()}`,
          name: name,
          type: type,
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
            killed: 0,
            connectedAt: Date.now()
          }
        };
        
        activeBots.set(botData.id, botData);
        
        // Setup event handlers
        setupBotEvents(botData);
        
        resolve(botData);
        
      } catch (error) {
        log(`Failed to create bot ${name}: ${error.message}`, 'error');
        resolve(null);
      }
    }, delay);
  });
}

// Setup bot event handlers
function setupBotEvents(botData) {
  const { instance: bot, name } = botData;
  
  bot.on('spawn', () => {
    botData.status = 'connected';
    botData.activity = 'Active';
    log(`✅ ${name} successfully connected to server!`, 'success');
    
    // Start bot activities
    startBotActivities(botData);
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
    
    log(`💬 ${username}: ${message}`);
    
    // Auto-response (25% chance)
    if (Math.random() < 0.25) {
      setTimeout(() => {
        if (bot.player) {
          const response = getBotResponse(botData.type, message, username);
          if (response) {
            bot.chat(response);
            botData.stats.messages++;
            log(`🤖 ${name}: ${response}`);
          }
        }
      }, 1000 + Math.random() * 3000);
    }
  });
  
  bot.on('blockBreakProgressObserved', (block, destroyStage) => {
    if (destroyStage === 9) {
      botData.stats.mined++;
      log(`⛏️ ${name} mined ${block.name}`);
    }
  });
  
  bot.on('death', () => {
    log(`💀 ${name} died!`, 'warning');
    botData.health = 20;
  });
  
  bot.on('error', (err) => {
    log(`❌ ${name} error: ${err.message}`, 'error');
    botData.status = 'error';
  });
  
  bot.on('kicked', (reason) => {
    log(`🚫 ${name} kicked: ${JSON.stringify(reason)}`, 'error');
    botData.status = 'kicked';
    cleanupBot(botData);
    
    // Try to reconnect after 60 seconds
    setTimeout(() => {
      log(`🔄 Attempting to reconnect ${name}...`);
      createBot({ name: name, type: botData.type }, 0);
    }, 60000);
  });
  
  bot.on('end', () => {
    log(`🔌 ${name} disconnected`, 'warning');
    botData.status = 'disconnected';
    cleanupBot(botData);
    
    // Try to reconnect after 45 seconds
    setTimeout(() => {
      log(`🔄 Attempting to reconnect ${name}...`);
      createBot({ name: name, type: botData.type }, 0);
    }, 45000);
  });
}

// Get bot response based on type
function getBotResponse(botType, message, sender) {
  const responses = {
    agent: [
      'Mission underway.',
      'Area secure.',
      'Copy that.',
      'Proceeding as planned.',
      'Affirmative.',
      'All clear.',
      'Reporting in.',
      'Surveillance active.'
    ],
    cropton: [
      'Found some diamonds!',
      'Mining in progress.',
      'Strike the earth!',
      'Deep underground.',
      'Need more torches.',
      'Rich ore vein here!',
      'Tunnel expanding.',
      'Mining successful!'
    ]
  };
  
  const botResponses = responses[botType] || ['Hello!'];
  
  // If mentioned by name
  if (message.toLowerCase().includes(botType) || 
      message.toLowerCase().includes('bot') ||
      message.toLowerCase().includes(name)) {
    return `Yes ${sender}?`;
  }
  
  // Question response
  if (message.includes('?')) {
    const answers = [
      'Good question.',
      'I think so.',
      'Not sure.',
      'Probably.',
      'Maybe.',
      'Let me check.'
    ];
    return answers[Math.floor(Math.random() * answers.length)];
  }
  
  // Random response
  return botResponses[Math.floor(Math.random() * botResponses.length)];
}

// Start bot activities
function startBotActivities(botData) {
  if (!botData.instance) return;
  
  // Clear existing intervals
  if (botData.intervals.length > 0) {
    botData.intervals.forEach(interval => clearInterval(interval));
    botData.intervals = [];
  }
  
  // Main activity loop
  const activityInterval = setInterval(() => {
    if (!botData.instance || botData.status !== 'connected') {
      clearInterval(activityInterval);
      return;
    }
    
    const activity = getRandomActivity(botData.type);
    botData.activity = activity;
    
    executeActivity(botData, activity);
    
  }, 10000 + Math.random() * 15000);
  
  botData.intervals.push(activityInterval);
  
  // Anti-AFK system
  const afkInterval = setInterval(() => {
    if (botData.instance && botData.status === 'connected') {
      antiAFKMovement(botData);
    }
  }, 30000 + Math.random() * 60000);
  
  botData.intervals.push(afkInterval);
  
  // Random chat
  const chatInterval = setInterval(() => {
    if (botData.instance && botData.status === 'connected' && Math.random() < 0.2) {
      sendRandomChat(botData);
    }
  }, 60000 + Math.random() * 120000);
  
  botData.intervals.push(chatInterval);
}

// Get random activity
function getRandomActivity(botType) {
  const activities = {
    agent: ['exploring', 'surveillance', 'patrolling', 'scouting', 'observing'],
    cropton: ['mining', 'digging', 'tunneling', 'resource gathering', 'ore hunting']
  };
  
  return activities[botType][Math.floor(Math.random() * activities[botType].length)];
}

// Execute activity
function executeActivity(botData, activity) {
  const bot = botData.instance;
  
  try {
    switch (activity) {
      case 'mining':
      case 'digging':
      case 'tunneling':
        // Look down and sometimes dig
        bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
        
        if (Math.random() < 0.3) {
          const block = bot.blockAt(bot.entity.position.offset(0, -1, 0));
          if (block && !block.name.includes('air')) {
            bot.dig(block);
          }
        }
        break;
        
      case 'exploring':
      case 'patrolling':
      case 'scouting':
        // Move in random direction
        const dirs = ['forward', 'back', 'left', 'right'];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        bot.setControlState(dir, true);
        
        setTimeout(() => {
          if (bot) bot.setControlState(dir, false);
        }, 800 + Math.random() * 1200);
        
        bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
        break;
        
      default:
        // Just look around
        bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    }
  } catch (error) {
    // Silent fail for activity errors
  }
}

// Anti-AFK movement
function antiAFKMovement(botData) {
  const bot = botData.instance;
  if (!bot) return;
  
  const actions = [
    () => bot.setControlState('jump', true),
    () => bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2),
    () => {
      const dir = ['forward', 'back', 'left', 'right'][Math.floor(Math.random() * 4)];
      bot.setControlState(dir, true);
      setTimeout(() => {
        if (bot) bot.setControlState(dir, false);
      }, 300);
    }
  ];
  
  const action = actions[Math.floor(Math.random() * actions.length)];
  action();
  
  if (action === actions[0]) {
    setTimeout(() => {
      if (bot) bot.setControlState('jump', false);
    }, 200);
  }
}

// Send random chat
function sendRandomChat(botData) {
  const bot = botData.instance;
  if (!bot) return;
  
  const messages = {
    agent: [
      'Mission accomplished.',
      'All clear.',
      'Reporting in.',
      'Area secure.',
      'Proceeding as planned.',
      'Target acquired.'
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
  log(`💬 ${botData.name}: ${message}`);
}

// Cleanup bot
function cleanupBot(botData) {
  if (botData.intervals.length > 0) {
    botData.intervals.forEach(interval => clearInterval(interval));
    botData.intervals = [];
  }
}

// Start all bots
async function startAllBots() {
  log('='.repeat(60));
  log('🚀 STARTING MINECRAFT BOTS');
  log('='.repeat(60));
  log(`🌐 Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`);
  log(`🤖 Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`);
  log('='.repeat(60));
  
  // Start bots with staggered delays
  for (let i = 0; i < CONFIG.BOTS.length; i++) {
    const botConfig = CONFIG.BOTS[i];
    const delay = i * 5000; // 5 seconds between each bot
    
    await createBot(botConfig, delay);
  }
  
  log('✅ All bots started!');
  log('📊 Bot status will be shown below...');
  log('='.repeat(60));
}

// Display bot status periodically
function startStatusMonitor() {
  setInterval(() => {
    const connectedBots = Array.from(activeBots.values()).filter(b => b.status === 'connected');
    
    if (connectedBots.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('📊 BOT STATUS - ' + new Date().toLocaleTimeString());
      console.log('='.repeat(60));
      console.log(`Connected: ${connectedBots.length}/${activeBots.size}`);
      
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
      
      console.log('\n' + '='.repeat(60));
    }
  }, 30000); // Every 30 seconds
}

// Minimal HTTP server to keep Render.com happy
function startMinimalServer() {
  const http = require('http');
  
  const server = http.createServer((req, res) => {
    // Only respond to root path
    if (req.url === '/') {
      const connectedBots = Array.from(activeBots.values()).filter(b => b.status === 'connected');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Minecraft Bots - Auto Mode</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: monospace; background: #0a0a0a; color: #0f0; padding: 20px; }
            .status { background: #1a1a1a; padding: 15px; margin: 10px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>🤖 Minecraft Bot System - AUTO MODE</h1>
          <p>Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}</p>
          <p>Connected Bots: ${connectedBots.length}/${activeBots.size}</p>
          <p>Status: Running (Check Render.com logs for details)</p>
          <hr>
          <h3>Active Bots:</h3>
          ${connectedBots.map(bot => `
            <div class="status">
              <strong>${bot.name} (${bot.type})</strong><br>
              Health: ${bot.health}/20 | Activity: ${bot.activity}<br>
              Messages: ${bot.stats.messages} | Mined: ${bot.stats.mined}
            </div>
          `).join('')}
          ${connectedBots.length === 0 ? '<p>No bots currently connected. Starting soon...</p>' : ''}
        </body>
        </html>
      `);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    log(`🌐 Minimal web server started on port ${PORT} (Render.com requirement)`);
    log(`📱 You can view status at: http://localhost:${PORT}`);
  });
  
  return server;
}

// Graceful shutdown
function setupShutdownHandler() {
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down bots...');
    
    let stopped = 0;
    activeBots.forEach(bot => {
      if (bot.instance) {
        try {
          bot.instance.quit();
          stopped++;
        } catch (e) {
          // Ignore
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
  log('Initializing Minecraft Bot System...');
  
  // Start minimal web server for Render.com
  startMinimalServer();
  
  // Setup shutdown handler
  setupShutdownHandler();
  
  // Wait 2 seconds for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Start all bots
  await startAllBots();
  
  // Start status monitor
  startStatusMonitor();
  
  log('✅ System initialized and running!');
  log('🤖 Bots will auto-reconnect if disconnected');
  log('📊 Check Render.com logs for detailed activity');
}

// Start everything
main().catch(error => {
  console.error('❌ FATAL ERROR:', error);
  process.exit(1);
});
