import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Shield, ArrowRight, Truck } from 'lucide-react';

function Dispatch() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-motorx-black">
            {/* Hero Section */}
            <div className="py-24 px-4 bg-gradient-to-b from-motorx-gray-900 to-motorx-black relative overflow-hidden">
                <div className="absolute top-20 right-0 w-96 h-96 bg-motorx-red/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-3 pk-4 mb-6 rounded-full bg-motorx-red/10 border border-motorx-red/20">
                        <Truck className="w-6 h-6 text-motorx-red mr-2" />
                        <span className="text-motorx-red font-semibold tracking-wide uppercase">MotorX {t('services.dispatch.title')}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-motorx-white mb-6">
                        {t('dispatchPage.title')}
                    </h1>
                    <p className="text-2xl text-motorx-gray-300 mb-8 max-w-3xl mx-auto">
                        {t('dispatchPage.subtitle')}
                    </p>
                    <p className="text-lg text-motorx-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t('dispatchPage.hero.description')}
                    </p>
                    <button className="btn-primary inline-flex items-center gap-2">
                        {t('dispatchPage.cta.button')}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16">{t('dispatchPage.features.title')}</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Speed Feature */}
                        <div className="glass-card p-8 hover:bg-motorx-gray-800/50 transition-colors group">
                            <div className="w-14 h-14 bg-motorx-red/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Clock className="w-7 h-7 text-motorx-red" />
                            </div>
                            <h3 className="text-xl font-bold text-motorx-white mb-3">
                                {t('dispatchPage.features.speed.title')}
                            </h3>
                            <p className="text-motorx-gray-300">
                                {t('dispatchPage.features.speed.desc')}
                            </p>
                        </div>

                        {/* Tracking Feature */}
                        <div className="glass-card p-8 hover:bg-motorx-gray-800/50 transition-colors group">
                            <div className="w-14 h-14 bg-motorx-red/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="w-7 h-7 text-motorx-red" />
                            </div>
                            <h3 className="text-xl font-bold text-motorx-white mb-3">
                                {t('dispatchPage.features.tracking.title')}
                            </h3>
                            <p className="text-motorx-gray-300">
                                {t('dispatchPage.features.tracking.desc')}
                            </p>
                        </div>

                        {/* Insurance Feature */}
                        <div className="glass-card p-8 hover:bg-motorx-gray-800/50 transition-colors group">
                            <div className="w-14 h-14 bg-motorx-red/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-7 h-7 text-motorx-red" />
                            </div>
                            <h3 className="text-xl font-bold text-motorx-white mb-3">
                                {t('dispatchPage.features.insurance.title')}
                            </h3>
                            <p className="text-motorx-gray-300">
                                {t('dispatchPage.features.insurance.desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="py-20 px-4 bg-motorx-gray-900 border-t border-motorx-gray-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-8">{t('dispatchPage.cta.title')}</h2>
                    <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                        {t('dispatchPage.cta.button')}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Dispatch;
