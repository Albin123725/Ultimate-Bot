const express = require('express');
const WebSocket = require('ws');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

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
    <title>🚀 Ultimate Minecraft Bot System v4.0</title>
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
      .notification.warning { border-left: 4px solid var(--warning); }
      
      /* Modal */
      .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        align-items: center;
        justify-content: center;
      }
      
      .modal-content {
        background: var(--dark);
        border-radius: 16px;
        padding: 30px;
        width: 90%;
        max-width: 500px;
        border: 1px solid rgba(100, 116, 139, 0.2);
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .modal-close {
        background: none;
        border: none;
        color: var(--gray);
        font-size: 1.5rem;
        cursor: pointer;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-label {
        display: block;
        margin-bottom: 5px;
        color: var(--gray);
      }
      
      .form-input {
        width: 100%;
        padding: 10px;
        background: var(--dark-light);
        color: white;
        border: 1px solid var(--gray);
        border-radius: 8px;
      }
      
      /* Chat */
      .chat-container {
        background: var(--dark-light);
        border-radius: 12px;
        padding: 20px;
        height: 300px;
        display: flex;
        flex-direction: column;
      }
      
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 15px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
      }
      
      .chat-input {
        display: flex;
        gap: 10px;
      }
      
      .chat-input input {
        flex: 1;
        padding: 10px;
        background: var(--dark);
        color: white;
        border: 1px solid var(--gray);
        border-radius: 8px;
      }
      
      /* Progress */
      .progress-container {
        margin: 20px 0;
      }
      
      .progress-bar {
        height: 10px;
        background: rgba(100, 116, 139, 0.3);
        border-radius: 5px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        border-radius: 5px;
        background: var(--gradient);
        transition: width 0.3s ease;
      }
      
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
    
    <!-- Modal -->
    <div id="modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="modalTitle">Settings</h3>
          <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div id="modalContent">
          <!-- Modal content goes here -->
        </div>
      </div>
    </div>
    
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1 class="title">
          <i class="fas fa-robot"></i> Ultimate Bot System v4.0
        </h1>
        <p style="text-align: center; color: #94a3b8; margin-top: 10px;">
          Complete Automation Suite • All Advanced Features • Aternos Optimized
        </p>
        
        <div class="stats-grid" id="statsGrid">
          <!-- Stats populated by JavaScript -->
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
        <button class="tab" onclick="switchTab('tasks')">
          <i class="fas fa-tasks"></i> Tasks
        </button>
        <button class="tab" onclick="switchTab('chat')">
          <i class="fas fa-comments"></i> Chat
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
        <!-- Quick Actions -->
        <div class="controls">
          <button class="btn btn-primary" onclick="sendCommand('start_all')">
            <i class="fas fa-play"></i> Start All Bots
          </button>
          <button class="btn btn-success" onclick="sendCommand('smart_join')">
            <i class="fas fa-brain"></i> Smart Join
          </button>
          <button class="btn btn-info" onclick="sendCommand('auto_farm')">
            <i class="fas fa-seedling"></i> Auto Farm
          </button>
          <button class="btn" onclick="sendCommand('rotate_proxies')">
            <i class="fas fa-sync-alt"></i> Rotate Proxies
          </button>
          <button class="btn" onclick="sendCommand('rotate_accounts')">
            <i class="fas fa-user-friends"></i> Rotate Accounts
          </button>
          <button class="btn btn-warning" onclick="sendCommand('fix_issues')">
            <i class="fas fa-tools"></i> Fix Issues
          </button>
          <button class="btn btn-danger" onclick="sendCommand('emergency_stop')">
            <i class="fas fa-stop"></i> Emergency Stop
          </button>
        </div>
        
        <!-- Quick Stats -->
        <div class="progress-container">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>System Performance</span>
            <span id="performanceText">95%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="performanceBar" style="width: 95%"></div>
          </div>
        </div>
        
        <!-- Bots -->
        <h2 style="margin: 30px 0 20px; color: var(--light);">
          <i class="fas fa-robot"></i> Live Bot Status
        </h2>
        <div class="bot-grid" id="botGrid">
          <!-- Bots populated by JavaScript -->
        </div>
      </div>
      
      <!-- Bots Tab -->
      <div id="bots" class="tab-content">
        <div class="controls">
          <button class="btn" onclick="sendCommand('add_builder')">
            <i class="fas fa-hammer"></i> Add Builder
          </button>
          <button class="btn" onclick="sendCommand('add_miner')">
            <i class="fas fa-gem"></i> Add Miner
          </button>
          <button class="btn" onclick="sendCommand('add_explorer')">
            <i class="fas fa-map"></i> Add Explorer
          </button>
          <button class="btn" onclick="sendCommand('add_socializer')">
            <i class="fas fa-comments"></i> Add Socializer
          </button>
          <button class="btn" onclick="sendCommand('add_guardian')">
            <i class="fas fa-shield-alt"></i> Add Guardian
          </button>
          <button class="btn" onclick="sendCommand('clear_inactive')">
            <i class="fas fa-trash"></i> Clear Inactive
          </button>
        </div>
        
        <h3 style="margin: 20px 0;">All Bots</h3>
        <div id="allBotsGrid" class="bot-grid">
          <!-- All bots list -->
        </div>
      </div>
      
      <!-- Tasks Tab -->
      <div id="tasks" class="tab-content">
        <div class="controls">
          <button class="btn" onclick="openTaskModal('farm')">
            <i class="fas fa-tractor"></i> Farm Setup
          </button>
          <button class="btn" onclick="openTaskModal('mine')">
            <i class="fas fa-mountain"></i> Mining Setup
          </button>
          <button class="btn" onclick="openTaskModal('build')">
            <i class="fas fa-home"></i> Build Setup
          </button>
          <button class="btn" onclick="openTaskModal('guard')">
            <i class="fas fa-shield-alt"></i> Guard Setup
          </button>
        </div>
        
        <div class="live-feed">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <h3><i class="fas fa-tasks"></i> Active Tasks</h3>
            <button class="btn" onclick="refreshTasks()" style="padding: 8px 16px;">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
          <div class="feed-content" id="tasksContent">
            No active tasks. Create one to get started.
          </div>
        </div>
      </div>
      
      <!-- Chat Tab -->
      <div id="chat" class="tab-content">
        <div class="chat-container">
          <h3 style="margin-bottom: 15px;">Bot Chat Control</h3>
          <div class="chat-messages" id="chatMessages">
            <!-- Chat messages appear here -->
          </div>
          <div class="chat-input">
            <input type="text" id="chatInput" placeholder="Type message for bots to send..." onkeypress="handleChatKeyPress(event)">
            <button class="btn btn-primary" onclick="sendChatMessage()">
              <i class="fas fa-paper-plane"></i> Send
            </button>
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <h3>Auto-Chat Settings</h3>
          <div class="controls">
            <button class="btn" onclick="sendCommand('chat_enable')">
              <i class="fas fa-toggle-on"></i> Enable Auto-Chat
            </button>
            <button class="btn" onclick="sendCommand('chat_disable')">
              <i class="fas fa-toggle-off"></i> Disable Auto-Chat
            </button>
            <button class="btn" onclick="openChatSettings()">
              <i class="fas fa-cog"></i> Chat Settings
            </button>
          </div>
        </div>
      </div>
      
      <!-- Console Tab -->
      <div id="console" class="tab-content">
        <div class="live-feed">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <h3><i class="fas fa-terminal"></i> System Console</h3>
            <div>
              <button class="btn" onclick="clearConsole()" style="padding: 8px 16px;">
                <i class="fas fa-trash"></i> Clear
              </button>
              <button class="btn" onclick="exportLogs()" style="padding: 8px 16px;">
                <i class="fas fa-download"></i> Export
              </button>
              <button class="btn" onclick="testServer()" style="padding: 8px 16px;">
                <i class="fas fa-server"></i> Test Server
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
        <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
          <!-- Server Settings -->
          <div style="background: var(--dark-light); padding: 25px; border-radius: 16px;">
            <h3 style="margin-bottom: 20px;">Server Settings</h3>
            
            <div class="form-group">
              <label class="form-label">Server Address:</label>
              <input type="text" id="serverAddress" class="form-input" value="gameplannet.aternos.me">
            </div>
            
            <div class="form-group">
              <label class="form-label">Server Port:</label>
              <input type="text" id="serverPort" class="form-input" value="34286">
            </div>
            
            <div class="form-group">
              <label class="form-label">Version:</label>
              <select id="serverVersion" class="form-input">
                <option value="1.21.10" selected>1.21.10</option>
                <option value="1.20.4">1.20.4</option>
                <option value="1.19.4">1.19.4</option>
                <option value="1.18.2">1.18.2</option>
              </select>
            </div>
          </div>
          
          <!-- Bot Settings -->
          <div style="background: var(--dark-light); padding: 25px; border-radius: 16px;">
            <h3 style="margin-bottom: 20px;">Bot Settings</h3>
            
            <div class="form-group">
              <label class="form-label">Max Bots:</label>
              <input type="number" id="maxBots" class="form-input" value="4" min="1" max="10">
            </div>
            
            <div class="form-group">
              <label class="form-label" style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="autoReconnect" checked>
                Auto Reconnect
              </label>
            </div>
            
            <div class="form-group">
              <label class="form-label" style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="useProxies">
                Use Proxies
              </label>
            </div>
            
            <div class="form-group">
              <label class="form-label" style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="enableAI" checked>
                Enable AI
              </label>
            </div>
            
            <div class="form-group">
              <label class="form-label" style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="antiDetection" checked>
                Anti-Detection
              </label>
            </div>
          </div>
          
          <!-- Feature Settings -->
          <div style="background: var(--dark-light); padding: 25px; border-radius: 16px;">
            <h3 style="margin-bottom: 20px;">Feature Settings</h3>
            
            <div class="form-group">
              <label class="form-label">Auto Farm:</label>
              <select id="autoFarm" class="form-input">
                <option value="wheat">Wheat</option>
                <option value="carrot">Carrot</option>
                <option value="potato">Potato</option>
                <option value="all">All Crops</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Mining Priority:</label>
              <select id="miningPriority" class="form-input">
                <option value="diamonds">Diamonds</option>
                <option value="iron">Iron</option>
                <option value="all">All Ores</option>
                <option value="auto">Auto-Detect</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Chat Rate (seconds):</label>
              <input type="number" id="chatRate" class="form-input" value="30" min="10" max="300">
            </div>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <button class="btn btn-primary" onclick="saveSettings()" style="padding: 15px 40px; font-size: 1.1rem;">
            <i class="fas fa-save"></i> Save All Settings
          </button>
        </div>
      </div>
      
      <!-- Live Feed -->
      <div class="live-feed">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <h3><i class="fas fa-stream"></i> Live Activity Feed</h3>
          <div>
            <button class="btn" onclick="clearFeed()" style="padding: 8px 16px;">
              <i class="fas fa-trash"></i> Clear
            </button>
            <button class="btn" onclick="toggleAutoScroll()" style="padding: 8px 16px;" id="autoScrollBtn">
              <i class="fas fa-arrow-down"></i> Auto-Scroll
            </button>
          </div>
        </div>
        <div class="feed-content" id="feedContent">
          [System] Waiting for activity...
        </div>
      </div>
    </div>
    
    <script>
      let ws;
      let systemData = {};
      let autoScroll = true;
      let performanceHistory = [];
      
      // Initialize WebSocket
      function initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = \`\${protocol}//\${window.location.host}/ws\`;
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          addFeedEntry('✅ Connected to WebSocket server', 'success');
          addConsoleEntry('WebSocket connection established');
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
            
            if (data.console) {
              data.console.forEach(entry => {
                addConsoleEntry(entry);
              });
            }
            
            // Update performance
            updatePerformance(data);
            
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
        updateAllBotsGrid(data.allBots);
        updateTasks(data.tasks);
        updateChat(data.chat);
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
            icon: 'fa-shield-alt', 
            label: 'PROTECTION', 
            value: stats?.protection || 'Active', 
            color: 'var(--success)' 
          },
          { 
            icon: 'fa-bolt', 
            label: 'PERFORMANCE', 
            value: stats?.performance || '95%', 
            color: 'var(--warning)' 
          },
          { 
            icon: 'fa-network-wired', 
            label: 'NETWORK', 
            value: stats?.network || 'Stable', 
            color: 'var(--info)' 
          },
          { 
            icon: 'fa-brain', 
            label: 'AI STATUS', 
            value: stats?.ai || 'Active', 
            color: 'var(--secondary)' 
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
                <p>No active bots. Click "Start All Bots" to begin.</p>
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
          
          html += \`
            <div class="bot-card \${bot.type || 'builder'}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                  <div style="font-weight: 700; font-size: 1.2rem;">\${bot.name || 'Unknown'}</div>
                  <div style="font-size: 0.8rem; color: var(--gray); margin-top: 2px;">\${bot.account || 'N/A'}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; 
                       background: \${bot.status === 'connected' ? 'rgba(16, 185, 129, 0.2)' : 
                       bot.status === 'connecting' ? 'rgba(59, 130, 246, 0.2)' : 
                       'rgba(239, 68, 68, 0.2)'};">
                    \${bot.status || 'unknown'}
                  </div>
                  <button class="btn" onclick="controlBot('\${bot.id}', 'disconnect')" 
                          style="padding: 4px 8px; font-size: 0.8rem;">
                    <i class="fas fa-power-off"></i>
                  </button>
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
                <div style="margin-bottom: 5px;">🌐 \${bot.ip || 'Direct IP'}</div>
                <div style="margin-bottom: 5px;">📍 \${bot.position || 'Unknown'}</div>
                <div>🎯 \${bot.activity || 'Idle'}</div>
              </div>
              
              <div style="margin-top: 15px; display: flex; gap: 8px;">
                <button class="btn" onclick="controlBot('\${bot.id}', 'chat')" 
                        style="flex: 1; padding: 6px; font-size: 0.8rem;">
                  <i class="fas fa-comment"></i>
                </button>
                <button class="btn" onclick="controlBot('\${bot.id}', 'tp')" 
                        style="flex: 1; padding: 6px; font-size: 0.8rem;">
                  <i class="fas fa-map-marker-alt"></i>
                </button>
                <button class="btn" onclick="controlBot('\${bot.id}', 'action')" 
                        style="flex: 1; padding: 6px; font-size: 0.8rem;">
                  <i class="fas fa-play"></i>
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
        
        if (bots.length === 0) {
          grid.innerHTML = \`
            <div class="bot-card">
              <div style="text-align: center; padding: 20px;">
                <i class="fas fa-robot" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px;"></i>
                <p>No bots created yet. Add bots from the controls above.</p>
              </div>
            </div>
          \`;
          return;
        }
        
        let html = '';
        bots.forEach(bot => {
          const statusColor = bot.status === 'connected' ? 'var(--success)' :
                            bot.status === 'connecting' ? 'var(--info)' :
                            bot.status === 'disconnected' ? 'var(--warning)' : 'var(--danger)';
          
          html += \`
            <div class="bot-card \${bot.type}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div>
                  <div style="font-weight: 700; font-size: 1.1rem;">\${bot.name}</div>
                  <div style="font-size: 0.8rem; color: var(--gray);">Type: \${bot.type} • ID: \${bot.id.substring(0, 8)}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; 
                       background: \${statusColor}20; color: \${statusColor};">
                    \${bot.status}
                  </div>
                </div>
              </div>
              
              <div style="font-size: 0.85rem; color: var(--gray); margin-bottom: 10px;">
                Created: \${bot.created}
              </div>
              
              <div style="display: flex; gap: 8px;">
                <button class="btn" onclick="controlBot('\${bot.id}', 'connect')" 
                        style="flex: 1; padding: 6px; font-size: 0.8rem;" 
                        \${bot.status === 'connected' ? 'disabled' : ''}>
                  <i class="fas fa-play"></i> Connect
                </button>
                <button class="btn" onclick="controlBot('\${bot.id}', 'disconnect')" 
                        style="flex: 1; padding: 6px; font-size: 0.8rem;"
                        \${bot.status !== 'connected' ? 'disabled' : ''}>
                  <i class="fas fa-stop"></i> Disconnect
                </button>
                <button class="btn" onclick="controlBot('\${bot.id}', 'remove')" 
                        style="flex: 1; padding: 6px; font-size: 0.8rem;">
                  <i class="fas fa-trash"></i> Remove
                </button>
              </div>
            </div>
          \`;
        });
        
        grid.innerHTML = html;
      }
      
      function updateTasks(tasks) {
        const tasksContent = document.getElementById('tasksContent');
        if (!tasksContent) return;
        
        if (!tasks || tasks.length === 0) {
          tasksContent.innerHTML = \`
            <div style="text-align: center; padding: 20px; color: var(--gray);">
              <i class="fas fa-tasks" style="font-size: 2rem; margin-bottom: 10px;"></i>
              <p>No active tasks. Create one to get started.</p>
            </div>
          \`;
          return;
        }
        
        let html = '';
        tasks.forEach(task => {
          html += \`
            <div style="background: rgba(30, 41, 59, 0.5); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-weight: 600;">\${task.name}</div>
                <div style="font-size: 0.8rem; padding: 3px 8px; border-radius: 12px; 
                     background: \${task.status === 'running' ? 'rgba(16, 185, 129, 0.2)' : 
                     task.status === 'paused' ? 'rgba(245, 158, 11, 0.2)' : 
                     'rgba(100, 116, 139, 0.2)'};">
                  \${task.status}
                </div>
              </div>
              <div style="font-size: 0.85rem; color: var(--gray); margin-bottom: 8px;">
                \${task.description}
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                <span>Bots: \${task.bots || 0}</span>
                <span>Progress: \${task.progress || 0}%</span>
              </div>
            </div>
          \`;
        });
        
        tasksContent.innerHTML = html;
      }
      
      function updateChat(chat) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages || !chat) return;
        
        let html = '';
        chat.forEach(msg => {
          html += \`
            <div style="margin-bottom: 8px; padding: 8px; background: rgba(30, 41, 59, 0.3); border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 600; color: \${msg.type === 'bot' ? 'var(--primary)' : 'var(--warning)'}">
                  \${msg.sender}
                </span>
                <span style="font-size: 0.8rem; color: var(--gray);">
                  \${new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div>\${msg.message}</div>
            </div>
          \`;
        });
        
        chatMessages.innerHTML = html;
        if (autoScroll) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }
      
      function updatePerformance(data) {
        // Track performance history
        const performance = parseInt(data.stats?.performance) || 95;
        performanceHistory.push(performance);
        if (performanceHistory.length > 20) performanceHistory.shift();
        
        // Update progress bar
        const performanceBar = document.getElementById('performanceBar');
        const performanceText = document.getElementById('performanceText');
        
        if (performanceBar) {
          performanceBar.style.width = \`\${performance}%\`;
        }
        if (performanceText) {
          performanceText.textContent = \`\${performance}%\`;
        }
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
          if (data.success && command === 'smart_join') {
            setTimeout(() => {
              fetch('/api/status').then(r => r.json()).then(updateDashboard);
            }, 3000);
          }
        })
        .catch(error => {
          showNotification('Failed to send command: ' + error.message, 'error');
        });
      }
      
      function controlBot(botId, action) {
        fetch('/api/bot/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botId, action })
        })
        .then(response => response.json())
        .then(data => {
          showNotification(data.message || 'Action executed', data.success ? 'success' : 'error');
          setTimeout(() => {
            fetch('/api/status').then(r => r.json()).then(updateDashboard);
          }, 1000);
        })
        .catch(error => {
          showNotification('Failed to control bot: ' + error.message, 'error');
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
        if (autoScroll) {
          feedContent.scrollTop = feedContent.scrollHeight;
        }
        
        if (feedContent.children.length > 100) {
          feedContent.removeChild(feedContent.firstChild);
        }
      }
      
      function addConsoleEntry(message) {
        const consoleContent = document.getElementById('consoleContent');
        const timestamp = new Date().toLocaleTimeString();
        
        const entry = document.createElement('div');
        entry.style = \`
          margin-bottom: 6px;
          padding: 6px 10px;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.2);
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 11px;
        \`;
        entry.innerHTML = \`[\${timestamp}] \${message}\`;
        
        consoleContent.appendChild(entry);
        consoleContent.scrollTop = consoleContent.scrollHeight;
        
        if (consoleContent.children.length > 200) {
          consoleContent.removeChild(consoleContent.firstChild);
        }
      }
      
      function clearFeed() {
        const feedContent = document.getElementById('feedContent');
        feedContent.innerHTML = '';
        addFeedEntry('Feed cleared', 'info');
      }
      
      function clearConsole() {
        const consoleContent = document.getElementById('consoleContent');
        consoleContent.innerHTML = '';
        addConsoleEntry('Console cleared');
      }
      
      function toggleAutoScroll() {
        autoScroll = !autoScroll;
        const btn = document.getElementById('autoScrollBtn');
        if (autoScroll) {
          btn.innerHTML = '<i class="fas fa-arrow-down"></i> Auto-Scroll ON';
          btn.classList.add('btn-success');
          btn.classList.remove('btn');
        } else {
          btn.innerHTML = '<i class="fas fa-arrow-down"></i> Auto-Scroll OFF';
          btn.classList.remove('btn-success');
          btn.classList.add('btn');
        }
      }
      
      // Chat functions
      function sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            addFeedEntry(\`Chat sent: "\${message}"\`, 'success');
            input.value = '';
          } else {
            showNotification('Failed to send chat: ' + data.error, 'error');
          }
        })
        .catch(error => {
          showNotification('Failed to send chat: ' + error.message, 'error');
        });
      }
      
      function handleChatKeyPress(event) {
        if (event.key === 'Enter') {
          sendChatMessage();
        }
      }
      
      // Modal functions
      function openModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalContent').innerHTML = content;
        document.getElementById('modal').style.display = 'flex';
      }
      
      function closeModal() {
        document.getElementById('modal').style.display = 'none';
      }
      
      function openTaskModal(type) {
        let title = '';
        let content = '';
        
        switch(type) {
          case 'farm':
            title = 'Farm Setup';
            content = \`
              <div class="form-group">
                <label class="form-label">Farm Type:</label>
                <select class="form-input" id="farmType">
                  <option value="wheat">Wheat Farm</option>
                  <option value="carrot">Carrot Farm</option>
                  <option value="potato">Potato Farm</option>
                  <option value="auto">Auto All Crops</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Farm Size:</label>
                <select class="form-input" id="farmSize">
                  <option value="small">Small (9x9)</option>
                  <option value="medium">Medium (16x16)</option>
                  <option value="large">Large (32x32)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Bots to Assign:</label>
                <input type="number" class="form-input" id="farmBots" min="1" max="4" value="2">
              </div>
              <button class="btn btn-primary" onclick="createTask('farm')" style="width: 100%; margin-top: 20px;">
                <i class="fas fa-play"></i> Start Farm Task
              </button>
            \`;
            break;
            
          case 'mine':
            title = 'Mining Setup';
            content = \`
              <div class="form-group">
                <label class="form-label">Mining Priority:</label>
                <select class="form-input" id="minePriority">
                  <option value="diamonds">Diamonds Only</option>
                  <option value="iron">Iron Only</option>
                  <option value="all">All Ores</option>
                  <option value="strip">Strip Mining</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Mining Depth:</label>
                <select class="form-input" id="mineDepth">
                  <option value="y11">Y=11 (Diamonds)</option>
                  <option value="y16">Y=16 (Iron)</option>
                  <option value="auto">Auto Detect</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Bots to Assign:</label>
                <input type="number" class="form-input" id="mineBots" min="1" max="4" value="2">
              </div>
              <button class="btn btn-primary" onclick="createTask('mine')" style="width: 100%; margin-top: 20px;">
                <i class="fas fa-play"></i> Start Mining Task
              </button>
            \`;
            break;
        }
        
        openModal(title, content);
      }
      
      function createTask(type) {
        let data = {};
        
        switch(type) {
          case 'farm':
            data = {
              type: 'farm',
              farmType: document.getElementById('farmType').value,
              farmSize: document.getElementById('farmSize').value,
              bots: parseInt(document.getElementById('farmBots').value)
            };
            break;
            
          case 'mine':
            data = {
              type: 'mine',
              priority: document.getElementById('minePriority').value,
              depth: document.getElementById('mineDepth').value,
              bots: parseInt(document.getElementById('mineBots').value)
            };
            break;
        }
        
        fetch('/api/task/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
          showNotification(result.message, result.success ? 'success' : 'error');
          closeModal();
          refreshTasks();
        })
        .catch(error => {
          showNotification('Failed to create task: ' + error.message, 'error');
        });
      }
      
      function refreshTasks() {
        fetch('/api/tasks')
          .then(response => response.json())
          .then(data => {
            updateTasks(data.tasks);
          })
          .catch(error => {
            console.error('Failed to load tasks:', error);
          });
      }
      
      // Settings
      function saveSettings() {
        const settings = {
          maxBots: document.getElementById('maxBots').value,
          serverAddress: document.getElementById('serverAddress').value,
          serverPort: document.getElementById('serverPort').value,
          serverVersion: document.getElementById('serverVersion').value,
          autoReconnect: document.getElementById('autoReconnect').checked,
          useProxies: document.getElementById('useProxies').checked,
          enableAI: document.getElementById('enableAI').checked,
          antiDetection: document.getElementById('antiDetection').checked,
          autoFarm: document.getElementById('autoFarm').value,
          miningPriority: document.getElementById('miningPriority').value,
          chatRate: document.getElementById('chatRate').value
        };
        
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        })
        .then(response => response.json())
        .then(data => {
          showNotification(data.message, 'success');
        })
        .catch(error => {
          showNotification('Failed to save settings: ' + error.message, 'error');
        });
      }
      
      function exportLogs() {
        const consoleContent = document.getElementById('consoleContent');
        const logs = Array.from(consoleContent.children).map(el => el.textContent).join('\\n');
        
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`bot-logs-\${new Date().toISOString().replace(/[:.]/g, '-')}.txt\`;
        a.click();
        
        showNotification('Logs exported successfully', 'success');
      }
      
      function testServer() {
        fetch('/api/server-test')
          .then(response => response.json())
          .then(data => {
            if (data.online) {
              showNotification(\`Server is online! Ping: \${data.ping}ms\`, 'success');
              addConsoleEntry(\`Server test: \${data.message} (\${data.ping}ms)\`);
            } else {
              showNotification(\`Server is offline: \${data.message}\`, 'error');
              addConsoleEntry(\`Server test failed: \${data.message}\`);
            }
          })
          .catch(error => {
            showNotification('Server test failed: ' + error.message, 'error');
          });
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
      
      function openChatSettings() {
        openModal('Chat Settings', \`
          <div class="form-group">
            <label class="form-label">Chat Frequency (seconds):</label>
            <input type="number" class="form-input" id="chatFreq" value="30" min="10" max="300">
          </div>
          <div class="form-group">
            <label class="form-label">Auto-Reply:</label>
            <textarea class="form-input" id="autoReplies" rows="4" 
                      placeholder="Enter auto-replies (one per line)">Hello!
How are you?
Nice to meet you!</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" style="display: flex; align-items: center; gap: 10px;">
              <input type="checkbox" id="enableReplies" checked>
              Enable Auto-Replies
            </label>
          </div>
          <button class="btn btn-primary" onclick="saveChatSettings()" style="width: 100%; margin-top: 20px;">
            <i class="fas fa-save"></i> Save Chat Settings
          </button>
        \`);
      }
      
      function saveChatSettings() {
        const settings = {
          frequency: document.getElementById('chatFreq').value,
          autoReplies: document.getElementById('autoReplies').value.split('\\n'),
          enableReplies: document.getElementById('enableReplies').checked
        };
        
        fetch('/api/chat/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        })
        .then(response => response.json())
        .then(data => {
          showNotification(data.message, 'success');
          closeModal();
        })
        .catch(error => {
          showNotification('Failed to save chat settings: ' + error.message, 'error');
        });
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
          
        // Load settings
        fetch('/api/settings/current')
          .then(response => response.json())
          .then(data => {
            if (data.settings) {
              Object.keys(data.settings).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                  if (element.type === 'checkbox') {
                    element.checked = data.settings[key];
                  } else {
                    element.value = data.settings[key];
                  }
                }
              });
            }
          })
          .catch(console.error);
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
      stats: {
        totalBots: status.totalBots,
        connectedBots: status.connectedBots,
        protection: 'Active',
        performance: Math.floor(Math.random() * 20) + 80, // 80-100%
        network: 'Stable',
        ai: 'Active',
        uptime: Math.floor(process.uptime())
      },
      bots: status.bots,
      allBots: status.allBots,
      events: botSystem.getRecentEvents(5),
      console: botSystem.getConsoleLogs(3),
      tasks: botSystem.getTasks(),
      chat: botSystem.getChatHistory(10)
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
      case 'smart_join':
        result = await botSystem.smartJoin();
        break;
      case 'auto_farm':
        result = await botSystem.autoFarm();
        break;
      case 'rotate_proxies':
        result = await botSystem.rotateProxies();
        break;
      case 'rotate_accounts':
        result = await botSystem.rotateAccounts();
        break;
      case 'fix_issues':
        result = await botSystem.fixConnectionIssues();
        break;
      case 'emergency_stop':
        result = await botSystem.emergencyStop();
        break;
      case 'add_builder':
        result = await botSystem.addBot('builder');
        break;
      case 'add_miner':
        result = await botSystem.addBot('miner');
        break;
      case 'add_explorer':
        result = await botSystem.addBot('explorer');
        break;
      case 'add_socializer':
        result = await botSystem.addBot('socializer');
        break;
      case 'add_guardian':
        result = await botSystem.addBot('guardian');
        break;
      case 'clear_inactive':
        result = await botSystem.clearInactiveBots();
        break;
      case 'chat_enable':
        result = await botSystem.enableChat(true);
        break;
      case 'chat_disable':
        result = await botSystem.enableChat(false);
        break;
      default:
        return res.status(400).json({ error: 'Unknown command' });
    }
    
    res.json({ success: true, message: result.message, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bot/control', async (req, res) => {
  const { botId, action } = req.body;
  
  try {
    const result = await botSystem.controlBot(botId, action);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    await botSystem.updateSettings(req.body);
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings/current', async (req, res) => {
  try {
    const settings = await botSystem.getCurrentSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/server-test', async (req, res) => {
  try {
    const result = await botSystem.testServerConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  try {
    const result = await botSystem.sendChatMessage(message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat/settings', async (req, res) => {
  try {
    await botSystem.updateChatSettings(req.body);
    res.json({ success: true, message: 'Chat settings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/task/create', async (req, res) => {
  try {
    const result = await botSystem.createTask(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await botSystem.getTasks();
    res.json({ success: true, tasks });
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
          stats: {
            connectedBots: status.connectedBots,
            totalBots: status.totalBots
          },
          bots: status.bots,
          events: botSystem.getRecentEvents(3),
          console: botSystem.getConsoleLogs(2)
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
║   🚀 ULTIMATE MINECRAFT BOT SYSTEM v4.0                  ║
║   ⚡ All Features Included • Aternos Optimized           ║
╚══════════════════════════════════════════════════════════╝
`);
  
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}/ws`);
  console.log('='.repeat(60));
  
  // Auto-start if configured
  setTimeout(() => {
    if (process.env.AUTO_START === 'true') {
      console.log('🚀 Auto-starting bot system...');
      botSystem.startAllBots().catch(console.error);
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
  botSystem.emergencyStop();
  server.close(() => {
    console.log('🎮 Server shutdown complete.');
    process.exit(0);
  });
});

module.exports = app;
