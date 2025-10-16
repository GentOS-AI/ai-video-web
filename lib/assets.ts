/**
 * Asset URLs configuration
 * Using Unsplash for high-quality placeholder images and Pexels for videos
 */

// Trial sample images - AI/Tech/Business themed (using reliable Unsplash URLs)
export const trialImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop",
    highResSrc: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1280&h=720&fit=crop",
    alt: "Tech Product",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
    highResSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&h=720&fit=crop",
    alt: "AI Technology",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop",
    highResSrc: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&h=720&fit=crop",
    alt: "Business Tech",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&h=400&fit=crop",
    highResSrc: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1280&h=720&fit=crop",
    alt: "Modern Office",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
    highResSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop",
    alt: "Data Analytics",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=400&fit=crop",
    highResSrc: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1280&h=720&fit=crop",
    alt: "Digital Marketing",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop",
    highResSrc: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1280&h=720&fit=crop",
    alt: "Team Meeting",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop",
    highResSrc: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1280&h=720&fit=crop",
    alt: "Presentation",
  },
];

// Hero carousel videos with posters
export const heroVideos = [
  {
    id: 1,
    // Using Big Buck Bunny - open source video
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
    title: "Product Launch",
  },
  {
    id: 2,
    // Using Elephant's Dream - open source video
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    title: "Brand Story",
  },
  {
    id: 3,
    // Using Sintel - open source video
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    poster: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=450&fit=crop",
    title: "Commercial Ad",
  },
];

// Showcase videos (18 videos = 3 pages for testing carousel)
export const showcaseVideos = [
  // Page 1
  {
    id: 1,
    title: "Tech Product Launch",
    description: "Sleek smartphone reveal with dynamic transitions",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=450&fit=crop",
    category: "Product",
  },
  {
    id: 2,
    title: "Fashion Brand Story",
    description: "Elegant fashion collection with cinematic shots",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=450&fit=crop",
    category: "Fashion",
  },
  {
    id: 3,
    title: "Food & Beverage Ad",
    description: "Mouth-watering product shots with close-ups",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop",
    category: "F&B",
  },
  {
    id: 4,
    title: "Real Estate Tour",
    description: "Virtual property walkthrough with smooth pans",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop",
    category: "Real Estate",
  },
  {
    id: 5,
    title: "Automotive Showcase",
    description: "Luxury car presentation with dramatic lighting",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    poster: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop",
    category: "Automotive",
  },
  {
    id: 6,
    title: "SaaS Platform Demo",
    description: "Software interface animation with clean UI",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    poster: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop",
    category: "Tech",
  },
  // Page 2 (duplicated for testing)
  {
    id: 7,
    title: "Tech Product Launch",
    description: "Sleek smartphone reveal with dynamic transitions",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=450&fit=crop",
    category: "Product",
  },
  {
    id: 8,
    title: "Fashion Brand Story",
    description: "Elegant fashion collection with cinematic shots",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=450&fit=crop",
    category: "Fashion",
  },
  {
    id: 9,
    title: "Food & Beverage Ad",
    description: "Mouth-watering product shots with close-ups",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop",
    category: "F&B",
  },
  {
    id: 10,
    title: "Real Estate Tour",
    description: "Virtual property walkthrough with smooth pans",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop",
    category: "Real Estate",
  },
  {
    id: 11,
    title: "Automotive Showcase",
    description: "Luxury car presentation with dramatic lighting",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    poster: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop",
    category: "Automotive",
  },
  {
    id: 12,
    title: "SaaS Platform Demo",
    description: "Software interface animation with clean UI",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    poster: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop",
    category: "Tech",
  },
  // Page 3 (duplicated for testing)
  {
    id: 13,
    title: "Tech Product Launch",
    description: "Sleek smartphone reveal with dynamic transitions",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=450&fit=crop",
    category: "Product",
  },
  {
    id: 14,
    title: "Fashion Brand Story",
    description: "Elegant fashion collection with cinematic shots",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=450&fit=crop",
    category: "Fashion",
  },
  {
    id: 15,
    title: "Food & Beverage Ad",
    description: "Mouth-watering product shots with close-ups",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop",
    category: "F&B",
  },
  {
    id: 16,
    title: "Real Estate Tour",
    description: "Virtual property walkthrough with smooth pans",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop",
    category: "Real Estate",
  },
  {
    id: 17,
    title: "Automotive Showcase",
    description: "Luxury car presentation with dramatic lighting",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    poster: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop",
    category: "Automotive",
  },
  {
    id: 18,
    title: "SaaS Platform Demo",
    description: "Software interface animation with clean UI",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    poster: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop",
    category: "Tech",
  },
];

// Type definitions
export interface TrialImage {
  id: number;
  src: string;
  highResSrc: string;  // High-resolution version for AI video generation
  alt: string;
}

export interface Video {
  id: number;
  src: string;
  poster: string;
  title: string;
}

export interface ShowcaseVideo extends Video {
  description: string;
  category: string;
}
