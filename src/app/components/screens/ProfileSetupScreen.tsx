import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Building2, FileText, Tag, MapPin, Camera, ChevronDown, CheckCircle, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const CATEGORIES = ["Makanan & Minuman", "Elektronik", "Fashion & Pakaian", "Otomotif", "Kesehatan", "Furnitur", "Bahan Baku Industri", "Pertanian", "Lainnya"];
const libraries: ("places")[] = ["places"];

export function ProfileSetupScreen() {
  const navigate = useNavigate();
  const { setupProfile } = useApp();
  
  // Refs
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Form
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // State UI
  const [showCategories, setShowCategories] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE", 
    libraries: libraries,
  });

  // --- FUNGSI UPLOAD & KOMPRESI FOTO ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 400; // Ukuran maksimal lebar/tinggi
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Kompres ke format JPEG kualitas 0.7 (Sangat ringan)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setAvatar(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // --- FUNGSI LOKASI ---
  const detectLocation = async () => {
    if (!navigator.geolocation) return alert("GPS tidak didukung");
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY_HERE`);
          const data = await res.json();
          if (data.results[0]) setLocation(data.results[0].formatted_address);
        } catch {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally { setDetectingLocation(false); }
      },
      () => { setDetectingLocation(false); alert("Gagal akses GPS"); }
    );
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      setLocation(place.formatted_address || "");
      if (place.geometry?.location) {
        setCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
      }
    }
  };

  const handleSave = async () => {
    if (!businessName || !category || !location) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    setupProfile({ 
      businessName, 
      description, 
      category, 
      location, 
      coordinates: coords,
      avatar: avatar || businessName.substring(0, 2).toUpperCase(), // Gunakan inisial jika foto kosong
    });

    setDone(true);
    await new Promise((r) => setTimeout(r, 1000));
    navigate("/app/home");
  };

  if (done) {
    return (
      <div className="min-h-[788px] flex flex-col items-center justify-center" style={{ background: "#0A0E1A" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="rounded-full flex items-center justify-center" style={{ width: 96, height: 96, background: "rgba(0,208,132,0.15)" }}>
            <CheckCircle size={52} style={{ color: "#00D084" }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9" }}>Profil Berhasil Dibuat!</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[788px] flex flex-col relative overflow-hidden" style={{ background: "#0A0E1A" }}>
      <div className="absolute top-0 inset-x-0 h-64 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,208,132,0.1) 0%, transparent 70%)" }} />

      <div className="px-6 pt-4 pb-4 z-10 text-center">
        <div style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>Siapkan Profil Bisnis</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 z-10">
        
        {/* AVATAR UPLOAD SECTION */}
        <div className="flex flex-col items-center mb-8 mt-2">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center rounded-full relative cursor-pointer overflow-hidden transition-all active:scale-95" 
            style={{ 
              width: 100, height: 100, 
              background: "rgba(255,255,255,0.03)", 
              border: `2px ${avatar ? 'solid' : 'dashed'} rgba(0,208,132,0.3)` 
            }}
          >
            {avatar ? (
              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Camera size={28} style={{ color: "#00D084" }} />
                <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>PILIH FOTO</span>
              </div>
            )}
            
            {/* Tombol Hapus jika foto sudah ada */}
            {avatar && (
              <button 
                onClick={(e) => { e.stopPropagation(); setAvatar(null); }}
                className="absolute top-0 right-0 p-1 bg-red-500 rounded-full"
              >
                <X size={12} color="white" />
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* INPUT NAMA BISNIS */}
        <div className="mb-4">
          <label style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: 'uppercase', marginLeft: 4, marginBottom: 6, display: 'block' }}>Nama Bisnis *</label>
          <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 54 }}>
            <Building2 size={18} style={{ color: "#00D084" }} />
            <input type="text" placeholder="Misal: Kopi Kenangan" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="flex-1 bg-transparent outline-none text-[#F1F5F9] text-sm" />
          </div>
        </div>

        {/* INPUT DESKRIPSI */}
        <div className="mb-4">
          <label style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: 'uppercase', marginLeft: 4, marginBottom: 6, display: 'block' }}>Tentang Bisnis</label>
          <div className="flex items-start rounded-2xl px-4 py-3 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <FileText size={18} style={{ color: "#00D084", marginTop: 2 }} />
            <textarea placeholder="Ceritakan singkat bisnis Anda..." value={description} onChange={(e) => setDescription(e.target.value)} className="flex-1 bg-transparent outline-none resize-none text-[#F1F5F9] text-sm" rows={3} />
          </div>
        </div>

        {/* INPUT KATEGORI */}
        <div className="mb-4">
          <label style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: 'uppercase', marginLeft: 4, marginBottom: 6, display: 'block' }}>Kategori Utama *</label>
          <button onClick={() => setShowCategories(!showCategories)} className="w-full flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 54 }}>
            <Tag size={18} style={{ color: "#00D084" }} />
            <span className="flex-1 text-left text-sm" style={{ color: category ? "#F1F5F9" : "#4B5563" }}>{category || "Pilih Kategori..."}</span>
            <ChevronDown size={16} style={{ color: "#64748B" }} />
          </button>
          <AnimatePresence>
            {showCategories && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-2 rounded-2xl overflow-hidden z-50 relative" style={{ background: "#161B2C", border: "1px solid rgba(255,255,255,0.1)" }}>
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => { setCategory(cat); setShowCategories(false); }} className="w-full text-left px-5 py-3.5 text-sm text-[#94A3B8] hover:bg-[#00D084]/10 hover:text-[#00D084] border-b border-white/5">
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* INPUT LOKASI */}
        <div className="mb-8">
          <label style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: 'uppercase', marginLeft: 4, marginBottom: 6, display: 'block' }}>Lokasi Operasional *</label>
          <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 54 }}>
            <MapPin size={18} style={{ color: "#00D084" }} />
            {isLoaded ? (
              <Autocomplete onLoad={(a) => (autocompleteRef.current = a)} onPlaceChanged={onPlaceChanged} className="flex-1">
                <input type="text" placeholder="Cari alamat atau gedung..." value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-transparent outline-none text-[#F1F5F9] text-sm" />
              </Autocomplete>
            ) : <div className="flex-1 text-sm text-[#4B5563]">Loading Maps...</div>}
            <button onClick={detectLocation} className="bg-[#00D084]/10 text-[#00D084] text-[10px] font-bold px-3 py-1.5 rounded-xl border border-[#00D084]/20 active:scale-95">
              {detectingLocation ? "..." : "GPS"}
            </button>
          </div>
        </div>

        {/* TOMBOL SIMPAN */}
        <button
          onClick={handleSave}
          disabled={isLoading || !businessName || !category || !location}
          className="w-full flex items-center justify-center rounded-2xl py-4 transition-all active:scale-95"
          style={{
            background: (!businessName || !category || !location) ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)",
            color: (!businessName || !category || !location) ? "#4B5563" : "white",
            fontSize: 16, fontWeight: 800,
            boxShadow: (!businessName || !category || !location) ? "none" : "0 10px 25px -5px rgba(0,208,132,0.4)"
          }}
        >
          {isLoading ? "MENYIMPAN..." : "KONFIRMASI PROFIL"}
        </button>
      </div>
    </div>
  );
}

// import { useState, useRef } from "react";
// import { useNavigate } from "react-router";
// import { motion } from "motion/react";
// import { Building2, FileText, Tag, MapPin, Camera, ChevronDown, CheckCircle } from "lucide-react";
// import { useApp } from "../../context/AppContext";
// // 1. Pastikan import Google Maps tersedia
// import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

// const CATEGORIES = ["Makanan & Minuman", "Elektronik", "Fashion & Pakaian", "Otomotif", "Kesehatan", "Furnitur", "Bahan Baku Industri", "Pertanian", "Lainnya"];
// const libraries: ("places")[] = ["places"];

// export function ProfileSetupScreen() {
//   const navigate = useNavigate();
//   const { setupProfile, user } = useApp();
  
//   // 2. Ref untuk Autocomplete
//   const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

//   const [businessName, setBusinessName] = useState("");
//   const [description, setDescription] = useState("");
//   const [category, setCategory] = useState("");
//   const [location, setLocation] = useState("");
//   const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null); // State koordinat
  
//   const [showCategories, setShowCategories] = useState(false);
//   const [detectingLocation, setDetectingLocation] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [done, setDone] = useState(false);

//   // 3. Load Google Maps Engine
//   const { isLoaded } = useJsApiLoader({
//     id: "google-map-script",
//     googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE", 
//     libraries: libraries,
//   });

//   // Fungsi 1: Input Lokasi via GPS (Direct)
//   const detectLocation = async () => {
//     if (!navigator.geolocation) {
//       alert("Geolokasi tidak didukung oleh browser Anda.");
//       return;
//     }
//     setDetectingLocation(true);
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         setCoords({ lat: latitude, lng: longitude });

//         try {
//           const response = await fetch(
//             `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY_HERE`
//           );
//           const data = await response.json();
//           if (data.results && data.results.length > 0) {
//             setLocation(data.results[0].formatted_address);
//           }
//         } catch (error) {
//           setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
//         } finally {
//           setDetectingLocation(false);
//         }
//       },
//       () => {
//         setDetectingLocation(false);
//         alert("Gagal mendapatkan lokasi. Pastikan izin GPS aktif.");
//       },
//       { enableHighAccuracy: true }
//     );
//   };

//   // Fungsi 2: Input Lokasi via Autocomplete
//   const onPlaceChanged = () => {
//     if (autocompleteRef.current) {
//       const place = autocompleteRef.current.getPlace();
//       setLocation(place.formatted_address || "");
      
//       if (place.geometry?.location) {
//         setCoords({
//           lat: place.geometry.location.lat(),
//           lng: place.geometry.location.lng()
//         });
//       }
//     }
//   };

//   const handleSave = async () => {
//     if (!businessName || !category || !location) return;
//     setIsLoading(true);
//     await new Promise((r) => setTimeout(r, 1200));

//     setupProfile({ 
//       businessName, 
//       description, 
//       category, 
//       location, 
//       coordinates: coords, // Kirim koordinat ke database
//       avatar: businessName.substring(0, 2).toUpperCase(),
//     });

//     setDone(true);
//     await new Promise((r) => setTimeout(r, 1000));
//     navigate("/app/home");
//   };

//   if (done) {
//     return (
//       <div className="min-h-[788px] flex flex-col items-center justify-center" style={{ background: "#0A0E1A" }}>
//         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="flex flex-col items-center gap-4">
//           <div className="rounded-full flex items-center justify-center" style={{ width: 96, height: 96, background: "rgba(0,208,132,0.15)" }}>
//             <CheckCircle size={52} style={{ color: "#00D084" }} />
//           </div>
//           <div style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9" }}>Profil Berhasil Dibuat!</div>
//           <div style={{ fontSize: 14, color: "#64748B" }}>Siap temukan mitra bisnis Anda...</div>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-[788px] flex flex-col relative overflow-hidden" style={{ background: "#0A0E1A" }}>
//       <div className="absolute top-0 inset-x-0 h-64 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,208,132,0.1) 0%, transparent 70%)" }} />

//       <div className="px-6 pt-4 pb-4 z-10">
//         <div style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>Lengkapi Profil Bisnis</div>
//         <div style={{ fontSize: 13, color: "#64748B" }}>Bantu mitra menemukan Anda dengan lebih mudah</div>
//       </div>

//       {/* Progress Bar Tetap Sama */}
//       <div className="px-6 mb-4 z-10">
//         <div className="flex items-center gap-2">
//           {["Akun", "Profil", "Siap!"].map((step, i) => (
//             <div key={step} className="flex items-center gap-2 flex-1">
//               <div className="flex items-center gap-1">
//                 <div className="flex items-center justify-center rounded-full text-xs font-bold" style={{ width: 24, height: 24, background: i <= 1 ? "linear-gradient(135deg, #00D084, #3B82F6)" : "rgba(255,255,255,0.06)", color: i <= 1 ? "white" : "#4B5563" }}>
//                   {i === 0 ? "✓" : i + 1}
//                 </div>
//                 <span style={{ fontSize: 11, color: i <= 1 ? "#00D084" : "#4B5563" }}>{step}</span>
//               </div>
//               {i < 2 && <div className="h-0.5 flex-1" style={{ background: i < 1 ? "#00D084" : "rgba(255,255,255,0.08)" }} />}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto px-4 pb-6 z-10">
//         {/* ... (Avatar, Nama Bisnis, Deskripsi, Kategori tetap sama) ... */}

//         {/* --- BAGIAN LOKASI (AUTOCOMPLETE & DIRECT) --- */}
//         <div className="mb-6 mt-4">
//           <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Lokasi Bisnis *</label>
//           <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
//             <MapPin size={18} style={{ color: "#00D084", flexShrink: 0 }} />
            
//             {/* Bungkus Input dengan Autocomplete */}
//             {isLoaded ? (
//               <Autocomplete
//                 onLoad={(auto) => (autocompleteRef.current = auto)}
//                 onPlaceChanged={onPlaceChanged}
//                 className="flex-1"
//               >
//                 <input
//                   type="text"
//                   placeholder="Ketik alamat atau cari gedung..."
//                   value={location}
//                   onChange={(e) => setLocation(e.target.value)}
//                   className="w-full bg-transparent outline-none"
//                   style={{ fontSize: 14, color: "#F1F5F9" }}
//                 />
//               </Autocomplete>
//             ) : (
//               <input disabled className="flex-1 bg-transparent" placeholder="Memuat Maps..." />
//             )}

//             <button
//               onClick={detectLocation}
//               className="rounded-xl px-3 py-1.5 transition-all active:scale-95"
//               style={{ background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)", fontSize: 11, color: "#00D084", fontWeight: 600 }}
//             >
//               {detectingLocation ? "..." : "📍 Detect"}
//             </button>
//           </div>
//         </div>

//         {/* Save button */}
//         <button
//           onClick={handleSave}
//           disabled={isLoading || !businessName || !category || !location}
//           className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all active:scale-95"
//           style={{
//             background: (!businessName || !category || !location) ? "rgba(0,208,132,0.3)" : "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)",
//             boxShadow: (!businessName || !category || !location) ? "none" : "0 8px 24px rgba(0,208,132,0.3)",
//             fontSize: 15,
//             fontWeight: 700,
//             color: "white",
//           }}
//         >
//           {isLoading ? "Memproses..." : "▶ SIMPAN PROFIL"}
//         </button>
//       </div>
//     </div>
//   );
// }
