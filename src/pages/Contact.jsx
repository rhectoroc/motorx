function Contact() {
    return (
        <div className="min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-5xl font-bold text-motorx-white mb-8">Contact Us</h1>
                <p className="text-xl text-motorx-gray-300 mb-12">
                    Get in touch with our team.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="glass-card p-8">
                        <h2 className="text-2xl font-bold text-motorx-white mb-6">Send us a message</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-motorx-gray-300 mb-2">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-motorx-gray-800 border border-motorx-gray-700 rounded-lg text-motorx-white focus:border-motorx-red"
                                />
                            </div>
                            <div>
                                <label className="block text-motorx-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 bg-motorx-gray-800 border border-motorx-gray-700 rounded-lg text-motorx-white focus:border-motorx-red"
                                />
                            </div>
                            <div>
                                <label className="block text-motorx-gray-300 mb-2">Message</label>
                                <textarea
                                    rows="4"
                                    className="w-full px-4 py-2 bg-motorx-gray-800 border border-motorx-gray-700 rounded-lg text-motorx-white focus:border-motorx-red"
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full">
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <div className="glass-card p-8 mb-6">
                            <h3 className="text-xl font-bold text-motorx-white mb-4">Office Location</h3>
                            <p className="text-motorx-gray-300">
                                1815 JIM WALTER DR. SUITE #180<br />
                                TEXARKANA AR 71854
                            </p>
                        </div>
                        <div className="glass-card p-8">
                            <h3 className="text-xl font-bold text-motorx-white mb-4">Contact Information</h3>
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
