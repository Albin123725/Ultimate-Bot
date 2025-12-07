const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');
const moment = require('moment');
const cron = require('cron');

class TemporalManager extends EventEmitter {
  constructor() {
    super();
    this.temporalPatterns = new Map();
    this.schedules = new Map();
    this.history = [];
    this.seasonalEffects = new Map();
    this.holidays = new Map();
    this.configPath = path.join(__dirname, 'config', 'temporal');
  }

  async initialize() {
    console.log('⏰ Initializing Temporal Manager...');
    
    await fs.ensureDir(this.configPath);
    await this.loadTemporalPatterns();
    await this.loadHolidays();
    await this.initializeSchedules();
    
    console.log('✅ Temporal Manager initialized');
    return this;
  }

  async loadTemporalPatterns() {
    const patternsPath = path.join(this.configPath, 'patterns.json');
    
    if (await fs.pathExists(patternsPath)) {
      try {
        const patterns = await fs.readJson(patternsPath);
        patterns.forEach(pattern => {
          this.temporalPatterns.set(pattern.id, pattern);
        });
        console.log(`📁 Loaded ${patterns.length} temporal patterns`);
      } catch (error) {
        console.log('⚠️ Could not load temporal patterns, creating defaults...');
        await this.createDefaultPatterns();
      }
    } else {
      await this.createDefaultPatterns();
    }
  }

  async createDefaultPatterns() {
    const defaultPatterns = [
      {
        id: 'weekday_pattern',
        name: 'Weekday Pattern',
        type: 'weekly',
        days: [1, 2, 3, 4, 5], // Monday to Friday
        activityLevels: {
          '06:00': 0.3,  // Wake up
          '08:00': 0.6,  // Morning activity
          '12:00': 0.8,  // Lunch break (less activity)
          '13:00': 0.9,  // Afternoon peak
          '17:00': 0.7,  // Evening start
          '20:00': 0.5,  // Evening wind down
          '22:00': 0.2,  // Bedtime
          '00:00': 0.1   // Sleep
        }
      },
      {
        id: 'weekend_pattern',
        name: 'Weekend Pattern',
        type: 'weekly',
        days: [0, 6], // Saturday and Sunday
        activityLevels: {
          '09:00': 0.2,  // Sleep in
          '11:00': 0.5,  // Late morning
          '14:00': 0.9,  // Afternoon peak
          '18:00': 0.8,  // Evening social
          '22:00': 0.6,  // Late evening
          '01:00': 0.3,  // Late night
          '03:00': 0.1   // Sleep
        }
      },
      {
        id: 'seasonal_winter',
        name: 'Winter Season',
        type: 'seasonal',
        months: [11, 0, 1], // Dec, Jan, Feb
        modifiers: {
          activityMultiplier: 0.8,
          sessionDurationMultiplier: 1.2,
          chatFrequency: 0.9,
          explorationRange: 0.7
        }
      },
      {
        id: 'seasonal_summer',
        name: 'Summer Season',
        type: 'seasonal',
        months: [5, 6, 7], // Jun, Jul, Aug
        modifiers: {
          activityMultiplier: 1.2,
          sessionDurationMultiplier: 0.8,
          chatFrequency: 1.1,
          explorationRange: 1.3
        }
      },
      {
        id: 'exam_period',
        name: 'Exam Period',
        type: 'event',
        frequency: 'monthly',
        duration: 14, // days
        modifiers: {
          activityMultiplier: 0.5,
          sessionDurationMultiplier: 0.6,
          loginFrequency: 0.3
        }
      },
      {
        id: 'vacation_period',
        name: 'Vacation Period',
        type: 'event',
        frequency: 'quarterly',
        duration: 7, // days
        modifiers: {
          activityMultiplier: 1.5,
          sessionDurationMultiplier: 2.0,
          loginFrequency: 1.8
        }
      }
    ];

    defaultPatterns.forEach(pattern => {
      this.temporalPatterns.set(pattern.id, pattern);
    });

    await this.saveTemporalPatterns();
    console.log(`📝 Created ${defaultPatterns.length} default temporal patterns`);
  }

  async saveTemporalPatterns() {
    const patternsPath = path.join(this.configPath, 'patterns.json');
    const patterns = Array.from(this.temporalPatterns.values());
    await fs.writeJson(patternsPath, patterns, { spaces: 2 });
  }

