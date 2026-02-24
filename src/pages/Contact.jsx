import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import SEO from '../components/SEO';

function Contact() {
    const { t } = useTranslation();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const webhookUrl = import.meta.env.VITE_WEBHOOK_URL || window.env?.VITE_WEBHOOK_URL;

            if (!webhookUrl) {
                console.error("Webhook URL is missing. Please configure VITE_WEBHOOK_URL in environment variables.");
                setSubmitStatus('error');
                setIsSubmitting(false);
                return;
            }

            let recaptchaToken = null;
            if (executeRecaptcha) {
                recaptchaToken = await executeRecaptcha('contact_form');
            } else {
                console.warn('reCAPTCHA script has not loaded yet.');
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    source: 'motorx-web-contact-form',
                    timestamp: new Date().toISOString(),
                    recaptchaToken: recaptchaToken
                }),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-20">
            <SEO
                title={t('contactPage.title')}
                description={t('contactPage.subtitle')}
                url="/contact"
            />
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-5xl font-bold text-motorx-white mb-8">{t('contactPage.title')}</h1>
                <p className="text-xl text-motorx-gray-300 mb-12">
                    {t('contactPage.subtitle')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="glass-card p-8 relative overflow-hidden">
                        {/* Status Overlay */}
                        {submitStatus === 'success' && (
                            <div className="absolute inset-0 bg-motorx-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6 text-center animate-fade-in">
                                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">{t('contactPage.form.successTitle') || 'Message Sent!'}</h3>
                                <p className="text-motorx-gray-300 mb-6">{t('contactPage.form.successMessage') || 'We have received your message and will get back to you shortly.'}</p>
                                <button
                                    onClick={() => setSubmitStatus(null)}
                                    className="btn-primary"
                                >
                                    {t('contactPage.form.sendAnother')}
                                </button>
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-motorx-white mb-6">{t('contactPage.form.title')}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-motorx-gray-300 mb-2">{t('contactPage.form.name')}</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-motorx-gray-800 border border-motorx-gray-700 rounded-lg text-motorx-white focus:border-motorx-red focus:outline-none focus:ring-1 focus:ring-motorx-red transition-colors"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-motorx-gray-300 mb-2">{t('contactPage.form.email')}</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-motorx-gray-800 border border-motorx-gray-700 rounded-lg text-motorx-white focus:border-motorx-red focus:outline-none focus:ring-1 focus:ring-motorx-red transition-colors"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-motorx-gray-300 mb-2">{t('contactPage.form.message')}</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 bg-motorx-gray-800 border border-motorx-gray-700 rounded-lg text-motorx-white focus:border-motorx-red focus:outline-none focus:ring-1 focus:ring-motorx-red transition-colors"
                                />
                            </div>

                            {submitStatus === 'error' && (
                                <div className="flex items-center text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {t('contactPage.form.errorMessage') || 'Something went wrong. Please try again.'}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {t('contactPage.form.sending') || 'Sending...'}
                                    </>
                                ) : (
                                    t('contactPage.form.send')
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <div className="glass-card p-8 mb-6">
                            <h3 className="text-xl font-bold text-motorx-white mb-4">{t('contactPage.office.title')}</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-motorx-red text-sm font-bold uppercase tracking-wider mb-1">{t('contactPage.office.arkansas.title')}</p>
                                    <p className="text-motorx-gray-300">
                                        {t('contactPage.office.arkansas.address')}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-motorx-gray-800">
                                    <p className="text-motorx-red text-sm font-bold uppercase tracking-wider mb-1">{t('contactPage.office.wisconsin.title')}</p>
                                    <p className="text-motorx-gray-300">
                                        {t('contactPage.office.wisconsin.address')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-8">
                            <h3 className="text-xl font-bold text-motorx-white mb-4">{t('contactPage.info.title')}</h3>
                            <p className="text-motorx-gray-300">
                                {t('common.footer.email')}: {t('cta.email')}<br />
                                {t('common.footer.phone')}: <a href="https://wa.link/xd8j23" target="_blank" rel="noopener noreferrer" className="hover:text-motorx-red transition-colors" aria-label="Contact us via WhatsApp">{t('cta.phone')}</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;

