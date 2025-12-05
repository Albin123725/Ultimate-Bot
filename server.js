const express = require('express');
const WebSocket = require('ws');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Auto-setup on start
async function runAutoSetup() {
  try {
    if (!fs.existsSync('.env') || !fs.existsSync('package.json')) {
      console.log('⚙️ Running auto-setup...');
      const AutoSetup = require('./auto-setup');
      const setup = new AutoSetup();
      await setup.setup();
    }
  } catch (error) {
    console.error('Auto-setup error:', error.message);
  }
}

// Run auto-setup immediately
runAutoSetup();

const app = express();
const PORT = process.env.PORT || 10000;

// Load bot system
const UltimateBotSystem = require('./bot-system');
const botSystem = new UltimateBotSystem();

// Initialize bot system
botSystem.initialize().catch(console.error);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ================= COMPLETE WEB DASHBOARD =================
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎮 Ultimate Minecraft Bot System v10.0</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      :root {
        --primary: #3b82f6; --primary-dark: #2563eb; --secondary: #8b5cf6;
        --success: #10b981; --warning: #f59e0b; --danger: #ef4444;
        --dark: #0f172a; --darker: #0a0f1c; --dark-light: #1e293b;
        --light: #f8fafc; --gray: #64748b; --gray-dark: #334155;
        --gradient: linear-gradient(135deg, var(--primary), var(--secondary));
      }
      
      * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
      
      body { background: var(--darker); color: var(--light); min-height: 100vh; overflow-x: hidden; }
      
      .container { max-width: 1800px; margin: 0 auto; padding: 20px; }
      
      .header {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
        border-radius: 24px; padding: 40px; margin-bottom: 30px;
        border: 1px solid rgba(100, 116, 139, 0.2);
        backdrop-filter: blur(20px);
        position: relative; overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      
      .header::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
        background: var(--gradient);
      }
      
      .status-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px; margin-top: 30px;
      }
      
      .status-item {
        background: rgba(30, 41, 59, 0.6); padding: 20px; border-radius: 16px;
        border: 1px solid rgba(100, 116, 139, 0.1);
        transition: all 0.3s ease; cursor: pointer;
      }
      
      .status-item:hover {
        transform: translateY(-5px); border-color: var(--primary);
        box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
      }
      
      .status-icon { font-size: 2rem; margin-bottom: 10px; }
      
      .status-value {
        font-size: 2.2rem; font-weight: 800; margin: 5px 0;
        background: var(--gradient); -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .status-label { color: var(--gray); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
      
      .controls {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px; margin: 30px 0;
      }
      
      .btn {
        padding: 18px 25px; border: none; border-radius: 14px;
        font-weight: 600; font-size: 1rem; cursor: pointer;
        transition: all 0.3s ease; display: flex;
        align-items: center; justify-content: center; gap: 12px;
        background: var(--dark-light); color: var(--light);
        border: 1px solid rgba(100, 116, 139, 0.2);
      }
      
      .btn:hover {
        transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      }
      
      .btn-primary { background: var(--gradient); color: white; border: none; }
      .btn-success { background: var(--success); color: white; border: none; }
      .btn-warning { background: var(--warning); color: white; border: none; }
      .btn-danger { background: var(--danger); color: white; border: none; }
      
      .bot-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px; margin: 30px 0;
      }
      
      .bot-card {
        background: linear-gradient(145deg, var(--dark-light), var(--dark));
        border-radius: 18px; padding: 25px;
        border-left: 6px solid; transition: all 0.3s ease;
        position: relative; overflow: hidden;
      }
      
      .bot-card:hover {
        transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      }
      
      .bot-header {
        display: flex; justify-content: space-between;
        align-items: center; margin-bottom: 15px;
      }
      
      .bot-name { font-size: 1.3rem; font-weight: 700; }
      
      .bot-status {
        display: flex; align-items: center; gap: 6px;
        padding: 4px 12px; border-radius: 20px;
        font-size: 0.85rem; font-weight: 600;
      }
      
      .bot-status.online { background: rgba(16, 185, 129, 0.1); color: var(--success); }
      .bot-status.offline { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
      
      .status-dot {
        width: 8px; height: 8px; border-radius: 50%;
      }
      
      .status-dot.online { background: var(--success); }
      .status-dot.offline { background: var(--danger); }
      
      .bot-stats {
        display: grid; grid-template-columns: repeat(2, 1fr);
        gap: 12px; margin: 15px 0;
      }
      
      .stat-item {
        background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 10px;
      }
      
      .stat-label { font-size: 0.8rem; color: var(--gray); margin-bottom: 4px; }
      .stat-value { font-size: 1.2rem; font-weight: 600; }
      
      .progress-bar {
        height: 8px; background: rgba(100, 116, 139, 0.3);
        border-radius: 4px; margin: 10px 0; overflow: hidden;
      }
      
      .progress-fill {
        height: 100%; border-radius: 4px; transition: width 0.3s ease;
      }
      
      .live-feed {
        background: rgba(15, 23, 42, 0.9); border-radius: 20px;
        padding: 25px; margin: 30px 0;
        border: 1px solid rgba(100, 116, 139, 0.2);
        height: 400px; overflow: hidden; display: flex; flex-direction: column;
      }
      
      .feed-header {
        display: flex; justify-content: space-between;
        align-items: center; margin-bottom: 20px;
      }
      
      .feed-content {
        flex: 1; overflow-y: auto; font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px; line-height: 1.6; padding: 10px;
        background: rgba(0, 0, 0, 0.2); border-radius: 10px;
      }
      
      .feed-entry {
        margin-bottom: 8px; padding: 8px 12px; border-radius: 8px;
        background: rgba(30, 41, 59, 0.5); border-left: 4px solid;
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .notification {
        position: fixed; top: 20px; right: 20px; padding: 15px 25px;
        border-radius: 12px; background: var(--dark-light);
        border: 1px solid rgba(100, 116, 139, 0.2); color: white;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); z-index: 1000;
        transform: translateX(400px); transition: transform 0.3s ease;
      }
      
      .notification.show { transform: translateX(0); }
      .notification.success { border-left: 4px solid var(--success); }
      .notification.error { border-left: 4px solid var(--danger); }
      .notification.warning { border-left: 4px solid var(--warning); }
      
      .loading {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; padding: 40px; color: var(--gray);
      }
      
      .spinner {
        width: 40px; height: 40px; border: 3px solid rgba(59, 130, 246, 0.1);
        border-radius: 50%; border-top-color: var(--primary);
        animation: spin 1s ease-in-out infinite; margin-bottom: 15px;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .system-info {
        background: rgba(30, 41, 59, 0.6); padding: 25px; border-radius: 16px;
        margin: 30px 0; border: 1px solid rgba(100, 116, 139, 0.1);
      }
      
      .info-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px; margin-top: 15px;
      }
      
      .info-item {
        display: flex; justify-content: space-between;
        padding: 12px; background: rgba(0, 0, 0, 0.2); border-radius: 8px;
      }
      
      .info-item span:first-child { color: var(--gray); }
      .info-item span:last-child { font-weight: 600; }
      
      @media (max-width: 768px) {
        .container { padding: 10px; }
        .header { padding: 20px; }
        .controls { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
        .bot-grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div id="notification" class="notification"></div>
    
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div style="text-align: center;">
          <h1 style="font-size: 3rem; background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;">
            <i class="fas fa-robot"></i> Ultimate Bot System v10
          </h1>
          <p style="color: #94a3b8; font-size: 1.1rem;">
            Complete Automation with All Advanced Features
          </p>
        </div>
        
        <div class="status-grid" id="statusGrid">
          <!-- Will be populated by JavaScript -->
        </div>
      </div>
      
      <!-- Main Controls -->
      <div class="controls">
        <button class="btn btn-primary" onclick="sendCommand('full_start')">
          <i class="fas fa-rocket"></i> Full System Start
        </button>
        <button class="btn btn-success" onclick="sendCommand('smart_auto_join')">
          <i class="fas fa-plug"></i> Smart Auto-Join
        </button>
        <button class="btn" onclick="sendCommand('add_builder')">
          <i class="fas fa-hammer"></i> Add Builder
        </button>
        <button class="btn" onclick="sendCommand('add_explorer')">
          <i class="fas fa-map"></i> Add Explorer
        </button>
        <button class="btn" onclick="sendCommand('add_miner')">
          <i class="fas fa-gem"></i> Add Miner
        </button>
        <button class="btn" onclick="sendCommand('add_socializer')">
          <i class="fas fa-comments"></i> Add Socializer
        </button>
        <button class="btn" onclick="sendCommand('rotate_all')">
          <i class="fas fa-sync-alt"></i> Rotate All Systems
        </button>
        <button class="btn btn-danger" onclick="sendCommand('emergency_stop')">
          <i class="fas fa-stop-circle"></i> Emergency Stop
        </button>
      </div>
      
      <!-- Bot Status -->
      <h2 style="margin: 30px 0 20px; font-size: 1.8rem;">
        <i class="fas fa-robot"></i> Live Bot Status
      </h2>
      <div class="bot-grid" id="botGrid">
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading bot data...</p>
        </div>
      </div>
      
      <!-- Live Feed -->
      <div class="live-feed">
        <div class="feed-header">
          <h3><i class="fas fa-chart-line"></i> Live System Feed</h3>
          <div>
            <button class="btn" onclick="clearFeed()" style="padding: 8px 16px; font-size: 0.9rem;">
              <i class="fas fa-trash"></i> Clear
            </button>
            <button class="btn" onclick="pauseFeed()" style="padding: 8px 16px; font-size: 0.9rem;">
              <i class="fas fa-pause"></i> Pause
            </button>
          </div>
        </div>
        <div class="feed-content" id="feedContent">
          [${new Date().toLocaleTimeString()}] System initialized. Connecting to WebSocket...
        </div>
      </div>
      
      <!-- System Information -->
      <div class="system-info">
        <h3><i class="fas fa-info-circle"></i> System Information</h3>
        <div class="info-grid" id="systemInfo">
          <div class="info-item">
            <span>Platform:</span>
            <span id="platform">${os.platform()}</span>
          </div>
          <div class="info-item">
            <span>Node Version:</span>
            <span id="nodeVersion">${process.version}</span>
          </div>
          <div class="info-item">
            <span>Server Address:</span>
            <span id="serverAddress">${process.env.MINECRAFT_HOST || 'Not set'}</span>
          </div>
          <div class="info-item">
            <span>WebSocket:</span>
            <span id="wsStatus">Connecting...</span>
          </div>
        </div>
      </div>
    </div>
    
    <script>
      let ws;
      let systemData = {};
      let feedPaused = false;
      
      function initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = protocol + '//' + window.location.host + '/ws';
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          updateStatus('wsStatus', 'Connected', 'success');
          addFeedEntry('✅ Connected to WebSocket server', 'system');
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            systemData = data;
            updateDashboard(data);
            
            if (!feedPaused && data.events) {
              data.events.forEach(entry => {
                addFeedEntry(entry.message, entry.type);
              });
            }
          } catch (error) {
            console.error('Failed to parse data:', error);
          }
        };
        
        ws.onerror = (error) => {
          updateStatus('wsStatus', 'Error', 'danger');
          addFeedEntry('❌ WebSocket error', 'error');
        };
        
        ws.onclose = () => {
          updateStatus('wsStatus', 'Disconnected', 'danger');
          addFeedEntry('🔌 Disconnected from server', 'warning');
          
          // Reconnect after 5 seconds
          setTimeout(initWebSocket, 5000);
        };
      }
      
      function updateDashboard(data) {
        // Update status grid
        updateStatusGrid(data.stats);
        
        // Update bot grid
        if (data.bots && Array.isArray(data.bots)) {
          updateBotGrid(data.bots);
        }
      }
      
      function updateStatusGrid(stats) {
        const statusGrid = document.getElementById('statusGrid');
        if (!statusGrid) return;
        
        const statusItems = [
          { icon: 'fa-robot', label: 'ACTIVE BOTS', value: \`\${stats?.connectedBots || 0}/\${stats?.totalBots || 0}\`, color: 'var(--primary)' },
          { icon: 'fa-shield-alt', label: 'SECURITY', value: stats?.security || 'Active', color: stats?.security === 'Secure' ? 'var(--success)' : 'var(--warning)' },
          { icon: 'fa-bolt', label: 'PERFORMANCE', value: stats?.performance || '0%', color: 'var(--warning)' },
          { icon: 'fa-network-wired', label: 'NETWORK', value: stats?.networkHealth || 'Healthy', color: 'var(--secondary)' },
          { icon: 'fa-brain', label: 'AI STATUS', value: stats?.aiStatus || 'Active', color: 'var(--success)' },
          { icon: 'fa-clock', label: 'UPTIME', value: formatUptime(stats?.uptime || 0), color: 'var(--gray)' }
        ];
        
        let html = '';
        statusItems.forEach(item => {
          html += \`
            <div class="status-item">
              <div class="status-icon" style="color: \${item.color}">
                <i class="fas \${item.icon}"></i>
              </div>
              <div class="status-value">\${item.value}</div>
              <div class="status-label">\${item.label}</div>
            </div>
          \`;
        });
        
        statusGrid.innerHTML = html;
      }
      
      function updateBotGrid(bots) {
        const botGrid = document.getElementById('botGrid');
        const botLoading = botGrid.querySelector('.loading');
        
        if (botLoading) {
          botLoading.style.display = 'none';
        }
        
        if (!bots || bots.length === 0) {
          botGrid.innerHTML = '<div class="bot-card"><p>No bots active. Start the system first.</p></div>';
          return;
        }
        
        let html = '';
        bots.forEach(bot => {
          const healthPercent = ((bot.health || 20) / 20) * 100;
          const statusClass = bot.connected ? 'online' : 'offline';
          const statusText = bot.connected ? 'Online' : 'Offline';
          
          html += \`
            <div class="bot-card">
              <div class="bot-header">
                <div class="bot-name">\${bot.name || 'Unknown'}</div>
                <div class="bot-status \${statusClass}">
                  <span class="status-dot \${statusClass}"></span>
                  \${statusText}
                </div>
              </div>
              
              <div class="bot-stats">
                <div class="stat-item">
                  <div class="stat-label">Type</div>
                  <div class="stat-value">\${bot.type || 'Unknown'}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Account</div>
                  <div class="stat-value">\${bot.account || 'N/A'}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">IP</div>
                  <div class="stat-value">\${bot.ip || 'Dynamic'}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Session</div>
                  <div class="stat-value">\${bot.sessionTime || '0m'}</div>
                </div>
              </div>
              
              <div class="progress-bar">
                <div class="progress-fill" style="width: \${healthPercent}%; background: \${getHealthColor(healthPercent)};"></div>
              </div>
              
              <div style="margin-top: 15px; font-size: 0.9rem; color: var(--gray);">
                <i class="fas fa-bullseye"></i> \${bot.activity || 'Idle'}
              </div>
            </div>
          \`;
        });
        
        botGrid.innerHTML = html;
      }
      
      function addFeedEntry(message, type = 'system') {
        if (feedPaused) return;
        
        const feedContent = document.getElementById('feedContent');
        const timestamp = new Date().toLocaleTimeString();
        
        const entry = document.createElement('div');
        entry.className = \`feed-entry\`;
        entry.style.borderLeftColor = type === 'error' ? 'var(--danger)' : 
                                     type === 'warning' ? 'var(--warning)' : 'var(--success)';
        entry.innerHTML = \`
          <span style="color: var(--gray);">[\${timestamp}]</span>
          <span style="margin-left: 10px;">\${message}</span>
        \`;
        
        feedContent.appendChild(entry);
        feedContent.scrollTop = feedContent.scrollHeight;
        
        // Keep only 50 entries
        if (feedContent.children.length > 50) {
          feedContent.removeChild(feedContent.firstChild);
        }
      }
      
      function clearFeed() {
        const feedContent = document.getElementById('feedContent');
        feedContent.innerHTML = '';
        addFeedEntry('Feed cleared', 'system');
      }
      
      function pauseFeed() {
        feedPaused = !feedPaused;
        const button = event.currentTarget;
        button.innerHTML = feedPaused ? 
          '<i class="fas fa-play"></i> Resume' : 
          '<i class="fas fa-pause"></i> Pause';
        
        addFeedEntry(feedPaused ? 'Feed paused' : 'Feed resumed', 'system');
      }
      
      function sendCommand(command) {
        fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: command })
        })
        .then(response => response.json())
        .then(data => {
          showNotification(data.message || 'Command executed', data.success ? 'success' : 'error');
        })
        .catch(error => {
          console.error('Command error:', error);
          showNotification('Failed to send command', 'error');
        });
      }
      
      function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification ' + type + ' show';
        
        setTimeout(() => {
          notification.classList.remove('show');
        }, 3000);
      }
      
      function updateStatus(elementId, text, type) {
        const element = document.getElementById(elementId);
        if (element) {
          element.textContent = text;
          element.style.color = type === 'success' ? 'var(--success)' : 
                              type === 'danger' ? 'var(--danger)' : 
                              type === 'warning' ? 'var(--warning)' : 'var(--gray)';
        }
      }
      
      function getHealthColor(percent) {
        if (percent > 70) return 'var(--success)';
        if (percent > 30) return 'var(--warning)';
        return 'var(--danger)';
      }
      
      function formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return \`\${hours}h \${minutes}m\`;
      }
      
      // Initialize
      window.addEventListener('DOMContentLoaded', () => {
        initWebSocket();
        
        // Set platform info
        document.getElementById('platform').textContent = navigator.platform;
        
        // Request initial status
        setTimeout(() => {
          fetch('/api/status')
            .then(response => response.json())
            .then(data => {
              updateDashboard(data);
              addFeedEntry('System status loaded', 'system');
            })
            .catch(error => {
              addFeedEntry('Failed to load status: ' + error.message, 'error');
            });
        }, 1000);
      });
    </script>
  </body>
  </html>
  `;
  res.send(html);
});

// ================= API ENDPOINTS =================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '10.0.0',
    timestamp: new Date().toISOString(),
    systems: {
      botSystem: 'running',
      network: 'active',
      security: 'enabled',
      ai: 'online',
      web: 'operational',
      websocket: 'connected'
    }
  });
});