  async loadHolidays() {
    const holidaysPath = path.join(this.configPath, 'holidays.json');
    
    if (await fs.pathExists(holidaysPath)) {
      try {
        const holidays = await fs.readJson(holidaysPath);
        holidays.forEach(holiday => {
          this.holidays.set(holiday.id, holiday);
        });
        console.log(`📁 Loaded ${holidays.length} holidays`);
      } catch (error) {
        console.log('⚠️ Could not load holidays, creating defaults...');
        await this.createDefaultHolidays();
      }
    } else {
      await this.createDefaultHolidays();
    }
  }

  async createDefaultHolidays() {
    const currentYear = new Date().getFullYear();
    
    const defaultHolidays = [
      {
        id: 'christmas',
        name: 'Christmas',
        date: `${currentYear}-12-25`,
        duration: 3,
        modifiers: {
          activityMultiplier: 1.5,
          socialActivity: 2.0,
          giftGiving: 0.8,
          specialEvents: true
        }
      },
      {
        id: 'new_year',
        name: 'New Year',
        date: `${currentYear + 1}-01-01`,
        duration: 2,
        modifiers: {
          activityMultiplier: 1.8,
          socialActivity: 2.2,
          celebration: true,
          lateNightActivity: 2.0
        }
      },
      {
        id: 'summer_break',
        name: 'Summer Break',
        date: `${currentYear}-06-15`,
        duration: 60,
        modifiers: {
          activityMultiplier: 1.3,
          sessionDurationMultiplier: 1.5,
          explorationRange: 1.4,
          vacationMode: true
        }
      },
      {
        id: 'halloween',
        name: 'Halloween',
        date: `${currentYear}-10-31`,
        duration: 1,
        modifiers: {
          activityMultiplier: 1.6,
          spookyEvents: true,
          costumeWearing: 0.7,
          nightActivity: 1.8
        }
      }
    ];

    defaultHolidays.forEach(holiday => {
      this.holidays.set(holiday.id, holiday);
    });

    await this.saveHolidays();
    console.log(`📝 Created ${defaultHolidays.length} default holidays`);
  }

  async saveHolidays() {
    const holidaysPath = path.join(this.configPath, 'holidays.json');
    const holidays = Array.from(this.holidays.values());
    await fs.writeJson(holidaysPath, holidays, { spaces: 2 });
  }

  async initializeSchedules() {
    console.log('📅 Initializing temporal schedules...');
    
    // Create cron jobs for different temporal events
    this.createCronJob('0 * * * *', this.updateHourly.bind(this)); // Every hour
    this.createCronJob('0 0 * * *', this.updateDaily.bind(this)); // Every day at midnight
    this.createCronJob('0 0 * * 0', this.updateWeekly.bind(this)); // Every Sunday at midnight
    
    // Initialize current state
    await this.updateTemporalState();
    
    console.log('✅ Temporal schedules initialized');
  }

  createCronJob(cronTime, onTick) {
    try {
      const job = new cron.CronJob(cronTime, onTick);
      job.start();
      return job;
    } catch (error) {
      console.error('❌ Error creating cron job:', error.message);
      return null;
    }
  }

  async updateHourly() {
    const now = new Date();
    console.log(`🕐 Hourly update: ${now.toLocaleTimeString()}`);
    
    await this.updateTemporalState();
    this.emit('hourly_update', { time: now });
  }

  async updateDaily() {
    const now = new Date();
    console.log(`📅 Daily update: ${now.toLocaleDateString()}`);
    
    await this.updateSeasonalEffects();
    await this.checkHolidays();
    
    this.emit('daily_update', { date: now });
  }

  async updateWeekly() {
    console.log('📊 Weekly update');
    
    // Analyze weekly patterns
    await this.analyzeWeeklyPatterns();
    
    this.emit('weekly_update', {});
  }

  async updateTemporalState() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Get active patterns
    const activePatterns = this.getActivePatterns(now);
    
    // Calculate current activity level
    const activityLevel = this.calculateActivityLevel(activePatterns, timeString, dayOfWeek);
    
    // Get seasonal modifiers
    const seasonalModifiers = this.getSeasonalModifiers(now);
    
    // Check for holidays
    const holidayModifiers = this.getHolidayModifiers(now);
    
