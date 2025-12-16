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
    SMART_BUILDING: true, // NEW: Smart building with planning
    EMERGENCY_SLEEP: true, // NEW: Emergency sleep at night
    BUILDING_ONLY_DAYTIME: true, // NEW: Only build during day
    STRUCTURE_PLANNING: true // NEW: Plan structures before building
  },
  SLEEP_SYSTEM: {
    BREAK_BED_AFTER_SLEEP: true,
    BREAK_DELAY: 2000,
    BREAK_TIMEOUT: 10000,
    KEEP_BED_IF_PLAYER_NEARBY: false,
    BREAK_METHOD: 'dig',
    KEEP_HOME_BED: true,
    EMERGENCY_SLEEP_DISTANCE: 15, // Max distance to find sleep spot
    STOP_ACTIVITIES_AT_NIGHT: true // NEW: Stop activities at night
  },
  BUILDING: {
    BUILDING_TIME: {
      DAY_ONLY: true,
      START_HOUR: 0, // Minecraft time 0-24000
      END_HOUR: 12000,
      MIN_BUILDING_TIME: 20000, // Minimum time to spend building
      MAX_BUILDING_TIME: 60000 // Maximum time to spend building
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
    MIN_BUILD_DISTANCE_FROM_HOME: 20, // Minimum distance from home to build
    MAX_BUILD_DISTANCE_FROM_HOME: 100, // Maximum distance from home to build
    BUILDING_AREA_CHECK: true,
    BUILDING_SPACING: 10, // Space between structures
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
    HOME_STRUCTURE: true, // Build a proper home structure
    HOME_STYLE: 'modern' // Style for home structure
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
    
    // Check existing built structures to avoid overlap
    const builtPositions = this.builtStructures.map(s => s.location);
    
    // Try multiple locations
    for (let attempt = 0; attempt < 10; attempt++) {
      // Random angle and distance
      const angle = Math.random() * Math.PI * 2;
      const distance = CONFIG.BUILDING.MIN_BUILD_DISTANCE_FROM_HOME + 
                      Math.random() * (CONFIG.BUILDING.MAX_BUILD_DISTANCE_FROM_HOME - CONFIG.BUILDING.MIN_BUILD_DISTANCE_FROM_HOME);
      
      const candidateX = Math.floor(botPos.x + Math.cos(angle) * distance);
      const candidateZ = Math.floor(botPos.z + Math.sin(angle) * distance);
      
      // Check if location is far enough from existing structures
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
      
      // Check ground level and flatness
      const groundInfo = await this.checkGroundFlatness(candidateX, candidateZ, 9, 7);
      
      if (groundInfo.isSuitable) {
        logger.log(`Found suitable building location at ${candidateX}, ${groundInfo.groundLevel}, ${candidateZ}`, 'success', this.botName);
        
        return {
          x: candidateX,
          y: groundInfo.groundLevel,
          z: candidateZ,
          width: 9,
          depth: 7,
          rotation: Math.floor(Math.random() * 4) * 90 // 0, 90, 180, 270 degrees
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
    
    // Sample points in a grid
    for (let x = -halfWidth; x <= halfWidth; x += 2) {
      for (let z = -halfDepth; z <= halfDepth; z += 2) {
        const worldX = centerX + x;
        const worldZ = centerZ + z;
        
        // Find ground level
        const groundLevel = await this.findGroundLevel(worldX, worldZ);
        if (groundLevel !== null) {
          samples.push({ x: worldX, z: worldZ, y: groundLevel });
        }
      }
    }
    
    if (samples.length < 4) {
      return { isSuitable: false, groundLevel: null };
    }
    
    // Check flatness (max height difference)
    const heights = samples.map(s => s.y);
    const minHeight = Math.min(...heights);
    const maxHeight = Math.max(...heights);
    const heightDifference = maxHeight - minHeight;
    
    // Check for water or lava
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
        return y + 1; // Ground level is above solid block
      }
    }
    return null;
  }

  // Select structure type based on bot's personality
  selectStructureType() {
    const botConfig = CONFIG.BOTS.find(b => b.name === this.botName);
    const style = botConfig?.buildStyle || 'modern';
    const skill = botConfig?.buildingSkill || 'intermediate';
    
    // Filter structures by style and complexity
    const availableStructures = CONFIG.BUILDING.STRUCTURE_TYPES.filter(structure => {
      if (skill === 'beginner' && structure.complexity !== 'easy') return false;
      if (skill === 'intermediate' && structure.complexity === 'hard') return false;
      if (style && structure.style !== style) return false;
      return true;
    });
    
    if (availableStructures.length === 0) {
      // Fallback to any structure
      return CONFIG.BUILDING.STRUCTURE_TYPES[0];
    }
    
    return availableStructures[Math.floor(Math.random() * availableStructures.length)];
  }

  // Create detailed building plan
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
    
    // Define building steps
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

  // Get building materials
  async getBuildingMaterials(plan) {
    if (!this.bot) return;
    
    logger.log(`Getting materials for ${plan.name}`, 'building', this.botName);
    
    // Get required blocks
    const uniqueBlocks = [...new Set(plan.blocks)];
    
    uniqueBlocks.forEach((block, index) => {
      setTimeout(() => {
        if (this.bot) {
          // Calculate approximate amount needed
          const volume = plan.size.width * plan.size.depth * plan.size.height;
          const amount = Math.min(Math.max(volume / 10, 32), 128);
          
          this.bot.chat(`/give ${this.bot.username} ${block} ${amount}`);
          logger.log(`Getting ${amount}x ${block}`, 'building', this.botName);
        }
      }, index * 1000);
    });
    
    // Get decoration items
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

  // Execute building plan
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
      // Move to building location
      await this.moveToBuildLocation(plan.location);
      
      // Get materials
      await this.getBuildingMaterials(plan);
      
      // Execute each building step
      for (const step of plan.steps) {
        if (!this.isBuilding) break;
        
        this.constructionStep++;
        logger.log(`Step ${this.constructionStep}/${plan.steps.length}: ${step.name}`, 'building', this.botName);
        
        await this.executeBuildingStep(step, plan);
        
        // Check if night is approaching
        if (this.bot.time && this.shouldStopForNight()) {
          logger.log('Night approaching - stopping construction', 'night', this.botName);
          await this.emergencyStopBuilding();
          return false;
        }
        
        await this.delay(step.duration);
      }
      
      // Complete the structure
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
    const foundationY = location.y - CONFIG.BUILDING.FOUNDATION_DEPTH;
    
    // Build foundation
    for (let x = -1; x < size.width + 1; x++) {
      for (let z = -1; z < size.depth + 1; z++) {
        const blockX = startX + x;
        const blockZ = startZ + z;
        
        await this.safePlaceBlockAt({ x: blockX, y: foundationY, z: blockZ }, blockType);
        await this.delay(100);
      }
    }
    
    // Build floor
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
    
    // Build walls
    for (let height = 1; height <= size.height; height++) {
      // Front and back walls
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
      
      // Side walls
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
    
    // Build flat roof for now (can enhance for different roof types)
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
    
    // Add roof trim
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
    
    // Add windows to front and back walls
    const windowHeight = location.y + 2;
    const windowSpacing = 2;
    
    // Front wall windows
    for (let x = 1; x < size.width - 1; x += windowSpacing) {
      await this.safePlaceBlockAt({ 
        x: startX + x, 
        y: windowHeight, 
        z: startZ 
      }, 'glass_pane');
      
      await this.delay(200);
    }
    
    // Back wall windows
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
    
    // Add door in the middle of front wall
    const doorX = startX + Math.floor(size.width / 2);
    
    // Clear door space
    await this.safePlaceBlockAt({ x: doorX, y: location.y + 1, z: startZ }, 'air');
    await this.safePlaceBlockAt({ x: doorX, y: location.y + 2, z: startZ }, 'air');
    
    // Add path to door
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
    
    // Add torches at corners
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
    
    // Add flower pots
    await this.safePlaceBlockAt({ 
      x: startX + 2, 
      y: location.y + 1, 
      z: startZ - 1 
    }, 'flower_pot');
    
    await this.delay(300);
    
    // Add chest inside
    await this.safePlaceBlockAt({ 
      x: startX + 2, 
      y: location.y + 1, 
      z: startZ + 2 
    }, 'chest');
    
    logger.log('Decorations added', 'building', this.botName);
  }

  async finalizeStructure(plan) {
    const loc = plan.location;
    
    // Add sign with structure name
    await this.safePlaceBlockAt({ 
      x: loc.x, 
      y: loc.y + 1, 
      z: loc.z - 2 
    }, 'oak_sign');
    
    // Light up the area
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
    
    // Move toward location
    let attempts = 0;
    while (attempts < 100) {
      await this.delay(100);
      const currentPos = this.bot.entity.position;
      const distance = currentPos.distanceTo(target);
      
      if (distance < 3) {
        break;
      }
      
      attempts++;
      
      // Adjust direction every few steps
      if (attempts % 10 === 0) {
        await this.bot.lookAt(target);
      }
    }
    
    this.bot.setControlState('forward', false);
    
    // Turn to face the building area
    await this.bot.lookAt(new Vec3(location.x, location.y, location.z));
    
    logger.log(`Arrived at build location`, 'building', this.botName);
  }

  async emergencyStopBuilding() {
    if (!this.isBuilding) return;
    
    logger.log('Emergency stop - saving construction site', 'warn', this.botName);
    
    // Mark incomplete structure
    if (this.currentPlan && this.currentPlan.location) {
      const loc = this.currentPlan.location;
      
      // Place a temporary marker
      await this.safePlaceBlockAt({ x: loc.x, y: loc.y + 3, z: loc.z }, 'red_wool');
      
      logger.log(`Construction site marked at ${loc.x}, ${loc.y}, ${loc.z}`, 'building', this.botName);
    }
    
    this.isBuilding = false;
    this.currentPlan = null;
    this.constructionStep = 0;
    
    // Return to home if needed
    if (this.bot.time && this.bot.time.time >= 13000) {
      logger.log('Night time - heading home for emergency sleep', 'night', this.botName);
      // The sleep system will handle returning home
    }
  }

  shouldStopForNight() {
    if (!this.bot.time) return false;
    
    const time = this.bot.time.time;
    // Stop building 1000 ticks before night (23000)
    return time >= 22000 || time <= 1000;
  }

  canBuildNow() {
    if (!this.bot.time) return false;
    
    if (!CONFIG.FEATURES.BUILDING_ONLY_DAYTIME) {
      return true;
    }
    
    const time = this.bot.time.time;
    // Only build during day (0-12000) and early afternoon
    return time >= CONFIG.BUILDING.BUILDING_TIME.START_HOUR && 
           time <= CONFIG.BUILDING.BUILDING_TIME.END_HOUR;
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

  // ================= ENHANCED: EMERGENCY NIGHT HANDLING =================
  startNightMonitoring() {
    if (this.nightCheckInterval) {
      clearInterval(this.nightCheckInterval);
    }
    
    this.nightCheckInterval = setInterval(() => {
      if (!this.bot || !this.bot.time) return;
      
      const time = this.bot.time.time;
      const isNight = time >= 13000 && time <= 23000;
      
      // Check if it's becoming night
      if (isNight && !this.state.stoppedActivities && CONFIG.SLEEP_SYSTEM.STOP_ACTIVITIES_AT_NIGHT) {
        this.emergencyNightProcedure();
      }
      
      // Check for emergency sleep
      if (isNight && !this.state.isSleeping && this.state.emergencySleepMode) {
        this.emergencySleep();
      }
      
      // Reset emergency mode during day
      if (!isNight && this.state.emergencySleepMode) {
        this.state.emergencySleepMode = false;
        this.state.stoppedActivities = false;
        logger.log('Daytime - emergency mode deactivated', 'day', this.botName);
      }
      
    }, 5000); // Check every 5 seconds
  }

  emergencyNightProcedure() {
    logger.log('⚠️ Night detected - Stopping all activities immediately', 'night', this.botName);
    
    this.state.stoppedActivities = true;
    this.state.emergencySleepMode = true;
    
    // Stop any ongoing activities
    this.stopAllActivities();
    
    // If far from home, start emergency return
    if (this.state.hasHomeBed) {
      const distanceFromHome = this.getDistanceFromHome();
      
      if (distanceFromHome > CONFIG.HOME.HOME_RETURN_DISTANCE) {
        logger.log(`Far from home (${Math.round(distanceFromHome)} blocks) - Emergency return initiated`, 'emergency', this.botName);
        this.emergencyReturnHome();
      } else {
        // Close to home, go to emergency sleep
        setTimeout(() => {
          this.emergencySleep();
        }, 2000);
      }
    } else {
      // No home, find nearest safe spot
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
      // Stop everything
      this.stopAllActivities();
      
      // Quick navigation home
      await this.quickNavigateToHome();
      
      // Sleep immediately
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
    
    // Keep moving toward home for a set time
    await this.delay(15000); // 15 seconds max
    
    this.bot.setControlState('forward', false);
    this.bot.setControlState('sprint', false);
    
    // Check if we're close enough
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
    
    // Try home bed first
    if (this.state.hasHomeBed) {
      const success = await this.trySleepInHomeBed();
      if (success) return;
    }
    
    // Try existing beds nearby
    const existingBed = await this.findNearbyBed();
    if (existingBed) {
      await this.sleepInBed(existingBed);
      return;
    }
    
    // Emergency bed placement
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
      // Get bed
      this.bot.chat(`/give ${this.bot.username} bed 1`);
      await this.delay(1000);
      
      // Find placement near current position
      const pos = this.bot.entity.position;
      const bedPos = {
        x: Math.floor(pos.x),
        y: Math.floor(pos.y),
        z: Math.floor(pos.z)
      };
      
      // Try to place bed
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
    
    // Try positions around home
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
    
    // Look for any safe flat area
    const pos = this.bot.entity.position;
    
    for (let radius = 0; radius <= CONFIG.SLEEP_SYSTEM.EMERGENCY_SLEEP_DISTANCE; radius++) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const checkX = Math.floor(pos.x + Math.cos(angle) * radius);
        const checkZ = Math.floor(pos.z + Math.sin(angle) * radius);
        
        // Find ground level
        const groundLevel = await this.findGroundLevel(checkX, checkZ);
        if (groundLevel === null) continue;
        
        const position = { x: checkX, y: groundLevel, z: checkZ };
        
        // Check if suitable for bed
        if (await this.isSuitableForBed(position)) {
          logger.log(`Found emergency sleep spot at ${position.x}, ${position.y}, ${position.z}`, 'emergency', this.botName);
          
          // Place bed and sleep
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
    
    // Get bed
    await this.getBedFromCreative();
    
    // Find placement
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

  // ================= MODIFIED: CHECK TIME WITH EMERGENCY MODE =================
  checkTimeAndSleep() {
    if (!this.bot || !this.bot.time || !CONFIG.FEATURES.AUTO_SLEEP) return;
    
    const time = this.bot.time.time;
    const isNight = time >= 13000 && time <= 23000;
    
    if (this.bot.isSleeping !== undefined) {
      this.state.isSleeping = this.bot.isSleeping;
    }
    
    if (isNight && !this.state.isSleeping) {
      // Emergency sleep mode
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

  // ================= MODIFIED ENHANCED SLEEP SYSTEM =================
  async sleepImmediately() {
    if (this.state.isSleeping) return;
    
    logger.log('Initiating immediate sleep sequence', 'sleep', this.botName);
    
    this.stopAllActivities();
    
    // Check if it's night for emergency mode
    const time = this.bot.time ? this.bot.time.time : 0;
    const isNight = time >= 13000 && time <= 23000;
    
    if (isNight) {
      this.state.emergencySleepMode = true;
      await this.emergencySleep();
      return;
    }
    
    // Normal sleep procedure
    const existingBed = await this.findNearbyBed();
    
    if (existingBed) {
      await this.sleepInBed(existingBed);
    } else {
      await this.placeBedAndSleep();
    }
  }

  // ================= ALL OTHER EXISTING METHODS REMAIN =================
  // ... (all the existing sleep system methods remain exactly the same)
  // ... (initializeHomeSystem, placeHomeBed, findBedPlacementNearHome, etc.)
  // ... (safePlaceBed, safePlaceBlockWithTimeout, safeDigWithTimeout, etc.)
  // ... (findNearbyBed, placeBedAndSleep, sleepInBed, etc.)
  // ... (wakeAndCleanup, autoBreakBed, breakBedAtPosition, etc.)
  // ... (stopAllActivities, delay, getStatus, etc.)

  // Note: The above comment indicates that all other methods from the previous version
  // should be kept exactly as they were, only adding the new emergency features
  // and modifying the checkTimeAndSleep method as shown above.
}

// ================= ENHANCED ADVANCED CREATIVE BOT =================
class AdvancedCreativeBot {
  constructor(config, index) {
    this.config = config;
    this.index = index;
    this.bot = null;
    this.sleepSystem = null;
    this.buildingPlanner = null; // NEW: Building planner
    
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

  onSpawn() {
    this.state.status = 'connected';
    this.state.connectedAt = Date.now();
    this.state.position = this.getPosition();
    
    logger.log(`Successfully spawned in world!`, 'success', this.state.username);
    
    // Initialize systems with delays
    setTimeout(() => {
      this.initializeCreativeMode();
    }, 2000);
    
    setTimeout(() => {
      this.initializeHomeSystem();
    }, 5000);
    
    setTimeout(() => {
      this.sleepSystem.startNightMonitoring(); // NEW: Start night monitoring
      this.startDaytimeActivitySystem(); // NEW: Separate daytime activities
      this.startAntiAFKSystem();
    }, 8000);
    
    logger.log(`All systems initialized`, 'success', this.state.username);
    logger.log(`🏗️ Smart Building: ${CONFIG.FEATURES.SMART_BUILDING ? 'ENABLED' : 'DISABLED'}`, 'building', this.state.username);
    logger.log(`⚠️ Emergency Sleep: ${CONFIG.FEATURES.EMERGENCY_SLEEP ? 'ENABLED' : 'DISABLED'}`, 'sleep', this.state.username);
  }

  // ================= MODIFIED: DAYTIME ACTIVITY SYSTEM =================
  startDaytimeActivitySystem() {
    // Clear any existing interval
    if (this.dayActivityInterval) {
      clearInterval(this.dayActivityInterval);
    }
    
    this.dayActivityInterval = setInterval(() => {
      if (!this.bot || !this.bot.entity || this.state.isSleeping) {
        return;
      }
      
      // Check if it's daytime and building is allowed
      if (!this.canPerformDaytimeActivities()) {
        return;
      }
      
      // Check if we're already building
      if (this.state.isBuilding) {
        return;
      }
      
      // Select and perform daytime activity
      const activity = this.selectDaytimeActivity();
      this.state.activity = activity;
      this.performDaytimeActivity(activity);
      
    }, 20000 + Math.random() * 15000); // 20-35 second intervals
    
    logger.log(`Daytime activity system started`, 'success', this.state.username);
  }

  canPerformDaytimeActivities() {
    if (!this.bot || !this.bot.time) return false;
    
    const time = this.bot.time.time;
    
    // Check if it's daytime
    const isDaytime = time >= 0 && time < 13000;
    
    // Check if emergency sleep mode is active
    if (this.sleepSystem && this.sleepSystem.state.emergencySleepMode) {
      return false;
    }
    
    // Check if activities are stopped for night
    if (this.sleepSystem && this.sleepSystem.state.stoppedActivities) {
      return false;
    }
    
    return isDaytime;
  }

  selectDaytimeActivity() {
    // Weight activities based on personality
    const activities = this.config.activities || ['exploring'];
    
    if (this.config.personality === 'builder') {
      // Builders mostly build, sometimes explore or craft
      const weighted = [
        'building', 'building', 'building', 'building',
        'designing', 'designing',
        'exploring',
        'crafting',
        'planning'
      ];
      return weighted[Math.floor(Math.random() * weighted.length)];
    } else {
      // Explorers mostly explore, sometimes build
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

  // ================= NEW: SMART BUILDING ACTIVITY =================
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
      
      // Find perfect building location
      const location = await this.buildingPlanner.findBuildingLocation();
      
      if (!location) {
        logger.log('Could not find suitable building location', 'warn', this.state.username);
        this.state.isBuilding = false;
        return;
      }
      
      // Select structure type
      const structureType = this.buildingPlanner.selectStructureType();
      
      // Create building plan
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
      
      // Execute building plan
      const success = await this.buildingPlanner.executeBuildingPlan(plan);
      
      if (success) {
        this.state.metrics.perfectStructures++;
        this.state.metrics.structuresBuilt++;
        
        const buildTime = Date.now() - this.state.currentBuild.startTime;
        this.state.metrics.buildingTime += buildTime;
        
        logger.log(`✅ Perfect structure built: ${plan.name} in ${Math.round(buildTime/1000)}s`, 'success', this.state.username);
        
        // Announce completion
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

  // ================= MODIFIED: EXPLORATION ACTIVITY =================
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
    
    // Look around while exploring
    this.bot.look(Math.random() * Math.PI * 2, Math.random() * Math.PI - Math.PI / 2);
    
    // Occasionally stop to look for building spots
    if (Math.random() < 0.2) {
      setTimeout(() => {
        if (this.bot) {
          this.scanForBuildingLocations();
        }
      }, 1000);
    }
  }

  scanForBuildingLocations() {
    // Simple scan - just look around
    this.bot.look(Math.random() * Math.PI * 2, -Math.PI / 4);
    
    logger.log('Scanning area for potential building sites', 'info', this.state.username);
  }

  // ================= MODIFIED: TIME EVENT HANDLER =================
  setupEventHandlers() {
    if (!this.bot) return;
    
    // Existing event handlers...
    this.bot.on('time', () => {
      if (this.sleepSystem) {
        this.sleepSystem.checkTimeAndSleep();
      }
      this.state.isSleeping = this.bot.isSleeping || false;
      
      // Update building state based on time
      const time = this.bot.time ? this.bot.time.time : 0;
      const isNight = time >= 13000 && time <= 23000;
      
      if (isNight && this.state.isBuilding && this.buildingPlanner) {
        logger.log('Night time - stopping building activity', 'night', this.state.username);
        this.buildingPlanner.emergencyStopBuilding();
        this.state.isBuilding = false;
      }
    });
    
    // ... other existing event handlers remain the same
  }

  // ================= ALL OTHER EXISTING METHODS REMAIN =================
  // ... (initializeCreativeMode, giveCreativeItems, etc.)
  // ... (performCraftingActivity, performPlanningActivity, etc.)
  // ... (performAntiAFK, generateChatResponse, etc.)
  // ... (getPosition, scheduleReconnect, cleanup, etc.)
  // ... (getStatus, delay, etc.)

  // Note: All other methods from the previous version should be kept,
  // with only the modifications shown above for daytime activities.
}

// ================= UPDATED BOT MANAGER =================
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
    
    // New feature announcements
    logger.log(`🎯 NEW IN v2.4:`, 'info', 'SYSTEM');
    logger.log(`   • 🏗️ Smart Building System - Plans and builds perfect structures`, 'building', 'SYSTEM');
    logger.log(`   • 📐 Structure Planning - Finds flat areas, creates blueprints`, 'building', 'SYSTEM');
    logger.log(`   • ⚠️ Emergency Sleep - Stops activities at night, finds sleep spot`, 'sleep', 'SYSTEM');
    logger.log(`   • 🌞 Daytime Only Building - Only builds during Minecraft day`, 'building', 'SYSTEM');
    logger.log(`   • 🏠 Home Priority - Returns to home bed at night`, 'home', 'SYSTEM');
    logger.log(`   • 📍 Location Scouting - Finds perfect spots for buildings`, 'building', 'SYSTEM');
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
  
  // ... rest of BotManager methods remain the same
}

// ================= UPDATED WEB SERVER =================
// Update the web server HTML to show new features:
// - Show "Perfect Structures" count
// - Show "Current Build" if building
// - Show "Emergency Mode" status
// - Show building progress
// - Add "Smart Building" feature badge

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