app.get('/api/status', async (req, res) => {
  try {
    const status = botSystem.getStatus();
    const metrics = botSystem.getMetrics();
    const health = botSystem.getSystemHealth();
    
    res.json({
      timestamp: new Date().toISOString(),
      status: 'operational',
      stats: {
        totalBots: status.totalBots,
        connectedBots: status.connectedBots,
        successRate: status.successRate,
        performance: `${health.cpu} / ${health.memory}`,
        security: health.health === 'healthy' ? 'Secure' : 'Monitoring',
        networkHealth: 'Optimal',
        aiStatus: 'Learning Active',
        uptime: Math.floor(process.uptime())
      },
      bots: status.bots,
      events: botSystem.getRecentEvents(10),
      metrics: metrics,
      systemHealth: health
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
      case 'full_start':
        result = await botSystem.startFullSystem();
        break;
      case 'smart_auto_join':
        result = await botSystem.smartAutoJoin();
        break;
      case 'add_builder':
        result = await botSystem.addBot('builder');
        break;
      case 'add_explorer':
        result = await botSystem.addBot('explorer');
        break;
      case 'add_miner':
        result = await botSystem.addBot('miner');
        break;
      case 'add_socializer':
        result = await botSystem.addBot('socializer');
        break;
      case 'rotate_all':
        result = await botSystem.rotateAllSystems();
        break;
      case 'emergency_stop':
        result = await botSystem.emergencyStop();
        break;
      case 'check_server':
        result = await botSystem.checkServerStatus();
        break;
      case 'generate_activity':
        result = await botSystem.generateNaturalActivity();
        break;
      case 'train_ai':
        result = await botSystem.trainAI();
        break;
      default:
        return res.status(400).json({ error: 'Unknown command' });
    }
    
    res.json({ 
      success: true, 
      message: result.message || 'Command executed', 
      data: result 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bots', (req, res) => {
  res.json(botSystem.getAllBots());
});

app.get('/api/metrics', (req, res) => {
  res.json(botSystem.getMetrics());
});

// ================= WEBSOCKET SERVER =================
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket client connected');
  
  // Send initial status
  sendSystemUpdate(ws);
  
  // Send updates every 2 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      sendSystemUpdate(ws);
    }
  }, 2000);
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    clearInterval(interval);
  });
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      } else if (data.type === 'get_status') {
        sendSystemUpdate(ws);
      } else if (data.type === 'command') {
        const response = await handleCommand(data.command);
        ws.send(JSON.stringify({ type: 'command_response', ...response }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });
});

