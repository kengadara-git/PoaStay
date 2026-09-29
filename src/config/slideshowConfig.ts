export interface SlideshowImage {
  id: string;
  filename: string;
  src: string;
  fallbackSrc: string;
  title: string;
  subtitle: string;
  region: string;
}

export const SLIDESHOW_IMAGES: SlideshowImage[] = [
  {
    id: 'slide-mara',
    filename: 'safari-camp-mara.jpg',
    src: '/assets/images/slideshow/safari-camp-mara.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2000&q=80',
    title: 'Maasai Mara Luxury Safari Chalets',
    subtitle: 'Great Migration Savanna, 4x4 Land Cruisers & Campfire Bomas',
    region: 'Narok / Mara Ecosystem',
  },
  {
    id: 'slide-diani',
    filename: 'beachfront-villa-diani.jpg',
    src: '/assets/images/slideshow/beachfront-villa-diani.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80',
    title: 'Diani Beachfront Oceanfront Villas',
    subtitle: 'Private Infinity Pools, White Sand Shorelines & Swahili Dining',
    region: 'Kwale County, South Coast',
  },
  {
    id: 'slide-naivasha',
    filename: 'rift-valley-naivasha.jpg',
    src: '/assets/images/slideshow/rift-valley-naivasha.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=2000&q=80',
    title: 'Lake Naivasha Crescent Chalets',
    subtitle: 'Great Rift Valley Escarpment, Grazing Zebras & Lakeside Bonfires',
    region: 'Nakuru County, Rift Valley',
  },
  {
    id: 'slide-watamu',
    filename: 'ocean-penthouse-watamu.jpg',
    src: '/assets/images/slideshow/ocean-penthouse-watamu.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80',
    title: 'Watamu Marine Reserve Penthouses',
    subtitle: 'Coral Reef Jacuzzi Terraces & Dolphin Safari Sanctuaries',
    region: 'Kilifi County, North Coast',
  },
  {
    id: 'slide-lamu',
    filename: 'swahili-heritage-lamu.jpg',
    src: '/assets/images/slideshow/swahili-heritage-lamu.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2000&q=80',
    title: 'Lamu Shela Heritage Townhouses',
    subtitle: 'Centuries-old Coral Stone Architecture & Sunset Sailing Dhows',
    region: 'Lamu Archipelago',
  },
  {
    id: 'slide-savanna',
    filename: 'savanna-sunset-game-drive.jpg',
    src: '/assets/images/slideshow/savanna-sunset-game-drive.jpg',
    fallbackSrc: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2000&q=80',
    title: 'Golden Savanna Wildlife Game Drives',
    subtitle: 'Open Top Land Cruisers, Professional Naturalists & Sundowners',
    region: 'Kenyan National Reserves',
  },
];
