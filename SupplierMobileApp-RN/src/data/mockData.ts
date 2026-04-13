// ─── Types ───────────────────────────────────────────────────────────────────

export interface Partner {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  reviewCount: number;
  distance: number;
  image: string;
  description: string;
  phone: string;
  openHours: string;
  lat: number;
  lng: number;
  reviews: Review[];
  sawScore?: number;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface AttachedProduct {
  id: string;
  name: string;
  price: string;
  unit: string;
  photo: string | null;
}

export interface Application {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerImage: string;
  partnerCategory: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  date: string;
  attachedProducts?: AttachedProduct[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const PARTNERS: Partner[] = [
  {
    id: "p1",
    name: "Cafe Kopi Kenangan",
    category: "Cafe",
    address: "Jl. Sudirman No.12, Jakarta Pusat",
    rating: 4.8,
    reviewCount: 245,
    distance: 1.2,
    image: "https://images.unsplash.com/photo-1765510295846-e1159148619d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    description: "Cafe premium dengan suasana nyaman dan kopi pilihan terbaik dari seluruh Nusantara.",
    phone: "+62 21 5551 2345",
    openHours: "07:00 - 22:00",
    lat: -6.208,
    lng: 106.845,
    reviews: [
      { id: "r1", author: "Budi Santoso", avatar: "BS", rating: 5, text: "Tempatnya nyaman banget untuk kerja dan meeting. Kopinya enak dan WiFi cepat!", date: "8 Mar 2026" },
      { id: "r2", author: "Ani Wijaya", avatar: "AW", rating: 4, text: "Pelayanan bagus, tempat bersih. Sedikit ramai di jam makan siang.", date: "5 Mar 2026" },
      { id: "r3", author: "Rudi Hermawan", avatar: "RH", rating: 5, text: "Recommended! Cocok untuk supplier seperti saya untuk presentasi produk.", date: "1 Mar 2026" },
    ],
  },
  {
    id: "p2",
    name: "Toko Sejahtera Mandiri",
    category: "Toko",
    address: "Jl. Gatot Subroto No.45, Jakarta Selatan",
    rating: 4.5,
    reviewCount: 189,
    distance: 2.1,
    image: "https://images.unsplash.com/photo-1606824722920-4c652a70f348?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    description: "Toko kebutuhan sehari-hari dengan stok lengkap dan harga kompetitif.",
    phone: "+62 21 5552 3456",
    openHours: "08:00 - 21:00",
    lat: -6.215,
    lng: 106.852,
    reviews: [
      { id: "r4", author: "Siti Rahayu", avatar: "SR", rating: 5, text: "Toko terpercaya, proses pembayaran mudah dan pengiriman cepat.", date: "7 Mar 2026" },
      { id: "r5", author: "Dono Kusuma", avatar: "DK", rating: 4, text: "Stok lengkap, harga sesuai market. Recommend untuk partnership.", date: "4 Mar 2026" },
    ],
  },
  {
    id: "p3",
    name: "Bengkel Jaya Abadi",
    category: "Bengkel",
    address: "Jl. Rasuna Said No.88, Jakarta Selatan",
    rating: 4.2,
    reviewCount: 156,
    distance: 3.5,
    image: "https://images.unsplash.com/photo-1702146713882-2579afb0bfba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    description: "Bengkel otomotif terpercaya dengan teknisi berpengalaman.",
    phone: "+62 21 5553 4567",
    openHours: "08:00 - 17:00",
    lat: -6.225,
    lng: 106.835,
    reviews: [
      { id: "r7", author: "Hendra Gunawan", avatar: "HG", rating: 4, text: "Teknisi terampil dan harga transparan. Puas dengan hasilnya.", date: "6 Mar 2026" },
      { id: "r8", author: "Lina Susanti", avatar: "LS", rating: 5, text: "Bengkel paling jujur yang pernah saya kunjungi.", date: "3 Mar 2026" },
    ],
  },
  {
    id: "p4",
    name: "Restoran Padang Minang",
    category: "Restoran",
    address: "Jl. Thamrin No.20, Jakarta Pusat",
    rating: 4.7,
    reviewCount: 312,
    distance: 0.8,
    image: "https://images.unsplash.com/photo-1568622998407-0084ebf482b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    description: "Restoran Masakan Padang Asli dengan cita rasa autentik.",
    phone: "+62 21 5554 5678",
    openHours: "09:00 - 22:00",
    lat: -6.195,
    lng: 106.840,
    reviews: [
      { id: "r10", author: "Eko Widodo", avatar: "EW", rating: 5, text: "Makanan autentik dan porsi melimpah. Partner terbaik untuk katering!", date: "9 Mar 2026" },
      { id: "r11", author: "Dewi Kusuma", avatar: "DKU", rating: 5, text: "Rendangnya juara! Sangat cocok untuk partnership kuliner.", date: "6 Mar 2026" },
    ],
  },
  {
    id: "p5",
    name: "Bakeri Roti Manis",
    category: "Bakeri",
    address: "Jl. Kemang Raya No.55, Jakarta Selatan",
    rating: 4.6,
    reviewCount: 98,
    distance: 4.2,
    image: "https://images.unsplash.com/photo-1572231086568-6984943e6629?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    description: "Bakeri artisan dengan produk premium menggunakan bahan-bahan alami.",
    phone: "+62 21 5555 6789",
    openHours: "06:00 - 20:00",
    lat: -6.260,
    lng: 106.815,
    reviews: [
      { id: "r13", author: "Rina Marlina", avatar: "RM", rating: 5, text: "Roti paling fresh di Jakarta! Proses produksi higienis dan terstandar.", date: "8 Mar 2026" },
    ],
  },
  {
    id: "p6",
    name: "Hotel Bintang Nusantara",
    category: "Hotel",
    address: "Jl. MH Thamrin No.100, Jakarta Pusat",
    rating: 4.4,
    reviewCount: 521,
    distance: 1.8,
    image: "https://images.unsplash.com/photo-1739063273560-01d653e0bb22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    description: "Hotel bintang 4 dengan fasilitas lengkap. Mencari supplier F&B, amenities.",
    phone: "+62 21 5556 7890",
    openHours: "24 Jam",
    lat: -6.200,
    lng: 106.825,
    reviews: [
      { id: "r16", author: "Thomas Wijaya", avatar: "TW", rating: 5, text: "Hotel terbaik di kawasan ini. Manajemen sangat terbuka dengan supplier baru.", date: "9 Mar 2026" },
    ],
  },
];

export const APPLICATIONS: Application[] = [
  {
    id: "a1",
    partnerId: "p1",
    partnerName: "Cafe Kopi Kenangan",
    partnerImage: "https://images.unsplash.com/photo-1765510295846-e1159148619d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    partnerCategory: "Cafe",
    message: "Kami dari PT. Sumber Makmur, supplier bahan makanan berkualitas...",
    status: "pending",
    date: "10 Mar 2026",
  },
  {
    id: "a2",
    partnerId: "p2",
    partnerName: "Toko Sejahtera Mandiri",
    partnerImage: "https://images.unsplash.com/photo-1606824722920-4c652a70f348?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    partnerCategory: "Toko",
    message: "Perkenalkan kami supplier produk kebutuhan harian...",
    status: "accepted",
    date: "8 Mar 2026",
  },
  {
    id: "a3",
    partnerId: "p3",
    partnerName: "Bengkel Jaya Abadi",
    partnerImage: "https://images.unsplash.com/photo-1702146713882-2579afb0bfba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    partnerCategory: "Bengkel",
    message: "Kami menawarkan produk oli dan spare part berkualitas...",
    status: "rejected",
    date: "5 Mar 2026",
  },
];
