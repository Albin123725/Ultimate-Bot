const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');
const moment = require('moment');

class BehaviorEngine extends EventEmitter {
  constructor(neuralNetwork = null) {
    super();
    this.neuralNetwork = neuralNetwork;
    this.behaviorProfiles = new Map();
    this.activityPatterns = new Map();
    this.learningData = new Map();
    this.behaviorsPath = path.join(__dirname, 'config', 'behaviors');
  }

  async initialize() {
    console.log('🎭 Initializing Behavior Engine...');
    
    await fs.ensureDir(this.behaviorsPath);
    await this.loadBehaviorProfiles();
    await this.loadActivityPatterns();
    
    console.log('✅ Behavior Engine initialized');
    return this;
  }

  async loadBehaviorProfiles() {
    const profilesPath = path.join(this.behaviorsPath, 'profiles.json');
    
    if (await fs.pathExists(profilesPath)) {
      try {
        const profiles = await fs.readJson(profilesPath);
        profiles.forEach(profile => {
          this.behaviorProfiles.set(profile.id, profile);
        });
        console.log(`📁 Loaded ${profiles.length} behavior profiles`);
      } catch (error) {
        console.log('⚠️ Could not load behavior profiles, creating defaults...');
        await this.createDefaultProfiles();
      }
    } else {
      await this.createDefaultProfiles();
    }
  }

  async createDefaultProfiles() {
    const defaultProfiles = [
      {
        id: 'stealth_agent',
        name: 'Stealth Agent',
        type: 'agent',
        description: 'Stealth operative focused on surveillance and intelligence',
        traits: {
          curiosity: 0.8,
          caution: 0.9,
          sociability: 0.3,
          aggression: 0.2,
          patience: 0.7,
          adaptability: 0.9
        },
        behaviors: {
          movement: {
            style: 'stealthy',
            speed: 0.6,
            randomness: 0.4,
            backtracking: 0.1
          },
          interaction: {
            chatFrequency: 0.2,
            responseDelay: 1.5,
            emotes: 0.1,
            helpOthers: 0.3
          },
          combat: {
            engagement: 0.2,
            retreat: 0.8,
            accuracy: 0.9,
            strategy: 0.7
          },
          exploration: {
            range: 0.8,
            mapping: 0.9,
            riskTaking: 0.3,
            returnFrequency: 0.7
          }
        },
        learningRates: {
          success: 0.8,
          failure: 0.9,
          adaptation: 0.7
        }
      },
      {
        id: 'master_miner',
        name: 'Master Miner',
        type: 'cropton',
        description: 'Expert miner focused on resource collection and tunneling',
        traits: {
          curiosity: 0.5,
          caution: 0.6,
          sociability: 0.4,
          aggression: 0.3,
          patience: 0.9,
          adaptability: 0.6
        },
        behaviors: {
          movement: {
            style: 'methodical',
            speed: 0.5,
            randomness: 0.2,
            backtracking: 0.3
          },
          interaction: {
            chatFrequency: 0.3,
            responseDelay: 2.0,
            emotes: 0.2,
            helpOthers: 0.4
          },
          combat: {
            engagement: 0.4,
            retreat: 0.7,
            accuracy: 0.6,
            strategy: 0.5
          },
          exploration: {
            range: 0.6,
            mapping: 0.8,
            riskTaking: 0.5,
            returnFrequency: 0.6
          }
        },
        learningRates: {
          success: 0.7,
          failure: 0.8,
          adaptation: 0.6
        }
      },
      {
        id: 'expert_builder',
        name: 'Expert Builder',
        type: 'craftman',
        description: 'Skilled builder focused on construction and design',
        traits: {
          curiosity: 0.6,
          caution: 0.7,
          sociability: 0.5,
          aggression: 0.2,
          patience: 0.8,
          adaptability: 0.7
        },
        behaviors: {
          movement: {
            style: 'deliberate',
            speed: 0.4,
            randomness: 0.3,
            backtracking: 0.4
          },
          interaction: {
            chatFrequency: 0.4,
            responseDelay: 1.0,
            emotes: 0.3,
            helpOthers: 0.6
          },
          combat: {
            engagement: 0.3,
            retreat: 0.8,
            accuracy: 0.7,
            strategy: 0.6
          },
          exploration: {
            range: 0.5,
            mapping: 0.7,
            riskTaking: 0.4,
            returnFrequency: 0.8
          }
        },
        learningRates: {
          success: 0.6,
          failure: 0.7,
          adaptation: 0.5
        }
      },
      {
        id: 'mysterious_entity',
        name: 'Mysterious Entity',
        type: 'herobrine',
        description: 'Enigmatic entity with unpredictable behavior',
        traits: {
          curiosity: 0.9,
          caution: 0.4,
          sociability: 0.2,
          aggression: 0.5,
          patience: 0.3,
          adaptability: 0.8
        },
        behaviors: {
          movement: {
            style: 'erratic',
            speed: 0.8,
            randomness: 0.9,
            backtracking: 0.5
          },
          interaction: {
            chatFrequency: 0.1,
            responseDelay: 3.0,
            emotes: 0.4,
            helpOthers: 0.2
          },
          combat: {
            engagement: 0.6,
            retreat: 0.5,
            accuracy: 0.8,
            strategy: 0.4
          },
          exploration: {
            range: 0.9,
            mapping: 0.6,
            riskTaking: 0.8,
            returnFrequency: 0.3
          }
        },
        learningRates: {
          success: 0.5,
          failure: 0.6,
          adaptation: 0.8
        }
      }
    ];

    defaultProfiles.forEach(profile => {
      this.behaviorProfiles.set(profile.id, profile);
    });

    await this.saveBehaviorProfiles();
    console.log(`📝 Created ${defaultProfiles.length} default behavior profiles`);
  }

