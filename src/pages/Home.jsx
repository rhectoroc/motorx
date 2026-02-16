import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { allServices as services, stats, registrationSteps, auctions } from '../data/services';
import heroBackground1 from '../assets/hero-background.jpg';
import heroBackground2 from '../assets/hero-background-2.jpg';
import heroBackground3 from '../assets/hero-background-3.jpg';
import americasLogo from '../assets/auction-logos/Americas Auto Auction.png';
import carmaxLogo from '../assets/auction-logos/CarMax-Logo.png';
import iaaLogo from '../assets/auction-logos/IAA.png';
import manheimLogo from '../assets/auction-logos/Manheim.png';
import acvLogo from '../assets/auction-logos/acv.png';
import adesaLogo from '../assets/auction-logos/adesa.png';
import copartLogo from '../assets/auction-logos/copart white.png';
import edgePipelineLogo from '../assets/auction-logos/edge pipe.png';
import SEO from '../components/SEO';
import LazyVideo from '../components/LazyVideo';
import OptimizedImage from '../components/OptimizedImage';


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function Home() {
    const { t } = useTranslation();
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const [currentBg, setCurrentBg] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const backgrounds = [heroBackground1, heroBackground2, heroBackground3];

    // Array of logos for cleaner rendering
    const auctionLogos = [
        { src: copartLogo, alt: 'Copart' },
        { src: iaaLogo, alt: 'IAA' },
        { src: manheimLogo, alt: 'Manheim' },
        { src: adesaLogo, alt: 'ADESA' },
        { src: acvLogo, alt: 'ACV Auctions' },
        { src: edgePipelineLogo, alt: 'Edge Pipeline' },
        { src: americasLogo, alt: 'Americas Auto Auction' }, // New
        { src: carmaxLogo, alt: 'CarMax' }, // New
    ];

    useEffect(() => {
        // Background carousel with slide effect
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentBg((prev) => (prev + 1) % backgrounds.length);
                setIsTransitioning(false);
            }, 800); // Match transition duration
        }, 6000); // Change every 6 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // GSAP animations - Split title animation with 3-second delay
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                delay: 3 // 3-second delay before animation starts
            });

            // Animate "Logistics" from LEFT
            tl.from('.hero-word-left', {
                opacity: 0,
                x: -200,
                rotationY: -30,
                duration: 0.8,
                ease: 'power3.out',
            });

            // Animate "Cloud" from RIGHT (simultaneous)
            tl.from('.hero-word-right', {
                opacity: 0,
                x: 200,
                rotationY: 30,
                duration: 0.8,
                ease: 'power3.out',
            }, '<'); // '<' means start at the same time as previous animation

            // Animate subtitle words AFTER title completes
            tl.from('.hero-subtitle-word', {
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: 'power2.out',
                stagger: 0.05,
            }); // No overlap, starts after title finishes

            tl.from('.hero-cta', {
                opacity: 0,
                y: 20,
                duration: 0.6,
            }, '-=0.2');
        }, heroRef);

        return () => ctx.revert();
    }, []);

    // Services Section Animations - Separate useEffect
    useEffect(() => {
        const cards = gsap.utils.toArray('.service-card');

        cards.forEach((card, index) => {
            const isEven = index % 2 === 0;

            // Animate service card on scroll
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    end: 'top 20%',
                    toggleActions: 'play none none reverse',
                    markers: false // Set to true for debugging
                },
                opacity: 0,
                x: isEven ? -100 : 100,
                duration: 1,
                ease: 'power3.out'
            });

            // Animate video container with parallax
            const videoContainer = card.querySelector('.video-container');
            if (videoContainer) {
                gsap.to(videoContainer, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    },
                    y: -50,
                    ease: 'none'
                });
            }

            // Stagger animate benefits
            const benefitItems = card.querySelectorAll('.benefit-item');
            if (benefitItems.length > 0) {
                gsap.from(benefitItems, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 70%'
                    },
                    opacity: 0,
                    y: 20,
                    stagger: 0.1,
                    duration: 0.6,
                    ease: 'back.out(1.2)'
                });
            }

            // Animate floating stats
            const floatingStats = card.querySelectorAll('.floating-stat');
            if (floatingStats.length > 0) {
                gsap.from(floatingStats, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 75%'
                    },
                    scale: 0,
                    rotation: 180,
                    opacity: 0,
                    stagger: 0.2,
                    duration: 0.8,
                    ease: 'back.out(1.7)'
                });
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    const getIcon = (iconName) => {
        const Icon = LucideIcons[iconName];
        return Icon ? <Icon className="w-6 h-6" /> : null;
    };

    const handleIndicatorClick = (index) => {
        if (index !== currentBg) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentBg(index);
                setIsTransitioning(false);
            }, 800);
        }
    };



    return (
        <div className="bg-motorx-black">
            <SEO
                title={t('hero.title.logistics') + " " + t('hero.title.cloud')}
                description={t('hero.subtitle')}
            />
            {/* Hero Section with Slide Carousel */}
            <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Carousel Background with Slide + Parallax */}
                <div className="absolute inset-0 z-0">
                    {backgrounds.map((bg, index) => {
                        const offset = index - currentBg;
                        const isActive = index === currentBg;
                        return (
                            <div
                                key={index}
                                className="absolute inset-0 transition-all duration-1000 ease-in-out"
                                style={{
                                    transform: `translateX(${offset * 100}%) scale(${isTransitioning ? 1.05 : 1})`,
                                    filter: isTransitioning ? 'blur(4px)' : 'blur(0px)',
                                    opacity: isActive ? 0.8 : 0.0,
                                }}
                            >
                                <OptimizedImage
                                    src={bg}
                                    alt={`Hero background ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    loading={index === 0 ? "eager" : "lazy"}
                                    fetchpriority={index === 0 ? "high" : undefined}
                                    width={1920}
                                    height={1080}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                    }}
                                />
                            </div>
                        );
                    })}
                    <div className="absolute inset-0 bg-gradient-to-b from-motorx-black/30 via-motorx-black/10 to-motorx-black pointer-events-none"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <h1 ref={titleRef} className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-normal" dir="ltr">
                        {/* "Logistics" slides from LEFT */}
                        {t('hero.title.logistics').split(' ').map((word, i) => (
                            <span key={i} className="hero-word-left inline-block" style={{ display: 'inline-block', marginRight: '0.25em' }}>
                                {word}
                            </span>
                        ))}
                        {/* "Cloud" slides from RIGHT */}
                        <span className="text-motorx-red">
                            {t('hero.title.cloud').split(' ').map((word, i) => (
                                <span key={i} className="hero-word-right inline-block" style={{ display: 'inline-block', marginRight: '0.25em' }}>
                                    {word}
                                </span>
                            ))}
                        </span>
                    </h1>
                    <p className="hero-subtitle text-base sm:text-lg md:text-3xl text-white mb-8 max-w-5xl mx-auto font-medium tracking-wide">
                        {t('hero.subtitle').split(' ').map((word, i) => (
                            <span key={i} className="hero-subtitle-word inline-block" style={{ display: 'inline-block', marginRight: '0.25em' }}>
                                {word}
                            </span>
                        ))}
                    </p>
                    <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">

                        <Link to="/contact" className="btn-secondary">
                            {t('common.contactUs')}
                        </Link>
                    </div>
                </div>

                {/* Carousel Indicators */}
                <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {backgrounds.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleIndicatorClick(index)}
                            className={`transition-all duration-500 min-w-8 min-h-8 flex items-center justify-center ${currentBg === index
                                ? 'bg-motorx-red w-8 h-2'
                                : 'bg-motorx-white/30 hover:bg-motorx-white/50 w-2 h-2'
                                } rounded-full`}
                            aria-label={`Ir a la diapositiva ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-motorx-white/30 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-motorx-white/50 rounded-full mt-2"></div>
                    </div>
                </div>
            </section>

            {/* Services Section - Rediseñada con Marketing Moderno */}
            <section className="py-32 px-4 bg-gradient-to-b from-motorx-black via-motorx-gray-900 to-motorx-black relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-motorx-red rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-motorx-red rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-7xl font-bold mb-6">
                            {t('services.title.main')} <span className="text-motorx-red">{t('services.title.accent')}</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-motorx-gray-300 max-w-3xl mx-auto">
                            {t('services.subtitle')}
                        </p>
                    </div>

                    {/* Services Grid - Alternating Layout */}
                    <div className="space-y-32">
                        {services.map((service, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <div
                                    key={service.id}
                                    className={`service-card flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                                        } gap-12 items-center`}
                                >
                                    {/* Visual Side - Icon + Stats */}
                                    <div className="w-full lg:w-1/2">
                                        <div className="relative video-container">
                                            {/* Video Background with Icon Overlay */}
                                            <div className="w-full md:max-w-sm h-64 mx-auto relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-motorx-red to-motorx-red-dark rounded-3xl rotate-6 blur-2xl opacity-30 animate-pulse"></div>
                                                <div className="relative glass-card w-full h-full rounded-3xl overflow-hidden transform hover:scale-110 transition-transform duration-500">
                                                    {/* Video Background */}
                                                    <LazyVideo
                                                        src={
                                                            index === 0 ? "/Auction.webm" :
                                                                index === 1 ? "/Dispatch.webm" :
                                                                    index === 2 ? "/shiping_v2.webm" :
                                                                        index === 3 ? "/Tittle.webm" :
                                                                            index === 4 ? "/Desmanttling.webm" :
                                                                                index === 5 ? "/Consultation.webm" :
                                                                                    index === 6 ? "/Air Freight.webm" :
                                                                                        index === 7 ? "/roro.webm" :
                                                                                            "/Auction.webm"
                                                        }

                                                        className="absolute inset-0 w-full h-full object-cover opacity-100"
                                                        type="video/webm"
                                                    />
                                                </div>
                                            </div>


                                            {/* Stats Badges - Conditional rendering */}
                                            {t(`services.${service.id}.stats`, { returnObjects: true }) && (
                                                <>
                                                    <div className="floating-stat scale-75 md:scale-100 absolute -top-8 -end-8 glass-card px-6 py-4 rounded-2xl animate-float">
                                                        <div className="text-lg font-bold text-motorx-red">{t(`services.${service.id}.stats.stat1`)}</div>
                                                    </div>
                                                    <div className="floating-stat scale-75 md:scale-100 absolute -bottom-8 -start-8 glass-card px-6 py-4 rounded-2xl animate-float-delayed">
                                                        <div className="text-lg font-bold text-motorx-red">{t(`services.${service.id}.stats.stat2`)}</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="w-full lg:w-1/2">
                                        {/* Badge */}
                                        <div className="inline-block mb-4 px-4 py-1 bg-motorx-red/20 border border-motorx-red rounded-full">
                                            <span className="text-motorx-red text-sm font-semibold uppercase tracking-wider">
                                                {t(`services.${service.id}.subtitle`)}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-motorx-white to-motorx-gray-300 bg-clip-text text-transparent">
                                            {t(`services.${service.id}.title`)}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-lg text-motorx-gray-300 mb-8 leading-relaxed">
                                            {t(`services.${service.id}.description`)}
                                        </p>

                                        {/* Tag (if exists) */}
                                        {t(`services.${service.id}.tag`, { defaultValue: '' }) && (
                                            <div className="inline-block mr-8 mb-6 px-6 py-2 shimmer-effect text-motorx-red text-sm font-bold rounded-full shadow-lg shadow-motorx-red/10 border border-motorx-red/30 uppercase tracking-wider backdrop-blur-sm">
                                                {t(`services.${service.id}.tag`)}
                                            </div>
                                        )}

                                        <a
                                            href={service.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary group inline-flex items-center mb-6"
                                        >
                                            {t(`services.${service.id}.button`)}
                                            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform rtl:rotate-180" />
                                        </a>

                                        {/* Footer */}
                                        <div className="mt-6 pt-6 border-t border-motorx-gray-800 text-sm text-motorx-gray-400">
                                            {t(`services.${service.id}.footer`)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    {/* CTA Banner */}
                    <div className="mt-32 text-center">
                        <div className="glass-card p-12 rounded-3xl bg-gradient-to-br from-motorx-red/10 to-transparent border-2 border-motorx-red/30">
                            <h3 className="text-3xl md:text-4xl font-bold mb-4">
                                {t('services.cta.title')}
                            </h3>
                            <p className="text-xl text-motorx-gray-300 mb-8 max-w-2xl mx-auto">
                                {t('services.cta.subtitle')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/services" className="btn-primary text-lg px-8 py-4">
                                    {t('services.cta.viewAll')}
                                </Link>
                                <Link to="/contact" className="btn-secondary text-lg px-8 py-4">
                                    {t('services.cta.talkToExpert')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Animations */}
                <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float-delayed 3s ease-in-out infinite 1.5s;
          }
        `}</style>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4 bg-motorx-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-motorx-red mb-4 flex justify-center">
                                    {getIcon(stat.icon)}
                                </div>
                                <div className="text-4xl md:text-5xl font-bold text-motorx-red mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-motorx-gray-300">{t(`stats.${stat.id}`)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>





            {/* Auctions Section - Premium Card Marquee */}
            <section className="py-32 px-4 bg-gradient-to-b from-motorx-black via-[#0f0f0f] to-motorx-black overflow-hidden border-b border-motorx-gray-800 relative z-20">
                {/* Background Glow Effects */}
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-motorx-red/10 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-motorx-red/5 rounded-full blur-[150px] pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="max-w-7xl mx-auto text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            {t('auctions.title').split(' ').slice(0, -1).join(' ')} <span className="text-motorx-red">{t('auctions.title').split(' ').slice(-1)}</span>
                        </h2>
                        <p className="text-motorx-gray-300 text-lg max-w-2xl mx-auto">
                            {t('auctions.subtitle')}
                        </p>
                    </div>

                    {/* Premium Card Marquee */}
                    <div className="relative">
                        {/* First Row - Scroll Left */}
                        <div className="marquee-wrapper mb-8">
                            <div className="marquee-track">
                                {/* First copy */}
                                {auctionLogos.map((logo, index) => (
                                    <div
                                        key={`card-1-${index}`}
                                        className="marquee-card group"
                                    >
                                        <div className="glass-card p-8 rounded-2xl border border-motorx-gray-700 hover:border-motorx-red/50 transition-all duration-500 h-32 flex items-center justify-center relative overflow-hidden">
                                            {/* Card Glow on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-motorx-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            <OptimizedImage
                                                src={logo.src}
                                                alt={logo.alt}
                                                className="h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 relative z-10"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {/* Second copy for infinite effect */}
                                {auctionLogos.map((logo, index) => (
                                    <div
                                        key={`card-2-${index}`}
                                        className="marquee-card group"
                                    >
                                        <div className="glass-card p-8 rounded-2xl border border-motorx-gray-700 hover:border-motorx-red/50 transition-all duration-500 h-32 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-motorx-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            <OptimizedImage
                                                src={logo.src}
                                                alt={logo.alt}
                                                className="h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 relative z-10"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Second Row - Scroll Right (reverse) */}
                        <div className="marquee-wrapper-reverse">
                            <div className="marquee-track-reverse">
                                {/* First copy */}
                                {auctionLogos.slice().reverse().map((logo, index) => (
                                    <div
                                        key={`card-rev-1-${index}`}
                                        className="marquee-card group"
                                    >
                                        <div className="glass-card p-8 rounded-2xl border border-motorx-gray-700 hover:border-motorx-red/50 transition-all duration-500 h-32 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-motorx-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            <OptimizedImage
                                                src={logo.src}
                                                alt={logo.alt}
                                                className="h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 relative z-10"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {/* Second copy for infinite effect */}
                                {auctionLogos.slice().reverse().map((logo, index) => (
                                    <div
                                        key={`card-rev-2-${index}`}
                                        className="marquee-card group"
                                    >
                                        <div className="glass-card p-8 rounded-2xl border border-motorx-gray-700 hover:border-motorx-red/50 transition-all duration-500 h-32 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-motorx-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            <OptimizedImage
                                                src={logo.src}
                                                alt={logo.alt}
                                                className="h-16 w-auto object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 relative z-10"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom CSS for Premium Marquee */}
                <style jsx>{`
                    .marquee-wrapper,
                    .marquee-wrapper-reverse {
                        width: 100%;
                        overflow: hidden;
                        position: relative;
                    }

                    .marquee-track {
                        display: flex;
                        gap: 2rem;
                        animation: scroll-left 40s linear infinite;
                        will-change: transform;
                    }

                    .marquee-track-reverse {
                        display: flex;
                        gap: 2rem;
                        animation: scroll-right 40s linear infinite;
                        will-change: transform;
                    }

                    .marquee-card {
                        min-width: 280px;
                        flex-shrink: 0;
                    }

                    @keyframes scroll-left {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }

                    @keyframes scroll-right {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0); }
                    }

                    .marquee-wrapper:hover .marquee-track,
                    .marquee-wrapper-reverse:hover .marquee-track-reverse {
                        animation-play-state: paused;
                    }
                `}</style>
            </section>

            {/* CTA Section - Premium Glow Design with Spotlight Effect */}
            <section className="py-32 px-4 bg-motorx-black relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[500px] bg-motorx-red/20 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <div
                        className="glass-card p-12 md:p-16 rounded-[2.5rem] border border-motorx-red/30 shadow-[0_0_60px_-15px_rgba(220,38,38,0.4)] text-center relative overflow-hidden group hover:border-motorx-red/50 transition-colors duration-500"
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                            e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                        }}
                    >
                        {/* Spotlight Effect */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                                background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(227, 30, 36, 0.15), transparent 40%)'
                            }}
                        ></div>

                        {/* Shimmer Effect on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>

                        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg relative z-10">
                            {t('cta.title')}
                        </h2>
                        <p className="text-xl md:text-2xl mb-10 text-motorx-gray-300 max-w-3xl mx-auto relative z-10">
                            {t('cta.subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center relative z-10">
                            <a
                                href={`mailto:${t('cta.email')}`}
                                className="px-8 py-4 bg-motorx-gray-900/80 hover:bg-motorx-gray-800 text-white rounded-xl border border-motorx-gray-700 hover:border-motorx-red/50 transition-all duration-300 flex items-center gap-3 group/btn backdrop-blur-md"
                                aria-label="Send us an email"
                            >
                                <LucideIcons.Mail className="w-5 h-5 text-motorx-red group-hover/btn:scale-110 transition-transform" />
                                <span className="font-semibold">{t('cta.email')}</span>
                            </a>

                            <Link
                                to="/contact"
                                className="px-8 py-4 bg-gradient-to-r from-motorx-red to-motorx-red-dark hover:from-red-600 hover:to-red-800 text-white rounded-xl shadow-lg shadow-motorx-red/30 hover:shadow-motorx-red/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 font-bold text-lg"
                                aria-label="Navigate to Contact page"
                            >
                                <span>{t('cta.getInTouch')}</span>
                                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
