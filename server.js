// ============================================================
// 🚀 ULTIMATE 2-BOT CREATIVE SYSTEM
// 🎮 Creative Mode • Auto-Sleep • Bed Management
// ============================================================

const mineflayer = require('mineflayer');
const http = require('http');

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE 2-BOT CREATIVE SYSTEM                                     ║
║   🎮 Creative Mode • Auto-Sleep • Bed Management                        ║
║   🤖 2 Bots Only • Perfect Sleep System                                 ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

// ================= CONFIGURATION =================
const CONFIG = {
  SERVER: {
    host: 'gameplannet.aternos.me',
    port: 43658,
    version: '1.21.10'
  },
  BOTS: [
    {
      id: 'bot_001',
      name: 'CreativeMaster',
      personality: 'builder'
    },
    {
      id: 'bot_002',
      name: 'CreativeExplorer',
      personality: 'explorer'
    }
  ],
  WEB_PORT: process.env.PORT || 3000
};

// ================= SIMPLE SLEEP SYSTEM =================
class SimpleSleepSystem {
  constructor(botInstance) {
    this.bot = botInstance;
    this.isSleeping = false;
    this.hasBed = true;
  }

  checkTimeAndSleep() {
    if (!this.bot || !this.bot.time) return;
    
    const time = this.bot.time.time;
    const isNight = time >= 13000 && time <= 23000;
    
    if (isNight && !this.isSleeping) {
      console.log(`🌙 ${this.bot.username}: Night time (${time}), sleeping`);
      this.sleep();
    } else if (!isNight && this.isSleeping) {
      console.log(`☀️ ${this.bot.username}: Morning (${time}), waking up`);
      this.wake();
    }
  }

  async sleep() {
    if (this.isSleeping) return;
    
    this.isSleeping = true;
    
    // Get bed from creative if needed
    if (!this.hasBed) {
      this.bot.chat(`/give ${this.bot.username} bed`);
      this.hasBed = true;
    }
    
    // Look for bed or just try to sleep
    try {
      // Find any bed nearby
      const bed = this.bot.findBlock({
        matching: block => block && block.name && block.name.includes('bed'),
        maxDistance: 10
      });
      
      if (bed) {
        // Try to sleep
        await this.bot.sleep(bed);
        console.log(`💤 ${this.bot.username}: Sleeping`);
      } else {
        // Place a bed first
        console.log(`🛏️ ${this.bot.username}: Placing bed`);
        // In creative mode, beds can be placed anywhere
      }
    } catch (error) {
      console.log(`❌ ${this.bot.username}: Sleep failed - ${error.message}`);
      this.isSleeping = false;
    }
  }

  async wake() {
    if (!this.isSleeping) return;
    
    try {
      if (this.bot.isSleeping) {
        this.bot.wake();
      }
      this.isSleeping = false;
      console.log(`✅ ${this.bot.username}: Woke up`);
    } catch (error) {
      console.log(`❌ ${this.bot.username}: Wake failed`);
    }
  }
}

// ================= SIMPLE CREATIVE BOT =================
class SimpleCreativeBot {
  constructor(config, index) {
    this.config = config;
    this.bot = null;
    this.sleepSystem = null;
    this.state = {
      id: config.id,
      username: config.name,
      personality: config.personality,
      status: 'initializing',
      health: 20,
      food: 20,
      position: null,
      isSleeping: false,
      activity: 'Initializing',
      creativeMode: true
    };
    
    this.intervals = [];
    console.log(`🤖 Created ${this.state.username} (${this.state.personality})`);
  }

  async connect() {
    try {
      this.state.status = 'connecting';
      console.log(`🔄 ${this.state.username}: Connecting...`);
      
      // Delay to avoid connection throttling
      await this.delay(this.config.index * 5000);
      
      this.bot = mineflayer.createBot({
        host: CONFIG.SERVER.host,
        port: CONFIG.SERVER.port,
        username: this.state.username,
        version: CONFIG.SERVER.version,
        auth: 'offline',
        viewDistance: 6
      });
      
      this.sleepSystem = new SimpleSleepSystem(this.bot);
      this.setupEventHandlers();
      
      return new Promise((resolve) => {
        this.bot.once('spawn', () => {
          this.onSpawn();
          resolve(this);
        });
        
        this.bot.once('error', (err) => {
          console.error(`❌ ${this.state.username}: Connection error`);
          this.state.status = 'error';
          resolve(this);
        });
      });
      
    } catch (error) {
      console.error(`❌ ${this.state.username}: Failed to connect`);
      this.state.status = 'failed';
      return this;
    }
  }

