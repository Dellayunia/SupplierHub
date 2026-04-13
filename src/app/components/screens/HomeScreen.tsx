import { useState, useEffect, useMemo } from "react"; // Tambahkan useMemo

import { useNavigate } from "react-router";

import { motion } from "motion/react";

import { Bell, TrendingUp, Star, MapPin, ChevronRight, Zap, Target, Users, Package, Compass } from "lucide-react";

import { PARTNERS, Partner } from "../../data/mockData";

import { useApp } from "../../context/AppContext";

import { BottomNav } from "../BottomNav";

import { useJsApiLoader } from '@react-google-maps/api';



const libraries: ("places")[] = ["places"];



// --- 1. ALGORITMA HAVERSINE (Global) ---

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {

  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

  const R = 6371; 

  const dLat = (lat2 - lat1) * (Math.PI / 180);

  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +

            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *

            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return parseFloat((R * c).toFixed(1)); 

};



export function HomeScreen() {

  const navigate = useNavigate();

  const { user, applications } = useApp();

  const [notifCount] = useState(3);



  const [livePartners, setLivePartners] = useState<any[]>([]);

  const [isSearching, setIsSearching] = useState(true);



  const stats = {

    total: applications.length,

    accepted: applications.filter((a) => a.status === "accepted").length,

    pending: applications.filter((a) => a.status === "pending").length,

  };



  const { isLoaded } = useJsApiLoader({

    id: 'google-map-script',

    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE", 

    libraries: libraries,

  });



  // --- 2. FUNGSI PENCARIAN DATA MENTAH DARI GOOGLE ---

  useEffect(() => {

    if (!isLoaded) return;



    if (!user?.coordinates) {

      setIsSearching(false);

      return;

    }



    try {

      const mapDiv = document.createElement('div');

      const map = new window.google.maps.Map(mapDiv);

      const service = new window.google.maps.places.PlacesService(map);

      

      const userLocation = new window.google.maps.LatLng(user.coordinates.lat, user.coordinates.lng);



      const request = {

        location: userLocation,

        radius: 5000,

        type: 'supermarket', 

      };



      service.nearbySearch(request, (results, status) => {

        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {

          const rawFormatted = results.map((place) => {

            const partnerLat = place.geometry?.location?.lat() || 0;

            const partnerLng = place.geometry?.location?.lng() || 0;

            const dist = calculateDistance(user.coordinates!.lat, user.coordinates!.lng, partnerLat, partnerLng);

            

            return {

              id: place.place_id,

              name: place.name,

              rating: place.rating || 4.0,

              distance: dist,

              image: place.photos && place.photos.length > 0 

                     ? place.photos[0].getUrl({ maxWidth: 200 }) 

                     : "https://placehold.co/150x150/1a2640/4B5563?text=Toko",

              category: "Mitra Bisnis",

            };

          });

          setLivePartners(rawFormatted);

        }

        setIsSearching(false);

      });

    } catch (error) {

      console.error("Error mencari lokasi:", error);

      setIsSearching(false);

    }

  }, [isLoaded, user?.coordinates]);



  // --- 3. IMPLEMENTASI ALGORITMA AI (METODE SAW) ---

  const top3RecommendedPartners = useMemo(() => {

    if (livePartners.length === 0) return [];



    const W_JARAK = 0.6; // Bobot Jarak 60%

    const W_RATING = 0.4; // Bobot Rating 40%



    const minJarak = Math.min(...livePartners.map((p) => p.distance));

    const maxRating = Math.max(...livePartners.map((p) => p.rating));



    const scoredList = livePartners.map((partner) => {

      const normJarak = partner.distance === 0 ? 1 : (minJarak / partner.distance);

      const normRating = maxRating === 0 ? 0 : (partner.rating / maxRating);

      const finalScore = Math.round(((W_JARAK * normJarak) + (W_RATING * normRating)) * 100);



      return { ...partner, sawScore: finalScore };

    });



    return scoredList.sort((a, b) => b.sawScore - a.sawScore).slice(0, 3);

  }, [livePartners]);



  return (

    <div className="relative flex flex-col min-h-[788px]" style={{ background: "#0B0F1A" }}>

      <div className="flex-1 overflow-y-auto pb-24">

        

        {/* Header (Tetap) */}

        <div className="px-5 pt-3 pb-6" style={{ background: "linear-gradient(180deg, rgba(0,208,132,0.08) 0%, transparent 100%)" }}>

          <div className="flex items-center justify-between mb-4">

            <div>

              <div style={{ fontSize: 13, color: "#64748B" }}>Selamat datang,</div>

              <div style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", marginTop: 1 }}>

                {user?.businessName || user?.name || "Supplier"} 👋

              </div>

            </div>

            <div className="flex items-center gap-2">

              <button 

                onClick={() => navigate("/app/applications")} 

                className="relative flex items-center justify-center rounded-2xl transition-all active:scale-95" 

                style={{ width: 44, height: 44, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}

              >

                <Bell size={20} style={{ color: "#94A3B8" }} />

                {notifCount > 0 && (

                  <div className="absolute -top-1 -right-1 rounded-full flex items-center justify-center" style={{ width: 16, height: 16, background: "#EF4444", fontSize: 9, color: "white", fontWeight: 700 }}>

                    {notifCount}

                  </div>

                )}

              </button>

              <div className="flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: "linear-gradient(135deg, #00D084, #3B82F6)", fontSize: 16, fontWeight: 700, color: "white" }}>

                {(user?.businessName || user?.name || "U").substring(0, 2).toUpperCase()}

              </div>

            </div>

          </div>



          <div className="grid grid-cols-3 gap-3">

            {[

              { label: "Total Lamaran", value: stats.total, color: "#3B82F6", icon: Target },

              { label: "Diterima", value: stats.accepted, color: "#00D084", icon: Users },

              { label: "Proses", value: stats.pending, color: "#F59E0B", icon: TrendingUp },

            ].map((stat) => (

              <motion.button

                key={stat.label}

                whileTap={{ scale: 0.95 }}

                onClick={() => navigate("/app/applications")}

                className="rounded-2xl p-3 text-left"

                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}

              >

                <stat.icon size={16} style={{ color: stat.color, marginBottom: 6 }} />

                <div style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9" }}>{stat.value}</div>

                <div style={{ fontSize: 10, color: "#64748B", marginTop: 1 }}>{stat.label}</div>

              </motion.button>

            ))}

          </div>

        </div>



        {/* Fitur Utama (Tetap) */}

        <div className="px-5 mb-6 grid grid-cols-2 gap-4">

          <motion.button onClick={() => navigate("/app/catalog")} className="flex flex-col justify-between p-5 rounded-[28px] relative overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.02) 100%)", border: "1px solid rgba(59,130,246,0.2)", height: 180 }}>

            <div className="z-10">

              <div style={{ fontSize: 18, fontWeight: 800, color: "#60A5FA" }}>Kelola<br/>Katalog</div>

              <div className="mt-2 rounded-full px-3 py-1 inline-block" style={{ background: "rgba(59,130,246,0.2)", fontSize: 10, fontWeight: 700, color: "#93C5FD" }}>Update Produk</div>

            </div>

            <Package size={110} style={{ color: "rgba(59,130,246,0.15)", position: "absolute", bottom: -20, right: -25, transform: "rotate(-15deg)" }} />

          </motion.button>



          <motion.button onClick={() => navigate("/app/explore")} className="flex flex-col justify-between p-5 rounded-[28px] relative overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(0,208,132,0.15) 0%, rgba(0,208,132,0.02) 100%)", border: "1px solid rgba(0,208,132,0.2)", height: 180 }}>

            <div className="z-10">

              <div style={{ fontSize: 18, fontWeight: 800, color: "#00D084" }}>Cari<br/>Mitra B2B</div>

              <div className="mt-2 rounded-full px-3 py-1 inline-block" style={{ background: "rgba(0,208,132,0.2)", fontSize: 10, fontWeight: 700, color: "#6EE7B7" }}>Gunakan Peta</div>

            </div>

            <Compass size={110} style={{ color: "rgba(0,208,132,0.15)", position: "absolute", bottom: -20, right: -25, transform: "rotate(15deg)" }} />

          </motion.button>

        </div>



        {/* AI Banner (Tetap) */}

        <div className="px-5 mb-5">

          <motion.div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)" }}>

            <div className="absolute -right-4 -bottom-4 opacity-10"><Zap size={100} color="white" /></div>

            <div className="relative z-10 flex items-center justify-between">

                <div>

                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 700, marginBottom: 4 }}>⚡ AI RECOMMENDATION</div>

                  <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>

                    {isSearching ? "Memindai Area..." : `${livePartners.length} Mitra Ditemukan`}

                  </div>

                </div>

                <button onClick={() => navigate("/app/explore")} className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)", color: "white", backdropFilter: "blur(10px)" }}>

                  <ChevronRight size={20} />

                </button>

            </div>

          </motion.div>

        </div>



        {/* --- BAGIAN MITRA PRIORITAS (DIPERBARUI DENGAN SAW) --- */}

        <div className="px-5 mb-4">

          <div className="flex items-center justify-between mb-3">

            <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>🏆 Mitra Prioritas</div>

            <button onClick={() => navigate("/app/explore")} style={{ fontSize: 12, color: "#00D084", fontWeight: 600 }}>Lihat semua</button>

          </div>



          <div className="flex flex-col gap-3">

            {isSearching ? (

              <div className="text-center py-6 text-sm text-[#94A3B8]">Mengambil data dari Google Maps...</div>

            ) : top3RecommendedPartners.length === 0 ? (

               <div className="text-center py-6 text-sm text-[#94A3B8]">Belum ada mitra di lokasi Anda.</div>

            ) : (

              top3RecommendedPartners.map((partner, idx) => (

                <motion.button

                  key={partner.id}

                  initial={{ opacity: 0, x: -20 }}

                  animate={{ opacity: 1, x: 0 }}

                  transition={{ delay: idx * 0.08 }}

                  onClick={() => navigate(`/app/explore/${partner.id}`)}

                  className="w-full flex items-center gap-3 rounded-2xl p-3 text-left transition-all active:scale-98"

                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}

                >

                  <div className="flex-shrink-0 flex items-center justify-center rounded-xl" style={{ width: 28, height: 28, background: idx === 0 ? "rgba(0,208,132,0.15)" : "rgba(255,255,255,0.05)", fontSize: 13, fontWeight: 700, color: idx === 0 ? "#00D084" : "#4B5563" }}>

                    #{idx + 1}

                  </div>



                  <img src={partner.image} alt={partner.name} className="rounded-xl object-cover flex-shrink-0" style={{ width: 52, height: 52 }} />



                  <div className="flex-1 min-w-0">

                    <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }} className="truncate">{partner.name}</div>

                    <div className="flex items-center gap-1.5 mt-0.5">

                      <Star size={11} style={{ color: "#F59E0B", fill: "#F59E0B" }} />

                      <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>{partner.rating}</span>

                      <span style={{ fontSize: 11, color: "#4B5563" }}>•</span>

                      <MapPin size={11} style={{ color: "#64748B" }} />

                      <span style={{ fontSize: 11, color: "#64748B" }}>{partner.distance} km</span>

                    </div>

                  </div>



                  <div className="flex flex-col items-center flex-shrink-0">

                    <div

                      className="rounded-xl px-2.5 py-1"

                      style={{ 

                        background: partner.sawScore >= 80 ? "rgba(0,208,132,0.15)" : "rgba(59,130,246,0.15)", 

                        fontSize: 14, 

                        fontWeight: 700, 

                        color: partner.sawScore >= 80 ? "#00D084" : "#60A5FA" 

                      }}

                    >

                      {partner.sawScore}

                    </div>

                    <div style={{ fontSize: 9, color: "#4B5563", marginTop: 2 }}>AI Score</div>

                  </div>

                </motion.button>

              ))

            )}

          </div>

        </div>



      </div>

      <BottomNav />

    </div>

  );

}
