// ============================================================
// 🚀 SIMPLE MINECRAFT BOTS - NO DASHBOARD
// 🎮 Creative Mode • Auto-Sleep
// ============================================================

const mineflayer = require('mineflayer');

console.log(`
╔══════════════════════════════════════════════════════════╗
║   🚀 SIMPLE MINECRAFT BOTS                               ║
║   🎮 Auto-Start • Auto-Sleep • No Dashboard              ║
╚══════════════════════════════════════════════════════════╝
`);

// Configuration
const SERVER = {
  host: 'gameplannet.aternos.me',
  port: 43658,
  version: '1.21.10'
};

const BOTS = [
  { name: 'Agent007', type: 'agent' },
  { name: 'CroptonMiner', type: 'cropton' }
];

// Create bot function
function createBot(botConfig, delay = 0) {
  setTimeout(() => {
    console.log(`🤖 Creating bot: ${botConfig.name}`);
    
    const bot = mineflayer.createBot({
      host: SERVER.host,
      port: SERVER.port,
      username: botConfig.name,
      version: SERVER.version,
      auth: 'offline'
    });
    
    // Store bot state
    bot._sleeping = false;
    bot._activity = 'Connecting';
    
    // Setup event handlers
    setupBotEvents(bot, botConfig);
    
  }, delay);
}

// Setup bot event handlers
function setupBotEvents(bot, config) {
  bot.on('spawn', () => {
    console.log(`✅ ${config.name}: Connected successfully!`);
    bot._activity = 'Active';
    
    // Set creative mode
    setTimeout(() => {
      bot.chat('/gamemode creative');
      bot.chat('/give @s bed');
      console.log(`🎮 ${config.name}: Creative mode set`);
    }, 3000);
    
    // Start activity loop
    startBotActivities(bot, config);
  });
  
  bot.on('time', () => {
    if (!bot.time) return;
    
    const time = bot.time.time;
    const isNight = time >= 13000 && time <= 23000;
    
    // Auto-sleep at night
    if (isNight && !bot._sleeping) {
      console.log(`🌙 ${config.name}: Night time (${time}), sleeping immediately`);
      bot._activity = 'Sleeping';
      sleepImmediately(bot, config);
    } else if (!isNight && bot._sleeping) {
      console.log(`☀️ ${config.name}: Morning (${time}), waking up`);
      bot._activity = 'Waking up';
      wakeUp(bot);
    }
  });
  
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    
    console.log(`💬 ${username}: ${message}`);
    
    // Simple auto-response
    if (Math.random() < 0.3) {
      setTimeout(() => {
        if (bot.player) {
          const response = config.type === 'agent' ? 
            "Mission underway." : "Mining in progress.";
          bot.chat(response);
        }
      }, 1000);
    }
  });
  
  bot.on('kicked', (reason) => {
    console.log(`🚫 ${config.name}: Kicked, reconnecting in 30s`);
    setTimeout(() => createBot(config, 0), 30000);
  });
  
  bot.on('end', () => {
    console.log(`🔌 ${config.name}: Disconnected, reconnecting in 30s`);
    setTimeout(() => createBot(config, 0), 30000);
  });
  
  bot.on('error', (err) => {
    console.error(`❌ ${config.name}: ${err.message}`);
  });
}

// Sleep immediately when night comes
async function sleepImmediately(bot, config) {
  try {
    // Find bed
    const bed = bot.findBlock({
      matching: block => block && block.name && block.name.includes('bed'),
      maxDistance: 10
    });
    
    if (bed) {
      await bot.sleep(bed);
      bot._sleeping = true;
      console.log(`💤 ${config.name}: Sleeping`);
    } else {
      console.log(`🛏️ ${config.name}: No bed nearby`);
    }
  } catch (error) {
    console.log(`❌ ${config.name}: Cannot sleep: ${error.message}`);
  }
}

// Wake up in morning
function wakeUp(bot) {
  if (bot.isSleeping) {
    bot.wake();
  }
  bot._sleeping = false;
}

// Start bot activities (only during day)
function startBotActivities(bot, config) {
  setInterval(() => {
    if (!bot.entity || bot._sleeping) return;
    
    // Don't do activities at night
    if (bot.time && bot.time.time >= 13000 && bot.time.time <= 23000) {
      return;
    }
    
    // Simple activities
    if (Math.random() < 0.3) {
      const activity = config.type === 'agent' ? 
        'Patrolling' : 'Mining';
      bot._activity = activity;
      console.log(`🎯 ${config.name}: ${activity}`);
      
      // Simple movement
      const actions = [
        () => bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2),
        () => {
          const dir = ['forward', 'back', 'left', 'right'][Math.floor(Math.random() * 4)];
          bot.setControlState(dir, true);
          setTimeout(() => bot.setControlState(dir, false), 500);
        },
        () => {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 200);
        }
      ];
      
      actions[Math.floor(Math.random() * actions.length)]();
    }
  }, 10000);
  
  // Check time every 5 seconds
  setInterval(() => {
    if (bot.time) {
      const time = bot.time.time;
      const isNight = time >= 13000 && time <= 23000;
      
      if (isNight && !bot._sleeping) {
        console.log(`🌙 ${config.name}: Night detected, sleeping`);
        sleepImmediately(bot, config);
      }
    }
  }, 5000);
}

// Start all bots
function startAllBots() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 STARTING SIMPLE BOT SYSTEM');
  console.log('='.repeat(60));
  console.log(`🌐 Server: ${SERVER.host}:${SERVER.port}`);
  console.log(`🤖 Bots: ${BOTS.map(b => b.name).join(', ')}`);
  console.log('='.repeat(60) + '\n');
  
  // Start bots with 5 second delay between them
  BOTS.forEach((bot, index) => {
    createBot(bot, index * 5000);
  });
  
  console.log('✅ All bots starting...');
  console.log('🤖 Bots will:');
  console.log('   • Sleep immediately when night comes');
  console.log('   • Wake up in morning');
  console.log('   • Auto-reconnect if disconnected');
  console.log('   • No dashboard - just console logs\n');
}

// Start everything
startAllBots();

// Keep process alive
setInterval(() => {
  // Keep-alive heartbeat
}, 60000);
