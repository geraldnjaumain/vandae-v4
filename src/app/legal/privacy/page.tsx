import { Typography } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
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
                    <Typography variant="h1" className="mb-6">Privacy Policy</Typography>

                    <p className="text-slate-600 mb-8">
                        <strong>Effective Date:</strong> December 14, 2025<br />
                        <strong>Last Updated:</strong> December 14, 2025
                    </p>

                    <p className="lead">
                        At Vadae ("we," "us," or "our"), we are committed to protecting your privacy.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your
                        information when you use our student organization platform.
                    </p>

                    <h2>1. Information We Collect</h2>

                    <h3>1.1 Personal Information</h3>
                    <p>
                        When you create an account, we collect:
                    </p>
                    <ul>
                        <li><strong>Account Information:</strong> Full name, email address, password (encrypted)</li>
                        <li><strong>Profile Information:</strong> University name, major, interests, profile picture</li>
                        <li><strong>Academic Data:</strong> Class schedules, assignment deadlines, uploaded files</li>
                    </ul>

                    <h3>1.2 Usage Information</h3>
                    <p>
                        We automatically collect certain information when you use Vadae:
                    </p>
                    <ul>
                        <li>Device information (browser type, operating system)</li>
                        <li>IP address and general location data</li>
                        <li>Pages visited and features used</li>
                        <li>Timestamps and session duration</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>

                    <p>We use the collected information to:</p>
                    <ul>
                        <li><strong>Provide Services:</strong> Deliver timetable management, resource storage, and community features</li>
                        <li><strong>Personalization:</strong> Match you with relevant study communities based on your interests</li>
                        <li><strong>Communication:</strong> Send important updates, notifications, and support responses</li>
                        <li><strong>Improvement:</strong> Analyze usage patterns to enhance our platform</li>
                        <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
                    </ul>

                    <h2>3. Third-Party Services</h2>

                    <p>
                        Vadae uses the following third-party services to provide our platform.
                        By using Vadae, you acknowledge and consent to data processing by these services:
                    </p>

                    <h3>3.1 Supabase (Data Storage)</h3>
                    <p>
                        We use <strong>Supabase</strong> as our primary database and authentication provider.
                    </p>
                    <ul>
                        <li><strong>Data Stored:</strong> All user profiles, timetables, resources, community posts, and tasks</li>
                        <li><strong>Location:</strong> Data is stored on Supabase's secure cloud infrastructure</li>
                        <li><strong>Security:</strong> Supabase employs industry-standard encryption (AES-256) and Row-Level Security (RLS)</li>
                        <li><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">https://supabase.com/privacy</a></li>
                    </ul>

                    <h3>3.2 OpenAI (AI-Powered Features)</h3>
                    <p>
                        We use <strong>OpenAI's GPT-4</strong> for our Pro feature: Syllabus Parsing.
                    </p>
                    <ul>
                        <li><strong>Data Processed:</strong> Text extracted from uploaded syllabus PDFs</li>
                        <li><strong>Purpose:</strong> To automatically extract assignment deadlines and exam dates</li>
                        <li><strong>Data Retention:</strong> OpenAI does not store your data for training purposes when using the API</li>
                        <li><strong>Privacy:</strong> We only send the text content of syllabi, not personal identifiers</li>
                        <li><strong>Privacy Policy:</strong> <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer">https://openai.com/privacy</a></li>
                    </ul>

                    <h3>3.3 Stripe (Payment Processing)</h3>
                    <p>
                        If you subscribe to Vadae Pro, we use <strong>Stripe</strong> for secure payment processing.
                    </p>
                    <ul>
                        <li><strong>Data Collected:</strong> Payment card information, billing address</li>
                        <li><strong>Security:</strong> Stripe is PCI-DSS Level 1 certified (highest security standard)</li>
                        <li><strong>Storage:</strong> We do NOT store your payment card details; Stripe handles all sensitive data</li>
                        <li><strong>Privacy Policy:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">https://stripe.com/privacy</a></li>
                    </ul>

                    <h2>4. Data Sharing and Disclosure</h2>

                    <h3>4.1 Within Vadae Communities</h3>
                    <p>
                        Certain information is visible to other users:
                    </p>
                    <ul>
                        <li><strong>Public Profile:</strong> Your name, university, major, and interests are visible to all users</li>
                        <li><strong>Community Posts:</strong> Posts you create in communities are visible to all community members</li>
                        <li><strong>Shared Resources:</strong> Files marked as "public" can be viewed by community members</li>
                    </ul>

                    <h3>4.2 Legal Requirements</h3>
                    <p>
                        We may disclose your information if required by law, including:
                    </p>
                    <ul>
                        <li>Compliance with legal processes (subpoenas, court orders)</li>
                        <li>Protection of our rights and property</li>
                        <li>Prevention of fraud or illegal activities</li>
                        <li>Emergency situations involving safety risks</li>
                    </ul>

                    <h3>4.3 We Do NOT Sell Your Data</h3>
                    <p>
                        <strong>We will never sell, rent, or trade your personal information to third parties for marketing purposes.</strong>
                    </p>

                    <h2>5. Data Retention</h2>

                    <p>
                        We retain your information for as long as your account is active or as needed to provide services:
                    </p>
                    <ul>
                        <li><strong>Active Accounts:</strong> Data is retained indefinitely while your account is active</li>
                        <li><strong>Deleted Accounts:</strong> Upon account deletion, most data is permanently removed within 30 days</li>
                        <li><strong>Backup Copies:</strong> Encrypted backups may be retained for up to 90 days for disaster recovery</li>
                        <li><strong>Legal Obligations:</strong> Some data may be retained longer if required by law</li>
                    </ul>

                    <h2>6. Your Rights and Choices</h2>

                    <p>You have the following rights regarding your data:</p>

                    <h3>6.1 Access and Portability</h3>
                    <ul>
                        <li>Request a copy of your personal data in a machine-readable format</li>
                        <li>Access your profile and activity through your account settings</li>
                    </ul>

                    <h3>6.2 Correction and Update</h3>
                    <ul>
                        <li>Update your profile information at any time through Settings</li>
                        <li>Correct inaccurate data by contacting support</li>
                    </ul>

                    <h3>6.3 Deletion</h3>
                    <ul>
                        <li>Delete your account at any time through Settings → Delete Account</li>
                        <li>Request deletion of specific data by contacting support@vadae.com</li>
                    </ul>

                    <h3>6.4 Opt-Out</h3>
                    <ul>
                        <li>Unsubscribe from marketing emails via the link in each email</li>
                        <li>Disable notifications in your account settings</li>
                    </ul>

                    <h2>7. Data Security</h2>

                    <p>
                        We implement industry-standard security measures to protect your information:
                    </p>
                    <ul>
                        <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
                        <li><strong>Authentication:</strong> Secure password hashing with bcrypt</li>
                        <li><strong>Access Control:</strong> Row-Level Security (RLS) ensures users only access their own data</li>
                        <li><strong>Monitoring:</strong> Continuous monitoring for security threats and anomalies</li>
                        <li><strong>Regular Updates:</strong> Security patches applied promptly</li>
                    </ul>

                    <p>
                        <strong>Note:</strong> While we implement strong security measures, no system is 100% secure.
                        You are responsible for maintaining the confidentiality of your password.
                    </p>

                    <h2>8. Children's Privacy</h2>

                    <p>
                        Vadae is intended for students aged 18 and older. We do not knowingly collect
                        information from individuals under 18. If we discover that we have collected
                        information from someone under 18, we will delete it immediately.
                    </p>

                    <h2>9. International Data Transfers</h2>

                    <p>
                        Your information may be transferred to and processed in countries other than your own.
                        Supabase's data centers are located globally. By using Vadae, you consent to such transfers.
                    </p>

                    <h2>10. Changes to This Policy</h2>

                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of significant
                        changes by:
                    </p>
                    <ul>
                        <li>Posting the updated policy on this page</li>
                        <li>Updating the "Last Updated" date</li>
                        <li>Sending an email notification for material changes</li>
                    </ul>

                    <p>
                        Your continued use of Vadae after changes indicates acceptance of the updated policy.
                    </p>

                    <h2>11. Contact Us</h2>

                    <p>
                        If you have questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <ul>
                        <li><strong>Email:</strong> privacy@vadae.com</li>
                        <li><strong>Support:</strong> support@vadae.com</li>
                        <li><strong>Mail:</strong> Vadae Student OS, 123 Campus Ave, Suite 100, City, State 12345</li>
                    </ul>

                    <hr className="my-8" />

                    <p className="text-sm text-slate-600">
                        By using Vadae, you acknowledge that you have read and understood this Privacy Policy
                        and agree to its terms. If you do not agree, please discontinue use of our platform.
                    </p>

                    <div className="mt-8">
                        <Link href="/legal/terms" className="text-blue-600 hover:underline">
                            View Terms of Service →
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    )
}
