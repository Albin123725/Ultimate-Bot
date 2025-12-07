const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');
const geoip = require('geoip-lite');
const axios = require('axios');

class ProxyManager extends EventEmitter {
  constructor() {
    super();
    this.proxies = new Map();
    this.proxyPool = [];
    this.activeProxies = new Map();
    this.performanceMetrics = new Map();
    this.rotationIndex = 0;
    this.configPath = path.join(__dirname, 'config', 'proxies.json');
  }

  async initialize() {
    console.log('🌐 Initializing Proxy Manager...');
    
    await fs.ensureDir(path.dirname(this.configPath));
    await this.loadProxies();
    await this.verifyProxies();
    
    console.log(`✅ Proxy Manager initialized with ${this.proxyPool.length} proxies`);
    return this;
  }

  async loadProxies() {
    if (await fs.pathExists(this.configPath)) {
      try {
        const proxyData = await fs.readJson(this.configPath);
        this.proxyPool = proxyData;
        console.log(`📁 Loaded ${this.proxyPool.length} proxies from file`);
      } catch (error) {
        console.log('⚠️ Could not load proxies, generating default pool...');
        await this.generateProxyPool();
      }
    } else {
      await this.generateProxyPool();
    }
  }

  async generateProxyPool() {
    console.log('🔄 Generating proxy pool...');
    
    // Residential proxies (simulated)
    const residentialProxies = this.generateResidentialProxies(50);
    
    // Mobile proxies (simulated)
    const mobileProxies = this.generateMobileProxies(30);
    
    // VPN proxies (simulated)
    const vpnProxies = this.generateVPNProxies(20);
    
    // Combine all proxies
    this.proxyPool = [...residentialProxies, ...mobileProxies, ...vpnProxies];
    
    // Shuffle proxies
    this.shuffleArray(this.proxyPool);
    
    // Save to file
    await this.saveProxies();
    
    console.log(`📊 Generated ${this.proxyPool.length} proxies`);
  }

  generateResidentialProxies(count) {
    const proxies = [];
    const isps = [
      'Comcast', 'Verizon', 'Spectrum', 'AT&T', 'CenturyLink',
      'Cox', 'Optimum', 'Frontier', 'Windstream', 'Mediacom'
    ];
    
    const locations = [
      { country: 'US', city: 'New York', timezone: 'America/New_York' },
      { country: 'US', city: 'Los Angeles', timezone: 'America/Los_Angeles' },
      { country: 'US', city: 'Chicago', timezone: 'America/Chicago' },
      { country: 'CA', city: 'Toronto', timezone: 'America/Toronto' },
      { country: 'GB', city: 'London', timezone: 'Europe/London' },
      { country: 'DE', city: 'Berlin', timezone: 'Europe/Berlin' },
      { country: 'FR', city: 'Paris', timezone: 'Europe/Paris' },
      { country: 'JP', city: 'Tokyo', timezone: 'Asia/Tokyo' },
      { country: 'AU', city: 'Sydney', timezone: 'Australia/Sydney' }
    ];
    
    for (let i = 0; i < count; i++) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const isp = isps[Math.floor(Math.random() * isps.length)];
      
      proxies.push({
        id: `res_${crypto.randomBytes(8).toString('hex')}`,
        type: 'residential',
        ip: this.generateRandomIP(),
        port: this.generateRandomPort(),
        protocol: Math.random() > 0.5 ? 'http' : 'socks5',
        location: location,
        isp: isp,
        speed: Math.random() * 50 + 50, // 50-100 Mbps
        latency: Math.random() * 50 + 10, // 10-60ms
        successRate: Math.random() * 0.2 + 0.8, // 80-100%
        lastUsed: null,
        useCount: 0,
        blacklisted: false,
        credentials: Math.random() > 0.7 ? {
          username: `user${Math.floor(Math.random() * 10000)}`,
          password: crypto.randomBytes(12).toString('hex')
        } : null
      });
    }
    
