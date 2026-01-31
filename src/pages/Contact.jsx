import { useTranslation } from 'react-i18next';

function Contact() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-5xl font-bold text-motorx-white mb-8">{t('contactPage.title')}</h1>
                <p className="text-xl text-motorx-gray-300 mb-12">
                    {t('contactPage.subtitle')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold text-motorx-white mb-6">{t('contactPage.form.title')}</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-motorx-gray-300 mb-2">{t('contactPage.form.name')}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-motorx-gray-800 border border-motorx-gray-700 rounded-lg text-motorx-white focus:border-motorx-red"
                                />
                            </div>
                            <div>
                                <label className="block text-motorx-gray-300 mb-2">{t('contactPage.form.email')}</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 bg-motorx-gray-800 border border-motorx-gray-700 rounded-lg text-motorx-white focus:border-motorx-red"
                                />
                            </div>
                            <div>
                                <label className="block text-motorx-gray-300 mb-2">{t('contactPage.form.message')}</label>
                                <textarea
                                    rows="4"
                                    className="w-full px-4 py-2 bg-motorx-gray-800 border border-motorx-gray-700 rounded-lg text-motorx-white focus:border-motorx-red"
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full">
                                {t('contactPage.form.send')}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <div className="glass-card p-8 mb-6">
                            <h3 className="text-xl font-bold text-motorx-white mb-4">{t('contactPage.office.title')}</h3>
                            <p className="text-motorx-gray-300">
                                1815 JIM WALTER DR. SUITE #180<br />
                                TEXARKANA AR 71854
                            </p>
                        </div>
                        <div className="glass-card p-8">
                            <h3 className="text-xl font-bold text-motorx-white mb-4">{t('contactPage.info.title')}</h3>
                            <p className="text-motorx-gray-300">
                                Email: info@motorx.com<br />
                                Phone: (555) 123-4567
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;

