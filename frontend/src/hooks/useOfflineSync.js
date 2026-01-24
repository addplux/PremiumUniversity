import { useState, useEffect, useCallback } from 'react';
import offlineStorage from '../utils/offlineStorage';
import axios from 'axios';

/**
 * Custom hook for offline-first data fetching and synchronization
 * @param {string} endpoint - API endpoint to fetch from
 * @param {string} storeName - IndexedDB store name
 * @param {object} options - Configuration options
 */
export const useOfflineSync = (endpoint, storeName, options = {}) => {
    const {
        autoFetch = true,
        syncOnReconnect = true,
        cacheFirst = false
    } = options;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingSync, setPendingSync] = useState(0);
    const [lastSync, setLastSync] = useState(null);

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => {
            console.log('🟢 Back online');
            setIsOnline(true);
        };

        const handleOffline = () => {
            console.log('🔴 Gone offline');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Fetch data (network-first or cache-first)
    const fetchData = useCallback(async (forceNetwork = false) => {
        try {
            setLoading(true);
            setError(null);

            // Cache-first strategy
            if (cacheFirst && !forceNetwork) {
                const cachedData = await offlineStorage.getAll(storeName);
                if (cachedData && cachedData.length > 0) {
                    setData(cachedData);
                    setLoading(false);

                    // Fetch in background to update cache
                    if (isOnline) {
                        fetchFromNetwork();
                    }
                    return;
                }
            }

            // Network-first strategy
            if (isOnline || forceNetwork) {
                await fetchFromNetwork();
            } else {
                // Offline - load from cache
                const cachedData = await offlineStorage.getAll(storeName);
                setData(cachedData || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);

            // Fallback to cache on error
            try {
                const cachedData = await offlineStorage.getAll(storeName);
                setData(cachedData || []);
            } catch (cacheErr) {
                console.error('Cache error:', cacheErr);
            }
        } finally {
            setLoading(false);
        }
    }, [endpoint, storeName, isOnline, cacheFirst]);

    // Fetch from network
    const fetchFromNetwork = async () => {
        try {
            const response = await axios.get(endpoint);
            const apiData = response.data.data || response.data;

            // Save to offline storage
            await offlineStorage.save(storeName, apiData);
            setData(apiData);
            setLastSync(new Date());

            console.log(`✅ Synced ${storeName} from network`);
        } catch (err) {
            throw err;
        }
    };

    // Save data offline (for submissions)
    const saveOffline = useCallback(async (item, metadata = {}) => {
        try {
            const submission = {
                endpoint,
                data: item,
                metadata,
                timestamp: Date.now(),
                token: localStorage.getItem('token') // Include auth token
            };

            await offlineStorage.save('pending-submissions', submission);

            // Update pending count
            const pending = await offlineStorage.getAll('pending-submissions');
            setPendingSync(pending.length);

            console.log('💾 Saved offline submission');

            // Register background sync if available
            if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.sync.register('sync-submissions');
                    console.log('🔄 Background sync registered');
                } catch (syncErr) {
                    console.error('Background sync registration failed:', syncErr);
                }
            }

            return true;
        } catch (err) {
            console.error('Save offline error:', err);
            setError(err.message);
            return false;
        }
    }, [endpoint]);

    // Manually trigger sync
    const syncNow = useCallback(async () => {
        if (!isOnline) {
            console.warn('⚠️ Cannot sync while offline');
            return false;
        }

        try {
            const pending = await offlineStorage.getAll('pending-submissions');

            if (pending.length === 0) {
                console.log('✅ No pending submissions');
                return true;
            }

            console.log(`🔄 Syncing ${pending.length} pending submissions...`);

            for (const item of pending) {
                try {
                    await axios.post(item.endpoint, item.data, {
                        headers: {
                            'Authorization': `Bearer ${item.token}`
                        }
                    });

                    // Remove from pending after successful sync
                    await offlineStorage.delete('pending-submissions', item.id);
                    console.log(`✅ Synced submission ${item.id}`);
                } catch (syncErr) {
                    console.error(`❌ Failed to sync submission ${item.id}:`, syncErr);
                    // Keep in pending for retry
                }
            }

            // Update pending count
            const remaining = await offlineStorage.getAll('pending-submissions');
            setPendingSync(remaining.length);

            // Refresh data after sync
            await fetchData(true);

            return remaining.length === 0;
        } catch (err) {
            console.error('Sync error:', err);
            setError(err.message);
            return false;
        }
    }, [isOnline, fetchData]);

    // Update pending count
    const updatePendingCount = useCallback(async () => {
        try {
            const pending = await offlineStorage.getAll('pending-submissions');
            setPendingSync(pending.length);
        } catch (err) {
            console.error('Update pending count error:', err);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch) {
            fetchData();
            updatePendingCount();
        }
    }, [autoFetch, fetchData, updatePendingCount]);

    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline && syncOnReconnect && pendingSync > 0) {
            console.log('🔄 Auto-syncing after reconnection...');
            syncNow();
        }
    }, [isOnline, syncOnReconnect, pendingSync, syncNow]);

    return {
        data,
        loading,
        error,
        isOnline,
        pendingSync,
        lastSync,
        saveOffline,
        syncNow,
        refresh: () => fetchData(true),
        refetch: fetchData
    };
};

/**
 * Hook for checking online status
 */
export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};

/**
 * Hook for PWA install prompt
 */
export const usePWAInstall = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setInstallPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = async () => {
        if (!installPrompt) {
            return false;
        }

        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }

        setInstallPrompt(null);
        return outcome === 'accepted';
    };

    return {
        installPrompt,
        isInstalled,
        promptInstall,
        canInstall: !!installPrompt
    };
};
