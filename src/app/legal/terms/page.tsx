import { Typography } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Button variant="ghost" className="mb-8" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>

                <article className="prose prose-slate max-w-none">
                    <Typography variant="h1" className="mb-6">Terms of Service</Typography>

                    <p className="text-slate-600 mb-8">
                        <strong>Effective Date:</strong> December 14, 2025<br />
                        <strong>Last Updated:</strong> December 14, 2025
                    </p>

                    <p className="lead">
                        Welcome to Vadae! These Terms of Service ("Terms") govern your use of the Vadae
                        platform. By creating an account or using our services, you agree to be bound by these Terms.
                    </p>

                    <h2>1. Acceptance of Terms</h2>

                    <p>
                        By accessing or using Vadae, you confirm that:
                    </p>
                    <ul>
                        <li>You are at least 18 years old</li>
                        <li>You have the legal capacity to enter into binding contracts</li>
                        <li>You agree to comply with these Terms and all applicable laws</li>
                        <li>You will provide accurate and truthful information</li>
                    </ul>

                    <p>
                        <strong>If you do not agree to these Terms, you must discontinue use of Vadae immediately.</strong>
                    </p>

                    <h2>2. Description of Service</h2>

                    <p>
                        Vadae is a student organization platform that provides:
                    </p>
                    <ul>
                        <li><strong>Timetable Management:</strong> Schedule tracking and reminders</li>
                        <li><strong>Resource Vault:</strong> File storage and organization</li>
                        <li><strong>Study Communities:</strong> Social networking and collaboration tools</li>
                        <li><strong>Task Management:</strong> Assignment and deadline tracking</li>
                        <li><strong>AI Features (Pro):</strong> Automated syllabus parsing and assistance</li>
                    </ul>

                    <p>
                        We reserve the right to modify, suspend, or discontinue any part of the service
                        at any time with or without notice.
                    </p>

                    <h2>3. Account Registration and Security</h2>

                    <h3>3.1 Account Creation</h3>
                    <p>
                        To use Vadae, you must:
                    </p>
                    <ul>
                        <li>Provide a valid email address</li>
                        <li>Create a secure password</li>
                        <li>Complete your profile with accurate information</li>
                        <li>Verify your email address</li>
                    </ul>

                    <h3>3.2 Account Security</h3>
                    <p>
                        You are solely responsible for:
                    </p>
                    <ul>
                        <li>Maintaining the confidentiality of your password</li>
                        <li>All activities that occur under your account</li>
                        <li>Notifying us immediately of any unauthorized access</li>
                    </ul>

                    <p>
                        <strong>We are not liable for any loss or damage arising from your failure to secure your account.</strong>
                    </p>

                    <h3>3.3 One Account Per Person</h3>
                    <p>
                        You may only create one account. Creating multiple accounts may result in suspension or termination.
                    </p>

                    <h2>4. Code of Conduct</h2>

                    <p>
                        <strong>Vadae is committed to fostering a safe, respectful, and inclusive environment for all students.</strong>
                    </p>

                    <h3>4.1 Prohibited Conduct</h3>
                    <p>
                        You agree NOT to:
                    </p>

                    <h4>Harassment and Bullying</h4>
                    <ul>
                        <li><strong className="text-red-600">Bullying, harassment, or intimidation of any kind</strong></li>
                        <li>Threats of violence or harm toward others</li>
                        <li>Hate speech based on race, ethnicity, religion, gender, sexual orientation, or disability</li>
                        <li>Doxxing (sharing private information without consent)</li>
                        <li>Impersonation of others</li>
                    </ul>

                    <h4>Inappropriate Content</h4>
                    <ul>
                        <li>Sexually explicit or pornographic material</li>
                        <li>Graphic violence or gore</li>
                        <li>Content promoting illegal drugs or activities</li>
                        <li>Spam, phishing, or malicious links</li>
                    </ul>

                    <h4>Academic Misconduct</h4>
                    <ul>
                        <li>Sharing or soliciting completed assignments (cheating)</li>
                        <li>Distributing exam questions or answers without authorization</li>
                        <li>Plagiarism or copyright infringement</li>
                    </ul>

                    <h4>Platform Abuse</h4>
                    <ul>
                        <li>Attempting to hack, disrupt, or damage the platform</li>
                        <li>Using bots or automated tools without permission</li>
                        <li>Circumventing security measures or access controls</li>
                        <li>Excessive or abusive use of resources</li>
                    </ul>

                    <h3>4.2 Reporting Violations</h3>
                    <p>
                        If you witness behavior that violates these guidelines, please report it immediately:
                    </p>
                    <ul>
                        <li><strong>Email:</strong> report@vadae.com</li>
                        <li>Include: Your username, the username of the violator, description of the incident, and any evidence (screenshots, links)</li>
                    </ul>

                    <p>
                        All reports are reviewed within 24 hours. We take community safety seriously
                        and will investigate all claims thoroughly.
                    </p>

                    <h2>5. Content Ownership and Licensing</h2>

                    <h3>5.1 Your Content</h3>
                    <p>
                        You retain ownership of all content you upload (files, posts, comments).
                        By uploading content to Vadae, you grant us:
                    </p>
                    <ul>
                        <li>A worldwide, non-exclusive, royalty-free license to store, display, and process your content</li>
                        <li>The right to make backups and provide the service</li>
                        <li>The ability to show your public content to other users (e.g., community posts)</li>
                    </ul>

                    <p>
                        <strong>This license ends when you delete your content or account.</strong>
                    </p>

                    <h3>5.2 Our Content</h3>
                    <p>
                        Vadae's platform design, features, logos, and branding are our intellectual property.
                        You may not copy, modify, or redistribute them without written permission.
                    </p>

                    <h2>6. User-Generated Content Moderation</h2>

                    <p>
                        We reserve the right, but not the obligation, to:
                    </p>
                    <ul>
                        <li>Monitor user-generated content for policy violations</li>
                        <li>Remove content that violates these Terms</li>
                        <li>Moderate community posts and comments</li>
                    </ul>

                    <p>
                        <strong>We are not responsible for user-generated content.</strong> Users are solely
                        responsible for their own posts, comments, and shared files.
                    </p>

                    <h2>7. Termination and Account Suspension</h2>

                    <h3>7.1 Your Right to Terminate</h3>
                    <p>
                        You may delete your account at any time through Settings → Delete Account.
                        Upon deletion:
                    </p>
                    <ul>
                        <li>Your profile and most personal data will be permanently removed within 30 days</li>
                        <li>Your posts and comments may remain but will be anonymized</li>
                        <li>Backups are deleted within 90 days</li>
                    </ul>

                    <h3>7.2 Our Right to Terminate</h3>
                    <p>
                        <strong>We reserve the right to suspend or permanently ban your account,
                            with or without notice, if:</strong>
                    </p>
                    <ul className="text-red-600 font-semibold">
                        <li>You violate these Terms of Service</li>
                        <li>You violate our Code of Conduct (especially bullying or harassment)</li>
                        <li>You engage in illegal activities</li>
                        <li>You provide false or fraudulent information</li>
                        <li>Your account poses a security risk</li>
                        <li>We are required to do so by law</li>
                    </ul>

                    <p>
                        <strong>Banned users are NOT entitled to refunds for Pro subscriptions.</strong>
                    </p>

                    <h3>7.3 Appeals Process</h3>
                    <p>
                        If you believe your account was suspended or terminated in error, you may appeal by:
                    </p>
                    <ul>
                        <li>Emailing appeals@vadae.com within 14 days of termination</li>
                        <li>Providing a detailed explanation and any supporting evidence</li>
                    </ul>

                    <p>
                        Appeals are reviewed within 7 business days. Our decision is final.
                    </p>

                    <h2>8. Paid Services (Vadae Pro)</h2>

                    <h3>8.1 Subscription</h3>
                    <p>
                        Vadae Pro is a premium subscription that includes:
                    </p>
                    <ul>
                        <li>AI-powered syllabus parsing</li>
                        <li>Advanced analytics and insights</li>
                        <li>Priority support</li>
                        <li>Additional storage space</li>
                    </ul>

                    <h3>8.2 Billing and Payments</h3>
                    <ul>
                        <li>Subscriptions are billed monthly or annually in advance</li>
                        <li>Payments are processed securely through Stripe</li>
                        <li>Prices are subject to change with 30 days' notice</li>
                        <li>You must keep valid payment information on file</li>
                    </ul>

                    <h3>8.3 Cancellation and Refunds</h3>
                    <ul>
                        <li>You may cancel your Pro subscription at any time</li>
                        <li>Cancellations take effect at the end of the current billing period</li>
                        <li><strong>No refunds for partial months or unused time</strong></li>
                        <li>Refunds are only provided for billing errors</li>
                    </ul>

                    <h2>9. Disclaimer of Warranties</h2>

                    <p>
                        <strong>Vadae is provided "AS IS" and "AS AVAILABLE" without any warranties, express or implied.</strong>
                    </p>

                    <p>
                        We do NOT guarantee:
                    </p>
                    <ul>
                        <li>Uninterrupted or error-free service</li>
                        <li>Accuracy, completeness, or reliability of content</li>
                        <li>That the platform will meet your specific needs</li>
                        <li>That AI features (syllabus parsing) will be 100% accurate</li>
                        <li>Protection against data loss (though we make reasonable efforts)</li>
                    </ul>

                    <p>
                        <strong>Use Vadae at your own risk. Always maintain backups of important files.</strong>
                    </p>

                    <h2>10. Limitation of Liability</h2>

                    <p>
                        To the maximum extent permitted by law:
                    </p>
                    <ul>
                        <li>Vadae, our team, and partners are NOT liable for any indirect, incidental,
                            special, consequential, or punitive damages</li>
                        <li>Our total liability to you is limited to the amount you paid us in the
                            past 12 months (or $100, whichever is greater)</li>
                        <li>We are NOT responsible for user-generated content or third-party services</li>
                    </ul>

                    <h2>11. Indemnification</h2>

                    <p>
                        You agree to indemnify and hold harmless Vadae from any claims, damages, or expenses
                        (including legal fees) arising from:
                    </p>
                    <ul>
                        <li>Your violation of these Terms</li>
                        <li>Your violation of any law or third-party rights</li>
                        <li>Content you upload or share</li>
                        <li>Your use of the platform</li>
                    </ul>

                    <h2>12. Changes to Terms</h2>

                    <p>
                        We may modify these Terms at any time. We will notify you by:
                    </p>
                    <ul>
                        <li>Posting the updated Terms on this page</li>
                        <li>Updating the "Last Updated" date</li>
                        <li>Sending an email for material changes</li>
                    </ul>

                    <p>
                        <strong>Continued use after changes constitutes acceptance of the new Terms.</strong>
                    </p>

                    <h2>13. Governing Law and Disputes</h2>

                    <p>
                        These Terms are governed by the laws of [Your State/Country].
                        Any disputes will be resolved through:
                    </p>
                    <ul>
                        <li>Good faith negotiation first</li>
                        <li>Binding arbitration if negotiation fails</li>
                        <li>Courts in [Your Jurisdiction] as a last resort</li>
                    </ul>

                    <h2>14. Contact Information</h2>

                    <p>
                        For questions about these Terms:
                    </p>
                    <ul>
                        <li><strong>General Inquiries:</strong> support@vadae.com</li>
                        <li><strong>Legal Matters:</strong> legal@vadae.com</li>
                        <li><strong>Report Violations:</strong> report@vadae.com</li>
                        <li><strong>Appeals:</strong> appeals@vadae.com</li>
                    </ul>

                    <hr className="my-8" />

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
                        <h3 className="text-red-800 font-semibold mb-2">⚠️ Zero Tolerance for Bullying</h3>
                        <p className="text-red-700 text-sm">
                            Vadae has a <strong>zero-tolerance policy</strong> for bullying, harassment,
                            and hate speech. Violations will result in immediate account suspension or
                            permanent ban. We are committed to maintaining a safe, respectful community
                            for all students.
                        </p>
                    </div>

                    <p className="text-sm text-slate-600">
                        By using Vadae, you acknowledge that you have read, understood, and agree to
                        be bound by these Terms of Service. If you do not agree, you must stop using
                        the platform immediately.
                    </p>

                    <div className="mt-8 flex gap-4">
                        <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                            ← Privacy Policy
                        </Link>
                        <Link href="/dashboard" className="text-blue-600 hover:underline">
                            Back to Dashboard →
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    )
}
