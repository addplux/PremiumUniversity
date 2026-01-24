import { useOnlineStatus, usePWAInstall } from '../hooks/useOfflineSync';
import './OfflineIndicator.css';

const OfflineIndicator = () => {
    const isOnline = useOnlineStatus();
    const { canInstall, promptInstall, isInstalled } = usePWAInstall();

    return (
        <>
            {/* Offline Status Banner */}
            {!isOnline && (
                <div className="offline-indicator">
                    <div className="offline-indicator-content">
                        <span className="offline-icon">📡</span>
                        <span className="offline-text">
                            You're offline. Some features may be limited.
                        </span>
                    </div>
                </div>
            )}

            {/* PWA Install Prompt */}
            {canInstall && !isInstalled && (
                <div className="pwa-install-prompt">
                    <div className="pwa-install-content">
                        <div className="pwa-install-text">
                            <strong>📱 Install AfriEdu Hub</strong>
                            <p>Get the app experience - works offline!</p>
                        </div>
                        <button
                            className="pwa-install-button"
                            onClick={promptInstall}
                        >
                            Install
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default OfflineIndicator;
