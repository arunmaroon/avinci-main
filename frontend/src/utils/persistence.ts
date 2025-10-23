// Persistence utilities for admin panel and chat store
// Provides localStorage integration with error handling and data validation

interface PersistenceConfig {
  key: string;
  version: string;
  maxAge?: number; // in milliseconds
  encrypt?: boolean;
}

interface StoredData {
  data: any;
  timestamp: number;
  version: string;
  checksum?: string;
}

class PersistenceManager {
  private config: PersistenceConfig;

  constructor(config: PersistenceConfig) {
    this.config = config;
  }

  // Store data with validation and error handling
  set(data: any): boolean {
    try {
      const storedData: StoredData = {
        data,
        timestamp: Date.now(),
        version: this.config.version,
        checksum: this.config.encrypt ? this.generateChecksum(data) : undefined
      };

      const serialized = JSON.stringify(storedData);
      localStorage.setItem(this.config.key, serialized);
      
      console.log(`Data stored successfully for key: ${this.config.key}`);
      return true;
    } catch (error) {
      console.error(`Failed to store data for key ${this.config.key}:`, error);
      return false;
    }
  }

  // Retrieve data with validation and error handling
  get(): any | null {
    try {
      const serialized = localStorage.getItem(this.config.key);
      if (!serialized) {
        return null;
      }

      const storedData: StoredData = JSON.parse(serialized);
      
      // Check version compatibility
      if (storedData.version !== this.config.version) {
        console.warn(`Version mismatch for key ${this.config.key}. Expected: ${this.config.version}, Got: ${storedData.version}`);
        this.clear(); // Clear incompatible data
        return null;
      }

      // Check max age
      if (this.config.maxAge && (Date.now() - storedData.timestamp) > this.config.maxAge) {
        console.warn(`Data expired for key ${this.config.key}`);
        this.clear();
        return null;
      }

      // Verify checksum if encryption is enabled
      if (this.config.encrypt && storedData.checksum) {
        const currentChecksum = this.generateChecksum(storedData.data);
        if (currentChecksum !== storedData.checksum) {
          console.error(`Data corruption detected for key ${this.config.key}`);
          this.clear();
          return null;
        }
      }

      return storedData.data;
    } catch (error) {
      console.error(`Failed to retrieve data for key ${this.config.key}:`, error);
      this.clear(); // Clear corrupted data
      return null;
    }
  }

  // Clear stored data
  clear(): boolean {
    try {
      localStorage.removeItem(this.config.key);
      console.log(`Data cleared for key: ${this.config.key}`);
      return true;
    } catch (error) {
      console.error(`Failed to clear data for key ${this.config.key}:`, error);
      return false;
    }
  }

  // Check if data exists and is valid
  exists(): boolean {
    try {
      const serialized = localStorage.getItem(this.config.key);
      if (!serialized) return false;

      const storedData: StoredData = JSON.parse(serialized);
      
      // Check version
      if (storedData.version !== this.config.version) return false;
      
      // Check max age
      if (this.config.maxAge && (Date.now() - storedData.timestamp) > this.config.maxAge) return false;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get data age in milliseconds
  getAge(): number | null {
    try {
      const serialized = localStorage.getItem(this.config.key);
      if (!serialized) return null;

      const storedData: StoredData = JSON.parse(serialized);
      return Date.now() - storedData.timestamp;
    } catch (error) {
      return null;
    }
  }

  // Generate simple checksum for data integrity
  private generateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // Export data for backup
  export(): string | null {
    try {
      const data = this.get();
      if (!data) return null;

      return JSON.stringify({
        key: this.config.key,
        version: this.config.version,
        data,
        exportedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to export data for key ${this.config.key}:`, error);
      return null;
    }
  }

  // Import data from backup
  import(backupData: string): boolean {
    try {
      const parsed = JSON.parse(backupData);
      
      if (parsed.key !== this.config.key) {
        console.error(`Key mismatch. Expected: ${this.config.key}, Got: ${parsed.key}`);
        return false;
      }

      if (parsed.version !== this.config.version) {
        console.error(`Version mismatch. Expected: ${this.config.version}, Got: ${parsed.version}`);
        return false;
      }

      return this.set(parsed.data);
    } catch (error) {
      console.error(`Failed to import data for key ${this.config.key}:`, error);
      return false;
    }
  }
}

// Pre-configured persistence managers
export const adminPersistence = new PersistenceManager({
  key: 'avinci-admin-panel',
  version: '2.02',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  encrypt: false
});

export const chatPersistence = new PersistenceManager({
  key: 'avinci-chat-store',
  version: '2.02',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  encrypt: false
});

export const figmaPersistence = new PersistenceManager({
  key: 'avinci-figma-data',
  version: '2.02',
  maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
  encrypt: false
});

// Utility functions for common operations
export const saveAdminSession = (sessionData: any): boolean => {
  return adminPersistence.set(sessionData);
};

export const loadAdminSession = (): any | null => {
  return adminPersistence.get();
};

export const clearAdminSession = (): boolean => {
  return adminPersistence.clear();
};

export const saveChatData = (chatData: any): boolean => {
  return chatPersistence.set(chatData);
};

export const loadChatData = (): any | null => {
  return chatPersistence.get();
};

export const clearChatData = (): boolean => {
  return chatPersistence.clear();
};

export const saveFigmaData = (figmaData: any): boolean => {
  return figmaPersistence.set(figmaData);
};

export const loadFigmaData = (): any | null => {
  return figmaPersistence.get();
};

export const clearFigmaData = (): boolean => {
  return figmaPersistence.clear();
};

// Backup and restore utilities
export const createBackup = (): string => {
  const adminData = adminPersistence.export();
  const chatData = chatPersistence.export();
  const figmaData = figmaPersistence.export();

  return JSON.stringify({
    admin: adminData,
    chat: chatData,
    figma: figmaData,
    createdAt: new Date().toISOString(),
    version: '2.02'
  });
};

export const restoreBackup = (backupData: string): boolean => {
  try {
    const parsed = JSON.parse(backupData);
    
    if (parsed.version !== '2.02') {
      console.error('Incompatible backup version');
      return false;
    }

    let success = true;

    if (parsed.admin) {
      success = adminPersistence.import(parsed.admin) && success;
    }

    if (parsed.chat) {
      success = chatPersistence.import(parsed.chat) && success;
    }

    if (parsed.figma) {
      success = figmaPersistence.import(parsed.figma) && success;
    }

    return success;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return false;
  }
};

// Cleanup utilities
export const cleanupExpiredData = (): void => {
  const managers = [adminPersistence, chatPersistence, figmaPersistence];
  
  managers.forEach(manager => {
    if (!manager.exists()) {
      manager.clear();
    }
  });
};

// Initialize persistence on app start
export const initializePersistence = (): void => {
  // Clean up expired data
  cleanupExpiredData();
  
  // Set up periodic cleanup (every hour)
  setInterval(cleanupExpiredData, 60 * 60 * 1000);
  
  console.log('Persistence system initialized');
};

export default PersistenceManager;

