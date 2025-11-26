
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {auth} from "@/auth"
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { QuestionComponent } from './sendMessage';


export default async function ContactPage() {
  const session = await auth()
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about your trip or need assistance? We're here to help!
            Fill out the form below or reach out to us directly.
          </p>
        </div>

        <QuickHelp />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="mb-2">Send us a Message & Question</h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>
                {/* form */}
                <QuestionComponent session={session}/>
              </CardContent>
            </Card>
          </div>
          <ContactInformation />
        </div>
        <AdditionalResources/>
        <div className="text-center py-8">
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

const quickHelp = [
  {
    icon: HelpCircle,
    title: 'FAQs',
    description: 'Find answers to common questions',
    link: '/FAQ',
    color: 'blue'
  },
  {
    icon: MessageSquare,
    title: 'Support Center',
    description: 'Browse our help articles',
    link: '/FAQ',
    color: 'green'
  },
  {
    icon: AlertCircle,
    title: 'Report an Issue',
    description: 'Let us know about problems',
    link: '/contact',
    color: 'red'
  }
];
const getColorClass = (color) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600'
  };
  return colors[color] || 'bg-gray-100 text-gray-600';
};

function QuickHelp() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {
        quickHelp.map((item, index) => {
          return (
            <Link key={index} href={item.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getColorClass(item.color)}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })
      }
    </div>
  )
}
const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    primary: 'support@gawalaty.com',
    secondary: 'info@gawalaty.com',
    description: 'Send us an email anytime',
    color: 'blue'
  },
  {
    icon: Phone,
    title: 'Call Us',
    primary: '(+20) 2-XXXX-XXXX',
    secondary: '(+20) 2-XXXX-XXXX',
    description: 'Mon-Sat, 9:00 AM - 6:00 PM',
    color: 'green'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    primary: '123 Tahrir Square',
    secondary: 'Cairo, Egypt 11511',
    description: 'Come visit our office',
    color: 'purple'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    primary: 'Monday - Saturday',
    secondary: '9:00 AM - 6:00 PM',
    description: 'Closed on Sundays',
    color: 'amber'
  }
];
function ContactInformation() {
  return (
    <div className="space-y-6">
      {/* Contact Info Cards */}
      {contactInfo.map((info, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${getColorClass(info.color)}`}>
                <info.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">{info.title}</h4>
                <p className="text-sm text-gray-900 mb-1">{info.primary}</p>
                <p className="text-sm text-gray-600 mb-2">{info.secondary}</p>
                <p className="text-xs text-gray-500">{info.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Response Time Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-900 mb-2">Quick Response Guarantee</h4>
              <p className="text-sm text-blue-800">
                We aim to respond to all inquiries within 24 hours during business days.
                For urgent matters, please call us directly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-amber-900 mb-2">Emergency Support</h4>
              <p className="text-sm text-amber-800 mb-2">
                If you're traveling and need immediate assistance, call our 24/7 emergency line:
              </p>
              <p className="font-semibold text-amber-900">(+20) 2-XXXX-XXXX</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
function AdditionalResources() {
  return (
    <Card className="mt-12">
      <CardContent className="p-8">
        <h2 className="mb-6 text-center">Other Ways to Get Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2">Browse FAQs</h3>
            <p className="text-sm text-gray-600 mb-4">
              Find instant answers to common questions about bookings, payments, and more.
            </p>
            <Link href="/FAQ">
              <Button variant="outline" size="sm">
                View FAQs
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2">Privacy & Terms</h3>
            <p className="text-sm text-gray-600 mb-4">
              Learn about how we protect your data and our service terms.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/privacy-policy">
                <Button variant="outline" size="sm">
                  Privacy
                </Button>
              </Link>
              
                <Button variant="outline" asChild size="sm">
                  <Link href="/terms-of-service">
                  Terms
                   </Link>
                </Button>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2">Partnership Inquiries</h3>
            <p className="text-sm text-gray-600 mb-4">
              Interested in becoming a guide or partnering with us?
            </p>
            <a href="mailto:partners@gawalaty.com">
              <Button variant="outline" size="sm">
                Email Partners Team
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}