  async saveBehaviorProfiles() {
    const profilesPath = path.join(this.behaviorsPath, 'profiles.json');
    const profiles = Array.from(this.behaviorProfiles.values());
    await fs.writeJson(profilesPath, profiles, { spaces: 2 });
  }

  async loadActivityPatterns() {
    const patternsPath = path.join(this.behaviorsPath, 'patterns.json');
    
    if (await fs.pathExists(patternsPath)) {
      try {
        const patterns = await fs.readJson(patternsPath);
        patterns.forEach(pattern => {
          this.activityPatterns.set(pattern.id, pattern);
        });
        console.log(`📁 Loaded ${patterns.length} activity patterns`);
      } catch (error) {
        console.log('⚠️ Could not load activity patterns, creating defaults...');
        await this.createDefaultPatterns();
      }
    } else {
      await this.createDefaultPatterns();
    }
  }

  async createDefaultPatterns() {
    const defaultPatterns = [
      {
        id: 'morning_routine',
        name: 'Morning Routine',
        timeRange: { start: 5, end: 11 }, // 5 AM - 11 AM
        activities: [
          { activity: 'explore', weight: 0.4 },
          { activity: 'mine', weight: 0.3 },
          { activity: 'build', weight: 0.2 },
          { activity: 'socialize', weight: 0.1 }
        ],
        intensity: 0.7,
        duration: 4 // hours
      },
      {
        id: 'afternoon_work',
        name: 'Afternoon Work',
        timeRange: { start: 12, end: 17 }, // 12 PM - 5 PM
        activities: [
          { activity: 'mine', weight: 0.5 },
          { activity: 'build', weight: 0.3 },
          { activity: 'craft', weight: 0.1 },
          { activity: 'explore', weight: 0.1 }
        ],
        intensity: 0.9,
        duration: 5
      },
      {
        id: 'evening_social',
        name: 'Evening Social',
        timeRange: { start: 18, end: 22 }, // 6 PM - 10 PM
        activities: [
          { activity: 'socialize', weight: 0.4 },
          { activity: 'explore', weight: 0.3 },
          { activity: 'build', weight: 0.2 },
          { activity: 'mine', weight: 0.1 }
        ],
        intensity: 0.6,
        duration: 4
      },
      {
        id: 'night_quiet',
        name: 'Night Quiet',
        timeRange: { start: 23, end: 4 }, // 11 PM - 4 AM
        activities: [
          { activity: 'idle', weight: 0.5 },
          { activity: 'explore', weight: 0.3 },
          { activity: 'mine', weight: 0.1 },
          { activity: 'socialize', weight: 0.1 }
        ],
        intensity: 0.3,
        duration: 5
      },
      {
        id: 'weekend_exploration',
        name: 'Weekend Exploration',
        dayOfWeek: [0, 6], // Saturday and Sunday
        activities: [
          { activity: 'explore', weight: 0.6 },
          { activity: 'socialize', weight: 0.2 },
          { activity: 'build', weight: 0.1 },
          { activity: 'mine', weight: 0.1 }
        ],
        intensity: 0.8,
        duration: 8
      }
    ];

    defaultPatterns.forEach(pattern => {
      this.activityPatterns.set(pattern.id, pattern);
    });

    await this.saveActivityPatterns();
    console.log(`📝 Created ${defaultPatterns.length} default activity patterns`);
  }