    // Combine all modifiers
    const temporalState = {
      timestamp: now,
      dayOfWeek: dayOfWeek,
      hour: hour,
      minute: minute,
      timeString: timeString,
      activityLevel: activityLevel,
      activePatterns: activePatterns.map(p => p.id),
      seasonalModifiers: seasonalModifiers,
      holidayModifiers: holidayModifiers,
      combinedModifiers: this.combineModifiers(seasonalModifiers, holidayModifiers),
      isPeakTime: this.isPeakTime(now),
      isOffPeak: this.isOffPeak(now),
      optimalActivity: this.getOptimalActivity(now)
    };
    
    // Store in history
    this.history.push(temporalState);
    
    // Keep history limited
    if (this.history.length > 10080) { // 7 days of minutes
      this.history = this.history.slice(-10080);
    }
    
    this.emit('temporal_update', temporalState);
    
    return temporalState;
  }

  getActivePatterns(date) {
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    
    return Array.from(this.temporalPatterns.values()).filter(pattern => {
      if (pattern.type === 'weekly') {
        return pattern.days.includes(dayOfWeek);
      } else if (pattern.type === 'seasonal') {
        return pattern.months.includes(month);
      } else if (pattern.type === 'event') {
        return this.isEventActive(pattern, date);
      }
      return false;
    });
  }

  isEventActive(event, date) {
    // Simplified event activation logic
    // In a real system, this would check specific dates and frequencies
    if (event.frequency === 'monthly') {
      return date.getDate() <= 14; // First half of month for exam period
    } else if (event.frequency === 'quarterly') {
      const month = date.getMonth();
      return month % 3 === 0 && date.getDate() <= 7; // First week of quarter
    }
    return false;
  }

  calculateActivityLevel(patterns, timeString, dayOfWeek) {
    let baseLevel = 0.5; // Default
    
    // Apply weekly patterns
    const weeklyPatterns = patterns.filter(p => p.type === 'weekly');
    weeklyPatterns.forEach(pattern => {
      // Find closest time slot
      let closestTime = null;
      let closestDiff = Infinity;
      
      for (const [time, level] of Object.entries(pattern.activityLevels)) {
        const timeDiff = this.getTimeDifference(time, timeString);
        if (timeDiff < closestDiff) {
          closestDiff = timeDiff;
          closestTime = level;
        }
      }
      
      if (closestTime !== null) {
        baseLevel = (baseLevel + closestTime) / 2;
      }
    });
    
    // Apply seasonal modifiers
    const seasonalPatterns = patterns.filter(p => p.type === 'seasonal');
    seasonalPatterns.forEach(pattern => {
      if (pattern.modifiers.activityMultiplier) {
        baseLevel *= pattern.modifiers.activityMultiplier;
      }
    });
    
    // Apply event modifiers
    const eventPatterns = patterns.filter(p => p.type === 'event');
    eventPatterns.forEach(pattern => {
      if (pattern.modifiers.activityMultiplier) {
        baseLevel *= pattern.modifiers.activityMultiplier;
      }
    });
    
    // Ensure within bounds
    return Math.max(0.1, Math.min(baseLevel, 1.0));
  }

  getTimeDifference(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    
    const total1 = h1 * 60 + m1;
    const total2 = h2 * 60 + m2;
    
    return Math.abs(total1 - total2);
  }

  async updateSeasonalEffects() {
    const now = new Date();
    const month = now.getMonth();
    
    this.seasonalEffects.clear();
    
    // Define seasonal effects
    const seasons = {
      11: { 0: 1, 1: 2 }, // Winter: Dec, Jan, Feb
      2: { 3: 1, 4: 2, 5: 3 }, // Spring: Mar, Apr, May
      5: { 6: 1, 7: 2, 8: 3 }, // Summer: Jun, Jul, Aug
      8: { 9: 1, 10: 2, 11: 3 } // Fall: Sep, Oct, Nov
    };
    
    for (const [startMonth, months] of Object.entries(seasons)) {
      if (months[month] !== undefined) {
        const season = this.getSeasonName(parseInt(startMonth));
        const intensity = months[month];
        
        this.seasonalEffects.set(season, {
          name: season,
          intensity: intensity,
          modifiers: this.getSeasonModifiers(season, intensity)
        });
        break;
      }
    }
    
    console.log(`🍂 Current season: ${Array.from(this.seasonalEffects.keys()).join(', ')}`);
  }

  getSeasonName(startMonth) {
    switch (startMonth) {
      case 11: return 'Winter';
      case 2: return 'Spring';
      case 5: return 'Summer';
      case 8: return 'Fall';
      default: return 'Unknown';
    }
  }

  getSeasonModifiers(season, intensity) {
    const baseModifiers = {
      Winter: {
        activityMultiplier: 0.8 + (intensity * 0.1),
        sessionDurationMultiplier: 1.0 + (intensity * 0.2),
        indoorActivity: 1.2,
        outdoorActivity: 0.6
      },
      Spring: {
        activityMultiplier: 1.0 + (intensity * 0.15),
        sessionDurationMultiplier: 1.1 + (intensity * 0.1),
        exploration: 1.3,
        socialActivity: 1.1
      },
      Summer: {
        activityMultiplier: 1.2 + (intensity * 0.2),
        sessionDurationMultiplier: 0.9 - (intensity * 0.05),
        outdoorActivity: 1.5,
        waterActivities: 1.8
      },
      Fall: {
        activityMultiplier: 0.9 + (intensity * 0.1),
        sessionDurationMultiplier: 1.0 + (intensity * 0.1),
        harvesting: 1.4,
        preparation: 1.2
      }
    };
    
    return baseModifiers[season] || {};
  }

  getSeasonalModifiers(date) {
    const season = this.getSeasonName(Math.floor(date.getMonth() / 3) * 3);
    return this.seasonalEffects.get(season)?.modifiers || {};
  }

  async checkHolidays() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    let activeHoliday = null;
    
    for (const [id, holiday] of this.holidays) {
      const holidayDate = new Date(holiday.date);
      const daysDiff = Math.floor((now - holidayDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < holiday.duration) {
        activeHoliday = holiday;
        break;
      }
    }
    
    if (activeHoliday) {
      console.log(`🎉 Active holiday: ${activeHoliday.name}`);
      this.emit('holiday_active', { holiday: activeHoliday });
    }
    
    return activeHoliday;
  }

  getHolidayModifiers(date) {
    const now = new Date();
    
    for (const [id, holiday] of this.holidays) {
      const holidayDate = new Date(holiday.date);
      const daysDiff = Math.floor((now - holidayDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < holiday.duration) {
        return holiday.modifiers || {};
      }
    }
    
    return {};
  }

  combineModifiers(...modifiersList) {
    const combined = {};
    
    modifiersList.forEach(modifiers => {
      for (const [key, value] of Object.entries(modifiers)) {
        if (typeof value === 'number') {
          combined[key] = (combined[key] || 1) * value;
        } else if (typeof value === 'boolean') {
          combined[key] = combined[key] || value;
        }
      }
    });
    
    return combined;
  }

  isPeakTime(date) {
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    
    // Peak hours: 4 PM - 10 PM on weekdays, 10 AM - 2 AM on weekends
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdays
      return hour >= 16 && hour < 22;
    } else { // Weekends
      return (hour >= 10 && hour < 24) || hour < 2;
    }
  }

  isOffPeak(date) {
    const hour = date.getHours();
    return hour >= 2 && hour < 7; // 2 AM - 7 AM
  }

  getOptimalActivity(date) {
    const hour = date.getHours();
    
    if (hour >= 22 || hour < 6) {
      return { activity: 'sleep', reason: 'Late night hours' };
    } else if (hour >= 6 && hour < 9) {
      return { activity: 'morning_routine', reason: 'Morning hours' };
    } else if (hour >= 9 && hour < 12) {
      return { activity: 'productive_work', reason: 'Morning productivity peak' };
    } else if (hour >= 12 && hour < 14) {
      return { activity: 'lunch_break', reason: 'Lunch time' };
    } else if (hour >= 14 && hour < 17) {
      return { activity: 'focused_work', reason: 'Afternoon focus time' };
    } else if (hour >= 17 && hour < 20) {
      return { activity: 'social_activity', reason: 'Evening social hours' };
    } else {
      return { activity: 'leisure', reason: 'Evening leisure time' };
    }
  }

  async getConnectionParameters() {
    const now = new Date();
    const temporalState = await this.updateTemporalState();
    
    // Calculate optimal connection parameters based on temporal state
    const parameters = {
      difficulty: this.getOptimalDifficulty(now),
      sessionDuration: this.getOptimalSessionDuration(temporalState),
      reconnectDelay: this.getOptimalReconnectDelay(now),
      activityIntensity: temporalState.activityLevel,
      shouldConnect: this.shouldConnectNow(now)
    };
    
    return parameters;
  }

  getOptimalDifficulty(date) {
    const hour = date.getHours();
    
    if (hour >= 22 || hour < 6) {
      return 'peaceful'; // Night time, easier difficulty
    } else if (this.isPeakTime(date)) {
      return 'hard'; // Peak time, challenging
    } else {
      return 'normal'; // Normal time
    }
  }

  getOptimalSessionDuration(temporalState) {
    let baseDuration = 1800000; // 30 minutes
    
    // Adjust based on activity level
    baseDuration *= temporalState.activityLevel;
    
    // Adjust based on peak/off-peak
    if (temporalState.isPeakTime) {
      baseDuration *= 1.5;
    } else if (temporalState.isOffPeak) {
      baseDuration *= 0.5;
    }
    
    // Apply modifiers
    if (temporalState.combinedModifiers.sessionDurationMultiplier) {
      baseDuration *= temporalState.combinedModifiers.sessionDurationMultiplier;
    }
    
    // Ensure reasonable bounds
    return Math.max(600000, Math.min(baseDuration, 21600000)); // 10 min to 6 hours
  }

  getOptimalReconnectDelay(date) {
    if (this.isPeakTime(date)) {
      return 30000; // 30 seconds during peak
    } else if (this.isOffPeak(date)) {
      return 120000; // 2 minutes during off-peak
    } else {
      return 60000; // 1 minute normally
    }
  }

  shouldConnectNow(date) {
    // Simulate real player behavior
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    
    // Weekdays: Mostly after school/work (3 PM - 11 PM)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      return hour >= 15 && hour < 23;
    }
    
    // Weekends: More flexible (10 AM - 2 AM)
    return (hour >= 10 && hour < 24) || hour < 2;
  }

  async getOptimalConnectionTime() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // Calculate optimal connection times based on patterns
    const optimalTimes = [];
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Weekdays: After work/school
      optimalTimes.push(
        { time: '16:00', reason: 'After school/work', priority: 0.9 },
        { time: '20:00', reason: 'Evening free time', priority: 0.8 },
        { time: '22:00', reason: 'Late night', priority: 0.6 }
      );
    } else {
      // Weekends
      optimalTimes.push(
        { time: '11:00', reason: 'Late morning', priority: 0.8 },
        { time: '15:00', reason: 'Afternoon', priority: 0.9 },
        { time: '20:00', reason: 'Evening', priority: 0.9 },
        { time: '23:00', reason: 'Late night', priority: 0.7 }
      );
    }
    
    // Find next optimal time
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let nextOptimal = optimalTimes[0];
    let minDiff = Infinity;
    
    for (const time of optimalTimes) {
      const diff = this.getTimeDifference(currentTime, time.time);
      if (diff < minDiff) {
        minDiff = diff;
        nextOptimal = time;
      }
    }
    
    return {
      currentTime: currentTime,
      nextOptimal: nextOptimal,
      allOptimalTimes: optimalTimes,
      timeUntilNext: minDiff
    };
  }

  async analyzeWeeklyPatterns() {
    console.log('📈 Analyzing weekly patterns...');
    
    // Group history by day of week
    const byDay = {};
    for (let i = 0; i < 7; i++) {
      byDay[i] = [];
    }
    
    this.history.forEach(record => {
      byDay[record.dayOfWeek].push(record);
    });
    
    // Calculate averages
    const analysis = {};
    for (const [day, records] of Object.entries(byDay)) {
      if (records.length > 0) {
        const avgActivity = records.reduce((sum, r) => sum + r.activityLevel, 0) / records.length;
        const peakHour = this.findPeakHour(records);
        
        analysis[day] = {
          dayName: this.getDayName(parseInt(day)),
          averageActivity: avgActivity,
          peakHour: peakHour,
          recordCount: records.length
        };
      }
    }
    
    // Save analysis
    const analysisPath = path.join(this.configPath, 'weekly-analysis.json');
    await fs.writeJson(analysisPath, analysis, { spaces: 2 });
    
    console.log('📊 Weekly analysis completed');
    return analysis;
  }

  findPeakHour(records) {
    const byHour = {};
    
    records.forEach(record => {
      const hour = record.hour;
      byHour[hour] = (byHour[hour] || 0) + 1;
    });
    
    let peakHour = 0;
    let maxCount = 0;
    
    for (const [hour, count] of Object.entries(byHour)) {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    }
    
    return peakHour;
  }

  getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  async simulateLifeEvent(eventType, durationDays) {
    console.log(`🎭 Simulating life event: ${eventType} for ${durationDays} days`);
    
    const event = {
      id: `life_event_${crypto.randomBytes(8).toString('hex')}`,
      type: eventType,
      startDate: new Date().toISOString(),
      duration: durationDays,
      modifiers: this.getLifeEventModifiers(eventType),
      active: true
    };
    
    // Add to patterns
    this.temporalPatterns.set(event.id, {
      id: event.id,
      name: `${eventType} Event`,
      type: 'event',
      modifiers: event.modifiers,
      duration: durationDays
    });
    
    // Schedule deactivation
    setTimeout(() => {
      this.temporalPatterns.delete(event.id);
      console.log(`✅ Life event ${eventType} completed`);
    }, durationDays * 24 * 60 * 60 * 1000);
    
    this.emit('life_event_started', event);
    
    return event;
  }

  getLifeEventModifiers(eventType) {
    const modifiers = {
      exam_period: {
        activityMultiplier: 0.4,
        sessionDurationMultiplier: 0.5,
        loginFrequency: 0.3,
        stressLevel: 0.8
      },
      vacation: {
        activityMultiplier: 1.8,
        sessionDurationMultiplier: 2.0,
        loginFrequency: 1.5,
        relaxation: 0.9
      },
      sick: {
        activityMultiplier: 0.2,
        sessionDurationMultiplier: 0.3,
        loginFrequency: 0.1,
        recovery: 0.5
      },
      busy_work: {
        activityMultiplier: 0.6,
        sessionDurationMultiplier: 0.7,
        loginFrequency: 0.8,
        focus: 0.7
      }
    };
    
    return modifiers[eventType] || {};
  }

  async getStatus() {
    const now = new Date();
    const temporalState = await this.updateTemporalState();
    
    return {
      current: {
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        dayOfWeek: this.getDayName(now.getDay()),
        season: Array.from(this.seasonalEffects.keys())[0] || 'Unknown',
        activityLevel: Math.round(temporalState.activityLevel * 100),
        isPeakTime: temporalState.isPeakTime,
        isOffPeak: temporalState.isOffPeak
      },
      patterns: {
        active: temporalState.activePatterns.length,
        total: this.temporalPatterns.size
      },
      history: {
        records: this.history.length,
        coverage: `${Math.round(this.history.length / 10080 * 100)}% of week`
      }
    };
  }

  getHistoricalData(days = 7) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const filtered = this.history.filter(record => record.timestamp.getTime() > cutoff);
    
    return {
      period: `${days} days`,
      records: filtered.length,
      averageActivity: filtered.reduce((sum, r) => sum + r.activityLevel, 0) / filtered.length,
      peakTime: this.findPeakHour(filtered),
      byDay: this.groupByDay(filtered)
    };
  }

  groupByDay(records) {
    const grouped = {};
    
    records.forEach(record => {
      const day = this.getDayName(record.dayOfWeek);
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(record);
    });
    
    // Calculate averages
    const result = {};
    for (const [day, dayRecords] of Object.entries(grouped)) {
      result[day] = {
        records: dayRecords.length,
        averageActivity: dayRecords.reduce((sum, r) => sum + r.activityLevel, 0) / dayRecords.length,
        peakHour: this.findPeakHour(dayRecords)
      };
    }
    
    return result;
  }

  async addHoliday(holidayData) {
    const holiday = {
      id: `holiday_${crypto.randomBytes(8).toString('hex')}`,
      ...holidayData
    };
    
    this.holidays.set(holiday.id, holiday);
    await this.saveHolidays();
    
    console.log(`✅ Added holiday: ${holiday.name}`);
    return holiday;
  }

  async removeHoliday(holidayId) {
    if (this.holidays.has(holidayId)) {
      this.holidays.delete(holidayId);
      await this.saveHolidays();
      
      console.log(`🗑️ Removed holiday: ${holidayId}`);
      return { success: true };
    }
    
    return { success: false, error: 'Holiday not found' };
  }

  async exportTemporalData() {
    const exportData = {
      timestamp: Date.now(),
      patterns: Array.from(this.temporalPatterns.values()),
      holidays: Array.from(this.holidays.values()),
      seasonalEffects: Array.from(this.seasonalEffects.values()),
      currentState: await this.updateTemporalState()
    };
    
    const exportPath = path.join(__dirname, 'exports', `temporal-${Date.now()}.json`);
    await fs.ensureDir(path.dirname(exportPath));
    await fs.writeJson(exportPath, exportData, { spaces: 2 });
    
    return exportPath;
  }
}

module.exports = TemporalManager;