    return proxies;
  }

  generateMobileProxies(count) {
    const proxies = [];
    const carriers = [
      'Verizon 5G', 'AT&T 5G', 'T-Mobile 5G', 'Sprint 4G',
      'Vodafone 5G', 'EE 5G', 'Telefonica 4G', 'Orange 5G'
    ];
    
    for (let i = 0; i < count; i++) {
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      
      proxies.push({
        id: `mob_${crypto.randomBytes(8).toString('hex')}`,
        type: 'mobile',
        ip: this.generateRandomIP(),
        port: this.generateRandomPort(),
        protocol: 'http',
        carrier: carrier,
        generation: carrier.includes('5G') ? '5G' : '4G',
        speed: carrier.includes('5G') ? Math.random() * 200 + 100 : Math.random() * 50 + 20,
        latency: carrier.includes('5G') ? Math.random() * 10 + 5 : Math.random() * 30 + 10,
        successRate: Math.random() * 0.15 + 0.85,
        lastUsed: null,
        useCount: 0,
        rotating: Math.random() > 0.5,
        rotationInterval: Math.random() > 0.7 ? Math.floor(Math.random() * 300) + 60 : null // 1-5 minutes
      });
    }
    
    return proxies;
  }

  generateVPNProxies(count) {
    const proxies = [];
    const providers = [
      'NordVPN', 'ExpressVPN', 'Surfshark', 'CyberGhost',
      'Private Internet Access', 'ProtonVPN', 'Mullvad', 'Windscribe'
    ];
    
    for (let i = 0; i < count; i++) {
      const provider = providers[Math.floor(Math.random() * providers.length)];
      
      proxies.push({
        id: `vpn_${crypto.randomBytes(8).toString('hex')}`,
        type: 'vpn',
        ip: this.generateRandomIP(),
        port: this.generateRandomPort(),
        protocol: Math.random() > 0.3 ? 'socks5' : 'http',
        provider: provider,
        serverLocation: this.generateRandomLocation(),
        encryption: 'AES-256-GCM',
        speed: Math.random() * 100 + 50,
        latency: Math.random() * 100 + 20,
        successRate: Math.random() * 0.1 + 0.9,
        lastUsed: null,
        useCount: 0,
        dedicated: Math.random() > 0.6,
        shared: Math.random() > 0.4
      });
    }
    
    return proxies;
  }

  generateRandomIP() {
    // Generate realistic-looking IP addresses
    const parts = [];
    for (let i = 0; i < 4; i++) {
      parts.push(Math.floor(Math.random() * 256));
    }
    return parts.join('.');
  }

  generateRandomPort() {
    const ports = [8080, 8888, 1080, 3128, 8081, 9090, 4145];
    return ports[Math.floor(Math.random() * ports.length)];
  }

  generateRandomLocation() {
    const locations = [
      'US-NewYork', 'US-LosAngeles', 'US-Chicago', 'US-Miami',
      'CA-Toronto', 'GB-London', 'DE-Frankfurt', 'FR-Paris',
      'NL-Amsterdam', 'JP-Tokyo', 'AU-Sydney', 'SG-Singapore'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  async saveProxies() {
    await fs.writeJson(this.configPath, this.proxyPool, { spaces: 2 });
  }

  async verifyProxies() {
    console.log('🔍 Verifying proxy pool...');
    
    const verifiedProxies = [];
    const verificationPromises = [];
    
    // Sample verification of some proxies
    const sampleSize = Math.min(10, this.proxyPool.length);
    const sampleProxies = this.proxyPool.slice(0, sampleSize);
    
    for (const proxy of sampleProxies) {
      verificationPromises.push(this.testProxy(proxy));
    }
    
    const results = await Promise.allSettled(verificationPromises);
    
    let working = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.working) {
        working++;
        sampleProxies[index].verified = true;
        sampleProxies[index].latency = result.value.latency;
      } else {
        sampleProxies[index].verified = false;
        sampleProxies[index].blacklisted = true;
      }
    });
    
    console.log(`✅ ${working}/${sampleSize} proxies verified`);
    
    // Update pool
    for (let i = 0; i < sampleSize; i++) {
      this.proxyPool[i] = sampleProxies[i];
    }
    
    await this.saveProxies();
  }

  async testProxy(proxy) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ working: false, latency: null, error: 'Timeout' });
      }, 10000);
      
      // Simulated proxy test
      setTimeout(() => {
        clearTimeout(timeout);
        
        // 80% success rate for simulation
        const success = Math.random() > 0.2;
        
        if (success) {
          const latency = Math.random() * 200 + 50; // 50-250ms
          resolve({ working: true, latency: latency });
        } else {
          resolve({ working: false, latency: null, error: 'Connection failed' });
        }
      }, 500 + Math.random() * 1000);
    });
  }

  async getNextProxy() {
    // Filter available proxies
    const availableProxies = this.proxyPool.filter(proxy => 
      !proxy.blacklisted && 
      (!proxy.lastUsed || Date.now() - new Date(proxy.lastUsed) > 300000) // 5 minutes cooldown
    );
    
    if (availableProxies.length === 0) {
      // Reset all proxies if none available
      this.proxyPool.forEach(proxy => proxy.blacklisted = false);
      return this.getNextProxy();
    }
    
    // Weighted selection based on performance
    const weightedProxies = availableProxies.map(proxy => ({
      proxy,
      weight: this.calculateProxyWeight(proxy)
    }));
    
    // Normalize weights
    const totalWeight = weightedProxies.reduce((sum, wp) => sum + wp.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const wp of weightedProxies) {
      if (random < wp.weight) {
        // Update proxy stats
        wp.proxy.lastUsed = new Date().toISOString();
        wp.proxy.useCount = (wp.proxy.useCount || 0) + 1;
        
        // Track active proxy
        this.activeProxies.set(wp.proxy.id, {
          ...wp.proxy,
          assignedAt: Date.now(),
          assignedTo: null // Will be set by bot system
        });
        
        await this.saveProxies();
        return wp.proxy;
      }
      random -= wp.weight;
    }
    
    // Fallback to first available
    const fallback = availableProxies[0];
    fallback.lastUsed = new Date().toISOString();
    fallback.useCount = (fallback.useCount || 0) + 1;
    
    this.activeProxies.set(fallback.id, {
      ...fallback,
      assignedAt: Date.now(),
      assignedTo: null
    });
    
    await this.saveProxies();
    return fallback;
  }

  calculateProxyWeight(proxy) {
    let weight = 1.0;
    
    // Success rate bonus
    weight *= (proxy.successRate || 0.5) * 2;
    
    // Speed bonus
    weight *= Math.min((proxy.speed || 50) / 100, 2);
    
    // Latency penalty
    weight *= Math.max(1 - (proxy.latency || 100) / 500, 0.1);
    
    // Usage penalty (prefer less used)
    weight *= Math.max(1 - (proxy.useCount || 0) / 100, 0.1);
    
    // Type preferences
    if (proxy.type === 'residential') weight *= 1.5;
    if (proxy.type === 'mobile') weight *= 1.3;
    if (proxy.type === 'vpn') weight *= 1.1;
    
    // Time since last use bonus
    if (proxy.lastUsed) {
      const hoursSinceUse = (Date.now() - new Date(proxy.lastUsed).getTime()) / 3600000;
      weight *= Math.min(hoursSinceUse / 24 + 1, 3); // Up to 3x bonus for 24+ hours
    }
    
    return Math.max(weight, 0.01);
  }

  createAgent(proxy) {
    const proxyUrl = `${proxy.protocol}://${proxy.ip}:${proxy.port}`;
    
    if (proxy.protocol === 'socks5' || proxy.protocol === 'socks4') {
      return new SocksProxyAgent(proxyUrl);
    } else {
      const agent = new HttpsProxyAgent(proxyUrl);
      
      // Add authentication if needed
      if (proxy.credentials) {
        agent.proxy.auth = `${proxy.credentials.username}:${proxy.credentials.password}`;
      }
      
      return agent;
    }
  }

  async rotateAll() {
    console.log('🔄 Rotating all active proxies...');
    
    const rotationPromises = [];
    
    for (const [proxyId, proxy] of this.activeProxies) {
      if (proxy.assignedTo) {
        rotationPromises.push(this.rotateProxy(proxyId));
      }
    }
    
    await Promise.allSettled(rotationPromises);
    
    return {
      success: true,
      message: `Rotated ${rotationPromises.length} proxies`,
      rotated: rotationPromises.length
    };
  }

  async rotateProxy(proxyId) {
    const activeProxy = this.activeProxies.get(proxyId);
    if (!activeProxy) return false;
    
    // Mark old proxy as needing cooldown
    const poolProxy = this.proxyPool.find(p => p.id === proxyId);
    if (poolProxy) {
      poolProxy.blacklisted = true; // Temporary blacklist
      poolProxy.lastUsed = new Date().toISOString();
    }
    
    // Remove from active
    this.activeProxies.delete(proxyId);
    
    // Get new proxy
    const newProxy = await this.getNextProxy();
    
    console.log(`🔄 Rotated proxy ${activeProxy.id} -> ${newProxy.id}`);
    
    return newProxy;
  }

  recordPerformance(proxyId, success, latency) {
    const proxy = this.proxyPool.find(p => p.id === proxyId);
    if (!proxy) return;
    
    // Update success rate (moving average)
    const oldRate = proxy.successRate || 0.5;
    const newRate = success ? 0.95 : 0.05;
    proxy.successRate = oldRate * 0.9 + newRate * 0.1;
    
    // Update latency (moving average)
    if (success && latency) {
      const oldLatency = proxy.latency || 100;
      proxy.latency = oldLatency * 0.8 + latency * 0.2;
    }
    
    // Update metrics
    if (!this.performanceMetrics.has(proxyId)) {
      this.performanceMetrics.set(proxyId, {
        successes: 0,
        failures: 0,
        totalLatency: 0,
        requests: 0
      });
    }
    
    const metrics = this.performanceMetrics.get(proxyId);
    metrics.requests++;
    
    if (success) {
      metrics.successes++;
      metrics.totalLatency += latency || 0;
    } else {
      metrics.failures++;
    }
    
    // Auto-blacklist consistently failing proxies
    if (metrics.requests > 10 && metrics.successes / metrics.requests < 0.3) {
      proxy.blacklisted = true;
      console.log(`🚫 Auto-blacklisted proxy ${proxyId} (${metrics.successes}/${metrics.requests} success)`);
    }
  }

  async getStatus() {
    const available = this.proxyPool.filter(p => !p.blacklisted).length;
    const residential = this.proxyPool.filter(p => p.type === 'residential' && !p.blacklisted).length;
    const mobile = this.proxyPool.filter(p => p.type === 'mobile' && !p.blacklisted).length;
    const vpn = this.proxyPool.filter(p => p.type === 'vpn' && !p.blacklisted).length;
    
    // Calculate average performance
    let avgSuccess = 0;
    let avgLatency = 0;
    let count = 0;
    
    for (const proxy of this.proxyPool) {
      if (proxy.successRate && proxy.latency) {
        avgSuccess += proxy.successRate;
        avgLatency += proxy.latency;
        count++;
      }
    }
    
    avgSuccess = count > 0 ? avgSuccess / count : 0;
    avgLatency = count > 0 ? avgLatency / count : 0;
    
    return {
      total: this.proxyPool.length,
      available: available,
      active: this.activeProxies.size,
      byType: {
        residential: residential,
        mobile: mobile,
        vpn: vpn
      },
      performance: {
        averageSuccessRate: Math.round(avgSuccess * 100),
        averageLatency: Math.round(avgLatency),
        blacklisted: this.proxyPool.filter(p => p.blacklisted).length
      },
      rotation: {
        index: this.rotationIndex,
        lastRotation: Date.now()
      }
    };
  }

  async addProxy(proxyData) {
    const newProxy = {
      id: `custom_${crypto.randomBytes(8).toString('hex')}`,
      type: proxyData.type || 'custom',
      ip: proxyData.ip,
      port: proxyData.port,
      protocol: proxyData.protocol || 'http',
      location: proxyData.location || { country: 'Unknown', city: 'Unknown' },
      isp: proxyData.isp || 'Unknown',
      speed: proxyData.speed || 50,
      latency: proxyData.latency || 100,
      successRate: 0.5,
      lastUsed: null,
      useCount: 0,
      blacklisted: false,
      credentials: proxyData.credentials || null,
      custom: true
    };
    
    // Test the proxy
    const testResult = await this.testProxy(newProxy);
    newProxy.verified = testResult.working;
    newProxy.latency = testResult.latency;
    
    if (testResult.working) {
      this.proxyPool.push(newProxy);
      await this.saveProxies();
      
      console.log(`✅ Added custom proxy ${newProxy.ip}:${newProxy.port}`);
      return { success: true, proxy: newProxy };
    } else {
      console.log(`❌ Custom proxy failed verification`);
      return { success: false, error: 'Proxy verification failed' };
    }
  }

  async removeProxy(proxyId) {
    const index = this.proxyPool.findIndex(p => p.id === proxyId);
    if (index === -1) {
      return { success: false, error: 'Proxy not found' };
    }
    
    // Remove from active proxies
    this.activeProxies.delete(proxyId);
    
    // Remove from pool
    this.proxyPool.splice(index, 1);
    
    await this.saveProxies();
    
    console.log(`🗑️ Removed proxy ${proxyId}`);
    return { success: true };
  }

  async clearBlacklist() {
    let cleared = 0;
    
    for (const proxy of this.proxyPool) {
      if (proxy.blacklisted) {
        proxy.blacklisted = false;
        cleared++;
      }
    }
    
    await this.saveProxies();
    
    console.log(`🔓 Cleared blacklist for ${cleared} proxies`);
    return { success: true, cleared: cleared };
  }

  getProxyStats(proxyId) {
    const proxy = this.proxyPool.find(p => p.id === proxyId);
    if (!proxy) return null;
    
    const metrics = this.performanceMetrics.get(proxyId) || {
      successes: 0,
      failures: 0,
      totalLatency: 0,
      requests: 0
    };
    
    return {
      proxy: proxy,
      metrics: metrics,
      successRate: metrics.requests > 0 ? metrics.successes / metrics.requests : 0,
      averageLatency: metrics.successes > 0 ? metrics.totalLatency / metrics.successes : 0,
      isActive: this.activeProxies.has(proxyId)
    };
  }

  async exportProxies() {
    const exportData = {
      timestamp: Date.now(),
      count: this.proxyPool.length,
      proxies: this.proxyPool.map(proxy => ({
        id: proxy.id,
        type: proxy.type,
        ip: proxy.ip,
        port: proxy.port,
        protocol: proxy.protocol,
        location: proxy.location,
        performance: {
          successRate: proxy.successRate,
          latency: proxy.latency,
          useCount: proxy.useCount
        }
      }))
    };
    
    const exportPath = path.join(__dirname, 'exports', `proxies-${Date.now()}.json`);
    await fs.ensureDir(path.dirname(exportPath));
    await fs.writeJson(exportPath, exportData, { spaces: 2 });
    
    return exportPath;
  }

  getProxyByLocation(country, city = null) {
    return this.proxyPool.filter(proxy => {
      if (proxy.blacklisted) return false;
      if (proxy.location.country !== country) return false;
      if (city && proxy.location.city !== city) return false;
      return true;
    });
  }

  getProxyByType(type) {
    return this.proxyPool.filter(proxy => 
      !proxy.blacklisted && proxy.type === type
    );
  }

  async refreshPool() {
    console.log('🔄 Refreshing proxy pool...');
    
    // Remove old proxies
    const oldCount = this.proxyPool.length;
    this.proxyPool = this.proxyPool.filter(proxy => 
      !proxy.custom && proxy.useCount < 100
    );
    
    // Add new proxies
    const newResidential = this.generateResidentialProxies(20);
    const newMobile = this.generateMobileProxies(10);
    const newVPN = this.generateVPNProxies(10);
    
    this.proxyPool.push(...newResidential, ...newMobile, ...newVPN);
    
    // Shuffle
    this.shuffleArray(this.proxyPool);
    
    // Verify new proxies
    await this.verifyProxies();
    
    await this.saveProxies();
    
    const added = this.proxyPool.length - oldCount + (oldCount - this.proxyPool.length);
    console.log(`✅ Refreshed pool: ${this.proxyPool.length} proxies (+${added})`);
    
    return {
      success: true,
      oldCount: oldCount,
      newCount: this.proxyPool.length,
      added: added
    };
  }
}

module.exports = ProxyManager;
