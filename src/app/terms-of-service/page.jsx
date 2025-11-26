import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Users,
  CreditCard,
  XCircle,
  AlertCircle,
  Scale,
  Shield,
  Wallet,
  Camera,
  Undo2,
  FileWarning
} from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mb-4">Terms of Service</h1>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Gawalaty Platform. These Terms of Service ("Terms") govern your access to and use of our website and services. By accessing or using our platform, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p className="text-gray-700 mb-4">
              Please read these Terms carefully. Continued use of the service constitutes acceptance of any updates or changes to these Terms.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800">
                  These Terms apply to all users of the platform including customers, guides, and administrators.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="mb-4">Eligibility</h2>
            <p className="text-gray-700 mb-4">
              You must meet the following requirements to use our services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Be at least 18 years of age (or have parental/guardian consent).</li>
              <li>Have the legal capacity to enter into binding contracts.</li>
              <li>Not be barred from using our services under applicable laws.</li>
              <li>Provide accurate and complete registration information.</li>
              <li>Maintain the security of your account credentials.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Account Registration */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h2>Account Registration & Responsibilities</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-3">Account Creation</h3>
                <p className="text-gray-700 mb-3">When creating an account, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Provide accurate, current, and complete information.</li>
                  <li>Maintain and update your information as necessary.</li>
                  <li>Keep your password secure and confidential.</li>
                  <li>Not share your account credentials with others.</li>
                  <li>Notify us immediately of any unauthorized access.</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3">Account Types</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="mb-2">User Account</h4>
                    <p className="text-gray-700">Standard account for browsing, booking trips, and managing reservations.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="mb-2">Guide Account</h4>
                    <p className="text-gray-700">For certified tour guides to manage trips, dates, and bookings.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="mb-2">Admin Account</h4>
                    <p className="text-gray-700">Administrative access for platform management and oversight.</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3">Account Termination</h3>
                <p className="text-gray-700">
                  We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason we deem necessary to protect our platform and users.
                </p>
                <p className="text-gray-700 mt-2">
                  Certain records (such as financial transaction records) may be retained after account termination for legal and auditing purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking & Payment */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <h2>Booking & Payment Terms</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-3">Booking Process</h3>
                <p className="text-gray-700 mb-3">When you book a trip:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>All booking details must be accurate and complete.</li>
                  <li>Trip availability is subject to confirmation.</li>
                  <li>Prices are subject to change until booking is confirmed.</li>
                  <li>Booking is confirmed once payment is completed via Wallet or other supported payment methods.</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3">Payment</h3>
                <p className="text-gray-700 mb-3">Payment terms include:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Payments may be processed through the Wallet or other supported payment methods.</li>
                  <li>We do not store your full payment credentials.</li>
                  <li>Prices are displayed in EGP unless otherwise stated.</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3">Booking Confirmation</h3>
                <p className="text-gray-700">
                  Once your booking is confirmed, you will receive a confirmation email with booking details. Please review and notify us immediately of any discrepancies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Policy */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-purple-600" />
              </div>
              <h2>Wallet Policy — Deposits & Withdrawals</h2>
            </div>

            <h3 className="mb-3">General Wallet Rules</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Users can deposit funds to their Wallet and use the Wallet to pay for bookings or request withdrawals to their bank/Vodafone Cash accounts.</li>
              <li>Transaction records (deposits, withdrawals, refunds) are retained for auditing and cannot be deleted by users.</li>
              <li>Users may edit transfer information while a deposit request is still pending; finalized transactions are immutable.</li>
            </ul>

            <Separator />

            <h3 className="mt-6 mb-3">Deposit Rules</h3>
            <ul className="list-disc list-inside space-y-3 text-gray-700 ml-4 mb-4">
              <li>
                When submitting a deposit (Bank transfer or Vodafone Cash), the user <strong>must upload a proof-of-transfer image</strong>. Requests without valid proof may be rejected.
              </li>
              <li>
                Only one active deposit request is allowed at a time. You cannot create a new deposit request while another deposit request is pending review.
              </li>
              <li>
                Admins will review the uploaded proof and either approve or reject the deposit. If rejected, the admin will provide a reason which will be visible to the user.
              </li>
            </ul>

            <Separator />

            <h3 className="mt-6 mb-3">Withdrawal Rules</h3>
            <ul className="list-disc list-inside space-y-3 text-gray-700 ml-4 mb-4">
              <li>Only one active withdrawal request is allowed at a time. You cannot create a new withdrawal while another is pending.</li>
              <li>Withdrawal requests are processed by admins; upon approval, the withdrawal will be performed to the requested bank or Vodafone Cash account.</li>
              <li>When a withdrawal is completed, admins will (where applicable) upload confirmation/proof of transfer which the user can view.</li>
            </ul>

            <Separator />

            <h3 className="mt-6 mb-3">Account Deletion & Wallet Balance</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                Account deletion is restricted when the Wallet balance exceeds <strong>10 EGP</strong>. If the balance is below 10 EGP, the remaining amount will be automatically settled and the account will be soft-deleted for auditing and compliance purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation & Refunds */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <h2>Cancellation & Refund Policy</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <h4 className="mb-2 text-green-800">Cancellation while Pending</h4>
                  <p className="text-gray-700">You may cancel a booking while it is still in <strong>Pending</strong> status. In such cases, a full refund will be issued to your Wallet.</p>
                </div>

                <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
                  <h4 className="mb-2 text-amber-800">Cancellation after Confirmation (Limited)</h4>
                  <p className="text-gray-700">
                    For confirmed bookings, cancellation is permitted only if BOTH conditions are met:
                  </p>
                  <ul className="list-disc ml-6 mt-2 text-gray-700">
                    <li>Less than 24 hours have passed since the booking was created, <em>and</em></li>
                    <li>The trip start time is still more than 48 hours away.</li>
                  </ul>
                  <p className="text-gray-700 mt-2">
                    If both conditions hold, a full refund will be issued.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <h4 className="mb-2 text-red-800">After Refund Window</h4>
                  <p className="text-gray-700">Cancellations made after these windows are subject to partial or no refund per the specific trip's policy.</p>
                </div>

                <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded">
                  <h4 className="mb-2 text-indigo-800">Refund Processing</h4>
                  <p className="text-gray-700">Refunds are processed automatically via the Wallet system when applicable. Some refunds may require manual review by admins.</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3">Admin Cancellation (Emergency)</h3>
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <p className="text-red-700 flex items-start gap-2">
                    <Undo2 className="h-5 w-5" />
                    In rare or emergency situations, admins may cancel one or more bookings (including cancelling an entire trip). When the platform initiates such cancellations:
                  </p>
                  <ul className="list-disc ml-6 mt-3 text-red-700">
                    <li>Full refunds will be issued to affected users' Wallets.</li>
                    <li>A notification email will be sent to affected users explaining the reason for cancellation and confirming the refund.</li>
                    <li>Admins will retain booking and transaction records for verification and auditing.</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Conduct */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <h2>User Conduct & Prohibited Activities</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Use the platform for illegal or unauthorized purposes.</li>
                <li>Violate any applicable laws or regulations.</li>
                <li>Infringe on the rights of others.</li>
                <li>Post false, misleading, defamatory, or offensive content.</li>
                <li>Harass, threaten, or intimidate other users.</li>
                <li>Attempt unauthorized access to any part of the platform.</li>
                <li>Interfere with or disrupt the platform's functionality.</li>
                <li>Use automated systems to access the platform without permission.</li>
                <li>Impersonate another person or entity.</li>
                <li>Collect or store personal data about other users without consent.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Reviews, Guides, IP, Liability (brief) */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="mb-4">Reviews, Guide Responsibilities & Intellectual Property</h2>

            <h3 className="mb-2">Reviews</h3>
            <p className="text-gray-700 mb-3">By posting reviews you agree to post honest feedback based on your actual experience. We may remove reviews that violate our guidelines.</p>

            <Separator />

            <h3 className="mt-6 mb-2">Guide Responsibilities</h3>
            <ul className="list-disc ml-4 text-gray-700 mb-3">
              <li>Provide accurate trip information and necessary certifications.</li>
              <li>Deliver services as described and ensure participants' safety.</li>
              <li>Honor confirmed bookings unless exceptional circumstances arise.</li>
            </ul>

            <Separator />

            <h3 className="mt-6 mb-2">Intellectual Property</h3>
            <p className="text-gray-700">
              All content on the platform (text, graphics, logos, images, software) is owned by Gawalaty Platform or its licensors. You may not reproduce or distribute content without written permission.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimers & Liability */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="mb-4">Disclaimers & Limitation of Liability</h2>

            <p className="text-gray-700 mb-3">
              The platform is provided "as is" and "as available" without warranties of any kind. We do not guarantee uninterrupted or error-free service.
            </p>

            <Separator />

            <p className="text-gray-700 mb-3">
              To the maximum extent permitted by law, Gawalaty Platform's liability is limited to the amount you paid for the specific trip. We are not responsible for acts or omissions of third parties, weather events, or force majeure.
            </p>
          </CardContent>
        </Card>

        {/* Indemnification */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="mb-4">Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless Gawalaty Platform and its affiliates from any claims, damages, losses, liabilities, and expenses arising from your use of the platform or violation of these Terms.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5 text-indigo-600" />
              </div>
              <h2>Governing Law & Dispute Resolution</h2>
            </div>

            <p className="text-gray-700">
              These Terms shall be governed by the laws of Egypt. Disputes should first be attempted to be resolved informally; if not resolved, disputes will be submitted to binding arbitration in Cairo, Egypt.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-4">If you have questions about these Terms, please contact us:</p>
            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <div>
                <h4 className="mb-1">Phone</h4>
                <p className="text-gray-700">(+20) 2-XXXX-XXXX</p>
              </div>
              <div>
                <h4 className="mb-1">Email</h4>
                <Link href="mailto:legal@gawalaty.com" className="text-blue-600 hover:underline">legal@gawalaty.com</Link>
              </div>
              <div>
                <h4 className="mb-1">Mail</h4>
                <p className="text-gray-700">
                  Gawalaty Platform<br />
                  Legal Department<br />
                  123 Tahrir Square, Cairo, Egypt
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="text-center py-8 space-x-4">
          <Link href="/privacy-policy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
          <span className="text-gray-400">•</span>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>

        <p className="text-center text-gray-500 mt-8">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
      </div>
    </div>
  );
}