  async saveActivityPatterns() {
    const patternsPath = path.join(this.behaviorsPath, 'patterns.json');
    const patterns = Array.from(this.activityPatterns.values());
    await fs.writeJson(patternsPath, patterns, { spaces: 2 });
  }

  getBehaviorProfile(botType) {
    // Find profile for bot type
    for (const [id, profile] of this.behaviorProfiles) {
      if (profile.type === botType) {
        return profile;
      }
    }
    
    // Return default profile
    return this.behaviorProfiles.get('stealth_agent');
  }

  getCurrentPattern() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Find matching patterns
    const matchingPatterns = Array.from(this.activityPatterns.values()).filter(pattern => {
      // Check time range
      if (pattern.timeRange) {
        if (pattern.timeRange.start <= pattern.timeRange.end) {
          // Normal range (e.g., 9 AM - 5 PM)
          if (hour < pattern.timeRange.start || hour >= pattern.timeRange.end) {
            return false;
          }
        } else {
          // Wrapping range (e.g., 10 PM - 6 AM)
          if (hour < pattern.timeRange.start && hour >= pattern.timeRange.end) {
            return false;
          }
        }
      }
      
      // Check day of week
      if (pattern.dayOfWeek && !pattern.dayOfWeek.includes(dayOfWeek)) {
        return false;
      }
      
      return true;
    });
    
    if (matchingPatterns.length === 0) {
      // Return default pattern
      return {
        activities: [
          { activity: 'explore', weight: 0.3 },
          { activity: 'mine', weight: 0.3 },
          { activity: 'build', weight: 0.2 },
          { activity: 'socialize', weight: 0.1 },
          { activity: 'idle', weight: 0.1 }
        ],
        intensity: 0.5
      };
    }
    
    // If multiple patterns match, use the most specific one
    // (patterns with both time and day constraints are more specific)
    const scoredPatterns = matchingPatterns.map(pattern => ({
      pattern,
      score: (pattern.timeRange ? 1 : 0) + (pattern.dayOfWeek ? 1 : 0)
    }));
    
