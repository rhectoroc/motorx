import { Link } from 'react-router-dom';
import { Shield, Eye, Database, Lock } from 'lucide-react';

function Privacy() {
    return (
        <div className="min-h-screen bg-motorx-black text-motorx-white py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <Shield className="w-16 h-16 text-motorx-red mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-motorx-gray-300">Last Updated: February 11, 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-motorx-gray-200">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p className="mb-4">We collect information that you provide directly to us, including:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Personal Information:</strong> Name, email address, phone number, mailing address</li>
                            <li><strong>Business Information:</strong> Company name, tax ID, business license information</li>
                            <li><strong>Financial Information:</strong> Payment card details, bank account information</li>
                            <li><strong>Vehicle Information:</strong> VIN numbers, vehicle specifications, purchase history</li>
                            <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent on pages</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                        <p className="mb-4">We use the information we collect to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and send related information</li>
                            <li>Send you technical notices, updates, security alerts, and support messages</li>
                            <li>Respond to your comments, questions, and customer service requests</li>
                            <li>Communicate with you about products, services, offers, and events</li>
                            <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing and Disclosure</h2>
                        <p className="mb-4">We may share your information in the following circumstances:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf</li>
                            <li><strong>Business Transfers:</strong> In connection with any merger, sale of assets, or acquisition</li>
                            <li><strong>Legal Requirements:</strong> To comply with legal obligations or respond to lawful requests</li>
                            <li><strong>Protection of Rights:</strong> To protect our rights, privacy, safety, or property</li>
                            <li><strong>With Your Consent:</strong> When you have given us explicit consent to share your information</li>
                        </ul>
                        <p className="mt-4">
                            <strong>We do not sell your personal information to third parties.</strong>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                        <p className="mb-4">
                            We implement appropriate technical and organizational measures to protect your personal information against
                            unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures include:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Encryption of data in transit and at rest using industry-standard protocols</li>
                            <li>Regular security assessments and penetration testing</li>
                            <li>Access controls and authentication mechanisms</li>
                            <li>Employee training on data protection and privacy</li>
                            <li>Incident response and breach notification procedures</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights and Choices</h2>
                        <p className="mb-4">You have the following rights regarding your personal information:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Access:</strong> Request access to your personal information</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                            <li><strong>Opt-Out:</strong> Opt out of marketing communications</li>
                            <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                        </ul>
                        <p className="mt-4">
                            To exercise these rights, please contact us at privacy@motorxcars.com
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking Technologies</h2>
                        <p className="mb-4">
                            We use cookies and similar tracking technologies to collect and track information about your use of our services.
                            You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Children's Privacy</h2>
                        <p className="mb-4">
                            Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information
                            from children under 18. If you become aware that a child has provided us with personal information, please contact us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. California Privacy Rights</h2>
                        <p className="mb-4">
                            If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Right to know what personal information is collected, used, shared, or sold</li>
                            <li>Right to delete personal information</li>
                            <li>Right to opt-out of the sale of personal information</li>
                            <li>Right to non-discrimination for exercising your CCPA rights</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Privacy Policy</h2>
                        <p className="mb-4">
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy
                            on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
                        <p className="mb-4">
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <div className="bg-motorx-gray-900 p-6 rounded-lg border border-motorx-gray-700">
                            <p className="font-semibold">MotorX LLC - Privacy Department</p>
                            <p>Email: privacy@motorxcars.com</p>
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

export default Privacy;
