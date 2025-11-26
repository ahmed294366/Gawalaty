import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Mail, Lock, UserCheck, Database, Eye, FileText } from 'lucide-react';
import { auth } from '@/auth';

export default async function PrivacyPolicyPage() {
    const session = await auth();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="mb-4">Privacy Policy</h1>
                </div>

                {/* Introduction */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <p className="text-gray-700 mb-4">
                            Welcome to our Gawalaty Platform. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website and services, including the Wallet System for deposits and withdrawals.
                        </p>
                        <p className="text-gray-700">
                            By using our platform, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                        </p>
                    </CardContent>
                </Card>

                {/* Information We Collect */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Database className="h-5 w-5 text-blue-600" />
                            </div>
                            <h2>Information We Collect</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="mb-3">Personal Information</h3>
                                <p className="text-gray-700 mb-3">When you register or use our services, we may collect the following personal information:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Full name</li>
                                    <li>Email address</li>
                                    <li>Phone number (optional)</li>
                                    <li>Location information (optional)</li>
                                    <li>Date of birth (optional)</li>
                                    <li>Profile picture (optional)</li>
                                </ul>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="mb-3">Booking Information</h3>
                                <p className="text-gray-700 mb-3">When you book a trip through our platform, we collect:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Trip preferences and selections</li>
                                    <li>Travel dates</li>
                                    <li>Number of travelers</li>
                                    <li>Booking status and history</li>
                                </ul>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="mb-3">Wallet and Payment Information</h3>
                                <p className="text-gray-700 mb-3">For deposits and withdrawals via our Wallet System, we collect:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Deposit or withdrawal amount</li>
                                    <li>Payment method: Vodafone Cash (phone number) or Bank (account details + transaction ID)</li>
                                    <li>Uploaded proof of transfer (image) — accessible only by authorized admins</li>
                                    <li>Reason for admin rejection if applicable, visible to user via Details button</li>
                                    <li>Editable transfer information by the user while request is pending</li>
                                </ul>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="mb-3">User-Generated Content</h3>
                                <p className="text-gray-700 mb-3">We collect content you voluntarily provide, including:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Reviews and ratings of trips</li>
                                    <li>Comments and feedback</li>
                                    <li>Wishlist items</li>
                                    <li>Profile biography (for guides)</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* How We Use Your Information */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <h2>How We Use Your Information</h2>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-700">We use the collected information for the following purposes:</p>

                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                        <span className="text-green-600 text-sm">✓</span>
                                    </div>
                                    <div>
                                        <h4 className="mb-1">Service Provision</h4>
                                        <p className="text-gray-700">To process your bookings, manage your account, and provide trip services</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                        <span className="text-green-600 text-sm">✓</span>
                                    </div>
                                    <div>
                                        <h4 className="mb-1">Wallet Management</h4>
                                        <p className="text-gray-700">To verify deposits and withdrawals, review uploaded proof, approve or reject requests, and allow users to edit pending transfers</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                        <span className="text-green-600 text-sm">✓</span>
                                    </div>
                                    <div>
                                        <h4 className="mb-1">Communication</h4>
                                        <p className="text-gray-700">To notify users about booking confirmations, cancellations, wallet updates, and admin decisions</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                        <span className="text-green-600 text-sm">✓</span>
                                    </div>
                                    <div>
                                        <h4 className="mb-1">Safety and Security</h4>
                                        <p className="text-gray-700">To verify user identity, prevent fraud, and ensure platform security</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                        <span className="text-green-600 text-sm">✓</span>
                                    </div>
                                    <div>
                                        <h4 className="mb-1">Legal Compliance</h4>
                                        <p className="text-gray-700">To comply with legal obligations and enforce our terms of service</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Storage and Security */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Lock className="h-5 w-5 text-purple-600" />
                            </div>
                            <h2>Data Storage and Security</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-3">How We Store Your Data</h3>
                                <p className="text-gray-700 mb-3">
                                    Your personal data and wallet information are securely stored. Proof images of transfers are uploaded to Cloudinary and are accessible only by authorized admins.
                                </p>
                                <p className="text-gray-700 mb-3">
                                    Important financial data (such as deposit and withdrawal amounts, transaction IDs, and account details) are permanently stored in our secure databases for auditing and verification purposes.
                                </p>
                                <p className="text-gray-700">
                                    Users may edit pending wallet requests, but finalized transactions are immutable.
                                </p>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="mb-3">Security Measures</h3>
                                <p className="text-gray-700 mb-3">We implement appropriate security measures to protect your personal information:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                                    <li>Restricted access to personal and financial data</li>
                                    <li>Regular security updates and monitoring</li>
                                    <li>Password protection for your account</li>
                                </ul>
                                <p className="text-gray-700 mt-3">
                                    While we strive to protect your information, no system is completely immune to unauthorized access.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Information Sharing */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Eye className="h-5 w-5 text-orange-600" />
                            </div>
                            <h2>Information Sharing and Disclosure</h2>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-700">We do not sell your personal information to third parties. We may share your information only in the following circumstances:</p>

                            <div className="space-y-3">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="mb-2">With Tour Guides</h4>
                                    <p className="text-gray-700">Your booking information and contact details are shared with the assigned tour guide to facilitate your trip experience.</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="mb-2">Admins (Wallet Operations)</h4>
                                    <p className="text-gray-700">Admins may access financial transfer proofs to approve or reject wallet requests. This information is not shared with other users.</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="mb-2">Legal Requirements</h4>
                                    <p className="text-gray-700">We may disclose your information if required by law, regulation, legal process, or governmental request.</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="mb-2">Business Transfers</h4>
                                    <p className="text-gray-700">In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Your Rights */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h2>Your Rights and Choices</h2>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>

                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                                        <span className="text-indigo-600 text-sm">•</span>
                                    </div>
                                    <div>
                                        <h4 className="mb-1">Access and Update</h4>
                                        <p className="text-gray-700">You can access and update your profile information at any time through your {session?.user && <Link href={`/profile?id=${session?.user?.id}`} className="text-blue-600 hover:underline">account settings</Link>}.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                                        <span className="text-indigo-600 text-sm">•</span>
                                    </div>
                                    <div>
                                        <h4 className="mb-1">Delete Your Account</h4>
                                        <p className="text-gray-700">You have the right to delete your account and all associated data at any time, except for records required for financial and legal auditing.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Wallet-specific additions */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <h2 className="mb-4">Wallet & Account Rules</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>You cannot delete your account if your wallet balance exceeds 10 EGP. If your balance is below 10 EGP, it will be settled and your account will be soft-deleted for auditing purposes.</li>
                            <li>Only one active deposit request and one active withdrawal request are allowed at any given time. You cannot create a new deposit while another deposit is pending, and the same applies to withdrawals.</li>
                            <li>When submitting a deposit (bank or Vodafone Cash), you must upload a proof of transfer image. Admins use this to verify and process your request.</li>
                            <li>Cancellations: A booking can be cancelled while its status is <strong>pending</strong>. For confirmed bookings, cancellations are allowed if made at least 24 hours after booking creation and more than 48 hours before the trip start time; full refunds apply in these cases. Specific refund and cancellation rules are detailed in our Terms of Service.</li>
                            <li>In emergency situations, admins may cancel bookings for safety or operational reasons. In such cases, full refunds will be issued and users will be notified via email.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Cookies and Tracking */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <h2 className="mb-4">Cookies and Tracking Technologies</h2>
                        <p className="text-gray-700 mb-4">
                            We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small data files stored on your device that help us:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                            <li>Remember your login status</li>
                            <li>Store your preferences</li>
                            <li>Analyze site usage and trends</li>
                            <li>Improve platform functionality</li>
                        </ul>
                        <p className="text-gray-700">
                            If you clear or disable them in your browser, you may not be able to log in or use certain features.
                        </p>
                    </CardContent>
                </Card>

                {/* Children's Privacy */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <h2 className="mb-4">Children's Privacy</h2>
                        <p className="text-gray-700">
                            Our services are intended for users who are 18 years of age or older.
                            We do not knowingly provide our services to individuals under the age of 18.
                        </p>
                    </CardContent>
                </Card>

                {/* Changes to Privacy Policy */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <h2 className="mb-4">Changes to This Privacy Policy</h2>
                        <p className="text-gray-700 mb-4">
                            We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                            <li>Posting the updated policy on this page</li>
                            <li>Updating the "Last Updated" date at the top of this policy</li>
                        </ul>
                        <p className="text-gray-700">
                            We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                        </p>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <h2>Contact Us</h2>
                        </div>
                        <p className="text-gray-700 mb-4">
                            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                            <div>
                                <h4 className="mb-1">Email</h4>
                                <p className="text-gray-700">privacy@gawalaty.com</p>
                            </div>
                            <div>
                                <h4 className="mb-1">Mail</h4>
                                <p className="text-gray-700">
                                    Gawalaty Platform<br />
                                    Privacy Department<br />
                                    Cairo, Egypt
                                </p>
                            </div>
                            <div>
                                <h4 className="mb-1">Response Time</h4>
                                <p className="text-gray-700">We aim to respond to all privacy-related inquiries within 48 hours.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Navigation */}
                <div className="text-center py-8">
                    <Link href="/" className="text-blue-600 hover:underline">
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