    scoredPatterns.sort((a, b) => b.score - a.score);
    return scoredPatterns[0].pattern;
  }

  generateBehavior(bot, context) {
    const profile = this.getBehaviorProfile(bot.type);
    const pattern = this.getCurrentPattern();
    
    // Combine profile traits, pattern, and context
    const behavior = {
      profile: profile,
      pattern: pattern,
      context: context,
      
      // Calculate activity probabilities
      activityProbabilities: this.calculateActivityProbabilities(profile, pattern, context),
      
      // Generate movement parameters
      movement: this.generateMovementParameters(profile, context),
      
      // Generate interaction parameters
      interaction: this.generateInteractionParameters(profile, context),
      
      // Generate combat parameters
      combat: this.generateCombatParameters(profile, context),
      
      // Generate exploration parameters
      exploration: this.generateExplorationParameters(profile, context),
      
      // Learning state
      learning: {
        lastLearning: Date.now(),
        adaptationRate: profile.learningRates.adaptation,
        recentBehaviors: []
      }
    };
    
    return behavior;
  }

  calculateActivityProbabilities(profile, pattern, context) {
    const baseProbabilities = {};
    
    // Start with pattern weights
    pattern.activities.forEach(activity => {
      baseProbabilities[activity.activity] = activity.weight;
    });
    
    // Adjust based on profile traits
    const traitAdjustments = {
      explore: profile.traits.curiosity * 0.3 + profile.traits.adaptability * 0.2,
      mine: profile.traits.patience * 0.4,
      build: profile.traits.patience * 0.3 + profile.traits.curiosity * 0.2,
      socialize: profile.traits.sociability * 0.5,
      combat: profile.traits.aggression * 0.4,
      idle: (1 - profile.traits.curiosity) * 0.3
    };
    
    // Adjust based on context
    const contextAdjustments = {
      explore: context.timeOfDay === 'night' ? -0.3 : 0.1,
      mine: context.healthStatus === 'critical' ? -0.4 : 0,
      build: context.inventoryStatus === 'well_equipped' ? 0.2 : -0.1,
      combat: context.nearbyDangers === 'dangerous' ? 0.5 : -0.2,
      flee: context.nearbyDangers === 'dangerous' && context.healthStatus === 'critical' ? 0.8 : 0
    };
    
    // Apply adjustments
    const finalProbabilities = {};
    let total = 0;
    
    for (const [activity, base] of Object.entries(baseProbabilities)) {
      let adjusted = base;
      
      if (traitAdjustments[activity]) {
        adjusted += traitAdjustments[activity] * 0.3;
      }
      
      if (contextAdjustments[activity]) {
        adjusted += contextAdjustments[activity];
      }
      
      // Ensure non-negative
      adjusted = Math.max(adjusted, 0.01);
      
      finalProbabilities[activity] = adjusted;
      total += adjusted;
    }
    
    // Normalize
    for (const activity in finalProbabilities) {
      finalProbabilities[activity] /= total;
    }
    
    return finalProbabilities;
  }

  generateMovementParameters(profile, context) {
    const movement = profile.behaviors.movement;
    
    return {
      speed: movement.speed * (context.healthStatus === 'critical' ? 0.7 : 1.0),
      style: movement.style,
      randomness: movement.randomness * (1 + Math.random() * 0.2 - 0.1), // ±10% variation
      backtracking: movement.backtracking,
      jumpFrequency: 0.1 + movement.randomness * 0.2,
      lookFrequency: 0.3 + movement.randomness * 0.4
    };
  }

  generateInteractionParameters(profile, context) {
    const interaction = profile.behaviors.interaction;
    
    return {
      chatFrequency: interaction.chatFrequency * (context.timeOfDay === 'evening' ? 1.5 : 1.0),
      responseDelay: interaction.responseDelay * (0.8 + Math.random() * 0.4), // ±20% variation
      emotes: interaction.emotes,
      helpOthers: interaction.helpOthers * (context.sociability || 0.5),
      tradeFrequency: 0.1 * interaction.helpOthers,
      giftFrequency: 0.05 * interaction.helpOthers
    };
  }

  generateCombatParameters(profile, context) {
    const combat = profile.behaviors.combat;
    
    return {
      engagement: combat.engagement * (context.healthStatus === 'good' ? 1.2 : 0.6),
      retreat: combat.retreat * (context.healthStatus === 'critical' ? 1.5 : 1.0),
      accuracy: combat.accuracy * (0.9 + Math.random() * 0.2), // 90-110%
      strategy: combat.strategy,
      dodgeFrequency: 0.3 + combat.strategy * 0.4,
      potionUsage: 0.2 + combat.strategy * 0.3
    };
  }

  generateExplorationParameters(profile, context) {
    const exploration = profile.behaviors.exploration;
    
    return {
      range: exploration.range * (context.timeOfDay === 'night' ? 0.7 : 1.0),
      mapping: exploration.mapping,
      riskTaking: exploration.riskTaking * (context.healthStatus === 'good' ? 1.1 : 0.8),
      returnFrequency: exploration.returnFrequency,
      caveExploration: 0.3 + exploration.riskTaking * 0.4,
      heightExploration: 0.2 + exploration.riskTaking * 0.3
    };
  }

  selectActivity(behavior) {
    const probabilities = behavior.activityProbabilities;
    
    // Convert to array for weighted selection
    const activities = Object.entries(probabilities);
    const total = activities.reduce((sum, [_, prob]) => sum + prob, 0);
    let random = Math.random() * total;
    
    for (const [activity, prob] of activities) {
      if (random < prob) {
        return activity;
      }
      random -= prob;
    }
    
    // Fallback
    return 'idle';
  }

  adaptBehavior(bot, outcome) {
    const profile = this.getBehaviorProfile(bot.type);
    
    if (!this.learningData.has(bot.id)) {
      this.learningData.set(bot.id, {
        successes: 0,
        failures: 0,
        adaptations: 0,
        behaviorHistory: []
      });
    }
    
    const learning = this.learningData.get(bot.id);
    
    if (outcome.success) {
      learning.successes++;
      
      // Reinforce successful behaviors
      if (outcome.behavior) {
        learning.behaviorHistory.push({
          behavior: outcome.behavior,
          outcome: 'success',
          timestamp: Date.now()
        });
      }
      
      // Limit history size
      if (learning.behaviorHistory.length > 100) {
        learning.behaviorHistory = learning.behaviorHistory.slice(-50);
      }
      
    } else {
      learning.failures++;
      
      // Learn from failures
      if (outcome.behavior) {
        learning.behaviorHistory.push({
          behavior: outcome.behavior,
          outcome: 'failure',
          timestamp: Date.now()
        });
        
        // Adapt behavior based on failure
        this.adaptFromFailure(bot, outcome, profile);
        learning.adaptations++;
      }
    }
    
    // Update profile based on learning
    if (learning.successes + learning.failures > 10) {
      const successRate = learning.successes / (learning.successes + learning.failures);
      
      if (successRate < 0.3) {
        // Poor performance, increase adaptability
        profile.learningRates.adaptation = Math.min(profile.learningRates.adaptation * 1.2, 0.95);
        profile.learningRates.failure = Math.min(profile.learningRates.failure * 1.1, 0.95);
      } else if (successRate > 0.7) {
        // Good performance, stabilize
        profile.learningRates.adaptation = Math.max(profile.learningRates.adaptation * 0.9, 0.3);
      }
    }
    
    this.emit('behavior_adapted', { botId: bot.id, outcome, learning });
  }

  adaptFromFailure(bot, outcome, profile) {
    // Adjust traits based on failure type
    switch (outcome.type) {
      case 'combat_death':
        profile.traits.aggression = Math.max(profile.traits.aggression * 0.8, 0.1);
        profile.traits.caution = Math.min(profile.traits.caution * 1.2, 0.95);
        profile.behaviors.combat.retreat = Math.min(profile.behaviors.combat.retreat * 1.3, 0.95);
        break;
        
      case 'mining_accident':
        profile.traits.riskTaking = Math.max(profile.traits.riskTaking * 0.7, 0.1);
        profile.behaviors.exploration.riskTaking = Math.max(profile.behaviors.exploration.riskTaking * 0.8, 0.1);
        break;
        
      case 'social_rejection':
        profile.traits.sociability = Math.max(profile.traits.sociability * 0.9, 0.1);
        profile.behaviors.interaction.chatFrequency = Math.max(profile.behaviors.interaction.chatFrequency * 0.8, 0.05);
        break;
        
      case 'exploration_failure':
        profile.traits.curiosity = Math.max(profile.traits.curiosity * 0.85, 0.1);
        profile.behaviors.exploration.range = Math.max(profile.behaviors.exploration.range * 0.9, 0.2);
        break;
    }
    
    // Save updated profile
    this.behaviorProfiles.set(profile.id, profile);
    this.saveBehaviorProfiles().catch(console.error);
  }

  generateNaturalMistakes(behavior, bot) {
    const mistakes = [];
    const profile = this.getBehaviorProfile(bot.type);
    
    // Base mistake rate based on traits
    const baseMistakeRate = 0.05 * (1 - profile.traits.patience) + 0.02 * (1 - profile.traits.caution);
    
    // Increase mistake rate if tired (based on uptime)
    const uptime = bot.connection.sessionStart ? 
      (Date.now() - bot.connection.sessionStart) / 3600000 : 0; // hours
    const fatigueMultiplier = Math.min(1 + uptime * 0.2, 3); // Up to 3x mistake rate after 10 hours
    
    const mistakeRate = baseMistakeRate * fatigueMultiplier;
    
    // Generate mistakes
    if (Math.random() < mistakeRate) {
      const mistakeTypes = [
        'wrong_direction',
        'missed_block',
        'chat_typo',
        'dropped_item',
        'wrong_craft',
        'fall_damage',
        'tool_break'
      ];
      
      const mistakeType = mistakeTypes[Math.floor(Math.random() * mistakeTypes.length)];
      const severity = Math.random() * 0.5 + 0.3; // 0.3-0.8 severity
      
      mistakes.push({
        type: mistakeType,
        severity: severity,
        timestamp: Date.now(),
        context: {
          activity: bot.activity,
          health: bot.health,
          fatigue: uptime
        }
      });
      
      this.emit('mistake_generated', { botId: bot.id, mistake: mistakes[0] });
    }
    
    return mistakes;
  }

  simulateFatigue(bot, behavior) {
    const uptime = bot.connection.sessionStart ? 
      (Date.now() - bot.connection.sessionStart) / 3600000 : 0;
    
    if (uptime < 1) return behavior; // No fatigue in first hour
    
    const fatigueLevel = Math.min(uptime / 8, 1); // Max fatigue after 8 hours
    
    // Apply fatigue effects
    const fatiguedBehavior = { ...behavior };
    
    // Movement slows down
    fatiguedBehavior.movement.speed *= (1 - fatigueLevel * 0.3);
    
    // Reaction time increases
    fatiguedBehavior.interaction.responseDelay *= (1 + fatigueLevel * 0.5);
    
    // Accuracy decreases
    fatiguedBehavior.combat.accuracy *= (1 - fatigueLevel * 0.2);
    
    // More mistakes
    fatiguedBehavior.movement.randomness *= (1 + fatigueLevel * 0.4);
    
    return fatiguedBehavior;
  }

  createPersonality(botType, traits = {}) {
    const baseProfile = this.getBehaviorProfile(botType);
    const personalityId = `personality_${crypto.randomBytes(8).toString('hex')}`;
    
    const personality = {
      id: personalityId,
      baseType: botType,
      traits: { ...baseProfile.traits, ...traits },
      behaviors: JSON.parse(JSON.stringify(baseProfile.behaviors)), // Deep copy
      learningRates: { ...baseProfile.learningRates },
      created: Date.now(),
      custom: true
    };
    
    // Adjust behaviors based on custom traits
    if (traits.aggression !== undefined) {
      personality.behaviors.combat.engagement = traits.aggression * 0.8;
      personality.behaviors.combat.retreat = 1 - (traits.aggression * 0.3);
    }
    
    if (traits.sociability !== undefined) {
      personality.behaviors.interaction.chatFrequency = traits.sociability * 0.6;
      personality.behaviors.interaction.helpOthers = traits.sociability * 0.4;
    }
    
    if (traits.curiosity !== undefined) {
      personality.behaviors.exploration.range = traits.curiosity * 0.7;
      personality.behaviors.exploration.riskTaking = traits.curiosity * 0.5;
    }
    
    this.behaviorProfiles.set(personalityId, personality);
    this.saveBehaviorProfiles().catch(console.error);
    
    console.log(`🎭 Created custom personality: ${personalityId}`);
    
    return personality;
  }

  async getStatus() {
    const status = {
      profiles: {
        total: this.behaviorProfiles.size,
        default: Array.from(this.behaviorProfiles.values()).filter(p => !p.custom).length,
        custom: Array.from(this.behaviorProfiles.values()).filter(p => p.custom).length
      },
      patterns: {
        total: this.activityPatterns.size,
        active: this.getCurrentPattern() ? 1 : 0
      },
      learning: {
        botsWithData: this.learningData.size,
        totalAdaptations: Array.from(this.learningData.values())
          .reduce((sum, data) => sum + data.adaptations, 0)
      }
    };
    
    return status;
  }

  getBehaviorHistory(botId, limit = 10) {
    const learning = this.learningData.get(botId);
    if (!learning || !learning.behaviorHistory) {
      return [];
    }
    
    return learning.behaviorHistory
      .slice(-limit)
      .reverse()
      .map(entry => ({
        behavior: entry.behavior,
        outcome: entry.outcome,
        time: new Date(entry.timestamp).toLocaleTimeString(),
        ago: this.formatTimeAgo(entry.timestamp)
      }));
  }

  formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  resetLearning(botId) {
    if (this.learningData.has(botId)) {
      this.learningData.delete(botId);
      return { success: true, message: 'Learning data reset' };
    }
    
    return { success: false, message: 'No learning data found' };
  }

  async exportProfiles() {
    const exportData = {
      timestamp: Date.now(),
      profiles: Array.from(this.behaviorProfiles.values()),
      patterns: Array.from(this.activityPatterns.values())
    };
    
    const exportPath = path.join(__dirname, 'exports', `behaviors-${Date.now()}.json`);
    await fs.ensureDir(path.dirname(exportPath));
    await fs.writeJson(exportPath, exportData, { spaces: 2 });
    
    return exportPath;
  }

  async importProfiles(filePath) {
    try {
      const importData = await fs.readJson(filePath);
      
      if (importData.profiles) {
        importData.profiles.forEach(profile => {
          this.behaviorProfiles.set(profile.id, profile);
        });
      }
      
      if (importData.patterns) {
        importData.patterns.forEach(pattern => {
          this.activityPatterns.set(pattern.id, pattern);
        });
      }
      
      await this.saveBehaviorProfiles();
      await this.saveActivityPatterns();
      
      console.log(`✅ Imported ${importData.profiles?.length || 0} profiles and ${importData.patterns?.length || 0} patterns`);
      return { success: true, imported: importData.profiles.length + importData.patterns.length };
    } catch (error) {
      console.error(`❌ Error importing profiles: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  generateDailySchedule(botType, date = new Date()) {
    const profile = this.getBehaviorProfile(botType);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const schedule = {
      date: date.toISOString().split('T')[0],
      isWeekend: isWeekend,
      periods: []
    };
    
    // Define day periods
    const periods = [
      { name: 'Morning', start: 6, end: 12, intensity: 0.7 },
      { name: 'Afternoon', start: 12, end: 18, intensity: 0.9 },
      { name: 'Evening', start: 18, end: 22, intensity: 0.6 },
      { name: 'Night', start: 22, end: 6, intensity: 0.3 }
    ];
    
    // Adjust for weekends
    if (isWeekend) {
      periods[0].start = 9; // Sleep in
      periods[0].intensity = 0.5;
      periods[1].intensity = 0.8;
      periods[2].intensity = 0.7;
      periods[3].intensity = 0.4;
    }
    
    // Generate schedule for each period
    periods.forEach(period => {
      const activities = this.getActivitiesForPeriod(profile, period, isWeekend);
      
      schedule.periods.push({
        name: period.name,
        time: `${period.start}:00 - ${period.end}:00`,
        activities: activities,
        intensity: period.intensity
      });
    });
    
    return schedule;
  }

  getActivitiesForPeriod(profile, period, isWeekend) {
    let baseActivities;
    
    if (period.name === 'Morning') {
      baseActivities = [
        { activity: 'explore', weight: 0.4 },
        { activity: 'mine', weight: 0.3 },
        { activity: 'build', weight: 0.2 },
        { activity: 'socialize', weight: 0.1 }
      ];
    } else if (period.name === 'Afternoon') {
      baseActivities = [
        { activity: 'mine', weight: 0.5 },
        { activity: 'build', weight: 0.3 },
        { activity: 'craft', weight: 0.1 },
        { activity: 'explore', weight: 0.1 }
      ];
    } else if (period.name === 'Evening') {
      baseActivities = [
        { activity: 'socialize', weight: 0.4 },
        { activity: 'explore', weight: 0.3 },
        { activity: 'build', weight: 0.2 },
        { activity: 'mine', weight: 0.1 }
      ];
    } else {
      baseActivities = [
        { activity: 'idle', weight: 0.5 },
        { activity: 'explore', weight: 0.3 },
        { activity: 'mine', weight: 0.1 },
        { activity: 'socialize', weight: 0.1 }
      ];
    }
    
    // Adjust based on profile
    if (profile.type === 'agent') {
      baseActivities.find(a => a.activity === 'explore').weight += 0.2;
      baseActivities.find(a => a.activity === 'socialize').weight -= 0.1;
    } else if (profile.type === 'cropton') {
      baseActivities.find(a => a.activity === 'mine').weight += 0.3;
    } else if (profile.type === 'craftman') {
      baseActivities.find(a => a.activity === 'build').weight += 0.3;
    } else if (profile.type === 'herobrine') {
      baseActivities.find(a => a.activity === 'explore').weight += 0.3;
      baseActivities.find(a => a.activity === 'idle').weight += 0.2;
    }
    
    // Adjust for weekends
    if (isWeekend) {
      baseActivities.find(a => a.activity === 'socialize').weight += 0.2;
      baseActivities.find(a => a.activity === 'mine').weight -= 0.1;
    }
    
    // Normalize weights
    const total = baseActivities.reduce((sum, a) => sum + a.weight, 0);
    baseActivities.forEach(a => a.weight = a.weight / total);
    
    return baseActivities;
  }
}

module.exports = BehaviorEngine;
