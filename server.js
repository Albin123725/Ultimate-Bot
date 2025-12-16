// ============================================================
// 🚀 ULTIMATE MINECRAFT BOT SYSTEM v2.4
// 🏠 Smart Building • Emergency Sleep • Perfect Structures
// ============================================================

const mineflayer = require('mineflayer');
const http = require('http');
const Vec3 = require('vec3').Vec3;

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE MINECRAFT BOT SYSTEM v2.4                                 ║
║   🏠 Smart Building • Emergency Sleep • Perfect Structures             ║
║   🤖 2 Bots • Smart Planning • Proper Architecture • Emergency Mode    ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

// ================= ENHANCED LOGGING =================
class Logger {
  constructor() {
    this.levels = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      success: '✅',
      debug: '🐛',
      sleep: '😴',
      wake: '☀️',
      night: '🌙',
      day: '☀️',
      chat: '💬',
      bot: '🤖',
      connect: '🔄',
      disconnect: '🔌',
      kick: '🚫',
      bed_break: '⛏️',
      cleanup: '🧹',
      home: '🏠',
      building: '🏗️',
      travel: '🗺️',
      emergency: '🚨',
      planning: '📐'
    };
  }

  log(message, type = 'info', botName = 'SYSTEM') {
    const timestamp = new Date().toLocaleTimeString();
    const icon = this.levels[type] || '📝';
    
    const formattedMessage = `[${timestamp}] ${icon} ${botName}: ${message}`;
    
    if (type === 'error') {
      console.error(formattedMessage);
    } else if (type === 'warn') {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
    
    return formattedMessage;
  }
}

const logger = new Logger();

// ================= ENHANCED CONFIGURATION =================
const CONFIG = {
  SERVER: {
    host: process.env.MINECRAFT_HOST || 'gameplannet.aternos.me',
    port: parseInt(process.env.MINECRAFT_PORT) || 43658,
    version: process.env.MINECRAFT_VERSION || '1.21.10'
  },
  BOTS: [
    {
      id: 'bot_001',
      name: 'CreativeMaster',
      personality: 'builder',
      color: '§a',
      activities: ['building', 'designing', 'crafting', 'planning'],
      sleepPattern: 'normal',
      homeLocation: null,
      buildStyle: 'modern',
      buildingSkill: 'expert'
    },
    {
      id: 'bot_002',
      name: 'CreativeExplorer',
      personality: 'explorer',
      color: '§b',
      activities: ['exploring', 'mapping', 'discovering', 'adventuring'],
      sleepPattern: 'normal',
      homeLocation: null,
      buildStyle: 'medieval',
      buildingSkill: 'intermediate'
    }
  ],
  SYSTEM: {
    PORT: process.env.PORT || 3000,
    INITIAL_DELAY: 10000,
    BOT_DELAY: 8000,
    STATUS_INTERVAL: 30000,
    LOG_LEVEL: 'info'
  },
  FEATURES: {
    AUTO_SLEEP: true,
    BED_MANAGEMENT: true,
    CREATIVE_MODE: true,
    AUTO_RECONNECT: true,
    CHAT_SYSTEM: true,
    ACTIVITY_SYSTEM: true,
    HEALTH_MONITORING: true,
    POSITION_TRACKING: true,
    TIME_AWARENESS: true,
    ANTI_AFK: true,
    ERROR_HANDLING: true,
    AUTO_BED_BREAKING: true,
    HOME_SYSTEM: true,
    RETURN_TO_HOME: true,
    SMART_BUILDING: true,
    EMERGENCY_SLEEP: true,
    BUILDING_ONLY_DAYTIME: true,
    STRUCTURE_PLANNING: true
  },
  SLEEP_SYSTEM: {
    BREAK_BED_AFTER_SLEEP: true,
    BREAK_DELAY: 2000,
    BREAK_TIMEOUT: 10000,
    KEEP_BED_IF_PLAYER_NEARBY: false,
    BREAK_METHOD: 'dig',
    KEEP_HOME_BED: true,
    EMERGENCY_SLEEP_DISTANCE: 15,
    STOP_ACTIVITIES_AT_NIGHT: true
  },
  BUILDING: {
    BUILDING_TIME: {
      DAY_ONLY: true,
      START_HOUR: 0,
      END_HOUR: 12000,
      MIN_BUILDING_TIME: 20000,
      MAX_BUILDING_TIME: 60000
    },
    STRUCTURE_TYPES: [
      {
        name: 'Modern House',
        style: 'modern',
        complexity: 'medium',
        size: { width: 7, depth: 9, height: 6 },
        blocks: ['quartz_block', 'white_concrete', 'glass_pane', 'spruce_planks', 'stone_bricks'],
        features: ['windows', 'door', 'roof', 'chimney', 'porch']
      },
      {
        name: 'Medieval House',
        style: 'medieval',
        complexity: 'medium',
        size: { width: 9, depth: 7, height: 8 },
        blocks: ['oak_planks', 'spruce_planks', 'cobblestone', 'stone_bricks', 'dark_oak_planks'],
        features: ['windows', 'door', 'roof', 'tower', 'pathway']
      },
      {
        name: 'Small Cottage',
        style: 'cottage',
        complexity: 'easy',
        size: { width: 5, depth: 7, height: 5 },
        blocks: ['oak_planks', 'spruce_planks', 'glass', 'oak_log', 'hay_block'],
        features: ['windows', 'door', 'roof', 'garden']
      },
      {
        name: 'Watch Tower',
        style: 'tower',
        complexity: 'hard',
        size: { width: 5, depth: 5, height: 15 },
        blocks: ['stone_bricks', 'cobblestone', 'spruce_planks', 'glass', 'torch'],
        features: ['windows', 'ladder', 'platform', 'torches']
      },
      {
        name: 'Farm House',
        style: 'farm',
        complexity: 'medium',
        size: { width: 11, depth: 9, height: 6 },
        blocks: ['oak_planks', 'spruce_planks', 'hay_block', 'glass', 'fence'],
        features: ['windows', 'door', 'barn', 'fence', 'farmland']
      }
    ],
    BLOCK_PLACEMENT_TIMEOUT: 8000,
    MAX_BUILD_DISTANCE: 15,
    MIN_BUILD_DISTANCE_FROM_HOME: 20,
    MAX_BUILD_DISTANCE_FROM_HOME: 100,
    BUILDING_AREA_CHECK: true,
    BUILDING_SPACING: 10,
    FOUNDATION_DEPTH: 1,
    WALL_THICKNESS: 1,
    ROOF_TYPES: ['flat', 'gable', 'hipped', 'pyramid'],
    DECORATION_BLOCKS: [
      'torch',
      'lantern',
      'flower_pot',
      'chest',
      'crafting_table',
      'furnace',
      'bookshelf',
      'painting'
    ]
  },
  HOME: {
    SET_SPAWN_AS_HOME: true,
    HOME_RADIUS: 20,
    HOME_RETURN_DISTANCE: 50,
    HOME_BED_POSITION: { x: 0, y: 65, z: 0 },
    MARK_HOME_WITH_TORCHES: true,
    HOME_STRUCTURE: true,
    HOME_STYLE: 'modern'
  }
};

// ================= ENHANCED BUILDING PLANNER =================
class BuildingPlanner {
  constructor(botInstance, botName) {
    this.bot = botInstance;
    this.botName = botName;
    this.currentPlan = null;
    this.buildArea = null;
    this.buildQueue = [];
    this.isBuilding = false;
    this.currentStructure = null;
    this.builtStructures = [];
    this.constructionStep = 0;
  }

  // Find perfect building location
  async findBuildingLocation() {
    if (!this.bot.entity) return null;
    
    const botPos = this.bot.entity.position;
    const searchRadius = CONFIG.BUILDING.MAX_BUILD_DISTANCE_FROM_HOME;
    
    logger.log(`Searching for building location within ${searchRadius} blocks`, 'building', this.botName);
    
    const builtPositions = this.builtStructures.map(s => s.location);
    
    for (let attempt = 0; attempt < 10; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = CONFIG.BUILDING.MIN_BUILD_DISTANCE_FROM_HOME + 
                      Math.random() * (CONFIG.BUILDING.MAX_BUILD_DISTANCE_FROM_HOME - CONFIG.BUILDING.MIN_BUILD_DISTANCE_FROM_HOME);
      
      const candidateX = Math.floor(botPos.x + Math.cos(angle) * distance);
      const candidateZ = Math.floor(botPos.z + Math.sin(angle) * distance);
      
      let tooClose = false;
      for (const builtPos of builtPositions) {
        const dx = candidateX - builtPos.x;
        const dz = candidateZ - builtPos.z;
        const distanceToExisting = Math.sqrt(dx * dx + dz * dz);
        
        if (distanceToExisting < CONFIG.BUILDING.BUILDING_SPACING) {
          tooClose = true;
          break;
        }
      }
      
      if (tooClose) continue;
      
      const groundInfo = await this.checkGroundFlatness(candidateX, candidateZ, 9, 7);
      
      if (groundInfo.isSuitable) {
        logger.log(`Found suitable building location at ${candidateX}, ${groundInfo.groundLevel}, ${candidateZ}`, 'success', this.botName);
        
        return {
          x: candidateX,
          y: groundInfo.groundLevel,
          z: candidateZ,
          width: 9,
          depth: 7,
          rotation: Math.floor(Math.random() * 4) * 90
        };
      }
    }
    
    logger.log('Could not find suitable building location', 'warn', this.botName);
    return null;
  }

  async checkGroundFlatness(centerX, centerZ, width, depth) {
    const samples = [];
    const halfWidth = Math.floor(width / 2);
    const halfDepth = Math.floor(depth / 2);
    
    for (let x = -halfWidth; x <= halfWidth; x += 2) {
      for (let z = -halfDepth; z <= halfDepth; z += 2) {
        const worldX = centerX + x;
        const worldZ = centerZ + z;
        
        const groundLevel = await this.findGroundLevel(worldX, worldZ);
        if (groundLevel !== null) {
          samples.push({ x: worldX, z: worldZ, y: groundLevel });
        }
      }
    }
    
    if (samples.length < 4) {
      return { isSuitable: false, groundLevel: null };
    }
    
    const heights = samples.map(s => s.y);
    const minHeight = Math.min(...heights);
    const maxHeight = Math.max(...heights);
    const heightDifference = maxHeight - minHeight;
    
    let hasWaterOrLava = false;
    for (const sample of samples) {
      const block = this.bot.blockAt(new Vec3(sample.x, sample.y, sample.z));
      const blockBelow = this.bot.blockAt(new Vec3(sample.x, sample.y - 1, sample.z));
      
      if (block && (block.name.includes('water') || block.name.includes('lava'))) {
        hasWaterOrLava = true;
        break;
      }
      if (blockBelow && (blockBelow.name.includes('water') || blockBelow.name.includes('lava'))) {
        hasWaterOrLava = true;
        break;
      }
    }
    
    const isSuitable = heightDifference <= 2 && !hasWaterOrLava;
    const averageGroundLevel = Math.round(heights.reduce((a, b) => a + b) / heights.length);
    
    return {
      isSuitable: isSuitable,
      groundLevel: averageGroundLevel,
      heightDifference: heightDifference,
      hasWaterOrLava: hasWaterOrLava
    };
  }

  async findGroundLevel(x, z) {
    for (let y = 100; y >= 0; y--) {
      const block = this.bot.blockAt(new Vec3(x, y, z));
      const blockAbove = this.bot.blockAt(new Vec3(x, y + 1, z));
      
      if (block && block.name !== 'air' && 
          block.name !== 'water' && block.name !== 'lava' &&
          blockAbove && blockAbove.name === 'air') {
        return y + 1;
      }
    }
    return null;
  }

  selectStructureType() {
    const botConfig = CONFIG.BOTS.find(b => b.name === this.botName);
    const style = botConfig?.buildStyle || 'modern';
    const skill = botConfig?.buildingSkill || 'intermediate';
    
    const availableStructures = CONFIG.BUILDING.STRUCTURE_TYPES.filter(structure => {
      if (skill === 'beginner' && structure.complexity !== 'easy') return false;
      if (skill === 'intermediate' && structure.complexity === 'hard') return false;
      if (style && structure.style !== style) return false;
      return true;
    });
    
    if (availableStructures.length === 0) {
      return CONFIG.BUILDING.STRUCTURE_TYPES[0];
    }
    
    return availableStructures[Math.floor(Math.random() * availableStructures.length)];
  }

  createBuildingPlan(location, structureType) {
    const plan = {
      name: structureType.name,
      style: structureType.style,
      location: location,
      size: structureType.size,
      blocks: [...structureType.blocks],
      features: [...structureType.features],
      steps: [],
      estimatedTime: 30000 + Math.random() * 30000
    };
    
    plan.steps = [
      { name: 'Clear Area', duration: 5000 },
      { name: 'Build Foundation', duration: 10000 },
      { name: 'Build Walls', duration: 15000 },
      { name: 'Build Roof', duration: 10000 },
      { name: 'Add Windows', duration: 8000 },
      { name: 'Add Door', duration: 5000 },
      { name: 'Add Decorations', duration: 7000 }
    ];
    
    logger.log(`Created building plan: ${plan.name} at ${location.x}, ${location.y}, ${location.z}`, 'building', this.botName);
    logger.log(`Size: ${plan.size.width}x${plan.size.depth}x${plan.size.height} | Features: ${plan.features.join(', ')}`, 'building', this.botName);
    
    return plan;
  }

