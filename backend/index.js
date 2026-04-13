require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── ALGORITMA HAVERSINE ──────────────────────────────────────────────────────
// Menghitung jarak aktual (km) antara dua titik koordinat di permukaan bumi
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Jari-jari bumi dalam kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// ─── ALGORITMA SAW (Simple Additive Weighting) ────────────────────────────────
// Menghitung skor akhir setiap mitra berdasarkan bobot jarak dan rating
function applySAW(partners) {
  if (!partners || partners.length === 0) return [];

  const W_JARAK = 0.6; // Bobot Jarak 60% (Cost: semakin kecil semakin baik)
  const W_RATING = 0.4; // Bobot Rating 40% (Benefit: semakin besar semakin baik)

  const minJarak = Math.min(...partners.map((p) => p.distance));
  const maxRating = Math.max(...partners.map((p) => p.rating));

  const scoredList = partners.map((partner) => {
    // Normalisasi nilai ke skala 0 – 1
    const normJarak =
      partner.distance === 0 ? 1 : minJarak / partner.distance;
    const normRating = maxRating === 0 ? 0 : partner.rating / maxRating;

    // Kalkulasi skor akhir (dikali 100 untuk tampilan UI)
    const finalScore = Math.round(
      (W_JARAK * normJarak + W_RATING * normRating) * 100
    );

    return { ...partner, sawScore: finalScore };
  });

  // Urutkan dari rekomendasi terbaik (skor tertinggi) ke terendah
  return scoredList.sort((a, b) => b.sawScore - a.sawScore);
}

// ─── Helper: Mapping kategori usaha → tipe Google Places ─────────────────────
function getSearchTypes(category) {
  if (!category) return ["store", "wholesaler"];
  if (category.includes("Makanan") || category.includes("Minuman"))
    return ["restaurant", "cafe", "supermarket", "bakery"];
  if (category.includes("Otomotif"))
    return ["car_repair", "car_dealer", "car_wash"];
  if (category.includes("Kesehatan"))
    return ["pharmacy", "hospital", "drugstore"];
  if (category.includes("Fashion") || category.includes("Pakaian"))
    return ["clothing_store", "department_store", "shoe_store"];
  if (category.includes("Elektronik")) return ["electronics_store"];
  return ["store", "wholesaler"];
}

// ─── Helper: Mapping Google Places types → kategori UI ───────────────────────
function getCategoryFromTypes(types) {
  if (!types) return "Mitra Bisnis";
  if (types.includes("cafe")) return "Cafe";
  if (types.includes("restaurant")) return "Restoran";
  if (types.includes("bakery")) return "Bakeri";
  if (
    types.includes("car_repair") ||
    types.includes("car_dealer") ||
    types.includes("car_wash")
  )
    return "Bengkel";
  if (types.includes("lodging") || types.includes("hotel")) return "Hotel";
  if (
    types.includes("store") ||
    types.includes("supermarket") ||
    types.includes("clothing_store") ||
    types.includes("electronics_store") ||
    types.includes("pharmacy")
  )
    return "Toko";
  return "Mitra Bisnis";
}

// ─── Mock Data Fallback ───────────────────────────────────────────────────────
// Digunakan saat Google Places API key tidak tersedia atau request gagal
function generateMockData(lat, lng) {
  return [
    {
      id: "mock-001",
      name: "Warung Makan Sederhana",
      category: "Restoran",
      rating: 4.5,
      reviewCount: 120,
      distance: calculateDistance(lat, lng, lat + 0.005, lng + 0.003),
      lat: lat + 0.005,
      lng: lng + 0.003,
      image: "https://placehold.co/150x150/1a2640/00D084?text=Restoran",
      description: "Warung makan dengan menu nusantara pilihan",
    },
    {
      id: "mock-002",
      name: "Kafe Kopi Nusantara",
      category: "Cafe",
      rating: 4.8,
      reviewCount: 250,
      distance: calculateDistance(lat, lng, lat - 0.007, lng + 0.004),
      lat: lat - 0.007,
      lng: lng + 0.004,
      image: "https://placehold.co/150x150/1a2640/00D084?text=Cafe",
      description: "Kafe spesialisasi kopi single origin Indonesia",
    },
    {
      id: "mock-003",
      name: "Bengkel Motor Jaya",
      category: "Bengkel",
      rating: 4.2,
      reviewCount: 88,
      distance: calculateDistance(lat, lng, lat + 0.009, lng - 0.005),
      lat: lat + 0.009,
      lng: lng - 0.005,
      image: "https://placehold.co/150x150/1a2640/00D084?text=Bengkel",
      description: "Bengkel resmi multi-merek, spare part lengkap",
    },
    {
      id: "mock-004",
      name: "Toko Elektronik Prima",
      category: "Toko",
      rating: 4.0,
      reviewCount: 67,
      distance: calculateDistance(lat, lng, lat - 0.012, lng - 0.006),
      lat: lat - 0.012,
      lng: lng - 0.006,
      image: "https://placehold.co/150x150/1a2640/00D084?text=Toko",
      description: "Distributor elektronik resmi garansi resmi",
    },
    {
      id: "mock-005",
      name: "Bakeri Roti Manis",
      category: "Bakeri",
      rating: 4.6,
      reviewCount: 190,
      distance: calculateDistance(lat, lng, lat + 0.003, lng - 0.008),
      lat: lat + 0.003,
      lng: lng - 0.008,
      image: "https://placehold.co/150x150/1a2640/00D084?text=Bakeri",
      description: "Bakeri artisan dengan produk kue dan roti segar harian",
    },
  ];
}

