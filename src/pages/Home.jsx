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
        // GSAP animations - Choreographed title letters
        const ctx = gsap.context(() => {
            // Create timeline for better control
            const tl = gsap.timeline();

            // Animate ALL letters together with stagger
            tl.from('.hero-letter', {
                opacity: 0,
                y: 80,
                rotationX: -90,
                scale: 0.3,
                duration: 0.6,
                ease: 'back.out(1.5)',
                stagger: 0.025,
            });

            // Infinite animation for subtitle letters
            // Infinite animation for subtitle letters
            gsap.to('.hero-subtitle-letter', {
                opacity: 0.4,
                duration: 1.5,
                repeat: 1,
                yoyo: true,
                stagger: {
                    each: 0.1,
                    repeat: -1,
                    from: "start"
                },
                ease: "sine.inOut"
            });

            tl.from('.hero-cta', {
                opacity: 0,
                y: 20,
                duration: 0.8,
            }, '-=0.5');
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
            gsap.from(card.querySelectorAll('.benefit-item'), {
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

            // Animate floating stats
            gsap.from(card.querySelectorAll('.floating-stat'), {
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
                        return (
                            <div
                                key={index}
                                className="absolute inset-0 transition-all duration-1000 ease-in-out"
                                style={{
                                    transform: `translateX(${offset * 100}%) scale(${isTransitioning ? 1.05 : 1})`,
                                    filter: isTransitioning ? 'blur(4px)' : 'blur(0px)',
                                    opacity: index === currentBg ? 0.8 : 0.0,
                                }}
                            >
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url(${bg})`,
                                    }}
                                />
                            </div>
                        );
                    })}
                    <div className="absolute inset-0 bg-gradient-to-b from-motorx-black/30 via-motorx-black/10 to-motorx-black pointer-events-none"></div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <h1 ref={titleRef} className="hero-title text-5xl md:text-7xl font-bold mb-6 leading-normal" dir="ltr">
                        {t('hero.title.logistics').split('').map((char, i) => (
                            <span key={i} className="hero-letter inline-block" style={{ display: 'inline-block' }}>
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                        <span className="text-motorx-red">
                            {t('hero.title.cloud').split('').map((char, i) => (
                                <span key={i} className="hero-letter hero-letter-red inline-block" style={{ display: 'inline-block' }}>
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            ))}
                        </span>
                    </h1>
                    <p className="hero-subtitle text-xl md:text-3xl text-white mb-8 max-w-5xl mx-auto font-medium tracking-wide">
                        {t('hero.subtitle').split('').map((char, i) => (
                            <span key={i} className="hero-subtitle-letter inline-block" style={{ display: 'inline-block' }}>
                                {char === ' ' ? '\u00A0' : char}
                            </span>
                        ))}
                    </p>
                    <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/subscription" className="btn-primary">
                            {t('common.getStarted')}
                            <ArrowRight className="inline-block ml-2 w-5 h-5 rtl:rotate-180" />
                        </Link>
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
                            className={`transition-all duration-500 ${currentBg === index
                                ? 'bg-motorx-red w-8 h-2'
                                : 'bg-motorx-white/30 hover:bg-motorx-white/50 w-2 h-2'
                                } rounded-full`}
                            aria-label={`Go to slide ${index + 1}`}
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
                                    <div className="lg:w-1/2">
                                        <div className="relative video-container">
                                            {/* Video Background with Icon Overlay */}
                                            <div className="w-80 h-64 md:w-96 md:h-64 mx-auto relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-motorx-red to-motorx-red-dark rounded-3xl rotate-6 blur-2xl opacity-30 animate-pulse"></div>
                                                <div className="relative glass-card w-full h-full rounded-3xl overflow-hidden transform hover:scale-110 transition-transform duration-500">
                                                    {/* Video Background */}
                                                    <video
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                        className={`absolute inset-0 w-full h-full object-cover ${index <= 2 ? 'opacity-100' : 'opacity-20'}`}
                                                    >
                                                        <source src={
                                                            index === 0 ? "/Auction.mp4" :
                                                                index === 1 ? "/Dispatch.mp4" :
                                                                    index === 2 ? "/shiping.mp4" :
                                                                        index === 6 ? "/Dispatch.mp4" : // Air Freight placeholder
                                                                            index === 7 ? "/shiping.mp4" : // RO-RO placeholder
                                                                                "https://assets.mixkit.co/videos/preview/mixkit-new-cars-parked-in-a-row-4044-large.mp4"
                                                        } type="video/mp4" />
                                                    </video>
                                                    {/* Icon Overlay - Solo para servicios que no son Dispatch */}
                                                    {index > 2 && (
                                                        <div className="relative z-10 w-full h-full flex items-center justify-center text-motorx-red">
                                                            {getIcon(service.icon)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>


                                            {/* Stats Badges - Conditional rendering */}
                                            {t(`services.${service.id}.stats`, { returnObjects: true }) && (
                                                <>
                                                    <div className="floating-stat absolute -top-8 -end-8 glass-card px-6 py-4 rounded-2xl animate-float">
                                                        <div className="text-lg font-bold text-motorx-red">{t(`services.${service.id}.stats.stat1`)}</div>
                                                    </div>
                                                    <div className="floating-stat absolute -bottom-8 -start-8 glass-card px-6 py-4 rounded-2xl animate-float-delayed">
                                                        <div className="text-lg font-bold text-motorx-red">{t(`services.${service.id}.stats.stat2`)}</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="lg:w-1/2">
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





            {/* Auctions Section - Marquesina Animada */}
            <section className="py-20 px-4 bg-motorx-gray-900 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        {t('auctions.title').split(' ').slice(0, -1).join(' ')} <span className="text-motorx-red">{t('auctions.title').split(' ').slice(-1)}</span>
                    </h2>
                    <p className="text-motorx-gray-300 text-lg">
                        {t('auctions.subtitle')}
                    </p>
                </div>

                {/* Marquesina Infinita */}
                <div className="relative">
                    <div className="marquee-container">
                        <div className="marquee-content">
                            {/* Primera copia de logos */}
                            {auctionLogos.map((logo, index) => (
                                <img key={`logo-1-${index}`} src={logo.src} alt={logo.alt} className="marquee-logo" />
                            ))}
                            {/* Segunda copia para efecto infinito */}
                            {auctionLogos.map((logo, index) => (
                                <img key={`logo-2-${index}`} src={logo.src} alt={logo.alt} className="marquee-logo" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Custom CSS para marquesina */}
                <style jsx>{`
                    .marquee-container {
                        width: 100%;
                        overflow: hidden;
                        position: relative;
                        background: linear-gradient(90deg, 
                            rgba(23, 23, 23, 1) 0%, 
                            rgba(23, 23, 23, 0) 10%, 
                            rgba(23, 23, 23, 0) 90%, 
                            rgba(23, 23, 23, 1) 100%);
                        padding: 2rem 0;
                    }
                    .marquee-content {
                        display: flex;
                        animation: scroll 30s linear infinite;
                    }
                    .marquee-logo {
                        height: 80px;
                        width: auto;
                        margin: 0 4rem;
                        flex-shrink: 0;
                        filter: brightness(0.9);
                        transition: filter 0.3s;
                    }
                    .marquee-logo:hover {
                        filter: brightness(1.2);
                    }
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .marquee-container:hover .marquee-content {
                        animation-play-state: paused;
                    }
                `}</style>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-motorx-red-dark to-motorx-red">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        {t('cta.title')}
                    </h2>
                    <p className="text-2xl mb-8 opacity-90">
                        {t('cta.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href={`mailto:${t('cta.email')}`} className="btn-secondary border-white hover:bg-white/20">
                            {t('cta.email')}
                        </a>
                        <Link to="/contact" className="btn-secondary border-white hover:bg-white/20">
                            {t('cta.getInTouch')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
