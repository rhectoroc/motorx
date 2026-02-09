import { useRef, useEffect, useState } from 'react';

const LazyVideo = ({ src, poster, className, type = "video/webm" }) => {
    const videoRef = useRef(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '200px', // Start loading when 200px from viewport
            }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    return (
        <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            webkit-playsinline="true"
            poster={poster}
            className={className}
        >
            {isIntersecting && <source src={src} type={type} />}
        </video>
    );
};

export default LazyVideo;