  async getBuildingMaterials(plan) {
    if (!this.bot) return;
    
    logger.log(`Getting materials for ${plan.name}`, 'building', this.botName);
    
    const uniqueBlocks = [...new Set(plan.blocks)];
    
    uniqueBlocks.forEach((block, index) => {
      setTimeout(() => {
        if (this.bot) {
          const volume = plan.size.width * plan.size.depth * plan.size.height;
          const amount = Math.min(Math.max(volume / 10, 32), 128);
          
          this.bot.chat(`/give ${this.bot.username} ${block} ${amount}`);
          logger.log(`Getting ${amount}x ${block}`, 'building', this.botName);
        }
      }, index * 1000);
    });
    
    setTimeout(() => {
      CONFIG.BUILDING.DECORATION_BLOCKS.forEach((block, index) => {
        setTimeout(() => {
          if (this.bot) {
            this.bot.chat(`/give ${this.bot.username} ${block} 16`);
          }
        }, index * 500);
      });
    }, uniqueBlocks.length * 1000 + 1000);
    
    await this.delay(uniqueBlocks.length * 1000 + 5000);
    logger.log(`Materials ready for building`, 'success', this.botName);
  }

  async executeBuildingPlan(plan) {
    if (this.isBuilding) {
      logger.log('Already building', 'warn', this.botName);
      return false;
    }
    
    this.isBuilding = true;
    this.currentPlan = plan;
    this.currentStructure = plan;
    this.constructionStep = 0;
    
    try {
      await this.moveToBuildLocation(plan.location);
      await this.getBuildingMaterials(plan);
      
      for (const step of plan.steps) {
        if (!this.isBuilding) break;
        
        this.constructionStep++;
        logger.log(`Step ${this.constructionStep}/${plan.steps.length}: ${step.name}`, 'building', this.botName);
        
        await this.executeBuildingStep(step, plan);
        
        if (this.bot.time && this.shouldStopForNight()) {
          logger.log('Night approaching - stopping construction', 'night', this.botName);
          await this.emergencyStopBuilding();
          return false;
        }
        
        await this.delay(step.duration);
      }
      
      await this.finalizeStructure(plan);
      
      this.builtStructures.push({
        name: plan.name,
        location: plan.location,
        style: plan.style,
        completionTime: Date.now()
      });
      
      logger.log(`✅ ${plan.name} completed successfully!`, 'success', this.botName);
      
      this.isBuilding = false;
      this.currentPlan = null;
      this.currentStructure = null;
      
      return true;
      
    } catch (error) {
      logger.log(`Building failed: ${error.message}`, 'error', this.botName);
      this.isBuilding = false;
      this.currentPlan = null;
      this.currentStructure = null;
      return false;
    }
  }

  async executeBuildingStep(step, plan) {
    const loc = plan.location;
    const size = plan.size;
    
    switch (step.name) {
      case 'Clear Area':
        await this.clearBuildingArea(loc, size);
        break;
        
      case 'Build Foundation':
        await this.buildFoundation(loc, size, plan.blocks[0]);
        break;
        
      case 'Build Walls':
        await this.buildWalls(loc, size, plan.blocks[1] || plan.blocks[0]);
        break;
        
      case 'Build Roof':
        await this.buildRoof(loc, size, plan.blocks[2] || plan.blocks[0]);
        break;
        
      case 'Add Windows':
        await this.addWindows(loc, size);
        break;
        
      case 'Add Door':
        await this.addDoor(loc, size);
        break;
        
      case 'Add Decorations':
        await this.addDecorations(loc, size);
        break;
    }
  }

  async clearBuildingArea(location, size) {
    const startX = location.x - Math.floor(size.width / 2);
    const startZ = location.z - Math.floor(size.depth / 2);
    const endY = location.y + size.height + 2;
    
    for (let x = 0; x < size.width; x++) {
      for (let y = 0; y < size.height + 3; y++) {
        for (let z = 0; z < size.depth; z++) {
          const blockX = startX + x;
          const blockY = location.y + y;
          const blockZ = startZ + z;
          
          const block = this.bot.blockAt(new Vec3(blockX, blockY, blockZ));
          if (block && block.name !== 'air' && block.name !== 'water' && block.name !== 'lava') {
            try {
              await this.bot.lookAt(new Vec3(blockX, blockY, blockZ));
              await this.safeDigWithTimeout(block);
              await this.delay(50);
            } catch (error) {
              // Ignore errors in clearing
            }
          }
        }
      }
    }
    
    logger.log('Area cleared for construction', 'building', this.botName);
  }

  async buildFoundation(location, size, blockType) {
    const startX = location.x - Math.floor(size.width / 2);
    const startZ = location.z - Math.floor(size.depth / 2);
    const foundationY = location.y - 1;
    
    for (let x = -1; x < size.width + 1; x++) {
      for (let z = -1; z < size.depth + 1; z++) {
        const blockX = startX + x;
        const blockZ = startZ + z;
        
        await this.safePlaceBlockAt({ x: blockX, y: foundationY, z: blockZ }, blockType);
        await this.delay(100);
      }
    }
    
    for (let x = 0; x < size.width; x++) {
      for (let z = 0; z < size.depth; z++) {
        const blockX = startX + x;
        const blockZ = startZ + z;
        
        await this.safePlaceBlockAt({ x: blockX, y: location.y, z: blockZ }, blockType);
        await this.delay(50);
      }
    }
    
    logger.log('Foundation built', 'building', this.botName);
  }

  async buildWalls(location, size, blockType) {
    const startX = location.x - Math.floor(size.width / 2);
    const startZ = location.z - Math.floor(size.depth / 2);
    
    for (let height = 1; height <= size.height; height++) {
      for (let x = 0; x < size.width; x++) {
        await this.safePlaceBlockAt({ 
          x: startX + x, 
          y: location.y + height, 
          z: startZ 
        }, blockType);
        
        await this.safePlaceBlockAt({ 
          x: startX + x, 
          y: location.y + height, 
          z: startZ + size.depth - 1 
        }, blockType);
        
        await this.delay(30);
      }
      
      for (let z = 1; z < size.depth - 1; z++) {
        await this.safePlaceBlockAt({ 
          x: startX, 
          y: location.y + height, 
          z: startZ + z 
        }, blockType);
        
        await this.safePlaceBlockAt({ 
          x: startX + size.width - 1, 
          y: location.y + height, 
          z: startZ + z 
        }, blockType);
        
        await this.delay(30);
      }
      
      await this.delay(200);
    }
    
    logger.log('Walls built', 'building', this.botName);
  }

  async buildRoof(location, size, blockType) {
    const startX = location.x - Math.floor(size.width / 2);
    const startZ = location.z - Math.floor(size.depth / 2);
    const roofHeight = location.y + size.height + 1;
    
    for (let x = -1; x < size.width + 1; x++) {
      for (let z = -1; z < size.depth + 1; z++) {
        await this.safePlaceBlockAt({ 
          x: startX + x, 
          y: roofHeight, 
          z: startZ + z 
        }, blockType);
        
        await this.delay(30);
      }
    }
    
    for (let x = -2; x < size.width + 2; x++) {
      for (let z = -2; z < size.depth + 2; z++) {
        if (x === -2 || x === size.width + 1 || z === -2 || z === size.depth + 1) {
          await this.safePlaceBlockAt({ 
            x: startX + x, 
            y: roofHeight + 1, 
            z: startZ + z 
          }, blockType);
          
          await this.delay(20);
        }
      }
    }
    
    logger.log('Roof built', 'building', this.botName);
  }

  async addWindows(location, size) {
    const startX = location.x - Math.floor(size.width / 2);
    const startZ = location.z - Math.floor(size.depth / 2);
    
    const windowHeight = location.y + 2;
    const windowSpacing = 2;
    
    for (let x = 1; x < size.width - 1; x += windowSpacing) {
      await this.safePlaceBlockAt({ 
        x: startX + x, 
        y: windowHeight, 
        z: startZ 
      }, 'glass_pane');
      
      await this.delay(200);
    }
    
    for (let x = 1; x < size.width - 1; x += windowSpacing) {
      await this.safePlaceBlockAt({ 
        x: startX + x, 
        y: windowHeight, 
        z: startZ + size.depth - 1 
      }, 'glass_pane');
      
      await this.delay(200);
    }
    
    logger.log('Windows added', 'building', this.botName);
  }

  async addDoor(location, size) {
    const startX = location.x - Math.floor(size.width / 2);
    const startZ = location.z - Math.floor(size.depth / 2);
    
    const doorX = startX + Math.floor(size.width / 2);
    
    await this.safePlaceBlockAt({ x: doorX, y: location.y + 1, z: startZ }, 'air');
    await this.safePlaceBlockAt({ x: doorX, y: location.y + 2, z: startZ }, 'air');
    
    for (let z = 1; z <= 3; z++) {
      await this.safePlaceBlockAt({ 
        x: doorX, 
        y: location.y, 
        z: startZ - z 
      }, 'stone_bricks');
      
      await this.delay(200);
    }
    
    logger.log('Door and pathway added', 'building', this.botName);
  }

  async addDecorations(location, size) {
    const startX = location.x - Math.floor(size.width / 2);
    const startZ = location.z - Math.floor(size.depth / 2);
    
    const torchPositions = [
      { x: startX + 1, y: location.y + 3, z: startZ + 1 },
      { x: startX + size.width - 2, y: location.y + 3, z: startZ + 1 },
      { x: startX + 1, y: location.y + 3, z: startZ + size.depth - 2 },
      { x: startX + size.width - 2, y: location.y + 3, z: startZ + size.depth - 2 }
    ];
    
    for (const pos of torchPositions) {
      await this.safePlaceBlockAt(pos, 'torch');
      await this.delay(300);
    }
    
    await this.safePlaceBlockAt({ 
      x: startX + 2, 
      y: location.y + 1, 
      z: startZ - 1 
    }, 'flower_pot');
    
    await this.delay(300);
    
    await this.safePlaceBlockAt({ 
      x: startX + 2, 
      y: location.y + 1, 
      z: startZ + 2 
    }, 'chest');
    
    logger.log('Decorations added', 'building', this.botName);
  }

  async finalizeStructure(plan) {
    const loc = plan.location;
    
    await this.safePlaceBlockAt({ 
      x: loc.x, 
      y: loc.y + 1, 
      z: loc.z - 2 
    }, 'oak_sign');
    
    await this.safePlaceBlockAt({ 
      x: loc.x, 
      y: loc.y + 4, 
      z: loc.z 
    }, 'glowstone');
    
    logger.log(`${plan.name} finalized and ready!`, 'success', this.botName);
  }

  async moveToBuildLocation(location) {
    const target = new Vec3(location.x, location.y, location.z);
    
    await this.bot.lookAt(target);
    this.bot.setControlState('forward', true);
    
    let attempts = 0;
    while (attempts < 100) {
      await this.delay(100);
      const currentPos = this.bot.entity.position;
      const distance = currentPos.distanceTo(target);
      
      if (distance < 3) {
        break;
      }
      
      attempts++;
      
      if (attempts % 10 === 0) {
        await this.bot.lookAt(target);
      }
    }
    
    this.bot.setControlState('forward', false);
    
    await this.bot.lookAt(new Vec3(location.x, location.y, location.z));
    
    logger.log(`Arrived at build location`, 'building', this.botName);
  }

  async emergencyStopBuilding() {
    if (!this.isBuilding) return;
    
    logger.log('Emergency stop - saving construction site', 'warn', this.botName);
    
    if (this.currentPlan && this.currentPlan.location) {
      const loc = this.currentPlan.location;
      
      await this.safePlaceBlockAt({ x: loc.x, y: loc.y + 3, z: loc.z }, 'red_wool');
      
      logger.log(`Construction site marked at ${loc.x}, ${loc.y}, ${loc.z}`, 'building', this.botName);
    }
    
    this.isBuilding = false;
    this.currentPlan = null;
    this.constructionStep = 0;
    
    if (this.bot.time && this.bot.time.time >= 13000) {
      logger.log('Night time - heading home for emergency sleep', 'night', this.botName);
    }
  }

  shouldStopForNight() {
    if (!this.bot.time) return false;
    
    const time = this.bot.time.time;
    return time >= 22000 || time <= 1000;
  }

  canBuildNow() {
    if (!this.bot.time) return false;
    
    if (!CONFIG.FEATURES.BUILDING_ONLY_DAYTIME) {
      return true;
    }
    
    const time = this.bot.time.time;
    return time >= 0 && time <= 12000;
  }

