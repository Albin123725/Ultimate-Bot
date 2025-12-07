const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');
const moment = require('moment');
const Chance = require('chance');

class IdentityManager extends EventEmitter {
  constructor() {
    super();
    this.identities = new Map();
    this.accountHistory = new Map();
    this.fingerprints = new Map();
    this.behaviorProfiles = new Map();
    this.chance = new Chance();
    this.configPath = path.join(__dirname, 'config', 'identities');
  }

  async initialize() {
    console.log('👤 Initializing Identity Manager...');
    
    await fs.ensureDir(this.configPath);
    await this.loadIdentities();
    await this.loadFingerprints();
    
    console.log(`✅ Identity Manager initialized with ${this.identities.size} identities`);
    return this;
  }

  async loadIdentities() {
    const identitiesPath = path.join(this.configPath, 'identities.json');
    
    if (await fs.pathExists(identitiesPath)) {
      try {
        const identities = await fs.readJson(identitiesPath);
        identities.forEach(identity => {
          this.identities.set(identity.id, identity);
        });
        console.log(`📁 Loaded ${identities.length} identities`);
      } catch (error) {
        console.log('⚠️ Could not load identities, creating defaults...');
        await this.createDefaultIdentities();
      }
    } else {
      await this.createDefaultIdentities();
    }
  }

  async createDefaultIdentities() {
    console.log('🔄 Creating default identities...');
    
    // Create identities for each bot personality
    const identities = [
      this.createIdentity('agent', 'Stealth Agent'),
      this.createIdentity('cropton', 'Master Miner'),
      this.createIdentity('craftman', 'Expert Builder'),
      this.createIdentity('herobrine', 'Mysterious Entity')
    ];
    
    identities.forEach(identity => {
      this.identities.set(identity.id, identity);
    });
    
    await this.saveIdentities();
    console.log(`📝 Created ${identities.length} default identities`);
  }

  createIdentity(type, name) {
    const now = new Date();
    const registrationDate = moment()
      .subtract(this.chance.integer({ min: 30, max: 365 }), 'days')
      .toISOString();
    
    const identity = {
      id: `identity_${crypto.randomBytes(12).toString('hex')}`,
      type: type,
      name: name,
      
      // Account Information
      account: {
        username: name.replace(/\s+/g, ''),
        email: this.generateEmail(name),
        registrationDate: registrationDate,
        lastLogin: moment().subtract(this.chance.integer({ min: 1, max: 7 }), 'days').toISOString(),
        accountAge: Math.floor((Date.now() - new Date(registrationDate).getTime()) / (1000 * 60 * 60 * 24)),
        
        // Security Settings
        security: {
          twoFactor: this.chance.bool({ likelihood: 30 }),
          backupCodes: this.chance.bool({ likelihood: 50 }),
          recoveryEmail: this.chance.bool({ likelihood: 70 }),
          securityQuestions: this.chance.integer({ min: 0, max: 3 })
        },
        
        // Payment History (if any)
        paymentHistory: this.generatePaymentHistory(),
        
        // Support History
        supportTickets: this.generateSupportTickets()
      },
      
      // Personal Information (simulated)
      personal: {
        ageGroup: this.chance.age({ type: 'adult' }),
        location: this.generateLocation(),
        timezone: this.generateTimezone(),
        language: this.generateLanguage(),
        interests: this.generateInterests(type)
      },
      
      // Technical Information
      technical: {
        device: this.generateDevice(),
        os: this.generateOS(),
        browser: this.generateBrowser(),
        connectionType: this.generateConnectionType(),
        clientVersion: this.generateClientVersion()
      },
      
      // Behavioral Patterns
      behavior: {
        playStyle: this.generatePlayStyle(type),
        playTimes: this.generatePlayTimes(),
        chatFrequency: this.generateChatFrequency(type),
        socialLevel: this.generateSocialLevel(type),
        riskTolerance: this.generateRiskTolerance(type)
      },
      
      // Server History
      serverHistory: this.generateServerHistory(),
      
      // Metadata
      metadata: {
        created: now.toISOString(),
        lastUpdated: now.toISOString(),
        useCount: 0,
        successRate: 0,
        flags: []
      }
    };
    
    return identity;
  }

