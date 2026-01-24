import { useState, useEffect } from 'react';
import { isLowBandwidth, getAdaptiveQuality } from '../utils/dataCompression';
import './LowBandwidthMode.css';

const LowBandwidthMode = () => {
    const [isLowBW, setIsLowBW] = useState(false);
    const [quality, setQuality] = useState('high');
    const [manualMode, setManualMode] = useState(false);

    useEffect(() => {
        // Check bandwidth on mount
        checkBandwidth();

        // Listen for connection changes
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            connection.addEventListener('change', checkBandwidth);

            return () => {
                connection.removeEventListener('change', checkBandwidth);
            };
        }
    }, []);

    const checkBandwidth = () => {
        const lowBW = isLowBandwidth();
        const adaptiveQuality = getAdaptiveQuality();

        setIsLowBW(lowBW);
        setQuality(adaptiveQuality);

        // Apply low bandwidth optimizations
        if (lowBW || adaptiveQuality === 'low') {
            applyLowBandwidthMode();
        }
    };

    const applyLowBandwidthMode = () => {
        // Add class to body for CSS optimizations
        document.body.classList.add('low-bandwidth-mode');

        // Disable auto-play videos
        document.querySelectorAll('video[autoplay]').forEach(video => {
            video.removeAttribute('autoplay');
        });

        // Reduce image quality
        document.querySelectorAll('img').forEach(img => {
            if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = img.src;
            }
            // Could replace with lower quality version
        });

        console.log('🔽 Low bandwidth mode activated');
    };

    const toggleManualMode = () => {
        const newMode = !manualMode;
        setManualMode(newMode);

        if (newMode) {
            applyLowBandwidthMode();
        } else {
            document.body.classList.remove('low-bandwidth-mode');
        }
    };

    if (!isLowBW && !manualMode) {
        return null;
    }

    return (
        <div className="low-bandwidth-indicator">
            <div className="low-bandwidth-content">
                <span className="low-bandwidth-icon">📶</span>
                <div className="low-bandwidth-text">
                    <strong>Low Bandwidth Mode</strong>
                    <p>Images and videos optimized for {quality} connection</p>
                </div>
                <button
                    className="low-bandwidth-toggle"
                    onClick={toggleManualMode}
                    title={manualMode ? "Disable low bandwidth mode" : "Enable low bandwidth mode"}
                >
                    {manualMode ? 'Disable' : 'Keep On'}
                </button>
            </div>
        </div>
    );
};

export default LowBandwidthMode;
