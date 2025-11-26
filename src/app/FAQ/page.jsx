// "use client"
// import { useState } from 'react';
// import Link from 'next/link';
// import { Card, CardContent } from '@/components/ui/card';
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { HelpCircle, Search, CreditCard, Calendar, Shield, User, Star, MapPin, MessageCircle } from 'lucide-react';

// export default function FAQPage() {
//   const [searchTerm, setSearchTerm] = useState('');

//   const faqCategories = [
//     {
//       id: 'booking',
//       title: 'Booking & Reservations',
//       icon: Calendar,
//       color: 'blue',
//       questions: [
//         {
//           question: 'How do I book a trip?',
//           answer: 'To book a trip, browse our available trips on the home page, select the one you\'re interested in, click on view details, choose your preferred date, enter the number of travelers, and click "Book Now". You must be logged in to complete the booking.'
//         },
//         {
//           question: 'Can I book a trip for someone else?',
//           answer: "No, booking for others isn't supported yet."
//         },
//         {
//           question: 'How will I receive my booking confirmation?',
//           answer: 'Once you book the trip, the admin will contact you for payment. After confirming your payment, you will receive a confirmation email with all the trip details, including meeting location, time, what to bring, and guide contact info. You can also view your bookings in your profile.'
//         },
//         {
//           question: 'Can I modify my booking after confirmation?',
//           answer: 'Modifications depend on availability and the trip rules. You can request changes through the admin, subject to the 48-hour policy.'
//         },
//         {
//           question: 'What happens if I miss my booking?',
//           answer: 'If you miss your scheduled trip without prior cancellation, no refund will be issued. Arrive at least 15 minutes before departure.'
//         }
//       ]
//     },
//     {
//       id: 'payment',
//       title: 'Payment & Wallet',
//       icon: CreditCard,
//       color: 'green',
//       questions: [
//         {
//           question: 'What payment methods are available?',
//           answer: 'You can pay via bank transfer or Vodafone Cash. You must provide a picture of the transfer, the transferred amount, and: For Vodafone Cash, your sending phone number. For Bank transfers, the transaction number and bank account details. No transaction image means the deposit is not valid.'
//         },
//         {
//           question: 'Who can see my transfer images?',
//           answer: 'Only the admin can view transfer images. Your privacy is fully protected.'
//         },
//         {
//           question: 'Can I edit my deposit or withdrawal request?',
//           answer: 'If your request is still in pending status, you can edit it. Each edit creates a new record in the transactions table but links to your existing request.'
//         },
//         {
//           question: 'What happens if my deposit or withdrawal is rejected?',
//           answer: 'The admin must provide a reason for rejection. You can view the comment by clicking the "Details" button. You can then modify and resubmit your request if it is still pending.'
//         },
//         {
//           question: 'When will I be charged for a trip?',
//           answer: 'You are charged after booking confirmation. The admin will coordinate with you to complete the payment and update your wallet accordingly.'
//         }
//       ]
//     },
//     {
//       id: 'cancellation',
//       title: 'Cancellation & Refunds',
//       icon: Shield,
//       color: 'red',
//       questions: [
//         {
//           question: 'What is your cancellation policy?',
//           answer: 'For pending bookings, you can cancel freely. For confirmed bookings, cancellation is allowed if it is requested less than 24 hours after booking and the trip is at least 48 hours away. Full refund will be credited to your wallet.'
//         },
//         {
//           question: 'How do I cancel my booking?',
//           answer: 'For pending bookings, you can cancel or modify yourself. For confirmed bookings, send a request to admin. The admin can cancel bookings only for special circumstances. If admin cancels, an email will be sent with support contact and refund credited to your wallet.'
//         },
//         {
//           question: 'Can I reschedule instead of canceling?',
//           answer: 'You can request rescheduling if the original trip is at least 48 hours away. Admin will review and confirm the new date based on availability.'
//         }
//       ]
//     },
//     {
//       id: 'trips',
//       title: 'Trip Information',
//       icon: MapPin,
//       color: 'purple',
//       questions: [
//         {
//           question: 'What is included in the trip price?',
//           answer: 'Price includes guide, transportation, entrance fees, and sometimes meals. Always check trip details before booking.'
//         },
//         {
//           question: 'What should I bring?',
//           answer: 'Items vary by trip type. Generally, comfortable shoes, sun protection, water, and camera.'
//         },
//         {
//           question: 'Are trips suitable for children?',
//           answer: 'Some trips are family-friendly. Check the trip description for age restrictions.'
//         },
//         {
//           question: 'Trip group size?',
//           answer: 'Each date has its own group size limit depending on bookings.'
//         },
//         {
//           question: 'Languages spoken by guides?',
//           answer: 'Most guides speak English; many speak Arabic, French, German. Check guide profile.'
//         }
//       ]
//     },
//     {
//       id: 'account',
//       title: 'Account Management',
//       icon: User,
//       color: 'indigo',
//       questions: [
//         {
//           question: 'How do I create an account?',
//           answer: 'Click "Sign Up", enter details, or use Google/Facebook login.'
//         },
//         {
//           question: 'I forgot my password.',
//           answer: 'Use "Forgot Password" on login page. Follow email instructions to reset.'
//         },
//         {
//           question: 'Can I delete my account?',
//           answer: 'Yes, from profile settings. Deletion removes all data, bookings, and reviews.'
//         },
//         {
//           question: 'Can I have multiple accounts?',
//           answer: 'No, each user should maintain only one account.'
//         }
//       ]
//     },
//     {
//       id: 'safety',
//       title: 'Safety & Security',
//       icon: Shield,
//       color: 'teal',
//       questions: [
//         {
//           question: 'Is my data secure?',
//           answer: 'We use Cloudinary for storing transfer images. Only admins can access these images. Important personal data is always securely stored.'
//         },
//         {
//           question: 'Do you encrypt images?',
//           answer: 'Images are not encrypted but are securely stored on Cloudinary. Data integrity and privacy are preserved.'
//         }
//       ]
//     }
//   ];