// ─── ENDPOINT UTAMA: POST /api/recommendations ────────────────────────────────
app.post("/api/recommendations", async (req, res) => {
  const lat = parseFloat(req.body.lat);
  const lng = parseFloat(req.body.lng);
  const { category } = req.body;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "lat dan lng harus berupa angka desimal yang valid." });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  let partners = [];

  // ── Coba panggil Google Places API (New) jika API key tersedia ──
  if (apiKey && apiKey !== "YOUR_GOOGLE_PLACES_API_KEY_HERE") {
    try {
      const searchTypes = getSearchTypes(category);

      const placesResponse = await axios.post(
        "https://places.googleapis.com/v1/places:searchNearby",
        {
          includedTypes: searchTypes,
          maxResultCount: 15,
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: 5000.0,
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.types,places.photos",
          },
        }
      );

      const places = placesResponse.data.places || [];

      partners = places.map((place) => {
        const targetLat = place.location?.latitude;
        const targetLng = place.location?.longitude;
        const realDistance = calculateDistance(lat, lng, targetLat, targetLng);

        const photoRef =
          place.photos && place.photos.length > 0
            ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=150&key=${apiKey}`
            : "https://placehold.co/150x150/1a2640/00D084?text=Mitra";

        return {
          id: place.id,
          name: place.displayName?.text || "Mitra",
          category: getCategoryFromTypes(place.types || []),
          rating: place.rating || 4.0,
          reviewCount: place.userRatingCount || 0,
          distance: realDistance,
          lat: targetLat,
          lng: targetLng,
          image: photoRef,
          description: "Lokasi strategis mitra",
        };
      });

      console.log(`✅ Google Places API: ${partners.length} mitra ditemukan`);
    } catch (err) {
      console.error("⚠️  Google Places API gagal, beralih ke mock data:", err.message);
      partners = generateMockData(lat, lng);
    }
  } else {
    // ── Gunakan mock data jika API key belum diset ──
    console.log("ℹ️  API key tidak ditemukan — menggunakan mock data");
    partners = generateMockData(lat, lng);
  }

  // ── Jalankan Algoritma SAW dan kembalikan hasilnya ──
  const recommendations = applySAW(partners);

  return res.json(recommendations);
});

// ─── ENDPOINT: POST /api/generate-proposal ──────────────────────────────────
// Menghasilkan draf surat penawaran B2B menggunakan Gemini AI
app.post("/api/generate-proposal", async (req, res) => {
  const {
    supplierName,
    supplierCategory,
    partnerName,
    partnerCategory,
    tone,
    productNames,
    offerSample,
  } = req.body;

  if (!partnerName || !supplierName) {
    return res.status(400).json({ error: "supplierName dan partnerName diperlukan." });
  }

  const sampleClause = offerSample
    ? " Kami juga bersedia mengirimkan sampel fisik untuk meninjau kualitas secara langsung."
    : "";

  const productText =
    productNames && productNames.trim()
      ? `produk unggulan kami yaitu ${productNames}`
      : "produk-produk berkualitas dari katalog kami";

  const geminiKey = process.env.GEMINI_API_KEY;

  // ── Coba generate dengan Gemini AI ──
  if (geminiKey && geminiKey !== "YOUR_GEMINI_API_KEY_HERE") {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);

      const toneLabel =
        tone === "formal"
          ? "formal dan profesional"
          : tone === "casual"
          ? "ramah, hangat, dan persuasif"
          : "singkat, padat, dan langsung ke inti";

      const prompt = `Kamu adalah perwakilan penjualan B2B.

Tuliskan surat penawaran kerja sama dalam Bahasa Indonesia dengan gaya: ${toneLabel}.

Fakta Utama:
- Pengirim: ${supplierName} (Bidang: ${supplierCategory || "suplai barang"})
- Penerima: ${partnerName} (${partnerCategory || "bisnis ritel"})
- Produk yang ditawarkan: ${productText}

ATURAN KETAT YANG WAJIB DIPATUHI:
1. JANGAN menggunakan placeholder/template seperti [Tanggal], [Alamat], atau [Nama Penerima]. Langsung tulis teks jadinya ("Kepada Yth. Manajemen ${partnerName}").
2. JANGAN mengarang atau membesar-besarkan klaim (overclaim) seperti "berpengalaman bertahun-tahun" atau "memiliki ratusan klien". Gunakan bahasa yang rendah hati dan realistis.
3. Sebutkan nama produk (${productText}) secara natural dalam paragraf. JANGAN gunakan label kaku seperti "Produk Spesifik:".
${offerSample ? "4. Wajib sertakan satu kalimat natural yang menawarkan sampel produk secara GRATIS untuk dicoba kualitasnya." : "4. JANGAN sebutkan pemberian sampel gratis sama sekali."}
5. Langsung berikan teks isi suratnya. Jangan tambahkan embel-embel judul, subjek, atau penutup surat.
6. Buat surat singkat (maks 150 kata), langsung ke intinya, meyakinkan, namun tetap sopan.
7. JANGAN tambahkan tanda tangan pengirim di akhir surat. Surat harus berhenti langsung setelah pesan ajakan tindak lanjut.`;

      // Coba model dari yang terbaru, fallback otomatis
      const modelCandidates = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemma-3-4b-it"];
      let proposalText = null;

      for (const modelName of modelCandidates) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          proposalText = result.response.text().trim();
          console.log(`✅ Gemini [${modelName}]: proposal untuk ${partnerName} berhasil digenerate`);
          break;
        } catch (modelErr) {
          console.warn(`⚠️  Model ${modelName} gagal: ${modelErr.message.substring(0, 80)}`);
        }
      }

      if (proposalText) {
        return res.json({ success: true, proposalText });
      }
      // Jika semua model gagal, jatuh ke fallback template
      throw new Error("Semua model Gemini tidak tersedia saat ini");
    } catch (err) {
      console.error("⚠️  Gemini API gagal, fallback ke template:", err.message);
    }
  } else {
    console.log("ℹ️  GEMINI_API_KEY tidak ditemukan — menggunakan template fallback");
  }

  // ── Fallback: template string lokal ──
  let proposalText = "";
  if (tone === "casual") {
    proposalText = `Halo Tim ${partnerName}!\n\nSalam kenal dari kami, ${supplierName}. Kami adalah penyuplai lokal di bidang ${supplierCategory || "berbagai produk"} dan sangat kagum dengan bisnis Anda.\n\nKami punya penawaran menarik untuk menyuplai ${productText} dengan harga spesial khusus mitra B2B.${sampleClause}\n\nKira-kira apakah ada waktu minggu ini untuk berdiskusi lebih lanjut?\n\nSalam hangat,\n${supplierName}`;
  } else if (tone === "direct") {
    proposalText = `Kepada ${partnerName},\n\nPenawaran kerja sama suplai barang dari ${supplierName}.\n\nProduk: ${productText}.\nKeunggulan: Harga grosir, stok terjamin, pengiriman tepat waktu.${sampleClause}\n\nMohon informasi prosedur vendor. Kami siap melampirkan detail harga jika dibutuhkan.\n\nTerima kasih,\n${supplierName}`;
  } else {
    proposalText = `Yth. Tim Pembelian ${partnerName},\n\nPerkenalkan, kami dari ${supplierName}, yang bergerak di bidang ${supplierCategory || "suplai barang"}. Kami tertarik menjalin kemitraan strategis sebagai pemasok untuk bisnis Anda.\n\nKami bermaksud menawarkan ${productText}. Kami menjamin konsistensi suplai dan harga kompetitif.${sampleClause}\n\nKami berharap dapat mendiskusikan peluang kerja sama ini lebih lanjut.\n\nHormat kami,\n${supplierName}`;
  }

  return res.json({ success: true, proposalText });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "SupplierHub Backend berjalan ✅" });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 SupplierHub Backend berjalan di port ${PORT}`);
  console.log(`   → POST http://localhost:${PORT}/api/recommendations`);
});
