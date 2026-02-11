import { useState, useEffect } from 'react';

/**
 * OptimizedImage component with WebP support and lazy loading
 * 
 * Features:
 * - Automatic WebP format with fallback to original
 * - Configurable lazy loading (default: lazy)
 * - Support for fetchpriority attribute
 * - Can render as regular img or background div
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {'lazy'|'eager'} props.loading - Loading strategy
 * @param {'high'|'low'|'auto'} props.fetchpriority - Fetch priority hint
 * @param {string} props.className - CSS classes
 * @param {boolean} props.isBackground - Render as background div instead of img
 * @param {Object} props.style - Inline styles
 */
function OptimizedImage({
    src,
    alt = '',
    loading = 'lazy',
    fetchpriority,
    className = '',
    isBackground = false,
    style = {},
    ...props
}) {
    const [imageSrc, setImageSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    // Generate WebP source path
    const getWebPSrc = (originalSrc) => {
        if (!originalSrc) return null;
        // Replace extension with .webp
        return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    };

    const webpSrc = getWebPSrc(src);

    // Handle image load error (fallback to original format)
    const handleError = () => {
        if (!hasError && imageSrc === webpSrc) {
            console.log(`WebP not available for ${src}, falling back to original`);
            setImageSrc(src);
            setHasError(true);
        }
    };

    // Reset error state when src changes
    useEffect(() => {
        setImageSrc(webpSrc || src);
        setHasError(false);
    }, [src, webpSrc]);

    // If rendering as background
    if (isBackground) {
        return (
            <div
                className={className}
                style={{
                    ...style,
                    backgroundImage: `url(${imageSrc})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                role="img"
                aria-label={alt}
                {...props}
            />
        );
    }

    // Regular img tag with picture element for WebP support
    return (
        <picture>
            {webpSrc && !hasError && (
                <source srcSet={webpSrc} type="image/webp" />
            )}
            <img
                src={imageSrc}
                alt={alt}
                loading={loading}
                fetchpriority={fetchpriority}
                className={className}
                style={style}
                onError={handleError}
                {...props}
            />
        </picture>
    );
}

export default OptimizedImage;