  async safePlaceBlockAt(position, blockType) {
    if (!this.bot) return false;
    
    try {
      const blockPos = new Vec3(position.x, position.y, position.z);
      const block = this.bot.blockAt(blockPos);
      
      if (block && block.name === 'air') {
        this.bot.chat(`/give ${this.bot.username} ${blockType} 1`);
        await this.delay(500);
        
        const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
        const referenceBlock = this.bot.blockAt(blockBelowPos);
        
        if (referenceBlock) {
          const offset = new Vec3(0, 1, 0);
          
          return new Promise((resolve) => {
            const timeout = setTimeout(() => {
              logger.log(`Block placement timeout for ${blockType}`, 'warn', this.botName);
              resolve(false);
            }, CONFIG.BUILDING.BLOCK_PLACEMENT_TIMEOUT);
            
            this.bot.placeBlock(referenceBlock, offset)
              .then(() => {
                clearTimeout(timeout);
                resolve(true);
              })
              .catch((error) => {
                clearTimeout(timeout);
                logger.log(`Block placement failed: ${error.message}`, 'debug', this.botName);
                resolve(false);
              });
          });
        }
      }
    } catch (error) {
      logger.log(`Safe block placement failed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async safeDigWithTimeout(block) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logger.log('Digging timeout - Skipping', 'warn', this.botName);
        resolve(false);
      }, 8000);
      
      this.bot.dig(block)
        .then(() => {
          clearTimeout(timeout);
          setTimeout(() => resolve(true), 1000);
        })
        .catch((error) => {
          clearTimeout(timeout);
          logger.log(`Digging failed: ${error.message}`, 'debug', this.botName);
          resolve(false);
        });
    });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isBuilding: this.isBuilding,
      currentPlan: this.currentPlan ? {
        name: this.currentPlan.name,
        progress: `${this.constructionStep}/${this.currentPlan.steps.length}`,
        location: this.currentPlan.location
      } : null,
      builtStructures: this.builtStructures.length,
      canBuildNow: this.canBuildNow()
    };
  }
}

// ================= ENHANCED PERFECT SLEEP SYSTEM WITH EMERGENCY SLEEP =================
class PerfectSleepSystem {
  constructor(botInstance, botName) {
    this.bot = botInstance;
    this.botName = botName;
    this.state = {
      isSleeping: false,
      hasBedPlaced: false,
      bedPosition: null,
      bedInInventory: true,
      lastSleepTime: null,
      sleepCycles: 0,
      bedPlacements: 0,
      failedSleepAttempts: 0,
      bedsBroken: 0,
      lastBedBreakTime: null,
      isBreakingBed: false,
      homeBedPosition: null,
      hasHomeBed: false,
      returningHome: false,
      emergencySleepMode: false,
      stoppedActivities: false,
      activitiesBeforeNight: null
    };
    
    this.bedBreakingInterval = null;
    this.wakeCheckInterval = null;
    this.returnHomeTimeout = null;
    this.nightCheckInterval = null;
  }

  startNightMonitoring() {
    if (this.nightCheckInterval) {
      clearInterval(this.nightCheckInterval);
    }
    
    this.nightCheckInterval = setInterval(() => {
      if (!this.bot || !this.bot.time) return;
      
      const time = this.bot.time.time;
      const isNight = time >= 13000 && time <= 23000;
      
      if (isNight && !this.state.stoppedActivities && CONFIG.SLEEP_SYSTEM.STOP_ACTIVITIES_AT_NIGHT) {
        this.emergencyNightProcedure();
      }
      
      if (isNight && !this.state.isSleeping && this.state.emergencySleepMode) {
        this.emergencySleep();
      }
      
      if (!isNight && this.state.emergencySleepMode) {
        this.state.emergencySleepMode = false;
        this.state.stoppedActivities = false;
        logger.log('Daytime - emergency mode deactivated', 'day', this.botName);
      }
      
    }, 5000);
  }

  emergencyNightProcedure() {
    logger.log('⚠️ Night detected - Stopping all activities immediately', 'night', this.botName);
    
    this.state.stoppedActivities = true;
    this.state.emergencySleepMode = true;
    
    this.stopAllActivities();
    
    if (this.state.hasHomeBed) {
      const distanceFromHome = this.getDistanceFromHome();
      
      if (distanceFromHome > CONFIG.HOME.HOME_RETURN_DISTANCE) {
        logger.log(`Far from home (${Math.round(distanceFromHome)} blocks) - Emergency return initiated`, 'emergency', this.botName);
        this.emergencyReturnHome();
      } else {
        setTimeout(() => {
          this.emergencySleep();
        }, 2000);
      }
    } else {
      setTimeout(() => {
        this.emergencySleep();
      }, 2000);
    }
  }

  async emergencyReturnHome() {
    if (this.state.returningHome) return;
    
    this.state.returningHome = true;
    logger.log('EMERGENCY: Returning home for night', 'emergency', this.botName);
    
    try {
      this.stopAllActivities();
      await this.quickNavigateToHome();
      await this.emergencySleepAtHome();
      
    } catch (error) {
      logger.log(`Emergency return failed: ${error.message} - Finding nearby sleep spot`, 'error', this.botName);
      await this.findEmergencySleepSpot();
    } finally {
      this.state.returningHome = false;
    }
  }

  async quickNavigateToHome() {
    if (!this.state.homeBedPosition || !this.bot.entity) return;
    
    const homePos = this.state.homeBedPosition;
    const targetVec = new Vec3(homePos.x, homePos.y, homePos.z);
    
    logger.log(`Emergency navigation to home at ${homePos.x}, ${homePos.y}, ${homePos.z}`, 'emergency', this.botName);
    
    await this.bot.lookAt(targetVec);
    this.bot.setControlState('sprint', true);
    this.bot.setControlState('forward', true);
    
    await this.delay(15000);
    
    this.bot.setControlState('forward', false);
    this.bot.setControlState('sprint', false);
    
    const currentPos = this.bot.entity.position;
    const distance = currentPos.distanceTo(targetVec);
    
    if (distance < 10) {
      logger.log('Emergency navigation successful - Close to home', 'success', this.botName);
    } else {
      logger.log(`Still ${Math.round(distance)} blocks from home - Will sleep nearby`, 'warn', this.botName);
    }
  }

  async emergencySleep() {
    if (this.state.isSleeping) return;
    
    logger.log('⚠️ EMERGENCY SLEEP ACTIVATED - Finding sleep spot', 'emergency', this.botName);
    
    this.stopAllActivities();
    
    if (this.state.hasHomeBed) {
      const success = await this.trySleepInHomeBed();
      if (success) return;
    }
    
    const existingBed = await this.findNearbyBed();
    if (existingBed) {
      await this.sleepInBed(existingBed);
      return;
    }
    
    await this.emergencyPlaceBedAndSleep();
  }

  async emergencySleepAtHome() {
    if (!this.state.hasHomeBed || !this.state.homeBedPosition) {
      logger.log('No home bed - Creating emergency home bed', 'emergency', this.botName);
      await this.createEmergencyHomeBed();
    }
    
    const bedPos = this.state.homeBedPosition;
    const bedBlock = this.bot.blockAt(new Vec3(bedPos.x, bedPos.y, bedPos.z));
    
    if (bedBlock && this.isBedBlock(bedBlock)) {
      await this.sleepInBed(bedBlock);
    } else {
      logger.log('Home bed missing - Placing emergency bed', 'emergency', this.botName);
      await this.emergencyPlaceBedAtHome();
    }
  }

  async createEmergencyHomeBed() {
    try {
      this.bot.chat(`/give ${this.bot.username} bed 1`);
      await this.delay(1000);
      
      const pos = this.bot.entity.position;
      const bedPos = {
        x: Math.floor(pos.x),
        y: Math.floor(pos.y),
        z: Math.floor(pos.z)
      };
      
      const placed = await this.safePlaceBed(bedPos);
      if (placed) {
        this.state.homeBedPosition = bedPos;
        this.state.hasHomeBed = true;
        logger.log(`Emergency home bed placed at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'emergency', this.botName);
        return true;
      }
    } catch (error) {
      logger.log(`Emergency home bed creation failed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async emergencyPlaceBedAtHome() {
    if (!this.state.homeBedPosition) return;
    
    const homePos = this.state.homeBedPosition;
    
    const positions = [
      { x: homePos.x, y: homePos.y, z: homePos.z },
      { x: homePos.x + 1, y: homePos.y, z: homePos.z },
      { x: homePos.x, y: homePos.y, z: homePos.z + 1 },
      { x: homePos.x - 1, y: homePos.y, z: homePos.z },
      { x: homePos.x, y: homePos.y, z: homePos.z - 1 }
    ];
    
    for (const position of positions) {
      const placed = await this.safePlaceBed(position);
      if (placed) {
        this.state.homeBedPosition = position;
        this.state.hasHomeBed = true;
        
        const bedBlock = this.bot.blockAt(new Vec3(position.x, position.y, position.z));
        if (bedBlock) {
          await this.sleepInBed(bedBlock);
          return true;
        }
      }
    }
    
    return false;
  }

  async findEmergencySleepSpot() {
    logger.log('Searching for emergency sleep spot', 'emergency', this.botName);
    
    const pos = this.bot.entity.position;
    
    for (let radius = 0; radius <= CONFIG.SLEEP_SYSTEM.EMERGENCY_SLEEP_DISTANCE; radius++) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const checkX = Math.floor(pos.x + Math.cos(angle) * radius);
        const checkZ = Math.floor(pos.z + Math.sin(angle) * radius);
        
        const groundLevel = await this.findGroundLevel(checkX, checkZ);
        if (groundLevel === null) continue;
        
        const position = { x: checkX, y: groundLevel, z: checkZ };
        
        if (await this.isSuitableForBed(position)) {
          logger.log(`Found emergency sleep spot at ${position.x}, ${position.y}, ${position.z}`, 'emergency', this.botName);
          
          const placed = await this.safePlaceBed(position);
          if (placed) {
            const bedBlock = this.bot.blockAt(new Vec3(position.x, position.y, position.z));
            if (bedBlock) {
              await this.sleepInBed(bedBlock);
              return true;
            }
          }
        }
      }
    }
    
    logger.log('No emergency sleep spot found - Trying direct ground sleep', 'emergency', this.botName);
    await this.tryDirectSleep();
    return false;
  }

  async findGroundLevel(x, z) {
    for (let y = 100; y >= 0; y--) {
      const block = this.bot.blockAt(new Vec3(x, y, z));
      const blockAbove = this.bot.blockAt(new Vec3(x, y + 1, z));
      
      if (block && block.name !== 'air' && 
          block.name !== 'water' && block.name !== 'lava' &&
          blockAbove && blockAbove.name === 'air') {
        return y + 1;
      }
    }
    return null;
  }

  async isSuitableForBed(position) {
    const blockPos = new Vec3(position.x, position.y, position.z);
    const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
    
    const block = this.bot.blockAt(blockPos);
    const blockBelow = this.bot.blockAt(blockBelowPos);
    
    return block && block.name === 'air' && 
           blockBelow && blockBelow.name !== 'air' && 
           blockBelow.name !== 'lava' && blockBelow.name !== 'water';
  }

  async emergencyPlaceBedAndSleep() {
    logger.log('Placing emergency bed', 'emergency', this.botName);
    
    await this.getBedFromCreative();
    
    const pos = this.bot.entity.position;
    
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const checkX = Math.floor(pos.x) + x;
        const checkY = Math.floor(pos.y);
        const checkZ = Math.floor(pos.z) + z;
        
        const position = { x: checkX, y: checkY, z: checkZ };
        
        if (await this.isSuitableForBed(position)) {
          const placed = await this.safePlaceBed(position);
          if (placed) {
            const bedBlock = this.bot.blockAt(new Vec3(position.x, position.y, position.z));
            if (bedBlock) {
              await this.sleepInBed(bedBlock);
              return true;
            }
          }
        }
      }
    }
    
    logger.log('Emergency bed placement failed - Direct sleep', 'emergency', this.botName);
    await this.tryDirectSleep();
    return false;
  }

  async trySleepInHomeBed() {
    if (!this.state.hasHomeBed || !this.state.homeBedPosition) return false;
    
    const bedPos = this.state.homeBedPosition;
    const bedBlock = this.bot.blockAt(new Vec3(bedPos.x, bedPos.y, bedPos.z));
    
    if (bedBlock && this.isBedBlock(bedBlock)) {
      await this.sleepInBed(bedBlock);
      return true;
    }
    return false;
  }

  async findNearbyBed() {
    try {
      const beds = this.bot.findBlocks({
        matching: block => {
          if (!block) return false;
          const name = this.bot.registry.blocks[block.type]?.name;
          return name && name.includes('bed');
        },
        maxDistance: 10,
        count: 1
      });
      
      if (beds && beds.length > 0) {
        const bedPos = beds[0];
        logger.log(`Found nearby bed at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'info', this.botName);
        
        const bedBlock = this.bot.blockAt(new Vec3(bedPos.x, bedPos.y, bedPos.z));
        return bedBlock;
      }
      
