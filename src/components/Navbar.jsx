import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import logo from '../assets/logo.png';
import LanguageSelector from './LanguageSelector';

function Navbar() {
    const { t } = useTranslation();

    return (
        <nav className="bg-motorx-black border-b border-motorx-gray-800 sticky top-0 z-50 backdrop-blur-xl bg-motorx-black/90 relative shadow-2xl">
            {/* Gradient fade effect at bottom - more visible */}
            <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-motorx-black via-motorx-black/60 to-transparent pointer-events-none z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img src={logo} alt="MotorX" className="h-12 w-auto" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-motorx-white hover:text-motorx-red transition-colors">
                            {t('nav.home')}
                        </Link>
                        <Link to="/services" className="text-motorx-white hover:text-motorx-red transition-colors">
                            {t('nav.services')}
                        </Link>
                        <Link to="/subscription" className="text-motorx-white hover:text-motorx-red transition-colors">
                            {t('nav.subscription')}
                        </Link>
                        <Link to="/contact" className="text-motorx-white hover:text-motorx-red transition-colors">
                            {t('nav.contact')}
                        </Link>
                    </div>

                    {/* Right Side: Language Selector + Client Portal */}
                    <div className="flex items-center gap-3">
                        <LanguageSelector />

                        {/* Client Portal Button - Icon Only */}
                        <a
                            href="https://motorx-appmx.1bigxc.easypanel.host/account/signin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-12 h-12 bg-gradient-red text-white rounded-lg shadow-glow-red hover:scale-105 transition-transform"
                            title="Client Portal"
                        >
                            <User className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
