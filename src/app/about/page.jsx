
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Award, 
  Star, 
  Globe, 
  Shield, 
  Heart,
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'Happy Travelers', value: '10,000+' },
    { icon: Globe, label: 'Years of Experience', value: `${new Date().getFullYear() - 2008}+` },
    { icon: Award, label: 'Awards Won', value: '25+' }
  ];

  const team = [
    {
      name: 'Ahmed Atef',
      role: 'Founder & Lead Guide',
      image: "/images/AhmedAtef1.webp",
      bio: 'With over 20 years of experience in Egyptian tourism, Ahmed founded Egypt Explorer to share his passion for ancient history and culture.'
    },
    {
      name: 'Fatima Al-Rashid',
      role: 'Cultural Heritage Specialist',
      image: "/images/FatimaAlRashid.webp",
      bio: 'PhD in Egyptology from Cairo University, Fatima brings deep historical knowledge to every tour experience.'
    },
    {
      name: 'Omar Farouk',
      role: 'Adventure Tour Director',
      image: "/images/OmarFarouk.webp",
      bio: 'Marine biologist and certified diving instructor, Omar leads our Red Sea adventures and desert expeditions.'
    },
    {
      name: 'Yasmin Ibrahim',
      role: 'Customer Experience Manager',
      image: "/images/YasminIbrahim.webp",
      bio: 'Ensuring every traveler has an unforgettable experience, Yasmin coordinates all aspects of trip planning and execution.'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passion for Egypt',
      description: 'We are deeply passionate about Egypt\'s rich history, culture, and natural beauty, and we love sharing this passion with our guests.'
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Your safety and security are our top priorities. We maintain the highest safety standards and work with certified professionals.'
    },
    {
      icon: Users,
      title: 'Local Expertise',
      description: 'Our team consists of local experts who know Egypt intimately and can provide authentic, insider experiences.'
    },
    {
      icon: CheckCircle,
      title: 'Quality Service',
      description: 'We are committed to providing exceptional service and creating memorable experiences that exceed expectations.'
    }
  ];

  const milestones = [
    { year: '2008', event: 'Egypt Explorer founded in Cairo' },
    { year: '2012', event: 'Expanded to Red Sea diving tours' },
    { year: '2015', event: 'Launched luxury Nile cruise experiences' },
    { year: '2018', event: 'Won Best Tour Operator Award' },
    { year: '2020', event: 'Introduced virtual tours during pandemic' },
    { year: '2023', event: 'Reached 10,000 satisfied travelers milestone' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-amber-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                About Gawalaty
              </Badge>
              <h1 className="text-4xl md:text-6xl mb-6">
                Your Gateway to Ancient Wonders
              </h1>
              <p className="text-xl mb-8 leading-relaxed">
                For over {new Date().getFullYear() - 2008} years, Gawalaty has been the trusted companion for travelers seeking 
                authentic Egyptian experiences. We combine deep local knowledge with exceptional service 
                to create unforgettable journeys through the land of pharaohs.
              </p>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Based in Cairo, Egypt</span>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/images/contact1.webp"
                width={1000}
                height={1000}
                alt="Ancient Egyptian culture and history"
                className="w-full h-96 object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                  <div className="text-3xl mb-2">{stat.value}</div>
                  <p className="text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Gawalaty was born from a simple dream: to share the incredible wonders of Egypt 
                  with travelers from around the world. Founded in 2008 by Ahmed Atef, a passionate 
                  Egyptologist and tour guide, our company started with just a few local tours around Cairo.
                </p>
                <p>
                  Over the years, we've grown into Egypt's premier tour operator, offering everything from 
                  intimate archaeological expeditions to thrilling Red Sea adventures. What hasn't changed 
                  is our commitment to authentic experiences and our deep respect for Egypt's magnificent heritage.
                </p>
                <p>
                  Today, we're proud to have introduced over 10,000 travelers to the magic of Egypt, 
                  earning numerous awards and maintaining a 4.9-star rating. But our greatest achievement 
                  is the lasting memories we've helped create and the friendships we've built along the way.
                </p>
              </div>
            </div>
            <div>
              <Image
                src="/images/contact2.webp"
                alt="Egypt Explorer team"
                width={1000}
                height={1000}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <value.icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl mb-3">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate experts dedicated to creating extraordinary experiences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <Image
                  width={1000}
                  height={1000}
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl mb-1">{member.name}</h3>
                  <p className="text-amber-600 mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key milestones in our company's history
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-amber-200 hidden lg:block"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8'}`}>
                    <Card className="inline-block max-w-md">
                      <CardContent className="p-4">
                        <div className="text-amber-600 mb-1">{milestone.year}</div>
                        <p className="text-gray-700">{milestone.event}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="hidden lg:block relative">
                    <div className="w-4 h-4 bg-amber-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-6">Ready to Explore Egypt?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered the magic of Egypt with us. 
            Your adventure of a lifetime awaits!
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Button asChild className="bg-white text-amber-600 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-bold">
              <Link href={"/"}>
              Browse Our Tours
              </Link>
            </Button>
            <Button asChild className="border-2 border-white px-8 py-3 rounded-lg hover:bg-white bg-transparent hover:text-amber-600 transition-colors font-bold">
              <Link href={"/contact"}>
              Contact Us
              </Link> 
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}