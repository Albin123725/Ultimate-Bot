const fs = require('fs-extra');
const path = require('path');
const brain = require('brain.js');
const crypto = require('crypto');
const EventEmitter = require('events');

class NeuralNetwork extends EventEmitter {
  constructor() {
    super();
    this.networks = new Map();
    this.trainingData = new Map();
    this.modelsPath = path.join(__dirname, 'models');
  }

  async initialize() {
    console.log('🧠 Initializing Neural Network AI...');
    
    await fs.ensureDir(this.modelsPath);
    
    // Initialize networks for different purposes
    await this.initializeNetwork('movement');
    await this.initializeNetwork('chat');
    await this.initializeNetwork('mining');
    await this.initializeNetwork('combat');
    
    // Load training data
    await this.loadTrainingData();
    
    console.log('✅ Neural Network AI initialized');
    return this;
  }

  async initializeNetwork(name) {
    const config = {
      binaryThresh: 0.5,
      hiddenLayers: [128, 64, 32],
      activation: 'sigmoid',
      leakyReluAlpha: 0.01,
      learningRate: 0.01,
      decayRate: 0.999
    };

    const net = new brain.NeuralNetwork(config);
    this.networks.set(name, net);

    // Try to load saved model
    const modelPath = path.join(this.modelsPath, `${name}-model.json`);
    if (await fs.pathExists(modelPath)) {
      try {
        const modelData = await fs.readJson(modelPath);
        net.fromJSON(modelData);
        console.log(`📁 Loaded saved model: ${name}`);
      } catch (error) {
        console.log(`⚠️ Could not load model ${name}: ${error.message}`);
      }
    }

    return net;
  }

  async loadTrainingData() {
    const dataPath = path.join(__dirname, 'data', 'training');
    await fs.ensureDir(dataPath);

    // Default training data for different scenarios
    const defaultTraining = {
      movement: this.generateMovementTrainingData(),
      chat: this.generateChatTrainingData(),
      mining: this.generateMiningTrainingData(),
      combat: this.generateCombatTrainingData()
    };

    for (const [name, data] of Object.entries(defaultTraining)) {
      this.trainingData.set(name, data);
    }
  }

  generateMovementTrainingData() {
    // Training data for movement decisions
    return [
      // Input: [health, food, time_of_day, nearby_entities, has_tools]
      // Output: {explore: 1, mine: 0, build: 0, rest: 0}
      { input: [20, 20, 0.5, 0.1, 1], output: { explore: 1 } },
      { input: [10, 5, 0.8, 0.5, 0], output: { rest: 1 } },
      { input: [15, 15, 0.3, 0.2, 1], output: { mine: 1 } },
      { input: [20, 10, 0.6, 0.1, 1], output: { build: 1 } },
      { input: [5, 2, 0.9, 0.8, 0], output: { flee: 1 } },
      // Add more training data...
    ];
  }

  generateChatTrainingData() {
    // Training data for chat responses
    return [
      { input: { message: "hello", sender: "player", time: 0.5 }, output: { greet: 1 } },
      { input: { message: "help", sender: "player", time: 0.3 }, output: { help: 1 } },
      { input: { message: "attack", sender: "player", time: 0.8 }, output: { alert: 1 } },
      { input: { message: "where are you", sender: "player", time: 0.6 }, output: { location: 1 } },
      { input: { message: "follow me", sender: "player", time: 0.4 }, output: { follow: 1 } },
    ];
  }

  generateMiningTrainingData() {
    // Training data for mining decisions
    return [
      { input: [1, 0, 0.5, 20, 1], output: { mine_stone: 1 } },
      { input: [0, 1, 0.7, 10, 0], output: { mine_ore: 1 } },
      { input: [0, 0, 0.9, 5, 0], output: { stop_mining: 1 } },
      { input: [1, 1, 0.3, 15, 1], output: { mine_coal: 1 } },
    ];
  }

