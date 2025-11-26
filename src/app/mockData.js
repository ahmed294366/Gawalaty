

export const mockTrips = [
  {
    id: '1',
    title: 'Pyramids of Giza Explorer',
    price: 299,
    image: 'https://images.unsplash.com/photo-1525604529863-915380184a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxweXJhbWlkcyUyMGdpemElMjBlZ3lwdHxlbnwxfHx8fDE3NTc0NDQ3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.8,
    type: 'historical',
    duration: '8 hours',
    location: 'Giza, Cairo',
    description: 'Explore the last remaining wonder of the ancient world with our expert guide. Visit the Great Pyramid of Khufu, the Pyramid of Khafre, and the iconic Sphinx.',
    guideName: 'ahmed',
    guideImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    availableDates: ['2025-01-15', '2025-01-20', '2025-01-25', '2025-02-01', '2025-02-05'],
    includes: ['Professional guide', 'Transportation', 'Entry tickets', 'Bottled water'],
    itinerary: [
      { day: 1, title: 'Great Pyramid Visit', description: 'Start your journey at the Great Pyramid of Khufu' },
      { day: 1, title: 'Sphinx Encounter', description: 'Marvel at the mysterious Sphinx' },
      { day: 1, title: 'Pyramid Complex', description: 'Explore the entire Giza pyramid complex' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1525604529863-915380184a43?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1553913861-c0fddf2619ff?w=400&h=300&fit=crop'
    ],
    reviews: [
      {
        id: '1',
        userId: '1',
        userName: 'Sarah Johnson',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612c14d?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Absolutely incredible experience! Ahmed was an amazing guide.',
        date: '2024-12-15'
      }
    ],
    likes: 245,
    isLiked: false
  },
  {
    id: '2',
    title: 'Luxor Temple & Valley of Kings',
    price: 450,
    image: 'https://images.unsplash.com/photo-1682403010342-477107a5c329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXhvciUyMHRlbXBsZSUyMGVneXB0fGVufDF8fHx8MTc1NzQ0NDc2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.9,
    type: 'cultural',
    duration: '2 days',
    location: 'Luxor',
    description: 'Discover the ancient capital of Egypt with visits to Luxor Temple, Karnak Temple, and the famous Valley of the Kings.',
    guideName: 'Fatima Al-Rashid',
    guideImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    availableDates: ['2025-01-18', '2025-01-25', '2025-02-02', '2025-02-08', '2025-02-15'],
    includes: ['2 days accommodation', 'All meals', 'Professional guide', 'Entry tickets', 'Transportation'],
    itinerary: [
      { day: 1, title: 'Luxor Temple', description: 'Explore the magnificent Luxor Temple' },
      { day: 1, title: 'Karnak Temple', description: 'Visit the vast Karnak Temple complex' },
      { day: 2, title: 'Valley of Kings', description: 'Discover royal tombs in the Valley of Kings' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1682403010342-477107a5c329?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578929243930-8f3bd37fe684?w=400&h=300&fit=crop'
    ],
    reviews: [
      {
        id: '2',
        userId: '2',
        userName: 'Michael Chen',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Two amazing days exploring ancient Egypt. Fatima knows so much history!',
        date: '2024-12-10'
      }
    ],
    likes: 189,
    isLiked: false
  },
  {
    id: '3',
    title: 'Red Sea Diving Adventure',
    price: 680,
    image: 'https://images.unsplash.com/photo-1667852976603-2486fa2dbb99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBzZWElMjBlZ3lwdCUyMGRpdmluZ3xlbnwxfHx8fDE3NTc1MzMwMzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.7,
    type: 'adventure',
    duration: '3 days',
    location: 'Hurghada',
    description: 'Dive into the crystal-clear waters of the Red Sea and explore vibrant coral reefs and marine life.',
    guideName: 'Omar Farouk',
    guideImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    availableDates: ['2025-01-22', '2025-01-29', '2025-02-05', '2025-02-12', '2025-02-19'],
    includes: ['3 days accommodation', 'All meals', 'Diving equipment', 'Boat trips', 'Certified instructor'],
    itinerary: [
      { day: 1, title: 'Training & First Dive', description: 'Learn basics and first reef dive' },
      { day: 2, title: 'Deep Water Diving', description: 'Explore deeper reefs and marine life' },
      { day: 3, title: 'Wreck Diving', description: 'Discover underwater shipwrecks' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1667852976603-2486fa2dbb99?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559581901-0c3700beccb1?w=400&h=300&fit=crop'
    ],
    reviews: [
      {
        id: '3',
        userId: '3',
        userName: 'Lisa Anderson',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Best diving experience ever! The coral reefs are stunning.',
        date: '2024-12-05'
      }
    ],
    likes: 156,
    isLiked: false
  },
  {
    id: '4',
    title: 'Aswan & Abu Simbel Journey',
    price: 520,
    image: 'https://images.unsplash.com/photo-1655755001673-0d6ef8b25496?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc3dhbiUyMGVneXB0JTIwbmlsZXxlbnwxfHx8fDE3NTc1MzMwMzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.6,
    type: 'cultural',
    duration: '2 days',
    location: 'Aswan',
    description: 'Journey to southern Egypt to visit the majestic Abu Simbel temples and sail on the beautiful Nile.',
    guideName: 'Yasmin Ibrahim',
    guideImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    availableDates: ['2025-01-20', '2025-01-27', '2025-02-03', '2025-02-10', '2025-02-17'],
    includes: ['2 days accommodation', 'All meals', 'Professional guide', 'Felucca sailing', 'Transportation'],
    itinerary: [
      { day: 1, title: 'Aswan Exploration', description: 'Visit Philae Temple and sail in a felucca' },
      { day: 2, title: 'Abu Simbel', description: 'Early morning trip to Abu Simbel temples' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1655755001673-0d6ef8b25496?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578929430338-3b3b3b3b3b3b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573160812821-8b8edf55fc45?w=400&h=300&fit=crop'
    ],
    reviews: [
      {
        id: '4',
        userId: '4',
        userName: 'Robert Williams',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        rating: 4,
        comment: 'Beautiful temples and great Nile cruise. Highly recommended!',
        date: '2024-11-28'
      }
    ],
    likes: 203,
    isLiked: false
  },
  {
    id: '5',
    title: 'Alexandria Mediterranean Escape',
    price: 380,
    image: 'https://images.unsplash.com/photo-1633624646814-3a61ed3e2847?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbGV4YW5kcmlhJTIwZWd5cHR8ZW58MXx8fHwxNzU3NTMzMDMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.5,
    type: 'relaxation',
    duration: '2 days',
    location: 'Alexandria',
    description: 'Explore Egypt\'s Mediterranean jewel with its ancient library, beautiful coastline, and rich Greco-Roman heritage.',
    guideName: 'Nour Abdel Rahman',
    guideImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    availableDates: ['2025-01-16', '2025-01-23', '2025-01-30', '2025-02-06', '2025-02-13'],
    includes: ['2 days accommodation', 'All meals', 'Professional guide', 'Entry tickets', 'Beach access'],
    itinerary: [
      { day: 1, title: 'Ancient Alexandria', description: 'Visit Bibliotheca Alexandrina and Citadel of Qaitbay' },
      { day: 2, title: 'Modern Alexandria', description: 'Explore modern city and Mediterranean coastline' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1633624646814-3a61ed3e2847?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1590502855024-c0d05b584e4f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583061019002-8e9e9b3a6a72?w=400&h=300&fit=crop'
    ],
    reviews: [
      {
        id: '5',
        userId: '5',
        userName: 'Emma Thompson',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Beautiful coastal city with amazing history. Perfect for relaxation!',
        date: '2024-11-20'
      }
    ],
    likes: 178,
    isLiked: false
  },
  {
    id: '6',
    title: 'Siwa Oasis Desert Adventure',
    price: 599,
    image: 'https://images.unsplash.com/photo-1652377170273-72152e714b96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaXdhJTIwb2FzaXMlMjBlZ3lwdHxlbnwxfHx8fDE3NTc1MzMwMzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.8,
    type: 'adventure',
    duration: '3 days',
    location: 'Siwa Oasis',
    description: 'Experience the magic of the Western Desert with hot springs, salt lakes, and Berber culture in remote Siwa Oasis.',
    guideName: 'Mahmoud El-Shazly',
    guideImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    availableDates: ['2025-01-24', '2025-01-31', '2025-02-07', '2025-02-14', '2025-02-21'],
    includes: ['3 days accommodation', 'All meals', 'Desert guide', '4WD transportation', 'Hot springs access'],
    itinerary: [
      { day: 1, title: 'Oasis Arrival', description: 'Explore Siwa town and Oracle Temple' },
      { day: 2, title: 'Desert Safari', description: 'Sand dune adventure and hot springs' },
      { day: 3, title: 'Salt Lakes', description: 'Visit unique salt lakes and local markets' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1652377170273-72152e714b96?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'
    ],
    reviews: [
      {
        id: '6',
        userId: '6',
        userName: 'David Martinez',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Incredible desert experience! The hot springs were amazing.',
        date: '2024-11-15'
      }
    ],
    likes: 134,
    isLiked: false
  }
];