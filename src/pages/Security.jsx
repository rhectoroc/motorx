import { Link } from 'react-router-dom';
import { Lock, Shield, Key, AlertTriangle } from 'lucide-react';

function Security() {
    return (
        <div className="min-h-screen bg-motorx-black text-motorx-white py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <Lock className="w-16 h-16 text-motorx-red mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Security Policy</h1>
                    <p className="text-motorx-gray-300">Last Updated: February 11, 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-motorx-gray-200">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Our Commitment to Security</h2>
                        <p className="mb-4">
                            At MotorX, we take the security of your data seriously. We implement industry-leading security measures
                            to protect your personal information, financial data, and business transactions. This page outlines our
                            security practices and your role in maintaining a secure environment.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-start gap-4 mb-4">
                            <Shield className="w-8 h-8 text-motorx-red flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Data Encryption</h2>
                                <p className="mb-4">We employ multiple layers of encryption to protect your data:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>TLS/SSL Encryption:</strong> All data transmitted between your browser and our servers is encrypted using TLS 1.3</li>
                                    <li><strong>Data at Rest:</strong> All stored data is encrypted using AES-256 encryption</li>
                                    <li><strong>Database Encryption:</strong> Sensitive database fields are encrypted with additional layers of protection</li>
                                    <li><strong>Payment Security:</strong> Payment information is processed through PCI DSS compliant payment processors</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-start gap-4 mb-4">
                            <Key className="w-8 h-8 text-motorx-red flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Access Control</h2>
                                <p className="mb-4">We maintain strict access controls to ensure only authorized personnel can access sensitive data:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Multi-Factor Authentication (MFA):</strong> Required for all employee and client portal access</li>
                                    <li><strong>Role-Based Access Control:</strong> Employees have access only to data necessary for their job functions</li>
                                    <li><strong>Regular Access Reviews:</strong> Quarterly audits of user permissions and access rights</li>
                                    <li><strong>Secure Password Policies:</strong> Enforcement of strong password requirements and regular password rotation</li>
                                    <li><strong>Session Management:</strong> Automatic logout after periods of inactivity</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Infrastructure Security</h2>
                        <p className="mb-4">Our infrastructure is designed with security as a top priority:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Secure Hosting:</strong> Data centers with 24/7 physical security and monitoring</li>
                            <li><strong>Firewall Protection:</strong> Advanced firewall systems to prevent unauthorized access</li>
                            <li><strong>Intrusion Detection:</strong> Real-time monitoring for suspicious activities</li>
                            <li><strong>DDoS Protection:</strong> Advanced mitigation systems to prevent service disruptions</li>
                            <li><strong>Regular Backups:</strong> Automated daily backups with secure off-site storage</li>
                            <li><strong>Disaster Recovery:</strong> Comprehensive disaster recovery and business continuity plans</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Security Testing and Monitoring</h2>
                        <p className="mb-4">We continuously test and monitor our systems:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Penetration Testing:</strong> Annual third-party security assessments</li>
                            <li><strong>Vulnerability Scanning:</strong> Automated daily scans for security vulnerabilities</li>
                            <li><strong>Security Audits:</strong> Regular internal and external security audits</li>
                            <li><strong>Code Reviews:</strong> Security-focused code reviews for all new features</li>
                            <li><strong>24/7 Monitoring:</strong> Round-the-clock security monitoring and incident response</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Compliance and Certifications</h2>
                        <p className="mb-4">We maintain compliance with industry standards and regulations:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>PCI DSS:</strong> Payment Card Industry Data Security Standard compliance</li>
                            <li><strong>SOC 2 Type II:</strong> Service Organization Control 2 certification (in progress)</li>
                            <li><strong>CCPA:</strong> California Consumer Privacy Act compliance</li>
                            <li><strong>GDPR:</strong> General Data Protection Regulation compliance for international clients</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Employee Security Training</h2>
                        <p className="mb-4">
                            All MotorX employees undergo comprehensive security training:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Mandatory security awareness training upon hire and annually thereafter</li>
                            <li>Phishing simulation exercises to test and improve awareness</li>
                            <li>Data handling and privacy best practices</li>
                            <li>Incident response procedures and protocols</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-start gap-4 mb-4">
                            <AlertTriangle className="w-8 h-8 text-motorx-red flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Incident Response</h2>
                                <p className="mb-4">
                                    In the event of a security incident, we have established procedures to:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Immediately contain and mitigate the incident</li>
                                    <li>Conduct a thorough investigation to determine the scope and impact</li>
                                    <li>Notify affected parties in accordance with applicable laws and regulations</li>
                                    <li>Implement corrective measures to prevent future incidents</li>
                                    <li>Document and report the incident to relevant authorities as required</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Your Role in Security</h2>
                        <p className="mb-4">Security is a shared responsibility. You can help protect your account by:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Using strong, unique passwords for your MotorX account</li>
                            <li>Enabling multi-factor authentication when available</li>
                            <li>Never sharing your login credentials with others</li>
                            <li>Logging out of your account when using shared computers</li>
                            <li>Keeping your contact information up to date</li>
                            <li>Reporting suspicious activity or security concerns immediately</li>
                            <li>Being cautious of phishing attempts and verifying email sources</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Third-Party Security</h2>
                        <p className="mb-4">
                            We carefully vet all third-party service providers and require them to maintain security standards
                            consistent with our own. All third-party agreements include:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Confidentiality and data protection clauses</li>
                            <li>Security audit rights</li>
                            <li>Breach notification requirements</li>
                            <li>Data processing agreements compliant with applicable regulations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Reporting Security Concerns</h2>
                        <p className="mb-4">
                            If you discover a security vulnerability or have security concerns, please report them immediately:
                        </p>
                        <div className="bg-motorx-gray-900 p-6 rounded-lg border border-motorx-gray-700">
                            <p className="font-semibold mb-2">Security Team Contact:</p>
                            <p>Email: security@motorxcars.com</p>
                            <p>Phone: +1 (479) 268-8888 (24/7 Security Hotline)</p>
                            <p className="mt-4 text-sm text-motorx-gray-400">
                                We appreciate responsible disclosure and will work with security researchers to address any valid concerns.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
                        <p className="mb-4">
                            We regularly review and update our security practices to address emerging threats and incorporate
                            new security technologies. This Security Policy will be updated accordingly, and the "Last Updated"
                            date will reflect the most recent changes.
                        </p>
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

export default Security;
