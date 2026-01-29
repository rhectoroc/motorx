function Footer() {
    return (
        <footer className="bg-motorx-gray-900 border-t border-motorx-gray-800 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-motorx-red font-bold text-lg mb-4">MotorX LLC</h3>
                        <p className="text-motorx-gray-300 text-sm">
                            1815 JIM WALTER DR. SUITE #180<br />
                            TEXARKANA AR 71854
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-motorx-white font-bold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="/dispatch" className="text-motorx-gray-300 hover:text-motorx-red transition-colors">Dispatch</a></li>
                            <li><a href="/single-bid" className="text-motorx-gray-300 hover:text-motorx-red transition-colors">Single Bid</a></li>
                            <li><a href="/subscription" className="text-motorx-gray-300 hover:text-motorx-red transition-colors">Subscription</a></li>
                            <li><a href="/contact" className="text-motorx-gray-300 hover:text-motorx-red transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-motorx-white font-bold text-lg mb-4">Contact Us</h3>
                        <p className="text-motorx-gray-300 text-sm">
                            Email: info@motorx.com<br />
                            Phone: (555) 123-4567
                        </p>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-motorx-gray-800 text-center">
                    <p className="text-motorx-gray-300 text-sm">
                        © {new Date().getFullYear()} MotorX LLC. All rights reserved.
                    </p>
                    <p className="text-motorx-gray-300 text-xs mt-2">
                        Developed by{' '}
                        <a
                            href="https://adrielssystems.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-motorx-red hover:underline"
                        >
                            Adriel's Systems
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
