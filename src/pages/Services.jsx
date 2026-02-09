import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { allServices } from '../data/services';

import SEO from '../components/SEO';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function Services() {
    const { t } = useTranslation();
    useEffect(() => {
        // ... existing useEffect ...
    }, []);

    // ... existing helpers ...

    return (
        <div className="bg-motorx-black min-h-screen">
            <SEO
                title={t('servicesPage.hero.title.main')}
                description={t('servicesPage.hero.subtitle')}
                url="/services"
            />
            {/* Hero Section */}
            <section className="relative py-32 px-4 bg-gradient-to-b from-motorx-gray-900 via-motorx-black to-motorx-black overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-motorx-red rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-motorx-red rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="services-hero-title text-5xl md:text-7xl font-bold mb-6">
                        {t('servicesPage.hero.title.main')} <span className="text-motorx-red">{t('servicesPage.hero.title.accent')}</span>
                    </h1>
                    <p className="services-hero-subtitle text-xl md:text-2xl text-motorx-gray-300 max-w-3xl mx-auto">
                        {t('servicesPage.hero.subtitle')}
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="services-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allServices.map((service, index) => (
                            <div
                                key={service.id}
                                className="service-card glass-card p-8 hover:scale-105 hover:shadow-2xl hover:shadow-motorx-red/20 transition-all duration-500 group flex flex-col relative overflow-hidden"
                            >
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-motorx-red/0 via-motorx-red/5 to-motorx-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                {/* Content */}
                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Icon & Title */}
                                    <div className="text-motorx-red mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                                        {getIcon(service.icon)}
                                    </div>
                                    <h3 className="text-3xl font-bold mb-2 group-hover:text-motorx-red transition-colors perspective-1000">
                                        {splitText(t(`services.${service.id}.title`))}
                                    </h3>
                                    <div className="text-motorx-red text-sm mb-4 uppercase tracking-wider">
                                        {t(`services.${service.id}.subtitle`).split('').map((char, i) => (
                                            <span key={i} className="service-subtitle-char inline-block whitespace-pre" style={{ opacity: 0.8 }}>
                                                {char}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-motorx-gray-300 mb-6 flex-grow leading-relaxed">{t(`services.${service.id}.description`)}</p>

                                    {/* Features */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-3 text-motorx-white flex flex-row items-center gap-2">
                                            {(() => {
                                                const FeatureIcon = LucideIcons[service.icon] || Check;
                                                return <FeatureIcon className="w-5 h-5 text-motorx-red rtl:order-last" />;
                                            })()}
                                            <span className="rtl:order-first">{t('common.features')}</span>
                                        </h4>
                                        <ul className="space-y-2">
                                            {Object.values(t(`services.${service.id}.features`, { returnObjects: true }) || {}).map((feature, idx) => (
                                                <li key={idx} className="feature-item flex flex-row items-start text-sm text-motorx-gray-300 gap-2 group/item">
                                                    <Check className="w-4 h-4 text-motorx-red mt-0.5 flex-shrink-0 rtl:order-last" />
                                                    <span className="rtl:order-first group-hover/item:text-white transition-colors">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Benefits */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-3 text-motorx-white flex flex-row items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-motorx-red rtl:order-last" />
                                            <span className="rtl:order-first">{t('common.benefits')}</span>
                                        </h4>
                                        <ul className="space-y-2">
                                            {Object.values(t(`services.${service.id}.benefits`, { returnObjects: true }) || {}).map((benefit, idx) => (
                                                <li key={idx} className="feature-item flex flex-row items-start text-sm text-motorx-gray-300 gap-2 group/item">
                                                    <Check className="w-4 h-4 text-motorx-red mt-0.5 flex-shrink-0 rtl:order-last" />
                                                    <span className="rtl:order-first group-hover/item:text-white transition-colors">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-auto flex justify-center">
                                        <a
                                            href={service.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary w-fit px-8 py-2 text-center group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-motorx-red/50 transition-all flex items-center justify-center gap-2"
                                        >
                                            {t('common.learnMore')}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform rtl:rotate-180" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-motorx-black to-motorx-gray-900">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        {t('servicesPage.cta.title.main')} <span className="text-motorx-red">{t('servicesPage.cta.title.accent')}</span>?
                    </h2>
                    <p className="text-xl text-motorx-gray-300 mb-8">
                        {t('servicesPage.cta.subtitle')}
                    </p>
                    <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                        {t('servicesPage.cta.button')}
                        <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default Services;
