const express = require('express');
const WebSocket = require('ws');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// Auto-setup
(async () => {
  try {
    if (!fs.existsSync('.env')) {
      console.log('⚙️ Running auto-setup...');
      const { setup } = require('./auto-setup');
      await setup();
    }
  } catch (error) {
    console.error('Setup error:', error.message);
  }
})();

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Load bot system
const BotSystem = require('./bot-system');
const botSystem = new BotSystem();

// Initialize
botSystem.initialize().then(() => {
  console.log('✅ Bot System Initialized');
}).catch(console.error);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ================= WEB DASHBOARD =================
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 Ultimate Minecraft Bot System v5.0</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      :root {
        --primary: #6366f1; --primary-dark: #4f46e5; --secondary: #8b5cf6;
        --success: #10b981; --warning: #f59e0b; --danger: #ef4444;
        --info: #3b82f6; --dark: #0f172a; --darker: #0a0f1c;
        --dark-light: #1e293b; --light: #f8fafc; --gray: #64748b;
        --gradient: linear-gradient(135deg, var(--primary), var(--secondary));
        --glass: rgba(255, 255, 255, 0.05);
      }
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: var(--darker);
        color: var(--light);
        min-height: 100vh;
        overflow-x: hidden;
      }
      
      .container { max-width: 1800px; margin: 0 auto; padding: 20px; }
      
      /* Header */
      .header {
        background: rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(100, 116, 139, 0.2);
        border-radius: 24px;
        padding: 40px;
        margin-bottom: 30px;
        position: relative;
        overflow: hidden;
      }
      
      .header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--gradient);
      }
      
      .title {
        font-size: 3rem;
        background: var(--gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 10px;
        text-align: center;
      }
      
      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }
      
      .stat-card {
        background: var(--glass);
        border: 1px solid rgba(100, 116, 139, 0.2);
        border-radius: 16px;
        padding: 25px;
        text-align: center;
        transition: all 0.3s ease;
      }
      
      .stat-card:hover {
        transform: translateY(-5px);
        border-color: var(--primary);
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
      }
      
      .stat-value {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 10px 0;
      }
      
      /* Controls */
      .controls {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 15px;
        margin: 30px 0;
      }
      
      .btn {
        padding: 15px 20px;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: var(--dark-light);
        color: var(--light);
        border: 1px solid rgba(100, 116, 139, 0.2);
      }
      
      .btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      }
      
      .btn-primary { background: var(--gradient); color: white; border: none; }
      .btn-success { background: var(--success); color: white; border: none; }
      .btn-warning { background: var(--warning); color: white; border: none; }
      .btn-danger { background: var(--danger); color: white; border: none; }
      .btn-info { background: var(--info); color: white; border: none; }
      
      /* Bot Grid */
      .bot-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }
      
      .bot-card {
        background: linear-gradient(145deg, var(--dark-light), var(--dark));
        border-radius: 16px;
        padding: 20px;
        border-left: 5px solid;
        transition: all 0.3s ease;
      }
      
      .bot-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      }
      
      .bot-card.builder { border-left-color: #10b981; }
      .bot-card.miner { border-left-color: #f59e0b; }
      .bot-card.explorer { border-left-color: #3b82f6; }
      .bot-card.socializer { border-left-color: #8b5cf6; }
      .bot-card.guardian { border-left-color: #ef4444; }
      
      .health-bar {
        height: 8px;
        background: rgba(100, 116, 139, 0.3);
        border-radius: 4px;
        margin: 10px 0;
        overflow: hidden;
      }
      
      .health-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
      }
      
      /* Live Feed */
      .live-feed {
        background: rgba(15, 23, 42, 0.9);
        border-radius: 16px;
        padding: 20px;
        margin: 30px 0;
        height: 400px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .feed-content {
        flex: 1;
        overflow-y: auto;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        line-height: 1.5;
        padding: 10px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
      }
      
      /* Notification */
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 12px;
        background: var(--dark-light);
        border: 1px solid rgba(100, 116, 139, 0.2);
        color: white;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
      }
      
      .notification.show { transform: translateX(0); }
      .notification.success { border-left: 4px solid var(--success); }
      .notification.error { border-left: 4px solid var(--danger); }
      
      @media (max-width: 768px) {
        .container { padding: 10px; }
        .header { padding: 20px; }
        .title { font-size: 2rem; }
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
        .controls { grid-template-columns: 1fr; }
        .bot-grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div id="notification" class="notification"></div>
    
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1 class="title">
          <i class="fas fa-robot"></i> Ultimate Bot System v5.0
        </h1>
        <p style="text-align: center; color: #94a3b8; margin-top: 10px;">
          REAL Minecraft Bots • Aternos Connection • Live Dashboard
        </p>
        
        <div class="stats-grid" id="statsGrid">
          <!-- Stats populated by JavaScript -->
        </div>
      </div>
      
      <!-- Controls -->
      <div class="controls">
        <button class="btn btn-primary" onclick="sendCommand('start_all')">
          <i class="fas fa-play"></i> Start All Bots
        </button>
        <button class="btn btn-success" onclick="sendCommand('connect_bots')">
          <i class="fas fa-plug"></i> Connect Bots
        </button>
        <button class="btn" onclick="sendCommand('rotate_accounts')">
          <i class="fas fa-user-friends"></i> Rotate Accounts
        </button>
        <button class="btn btn-warning" onclick="sendCommand('stop_bots')">
          <i class="fas fa-stop"></i> Stop Bots
        </button>
        <button class="btn btn-danger" onclick="sendCommand('emergency_stop')">
          <i class="fas fa-skull-crossbones"></i> Emergency Stop
        </button>
      </div>
      
      <!-- Bots -->
      <h2 style="margin: 30px 0 20px; color: var(--light);">
        <i class="fas fa-robot"></i> Live Bot Status
      </h2>
      <div class="bot-grid" id="botGrid">
        <!-- Bots populated by JavaScript -->
      </div>
      
      <!-- Live Feed -->
      <div class="live-feed">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <h3><i class="fas fa-stream"></i> Live Activity Feed</h3>
          <button class="btn" onclick="clearFeed()" style="padding: 8px 16px;">
            <i class="fas fa-trash"></i> Clear
          </button>
        </div>
        <div class="feed-content" id="feedContent">
          [System] Waiting for activity...
        </div>
      </div>
    </div>
    
    <script>
      let ws;
      let systemData = {};
      
      // Initialize WebSocket
      function initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = \`\${protocol}//\${window.location.host}/ws\`;
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          addFeedEntry('✅ Connected to WebSocket server', 'success');
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            systemData = data;
            updateDashboard(data);
            
            if (data.events) {
              data.events.forEach(entry => {
                addFeedEntry(entry.message, entry.type);
              });
            }
          } catch (error) {
            console.error('Failed to parse data:', error);
          }
        };
        
        ws.onerror = (error) => {
          addFeedEntry('❌ WebSocket error', 'error');
        };
        
        ws.onclose = () => {
          addFeedEntry('🔌 WebSocket disconnected. Reconnecting...', 'warning');
          setTimeout(initWebSocket, 3000);
        };
      }
      
      // Update dashboard
      function updateDashboard(data) {
        updateStatsGrid(data.stats);
        updateBotGrid(data.bots);
      }
      
      function updateStatsGrid(stats) {
        const statsGrid = document.getElementById('statsGrid');
        if (!statsGrid) return;
        
        const statItems = [
          { 
            icon: 'fa-robot', 
            label: 'ACTIVE BOTS', 
            value: \`\${stats?.connectedBots || 0}/\${stats?.totalBots || 0}\`, 
            color: 'var(--primary)' 
          },
          { 
            icon: 'fa-server', 
            label: 'SERVER', 
            value: stats?.serverOnline ? 'Online' : 'Offline', 
            color: stats?.serverOnline ? 'var(--success)' : 'var(--danger)' 
          },
          { 
            icon: 'fa-signal', 
            label: 'PING', 
            value: stats?.ping ? \`\${stats.ping}ms\` : 'N/A', 
            color: 'var(--info)' 
          },
          { 
            icon: 'fa-comments', 
            label: 'CHAT', 
            value: stats?.chatMessages || '0', 
            color: 'var(--secondary)' 
          },
          { 
            icon: 'fa-heart', 
            label: 'HEALTH AVG', 
            value: stats?.avgHealth || '20', 
            color: 'var(--success)' 
          },
          { 
            icon: 'fa-clock', 
            label: 'UPTIME', 
            value: formatUptime(stats?.uptime || 0), 
            color: 'var(--gray)' 
          }
        ];
        
        let html = '';
        statItems.forEach(item => {
          html += \`
            <div class="stat-card">
              <div style="font-size: 1.5rem; color: \${item.color}; margin-bottom: 10px;">
                <i class="fas \${item.icon}"></i>
              </div>
              <div class="stat-value">\${item.value}</div>
              <div style="color: var(--gray); font-size: 0.9rem;">\${item.label}</div>
            </div>
          \`;
        });
        
        statsGrid.innerHTML = html;
      }
      
      function updateBotGrid(bots) {
        const botGrid = document.getElementById('botGrid');
        if (!botGrid) return;
        
        if (!bots || bots.length === 0) {
          botGrid.innerHTML = \`
            <div class="bot-card">
              <div style="text-align: center; padding: 20px;">
                <i class="fas fa-robot" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px;"></i>
                <p>No bots connected. Click "Start All Bots" to begin.</p>
              </div>
            </div>
          \`;
          return;
        }
        
        let html = '';
        bots.forEach(bot => {
          const healthPercent = ((bot.health || 20) / 20) * 100;
          const healthColor = healthPercent > 70 ? 'var(--success)' : 
                            healthPercent > 30 ? 'var(--warning)' : 'var(--danger)';
          
          const statusColor = bot.status === 'connected' ? 'var(--success)' :
                            bot.status === 'connecting' ? 'var(--info)' :
                            bot.status === 'disconnected' ? 'var(--warning)' : 'var(--danger)';
          
          html += \`
            <div class="bot-card \${bot.type || 'builder'}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                  <div style="font-weight: 700; font-size: 1.2rem;">\${bot.name || 'Unknown'}</div>
                  <div style="font-size: 0.8rem; color: var(--gray); margin-top: 2px;">\${bot.account || 'N/A'}</div>
                </div>
                <div style="font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; 
                     background: \${statusColor}20; color: \${statusColor};">
                  \${bot.status || 'unknown'}
                </div>
              </div>
              
              <div style="margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 5px;">
                  <span>Health</span>
                  <span>\${bot.health || 0}/20</span>
                </div>
                <div class="health-bar">
                  <div class="health-fill" style="width: \${healthPercent}%; background: \${healthColor};"></div>
                </div>
              </div>
              
              <div style="font-size: 0.85rem; color: var(--gray);">
                <div style="margin-bottom: 5px;">📍 Position: \${bot.position || 'Unknown'}</div>
                <div>🎯 Activity: \${bot.activity || 'Idle'}</div>
              </div>
            </div>
          \`;
        });
        
        botGrid.innerHTML = html;
      }
      
      // Command sending
      function sendCommand(command) {
        fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: command })
        })
        .then(response => response.json())
        .then(data => {
          showNotification(data.message || 'Command executed', data.success ? 'success' : 'error');
          if (data.success) {
            setTimeout(() => {
              fetch('/api/status').then(r => r.json()).then(updateDashboard);
            }, 2000);
          }
        })
        .catch(error => {
          showNotification('Failed to send command: ' + error.message, 'error');
        });
      }
      
      // Feed functions
      function addFeedEntry(message, type = 'info') {
        const feedContent = document.getElementById('feedContent');
        const timestamp = new Date().toLocaleTimeString();
        
        const entry = document.createElement('div');
        entry.style = \`
          margin-bottom: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(30, 41, 59, 0.5);
          border-left: 4px solid \${type === 'success' ? 'var(--success)' : 
                               type === 'error' ? 'var(--danger)' : 
                               type === 'warning' ? 'var(--warning)' : 'var(--info)'};
          font-size: 0.9rem;
          animation: fadeIn 0.3s ease;
        \`;
        entry.innerHTML = \`
          <span style="color: var(--gray);">[\${timestamp}]</span>
          <span style="margin-left: 10px;">\${message}</span>
        \`;
        
        feedContent.appendChild(entry);
        feedContent.scrollTop = feedContent.scrollHeight;
        
        if (feedContent.children.length > 100) {
          feedContent.removeChild(feedContent.firstChild);
        }
      }
      
      function clearFeed() {
        const feedContent = document.getElementById('feedContent');
        feedContent.innerHTML = '';
        addFeedEntry('Feed cleared', 'info');
      }
      
      function formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return \`\${hours}h \${minutes}m \${secs}s\`;
      }
      
      function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = \`notification \${type} show\`;
        
        setTimeout(() => {
          notification.classList.remove('show');
        }, 3000);
      }
      
      // Initialize
      window.addEventListener('DOMContentLoaded', () => {
        initWebSocket();
        
        // Load initial data
        fetch('/api/status')
          .then(response => response.json())
          .then(data => {
            updateDashboard(data);
            addFeedEntry('System status loaded successfully', 'success');
          })
          .catch(error => {
            addFeedEntry('Failed to load status: ' + error.message, 'error');
          });
      });
    </script>
  </body>
  </html>
  `;
  res.send(html);
});

// ================= API ENDPOINTS =================

app.get('/api/status', async (req, res) => {
  try {
    const status = await botSystem.getStatus();
    res.json({
      timestamp: new Date().toISOString(),
      stats: status.stats,
      bots: status.bots,
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
      case 'connect_bots':
        result = await botSystem.startAllBots();
        break;
      case 'stop_bots':
        result = await botSystem.stopAllBots();
        break;
      case 'emergency_stop':
        result = await botSystem.emergencyStop();
        break;
      case 'rotate_accounts':
        result = await botSystem.rotateAccounts();
        break;
      default:
        return res.status(400).json({ error: 'Unknown command' });
    }
    
    res.json({ success: true, message: result.message, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= WEBSOCKET SERVER =================

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket connection');
  
  const sendUpdate = async () => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        const status = await botSystem.getStatus();
        
        ws.send(JSON.stringify({
          timestamp: Date.now(),
          stats: status.stats,
          bots: status.bots,
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

// ================= START SERVER =================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   🚀 REAL Minecraft Bot System v5.0                      ║
║   ⚡ Connects to Aternos • Live Dashboard                ║
╚══════════════════════════════════════════════════════════╝
`);
  
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  console.log(`🎯 Target Server: ${botSystem.config.server.host}:${botSystem.config.server.port}`);
  console.log('='.repeat(60));
});

// WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  botSystem.emergencyStop();
  server.close(() => {
    console.log('🎮 Server shutdown complete.');
    process.exit(0);
  });
});

module.exports = app;