  generateEmail(name) {
    const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'protonmail.com', 'icloud.com'];
    const username = name.toLowerCase().replace(/\s+/g, '.');
    const domain = this.chance.pickone(domains);
    const number = this.chance.bool({ likelihood: 30 }) ? this.chance.integer({ min: 1, max: 99 }) : '';
    
    return `${username}${number}@${domain}`;
  }

  generateLocation() {
    const locations = [
      { country: 'US', city: 'New York', timezone: 'America/New_York' },
      { country: 'US', city: 'Los Angeles', timezone: 'America/Los_Angeles' },
      { country: 'US', city: 'Chicago', timezone: 'America/Chicago' },
      { country: 'GB', city: 'London', timezone: 'Europe/London' },
      { country: 'DE', city: 'Berlin', timezone: 'Europe/Berlin' },
      { country: 'JP', city: 'Tokyo', timezone: 'Asia/Tokyo' },
      { country: 'AU', city: 'Sydney', timezone: 'Australia/Sydney' },
      { country: 'CA', city: 'Toronto', timezone: 'America/Toronto' }
    ];
    
    return this.chance.pickone(locations);
  }

  generateTimezone() {
    const timezones = [
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
      'Australia/Sydney', 'Asia/Singapore'
    ];
    
    return this.chance.pickone(timezones);
  }

  generateLanguage() {
    const languages = [
      { code: 'en', name: 'English', region: 'US' },
      { code: 'en', name: 'English', region: 'GB' },
      { code: 'es', name: 'Spanish', region: 'ES' },
      { code: 'de', name: 'German', region: 'DE' },
      { code: 'fr', name: 'French', region: 'FR' },
      { code: 'ja', name: 'Japanese', region: 'JP' }
    ];
    
    return this.chance.pickone(languages);
  }

  generateInterests(type) {
    const interestSets = {
      agent: ['stealth_games', 'strategy_games', 'puzzle_solving', 'exploration'],
      cropton: ['mining_games', 'resource_management', 'automation', 'engineering'],
      craftman: ['building_games', 'architecture', 'design', 'creativity'],
      herobrine: ['horror_games', 'mystery', 'exploration', 'survival']
    };
    
    const baseInterests = interestSets[type] || ['gaming', 'technology', 'creativity'];
    const numInterests = this.chance.integer({ min: 2, max: 5 });
    
    return this.chance.pickset(baseInterests, numInterests);
  }

  generateDevice() {
    const devices = [
      'Windows PC', 'MacBook Pro', 'Gaming Desktop', 'Linux PC',
      'Custom Built PC', 'Laptop', 'Gaming Laptop'
    ];
    
    return this.chance.pickone(devices);
  }

  generateOS() {
    const osVersions = {
      'Windows': ['10', '11'],
      'macOS': ['Ventura', 'Monterey', 'Sonoma'],
      'Linux': ['Ubuntu 22.04', 'Fedora 38', 'Arch Linux']
    };
    
    const os = this.chance.pickone(Object.keys(osVersions));
    const version = this.chance.pickone(osVersions[os]);
    
    return `${os} ${version}`;
  }

  generateBrowser() {
    const browsers = [
      { name: 'Chrome', version: '119' },
      { name: 'Firefox', version: '119' },
      { name: 'Edge', version: '119' },
      { name: 'Safari', version: '17' }
    ];
    
    return this.chance.pickone(browsers);
  }

  generateConnectionType() {
    const types = [
      { type: 'Fiber', speed: '1 Gbps', latency: '10ms' },
      { type: 'Cable', speed: '300 Mbps', latency: '25ms' },
      { type: 'DSL', speed: '100 Mbps', latency: '40ms' },
      { type: '5G', speed: '500 Mbps', latency: '30ms' },
      { type: '4G', speed: '100 Mbps', latency: '50ms' }
    ];
    
    return this.chance.pickone(types);
  }

  generateClientVersion() {
    const versions = ['1.21.10', '1.20.4', '1.19.4', '1.18.2'];
    return this.chance.pickone(versions);
  }

  generatePaymentHistory() {
    const hasPaid = this.chance.bool({ likelihood: 40 });
    
    if (!hasPaid) return [];
    
    const numPayments = this.chance.integer({ min: 1, max: 3 });
    const payments = [];
    
    for (let i = 0; i < numPayments; i++) {
      payments.push({
        date: moment().subtract(this.chance.integer({ min: 1, max: 90 }), 'days').toISOString(),
        amount: this.chance.floating({ min: 5, max: 50, fixed: 2 }),
        type: this.chance.pickone(['Server Rank', 'Cosmetics', 'Currency Pack']),
        method: this.chance.pickone(['PayPal', 'Credit Card', 'Google Pay'])
      });
    }
    
    return payments;
  }

  generateSupportTickets() {
    const hasTickets = this.chance.bool({ likelihood: 60 });
    
    if (!hasTickets) return [];
    
    const numTickets = this.chance.integer({ min: 1, max: 2 });
    const tickets = [];
    
    for (let i = 0; i < numTickets; i++) {
      tickets.push({
        id: `TICKET-${this.chance.string({ length: 8, pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' })}`,
        date: moment().subtract(this.chance.integer({ min: 7, max: 180 }), 'days').toISOString(),
        subject: this.chance.pickone([
          'Login issues',
          'Payment problem',
          'Server connection',
          'Account security',
          'General question'
        ]),
        status: this.chance.pickone(['Resolved', 'Closed', 'Pending']),
        responseTime: this.chance.integer({ min: 2, max: 48 }) // hours
      });
    }
    
    return tickets;
  }

  generatePlayStyle(type) {
    const styles = {
      agent: 'Stealth and Strategy',
      cropton: 'Resource Focused',
      craftman: 'Creative Building',
      herobrine: 'Exploration and Mystery'
    };
    
    return styles[type] || 'Balanced';
  }

  generatePlayTimes() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const playTimes = {};
    
    days.forEach(day => {
      if (this.chance.bool({ likelihood: 80 })) {
        const startHour = this.chance.integer({ min: 16, max: 22 });
        const duration = this.chance.integer({ min: 1, max: 4 });
        
        playTimes[day] = {
          active: true,
          start: `${startHour}:00`,
          duration: duration,
          peak: this.chance.bool({ likelihood: 60 })
        };
      } else {
        playTimes[day] = { active: false };
      }
    });
    
    return playTimes;
  }

  generateChatFrequency(type) {
    const frequencies = {
      agent: 'Low',
      cropton: 'Medium',
      craftman: 'High',
      herobrine: 'Very Low'
    };
    
    return frequencies[type] || 'Medium';
  }

  generateSocialLevel(type) {
    const levels = {
      agent: 'Solo Player',
      cropton: 'Small Groups',
      craftman: 'Community Builder',
      herobrine: 'Lone Wolf'
    };
    
    return levels[type] || 'Social Player';
  }

  generateRiskTolerance(type) {
    const tolerances = {
      agent: 'Calculated Risks',
      cropton: 'Moderate',
      craftman: 'Low',
      herobrine: 'High'
    };
    
    return tolerances[type] || 'Moderate';
  }

  generateServerHistory() {
    const numServers = this.chance.integer({ min: 1, max: 5 });
    const servers = [];
    
    for (let i = 0; i < numServers; i++) {
      servers.push({
        name: `${this.chance.word({ syllables: 2 })}${this.chance.integer({ min: 1, max: 999 })}`,
        type: this.chance.pickone(['Survival', 'Creative', 'Minigames', 'Roleplay']),
        firstJoined: moment().subtract(this.chance.integer({ min: 30, max: 365 }), 'days').toISOString(),
        lastPlayed: moment().subtract(this.chance.integer({ min: 1, max: 30 }), 'days').toISOString(),
        playTime: this.chance.integer({ min: 10, max: 200 }), // hours
        status: this.chance.pickone(['Active', 'Inactive', 'Banned'])
      });
    }
    
    return servers;
  }

  async saveIdentities() {
    const identitiesPath = path.join(this.configPath, 'identities.json');
    const identities = Array.from(this.identities.values());
    await fs.writeJson(identitiesPath, identities, { spaces: 2 });
  }

  async loadFingerprints() {
    const fingerprintsPath = path.join(this.configPath, 'fingerprints.json');
    
    if (await fs.pathExists(fingerprintsPath)) {
      try {
        const fingerprints = await fs.readJson(fingerprintsPath);
        fingerprints.forEach(fp => {
          this.fingerprints.set(fp.id, fp);
        });
        console.log(`📁 Loaded ${fingerprints.length} fingerprints`);
      } catch (error) {
        console.log('⚠️ Could not load fingerprints, creating defaults...');
        await this.createDefaultFingerprints();
      }
    } else {
      await this.createDefaultFingerprints();
    }
  }

  async createDefaultFingerprints() {
    console.log('🔄 Creating default fingerprints...');
    
    // Create unique fingerprints for each identity
    for (const [id, identity] of this.identities) {
      const fingerprint = this.generateFingerprint(identity);
      this.fingerprints.set(id, fingerprint);
    }
    
    await this.saveFingerprints();
    console.log(`📝 Created ${this.fingerprints.size} fingerprints`);
  }

  generateFingerprint(identity) {
    return {
      id: identity.id,
      identityId: identity.id,
      
      // Hardware Fingerprint
      hardware: {
        screenResolution: this.generateResolution(),
        colorDepth: this.chance.pickone([24, 30, 32]),
        deviceMemory: this.chance.pickone([4, 8, 16, 32]),
        hardwareConcurrency: this.chance.pickone([2, 4, 6, 8, 12]),
        maxTouchPoints: this.chance.integer({ min: 0, max: 5 })
      },
      
      // Software Fingerprint
      software: {
        userAgent: this.generateUserAgent(identity.technical.browser),
        platform: identity.technical.os,
        language: identity.personal.language.code,
        timezone: identity.personal.location.timezone,
        cookiesEnabled: this.chance.bool({ likelihood: 95 }),
        doNotTrack: this.chance.bool({ likelihood: 20 })
      },
      
      // Network Fingerprint
      network: {
        ip: this.generateIP(),
        isp: this.generateISP(),
        asn: this.generateASN(),
        organization: this.generateOrganization()
      },
      
      // Behavioral Fingerprint
      behavioral: {
        typingSpeed: this.chance.integer({ min: 30, max: 120 }), // WPM
        mouseMovement: this.generateMousePattern(),
        clickPattern: this.generateClickPattern(),
        scrollBehavior: this.generateScrollBehavior(),
        activityTiming: this.generateActivityTiming()
      },
      
      // Cryptographic Fingerprint
      cryptographic: {
        canvasHash: crypto.randomBytes(32).toString('hex'),
        webglHash: crypto.randomBytes(32).toString('hex'),
        audioHash: crypto.randomBytes(32).toString('hex'),
        fontHash: crypto.randomBytes(32).toString('hex')
      },
      
      metadata: {
        created: new Date().toISOString(),
        lastUsed: null,
        useCount: 0,
        detectionScore: 0
      }
    };
  }

  generateResolution() {
    const resolutions = [
      '1920x1080', '2560x1440', '3840x2160',
      '1366x768', '1536x864', '1440x900'
    ];
    
    return this.chance.pickone(resolutions);
  }

  generateUserAgent(browser) {
    const os = this.chance.pickone(['Windows NT 10.0', 'Macintosh; Intel Mac OS X 10_15_7', 'X11; Linux x86_64']);
    const engine = this.chance.pickone(['AppleWebKit/537.36', 'Gecko/20100101']);
    
    return `Mozilla/5.0 (${os}) ${engine} (KHTML, like Gecko) ${browser.name}/${browser.version} Safari/537.36`;
  }

  generateIP() {
    // Generate realistic-looking IP
    return `${this.chance.integer({ min: 1, max: 255 })}.${this.chance.integer({ min: 0, max: 255 })}.${this.chance.integer({ min: 0, max: 255 })}.${this.chance.integer({ min: 1, max: 254 })}`;
  }

  generateISP() {
    const isps = ['Comcast', 'Verizon', 'AT&T', 'Spectrum', 'CenturyLink', 'Cox', 'Optimum'];
    return this.chance.pickone(isps);
  }

  generateASN() {
    return `AS${this.chance.integer({ min: 1000, max: 50000 })}`;
  }

  generateOrganization() {
    return this.chance.company();
  }

  generateMousePattern() {
    return {
      speed: this.chance.floating({ min: 0.5, max: 2.0, fixed: 2 }),
      acceleration: this.chance.floating({ min: 0.1, max: 0.5, fixed: 2 }),
      jitter: this.chance.floating({ min: 0.01, max: 0.1, fixed: 3 })
    };
  }

  generateClickPattern() {
    return {
      singleClickDelay: this.chance.integer({ min: 100, max: 300 }),
      doubleClickDelay: this.chance.integer({ min: 200, max: 500 }),
      rightClickFrequency: this.chance.floating({ min: 0.1, max: 0.3, fixed: 2 })
    };
  }

  generateScrollBehavior() {
    return {
      speed: this.chance.floating({ min: 0.5, max: 2.0, fixed: 2 }),
      smoothness: this.chance.floating({ min: 0.7, max: 1.0, fixed: 2 }),
      wheelPreference: this.chance.bool({ likelihood: 80 })
    };
  }

  generateActivityTiming() {
    return {
      sessionStartVariance: this.chance.integer({ min: 5, max: 30 }), // minutes
      afkFrequency: this.chance.integer({ min: 2, max: 10 }), // per hour
      afkDuration: this.chance.integer({ min: 30, max: 300 }) // seconds
    };
  }

  async saveFingerprints() {
    const fingerprintsPath = path.join(this.configPath, 'fingerprints.json');
    const fingerprints = Array.from(this.fingerprints.values());
    await fs.writeJson(fingerprintsPath, fingerprints, { spaces: 2 });
  }

  getIdentity(botType) {
    // Find identity for bot type
    for (const [id, identity] of this.identities) {
      if (identity.type === botType && identity.metadata.useCount < 10) {
        return identity;
      }
    }
    
    // Create new identity if none available
    const newIdentity = this.createIdentity(botType, this.getBotName(botType));
    this.identities.set(newIdentity.id, newIdentity);
    this.saveIdentities().catch(console.error);
    
    return newIdentity;
  }

  getBotName(botType) {
    const names = {
      agent: 'Agent',
      cropton: 'Cropton',
      craftman: 'CraftMan',
      herobrine: 'HeroBrine'
    };
    
    return names[botType] || 'MinecraftBot';
  }

  getFingerprint(identityId) {
    let fingerprint = this.fingerprints.get(identityId);
    
    if (!fingerprint) {
      const identity = this.identities.get(identityId);
      if (identity) {
        fingerprint = this.generateFingerprint(identity);
        this.fingerprints.set(identityId, fingerprint);
        this.saveFingerprints().catch(console.error);
      }
    }
    
    return fingerprint;
  }

  updateIdentityUsage(identityId, success = true) {
    const identity = this.identities.get(identityId);
    if (!identity) return;
    
    // Update usage stats
    identity.metadata.useCount++;
    identity.metadata.lastUpdated = new Date().toISOString();
    identity.account.lastLogin = new Date().toISOString();
    
    // Update success rate
    const totalUses = identity.metadata.useCount;
    const currentRate = identity.metadata.successRate || 0;
    const newRate = success ? 0.95 : 0.05;
    identity.metadata.successRate = (currentRate * (totalUses - 1) + newRate) / totalUses;
    
    // Update fingerprint if exists
    const fingerprint = this.fingerprints.get(identityId);
    if (fingerprint) {
      fingerprint.metadata.lastUsed = new Date().toISOString();
      fingerprint.metadata.useCount++;
      
      // Slightly modify fingerprint for realism
      this.modifyFingerprint(fingerprint);
    }
    
    // Save changes
    this.saveIdentities().catch(console.error);
    if (fingerprint) {
      this.saveFingerprints().catch(console.error);
    }
    
    this.emit('identity_used', { identityId, success, useCount: totalUses });
  }

  modifyFingerprint(fingerprint) {
    // Simulate natural changes over time
    if (Math.random() < 0.3) {
      // Change screen resolution occasionally
      fingerprint.hardware.screenResolution = this.generateResolution();
    }
    
    if (Math.random() < 0.2) {
      // Update user agent version
      const browser = fingerprint.software.userAgent.match(/(Chrome|Firefox|Edge|Safari)\/(\d+)/);
      if (browser) {
        const newVersion = parseInt(browser[2]) + Math.floor(Math.random() * 3);
        fingerprint.software.userAgent = fingerprint.software.userAgent.replace(
          `${browser[1]}/${browser[2]}`,
          `${browser[1]}/${newVersion}`
        );
      }
    }
    
    // Slightly modify behavioral patterns
    fingerprint.behavioral.typingSpeed += this.chance.integer({ min: -5, max: 5 });
    fingerprint.behavioral.typingSpeed = Math.max(20, Math.min(fingerprint.behavioral.typingSpeed, 150));
    
    fingerprint.behavioral.mouseMovement.speed *= (1 + (Math.random() * 0.2 - 0.1)); // ±10%
    fingerprint.behavioral.clickPattern.singleClickDelay += this.chance.integer({ min: -20, max: 20 });
  }

  rotateIdentity(botType) {
    console.log(`🔄 Rotating identity for ${botType}`);
    
    // Get current identities for this type
    const currentIdentities = Array.from(this.identities.values())
      .filter(id => id.type === botType)
      .sort((a, b) => a.metadata.useCount - b.metadata.useCount);
    
    if (currentIdentities.length === 0) {
      // Create new identity
      const newIdentity = this.createIdentity(botType, this.getBotName(botType));
      this.identities.set(newIdentity.id, newIdentity);
      this.saveIdentities().catch(console.error);
      
      return newIdentity;
    }
    
    // Use least used identity
    return currentIdentities[0];
  }

  createBehaviorProfile(identity) {
    const profileId = `behavior_${identity.id}`;
    
    const profile = {
      id: profileId,
      identityId: identity.id,
      
      // Communication Style
      communication: {
        greetingStyle: this.generateGreetingStyle(identity.type),
        responseTime: this.generateResponseTime(identity.type),
        emoteUsage: this.generateEmoteUsage(identity.type),
        vocabulary: this.generateVocabulary(identity.type),
        grammarLevel: this.generateGrammarLevel()
      },
      
      // Gameplay Style
      gameplay: {
        learningSpeed: this.generateLearningSpeed(),
        mistakeRate: this.generateMistakeRate(identity.type),
        explorationStyle: this.generateExplorationStyle(identity.type),
        buildingStyle: this.generateBuildingStyle(identity.type),
        miningStyle: this.generateMiningStyle(identity.type)
      },
      
      // Social Behavior
      social: {
        friendliness: this.generateFriendliness(identity.type),
        trustLevel: this.generateTrustLevel(),
        helpFrequency: this.generateHelpFrequency(identity.type),
        tradeBehavior: this.generateTradeBehavior(),
        groupParticipation: this.generateGroupParticipation(identity.type)
      },
      
      // Decision Making
      decisions: {
        riskAssessment: this.generateRiskAssessment(identity.type),
        patienceLevel: this.generatePatienceLevel(identity.type),
        adaptability: this.generateAdaptability(),
        consistency: this.generateConsistency()
      },
      
      metadata: {
        created: new Date().toISOString(),
        learningRate: 0.7,
        lastUpdated: new Date().toISOString()
      }
    };
    
    this.behaviorProfiles.set(profileId, profile);
    return profile;
  }

  generateGreetingStyle(type) {
    const styles = {
      agent: 'Professional',
      cropton: 'Friendly',
      craftman: 'Warm',
      herobrine: 'Mysterious'
    };
    
    return styles[type] || 'Neutral';
  }

  generateResponseTime(type) {
    const times = {
      agent: { min: 1000, max: 3000 },
      cropton: { min: 1500, max: 4000 },
      craftman: { min: 800, max: 2500 },
      herobrine: { min: 3000, max: 8000 }
    };
    
    const range = times[type] || { min: 1000, max: 3000 };
    return this.chance.integer(range);
  }

  generateEmoteUsage(type) {
    const usages = {
      agent: 'Rare',
      cropton: 'Occasional',
      craftman: 'Frequent',
      herobrine: 'Very Rare'
    };
    
    return usages[type] || 'Occasional';
  }

  generateVocabulary(type) {
    const vocabularies = {
      agent: 'Technical',
      cropton: 'Casual',
      craftman: 'Descriptive',
      herobrine: 'Cryptic'
    };
    
    return vocabularies[type] || 'Normal';
  }

  generateGrammarLevel() {
    return this.chance.pickone(['Perfect', 'Good', 'Average', 'Casual']);
  }

  generateLearningSpeed() {
    return this.chance.floating({ min: 0.5, max: 1.5, fixed: 2 });
  }

  generateMistakeRate(type) {
    const rates = {
      agent: 0.05,
      cropton: 0.1,
      craftman: 0.07,
      herobrine: 0.15
    };
    
    return rates[type] || 0.1;
  }

  generateExplorationStyle(type) {
    const styles = {
      agent: 'Systematic',
      cropton: 'Resource-Focused',
      craftman: 'Architectural',
      herobrine: 'Erratic'
    };
    
    return styles[type] || 'Curious';
  }

  generateBuildingStyle(type) {
    const styles = {
      agent: 'Functional',
      cropton: 'Practical',
      craftman: 'Artistic',
      herobrine: 'Unusual'
    };
    
    return styles[type] || 'Creative';
  }

  generateMiningStyle(type) {
    const styles = {
      agent: 'Efficient',
      cropton: 'Thorough',
      craftman: 'Selective',
      herobrine: 'Random'
    };
    
    return styles[type] || 'Methodical';
  }

  generateFriendliness(type) {
    const levels = {
      agent: 'Reserved',
      cropton: 'Friendly',
      craftman: 'Welcoming',
      herobrine: 'Distant'
    };
    
    return levels[type] || 'Neutral';
  }

  generateTrustLevel() {
    return this.chance.floating({ min: 0.3, max: 0.9, fixed: 2 });
  }

  generateHelpFrequency(type) {
    const frequencies = {
      agent: 'When Asked',
      cropton: 'Often',
      craftman: 'Frequently',
      herobrine: 'Rarely'
    };
    
    return frequencies[type] || 'Sometimes';
  }

  generateTradeBehavior() {
    return this.chance.pickone(['Fair', 'Generous', 'Cautious', 'Strategic']);
  }

  generateGroupParticipation(type) {
    const participations = {
      agent: 'Leader',
      cropton: 'Team Player',
      craftman: 'Coordinator',
      herobrine: 'Lone Wolf'
    };
    
    return participations[type] || 'Participant';
  }

  generateRiskAssessment(type) {
    const assessments = {
      agent: 'Calculated',
      cropton: 'Moderate',
      craftman: 'Cautious',
      herobrine: 'Reckless'
    };
    
    return assessments[type] || 'Balanced';
  }

  generatePatienceLevel(type) {
    const levels = {
      agent: 'High',
      cropton: 'Very High',
      craftman: 'High',
      herobrine: 'Low'
    };
    
    return levels[type] || 'Medium';
  }

  generateAdaptability() {
    return this.chance.floating({ min: 0.5, max: 1.0, fixed: 2 });
  }

  generateConsistency() {
    return this.chance.floating({ min: 0.6, max: 0.95, fixed: 2 });
  }

  getBehaviorProfileForIdentity(identityId) {
    let profile = Array.from(this.behaviorProfiles.values())
      .find(p => p.identityId === identityId);
    
    if (!profile) {
      const identity = this.identities.get(identityId);
      if (identity) {
        profile = this.createBehaviorProfile(identity);
      }
    }
    
    return profile;
  }

  async getStatus() {
    const status = {
      identities: {
        total: this.identities.size,
        byType: {},
        averageUseCount: 0,
        averageSuccessRate: 0
      },
      fingerprints: {
        total: this.fingerprints.size,
        coverage: Math.round((this.fingerprints.size / this.identities.size) * 100)
      },
      behaviorProfiles: {
        total: this.behaviorProfiles.size
      }
    };
    
    // Calculate stats by type
    const byType = {};
    let totalUses = 0;
    let totalSuccess = 0;
    
    for (const identity of this.identities.values()) {
      if (!byType[identity.type]) {
        byType[identity.type] = { count: 0, totalUses: 0, totalSuccess: 0 };
      }
      
      byType[identity.type].count++;
      byType[identity.type].totalUses += identity.metadata.useCount;
      byType[identity.type].totalSuccess += (identity.metadata.successRate || 0) * identity.metadata.useCount;
      
      totalUses += identity.metadata.useCount;
      totalSuccess += (identity.metadata.successRate || 0) * identity.metadata.useCount;
    }
    
    status.identities.byType = byType;
    status.identities.averageUseCount = totalUses / Math.max(this.identities.size, 1);
    status.identities.averageSuccessRate = totalSuccess / Math.max(totalUses, 1);
    
    return status;
  }

  async exportIdentities() {
    const exportData = {
      timestamp: Date.now(),
      identities: Array.from(this.identities.values()),
      fingerprints: Array.from(this.fingerprints.values()),
      behaviorProfiles: Array.from(this.behaviorProfiles.values())
    };
    
    const exportPath = path.join(__dirname, 'exports', `identities-${Date.now()}.json`);
    await fs.ensureDir(path.dirname(exportPath));
    await fs.writeJson(exportPath, exportData, { spaces: 2 });
    
    return exportPath;
  }

  async importIdentities(filePath) {
    try {
      const importData = await fs.readJson(filePath);
      
      if (importData.identities) {
        importData.identities.forEach(identity => {
          this.identities.set(identity.id, identity);
        });
      }
      
      if (importData.fingerprints) {
        importData.fingerprints.forEach(fp => {
          this.fingerprints.set(fp.id, fp);
        });
      }
      
      if (importData.behaviorProfiles) {
        importData.behaviorProfiles.forEach(profile => {
          this.behaviorProfiles.set(profile.id, profile);
        });
      }
      
      await this.saveIdentities();
      await this.saveFingerprints();
      
      console.log(`✅ Imported ${importData.identities?.length || 0} identities`);
      return { success: true, imported: importData.identities.length };
    } catch (error) {
      console.error(`❌ Error importing identities: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  validateIdentity(identityId) {
    const identity = this.identities.get(identityId);
    if (!identity) return { valid: false, reason: 'Identity not found' };
    
    const issues = [];
    
    // Check account age
    const accountAge = identity.account.accountAge;
    if (accountAge < 1) {
      issues.push('Account too new');
    }
    
    // Check use count
    if (identity.metadata.useCount > 50) {
      issues.push('Account overused');
    }
    
    // Check success rate
    if (identity.metadata.successRate < 0.3) {
      issues.push('Low success rate');
    }
    
    // Check last login
    const daysSinceLogin = moment().diff(moment(identity.account.lastLogin), 'days');
    if (daysSinceLogin > 30) {
      issues.push('Account dormant');
    }
    
    return {
      valid: issues.length === 0,
      issues: issues,
      score: Math.max(0, 100 - (issues.length * 20))
    };
  }

  async cleanupOldIdentities(maxAgeDays = 90) {
    const cutoff = moment().subtract(maxAgeDays, 'days');
    let removed = 0;
    
    for (const [id, identity] of this.identities) {
      const created = moment(identity.metadata.created);
      if (created.isBefore(cutoff) && identity.metadata.useCount > 10) {
        this.identities.delete(id);
        this.fingerprints.delete(id);
        removed++;
      }
    }
    
    if (removed > 0) {
      await this.saveIdentities();
      await this.saveFingerprints();
      console.log(`🗑️ Cleaned up ${removed} old identities`);
    }
    
    return { removed: removed };
  }
}

module.exports = IdentityManager;
