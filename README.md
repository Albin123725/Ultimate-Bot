# 🚀 ULTIMATE MINECRAFT BOT SYSTEM v2.3

This is an enhanced Minecraft Bot system built on \`mineflayer\` featuring a robust **Perfect Sleep System**, **Home Management**, **Advanced Building**, and resilient **Crash Protection/Auto-Reconnect** logic.

The current configuration is set up for two bots: \`CreativeMaster\` (Builder) and \`CreativeExplorer\` (Explorer).

## Features

* **Crash Protection:** Automatic, timed re-connection on kick, error, or disconnect.
* **Perfect Sleep System:** Finds/places a bed, sleeps through the night, and automatically breaks the bed (unless it's the home bed).
* **Home System:** Automatically sets a spawn-point Home, marks it with torches (in Creative), and returns to it when needed (e.g., for sleeping or when too far away).
* **Building System (CreativeMaster):** Capable of simple building tasks.
* **Creative Mode Ready:** Uses \`/give\` commands for blocks/beds if in Creative mode.
* **Health and Time Monitoring:** Reacts to low health/food and day/night cycle.

## 🛠️ Setup and Installation

1.  **Clone the Repository (or create the files):**
    
    Create all the files listed in this response (\`index.js\`, \`package.json\`, \`.env.example\`, \`.gitignore\`).
    
2.  **Install Dependencies:**
    
    Make sure you have Node.js installed, then run:
    \`\`\`bash
    npm install
    \`\`\`

3.  **Configuration:**

    * Create a file named \`.env\` in the root directory and copy the contents of \`.env.example\` into it.
    * **Crucially**, update your server details in the \`.env\` file if they are different from the defaults:
        \`\`\`ini
        MINECRAFT_HOST=your.server.ip
        MINECRAFT_PORT=your_server_port
        MINECRAFT_VERSION=1.21.10
        \`\`\`

4.  **Run the Bot:**
    \`\`\`bash
    npm start
    \`\`\`

## 🤖 Bot Commands (In-Game Chat)

The bots respond to commands starting with \`!\`:

* \`!status\`: Get the bot's current health, food, and status.
* \`!home\`: Instruct the bot to return to its home location.
* \`!sleep\`: Instruct the bot to find a bed and sleep immediately.
* \`!build\`: (For CreativeMaster) Start a simple building activity.
* \`!afk\`: Toggle the bot's AFK status (pauses activity loop).
* \`!stop\`: Pause all current movement and activity.
* \`!come\`: Instruct the bot to follow and come to your location.