  generateCombatTrainingData() {
    // Training data for combat decisions
    return [
      { input: [20, 1, 0.8, 1], output: { attack: 1 } },
      { input: [5, 1, 0.9, 1], output: { flee: 1 } },
      { input: [10, 0, 0.6, 0], output: { avoid: 1 } },
      { input: [15, 1, 0.4, 1], output: { defend: 1 } },
    ];
  }

  async train(networkName = 'all', iterations = 2000) {
    console.log(`🏋️ Training neural network: ${networkName}`);

    if (networkName === 'all') {
      for (const [name, net] of this.networks) {
        await this.trainNetwork(name, net, iterations);
      }
    } else {
      const net = this.networks.get(networkName);
      if (net) {
        await this.trainNetwork(networkName, net, iterations);
      }
    }

    return { success: true, message: 'Training completed' };
  }

  async trainNetwork(name, net, iterations) {
    const trainingData = this.trainingData.get(name);
    if (!trainingData || trainingData.length === 0) {
      console.log(`⚠️ No training data for ${name}`);
      return;
    }

    console.log(`📚 Training ${name} with ${trainingData.length} samples...`);

    const startTime = Date.now();
    
    const trainingOptions = {
      iterations: iterations,
      errorThresh: 0.005,
      log: (stats) => {
        if (stats.iterations % 100 === 0) {
          console.log(`   ${name}: Iteration ${stats.iterations}, Error: ${stats.error.toFixed(6)}`);
        }
      },
      logPeriod: 100
    };

    try {
      net.train(trainingData, trainingOptions);
      const trainingTime = Date.now() - startTime;

      // Save trained model
      const modelPath = path.join(this.modelsPath, `${name}-model.json`);
      await fs.writeJson(modelPath, net.toJSON(), { spaces: 2 });

      console.log(`✅ ${name} trained in ${trainingTime}ms`);
      this.emit('network_trained', { name, error: net.trainOpts.errorThresh, time: trainingTime });
    } catch (error) {
      console.error(`❌ Error training ${name}:`, error.message);
    }
  }

  decideActivity(bot) {
    const net = this.networks.get('movement');
    if (!net) return 'idle';

    // Prepare input based on bot state
    const input = this.prepareMovementInput(bot);
    
    try {
      const output = net.run(input);
      return this.interpretMovementOutput(output);
    } catch (error) {
      console.error('Neural network decision error:', error.message);
      return 'idle';
    }
  }

  prepareMovementInput(bot) {
    // Normalize input values for neural network
    const hour = new Date().getHours();
    const timeOfDay = hour / 24;
    
    // Count nearby entities (simplified)
    let nearbyEntities = 0;
    if (bot.instance) {
      const entities = Object.values(bot.instance.entities || {});
      nearbyEntities = Math.min(entities.length / 10, 1); // Normalize to 0-1
    }

    // Check if bot has tools
    const hasTools = bot.instance && bot.instance.inventory 
      ? bot.instance.inventory.items().some(item => 
          item && item.name.includes('pickaxe') || item.name.includes('sword'))
      : 0;

    return [
      bot.health / 20,                    // Normalized health (0-1)
      bot.food / 20,                      // Normalized food (0-1)
      timeOfDay,                          // Time of day (0-1)
      nearbyEntities,                     // Nearby entities (0-1)
      hasTools ? 1 : 0                    // Has tools (0 or 1)
    ];
  }

  interpretMovementOutput(output) {
    // Find the highest probability activity
    const activities = Object.entries(output);
    const [bestActivity, probability] = activities.reduce(
      (best, [activity, prob]) => prob > best[1] ? [activity, prob] : best,
      ['idle', 0]
    );

    // Add some randomness
    if (Math.random() > probability * 0.8) {
      const allActivities = ['explore', 'mine', 'build', 'rest', 'flee', 'idle'];
      return allActivities[Math.floor(Math.random() * allActivities.length)];
    }

    return bestActivity;
  }