//   const filteredCategories = faqCategories.map(category => ({
//     ...category,
//     questions: category.questions.filter(
//       q =>
//         q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         q.answer.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   })).filter(category => category.questions.length > 0);

//   const getCategoryColorClass = (color) => {
//     const colors = {
//       blue: 'bg-blue-100 text-blue-600',
//       green: 'bg-green-100 text-green-600',
//       red: 'bg-red-100 text-red-600',
//       purple: 'bg-purple-100 text-purple-600',
//       indigo: 'bg-indigo-100 text-indigo-600',
//       amber: 'bg-amber-100 text-amber-600',
//       pink: 'bg-pink-100 text-pink-600',
//       teal: 'bg-teal-100 text-teal-600'
//     };
//     return colors[color] || 'bg-gray-100 text-gray-600';
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-5xl mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
//             <HelpCircle className="h-8 w-8 text-blue-600" />
//           </div>
//           <h1 className="mb-4">Frequently Asked Questions</h1>
//           <p className="text-gray-600 mb-8">
//             Find answers about bookings, payments, cancellations, wallet, and security.
//           </p>

//           {/* Search */}
//           <div className="max-w-2xl mx-auto">
//             <div className="relative">
//               <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//               <Input
//                 type="text"
//                 placeholder="Search for questions..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-12 py-6"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Categories */}
//         {filteredCategories.length > 0 ? (
//           <div className="space-y-8">
//             {filteredCategories.map((category) => (
//               <Card key={category.id}>
//                 <CardContent className="p-8">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColorClass(category.color)}`}>
//                       <category.icon className="h-5 w-5" />
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <h2>{category.title}</h2>
//                       <Badge variant="secondary">{category.questions.length}</Badge>
//                     </div>
//                   </div>

//                   <Accordion type="single" collapsible className="space-y-2">
//                     {category.questions.map((faq, index) => (
//                       <AccordionItem key={index} value={`${category.id}-${index}`} className="border rounded-lg px-4">
//                         <AccordionTrigger className="hover:no-underline py-4">
//                           <span className="text-left">{faq.question}</span>
//                         </AccordionTrigger>
//                         <AccordionContent className="text-gray-700 pb-4">
//                           {faq.answer}
//                         </AccordionContent>
//                       </AccordionItem>
//                     ))}
//                   </Accordion>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <Card>
//             <CardContent className="p-12 text-center">
//               <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//               <h3 className="mb-2">No results found</h3>
//               <p className="text-gray-600">
//                 Try different keywords or browse our categories above
//               </p>
//             </CardContent>
//           </Card>
//         )}