      return null;
    } catch (error) {
      logger.log(`Bed search error: ${error.message}`, 'debug', this.botName);
      return null;
    }
  }

  async getBedFromCreative() {
    try {
      this.bot.chat(`/give ${this.bot.username} bed 1`);
      await this.delay(2000);
      
      this.state.bedInInventory = true;
      logger.log('Obtained bed from creative inventory', 'success', this.botName);
      return true;
    } catch (error) {
      logger.log(`Failed to get bed: ${error.message}`, 'error', this.botName);
      return false;
    }
  }

  async safePlaceBed(position) {
    try {
      this.bot.setQuickBarSlot(0);
      
      const lookPos = new Vec3(position.x, position.y, position.z);
      await this.bot.lookAt(lookPos);
      
      const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
      const referenceBlock = this.bot.blockAt(blockBelowPos);
      
      if (referenceBlock) {
        const offset = new Vec3(0, 1, 0);
        
        return await this.safePlaceBlockWithTimeout(referenceBlock, offset, 'bed');
      }
    } catch (error) {
      logger.log(`Safe bed placement failed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async safePlaceBlockWithTimeout(block, offset, blockType = '') {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logger.log(`Block placement timeout for ${blockType} - Skipping`, 'warn', this.botName);
        resolve(false);
      }, CONFIG.BUILDING.BLOCK_PLACEMENT_TIMEOUT);
      
      this.bot.placeBlock(block, offset)
        .then(() => {
          clearTimeout(timeout);
          resolve(true);
        })
        .catch((error) => {
          clearTimeout(timeout);
          logger.log(`Block placement failed: ${error.message}`, 'debug', this.botName);
          resolve(false);
        });
    });
  }

  async tryDirectSleep() {
    try {
      logger.log('Attempting direct sleep without bed', 'info', this.botName);
      
      const pos = this.bot.entity.position;
      const floorPos = new Vec3(Math.floor(pos.x), Math.floor(pos.y) - 1, Math.floor(pos.z));
      const floorBlock = this.bot.blockAt(floorPos);
      
      if (floorBlock && floorBlock.name !== 'air') {
        await this.bot.sleep(floorBlock);
        this.state.isSleeping = true;
        this.state.lastSleepTime = Date.now();
        logger.log('Direct sleep successful', 'sleep', this.botName);
      }
    } catch (error) {
      logger.log(`Direct sleep failed: ${error.message}`, 'warn', this.botName);
    }
  }

  isBedBlock(block) {
    if (!block) return false;
    const name = this.bot.registry.blocks[block.type]?.name;
    return name && name.includes('bed');
  }

  async sleepInBed(bedBlock) {
    try {
      const distance = this.bot.entity.position.distanceTo(bedBlock.position);
      if (distance > 2) {
        await this.bot.lookAt(bedBlock.position);
        this.bot.setControlState('forward', true);
        await this.delay(Math.min(distance * 200, 1000));
        this.bot.setControlState('forward', false);
        await this.delay(500);
      }
      
      await this.bot.sleep(bedBlock);
      this.state.isSleeping = true;
      this.state.lastSleepTime = Date.now();
      this.state.sleepCycles++;
      
      logger.log(`Successfully sleeping in bed`, 'sleep', this.botName);
      
      this.startMorningMonitor();
      
      setTimeout(() => {
        if (this.state.isSleeping && this.bot && this.bot.isSleeping) {
          this.wakeAndCleanup();
        }
      }, 45000);
      
    } catch (error) {
      logger.log(`Sleep attempt failed: ${error.message}`, 'error', this.botName);
      this.state.isSleeping = false;
      this.state.failedSleepAttempts++;
      
      if (this.state.failedSleepAttempts < 2) {
        await this.delay(1000);
        await this.tryDirectSleep();
      }
    }
  }

  startMorningMonitor() {
    if (this.wakeCheckInterval) {
      clearInterval(this.wakeCheckInterval);
    }
    
    this.wakeCheckInterval = setInterval(() => {
      if (!this.bot || !this.bot.time) return;
      
      const time = this.bot.time.time;
      const isMorning = time >= 0 && time < 13000;
      
      if (isMorning && this.state.isSleeping) {
        logger.log('Morning detected while sleeping - Waking up to break bed', 'day', this.botName);
        this.wakeAndBreakBed();
        clearInterval(this.wakeCheckInterval);
      }
    }, 5000);
  }

  async wakeAndBreakBed() {
    try {
      if (this.bot.isSleeping) {
        this.bot.wake();
        await this.delay(1000);
      }
      
      this.state.isSleeping = false;
      logger.log('Successfully woke up', 'wake', this.botName);
      
      await this.delay(CONFIG.SLEEP_SYSTEM.BREAK_DELAY);
      
      if (this.state.hasHomeBed && this.state.bedPosition && 
          this.state.bedPosition.x === this.state.homeBedPosition.x &&
          this.state.bedPosition.y === this.state.homeBedPosition.y &&
          this.state.bedPosition.z === this.state.homeBedPosition.z &&
          CONFIG.SLEEP_SYSTEM.KEEP_HOME_BED) {
        logger.log('Keeping home bed', 'home', this.botName);
      } else if (CONFIG.FEATURES.BED_MANAGEMENT && this.state.hasBedPlaced && this.state.bedPosition) {
        await this.autoBreakBed();
      } else {
        await this.findAndBreakNearbyBed();
      }
      
    } catch (error) {
      logger.log(`Wake/break bed error: ${error.message}`, 'error', this.botName);
    }
  }

  async autoBreakBed() {
    if (!CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP) {
      logger.log('Auto-bed breaking disabled in config', 'info', this.botName);
      return;
    }
    
    if (this.state.isBreakingBed) {
      logger.log('Already breaking bed', 'debug', this.botName);
      return;
    }
    
    this.state.isBreakingBed = true;
    
    try {
      logger.log('Starting auto-bed breaking process', 'bed_break', this.botName);
      
      if (CONFIG.SLEEP_SYSTEM.KEEP_BED_IF_PLAYER_NEARBY && this.arePlayersNearby()) {
        logger.log('Players nearby, keeping bed for them', 'info', this.botName);
        this.resetState();
        return;
      }
      
      const success = await this.breakBedAtPosition(this.state.bedPosition);
      
      if (success) {
        this.state.bedsBroken++;
        this.state.lastBedBreakTime = Date.now();
        logger.log(`✅ Auto-bed breaking successful! Beds broken: ${this.state.bedsBroken}`, 'success', this.botName);
      } else {
        logger.log('Failed to break bed, trying alternative methods', 'warn', this.botName);
        await this.tryAlternativeBedBreaking();
      }
      
      this.resetState();
      
    } catch (error) {
      logger.log(`Auto-bed breaking error: ${error.message}`, 'error', this.botName);
      this.state.isBreakingBed = false;
    }
  }

  async breakBedAtPosition(position) {
    try {
      const bedPos = new Vec3(position.x, position.y, position.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock && this.isBedBlock(bedBlock)) {
        logger.log(`Breaking bed at ${position.x}, ${position.y}, ${position.z}`, 'bed_break', this.botName);
        
        await this.bot.lookAt(bedPos);
        await this.delay(500);
        
        return await this.safeDigWithTimeout(bedBlock);
      } else {
        logger.log('No bed found at expected position', 'warn', this.botName);
      }
    } catch (error) {
      logger.log(`Failed to break bed at position: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async safeDigWithTimeout(block) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logger.log('Digging timeout - Skipping', 'warn', this.botName);
        resolve(false);
      }, 8000);
      
      this.bot.dig(block)
        .then(() => {
          clearTimeout(timeout);
          setTimeout(() => resolve(true), 1000);
        })
        .catch((error) => {
          clearTimeout(timeout);
          logger.log(`Digging failed: ${error.message}`, 'debug', this.botName);
          resolve(false);
        });
    });
  }

  async findAndBreakNearbyBed() {
    try {
      logger.log('Searching for nearby bed to break', 'bed_break', this.botName);
      
      const beds = this.bot.findBlocks({
        matching: block => {
          if (!block) return false;
          const name = this.bot.registry.blocks[block.type]?.name;
          return name && name.includes('bed');
        },
        maxDistance: 5,
        count: 5
      });
      
      if (beds && beds.length > 0) {
        logger.log(`Found ${beds.length} nearby beds`, 'info', this.botName);
        
        for (const bedPos of beds) {
          const position = { x: bedPos.x, y: bedPos.y, z: bedPos.z };
          const success = await this.breakBedAtPosition(position);
          
          if (success) {
            this.state.bedsBroken++;
            this.state.lastBedBreakTime = Date.now();
            break;
          }
        }
      } else {
        logger.log('No nearby beds found to break', 'info', this.botName);
      }
    } catch (error) {
      logger.log(`Error finding nearby beds: ${error.message}`, 'error', this.botName);
    }
  }

  async tryAlternativeBedBreaking() {
    logger.log('Trying alternative bed breaking methods', 'bed_break', this.botName);
    
    try {
      this.bot.chat(`/setblock ${this.state.bedPosition.x} ${this.state.bedPosition.y} ${this.state.bedPosition.z} air`);
      await this.delay(2000);
      logger.log('Used creative command to remove bed', 'success', this.botName);
      return true;
    } catch (error) {
      logger.log('Creative command failed', 'debug', this.botName);
    }
    
    try {
      this.bot.swingArm();
      await this.delay(300);
      this.bot.swingArm();
      await this.delay(300);
      this.bot.swingArm();
      logger.log('Simulated breaking bed with arm swings', 'info', this.botName);
    } catch (error) {
      // Ignore errors
    }
    
    return false;
  }

  arePlayersNearby() {
    try {
      const players = Object.values(this.bot.players);
      const botPos = this.bot.entity.position;
      
      for (const player of players) {
        if (player.username !== this.bot.username) {
          const distance = botPos.distanceTo(player.entity.position);
          if (distance < 10) {
            return true;
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return false;
  }

  resetState() {
    this.state.hasBedPlaced = false;
    this.state.bedPosition = null;
    this.state.bedInInventory = true;
    this.state.failedSleepAttempts = 0;
    this.state.isBreakingBed = false;
    
    if (this.bedBreakingInterval) {
      clearInterval(this.bedBreakingInterval);
      this.bedBreakingInterval = null;
    }
    
    if (this.wakeCheckInterval) {
      clearInterval(this.wakeCheckInterval);
      this.wakeCheckInterval = null;
    }
    
    logger.log('Sleep system state reset', 'cleanup', this.botName);
  }

  async wakeAndCleanup() {
    if (!this.state.isSleeping) return;
    
    try {
      if (this.bot.isSleeping) {
        this.bot.wake();
      }
      
      this.state.isSleeping = false;
      
      logger.log(`Successfully woke up`, 'wake', this.botName);
      
      if (CONFIG.FEATURES.BED_MANAGEMENT && this.state.hasBedPlaced && this.state.bedPosition) {
        if (CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP) {
          await this.autoBreakBed();
        } else {
          await this.breakBed(this.state.bedPosition);
        }
      }
      
      this.resetState();
      
      logger.log(`Bed management completed`, 'success', this.botName);
      
    } catch (error) {
      logger.log(`Wake/cleanup error: ${error.message}`, 'error', this.botName);
    }
  }

  async breakBed(position) {
    try {
      const bedPos = new Vec3(position.x, position.y, position.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock && this.isBedBlock(bedBlock)) {
        await this.bot.dig(bedBlock);
        await this.delay(1000);
        logger.log(`Bed successfully broken`, 'info', this.botName);
        return true;
      }
    } catch (error) {
      logger.log(`Failed to break bed: ${error.message}`, 'error', this.botName);
    }
    return false;
  }

  getDistanceFromHome() {
    if (!this.state.homeBedPosition || !this.bot.entity) return 0;
    
    const botPos = this.bot.entity.position;
    const homePos = this.state.homeBedPosition;
    
    return Math.sqrt(
      Math.pow(botPos.x - homePos.x, 2) +
      Math.pow(botPos.y - homePos.y, 2) +
      Math.pow(botPos.z - homePos.z, 2)
    );
  }

  checkTimeAndSleep() {
    if (!this.bot || !this.bot.time || !CONFIG.FEATURES.AUTO_SLEEP) return;
    
    const time = this.bot.time.time;
    const isNight = time >= 13000 && time <= 23000;
    
    if (this.bot.isSleeping !== undefined) {
      this.state.isSleeping = this.bot.isSleeping;
    }
    
    if (isNight && !this.state.isSleeping) {
      if (!this.state.emergencySleepMode) {
        this.state.emergencySleepMode = true;
        this.emergencySleep();
      }
    } else if (!isNight && this.state.isSleeping) {
      logger.log(`Morning detected (${time}) - Waking up`, 'day', this.botName);
      this.wakeAndCleanup();
      this.state.emergencySleepMode = false;
      this.state.stoppedActivities = false;
    }
  }

  async sleepImmediately() {
    if (this.state.isSleeping) return;
    
    logger.log('Initiating immediate sleep sequence', 'sleep', this.botName);
    
    this.stopAllActivities();
    
    const time = this.bot.time ? this.bot.time.time : 0;
    const isNight = time >= 13000 && time <= 23000;
    
    if (isNight) {
      this.state.emergencySleepMode = true;
      await this.emergencySleep();
      return;
    }
    
    const existingBed = await this.findNearbyBed();
    
    if (existingBed) {
      await this.sleepInBed(existingBed);
    } else {
      await this.placeBedAndSleep();
    }
  }

  async placeBedAndSleep() {
    logger.log('No bed found nearby - Placing new bed', 'info', this.botName);
    
    if (!this.state.bedInInventory) {
      const success = await this.getBedFromCreative();
      if (!success) {
        logger.log('Failed to get bed from creative', 'warn', this.botName);
        return;
      }
    }
    
    const bedPos = await this.findBedPlacementLocation();
    if (!bedPos) {
      logger.log('Could not find suitable bed placement location', 'warn', this.botName);
      this.state.failedSleepAttempts++;
      
      if (this.state.failedSleepAttempts < 3) {
        await this.delay(2000);
        await this.tryDirectSleep();
      }
      return;
    }
    
    const placed = await this.safePlaceBed(bedPos);
    if (placed) {
      this.state.hasBedPlaced = true;
      this.state.bedPosition = bedPos;
      this.state.bedInInventory = false;
      this.state.bedPlacements++;
      this.state.failedSleepAttempts = 0;
      
      logger.log(`Bed placed successfully at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'success', this.botName);
      
      await this.sleepInPlacedBed(bedPos);
    } else {
      this.state.failedSleepAttempts++;
      logger.log('Failed to place bed, trying direct sleep', 'warn', this.botName);
      await this.tryDirectSleep();
    }
  }

  async findBedPlacementLocation() {
    if (!this.bot.entity) return null;
    
    const pos = this.bot.entity.position;
    
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        const checkX = Math.floor(pos.x) + x;
        const checkY = Math.floor(pos.y);
        const checkZ = Math.floor(pos.z) + z;
        
        const blockPos = new Vec3(checkX, checkY, checkZ);
        const blockBelowPos = new Vec3(checkX, checkY - 1, checkZ);
        
        const block = this.bot.blockAt(blockPos);
        const blockBelow = this.bot.blockAt(blockBelowPos);
        
        if (block && block.name === 'air' && 
            blockBelow && blockBelow.name !== 'air' && 
            blockBelow.name !== 'lava' && blockBelow.name !== 'water' &&
            blockBelow.name !== 'bed') {
          return { x: checkX, y: checkY, z: checkZ };
        }
      }
    }
    
    return null;
  }

  async sleepInPlacedBed(bedPosition) {
    try {
      const bedPos = new Vec3(bedPosition.x, bedPosition.y, bedPosition.z);
      const bedBlock = this.bot.blockAt(bedPos);
      
      if (bedBlock && this.isBedBlock(bedBlock)) {
        await this.sleepInBed(bedBlock);
        return true;
      }
    } catch (error) {
      logger.log(`Failed to sleep in placed bed: ${error.message}`, 'error', this.botName);
    }
    return false;
  }

  stopAllActivities() {
    const controls = ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'];
    controls.forEach(control => {
      if (this.bot.getControlState(control)) {
        this.bot.setControlState(control, false);
      }
    });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      isSleeping: this.state.isSleeping,
      hasBedPlaced: this.state.hasBedPlaced,
      bedInInventory: this.state.bedInInventory,
      sleepCycles: this.state.sleepCycles,
      bedPlacements: this.state.bedPlacements,
      failedSleepAttempts: this.state.failedSleepAttempts,
      bedsBroken: this.state.bedsBroken,
      lastBedBreakTime: this.state.lastBedBreakTime ? 
        new Date(this.state.lastBedBreakTime).toLocaleTimeString() : 'Never',
      lastSleepTime: this.state.lastSleepTime ? 
        new Date(this.state.lastSleepTime).toLocaleTimeString() : 'Never',
      autoBedBreaking: CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP,
      hasHomeBed: this.state.hasHomeBed,
      homeLocation: this.state.homeBedPosition,
      emergencyMode: this.state.emergencySleepMode,
      stoppedActivities: this.state.stoppedActivities
    };
  }

  async initializeHomeSystem() {
    if (!CONFIG.FEATURES.HOME_SYSTEM || !this.bot.entity) return;
    
    try {
      if (CONFIG.HOME.SET_SPAWN_AS_HOME) {
        const spawnPos = this.bot.entity.position;
        this.state.homeBedPosition = {
          x: Math.floor(spawnPos.x),
          y: Math.floor(spawnPos.y),
          z: Math.floor(spawnPos.z)
        };
        
        logger.log(`Home location set at ${this.state.homeBedPosition.x}, ${this.state.homeBedPosition.y}, ${this.state.homeBedPosition.z}`, 'home', this.botName);
        
        await this.placeHomeBed();
        
        if (CONFIG.HOME.MARK_HOME_WITH_TORCHES) {
          await this.markHomeLocation();
        }
      }
    } catch (error) {
      logger.log(`Home system initialization failed: ${error.message}`, 'error', this.botName);
    }
  }

  async placeHomeBed() {
    try {
      if (this.state.hasHomeBed) {
        logger.log('Home bed already placed', 'home', this.botName);
        return true;
      }
      
      await this.getBedFromCreative();
      
      const bedPos = await this.findBedPlacementNearHome();
      if (!bedPos) {
        logger.log('Could not find position for home bed', 'warn', this.botName);
        return false;
      }
      
      const placed = await this.safePlaceBed(bedPos);
      if (placed) {
        this.state.homeBedPosition = bedPos;
        this.state.hasHomeBed = true;
        this.state.bedInInventory = false;
        
        logger.log(`Home bed placed at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`, 'success', this.botName);
        
        this.bot.chat(`/spawnpoint ${this.bot.username} ${bedPos.x} ${bedPos.y} ${bedPos.z}`);
        logger.log('Spawn point set to home bed', 'home', this.botName);
        
        return true;
      }
    } catch (error) {
      logger.log(`Failed to place home bed: ${error.message}`, 'error', this.botName);
    }
    
    return false;
  }

  async findBedPlacementNearHome() {
    if (!this.state.homeBedPosition) return null;
    
    const homePos = this.state.homeBedPosition;
    
    const positions = [
      { x: homePos.x, y: homePos.y, z: homePos.z },
      { x: homePos.x + 1, y: homePos.y, z: homePos.z },
      { x: homePos.x, y: homePos.y, z: homePos.z + 1 },
      { x: homePos.x - 1, y: homePos.y, z: homePos.z },
      { x: homePos.x, y: homePos.y, z: homePos.z - 1 },
      { x: homePos.x + 2, y: homePos.y, z: homePos.z },
      { x: homePos.x, y: homePos.y, z: homePos.z + 2 }
    ];
    
    for (const position of positions) {
      const blockPos = new Vec3(position.x, position.y, position.z);
      const blockBelowPos = new Vec3(position.x, position.y - 1, position.z);
      
      const block = this.bot.blockAt(blockPos);
      const blockBelow = this.bot.blockAt(blockBelowPos);
      
      if (block && block.name === 'air' && 
          blockBelow && blockBelow.name !== 'air' && 
          blockBelow.name !== 'lava' && blockBelow.name !== 'water') {
        return position;
      }
    }
    
    return null;
  }

  async markHomeLocation() {
    try {
      if (!this.state.homeBedPosition) return;
      
      const homePos = this.state.homeBedPosition;
      
      const torchPositions = [
        { x: homePos.x + 1, y: homePos.y + 1, z: homePos.z },
        { x: homePos.x - 1, y: homePos.y + 1, z: homePos.z },
        { x: homePos.x, y: homePos.y + 1, z: homePos.z + 1 },
        { x: homePos.x, y: homePos.y + 1, z: homePos.z - 1 }
      ];
      
      for (const position of torchPositions) {
        const torchPos = new Vec3(position.x, position.y, position.z);
        const block = this.bot.blockAt(torchPos);
        
        if (block && block.name === 'air') {
          this.bot.chat(`/give ${this.bot.username} torch 64`);
          await this.delay(500);
          
          await this.safePlaceBlockWithTimeout(block, new Vec3(0, 1, 0), 'torch');
          await this.delay(200);
        }
      }
      
      logger.log('Home marked with torches', 'home', this.botName);
    } catch (error) {
      // Ignore errors in decoration
    }
  }
}

// ================= ENHANCED ADVANCED CREATIVE BOT =================
class AdvancedCreativeBot {
  constructor(config, index) {
    this.config = config;
    this.index = index;
    this.bot = null;
    this.sleepSystem = null;
    this.buildingPlanner = null;
    
    this.state = {
      id: config.id,
      username: config.name,
      personality: config.personality,
      status: 'initializing',
      health: 20,
      food: 20,
      position: null,
      isSleeping: false,
      activity: 'Initializing...',
      creativeMode: true,
      connectedAt: null,
      lastActivity: null,
      homeLocation: null,
      buildStyle: config.buildStyle || 'modern',
      buildingSkill: config.buildingSkill || 'intermediate',
      isBuilding: false,
      currentBuild: null,
      metrics: {
        messagesSent: 0,
        blocksPlaced: 0,
        distanceTraveled: 0,
        sleepCycles: 0,
        connectionAttempts: 0,
        structuresBuilt: 0,
        perfectStructures: 0,
        buildingTime: 0
      }
    };
    
    this.intervals = [];
    this.activityTimeout = null;
    this.buildingTimeout = null;
    this.dayActivityInterval = null;
    
    logger.log(`Bot instance created (${config.personality})`, 'bot', config.name);
  }

  async connect() {
    try {
      this.state.status = 'connecting';
      this.state.metrics.connectionAttempts++;
      
      logger.log(`Connecting to ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`, 'connect', this.state.username);
      
      await this.delay(this.index * CONFIG.SYSTEM.BOT_DELAY);
      
      this.bot = mineflayer.createBot({
        host: CONFIG.SERVER.host,
        port: CONFIG.SERVER.port,
        username: this.state.username,
        version: CONFIG.SERVER.version,
        auth: 'offline',
        viewDistance: 8,
        chatLengthLimit: 256,
        colorsEnabled: false,
        defaultChatPatterns: false,
        hideErrors: false
      });
      
      this.sleepSystem = new PerfectSleepSystem(this.bot, this.state.username);
      this.buildingPlanner = new BuildingPlanner(this.bot, this.state.username);
      
      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.state.status = 'timeout';
          logger.log('Connection timeout', 'error', this.state.username);
          reject(new Error('Connection timeout'));
        }, 45000);
        
        this.bot.once('spawn', () => {
          clearTimeout(timeout);
          this.onSpawn();
          resolve(this);
        });
        
        this.bot.once('error', (err) => {
          clearTimeout(timeout);
          this.state.status = 'error';
          logger.log(`Connection error: ${err.message}`, 'error', this.state.username);
          reject(err);
        });
      });
      
    } catch (error) {
      this.state.status = 'failed';
      logger.log(`Connection failed: ${error.message}`, 'error', this.state.username);
      throw error;
    }
  }

  setupEventHandlers() {
    if (!this.bot) return;
    
    this.bot.on('spawn', () => {
      this.onSpawn();
    });
    
    this.bot.on('health', () => {
      if (this.bot.health !== undefined) this.state.health = this.bot.health;
      if (this.bot.food !== undefined) this.state.food = this.bot.food;
    });
    
    this.bot.on('move', () => {
      if (this.bot.entity) {
        const pos = this.bot.entity.position;
        this.state.position = {
          x: Math.floor(pos.x),
          y: Math.floor(pos.y),
          z: Math.floor(pos.z)
        };
        this.state.metrics.distanceTraveled++;
      }
    });
    
    this.bot.on('time', () => {
      if (this.sleepSystem) {
        this.sleepSystem.checkTimeAndSleep();
      }
      this.state.isSleeping = this.bot.isSleeping || false;
      
      const time = this.bot.time ? this.bot.time.time : 0;
      const isNight = time >= 13000 && time <= 23000;
      
      if (isNight && this.state.isBuilding && this.buildingPlanner) {
        logger.log('Night time - stopping building activity', 'night', this.state.username);
        this.buildingPlanner.emergencyStopBuilding();
        this.state.isBuilding = false;
      }
    });
    
    this.bot.on('sleep', () => {
      logger.log('Started sleeping', 'sleep', this.state.username);
      this.state.isSleeping = true;
      this.state.activity = 'Sleeping';
    });
    
    this.bot.on('wake', () => {
      logger.log('Woke up', 'wake', this.state.username);
      this.state.isSleeping = false;
      this.state.activity = 'Waking up';
    });
    
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      
      logger.log(`${username}: ${message}`, 'chat', this.state.username);
      
      if (CONFIG.FEATURES.CHAT_SYSTEM && Math.random() < 0.4) {
        setTimeout(() => {
          if (this.bot && this.bot.player) {
            const response = this.generateChatResponse(message, username);
            this.bot.chat(response);
            this.state.metrics.messagesSent++;
            logger.log(`Response: ${response}`, 'chat', this.state.username);
          }
        }, 1000 + Math.random() * 3000);
      }
    });
    
    this.bot.on('blockPlaced', () => {
      this.state.metrics.blocksPlaced++;
    });
    
    this.bot.on('kicked', (reason) => {
      logger.log(`Kicked: ${JSON.stringify(reason)}`, 'kick', this.state.username);
      this.state.status = 'kicked';
      this.cleanup();
      this.scheduleReconnect();
    });
    
    this.bot.on('end', () => {
      logger.log('Disconnected from server', 'disconnect', this.state.username);
      this.state.status = 'disconnected';
      this.cleanup();
      this.scheduleReconnect();
    });
    
    this.bot.on('error', (err) => {
      logger.log(`Bot error: ${err.message}`, 'error', this.state.username);
      this.state.status = 'error';
    });
  }

  onSpawn() {
    this.state.status = 'connected';
    this.state.connectedAt = Date.now();
    this.state.position = this.getPosition();
    
    logger.log(`Successfully spawned in world!`, 'success', this.state.username);
    
    setTimeout(() => {
      this.initializeCreativeMode();
    }, 2000);
    
    setTimeout(() => {
      this.initializeHomeSystem();
    }, 5000);
    
    setTimeout(() => {
      this.sleepSystem.startNightMonitoring();
      this.startDaytimeActivitySystem();
      this.startAntiAFKSystem();
    }, 8000);
    
    logger.log(`All systems initialized`, 'success', this.state.username);
    logger.log(`🏗️ Smart Building: ${CONFIG.FEATURES.SMART_BUILDING ? 'ENABLED' : 'DISABLED'}`, 'building', this.state.username);
    logger.log(`⚠️ Emergency Sleep: ${CONFIG.FEATURES.EMERGENCY_SLEEP ? 'ENABLED' : 'DISABLED'}`, 'sleep', this.state.username);
  }

  async initializeHomeSystem() {
    if (CONFIG.FEATURES.HOME_SYSTEM && this.sleepSystem) {
      await this.sleepSystem.initializeHomeSystem();
      if (this.sleepSystem.state.homeBedPosition) {
        this.state.homeLocation = this.sleepSystem.state.homeBedPosition;
      }
    }
  }

  initializeCreativeMode() {
    if (!this.bot) return;
    
    logger.log(`Initializing creative mode...`, 'info', this.state.username);
    
    const setCreativeMode = () => {
      if (this.bot) {
        this.bot.chat('/gamemode creative');
        logger.log(`Creative mode enabled`, 'success', this.state.username);
        
        setTimeout(() => {
          this.giveCreativeItems();
        }, 3000);
      }
    };
    
    setCreativeMode();
    setTimeout(setCreativeMode, 5000);
    setTimeout(setCreativeMode, 10000);
  }

  giveCreativeItems() {
    if (!this.bot) return;
    
    const items = [
      'bed',
      'white_bed',
      'stone 64',
      'oak_planks 64',
      'spruce_planks 64',
      'birch_planks 64',
      'glass 64',
      'glowstone 64',
      'diamond_block 16',
      'gold_block 16',
      'iron_block 16',
      'crafting_table',
      'chest',
      'torch 64',
      'lantern 16',
      'flower_pot 16',
      'furnace',
      'quartz_block 64',
      'white_concrete 64',
      'glass_pane 64',
      'stone_bricks 64',
      'cobblestone 64',
      'dark_oak_planks 64',
      'oak_log 64',
      'hay_block 64',
      'fence 64',
      'bookshelf 16',
      'painting 16'
    ];
    
    items.forEach((item, index) => {
      setTimeout(() => {
        if (this.bot) {
          this.bot.chat(`/give ${this.bot.username} ${item}`);
        }
      }, index * 200);
    });
    
    logger.log(`Creative items granted`, 'success', this.state.username);
  }

  startDaytimeActivitySystem() {
    if (this.dayActivityInterval) {
      clearInterval(this.dayActivityInterval);
    }
    
    this.dayActivityInterval = setInterval(() => {
      if (!this.bot || !this.bot.entity || this.state.isSleeping) {
        return;
      }
      
      if (!this.canPerformDaytimeActivities()) {
        return;
      }
      
      if (this.state.isBuilding) {
        return;
      }
      
      const activity = this.selectDaytimeActivity();
      this.state.activity = activity;
      this.performDaytimeActivity(activity);
      
    }, 20000 + Math.random() * 15000);
    
    logger.log(`Daytime activity system started`, 'success', this.state.username);
  }

  canPerformDaytimeActivities() {
    if (!this.bot || !this.bot.time) return false;
    
    const time = this.bot.time.time;
    
    const isDaytime = time >= 0 && time < 13000;
    
    if (this.sleepSystem && this.sleepSystem.state.emergencySleepMode) {
      return false;
    }
    
    if (this.sleepSystem && this.sleepSystem.state.stoppedActivities) {
      return false;
    }
    
    return isDaytime;
  }

  selectDaytimeActivity() {
    const activities = this.config.activities || ['exploring'];
    
    if (this.config.personality === 'builder') {
      const weighted = [
        'building', 'building', 'building', 'building',
        'designing', 'designing',
        'exploring',
        'crafting',
        'planning'
      ];
      return weighted[Math.floor(Math.random() * weighted.length)];
    } else {
      const weighted = [
        'exploring', 'exploring', 'exploring', 'exploring',
        'mapping', 'mapping',
        'building',
        'discovering',
        'adventuring'
      ];
      return weighted[Math.floor(Math.random() * weighted.length)];
    }
  }

  performDaytimeActivity(activity) {
    logger.log(`Performing daytime activity: ${activity}`, 'info', this.state.username);
    
    if (!this.bot) return;
    
    switch (activity) {
      case 'building':
      case 'designing':
        this.performSmartBuildingActivity();
        break;
        
      case 'crafting':
        this.performCraftingActivity();
        break;
        
      case 'exploring':
      case 'mapping':
      case 'discovering':
      case 'adventuring':
        this.performExplorationActivity();
        break;
        
      case 'planning':
        this.performPlanningActivity();
        break;
        
      default:
        this.performIdleActivity();
    }
  }

  async performSmartBuildingActivity() {
    if (!CONFIG.FEATURES.SMART_BUILDING) {
      logger.log('Smart building disabled', 'warn', this.state.username);
      return;
    }
    
    if (!this.canPerformDaytimeActivities()) {
      logger.log('Cannot build now - not daytime or emergency mode', 'warn', this.state.username);
      return;
    }
    
    if (this.state.isBuilding) {
      logger.log('Already building', 'warn', this.state.username);
      return;
    }
    
    logger.log('Starting smart building activity', 'building', this.state.username);
    
    try {
      this.state.isBuilding = true;
      this.state.activity = 'Finding building location...';
      
      const location = await this.buildingPlanner.findBuildingLocation();
      
      if (!location) {
        logger.log('Could not find suitable building location', 'warn', this.state.username);
        this.state.isBuilding = false;
        return;
      }
      
      const structureType = this.buildingPlanner.selectStructureType();
      
      const plan = this.buildingPlanner.createBuildingPlan(location, structureType);
      
      this.state.currentBuild = {
        name: plan.name,
        location: plan.location,
        startTime: Date.now()
      };
      
      this.state.activity = `Building: ${plan.name}`;
      
      logger.log(`Starting construction of ${plan.name}`, 'building', this.state.username);
      logger.log(`Location: ${location.x}, ${location.y}, ${location.z}`, 'building', this.state.username);
      logger.log(`Size: ${plan.size.width}x${plan.size.depth}x${plan.size.height}`, 'building', this.state.username);
      
      const success = await this.buildingPlanner.executeBuildingPlan(plan);
      
      if (success) {
        this.state.metrics.perfectStructures++;
        this.state.metrics.structuresBuilt++;
        
        const buildTime = Date.now() - this.state.currentBuild.startTime;
        this.state.metrics.buildingTime += buildTime;
        
        logger.log(`✅ Perfect structure built: ${plan.name} in ${Math.round(buildTime/1000)}s`, 'success', this.state.username);
        
        if (Math.random() < 0.3) {
          this.bot.chat(`Just finished building a ${plan.name}!`);
        }
      } else {
        logger.log(`Building interrupted or failed`, 'warn', this.state.username);
      }
      
    } catch (error) {
      logger.log(`Building activity error: ${error.message}`, 'error', this.state.username);
    } finally {
      this.state.isBuilding = false;
      this.state.currentBuild = null;
    }
  }

  performExplorationActivity() {
    if (!this.canPerformDaytimeActivities()) {
      return;
    }
    
    const directions = ['forward', 'back', 'left', 'right'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    this.bot.setControlState(direction, true);
    setTimeout(() => {
      if (this.bot) {
        this.bot.setControlState(direction, false);
      }
    }, 1500 + Math.random() * 1500);
    
    this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    
    if (Math.random() < 0.2) {
      setTimeout(() => {
        if (this.bot) {
          this.scanForBuildingLocations();
        }
      }, 1000);
    }
  }

  scanForBuildingLocations() {
    this.bot.look(Math.random() * Math.PI * 2, -Math.PI / 4);
    
    logger.log('Scanning area for potential building sites', 'info', this.state.username);
  }

  performCraftingActivity() {
    logger.log('Performing crafting activity', 'info', this.state.username);
    
    const pos = this.bot.entity.position;
    const tablePos = {
      x: Math.floor(pos.x) + 1,
      y: Math.floor(pos.y),
      z: Math.floor(pos.z)
    };
    
    this.buildingPlanner.safePlaceBlockAt(tablePos, 'crafting_table');
    
    this.bot.lookAt(new Vec3(tablePos.x, tablePos.y, tablePos.z));
    
    this.bot.swingArm();
    this.delay(1000).then(() => {
      this.bot.swingArm();
    });
    
    logger.log('Crafting simulation complete', 'info', this.state.username);
  }

  performPlanningActivity() {
    this.bot.look(Math.random() * Math.PI * 0.5, Math.random() * Math.PI * 0.5 - Math.PI * 0.25);
  }

  performIdleActivity() {
    this.bot.look(Math.random() * Math.PI * 0.3, Math.random() * Math.PI * 0.3 - Math.PI * 0.15);
  }

  startAntiAFKSystem() {
    const afkInterval = setInterval(() => {
      if (!this.bot || !this.bot.entity || this.state.isSleeping) {
        return;
      }
      
      this.performAntiAFK();
      
    }, 45000 + Math.random() * 30000);
    
    this.intervals.push(afkInterval);
    logger.log(`Anti-AFK system started`, 'success', this.state.username);
  }

  performAntiAFK() {
    if (!this.bot) return;
    
    const actions = [
      () => {
        this.bot.setControlState('jump', true);
        setTimeout(() => {
          if (this.bot) this.bot.setControlState('jump', false);
        }, 200);
      },
      () => {
        this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
      },
      () => {
        const dir = ['forward', 'back', 'left', 'right'][Math.floor(Math.random() * 4)];
        this.bot.setControlState(dir, true);
        setTimeout(() => {
          if (this.bot) this.bot.setControlState(dir, false);
        }, 300);
      },
      () => {
        this.bot.swingArm();
      }
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    action();
    
    logger.log(`Performed anti-AFK action`, 'debug', this.state.username);
  }

  generateChatResponse(message, sender) {
    const lowerMessage = message.toLowerCase();
    const botNameLower = this.state.username.toLowerCase();
    
    if (lowerMessage.includes(botNameLower) || lowerMessage.includes(this.config.personality)) {
      const directResponses = [
        `Yes ${sender}?`,
        `What's up ${sender}?`,
        `Hey ${sender}!`,
        `Need something ${sender}?`,
        `I'm here ${sender}!`,
        `Yes, ${sender}? What do you need?`
      ];
      return directResponses[Math.floor(Math.random() * directResponses.length)];
    }
    
    if (message.includes('?')) {
      const questionResponses = [
        "Good question!",
        "I think so!",
        "Not sure about that.",
        "Probably!",
        "Maybe!",
        "Interesting question!",
        "Let me think about that...",
        "That's a tough one!"
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }
    
    if (this.config.personality === 'builder') {
      const builderResponses = [
        "Working on my masterpiece!",
        "Just building something amazing!",
        "Check out this structure I'm making!",
        "Building is so relaxing!",
        "Need any building help?",
        "The architecture here is inspiring!",
        "Placement is everything in building!"
      ];
      return builderResponses[Math.floor(Math.random() * builderResponses.length)];
    } else {
      const explorerResponses = [
        "Found some cool terrain!",
        "Exploring new areas!",
        "The world is so vast!",
        "On an adventure!",
        "Discovering new places!",
        "This landscape is breathtaking!",
        "There's so much to explore here!"
      ];
      return explorerResponses[Math.floor(Math.random() * explorerResponses.length)];
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
    if (!CONFIG.FEATURES.AUTO_RECONNECT) return;
    
    const delay = 30000 + Math.random() * 30000;
    
    logger.log(`Reconnecting in ${Math.round(delay / 1000)} seconds`, 'info', this.state.username);
    
    setTimeout(() => {
      if (this.state.status !== 'connected') {
        logger.log(`Attempting to reconnect...`, 'connect', this.state.username);
        this.connect().catch(() => {
          this.scheduleReconnect();
        });
      }
    }, delay);
  }

  cleanup() {
    this.intervals.forEach(interval => {
      try {
        clearInterval(interval);
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    
    this.intervals = [];
    
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
      this.activityTimeout = null;
    }
    
    if (this.dayActivityInterval) {
      clearInterval(this.dayActivityInterval);
      this.dayActivityInterval = null;
    }
    
    if (this.buildingTimeout) {
      clearTimeout(this.buildingTimeout);
      this.buildingTimeout = null;
    }
    
    if (this.bot) {
      try {
        this.bot.removeAllListeners();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    const sleepStatus = this.sleepSystem ? this.sleepSystem.getStatus() : { isSleeping: false };
    const buildingStatus = this.buildingPlanner ? this.buildingPlanner.getStatus() : { isBuilding: false };
    
    let uptime = 'N/A';
    if (this.state.connectedAt) {
      const uptimeMs = Date.now() - this.state.connectedAt;
      const hours = Math.floor(uptimeMs / 3600000);
      const minutes = Math.floor((uptimeMs % 3600000) / 60000);
      uptime = `${hours}h ${minutes}m`;
    }
    
    return {
      username: this.state.username,
      personality: this.config.personality,
      status: this.state.status,
      health: this.state.health,
      food: this.state.food,
      position: this.state.position,
      activity: this.state.activity,
      isSleeping: sleepStatus.isSleeping,
      isBuilding: buildingStatus.isBuilding,
      creativeMode: this.state.creativeMode,
      uptime: uptime,
      homeLocation: this.state.homeLocation,
      buildStyle: this.state.buildStyle,
      currentBuild: this.state.currentBuild,
      metrics: {
        messages: this.state.metrics.messagesSent,
        blocks: this.state.metrics.blocksPlaced,
        structures: this.state.metrics.structuresBuilt,
        perfectStructures: this.state.metrics.perfectStructures,
        buildingTime: this.state.metrics.buildingTime,
        sleepCycles: sleepStatus.sleepCycles || 0,
        connectionAttempts: this.state.metrics.connectionAttempts
      },
      sleepInfo: {
        bedPlacements: sleepStatus.bedPlacements || 0,
        failedAttempts: sleepStatus.failedSleepAttempts || 0,
        bedsBroken: sleepStatus.bedsBroken || 0,
        autoBedBreaking: sleepStatus.autoBedBreaking || false,
        lastBedBreakTime: sleepStatus.lastBedBreakTime || 'Never',
        hasHomeBed: sleepStatus.hasHomeBed || false,
        emergencyMode: sleepStatus.emergencyMode || false
      },
      buildingInfo: buildingStatus
    };
  }
}

// ================= BOT MANAGER =================
class BotManager {
  constructor() {
    this.bots = new Map();
    this.statusInterval = null;
    this.reportInterval = null;
    this.isRunning = false;
  }
  
  async start() {
    logger.log(`\n${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log('🚀 STARTING ULTIMATE BOT SYSTEM v2.4', 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}`, 'info', 'SYSTEM');
    logger.log(`Server: ${CONFIG.SERVER.host}:${CONFIG.SERVER.port}`, 'info', 'SYSTEM');
    logger.log(`Bots: ${CONFIG.BOTS.map(b => b.name).join(', ')}`, 'info', 'SYSTEM');
    logger.log(`Features: Smart Building • Emergency Sleep • Perfect Structures`, 'info', 'SYSTEM');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'SYSTEM');
    
    this.isRunning = true;
    
    logger.log(`Initial delay: ${CONFIG.SYSTEM.INITIAL_DELAY / 1000} seconds`, 'info', 'SYSTEM');
    await this.delay(CONFIG.SYSTEM.INITIAL_DELAY);
    
    for (let i = 0; i < CONFIG.BOTS.length; i++) {
      const botConfig = CONFIG.BOTS[i];
      const bot = new AdvancedCreativeBot(botConfig, i);
      this.bots.set(botConfig.id, bot);
      
      if (i > 0) {
        const delay = CONFIG.SYSTEM.BOT_DELAY;
        logger.log(`Waiting ${delay / 1000} seconds before next bot...`, 'info', 'SYSTEM');
        await this.delay(delay);
      }
      
      bot.connect().catch(error => {
        logger.log(`Bot ${botConfig.name} failed: ${error.message}`, 'error', 'SYSTEM');
      });
    }
    
    this.startStatusMonitoring();
    this.startSystemReports();
    
    logger.log(`\n✅ All bots scheduled for connection!`, 'success', 'SYSTEM');
    logger.log(`📊 Status updates every ${CONFIG.SYSTEM.STATUS_INTERVAL / 1000} seconds`, 'info', 'SYSTEM');
    logger.log(`🌐 Web interface available on port ${CONFIG.SYSTEM.PORT}\n`, 'info', 'SYSTEM');
    
    logger.log(`🎯 NEW IN v2.4:`, 'info', 'SYSTEM');
    logger.log(`   • 🏗️ Smart Building System - Plans and builds perfect structures`, 'building', 'SYSTEM');
    logger.log(`   • 📐 Structure Planning - Finds flat areas, creates blueprints`, 'building', 'SYSTEM');
    logger.log(`   • ⚠️ Emergency Sleep - Stops activities at night, finds sleep spot`, 'sleep', 'SYSTEM');
    logger.log(`   • 🌞 Daytime Only Building - Only builds during Minecraft day`, 'building', 'SYSTEM');
    logger.log(`   • 🏠 Home Priority - Returns to home bed at night`, 'home', 'SYSTEM');
    logger.log(`   • 📍 Location Scouting - Finds perfect spots for buildings`, 'building', 'SYSTEM');
  }
  
  startStatusMonitoring() {
    this.statusInterval = setInterval(() => {
      this.printStatus();
    }, CONFIG.SYSTEM.STATUS_INTERVAL);
  }
  
  startSystemReports() {
    this.reportInterval = setInterval(() => {
      this.printSystemReport();
    }, 3600000);
  }
  
  printStatus() {
    const connectedBots = Array.from(this.bots.values())
      .filter(bot => bot.state.status === 'connected');
    
    const sleepingBots = connectedBots
      .filter(bot => bot.state.isSleeping);
    
    const buildingBots = connectedBots
      .filter(bot => bot.state.isBuilding);
    
    const perfectStructures = connectedBots
      .reduce((total, bot) => total + (bot.state.metrics.perfectStructures || 0), 0);
    
    logger.log(`\n${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`📊 BOT STATUS - ${new Date().toLocaleTimeString()}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    logger.log(`Connected: ${connectedBots.length}/${this.bots.size}`, 'info', 'STATUS');
    logger.log(`Sleeping: ${sleepingBots.length}`, 'info', 'STATUS');
    logger.log(`Building: ${buildingBots.length}`, 'info', 'STATUS');
    logger.log(`Perfect Structures Built: ${perfectStructures}`, 'info', 'STATUS');
    logger.log(`Emergency Mode: ${CONFIG.FEATURES.EMERGENCY_SLEEP ? '✅ ACTIVE' : '❌ INACTIVE'}`, 'info', 'STATUS');
    logger.log(`Smart Building: ${CONFIG.FEATURES.SMART_BUILDING ? '✅ ACTIVE' : '❌ INACTIVE'}`, 'info', 'STATUS');
    logger.log(`${'='.repeat(70)}`, 'info', 'STATUS');
    
    if (connectedBots.length === 0) {
      logger.log('No bots currently connected - Auto-reconnect enabled', 'warn', 'STATUS');
    } else {
      connectedBots.forEach(bot => {
        const status = bot.getStatus();
        const sleepIcon = status.isSleeping ? '💤' : '☀️';
        const buildingIcon = status.isBuilding ? '🏗️' : '🛑';
        const activityIcon = status.activity.includes('Building') ? '🏗️' : 
                           status.activity.includes('Explore') ? '🗺️' : 
                           status.activity.includes('Sleep') ? '😴' : '🎯';
        
        const emergencyMode = bot.sleepSystem && bot.sleepSystem.state.emergencySleepMode;
        
        logger.log(`${sleepIcon} ${status.username} (${status.personality}) ${emergencyMode ? '⚠️' : ''}`, 'info', 'STATUS');
        logger.log(`  Status: ${status.status} | Building: ${buildingIcon} ${status.isBuilding ? 'ACTIVE' : 'INACTIVE'}`, 'info', 'STATUS');
        logger.log(`  Activity: ${activityIcon} ${status.activity}`, 'info', 'STATUS');
        logger.log(`  Position: ${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}`, 'info', 'STATUS');
        logger.log(`  Home: ${status.homeLocation ? `${status.homeLocation.x}, ${status.homeLocation.y}, ${status.homeLocation.z}` : 'Not set'}`, 'info', 'STATUS');
        logger.log(`  Perfect Structures: ${status.metrics.perfectStructures || 0} | Blocks: ${status.metrics.blocks}`, 'info', 'STATUS');
        logger.log(`  Build Time: ${status.metrics.buildingTime ? Math.round(status.metrics.buildingTime/1000) + 's' : '0s'}`, 'info', 'STATUS');
        
        if (status.currentBuild) {
          logger.log(`  Current Build: ${status.currentBuild.name} at ${status.currentBuild.location.x},${status.currentBuild.location.z}`, 'building', 'STATUS');
        }
        
        if (emergencyMode) {
          logger.log(`  ⚠️ EMERGENCY MODE: Night detected, activities stopped`, 'emergency', 'STATUS');
        }
        
        logger.log(``, 'info', 'STATUS');
      });
    }
    
    logger.log(`${'='.repeat(70)}\n`, 'info', 'STATUS');
  }
  
  printSystemReport() {
    let totalMessages = 0;
    let totalBlocks = 0;
    let totalStructures = 0;
    let totalPerfectStructures = 0;
    let totalBuildingTime = 0;
    let totalSleepCycles = 0;
    let totalBedPlacements = 0;
    let totalBedsBroken = 0;
    let connectedCount = 0;
    
    this.bots.forEach(bot => {
      const status = bot.getStatus();
      totalMessages += status.metrics.messages || 0;
      totalBlocks += status.metrics.blocks || 0;
      totalStructures += status.metrics.structures || 0;
      totalPerfectStructures += status.metrics.perfectStructures || 0;
      totalBuildingTime += status.metrics.buildingTime || 0;
      totalSleepCycles += status.metrics.sleepCycles || 0;
      totalBedPlacements += status.sleepInfo.bedPlacements || 0;
      totalBedsBroken += status.sleepInfo.bedsBroken || 0;
      if (status.status === 'connected') connectedCount++;
    });
    
    logger.log(`\n${'='.repeat(70)}`, 'info', 'REPORT');
    logger.log(`📈 SYSTEM REPORT - ${new Date().toLocaleTimeString()}`, 'info', 'REPORT');
    logger.log(`${'='.repeat(70)}`, 'info', 'REPORT');
    logger.log(`Connected Bots: ${connectedCount}/${this.bots.size}`, 'info', 'REPORT');
    logger.log(`Total Messages Sent: ${totalMessages}`, 'info', 'REPORT');
    logger.log(`Total Blocks Placed: ${totalBlocks}`, 'info', 'REPORT');
    logger.log(`Total Structures Built: ${totalStructures}`, 'info', 'REPORT');
    logger.log(`Total Perfect Structures: ${totalPerfectStructures}`, 'info', 'REPORT');
    logger.log(`Total Building Time: ${Math.round(totalBuildingTime/1000)}s`, 'info', 'REPORT');
    logger.log(`Total Sleep Cycles: ${totalSleepCycles}`, 'info', 'REPORT');
    logger.log(`Total Bed Placements: ${totalBedPlacements}`, 'info', 'REPORT');
    logger.log(`Total Beds Broken: ${totalBedsBroken}`, 'info', 'REPORT');
    logger.log(`Auto-Bed Breaking: ${CONFIG.SLEEP_SYSTEM.BREAK_BED_AFTER_SLEEP ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
    logger.log(`Home System: ${CONFIG.FEATURES.HOME_SYSTEM ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
    logger.log(`Smart Building: ${CONFIG.FEATURES.SMART_BUILDING ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
    logger.log(`Emergency Sleep: ${CONFIG.FEATURES.EMERGENCY_SLEEP ? 'ACTIVE ✅' : 'INACTIVE ❌'}`, 'info', 'REPORT');
    logger.log(`System Uptime: ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`, 'info', 'REPORT');
    logger.log(`${'='.repeat(70)}\n`, 'info', 'REPORT');
  }
  
  getAllStatuses() {
    const statuses = {};
    this.bots.forEach((bot, id) => {
      statuses[id] = bot.getStatus();
    });
    return statuses;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async stop() {
    logger.log('\n🛑 Stopping bot system...', 'info', 'SYSTEM');
    this.isRunning = false;
    
    if (this.statusInterval) clearInterval(this.statusInterval);
    if (this.reportInterval) clearInterval(this.reportInterval);
    
    let stoppedCount = 0;
    for (const [id, bot] of this.bots) {
      try {
        bot.cleanup();
        if (bot.bot) {
          bot.bot.quit();
        }
        stoppedCount++;
        logger.log(`Stopped ${bot.state.username}`, 'success', 'SYSTEM');
      } catch (error) {
        logger.log(`Failed to stop ${bot.state.username}: ${error.message}`, 'error', 'SYSTEM');
      }
    }
    
    logger.log(`\n🎮 System stopped. ${stoppedCount} bots terminated.`, 'success', 'SYSTEM');
    return stoppedCount;
  }
}

// ================= WEB SERVER =================
function createWebServer(botManager) {
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    
    if (url === '/' || url === '') {
      const statuses = botManager.getAllStatuses();
      const connected = Object.values(statuses).filter(s => s.status === 'connected').length;
      const sleeping = Object.values(statuses).filter(s => s.isSleeping).length;
      const building = Object.values(statuses).filter(s => s.isBuilding).length;
      const perfectStructures = Object.values(statuses).reduce((total, s) => total + (s.metrics.perfectStructures || 0), 0);
      
      res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ultimate Minecraft Bot System v2.4</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #00ff88, #00ccff);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        .version {
            background: rgba(0, 204, 255, 0.2);
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 0.9rem;
            display: inline-block;
            margin-left: 10px;
        }
        .subtitle {
            color: #aaa;
            margin-bottom: 20px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-card.connected { border-color: #00ff88; }
        .stat-card.sleeping { border-color: #00ccff; }
        .stat-card.building { border-color: #ffaa00; }
        .stat-card.perfect { border-color: #ff55ff; }
        .stat-card.emergency { border-color: #ff3333; }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 10px 0;
        }
        .connected-color { color: #00ff88; }
        .sleeping-color { color: #00ccff; }
        .building-color { color: #ffaa00; }
        .perfect-color { color: #ff55ff; }
        .emergency-color { color: #ff3333; }
        
        .bots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .bot-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s;
        }
        .bot-card.sleeping {
            border-color: #00ccff;
            box-shadow: 0 0 20px rgba(0, 204, 255, 0.2);
        }
        .bot-card.building {
            border-color: #ffaa00;
            box-shadow: 0 0 20px rgba(255, 170, 0, 0.2);
        }
        .bot-card.has-home {
            border-color: #ff55ff;
            box-shadow: 0 0 20px rgba(255, 85, 255, 0.2);
        }
        .bot-card.emergency {
            border-color: #ff3333;
            box-shadow: 0 0 20px rgba(255, 51, 51, 0.2);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 20px rgba(255, 51, 51, 0.2); }
            50% { box-shadow: 0 0 30px rgba(255, 51, 51, 0.4); }
            100% { box-shadow: 0 0 20px rgba(255, 51, 51, 0.2); }
        }
        
        .bot-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .bot-name {
            font-size: 1.5rem;
            font-weight: bold;
        }
        .bot-personality {
            background: rgba(255, 255, 255, 0.1);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
        }
        .connected-badge { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
        .disconnected-badge { background: rgba(255, 85, 85, 0.2); color: #ff5555; }
        .building-badge { background: rgba(255, 170, 0, 0.2); color: #ffaa00; }
        .emergency-badge { background: rgba(255, 51, 51, 0.2); color: #ff3333; }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 20px;
        }
        .info-item {
            background: rgba(255, 255, 255, 0.03);
            padding: 10px;
            border-radius: 10px;
        }
        .info-label {
            font-size: 0.9rem;
            color: #aaa;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 1.1rem;
            font-weight: bold;
        }
        
        .home-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(255, 85, 255, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 85, 255, 0.3);
        }
        
        .building-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(255, 170, 0, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 170, 0, 0.3);
        }
        
        .sleep-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(0, 204, 255, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(0, 204, 255, 0.3);
        }
        
        .emergency-info {
            margin-top: 15px;
            padding: 12px;
            background: rgba(255, 51, 51, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 51, 51, 0.3);
        }
        
        .features {
            margin-top: 40px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .feature {
            background: rgba(0, 255, 136, 0.1);
            padding: 10px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s;
        }
        .feature:hover {
            transform: scale(1.05);
        }
        .feature.new {
            background: rgba(255, 170, 0, 0.1);
            border: 1px solid rgba(255, 170, 0, 0.3);
        }
        .feature.emergency-feature {
            background: rgba(255, 51, 51, 0.1);
            border: 1px solid rgba(255, 51, 51, 0.3);
        }
        .feature.home-feature {
            background: rgba(255, 85, 255, 0.1);
            border: 1px solid rgba(255, 85, 255, 0.3);
        }
        .feature.building-feature {
            background: rgba(0, 204, 255, 0.1);
            border: 1px solid rgba(0, 204, 255, 0.3);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            .header {
                padding: 20px;
            }
            h1 {
                font-size: 2rem;
            }
            .bots-grid {
                grid-template-columns: 1fr;
            }
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Ultimate Minecraft Bot System <span class="version">v2.4</span></h1>
            <p class="subtitle">Smart Building • Emergency Sleep • Perfect Structures</p>
            
            <div class="stats">
                <div class="stat-card connected">
                    <div>Connected Bots</div>
                    <div class="stat-value connected-color">${connected}</div>
                </div>
                <div class="stat-card sleeping">
                    <div>Sleeping</div>
                    <div class="stat-value sleeping-color">${sleeping}</div>
                </div>
                <div class="stat-card building">
                    <div>Building</div>
                    <div class="stat-value building-color">${building}</div>
                </div>
                <div class="stat-card perfect">
                    <div>Perfect Structures</div>
                    <div class="stat-value perfect-color">${perfectStructures}</div>
                </div>
                <div class="stat-card emergency">
                    <div>Emergency Mode</div>
                    <div class="stat-value emergency-color">${CONFIG.FEATURES.EMERGENCY_SLEEP ? 'ON' : 'OFF'}</div>
                </div>
            </div>
        </div>
        
        <h2 style="margin-bottom: 20px;">🤖 Bot Status</h2>
        <div class="bots-grid">
            ${Object.entries(statuses).map(([id, status]) => {
              const emergencyMode = status.sleepInfo?.emergencyMode || false;
              const buildingStatus = status.buildingInfo?.currentPlan || null;
              const isBuildingNow = status.isBuilding || false;
              
              return `
            <div class="bot-card ${status.isSleeping ? 'sleeping' : isBuildingNow ? 'building' : status.homeLocation ? 'has-home' : emergencyMode ? 'emergency' : ''}">
                <div class="bot-header">
                    <div>
                        <div class="bot-name">${status.username}</div>
                        <div class="bot-personality">${status.personality.toUpperCase()}</div>
                    </div>
                    <div class="status-badge ${status.status === 'connected' ? 
                        emergencyMode ? 'emergency-badge' : 
                        isBuildingNow ? 'building-badge' : 
                        'connected-badge' : 'disconnected-badge'}">
                        ${emergencyMode ? '⚠️ EMERGENCY' : status.status.toUpperCase()}
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Activity</div>
                        <div class="info-value">${status.activity} ${status.isSleeping ? '😴' : isBuildingNow ? '🏗️' : status.activity.includes('Explore') ? '🗺️' : '🎯'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Health</div>
                        <div class="info-value">${status.health}/20</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Position</div>
                        <div class="info-value">${status.position ? `${status.position.x}, ${status.position.y}, ${status.position.z}` : 'Unknown'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Build Style</div>
                        <div class="info-value">${status.buildStyle}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Blocks Placed</div>
                        <div class="info-value">${status.metrics.blocks || 0}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Perfect Structures</div>
                        <div class="info-value">${status.metrics.perfectStructures || 0}</div>
                    </div>
                </div>
                
                ${status.homeLocation ? `
                <div class="home-info">
                    <div class="info-label">🏠 Home Location</div>
                    <div class="info-value">${status.homeLocation.x}, ${status.homeLocation.y}, ${status.homeLocation.z}</div>
                    <div style="margin-top: 5px; font-size: 0.9rem; color: #ffaa00;">
                        Returns home at night • Permanent bed • Spawn point
                    </div>
                </div>
                ` : ''}
                
                ${buildingStatus ? `
                <div class="building-info">
                    <div class="info-label">🏗️ Current Build</div>
                    <div class="info-value">${buildingStatus.name}</div>
                    <div style="margin-top: 5px; font-size: 0.9rem; color: #00ff88;">
                        Progress: ${buildingStatus.progress} • Location: ${buildingStatus.location.x},${buildingStatus.location.z}
                    </div>
                </div>
                ` : ''}
                
                ${emergencyMode ? `
                <div class="emergency-info">
                    <div class="info-label">⚠️ EMERGENCY MODE</div>
                    <div class="info-value">NIGHTTIME - ACTIVITIES STOPPED</div>
                    <div style="margin-top: 5px; font-size: 0.9rem; color: #ff3333;">
                        All activities stopped • Emergency sleep activated • Will resume at dawn
                    </div>
                </div>
                ` : ''}
                
                <div class="sleep-info">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <div>
                            <div class="info-label">Sleep Cycles</div>
                            <div class="info-value">${status.metrics.sleepCycles || 0}</div>
                        </div>
                        <div>
                            <div class="info-label">Beds Broken</div>
                            <div class="info-value">${status.sleepInfo?.bedsBroken || 0}</div>
                        </div>
                        <div>
                            <div class="info-label">Home Bed</div>
                            <div class="info-value">${status.sleepInfo?.hasHomeBed ? '✅' : '❌'}</div>
                        </div>
                    </div>
                </div>
            </div>
            `}).join('')}
        </div>
        
        <div class="features">
            <h2>⚡ Active Features v2.4</h2>
            <div class="features-grid">
                <div class="feature">🎮 Creative Mode</div>
                <div class="feature">😴 Auto-Sleep</div>
                <div class="feature building-feature">🏗️ Smart Building</div>
                <div class="feature building-feature">📐 Structure Planning</div>
                <div class="feature emergency-feature">⚠️ Emergency Sleep</div>
                <div class="feature">🌞 Daytime Building</div>
                <div class="feature home-feature">🏠 Home System</div>
                <div class="feature home-feature">📍 Return to Home</div>
                <div class="feature">🔄 Auto-Reconnect</div>
                <div class="feature">💬 Smart Chat</div>
                <div class="feature">🎯 Activity System</div>
                <div class="feature">⚡ Anti-AFK</div>
                <div class="feature">📊 Web Interface</div>
                <div class="feature">🛡️ Crash Protection</div>
                <div class="feature">🔧 Error Recovery</div>
                <div class="feature">🌙 Time Awareness</div>
            </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #777; font-size: 0.9rem;">
            <p>✅ System Status: Fully Operational • All Features Active • Crash Protection Enabled</p>
            <p>🚀 <strong>v2.4 NEW:</strong> Smart Building • Emergency Sleep • Perfect Structures</p>
            <p>Last updated: ${new Date().toLocaleTimeString()}</p>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>`;
      
      res.end(html);
      
    } else if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '2.4',
        bots: Object.keys(botManager.getAllStatuses()).length,
        features: CONFIG.FEATURES,
        crash_protection: CONFIG.FEATURES.CRASH_PROTECTION
      }));
      
    } else if (url === '/api/status') {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        version: '2.4',
        server: CONFIG.SERVER,
        timestamp: new Date().toISOString(),
        features: CONFIG.FEATURES,
        sleep_system: CONFIG.SLEEP_SYSTEM,
        building_system: CONFIG.BUILDING,
        home_system: CONFIG.HOME,
        bots: botManager.getAllStatuses()
      }));
      
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Not Found</h1><p>The requested page does not exist.</p>');
    }
  });
  
  server.listen(CONFIG.SYSTEM.PORT, () => {
    logger.log(`🌐 Web server running on port ${CONFIG.SYSTEM.PORT}`, 'success', 'WEB');
    logger.log(`📱 Status page: http://localhost:${CONFIG.SYSTEM.PORT}`, 'info', 'WEB');
    logger.log(`🩺 Health check: http://localhost:${CONFIG.SYSTEM.PORT}/health`, 'info', 'WEB');
    logger.log(`📊 JSON API: http://localhost:${CONFIG.SYSTEM.PORT}/api/status`, 'info', 'WEB');
    logger.log(`🏗️ Smart Building: ${CONFIG.FEATURES.SMART_BUILDING ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'building', 'WEB');
    logger.log(`⚠️ Emergency Sleep: ${CONFIG.FEATURES.EMERGENCY_SLEEP ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'emergency', 'WEB');
    logger.log(`🛡️ Crash Protection: ${CONFIG.FEATURES.CRASH_PROTECTION ? 'ENABLED ✅' : 'DISABLED ❌'}`, 'success', 'WEB');
  });
  
  return server;
}

// ================= MAIN EXECUTION =================
async function main() {
  try {
    logger.log('🚀 Initializing Ultimate Minecraft Bot System v2.4...', 'info', 'SYSTEM');
    logger.log('✅ Smart building with perfect structures enabled!', 'success', 'SYSTEM');
    logger.log('✅ Emergency sleep system activated!', 'success', 'SYSTEM');
    
    const botManager = new BotManager();
    
    createWebServer(botManager);
    
    process.on('SIGINT', async () => {
      logger.log('\n\n🛑 Received shutdown signal...', 'warn', 'SYSTEM');
      await botManager.stop();
      logger.log('👋 System shutdown complete. Goodbye!', 'success', 'SYSTEM');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.log('\n\n🛑 Received termination signal...', 'warn', 'SYSTEM');
      await botManager.stop();
      logger.log('👋 System terminated.', 'success', 'SYSTEM');
      process.exit(0);
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await botManager.start();
    
    logger.log('\n🎯 BOT DAILY ROUTINE v2.4:', 'info', 'SYSTEM');
    logger.log('   1. ☀️ DAYTIME (0-12000 ticks):', 'day', 'SYSTEM');
    logger.log('      • Find perfect building locations', 'building', 'SYSTEM');
    logger.log('      • Plan structures with proper blueprints', 'building', 'SYSTEM');
    logger.log('      • Build complete houses with foundations, walls, roofs', 'building', 'SYSTEM');
    logger.log('      • Add windows, doors, decorations', 'building', 'SYSTEM');
    logger.log('      • Explore and scout new locations', 'travel', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log('   2. 🌙 NIGHT APPROACHING (12000-13000):', 'night', 'SYSTEM');
    logger.log('      • Stop all building activities', 'emergency', 'SYSTEM');
    logger.log('      • Emergency mode activated', 'emergency', 'SYSTEM');
    logger.log('      • Return to home location', 'travel', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log('   3. 🌃 NIGHTTIME (13000-23000):', 'night', 'SYSTEM');
    logger.log('      • Emergency sleep in home bed', 'sleep', 'SYSTEM');
    logger.log('      • If no bed nearby, find safe spot', 'emergency', 'SYSTEM');
    logger.log('      • No building or exploration', 'emergency', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log('   4. ☀️ MORNING (23000-24000/0):', 'day', 'SYSTEM');
    logger.log('      • Wake up from sleep', 'wake', 'SYSTEM');
    logger.log('      • Emergency mode deactivated', 'day', 'SYSTEM');
    logger.log('      • Resume daytime activities', 'success', 'SYSTEM');
    logger.log('      • Continue or start new building projects', 'building', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log('🏗️ Each bot will:', 'info', 'SYSTEM');
    logger.log('   • Build different structure types (Modern, Medieval, Cottage, etc.)', 'building', 'SYSTEM');
    logger.log('   • Find flat, suitable areas for construction', 'building', 'SYSTEM');
    logger.log('   • Create complete, proper buildings like real players', 'building', 'SYSTEM');
    logger.log('   • Space out buildings to avoid overlap', 'building', 'SYSTEM');
    logger.log('   • Only build during Minecraft daytime', 'building', 'SYSTEM');
    logger.log('', 'info', 'SYSTEM');
    logger.log('📊 Check web interface for building progress and perfect structures!', 'info', 'SYSTEM');
    
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
    
  } catch (error) {
    logger.log(`❌ Fatal system error: ${error.message}`, 'error', 'SYSTEM');
    logger.log(error.stack, 'error', 'SYSTEM');
    process.exit(1);
  }
}

// Start everything
main();