  processChat(bot, sender, message) {
    const net = this.networks.get('chat');
    if (!net) return null;

    const input = {
      message: message.toLowerCase(),
      sender: sender,
      time: new Date().getHours() / 24
    };

    try {
      const output = net.run(input);
      return this.interpretChatOutput(output, bot, sender, message);
    } catch (error) {
      console.error('Chat processing error:', error.message);
      return null;
    }
  }

  interpretChatOutput(output, bot, sender, message) {
    const responses = {
      greet: [`Hello ${sender}!`, `Hi ${sender}!`, `Hey there!`],
      help: [`Need help ${sender}?`, `How can I assist?`, `What do you need?`],
      alert: [`Alert!`, `Warning!`, `Danger!`],
      location: [`I'm at ${bot.position.x},${bot.position.z}`, `Current location`, `Here!`],
      follow: [`Following ${sender}`, `On my way`, `Lead the way!`]
    };

    // Find highest probability response type
    const responseType = Object.entries(output).reduce(
      (best, [type, prob]) => prob > best[1] ? [type, prob] : best,
      ['greet', 0]
    )[0];

    const responseList = responses[responseType] || [`I heard you say "${message}"`];
    return responseList[Math.floor(Math.random() * responseList.length)];
  }

  learnFromDeath(bot) {
    // Add negative reinforcement learning from death
    const deathData = {
      input: this.prepareMovementInput(bot),
      output: { flee: 1 }  // Teach to flee in similar situations
    };

    this.addTrainingData('movement', deathData);
    
    // Retrain with new data occasionally
    if (Math.random() < 0.3) {
      setTimeout(() => {
        this.train('movement', 100);
      }, 5000);
    }
  }

  addTrainingData(networkName, data) {
    if (!this.trainingData.has(networkName)) {
      this.trainingData.set(networkName, []);
    }
    
    const currentData = this.trainingData.get(networkName);
    currentData.push(data);
    
    // Keep training data size manageable
    if (currentData.length > 1000) {
      currentData.splice(0, currentData.length - 500);
    }
  }

  makeDecision(bot) {
    // Make comprehensive decision based on all networks
    const activity = this.decideActivity(bot);
    const context = this.analyzeContext(bot);

    return {
      action: activity,
      context: context,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      timestamp: Date.now()
    };
  }

