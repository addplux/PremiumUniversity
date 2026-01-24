const DB_NAME = 'afriedu-offline';
const DB_VERSION = 1;

class OfflineStorage {
    constructor() {
        this.db = null;
        this.initPromise = null;
    }

    /**
     * Initialize IndexedDB
     * Creates object stores for offline data
     */
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('🔄 Upgrading IndexedDB schema...');

                // Create object stores for different data types
                const stores = [
                    { name: 'courses', keyPath: '_id' },
                    { name: 'grades', keyPath: '_id' },
                    { name: 'assignments', keyPath: '_id' },
                    { name: 'enrollments', keyPath: '_id' },
                    { name: 'timetable', keyPath: '_id' },
                    { name: 'notifications', keyPath: '_id' },
                    { name: 'materials', keyPath: '_id' },
                    { name: 'pending-submissions', keyPath: 'id', autoIncrement: true },
                    { name: 'pending-attendance', keyPath: 'id', autoIncrement: true },
                    { name: 'user-profile', keyPath: 'id' },
                    { name: 'organization', keyPath: 'id' }
                ];

                stores.forEach(({ name, keyPath, autoIncrement }) => {
                    if (!db.objectStoreNames.contains(name)) {
                        const objectStore = db.createObjectStore(name, {
                            keyPath,
                            autoIncrement: autoIncrement || false
                        });

                        // Add indexes for common queries
                        if (name === 'assignments') {
                            objectStore.createIndex('dueDate', 'dueDate', { unique: false });
                            objectStore.createIndex('status', 'status', { unique: false });
                        }

                        if (name === 'pending-submissions') {
                            objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                        }

                        console.log(`✅ Created object store: ${name}`);
                    }
                });
            };
        });

        return this.initPromise;
    }

    /**
     * Save data to a store
     * @param {string} storeName - Name of the object store
     * @param {object|array} data - Data to save
     */
    async save(storeName, data) {
        await this.init();

        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        if (Array.isArray(data)) {
            // Save multiple items
            const promises = data.map(item => store.put(item));
            await Promise.all(promises);
            console.log(`💾 Saved ${data.length} items to ${storeName}`);
        } else {
            // Save single item
            await store.put(data);
            console.log(`💾 Saved item to ${storeName}`);
        }

        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Get a single item from a store
     * @param {string} storeName - Name of the object store
     * @param {string} key - Key of the item
     */
    async get(storeName, key) {
        await this.init();

        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all items from a store
     * @param {string} storeName - Name of the object store
     */
    async getAll(storeName) {
        await this.init();

        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete an item from a store
     * @param {string} storeName - Name of the object store
     * @param {string} key - Key of the item to delete
     */
    async delete(storeName, key) {
        await this.init();

        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            tx.oncomplete = () => {
                console.log(`🗑️ Deleted item from ${storeName}`);
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Clear all items from a store
     * @param {string} storeName - Name of the object store
     */
    async clear(storeName) {
        await this.init();

        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.clear();
            tx.oncomplete = () => {
                console.log(`🗑️ Cleared ${storeName}`);
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        });
    }

    /**
     * Get items by index
     * @param {string} storeName - Name of the object store
     * @param {string} indexName - Name of the index
     * @param {any} value - Value to search for
     */
    async getByIndex(storeName, indexName, value) {
        await this.init();

        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);

        return new Promise((resolve, reject) => {
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get count of items in a store
     * @param {string} storeName - Name of the object store
     */
    async count(storeName) {
        await this.init();

        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Check if database is available
     */
    isAvailable() {
        return 'indexedDB' in window;
    }

    /**
     * Get database size (approximate)
     */
    async getSize() {
        if (!navigator.storage || !navigator.storage.estimate) {
            return null;
        }

        const estimate = await navigator.storage.estimate();
        return {
            usage: estimate.usage,
            quota: estimate.quota,
            percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
        };
    }

    /**
     * Clear all data (for logout or reset)
     */
    async clearAll() {
        await this.init();

        const storeNames = Array.from(this.db.objectStoreNames);

        for (const storeName of storeNames) {
            await this.clear(storeName);
        }

        console.log('🗑️ Cleared all offline data');
    }
}

// Export singleton instance
const offlineStorage = new OfflineStorage();
export default offlineStorage;
