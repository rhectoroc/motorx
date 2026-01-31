import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MousePointerClick, Gavel, Car, ArrowRight } from 'lucide-react';

function SingleBid() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-motorx-black">
            <div className="py-24 px-4 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-6xl font-bold text-motorx-white mb-6">
                        {t('singleBidPage.title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-motorx-gray-300 max-w-3xl mx-auto">
                        {t('singleBidPage.subtitle')}
                    </p>
                </div>

                {/* Steps */}
                <div className="mb-24">
                    <h2 className="text-3xl font-bold text-center mb-16 text-motorx-white">{t('singleBidPage.steps.title')}</h2>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-motorx-red/30 to-transparent -translate-y-1/2 z-0"></div>

                        {/* Step 1 */}
                        <div className="glass-card p-8 relative z-10 text-center hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-motorx-black border-2 border-motorx-red rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-motorx-red shadow-lg shadow-motorx-red/20">
                                <Car className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-motorx-white mb-4">Step 1</h3>
                            <p className="text-motorx-gray-300">
                                {t('singleBidPage.steps.step1')}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="glass-card p-8 relative z-10 text-center hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-motorx-black border-2 border-motorx-red rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-motorx-red shadow-lg shadow-motorx-red/20">
                                <MousePointerClick className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-motorx-white mb-4">Step 2</h3>
                            <p className="text-motorx-gray-300">
                                {t('singleBidPage.steps.step2')}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="glass-card p-8 relative z-10 text-center hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-20 h-20 bg-motorx-black border-2 border-motorx-red rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-motorx-red shadow-lg shadow-motorx-red/20">
                                <Gavel className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-motorx-white mb-4">Step 3</h3>
                            <p className="text-motorx-gray-300">
                                {t('singleBidPage.steps.step3')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link to="/contact" className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg">
                        {t('singleBidPage.cta.button')}
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SingleBid;
