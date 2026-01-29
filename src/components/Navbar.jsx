import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import logo from '../assets/logo.png';

function Navbar() {
    return (
        <nav className="bg-motorx-black border-b border-motorx-gray-800 sticky top-0 z-50 backdrop-blur-xl bg-motorx-black/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <img src={logo} alt="MotorX" className="h-10 w-auto" />
                        <span className="text-2xl font-extrabold tracking-tighter uppercase italic transform -skew-x-12">
                            Motor<span className="text-motorx-red">X</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-motorx-white hover:text-motorx-red transition-colors">
                            Home
                        </Link>
                        <Link to="/dispatch" className="text-motorx-white hover:text-motorx-red transition-colors">
                            Dispatch
                        </Link>
                        <Link to="/single-bid" className="text-motorx-white hover:text-motorx-red transition-colors">
                            Single Bid
                        </Link>
                        <Link to="/subscription" className="text-motorx-white hover:text-motorx-red transition-colors">
                            Subscription
                        </Link>
                        <Link to="/blog" className="text-motorx-white hover:text-motorx-red transition-colors">
                            Blog
                        </Link>
                        <Link to="/contact" className="text-motorx-white hover:text-motorx-red transition-colors">
                            Contact
                        </Link>
                    </div>

                    {/* Client Portal Button */}
                    <a
                        href="https://app.motorx.com/account/signin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-red text-white font-semibold rounded-lg shadow-glow-red hover:scale-105 transition-transform"
                    >
                        <User className="h-5 w-5" />
                        <span className="hidden sm:inline">Client Portal</span>
                    </a>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
