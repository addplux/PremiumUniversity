import { useState, useEffect, useRef } from 'react';

/**
 * Progressive Image Component
 * Loads low-quality placeholder first, then high-quality image
 */
const ProgressiveImage = ({
    src,
    placeholder,
    alt,
    className = '',
    width,
    height,
    onLoad
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder || src);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        // Use Intersection Observer for lazy loading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadImage();
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px' // Start loading 50px before image is visible
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
    }, [src]);

    const loadImage = () => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setImageLoaded(true);
            if (onLoad) onLoad();
        };

        img.onerror = () => {
            console.error('Failed to load image:', src);
        };
    };

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={`progressive-image ${imageLoaded ? 'loaded' : 'loading'} ${className}`}
            width={width}
            height={height}
            loading="lazy"
            style={{
                filter: imageLoaded ? 'none' : 'blur(10px)',
                transition: 'filter 0.3s ease-out'
            }}
        />
    );
};

export default ProgressiveImage;
