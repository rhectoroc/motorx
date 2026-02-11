import { Link } from 'react-router-dom';
import { Shield, FileText, Lock } from 'lucide-react';

function Terms() {
    return (
        <div className="min-h-screen bg-motorx-black text-motorx-white py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <FileText className="w-16 h-16 text-motorx-red mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-motorx-gray-300">Last Updated: February 11, 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-motorx-gray-200">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing and using MotorX services, you accept and agree to be bound by the terms and provision of this agreement.
                            If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Services Description</h2>
                        <p className="mb-4">
                            MotorX provides comprehensive automotive logistics and transportation services, including but not limited to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Vehicle auction subscription and bidding services</li>
                            <li>Dispatch and transportation coordination</li>
                            <li>International shipping and customs clearance</li>
                            <li>Title processing and documentation services</li>
                            <li>Vehicle dismantling and parts services</li>
                            <li>Financial consultation and advisory services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Obligations</h2>
                        <p className="mb-4">As a user of MotorX services, you agree to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Comply with all applicable federal, state, and local laws</li>
                            <li>Not use our services for any illegal or unauthorized purpose</li>
                            <li>Pay all fees and charges associated with your use of our services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Payment Terms</h2>
                        <p className="mb-4">
                            All fees are quoted in U.S. Dollars and are subject to change with 30 days notice.
                            Payment is due upon receipt of invoice unless otherwise agreed in writing.
                            Late payments may incur interest charges at the rate of 1.5% per month or the maximum rate permitted by law, whichever is less.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
                        <p className="mb-4">
                            MotorX shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                            including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
                            resulting from your access to or use of or inability to access or use the services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Indemnification</h2>
                        <p className="mb-4">
                            You agree to defend, indemnify, and hold harmless MotorX and its licensee and licensors,
                            and their employees, contractors, agents, officers, and directors, from and against any and all claims,
                            damages, obligations, losses, liabilities, costs or debt, and expenses arising from your use of and access to the services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Governing Law</h2>
                        <p className="mb-4">
                            These Terms shall be governed and construed in accordance with the laws of the State of Arkansas, United States,
                            without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved in the
                            courts of Arkansas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
                        <p className="mb-4">
                            We reserve the right to modify or replace these Terms at any time. If a revision is material,
                            we will provide at least 30 days notice prior to any new terms taking effect.
                            What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
                        <p className="mb-4">
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <div className="bg-motorx-gray-900 p-6 rounded-lg border border-motorx-gray-700">
                            <p className="font-semibold">MotorX LLC</p>
                            <p>Email: info@motorxcars.com</p>
                            <p>Phone: +1 (479) 268-8888</p>
                            <p>Address: 1200 S Old Missouri Rd, Springdale, AR 72764</p>
                        </div>
                    </section>
                </div>

                {/* Back to Home */}
                <div className="mt-12 text-center">
                    <Link to="/" className="btn-primary inline-flex items-center gap-2">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Terms;