// ================= HELPER FUNCTIONS =================
async function sendSystemUpdate(ws) {
  try {
    const status = botSystem.getStatus();
    const metrics = botSystem.getMetrics();
    const health = botSystem.getSystemHealth();
    const events = botSystem.getRecentEvents(5);
    
    ws.send(JSON.stringify({
      type: 'system_update',
      timestamp: new Date().toISOString(),
      stats: {
        totalBots: status.totalBots,
        connectedBots: status.connectedBots,
        successRate: status.successRate,
        performance: `${health.cpu} / ${health.memory}`,
        security: health.health === 'healthy' ? 'Secure' : 'Monitoring',
        networkHealth: 'Optimal',
        aiStatus: 'Active',
        uptime: Math.floor(process.uptime())
      },
      bots: status.bots,
      events: events,
      metrics: metrics,
      systemHealth: health
    }));
  } catch (error) {
    console.error('Failed to send system update:', error);
  }
}

async function handleCommand(command) {
  try {
    let result;
    
    switch (command) {
      case 'full_start':
        result = await botSystem.startFullSystem();
        break;
      case 'smart_auto_join':
        result = await botSystem.smartAutoJoin();
        break;
      default:
        result = { success: false, message: 'Unknown command' };
    }
    
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ================= START SERVER =================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   🎮 ULTIMATE MINECRAFT BOT SYSTEM v10.0                 ║
║   ⚡ Complete Feature Integration                         ║
╚══════════════════════════════════════════════════════════╝
`);
  
  console.log('🌐 Web Dashboard: http://localhost:' + PORT);
  console.log('📡 WebSocket: ws://localhost:' + PORT + '/ws');
  console.log('📊 Health Check: http://localhost:' + PORT + '/health');
  console.log('='.repeat(60));
  
  // Auto-start if configured
  setTimeout(() => {
    if (process.env.AUTO_START === 'true') {
      console.log('🚀 Auto-starting system...');
      botSystem.startFullSystem().catch(console.error);
    }
  }, 10000);
});

// Handle WebSocket upgrades
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
