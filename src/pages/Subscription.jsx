import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, User, Star, ArrowRight } from 'lucide-react';

function Subscription() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-motorx-black">
            {/* Hero */}
            <div className="py-24 px-4 text-center">
                <h1 className="text-5xl md:text-7xl font-bold text-motorx-white mb-6">
                    {t('subscriptionPage.title')}
                </h1>
                <p className="text-xl md:text-2xl text-motorx-gray-300 mb-12 max-w-3xl mx-auto">
                    {t('subscriptionPage.subtitle')}
                </p>
            </div>

            {/* Pricing Plans */}
            <div className="pb-24 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">

                    {/* Starter Plan */}
                    <div className="glass-card p-10 border border-motorx-gray-700 hover:border-motorx-gray-500 transition-colors relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-motorx-gray-500"></div>
                        <h3 className="text-2xl font-bold text-motorx-white mb-2">{t('subscriptionPage.plans.starter.name')}</h3>
                        <div className="flex items-baseline mb-8">
                            <span className="text-4xl font-bold text-motorx-white">{t('subscriptionPage.plans.starter.price')}</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {(t('subscriptionPage.plans.starter.features', { returnObjects: true }) || []).map((feature, i) => (
                                <li key={i} className="flex items-start text-motorx-gray-300">
                                    <Check className="w-5 h-5 text-motorx-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link to="/contact" className="btn-secondary w-full block text-center">
                            {t('subscriptionPage.cta.button')}
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="glass-card p-10 border border-motorx-red transform md:-translate-y-4 shadow-2xl shadow-motorx-red/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-motorx-red text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                            Recommended
                        </div>
                        <h3 className="text-2xl font-bold text-motorx-white mb-2 flex items-center gap-2">
                            {t('subscriptionPage.plans.pro.name')}
                            <Star className="w-5 h-5 text-motorx-red fill-motorx-red" />
                        </h3>
                        <div className="flex items-baseline mb-8">
                            <span className="text-5xl font-bold text-motorx-white">{t('subscriptionPage.plans.pro.price')}</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {(t('subscriptionPage.plans.pro.features', { returnObjects: true }) || []).map((feature, i) => (
                                <li key={i} className="flex items-start text-motorx-white">
                                    <Check className="w-5 h-5 text-motorx-red mr-3 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link to="/contact" className="btn-primary w-full block text-center flex items-center justify-center gap-2">
                            {t('subscriptionPage.cta.button')}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Subscription;
