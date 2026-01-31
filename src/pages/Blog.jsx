import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowRight } from 'lucide-react';

function Blog() {
    const { t } = useTranslation();

    // Helper to get array of posts IDs
    const postIds = ['1', '2', '3'];

    return (
        <div className="min-h-screen bg-motorx-black py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-motorx-white mb-6 underline decoration-motorx-red decoration-4 underline-offset-8">
                        {t('blogPage.title')}
                    </h1>
                    <p className="text-xl text-motorx-gray-300">
                        {t('blogPage.subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {postIds.map((id, index) => (
                        <div key={id} className="glass-card overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                            {/* Placeholder Image */}
                            <div className="h-48 bg-motorx-gray-800 relative overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-t from-motorx-gray-900 to-transparent opacity-60`}></div>
                                {/* Simple pattern to make it look like an image */}
                                <div className="absolute inset-0 flex items-center justify-center text-motorx-gray-700 text-6xl font-bold opacity-20">
                                    MX-{id}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-4 text-xs text-motorx-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> May {10 + index}, 2025
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" /> MotorX Team
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-motorx-white mb-3 group-hover:text-motorx-red transition-colors">
                                    {t(`blogPage.posts.${id}.title`)}
                                </h3>
                                <p className="text-motorx-gray-300 mb-6 text-sm line-clamp-3">
                                    {t(`blogPage.posts.${id}.excerpt`)}
                                </p>

                                <button className="text-motorx-red font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                    {t('blogPage.readMore')}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Blog;
