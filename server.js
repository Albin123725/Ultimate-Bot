const express = require('express');
const WebSocket = require('ws');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawn, fork } = require('child_process');
const axios = require('axios');

// Auto-setup
(async () => {
  try {
    if (!fs.existsSync('.env') || !fs.existsSync('package.json')) {
      console.log('⚙️ Running auto-setup...');
      const { setup } = require('./auto-setup');
      await setup();
    }
  } catch (error) {
    console.error('Setup error:', error.message);
  }
})();

const app = express();
const PORT = process.env.PORT || 3000;

// Load bot manager
const BotManager = require('./bot-manager');
const botManager = new BotManager();

// Initialize
botManager.initialize().then(() => {
  console.log('✅ Bot Manager Initialized');
}).catch(console.error);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve dashboard
app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎮 Ultimate Minecraft Bot System 2024</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: #6366f1; --primary-dark: #4f46e5; --secondary: #8b5cf6;
        --success: #10b981; --warning: #f59e0b; --danger: #ef4444;
        --info: #3b82f6; --dark: #0f172a; --darker: #0a0f1c;
        --dark-light: #1e293b; --light: #f8fafc; --gray: #64748b;
        --discord: #5865f2; --minecraft: #62b74b; --aternos: #00a8ff;
        --gradient: linear-gradient(135deg, var(--primary), var(--secondary));
        --glass: rgba(255, 255, 255, 0.05);
        --glass-border: rgba(255, 255, 255, 0.1);
      }
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: 'Poppins', sans-serif;
        background: var(--darker);
        color: var(--light);
        min-height: 100vh;
        overflow-x: hidden;
        background-image: 
          radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 20%);
      }
      
      .container { max-width: 1800px; margin: 0 auto; padding: 20px; }
      
      /* Header */
      .header {
        background: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 24px;
        padding: 40px;
        margin-bottom: 30px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
      
      .header-content {
        text-align: center;
        position: relative;
        z-index: 2;
      }
      
      .title {
        font-size: 3.5rem;
        background: var(--gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 10px;
        font-weight: 800;
      }
      
      .subtitle {
        color: #94a3b8;
        font-size: 1.2rem;
        margin-bottom: 30px;
      }
      
      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 15px;
        margin-top: 30px;
      }
      
      .stat-card {
        background: var(--glass);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
      }
      
      .stat-card:hover {
        transform: translateY(-5px);
        border-color: var(--primary);
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
      }
      
      .stat-icon {
        font-size: 2rem;
        margin-bottom: 10px;
      }
      
      .stat-value {
        font-size: 2.2rem;
        font-weight: 800;
        margin: 5px 0;
      }
      
      .stat-label {
        color: var(--gray);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      /* Controls */
      .controls-section {
        margin: 40px 0;
      }
      
      .controls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 20px;
      }
      
      .btn {
        padding: 18px 25px;
        border: none;
        border-radius: 14px;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: var(--dark-light);
        color: var(--light);
        border: 1px solid var(--glass-border);
      }
      
      .btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      }
      
      .btn-primary { background: var(--gradient); color: white; border: none; }
      .btn-success { background: var(--success); color: white; border: none; }
      .btn-warning { background: var(--warning); color: white; border: none; }
      .btn-danger { background: var(--danger); color: white; border: none; }
      .btn-discord { background: var(--discord); color: white; border: none; }
      .btn-minecraft { background: var(--minecraft); color: white; border: none; }
      
      /* Bot Grid */
      .bot-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }
      
      .bot-card {
        background: linear-gradient(145deg, var(--dark-light), var(--dark));
        border-radius: 18px;
        padding: 25px;
        border-left: 6px solid;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .bot-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      }
      
      .bot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .bot-name {
        font-size: 1.3rem;
        font-weight: 700;
      }
      
      .bot-status {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
      }
      
      .online { background: rgba(16, 185, 129, 0.1); color: var(--success); }
      .offline { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
      .connecting { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
      
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      
      .status-dot.online { background: var(--success); animation: pulse 2s infinite; }
      .status-dot.offline { background: var(--danger); }
      .status-dot.connecting { background: var(--warning); animation: pulse 1s infinite; }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .bot-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin: 15px 0;
      }
      
      .stat-item {
        background: rgba(0, 0, 0, 0.2);
        padding: 12px;
        border-radius: 10px;
      }
      
      .stat-label { font-size: 0.8rem; color: var(--gray); margin-bottom: 4px; }
      .stat-value { font-size: 1.1rem; font-weight: 600; }
      
      .progress-bar {
        height: 8px;
        background: rgba(100, 116, 139, 0.3);
        border-radius: 4px;
        margin: 10px 0;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
      }
      
      /* Live Feed */
      .live-feed {
        background: rgba(15, 23, 42, 0.9);
        border-radius: 20px;
        padding: 25px;
        margin: 30px 0;
        border: 1px solid var(--glass-border);
        height: 400px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .feed-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .feed-content {
        flex: 1;
        overflow-y: auto;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
        line-height: 1.6;
        padding: 10px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
      }
      
      .feed-entry {
        margin-bottom: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        background: rgba(30, 41, 59, 0.5);
        border-left: 4px solid;
        animation: fadeIn 0.3s ease;
      }
      
      /* Notification */
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 12px;
        background: var(--dark-light);
        border: 1px solid var(--glass-border);
        color: white;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
      }
      
      .notification.show { transform: translateX(0); }
      .notification.success { border-left: 4px solid var(--success); }
      .notification.error { border-left: 4px solid var(--danger); }
      .notification.warning { border-left: 4px solid var(--warning); }
      
      /* Tabs */
      .tabs {
        display: flex;
        gap: 10px;
        margin: 30px 0;
        background: var(--dark-light);
        padding: 10px;
        border-radius: 12px;
      }
      
      .tab {
        padding: 12px 24px;
        background: transparent;
        border: none;
        color: var(--gray);
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .tab.active {
        background: var(--primary);
        color: white;
      }
      
      .tab-content {
        display: none;
      }
      
      .tab-content.active {
        display: block;
        animation: fadeIn 0.5s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* System Info */
      .system-info {
        background: var(--glass);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 25px;
        margin: 30px 0;
      }
      
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
        margin-top: 15px;
      }
      
      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 12px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
      }
      
      .info-item span:first-child { color: var(--gray); }
      .info-item span:last-child { font-weight: 600; }
      
      /* Responsive */
      @media (max-width: 768px) {
        .container { padding: 10px; }
        .header { padding: 20px; }
        .title { font-size: 2.5rem; }
        .controls-grid { grid-template-columns: 1fr; }
        .bot-grid { grid-template-columns: 1fr; }
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
      }
      
      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 10px;
      }
      
      ::-webkit-scrollbar-track {
        background: var(--dark);
      }
      
      ::-webkit-scrollbar-thumb {
        background: var(--primary);
        border-radius: 5px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: var(--primary-dark);
      }
    </style>
  </head>
  <body>
    <div id="notification" class="notification"></div>
    
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <h1 class="title">
            <i class="fas fa-robot"></i> Ultimate Bot System 2024
          </h1>
          <p class="subtitle">
            Complete Automation Suite with All Advanced Features • Aternos Compatible
          </p>
          
          <div class="stats-grid" id="statsGrid">
            <!-- Dynamic stats -->
          </div>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="tabs">
        <button class="tab active" onclick="switchTab('dashboard')">
          <i class="fas fa-tachometer-alt"></i> Dashboard
        </button>
        <button class="tab" onclick="switchTab('bots')">
          <i class="fas fa-robot"></i> Bots
        </button>
        <button class="tab" onclick="switchTab('console')">
          <i class="fas fa-terminal"></i> Console
        </button>
        <button class="tab" onclick="switchTab('settings')">
          <i class="fas fa-cog"></i> Settings
        </button>
      </div>
      
      <!-- Dashboard Tab -->
      <div id="dashboard" class="tab-content active">
        <!-- Quick Controls -->
        <div class="controls-section">
          <h2 style="margin-bottom: 20px; font-size: 1.8rem;">
            <i class="fas fa-rocket"></i> Quick Controls
          </h2>
          <div class="controls-grid">
            <button class="btn btn-primary" onclick="sendCommand('start_all')">
              <i class="fas fa-play"></i> Start All Bots
            </button>
            <button class="btn btn-success" onclick="sendCommand('smart_join')">
              <i class="fas fa-brain"></i> Smart Join
            </button>
            <button class="btn btn-discord" onclick="sendCommand('spawn_party')">
              <i class="fas fa-users"></i> Spawn Party
            </button>
            <button class="btn btn-minecraft" onclick="sendCommand('auto_farm')">
              <i class="fas fa-tractor"></i> Auto Farm
            </button>
            <button class="btn btn-warning" onclick="sendCommand('rotate_all')">
              <i class="fas fa-sync-alt"></i> Rotate All
            </button>
            <button class="btn" onclick="sendCommand('build_village')">
              <i class="fas fa-city"></i> Build Village
            </button>
            <button class="btn" onclick="sendCommand('raid_mode')">
              <i class="fas fa-shield-alt"></i> Raid Mode
            </button>
            <button class="btn btn-danger" onclick="sendCommand('emergency_stop')">
              <i class="fas fa-stop"></i> Emergency Stop
            </button>
          </div>
        </div>
        
        <!-- Bot Status -->
        <h2 style="margin: 30px 0 20px; font-size: 1.8rem;">
          <i class="fas fa-robot"></i> Live Bot Status
        </h2>
        <div class="bot-grid" id="botGrid">
          <!-- Dynamic bot cards -->
        </div>
      </div>
      
      <!-- Bots Tab -->
      <div id="bots" class="tab-content">
        <div class="controls-section">
          <h2 style="margin-bottom: 20px; font-size: 1.8rem;">
            <i class="fas fa-plus"></i> Add New Bots
          </h2>
          <div class="controls-grid">
            <button class="btn" onclick="sendCommand('add_builder')">
              <i class="fas fa-hammer"></i> Add Builder
            </button>
            <button class="btn" onclick="sendCommand('add_miner')">
              <i class="fas fa-gem"></i> Add Miner
            </button>
            <button class="btn" onclick="sendCommand('add_explorer')">
              <i class="fas fa-map"></i> Add Explorer
            </button>
            <button class="btn" onclick="sendCommand('add_farmer')">
              <i class="fas fa-wheat-alt"></i> Add Farmer
            </button>
            <button class="btn" onclick="sendCommand('add_guard')">
              <i class="fas fa-shield-alt"></i> Add Guard
            </button>
            <button class="btn" onclick="sendCommand('add_redstoner')">
              <i class="fas fa-bolt"></i> Add Redstoner
            </button>
            <button class="btn" onclick="sendCommand('add_trader')">
              <i class="fas fa-coins"></i> Add Trader
            </button>
            <button class="btn" onclick="sendCommand('add_socializer')">
              <i class="fas fa-comments"></i> Add Socializer
            </button>
          </div>
        </div>
        
        <div id="allBotsGrid" class="bot-grid">
          <!-- All bots list -->
        </div>
      </div>
      
      <!-- Console Tab -->
      <div id="console" class="tab-content">
        <div class="live-feed">
          <div class="feed-header">
            <h3><i class="fas fa-terminal"></i> System Console</h3>
            <div>
              <button class="btn" onclick="clearConsole()" style="padding: 8px 16px; font-size: 0.9rem;">
                <i class="fas fa-trash"></i> Clear
              </button>
              <button class="btn" onclick="exportLogs()" style="padding: 8px 16px; font-size: 0.9rem;">
                <i class="fas fa-download"></i> Export
              </button>
            </div>
          </div>
          <div class="feed-content" id="consoleContent">
            [System] Initializing console...
          </div>
        </div>
      </div>
      
      <!-- Settings Tab -->
      <div id="settings" class="tab-content">
        <div class="system-info">
          <h3><i class="fas fa-sliders-h"></i> System Settings</h3>
          <div class="info-grid">
            <div class="info-item">
              <span>Max Bots:</span>
              <span><input type="number" id="maxBots" value="10" style="width: 60px; background: var(--dark); color: white; border: 1px solid var(--gray); border-radius: 4px; padding: 4px;"></span>
            </div>
            <div class="info-item">
              <span>Auto Reconnect:</span>
              <span><input type="checkbox" id="autoReconnect" checked style="transform: scale(1.2);"></span>
            </div>
            <div class="info-item">
              <span>Chat Enabled:</span>
              <span><input type="checkbox" id="chatEnabled" checked style="transform: scale(1.2);"></span>
            </div>
            <div class="info-item">
              <span>Anti-AFK:</span>
              <span><input type="checkbox" id="antiAFK" checked style="transform: scale(1.2);"></span>
            </div>
          </div>
          
          <button class="btn btn-primary" onclick="saveSettings()" style="margin-top: 20px;">
            <i class="fas fa-save"></i> Save Settings
          </button>
        </div>
        
        <div class="system-info" style="margin-top: 20px;">
          <h3><i class="fas fa-server"></i> Server Configuration</h3>
          <div style="margin-top: 15px;">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: var(--gray);">Server Address:</label>
              <input type="text" id="serverAddress" value="gameplannet.aternos.me" style="width: 100%; padding: 10px; background: var(--dark); color: white; border: 1px solid var(--gray); border-radius: 8px;">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: var(--gray);">Server Port:</label>
              <input type="text" id="serverPort" value="34286" style="width: 100%; padding: 10px; background: var(--dark); color: white; border: 1px solid var(--gray); border-radius: 8px;">
            </div>
            <button class="btn btn-success" onclick="testServer()">
              <i class="fas fa-network-wired"></i> Test Connection
            </button>
          </div>
        </div>
      </div>
      
      <!-- Live Feed -->
      <div class="live-feed">
        <div class="feed-header">
          <h3><i class="fas fa-chart-line"></i> Live Activity Feed</h3>
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
          [System] Loading activity feed...
        </div>
      </div>
      
      <!-- System Info -->
      <div class="system-info">
        <h3><i class="fas fa-info-circle"></i> System Information</h3>
        <div class="info-grid" id="systemInfo">
          <!-- Dynamic system info -->
        </div>
      </div>
    </div>
    
    <script>
      let ws;
      let systemData = {};
      let feedPaused = false;
      let consolePaused = false;
      
      // Initialize WebSocket
      function initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = \`\${protocol}//\${window.location.host}/ws\`;
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          addFeedEntry('✅ Connected to WebSocket server', 'system');
          addConsoleEntry('WebSocket connection established');
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
            
            if (!consolePaused && data.console) {
              data.console.forEach(entry => {
                addConsoleEntry(entry);
              });
            }
          } catch (error) {
            console.error('Failed to parse data:', error);
          }
        };
        
        ws.onerror = (error) => {
          addFeedEntry('❌ WebSocket error', 'error');
          addConsoleEntry('WebSocket error: ' + error.message);
        };
        
        ws.onclose = () => {
          addFeedEntry('🔌 Disconnected from server', 'warning');
          addConsoleEntry('WebSocket disconnected. Reconnecting...');
          setTimeout(initWebSocket, 3000);
        };
      }
      
      // Update dashboard
      function updateDashboard(data) {
        updateStatsGrid(data.stats);
        updateBotGrid(data.bots);
        updateSystemInfo(data.system);
        updateAllBotsGrid(data.allBots);
      }
      
      function updateStatsGrid(stats) {
        const statsGrid = document.getElementById('statsGrid');
        if (!statsGrid) return;
        
        const statItems = [
          { icon: 'fa-robot', label: 'ACTIVE BOTS', value: \`\${stats?.connectedBots || 0}/\${stats?.totalBots || 0}\`, color: 'var(--primary)' },
          { icon: 'fa-shield-alt', label: 'SECURITY', value: stats?.security || 'Active', color: stats?.security === 'Secure' ? 'var(--success)' : 'var(--warning)' },
          { icon: 'fa-bolt', label: 'PERFORMANCE', value: stats?.performance || '0%', color: 'var(--warning)' },
          { icon: 'fa-network-wired', label: 'NETWORK', value: stats?.networkHealth || 'Healthy', color: 'var(--secondary)' },
          { icon: 'fa-brain', label: 'AI STATUS', value: stats?.aiStatus || 'Active', color: 'var(--success)' },
          { icon: 'fa-clock', label: 'UPTIME', value: formatUptime(stats?.uptime || 0), color: 'var(--gray)' }
        ];
        
        let html = '';
        statItems.forEach(item => {
          html += \`
            <div class="stat-card">
              <div class="stat-icon" style="color: \${item.color}">
                <i class="fas \${item.icon}"></i>
              </div>
              <div class="stat-value">\${item.value}</div>
              <div class="stat-label">\${item.label}</div>
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
              <p>No active bots. Start the system first.</p>
            </div>
          \`;
          return;
        }
        
        let html = '';
        bots.forEach(bot => {
          const healthPercent = ((bot.health || 20) / 20) * 100;
          const statusClass = bot.status || 'offline';
          const statusText = bot.status === 'connected' ? 'Online' : 
                           bot.status === 'connecting' ? 'Connecting' : 'Offline';
          
          html += \`
            <div class="bot-card" style="border-left-color: \${getBotColor(bot.type)}">
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
                <i class="fas fa-bullseye"></i> \${bot.activity || 'Idle'} | \${bot.position || 'Unknown'}
              </div>
              
              <div style="margin-top: 10px; display: flex; gap: 8px;">
                <button class="btn" onclick="controlBot('\${bot.id}', 'kick')" style="padding: 6px 12px; font-size: 0.8rem;">
                  <i class="fas fa-sign-out-alt"></i> Kick
                </button>
                <button class="btn" onclick="controlBot('\${bot.id}', 'chat')" style="padding: 6px 12px; font-size: 0.8rem;">
                  <i class="fas fa-comment"></i> Chat
                </button>
                <button class="btn" onclick="controlBot('\${bot.id}', 'tp')" style="padding: 6px 12px; font-size: 0.8rem;">
                  <i class="fas fa-map-marker-alt"></i> TP
                </button>
              </div>
            </div>
          \`;
        });
        
        botGrid.innerHTML = html;
      }
      
      function updateAllBotsGrid(bots) {
        const grid = document.getElementById('allBotsGrid');
        if (!grid || !bots) return;
        
        let html = '';
        bots.forEach(bot => {
          html += \`
            <div class="bot-card" style="border-left-color: \${getBotColor(bot.type)}">
              <div class="bot-header">
                <div class="bot-name">\${bot.name}</div>
                <div class="bot-status \${bot.status}">
                  <span class="status-dot \${bot.status}"></span>
                  \${bot.status}
                </div>
              </div>
              <div style="margin-top: 10px;">
                <div style="font-size: 0.9rem; color: var(--gray);">Type: \${bot.type}</div>
                <div style="font-size: 0.9rem; color: var(--gray); margin-top: 5px;">Created: \${bot.created}</div>
              </div>
            </div>
          \`;
        });
        
        grid.innerHTML = html;
      }
      
      function updateSystemInfo(system) {
        const systemInfo = document.getElementById('systemInfo');
        if (!systemInfo) return;
        
        const info = system || {};
        const html = \`
          <div class="info-item">
            <span>Platform:</span>
            <span>\${info.platform || navigator.platform}</span>
          </div>
          <div class="info-item">
            <span>Node Version:</span>
            <span>\${info.nodeVersion || 'Unknown'}</span>
          </div>
          <div class="info-item">
            <span>Server:</span>
            <span>\${info.server || 'Not set'}</span>
          </div>
          <div class="info-item">
            <span>WebSocket:</span>
            <span>\${ws?.readyState === 1 ? 'Connected' : 'Disconnected'}</span>
          </div>
        \`;
        
        systemInfo.innerHTML = html;
      }
      
      // Helper functions
      function getBotColor(type) {
        const colors = {
          builder: 'var(--warning)',
          miner: 'var(--success)',
          explorer: 'var(--info)',
          farmer: 'var(--minecraft)',
          guard: 'var(--danger)',
          redstoner: 'var(--primary)',
          trader: 'var(--secondary)',
          socializer: 'var(--discord)'
        };
        return colors[type] || 'var(--primary)';
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
      
      // Tab switching
      function switchTab(tabName) {
        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => {
          tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Activate selected tab
        event.target.classList.add('active');
        document.getElementById(tabName).classList.add('active');
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
        })
        .catch(error => {
          showNotification('Failed to send command: ' + error.message, 'error');
        });
      }
      
      function controlBot(botId, action) {
        fetch('/api/bot-control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botId, action })
        })
        .then(response => response.json())
        .then(data => {
          showNotification(data.message, data.success ? 'success' : 'error');
        });
      }
      
      // Feed functions
      function addFeedEntry(message, type = 'system') {
        if (feedPaused) return;
        
        const feedContent = document.getElementById('feedContent');
        const timestamp = new Date().toLocaleTimeString();
        
        const entry = document.createElement('div');
        entry.className = 'feed-entry';
        entry.style.borderLeftColor = type === 'error' ? 'var(--danger)' : 
                                     type === 'warning' ? 'var(--warning)' : 'var(--success)';
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
      
      function addConsoleEntry(message) {
        const consoleContent = document.getElementById('consoleContent');
        const timestamp = new Date().toLocaleTimeString();
        
        const entry = document.createElement('div');
        entry.className = 'feed-entry';
        entry.style.borderLeftColor = 'var(--primary)';
        entry.innerHTML = \`
          <span style="color: var(--gray);">[\${timestamp}]</span>
          <span style="margin-left: 10px;">\${message}</span>
        \`;
        
        consoleContent.appendChild(entry);
        consoleContent.scrollTop = consoleContent.scrollHeight;
        
        if (consoleContent.children.length > 200) {
          consoleContent.removeChild(consoleContent.firstChild);
        }
      }
      
      function clearFeed() {
        const feedContent = document.getElementById('feedContent');
        feedContent.innerHTML = '';
        addFeedEntry('Feed cleared', 'system');
      }
      
      function clearConsole() {
        const consoleContent = document.getElementById('consoleContent');
        consoleContent.innerHTML = '';
        addConsoleEntry('Console cleared');
      }
      
      function pauseFeed() {
        feedPaused = !feedPaused;
        const button = event.currentTarget;
        button.innerHTML = feedPaused ? 
          '<i class="fas fa-play"></i> Resume' : 
          '<i class="fas fa-pause"></i> Pause';
        
        addFeedEntry(feedPaused ? 'Feed paused' : 'Feed resumed', 'system');
      }
      
      function exportLogs() {
        const consoleContent = document.getElementById('consoleContent');
        const logs = Array.from(consoleContent.children).map(el => el.textContent).join('\\n');
        
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`bot-logs-\${new Date().toISOString()}.txt\`;
        a.click();
        
        showNotification('Logs exported successfully', 'success');
      }
      
      // Settings
      function saveSettings() {
        const settings = {
          maxBots: document.getElementById('maxBots').value,
          autoReconnect: document.getElementById('autoReconnect').checked,
          chatEnabled: document.getElementById('chatEnabled').checked,
          antiAFK: document.getElementById('antiAFK').checked,
          serverAddress: document.getElementById('serverAddress').value,
          serverPort: document.getElementById('serverPort').value
        };
        
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        })
        .then(response => response.json())
        .then(data => {
          showNotification('Settings saved successfully', 'success');
        });
      }
      
      function testServer() {
        const address = document.getElementById('serverAddress').value;
        const port = document.getElementById('serverPort').value;
        
        fetch(\`/api/test-server?address=\${address}&port=\${port}\`)
          .then(response => response.json())
          .then(data => {
            showNotification(\`Server test: \${data.message}\`, data.online ? 'success' : 'error');
          });
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
});

// API Endpoints
app.get('/api/status', async (req, res) => {
  try {
    const status = await botManager.getStatus();
    const metrics = botManager.getMetrics();
    const system = botManager.getSystemInfo();
    
    res.json({
      timestamp: new Date().toISOString(),
      status: 'operational',
      stats: {
        totalBots: status.totalBots,
        connectedBots: status.connectedBots,
        successRate: status.successRate,
        performance: metrics.performance,
        security: 'Active',
        networkHealth: 'Optimal',
        aiStatus: 'Learning',
        uptime: Math.floor(process.uptime())
      },
      bots: status.bots,
      allBots: status.allBots,
      events: botManager.getRecentEvents(10),
      console: botManager.getConsoleLogs(5),
      system: system,
      metrics: metrics
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
        result = await botManager.startAllBots();
        break;
      case 'smart_join':
        result = await botManager.smartJoin();
        break;
      case 'spawn_party':
        result = await botManager.spawnParty();
        break;
      case 'auto_farm':
        result = await botManager.autoFarm();
        break;
      case 'rotate_all':
        result = await botManager.rotateAll();
        break;
      case 'build_village':
        result = await botManager.buildVillage();
        break;
      case 'raid_mode':
        result = await botManager.raidMode();
        break;
      case 'emergency_stop':
        result = await botManager.emergencyStop();
        break;
      case 'add_builder':
        result = await botManager.addBot('builder');
        break;
      case 'add_miner':
        result = await botManager.addBot('miner');
        break;
      case 'add_explorer':
        result = await botManager.addBot('explorer');
        break;
      case 'add_farmer':
        result = await botManager.addBot('farmer');
        break;
      case 'add_guard':
        result = await botManager.addBot('guard');
        break;
      case 'add_redstoner':
        result = await botManager.addBot('redstoner');
        break;
      case 'add_trader':
        result = await botManager.addBot('trader');
        break;
      case 'add_socializer':
        result = await botManager.addBot('socializer');
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

app.post('/api/bot-control', async (req, res) => {
  const { botId, action } = req.body;
  
  try {
    const result = await botManager.controlBot(botId, action);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    await botManager.updateSettings(req.body);
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test-server', async (req, res) => {
  try {
    const { address, port } = req.query;
    const result = await botManager.testServer(address || 'gameplannet.aternos.me', port || 34286);
    res.json(result);
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
        const status = await botManager.getStatus();
        const metrics = botManager.getMetrics();
        
        ws.send(JSON.stringify({
          type: 'update',
          timestamp: Date.now(),
          stats: {
            totalBots: status.totalBots,
            connectedBots: status.connectedBots,
            successRate: status.successRate
          },
          bots: status.bots,
          events: botManager.getRecentEvents(5),
          console: botManager.getConsoleLogs(3)
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
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE MINECRAFT BOT SYSTEM 2024                        ║
║   🎮 Complete Feature Suite • Aternos Optimized                ║
╚════════════════════════════════════════════════════════════════╝
`);
  
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`📊 API: http://localhost:${PORT}/api/status`);
  console.log('='.repeat(60));
  
  // Auto-start if configured
  setTimeout(() => {
    if (process.env.AUTO_START === 'true') {
      console.log('🚀 Auto-starting system...');
      botManager.startAllBots().catch(console.error);
    }
  }, 5000);
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
  botManager.emergencyStop();
  server.close(() => {
    console.log('🎮 Server shutdown complete.');
    process.exit(0);
  });
});

module.exports = app;