//         {/* Still Need Help */}
//         <Card className="mt-12">
//           <CardContent className="p-8 text-center">
//             <h2 className="mb-4">Still need help?</h2>
//             <p className="text-gray-700 mb-6">
//               Can't find the answer? Our support team is here to help.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link
//                 href="/contact"
//                 className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Contact Support
//               </Link>
//               <Link
//                 href="/privacy-policy"
//                 className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Privacy Policy
//               </Link>
//               <Link
//                 href="/terms-of-service"
//                 className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Terms of Service
//               </Link>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Footer Navigation */}
//         <div className="text-center py-8">
//           <Link href="/" className="text-blue-600 hover:underline">
//             Return to Home
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client"
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Search, CreditCard, Calendar, Shield, User, MapPin } from 'lucide-react';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      id: 'booking',
      title: 'Booking & Reservations',
      icon: Calendar,
      color: 'blue',
      questions: [
        { question: 'How do I book a trip?', answer: 'To book a trip, browse our available trips on the home page, select the one you\'re interested in, click on view details, choose your preferred date, enter the number of travelers, and click "Book Now". You must be logged in to complete the booking.' },
        { question: 'Can I book a trip for someone else?', answer: "No, booking for others isn't supported yet." },
        { question: 'How will I receive my booking confirmation?', answer: 'Once you book the trip, the admin will contact you for payment. After confirming your payment, you will receive a confirmation email with all the trip details, including meeting location, time, what to bring, and guide contact info. You can also view your bookings in your profile.' },
        { question: 'Can I modify my booking after confirmation?', answer: 'Modifications depend on availability and the trip rules. You can request changes through the admin, subject to the 48-hour policy.' },
        { question: 'What happens if I miss my booking?', answer: 'If you miss your scheduled trip without prior cancellation, no refund will be issued. Arrive at least 15 minutes before departure.' }
      ]
    },
    {
      id: 'payment',
      title: 'Payment & Wallet',
      icon: CreditCard,
      color: 'green',
      questions: [
        { question: 'What payment methods are available?', answer: 'You can pay via bank transfer or Vodafone Cash. You must provide a picture of the transfer, the transferred amount, and: For Vodafone Cash, your sending phone number. For Bank transfers, the transaction number and bank account details. No transaction image means the deposit is not valid.' },
        { question: 'Who can see my transfer images?', answer: 'Only the admin can view transfer images. Your privacy is fully protected.' },
        { question: 'Can I edit my deposit or withdrawal request?', answer: 'If your request is still in pending status, you can edit it. Each edit creates a new record in the transactions table but links to your existing request.' },
        { question: 'What happens if my deposit or withdrawal is rejected?', answer: 'The admin must provide a reason for rejection. You can view the comment by clicking the "Details" button. You can then modify and resubmit your request if it is still pending.' },
        { question: 'When will I be charged for a trip?', answer: 'You are charged after booking confirmation. The admin will coordinate with you to complete the payment and update your wallet accordingly.' }
      ]
    },
    {
      id: 'cancellation',
      title: 'Cancellation & Refunds',
      icon: Shield,
      color: 'red',
      questions: [
        { question: 'What is your cancellation policy?', answer: 'For pending bookings, you can cancel freely. For confirmed bookings, cancellation is allowed if it is requested less than 24 hours after booking and the trip is at least 48 hours away. Full refund will be credited to your wallet.' },
        { question: 'How do I cancel my booking?', answer: 'For pending bookings, you can cancel or modify yourself. For confirmed bookings, send a request to admin. The admin can cancel bookings only for special circumstances. If admin cancels, an email will be sent with support contact and refund credited to your wallet.' },
        { question: 'Can I reschedule instead of canceling?', answer: 'You can request rescheduling if the original trip is at least 48 hours away. Admin will review and confirm the new date based on availability.' }
      ]
    },
    {
      id: 'trips',
      title: 'Trip Information',
      icon: MapPin,
      color: 'purple',
      questions: [
        { question: 'What is included in the trip price?', answer: 'Price includes guide, transportation, entrance fees, and sometimes meals. Always check trip details before booking.' },
        { question: 'What should I bring?', answer: 'Items vary by trip type. Generally, comfortable shoes, sun protection, water, and camera.' },
        { question: 'Are trips suitable for children?', answer: 'Some trips are family-friendly. Check the trip description for age restrictions.' },
        { question: 'Trip group size?', answer: 'Each date has its own group size limit depending on bookings.' },
        { question: 'Languages spoken by guides?', answer: 'Most guides speak English; many speak Arabic, French, German. Check guide profile.' }
      ]
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: User,
      color: 'indigo',
      questions: [
        { question: 'How do I create an account?', answer: 'Click "Sign Up", enter details, or use Google/Facebook login.' },
        { question: 'I forgot my password.', answer: 'Use "Forgot Password" on login page. Follow email instructions to reset.' },
        { question: 'Can I delete my account?', answer: 'Yes, from profile settings. Deletion removes all data, bookings, and reviews.' },
        { question: 'Can I have multiple accounts?', answer: 'No, each user should maintain only one account.' }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      teal: 'bg-teal-100 text-teal-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">
            Find answers about bookings, payments, cancellations, wallet, and security.
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-6"
              />
            </div>
          </div>
        </div>

        {filteredCategories.length > 0 ? (
          <div className="space-y-8">
            {filteredCategories.map(category => (
              <Card key={category.id}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass(category.color)}`}>
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-3">
                      <h2>{category.title}</h2>
                      <Badge variant="secondary">{category.questions.length}</Badge>
                    </div>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, idx) => (
                      <AccordionItem key={idx} value={`${category.id}-${idx}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline py-4">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-gray-700 pb-4">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2">No results found</h3>
              <p className="text-gray-600">Try different keywords or browse our categories above</p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="mb-4">Still need help?</h2>
            <p className="text-gray-700 mb-6">Can't find the answer? Our support team is here to help.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Contact Support</Link>
              <Link href="/privacy-policy" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-service" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Terms of Service</Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-8">
          <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}