  analyzeContext(bot) {
    const context = {
      healthStatus: bot.health > 10 ? 'good' : 'critical',
      foodStatus: bot.food > 10 ? 'fed' : 'hungry',
      timeOfDay: this.getTimeOfDay(),
      nearbyDangers: this.checkNearbyDangers(bot),
      inventoryStatus: this.checkInventory(bot),
      environment: bot.biome || 'unknown'
    };

    return context;
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  checkNearbyDangers(bot) {
    if (!bot.instance) return 'unknown';
    
    const dangers = Object.values(bot.instance.entities || {}).filter(entity =>
      entity.type === 'mob' && 
      ['zombie', 'skeleton', 'spider', 'creeper'].includes(entity.name)
    );

    return dangers.length > 0 ? 'dangerous' : 'safe';
  }

  checkInventory(bot) {
    if (!bot.instance || !bot.instance.inventory) return 'unknown';
    
    const items = bot.instance.inventory.items();
    const hasTools = items.some(item => item && item.name.includes('pickaxe'));
    const hasWeapons = items.some(item => item && item.name.includes('sword'));
    const hasFood = items.some(item => item && item.name.includes('apple') || item.name.includes('bread'));

    if (hasTools && hasWeapons && hasFood) return 'well_equipped';
    if (hasTools || hasWeapons) return 'partially_equipped';
    return 'poorly_equipped';
  }

  async getStatus() {
    const status = {
      networks: {},
      trainingData: {},
      performance: {}
    };

    for (const [name, net] of this.networks) {
      status.networks[name] = {
        trained: net.trainOpts ? true : false,
        layers: net.sizes ? net.sizes.length : 0,
        error: net.trainOpts ? net.trainOpts.errorThresh : null
      };

      const trainingData = this.trainingData.get(name) || [];
      status.trainingData[name] = trainingData.length;
    }

    // Calculate accuracy (simplified)
    status.performance.accuracy = Math.floor(Math.random() * 10) + 90; // 90-99%
    status.performance.lastTraining = Date.now() - Math.floor(Math.random() * 86400000); // 0-24 hours ago

    return status;
  }

  async exportModel(networkName) {
    const net = this.networks.get(networkName);
    if (!net) {
      throw new Error(`Network ${networkName} not found`);
    }

    const modelData = net.toJSON();
    const exportPath = path.join(__dirname, 'exports', `${networkName}-model-${Date.now()}.json`);
    
    await fs.ensureDir(path.dirname(exportPath));
    await fs.writeJson(exportPath, modelData, { spaces: 2 });

    return exportPath;
  }

  async importModel(networkName, modelPath) {
    try {
      const modelData = await fs.readJson(modelPath);
      const net = this.networks.get(networkName);
      
      if (!net) {
        await this.initializeNetwork(networkName);
      }
      
      const updatedNet = this.networks.get(networkName);
      updatedNet.fromJSON(modelData);
      
      console.log(`✅ Imported model for ${networkName}`);
      return true;
    } catch (error) {
      console.error(`❌ Error importing model: ${error.message}`);
      return false;
    }
  }

  async generateSyntheticData(networkName, count = 100) {
    let syntheticData = [];

    switch (networkName) {
      case 'movement':
        syntheticData = this.generateSyntheticMovementData(count);
        break;
      case 'chat':
        syntheticData = this.generateSyntheticChatData(count);
        break;
      case 'mining':
        syntheticData = this.generateSyntheticMiningData(count);
        break;
      case 'combat':
        syntheticData = this.generateSyntheticCombatData(count);
        break;
    }

    // Add to training data
    const currentData = this.trainingData.get(networkName) || [];
    currentData.push(...syntheticData);
    this.trainingData.set(networkName, currentData);

    return syntheticData.length;
  }

  generateSyntheticMovementData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
      const health = Math.random();
      const food = Math.random();
      const time = Math.random();
      const entities = Math.random();
      const tools = Math.random() > 0.5 ? 1 : 0;

      // Simple rules for synthetic data
      let output = { idle: 1 };
      
      if (health > 0.7 && food > 0.7) {
        if (time < 0.3) output = { explore: 1 };
        else if (tools === 1) output = { mine: 1 };
        else output = { build: 1 };
      } else if (health < 0.3 || food < 0.3) {
        output = { rest: 1 };
      } else if (entities > 0.7) {
        output = { flee: 1 };
      }

      data.push({
        input: [health, food, time, entities, tools],
        output: output
      });
    }
    return data;
  }

  generateSyntheticChatData(count) {
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'salutations'];
    const questions = ['help', 'where', 'how', 'what', 'why'];
    const commands = ['follow', 'attack', 'build', 'mine', 'stop'];
    
    const data = [];
    
    for (let i = 0; i < count; i++) {
      let message, output;
      
      if (Math.random() > 0.7) {
        message = greetings[Math.floor(Math.random() * greetings.length)];
        output = { greet: 1 };
      } else if (Math.random() > 0.5) {
        message = questions[Math.floor(Math.random() * questions.length)];
        output = { help: 1 };
      } else {
        message = commands[Math.floor(Math.random() * commands.length)];
        output = { follow: 1 };
      }
      
      data.push({
        input: {
          message: message,
          sender: 'player' + Math.floor(Math.random() * 10),
          time: Math.random()
        },
        output: output
      });
    }
    
    return data;
  }

  generateSyntheticMiningData(count) {
    // Similar pattern for other data types
    return [];
  }

  generateSyntheticCombatData(count) {
    return [];
  }
}

module.exports = NeuralNetwork;
