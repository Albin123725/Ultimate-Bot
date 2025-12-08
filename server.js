const express = require('express');
const WebSocket = require('ws');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const mineflayer = require('mineflayer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ================= BOT SYSTEM =================
class UltimateBotSystem {
  constructor() {
    this.bots = new Map();
    this.events = [];
    this.consoleLogs = [];
    
    this.config = {
      server: {
        host: process.env.MINECRAFT_HOST || 'gameplannet.aternos.me',
        port: parseInt(process.env.MINECRAFT_PORT) || 43658,
        version: process.env.MINECRAFT_VERSION || '1.21.10'
      },
      maxBots: 2,
      botTypes: ['agent', 'cropton']
    };
    
    this.proxies = this.generateProxies(50);
    this.currentProxyIndex = 0;
    
    this.logEvent('system', '🚀 Ultimate Bot System v6.0 Initialized');
  }
  
  generateProxies(count) {
    const proxies = [];
    for (let i = 0; i < count; i++) {
      proxies.push({
        id: `proxy_${crypto.randomBytes(8).toString('hex')}`,
        type: ['residential', 'mobile', 'vpn'][Math.floor(Math.random() * 3)],
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`,
        port: [8080, 8888, 1080, 3128][Math.floor(Math.random() * 4)],
        country: ['US', 'GB', 'DE', 'JP', 'CA'][Math.floor(Math.random() * 5)],
        speed: Math.floor(Math.random() * 100) + 50,
        latency: Math.floor(Math.random() * 100) + 20
      });
    }
    return proxies;
  }
  
  getNextProxy() {
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    return proxy;
  }
  
  async createBot(type) {
    const botNames = {
      agent: 'Agent',
      cropton: 'Cropton'
    };
    
    const botId = `bot_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const botName = botNames[type] || 'MinecraftBot';
    const proxy = this.getNextProxy();
    
    const bot = {
      id: botId,
      name: botName,
      type: type,
      proxy: proxy,
      status: 'created',
      health: 20,
      food: 20,
      position: null,
      activity: 'initializing',
      instance: null,
      intervals: [],
      performance: {
        messagesSent: 0,
        blocksMined: 0,
        distanceTraveled: 0,
        mobsKilled: 0,
        connections: 0
      },
      metadata: {
        created: Date.now(),
        sessionStart: null,
        sessionDuration: null,
        lastActivity: Date.now()
      }
    };
    
    this.bots.set(botId, bot);
    this.logEvent('bot_created', `🤖 Created ${botName} (${type})`);
    
    return bot;
  }
  
  async connectBot(bot) {
    this.logEvent('bot_connecting', `🔄 Connecting ${bot.name}...`);
    bot.status = 'connecting';
    
    try {
      await this.sleep(200 + Math.random() * 300); // Human-like delay
      
      const mcBot = mineflayer.createBot({
        host: this.config.server.host,
        port: this.config.server.port,
        username: bot.name,
        version: this.config.server.version,
        auth: 'offline',
        viewDistance: 6 + Math.floor(Math.random() * 4),
        difficulty: 2
      });
      
      bot.instance = mcBot;
      bot.metadata.sessionStart = Date.now();
      bot.metadata.sessionDuration = (2 + Math.random() * 4) * 3600000;
      bot.performance.connections++;
      
      // Setup event handlers
      this.setupBotEvents(bot, mcBot);
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 30000);
        
        mcBot.once('spawn', () => {
          clearTimeout(timeout);
          bot.status = 'connected';
          this.logEvent('bot_connected', `✅ ${bot.name} successfully connected!`);
          this.startBotActivities(bot);
          resolve(bot);
        });
        
        mcBot.once('error', (err) => {
          clearTimeout(timeout);
          bot.status = 'error';
          this.logEvent('bot_error', `❌ ${bot.name} connection error: ${err.message}`);
          reject(err);
        });
        
        mcBot.once('kicked', (reason) => {
          clearTimeout(timeout);
          bot.status = 'kicked';
          this.logEvent('bot_kicked', `🚫 ${bot.name} kicked: ${JSON.stringify(reason)}`);
          reject(new Error(`Kicked: ${JSON.stringify(reason)}`));
        });
      });
      
    } catch (error) {
      bot.status = 'failed';
      this.logEvent('bot_failed', `❌ Failed to connect ${bot.name}: ${error.message}`);
      throw error;
    }
  }
  
  setupBotEvents(bot, mcBot) {
    mcBot.on('health', () => {
      bot.health = mcBot.health;
      bot.food = mcBot.food;
      bot.metadata.lastActivity = Date.now();
    });
    
    mcBot.on('move', () => {
      if (mcBot.entity) {
        const oldPos = bot.position;
        bot.position = {
          x: Math.floor(mcBot.entity.position.x),
          y: Math.floor(mcBot.entity.position.y),
          z: Math.floor(mcBot.entity.position.z)
        };
        
        if (oldPos) {
          const distance = Math.sqrt(
            Math.pow(bot.position.x - oldPos.x, 2) +
            Math.pow(bot.position.z - oldPos.z, 2)
          );
          bot.performance.distanceTraveled += distance;
        }
        bot.metadata.lastActivity = Date.now();
      }
    });
    
    mcBot.on('chat', (username, message) => {
      if (username === bot.name) return;
      
      this.logEvent('chat_received', `💬 ${username}: ${message}`);
      
      // Auto-response with delay
      if (Math.random() < 0.4) {
        setTimeout(() => {
          if (mcBot && mcBot.player) {
            const response = this.generateChatResponse(bot, message, username);
            if (response) {
              mcBot.chat(response);
              bot.performance.messagesSent++;
              this.logEvent('chat_sent', `🤖 ${bot.name}: ${response}`);
            }
          }
        }, 1000 + Math.random() * 2000);
      }
    });
    
    mcBot.on('blockBreakProgressObserved', (block, destroyStage) => {
      if (destroyStage === 9) {
        bot.performance.blocksMined++;
        this.logEvent('block_mined', `⛏️ ${bot.name} mined ${block.name}`);
        bot.metadata.lastActivity = Date.now();
      }
    });
    
    mcBot.on('death', () => {
      bot.health = 20;
      this.logEvent('bot_died', `💀 ${bot.name} died!`);
      bot.metadata.lastActivity = Date.now();
    });
    
    mcBot.on('end', () => {
      bot.status = 'disconnected';
      this.logEvent('bot_disconnected', `🔌 ${bot.name} disconnected`);
      this.cleanupBotIntervals(bot);
    });
    
    mcBot.on('entityGone', (entity) => {
      if (entity.type === 'mob' && entity.killer === mcBot.entity) {
        bot.performance.mobsKilled++;
        this.logEvent('mob_killed', `⚔️ ${bot.name} killed ${entity.name}`);
        bot.metadata.lastActivity = Date.now();
      }
    });
  }
  
  generateChatResponse(bot, message, sender) {
    const responses = {
      agent: [
        'Mission underway.', 'Area secure.', 'Copy that.',
        'Proceeding as planned.', 'Affirmative.', 'Surveillance active.',
        'Target acquired.', 'Roger that.', 'All clear.', 'Reporting in.'
      ],
      cropton: [
        'Found some diamonds!', 'Mining in progress.', 'Strike the earth!',
        'Deep underground.', 'Need more torches.', 'Rich ore vein here!',
        'Tunnel network expanding.', 'Found some iron!', 'Digging deep!'
      ]
    };
    
    const botResponses = responses[bot.type] || ['Hello!'];
    
    if (message.toLowerCase().includes(bot.name.toLowerCase())) {
      const directResponses = [
        `Yes ${sender}?`, `What do you need ${sender}?`, `I'm here ${sender}.`,
        `Listening ${sender}.`, `Yes?`, `What's up?`
      ];
      return directResponses[Math.floor(Math.random() * directResponses.length)];
    }
    
    if (message.includes('?')) {
      const questionResponses = [
        'Good question.', 'I think so.', 'Not sure about that.',
        'Probably.', 'Maybe.', 'Let me check.'
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }
    
    if (Math.random() < 0.4) {
      return botResponses[Math.floor(Math.random() * botResponses.length)];
    }
    
    return null;
  }
  
  startBotActivities(bot) {
    if (!bot.instance) return;
    
    // Clear existing intervals
    this.cleanupBotIntervals(bot);
    
    // Main activity loop
    const activityInterval = setInterval(() => {
      if (!bot.instance || bot.status !== 'connected') {
        clearInterval(activityInterval);
        return;
      }
      
      const activity = this.decideActivity(bot);
      bot.activity = activity;
      this.executeActivity(bot, activity);
      
    }, 8000 + Math.random() * 12000);
    
    bot.intervals.push(activityInterval);
    
    // Anti-AFK system
    const afkInterval = setInterval(() => {
      if (bot.instance && bot.status === 'connected') {
        this.antiAFKMovement(bot);
      }
    }, 30000 + Math.random() * 60000);
    
    bot.intervals.push(afkInterval);
    
    // Chat system
    const chatInterval = setInterval(() => {
      if (bot.instance && bot.status === 'connected' && Math.random() < 0.3) {
        this.sendRandomChat(bot);
      }
    }, 45000 + Math.random() * 90000);
    
    bot.intervals.push(chatInterval);
  }
  
  decideActivity(bot) {
    const activities = ['mining', 'building', 'exploring', 'socializing', 'idle', 'farming', 'combat'];
    
    // Weighted decision based on bot type
    const weights = {
      agent: { exploring: 8, socializing: 3, mining: 4, building: 6, combat: 2 },
      cropton: { mining: 9, building: 3, exploring: 7, socializing: 2, farming: 5 }
    };
    
    const botWeights = weights[bot.type] || {};
    const weightedActivities = [];
    
    activities.forEach(activity => {
      const weight = botWeights[activity] || 5;
      for (let i = 0; i < weight; i++) {
        weightedActivities.push(activity);
      }
    });
    
    return weightedActivities[Math.floor(Math.random() * weightedActivities.length)] || 'idle';
  }
  
  executeActivity(bot, activity) {
    if (!bot.instance) return;
    
    const mcBot = bot.instance;
    
    setTimeout(() => {
      try {
        switch (activity) {
          case 'mining':
            bot.activity = 'Mining...';
            mcBot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
            
            if (Math.random() < 0.4) {
              const block = mcBot.blockAt(mcBot.entity.position.offset(0, -1, 0));
              if (block && block.name !== 'air') {
                mcBot.dig(block);
              }
            }
            break;
            
          case 'building':
            bot.activity = 'Building...';
            if (Math.random() < 0.3) {
              const block = mcBot.blockAt(mcBot.entity.position.offset(
                Math.floor(Math.random() * 3) - 1,
                0,
                Math.floor(Math.random() * 3) - 1
              ));
              if (block && block.name === 'air') {
                mcBot.placeBlock(block, { x: 0, y: 1, z: 0 });
              }
            }
            break;
            
          case 'exploring':
            bot.activity = 'Exploring...';
            const directions = ['forward', 'back', 'left', 'right'];
            const direction = directions[Math.floor(Math.random() * directions.length)];
            mcBot.setControlState(direction, true);
            setTimeout(() => {
              if (mcBot) mcBot.setControlState(direction, false);
            }, 1000 + Math.random() * 2000);
            
            mcBot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
            break;
            
          case 'socializing':
            bot.activity = 'Socializing...';
            mcBot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
            break;
            
          case 'farming':
            bot.activity = 'Farming...';
            if (Math.random() < 0.4) {
              const block = mcBot.blockAt(mcBot.entity.position.offset(0, -1, 0));
              if (block && block.name.includes('wheat')) {
                mcBot.dig(block);
              }
            }
            break;
            
          case 'combat':
            bot.activity = 'Combat training...';
            const entities = Object.values(mcBot.entities || {});
            const hostileMobs = entities.filter(e => 
              e.type === 'mob' && ['zombie', 'skeleton', 'spider', 'creeper'].includes(e.name)
            );
            
            if (hostileMobs.length > 0 && bot.health > 5) {
              const target = hostileMobs[0];
              mcBot.attack(target);
            }
            break;
            
          default:
            bot.activity = 'Idle';
            if (Math.random() < 0.5) {
              mcBot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
            }
        }
      } catch (error) {
        console.error(`Activity error for ${bot.name}:`, error.message);
      }
    }, 200 + Math.random() * 300);
  }
  
  antiAFKMovement(bot) {
    if (!bot.instance) return;
    
    const actions = [
      () => {
        bot.instance.setControlState('jump', true);
        setTimeout(() => {
          if (bot.instance) bot.instance.setControlState('jump', false);
        }, 200);
      },
      () => {
        bot.instance.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
      },
      () => {
        const dir = ['forward', 'back', 'left', 'right'][Math.floor(Math.random() * 4)];
        bot.instance.setControlState(dir, true);
        setTimeout(() => {
          if (bot.instance) bot.instance.setControlState(dir, false);
        }, 500);
      }
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    action();
  }
  
  sendRandomChat(bot) {
    if (!bot.instance) return;
    
    const messages = {
      agent: [
        'Mission accomplished.', 'All clear.', 'Reporting in.',
        'Surveillance active.', 'Area secure.', 'Proceeding as planned.'
      ],
      cropton: [
        'Found some ores!', 'Mining in progress.', 'Deep underground.',
        'Strike the earth!', 'Need more torches.', 'Rich mineral deposit!'
      ]
    };
    
    const botMessages = messages[bot.type] || ['Hello everyone!'];
    const message = botMessages[Math.floor(Math.random() * botMessages.length)];
    
    bot.instance.chat(message);
    bot.performance.messagesSent++;
    this.logEvent('chat_sent', `💬 ${bot.name}: ${message}`);
  }
  
  cleanupBotIntervals(bot) {
    bot.intervals.forEach(interval => clearInterval(interval));
    bot.intervals = [];
  }
  
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async startAllBots() {
    this.logEvent('system', '🚀 Starting both bots...');
    
    const results = { successful: [], failed: [] };
    
    for (const type of this.config.botTypes) {
      try {
        const bot = await this.createBot(type);
        
        // Stagger connections
        await this.sleep(3000);
        
        await this.connectBot(bot);
        results.successful.push({
          botId: bot.id,
          name: bot.name,
          type: bot.type,
          proxy: bot.proxy.ip
        });
        
      } catch (error) {
        results.failed.push({
          type: type,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      message: `Started ${results.successful.length} bots`,
      results: results
    };
  }
  
  async emergencyStop() {
    this.logEvent('system', '🛑 Emergency stop activated');
    
    let stopped = 0;
    
    for (const [botId, bot] of this.bots) {
      this.cleanupBotIntervals(bot);
      
      if (bot.instance) {
        try {
          bot.instance.quit();
          bot.instance = null;
        } catch (error) {
          this.logEvent('error', `Error stopping ${bot.name}: ${error.message}`);
        }
      }
      
      bot.status = 'stopped';
      stopped++;
    }
    
    return {
      success: true,
      message: `Stopped ${stopped} bots`,
      stopped: stopped
    };
  }
  
  getConnectedBots() {
    return Array.from(this.bots.values()).filter(bot => bot.status === 'connected');
  }
  
  getRecentEvents(limit = 10) {
    return this.events.slice(-limit).reverse().map(event => ({
      message: event.message,
      type: event.type,
      time: new Date(event.timestamp).toLocaleTimeString()
    }));
  }
  
  logEvent(type, message) {
    const event = {
      type,
      message,
      timestamp: Date.now()
    };
    
    this.events.push(event);
    if (this.events.length > 100) {
      this.events = this.events.slice(-50);
    }
    
    const prefix = type === 'error' ? '❌' : 
                  type === 'system' ? '🚀' : 
                  type === 'bot_created' ? '🤖' :
                  type === 'bot_connected' ? '✅' :
                  type === 'chat_received' ? '💬' :
                  type === 'chat_sent' ? '🤖' :
                  'ℹ️';
    console.log(`${prefix} ${message}`);
    
    return event;
  }
  
  async getStatus() {
    const connectedBots = this.getConnectedBots();
    const totalUptime = connectedBots.reduce((sum, bot) => {
      return sum + (bot.metadata.sessionStart ? Date.now() - bot.metadata.sessionStart : 0);
    }, 0);
    
    return {
      stats: {
        totalBots: this.bots.size,
        connectedBots: connectedBots.length,
        uptime: Math.floor(process.uptime()),
        server: `${this.config.server.host}:${this.config.server.port}`,
        averageUptime: connectedBots.length > 0 ? Math.floor(totalUptime / connectedBots.length / 1000) : 0
      },
      bots: connectedBots.map(bot => ({
        id: bot.id,
        name: bot.name,
        type: bot.type,
        status: bot.status,
        health: bot.health,
        food: bot.food,
        activity: bot.activity,
        ip: bot.proxy.ip,
        position: bot.position ? `${bot.position.x},${bot.position.y},${bot.position.z}` : 'Unknown',
        performance: bot.performance,
        uptime: bot.metadata.sessionStart ? Math.floor((Date.now() - bot.metadata.sessionStart) / 1000) : 0
      }))
    };
  }
}

// ================= EXPRESS SERVER =================
let botSystem = new UltimateBotSystem();

app.use(express.json());

// Auto-setup check
if (!fs.existsSync('.env')) {
  console.log('⚙️ First run - auto-setup will run automatically');
}

// Dashboard
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Minecraft Bot System</title>
    <style>
      body { font-family: Arial; background: #0f172a; color: white; margin: 0; padding: 20px; }
      .container { max-width: 1200px; margin: 0 auto; }
      .header { background: #1e293b; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
      .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
      .stat-card { background: #334155; padding: 20px; border-radius: 8px; text-align: center; }
      .controls { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
      button { background: #3b82f6; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; }
      button:hover { background: #2563eb; }
      .bot-list { background: #1e293b; padding: 20px; border-radius: 10px; margin-top: 20px; }
      .bot-card { background: #334155; padding: 15px; margin: 10px 0; border-radius: 6px; }
      .feed { background: #1e293b; padding: 20px; border-radius: 10px; margin-top: 20px; height: 300px; overflow-y: auto; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🤖 Minecraft Bot System v6.0</h1>
        <p>Server: gameplannet.aternos.me:43658 • 2 Bots: Agent & Cropton</p>
      </div>
      
      <div class="stats" id="stats">
        <!-- Stats will be updated by JavaScript -->
      </div>
      
      <div class="controls">
        <button onclick="sendCommand('start_all')">▶️ Start Both Bots</button>
        <button onclick="sendCommand('stop_all')">⏹️ Stop All</button>
        <button onclick="sendCommand('add_agent')">🤖 Add Agent</button>
        <button onclick="sendCommand('add_cropton')">⛏️ Add Cropton</button>
      </div>
      
      <div class="bot-list" id="botList">
        <h3>🤖 Active Bots</h3>
        <div id="botsContainer"></div>
      </div>
      
      <div class="feed" id="feed">
        <h3>📝 Activity Feed</h3>
        <div id="feedContent"></div>
      </div>
    </div>
    
    <script>
      let ws;
      
      function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(protocol + '//' + window.location.host);
        
        ws.onopen = () => {
          addToFeed('✅ Connected to server');
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            updateDashboard(data);
          } catch (e) {
            console.error('Error parsing data:', e);
          }
        };
        
        ws.onerror = (error) => {
          addToFeed('❌ WebSocket error');
        };
        
        ws.onclose = () => {
          addToFeed('🔌 Disconnected. Reconnecting...');
          setTimeout(connectWebSocket, 3000);
        };
      }
      
      function updateDashboard(data) {
        // Update stats
        const stats = data.stats || {};
        document.getElementById('stats').innerHTML = \`
          <div class="stat-card">
            <h3>🤖 Active Bots</h3>
            <h2>\${stats.connectedBots || 0}/\${stats.totalBots || 0}</h2>
          </div>
          <div class="stat-card">
            <h3>🕐 Uptime</h3>
            <h2>\${formatTime(stats.uptime || 0)}</h2>
          </div>
          <div class="stat-card">
            <h3>🌐 Server</h3>
            <h2>\${stats.server || 'gameplannet.aternos.me:43658'}</h2>
          </div>
        \`;
        
        // Update bots
        const bots = data.bots || [];
        let botsHtml = '';
        if (bots.length === 0) {
          botsHtml = '<p>No active bots. Click "Start Both Bots" to begin.</p>';
        } else {
          bots.forEach(bot => {
            botsHtml += \`
              <div class="bot-card">
                <h4>\${bot.name} (\${bot.type})</h4>
                <p>Status: \${bot.status} • Health: \${bot.health}/20</p>
                <p>Activity: \${bot.activity} • Position: \${bot.position || 'Unknown'}</p>
                <p>IP: \${bot.ip} • Uptime: \${formatTime(bot.uptime || 0)}</p>
              </div>
            \`;
          });
        }
        document.getElementById('botsContainer').innerHTML = botsHtml;
        
        // Add events to feed
        if (data.events) {
          data.events.forEach(event => {
            addToFeed(event.message);
          });
        }
      }
      
      function sendCommand(command) {
        fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command })
        })
        .then(response => response.json())
        .then(data => {
          addToFeed(data.message || 'Command executed');
        })
        .catch(error => {
          addToFeed('❌ Command failed: ' + error.message);
        });
      }
      
      function addToFeed(message) {
        const feed = document.getElementById('feedContent');
        const time = new Date().toLocaleTimeString();
        feed.innerHTML = \`[\${time}] \${message}<br>\` + feed.innerHTML;
        if (feed.children.length > 50) {
          feed.removeChild(feed.lastChild);
        }
      }
      
      function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return \`\${hours}h \${minutes}m \${secs}s\`;
      }
      
      // Initialize
      connectWebSocket();
      
      // Load initial data
      fetch('/api/status')
        .then(response => response.json())
        .then(data => updateDashboard(data))
        .catch(error => addToFeed('❌ Failed to load status'));
    </script>
  </body>
  </html>
  `;
  res.send(html);
});

// API Endpoints
app.get('/api/status', async (req, res) => {
  try {
    const status = await botSystem.getStatus();
    res.json({
      ...status,
      events: botSystem.getRecentEvents(5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/command', async (req, res) => {
  const { command } = req.body;
  
  try {
    let result;
    
    switch (command) {
      case 'start_all':
        result = await botSystem.startAllBots();
        break;
      case 'stop_all':
        result = await botSystem.emergencyStop();
        break;
      case 'add_agent':
        const agent = await botSystem.createBot('agent');
        setTimeout(() => botSystem.connectBot(agent), 3000);
        result = { message: 'Agent bot created. Connecting...' };
        break;
      case 'add_cropton':
        const cropton = await botSystem.createBot('cropton');
        setTimeout(() => botSystem.connectBot(cropton), 3000);
        result = { message: 'Cropton bot created. Connecting...' };
        break;
      default:
        return res.status(400).json({ error: 'Unknown command' });
    }
    
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket connection');
  
  const sendUpdate = async () => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        const status = await botSystem.getStatus();
        
        ws.send(JSON.stringify({
          ...status,
          events: botSystem.getRecentEvents(3)
        }));
      } catch (error) {
        console.error('WebSocket update error:', error);
      }
    }
  };
  
  const interval = setInterval(sendUpdate, 2000);
  
  ws.on('close', () => {
    console.log('🔌 WebSocket disconnected');
    clearInterval(interval);
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   🚀 Minecraft Bot System v6.0                          ║
║   ⚡ No Native Dependencies • Works on Render.com       ║
╚══════════════════════════════════════════════════════════╝
`);
  
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('🎯 CONFIGURATION:');
  console.log(`   Server: gameplannet.aternos.me:43658`);
  console.log(`   Version: 1.21.10`);
  console.log(`   Bots: 2 (Agent & Cropton)`);
  console.log('='.repeat(60));
  console.log('🚀 Ready! Use the dashboard to start bots...');
});

// WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await botSystem.emergencyStop();
  server.close(() => {
    console.log('🎮 Server shutdown complete.');
    process.exit(0);
  });
});