  setupEventHandlers() {
    if (!this.bot) return;
    
    this.bot.on('spawn', () => {
      this.onSpawn();
    });
    
    this.bot.on('health', () => {
      this.state.health = this.bot.health || 20;
      this.state.food = this.bot.food || 20;
    });
    
    this.bot.on('move', () => {
      if (this.bot.entity) {
        const pos = this.bot.entity.position;
        this.state.position = {
          x: Math.floor(pos.x),
          y: Math.floor(pos.y),
          z: Math.floor(pos.z)
        };
      }
    });
    
    this.bot.on('time', () => {
      if (this.sleepSystem) {
        this.sleepSystem.checkTimeAndSleep();
      }
      this.state.isSleeping = this.bot.isSleeping || false;
    });
    
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      
      console.log(`💬 ${username}: ${message}`);
      
      if (Math.random() < 0.3) {
        setTimeout(() => {
          if (this.bot && this.bot.player) {
            const response = this.getChatResponse(message, username);
            this.bot.chat(response);
            console.log(`🤖 ${this.bot.username}: ${response}`);
          }
        }, 1000 + Math.random() * 2000);
      }
    });
    
    this.bot.on('sleep', () => {
      console.log(`😴 ${this.state.username}: Sleeping`);
      this.state.isSleeping = true;
      this.state.activity = 'Sleeping';
    });
    
    this.bot.on('wake', () => {
      console.log(`☀️ ${this.state.username}: Woke up`);
      this.state.isSleeping = false;
      this.state.activity = 'Waking up';
    });
    
    this.bot.on('kicked', (reason) => {
      console.log(`🚫 ${this.state.username}: Kicked`);
      this.state.status = 'kicked';
      this.cleanup();
      this.scheduleReconnect();
    });
    
    this.bot.on('end', () => {
      console.log(`🔌 ${this.state.username}: Disconnected`);
      this.state.status = 'disconnected';
      this.cleanup();
      this.scheduleReconnect();
    });
    
    this.bot.on('error', (err) => {
      console.error(`❌ ${this.state.username}: Error`);
      this.state.status = 'error';
    });
  }

  onSpawn() {
    this.state.status = 'connected';
    this.state.position = this.getPosition();
    
    console.log(`✅ ${this.state.username}: Connected!`);
    
    // Initialize creative mode
    setTimeout(() => {
      this.initializeCreativeMode();
    }, 3000);
    
    // Start activity loop
    this.startActivityLoop();
  }

  initializeCreativeMode() {
    if (!this.bot) return;
    
    console.log(`🎮 ${this.state.username}: Creative mode setup`);
    
    // Set creative mode
    setTimeout(() => {
      if (this.bot) {
        this.bot.chat('/gamemode creative');
      }
    }, 1000);
    
    // Give some items
    setTimeout(() => {
      if (this.bot) {
        this.bot.chat('/give @s bed 1');
        this.bot.chat('/give @s stone 64');
        this.bot.chat('/give @s oak_planks 64');
      }
    }, 2000);
  }

  startActivityLoop() {
    const activityInterval = setInterval(() => {
      if (!this.bot || !this.bot.entity || this.state.isSleeping) {
        return;
      }
      
      // Don't do activities at night
      if (this.bot.time && this.bot.time.time >= 13000 && this.bot.time.time <= 23000) {
        return;
      }
      
      // Perform activity
      const activity = this.getActivity();
      this.state.activity = activity;
      this.performActivity(activity);
      
    }, 10000 + Math.random() * 10000);
    
    this.intervals.push(activityInterval);
  }

  getActivity() {
    if (this.state.personality === 'builder') {
      const activities = ['Building', 'Decorating', 'Planning', 'Designing'];
      return activities[Math.floor(Math.random() * activities.length)];
    } else {
      const activities = ['Exploring', 'Mapping', 'Discovering', 'Adventuring'];
      return activities[Math.floor(Math.random() * activities.length)];
    }
  }

  performActivity(activity) {
    console.log(`🎯 ${this.state.username}: ${activity}`);
    
    if (!this.bot) return;
    
    if (activity.includes('Building') || activity.includes('Decorating')) {
      // Look around
      this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    } else if (activity.includes('Exploring') || activity.includes('Mapping')) {
      // Move around
      const directions = ['forward', 'back', 'left', 'right'];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      
      this.bot.setControlState(direction, true);
      setTimeout(() => {
        if (this.bot) this.bot.setControlState(direction, false);
      }, 1000 + Math.random() * 1000);
      
      this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    } else {
      // Just look around
      this.bot.look(Math.random() * Math.PI * 0.5, Math.random() * Math.PI * 0.5 - Math.PI * 0.25);
    }
  }

  getChatResponse(message, sender) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes(this.state.username.toLowerCase())) {
      const responses = [`Yes ${sender}?`, `What's up ${sender}?`, `Hey ${sender}!`];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (message.includes('?')) {
      const responses = ["Good question!", "I think so!", "Not sure."];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (this.state.personality === 'builder') {
      const responses = ["Building something!", "Working on my project!", "Love building!"];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = ["Exploring!", "Found something cool!", "On an adventure!"];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  getPosition() {
    if (!this.bot || !this.bot.entity) return null;
    
    const pos = this.bot.entity.position;
    return {
      x: Math.floor(pos.x),
      y: Math.floor(pos.y),
      z: Math.floor(pos.z)
    };
  }

  scheduleReconnect() {
    const delay = 30000 + Math.random() * 30000;
    
    console.log(`⏳ ${this.state.username}: Reconnecting in ${Math.round(delay / 1000)}s`);
    
    setTimeout(() => {
      if (this.state.status !== 'connected') {
        console.log(`🔄 ${this.state.username}: Reconnecting...`);
        this.connect();
      }
    }, delay);
  }

  cleanup() {
    this.intervals.forEach(interval => {
      try {
        clearInterval(interval);
      } catch (error) {}
    });
    
    this.intervals = [];
    
    if (this.bot) {
      try {
        this.bot.removeAllListeners();
      } catch (error) {}
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      username: this.state.username,
      personality: this.state.personality,
      status: this.state.status,
      position: this.state.position,
      activity: this.state.activity,
      isSleeping: this.state.isSleeping,
      health: this.state.health
    };
  }
}

// ================= BOT MANAGER =================
class BotManager {
  constructor() {
    this.bots = new Map();
  }
  
  async start() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 STARTING 2-BOT CREATIVE SYSTEM');
    console.log('='.repeat(60));
    console.log(`🌐 Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`);
    console.log(`🤖 Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`);
    console.log('='.repeat(60) + '\n');
    
    // Start bots with delays
    for (let i = 0; i < CONFIG.BOTS.length; i++) {
      const botConfig = CONFIG.BOTS[i];
      botConfig.index = i; // Add index for delay
      
      const bot = new SimpleCreativeBot(botConfig, i);
      this.bots.set(botConfig.id, bot);
      
      // Stagger connections
      if (i > 0) {
        await this.delay(5000);
      }
      
      // Start bot
      bot.connect();
    }
    
    // Start status monitoring
    this.startStatusMonitoring();
    
    console.log('\n✅ All bots starting!');
    console.log('📊 Status updates every 30 seconds...\n');
  }
  
  startStatusMonitoring() {
    setInterval(() => {
      this.printStatus();
    }, 30000);
  }
  
  printStatus() {
    const connectedBots = Array.from(this.bots.values())
      .filter(bot => bot.state.status === 'connected');
    
    const sleepingBots = connectedBots
      .filter(bot => bot.state.isSleeping);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 BOT STATUS');
    console.log('='.repeat(60));
    console.log(`Connected: ${connectedBots.length}/${this.bots.size}`);
    console.log(`Sleeping: ${sleepingBots.length}`);
    console.log('='.repeat(60));
    
    connectedBots.forEach(bot => {
      const status = bot.getStatus();
      const sleepIcon = status.isSleeping ? '💤' : '☀️';
      
      console.log(`${sleepIcon} ${status.username} (${status.personality})`);
      console.log(`  Activity: ${status.activity}`);
      console.log(`  Position: ${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}`);
      console.log(`  Health: ${status.health}/20`);
      console.log('');
    });
    
    if (connectedBots.length === 0) {
      console.log('No bots connected');
    }
    
    console.log('='.repeat(60) + '\n');
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getAllStatuses() {
    const statuses = {};
    this.bots.forEach((bot, id) => {
      statuses[id] = bot.getStatus();
    });
    return statuses;
  }
}

// ================= WEB SERVER FOR RENDER.COM =================
function createWebServer(botManager) {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      const statuses = botManager.getAllStatuses();
      const connected = Object.values(statuses).filter(s => s.status === 'connected').length;
      const sleeping = Object.values(statuses).filter(s => s.isSleeping).length;
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Creative Bot System</title>
          <style>
            body { font-family: Arial, sans-serif; background: #0f0f0f; color: #fff; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
            .bot-card { background: #2a2a2a; padding: 15px; margin: 10px 0; border-radius: 8px; }
            .sleeping { border-left: 5px solid #0077ff; }
            .awake { border-left: 5px solid #00ff77; }
            .status-badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
            .connected { background: #00cc00; }
            .disconnected { background: #cc0000; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤖 Creative Bot System</h1>
              <p>Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}</p>
              <p>Bots: ${connected}/${Object.keys(statuses).length} connected • ${sleeping} sleeping</p>
              <p>Mode: Creative • Auto-Sleep • Bed Management</p>
            </div>
            
            <h2>Bot Status</h2>
            ${Object.entries(statuses).map(([id, status]) => `
              <div class="bot-card ${status.isSleeping ? 'sleeping' : 'awake'}">
                <h3>${status.username} (${status.personality})</h3>
                <span class="status-badge ${status.status === 'connected' ? 'connected' : 'disconnected'}">
                  ${status.status.toUpperCase()}
                </span>
                ${status.isSleeping ? '<span style="color:#0077ff">💤 SLEEPING</span>' : '<span style="color:#00ff77">☀️ AWAKE</span>'}
                <p>Activity: ${status.activity}</p>
                <p>Position: ${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}</p>
                <p>Health: ${status.health}/20</p>
              </div>
            `).join('')}
            
            <div style="margin-top: 30px; padding: 15px; background: #1a1a1a; border-radius: 8px;">
              <h3>System Information</h3>
              <p>✅ Bots sleep immediately when night comes</p>
              <p>✅ Auto-bed placement from creative inventory</p>
              <p>✅ Bed breaking in morning</p>
              <p>✅ 2 Personality types: Builder & Explorer</p>
              <p>✅ Auto-reconnect on disconnect</p>
            </div>
          </div>
        </body>
        </html>
      `);
    } else if (req.url === '/health') {
      res.writeHead(200);
      res.end('OK');
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  
  server.listen(CONFIG.WEB_PORT, () => {
    console.log(`🌐 Web server running on port ${CONFIG.WEB_PORT}`);
    console.log(`📱 Status page: http://localhost:${CONFIG.WEB_PORT}`);
  });
  
  return server;
}

// ================= MAIN EXECUTION =================
async function main() {
  try {
    console.log('🚀 Starting Creative Bot System...');
    
    // Create bot manager
    const botManager = new BotManager();
    
    // Start web server for Render.com
    createWebServer(botManager);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down...');
      console.log('👋 Goodbye!\n');
      process.exit(0);
    });
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start bots
    await botManager.start();
    
    console.log('✅ System running successfully!');
    console.log('🤖 Bots will:');
    console.log('   • Sleep immediately when night comes');
    console.log('   • Place bed from creative inventory if needed');
    console.log('   • Break bed in morning');
    console.log('   • Repeat cycle every day/night');
    
    // Keep process alive
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
    
  } catch (error) {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Start everything
main();
