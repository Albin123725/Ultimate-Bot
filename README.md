# 🚀 Ultimate Minecraft Bot System v2.0

Complete Minecraft bot system with creative mode and perfect sleep management.

## ✨ Features

### 🤖 Bot System
- **2 Bot Personalities**: CreativeMaster (Builder) & CreativeExplorer (Explorer)
- **Creative Mode**: Always in creative with auto `/give` commands
- **Perfect Sleep System**: Sleeps immediately at night (13000-23000 Minecraft time)
- **Bed Management**: Auto-places bed if none nearby, breaks bed in morning
- **Auto-Reconnect**: Automatically reconnects on disconnect

### 🎮 Game Features
- **Activity System**: Personality-based activities (building, exploring)
- **Anti-AFK**: Random movements to prevent AFK kick
- **Smart Chat**: Auto-responses to player messages
- **Health Monitoring**: Tracks bot health and food levels
- **Position Tracking**: Real-time position updates

### 🌐 Web Interface
- **Real-time Status**: See all bots at a glance
- **Beautiful UI**: Modern, responsive design
- **Health Endpoint**: `/health` for monitoring
- **JSON API**: `/api/status` for programmatic access

## 🚀 Quick Deploy

### Option 1: Render.com (Recommended)
1. Fork this repository
2. Go to [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: ultimate-minecraft-bots
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Click "Create Web Service"

### Option 2: Local Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/ultimate-minecraft-bot-system.git
cd ultimate-minecraft-bot-system

# Install dependencies
npm install

# Start the system
npm start

# Access web interface: http://localhost:3000
