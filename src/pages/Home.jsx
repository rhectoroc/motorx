import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ThreeBackground from '../components/ThreeBackground';

function Home() {
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);

    useEffect(() => {
        // Animación del título con GSAP
        gsap.fromTo(
            titleRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );

        // Animación del subtítulo con blur reveal
        gsap.fromTo(
            subtitleRef.current,
            { opacity: 0, scale: 1.2, filter: 'blur(20px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 2, delay: 0.5, ease: 'power3.out' }
        );
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Three.js Background */}
                <ThreeBackground />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-motorx-gray-900 to-motorx-red/20 opacity-80 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
                    <h1 ref={titleRef} className="text-5xl md:text-7xl font-black text-motorx-white mb-6">
                        Precision in{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-red">Motion</span>
                    </h1>

                    <p ref={subtitleRef} className="text-2xl md:text-4xl text-motorx-gray-300 mb-12">
                        Access Hundreds of Auctions <br />
                        and Hundred Thousands of Vehicles
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/dispatch" className="btn-primary">
                            Get Started
                        </a>
                        <a href="/contact" className="btn-secondary">
                            Contact Us
                        </a>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-motorx-white rounded-full flex justify-center pt-2">
                        <div className="w-1 h-3 bg-motorx-red rounded-full" />
                    </div>
                </div>
            </section>

            {/* Services Section (placeholder) */}
            <section className="py-20 bg-motorx-gray-900">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-motorx-white mb-12">
                        Our Services
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Service cards will go here */}
                        <div className="glass-card p-8 text-center">
                            <h3 className="text-2xl font-bold text-motorx-red mb-4">Dispatch</h3>
                            <p className="text-motorx-gray-300">Fast and reliable vehicle transportation</p>
                        </div>
                        <div className="glass-card p-8 text-center">
                            <h3 className="text-2xl font-bold text-motorx-red mb-4">Single Bid</h3>
                            <p className="text-motorx-gray-300">One-time auction services</p>
                        </div>
                        <div className="glass-card p-8 text-center">
                            <h3 className="text-2xl font-bold text-motorx-red mb-4">Subscription</h3>
                            <p className="text-motorx-gray-300">Recurring services with exclusive benefits</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
