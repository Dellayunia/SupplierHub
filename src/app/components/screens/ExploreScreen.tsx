import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, Map, List, Star, MapPin, Navigation, Plus, Minus, SlidersHorizontal } from "lucide-react";
import axios from "axios";
import { PARTNERS, Partner } from "../../data/mockData";
import { BottomNav } from "../BottomNav";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useApp } from "../../context/AppContext";

const CATEGORIES = ["Semua", "Cafe", "Toko", "Bengkel", "Restoran", "Bakeri", "Hotel"];
const mapContainerStyle = { width: '100%', height: '340px' };
const libraries: ("places")[] = ["places"];

// Komputasi Haversine & SAW telah dipindahkan ke backend (backend/index.js)
// Frontend hanya mengkonsumsi data matang dari POST /api/recommendations

export function ExploreScreen() {
  const navigate = useNavigate();
  const { user } = useApp(); 
  
  const center = user?.coordinates || { lat: -6.200000, lng: 106.816666 };
  const [mode, setMode] = useState<"map" | "list">("map");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [realPartners, setRealPartners] = useState<any[]>([]);

  // ── Fetch rekomendasi dari backend (Haversine + SAW diproses di server) ──
  const fetchRecommendations = async (lat: number, lng: number, category: string) => {
    try {
      const res = await axios.post("http://localhost:3000/api/recommendations", {
        lat,
        lng,
        category,
      });
      // Backend mengembalikan data yang sudah diurutkan berdasarkan sawScore
      setRealPartners(res.data);
    } catch (e) {
      console.error("Gagal mengambil rekomendasi dari backend:", e);
    }
  };

  // Panggil backend saat koordinat user tersedia
  useEffect(() => {
    if (center.lat && center.lng) {
      fetchRecommendations(center.lat, center.lng, user?.category ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);

  // handleMapLoad tetap ada agar prop onMapLoad di MapView tidak error
  const handleMapLoad = (_map: google.maps.Map) => {};

  // Filter lokal (kategori & search) — sawScore sudah dihitung di backend
  const filteredPartners = useMemo(() => {
    let list = realPartners;
    if (selectedCategory !== "Semua")
      list = list.filter((p) =>
        p.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    if (searchQuery)
      list = list.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    // Data sudah terurut berdasarkan sawScore dari backend
    return list;
  }, [selectedCategory, searchQuery, realPartners]);

  const selectedPartner = selectedId ? PARTNERS.find((p) => p.id === selectedId) : null;

  return (
    <div className="relative flex flex-col min-h-[788px]" style={{ background: "#0B0F1A" }}>
      {/* Search + Filter bar */}
      <div className="px-4 pt-3 pb-2 z-20" style={{ background: "#0B0F1A" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center rounded-2xl px-3 gap-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", height: 44 }}>
            <Search size={16} style={{ color: "#4B5563" }} />
            <input
              type="text"
              placeholder="Cari mitra bisnis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 13, color: "#F1F5F9" }}
            />
          </div>
          <button className="flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)" }}>
            <SlidersHorizontal size={16} style={{ color: "#00D084" }} />
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flex-shrink-0 rounded-xl px-3 py-1.5 transition-all"
              style={{
                background: selectedCategory === cat ? "linear-gradient(135deg, #00D084, #3B82F6)" : "rgba(255,255,255,0.05)",
                border: selectedCategory === cat ? "none" : "1px solid rgba(255,255,255,0.08)",
                fontSize: 12,
                fontWeight: 600,
                color: selectedCategory === cat ? "white" : "#64748B",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="flex items-center justify-center gap-1 mt-2 rounded-2xl p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { id: "map", icon: Map, label: "Peta" },
            { id: "list", icon: List, label: "List" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as "map" | "list")}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2 transition-all"
              style={{
                background: mode === m.id ? "linear-gradient(135deg, #00D084, #3B82F6)" : "transparent",
                fontSize: 12,
                fontWeight: 600,
                color: mode === m.id ? "white" : "#4B5563",
              }}
            >
              <m.icon size={14} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {mode === "map" ? (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Map */}
              <MapView partners={filteredPartners} selectedId={selectedId} onSelect={setSelectedId} onMapLoad={handleMapLoad} center={center}/>

              {/* Bottom sheet list */}
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>
                    ⭐ Mitra Prioritas <span style={{ color: "#4B5563", fontSize: 12 }}>({filteredPartners.length})</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {filteredPartners.map((partner) => {
                    const isSelected = selectedId === partner.id;
                    return (
                      <motion.button
                        key={partner.id}
                        onClick={() => navigate(`/app/explore/${partner.id}`)}
                        className="w-full flex items-center gap-3 rounded-2xl p-3 text-left transition-all"
                        style={{
                          background: isSelected ? "rgba(0,208,132,0.08)" : "rgba(255,255,255,0.04)",
                          border: isSelected ? "1px solid rgba(0,208,132,0.3)" : "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <img src={partner.image} alt={partner.name} className="rounded-xl object-cover flex-shrink-0" style={{ width: 50, height: 50 }} />
                        <div className="flex-1 min-w-0">
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }} className="truncate">{partner.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={11} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                            <span style={{ fontSize: 11, color: "#F59E0B" }}>{partner.rating}</span>
                            <span style={{ fontSize: 11, color: "#2D3748" }}>•</span>
                            <span style={{ fontSize: 11, color: "#64748B" }}>{partner.distance} km • {partner.category}</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pt-3">
              <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
                {filteredPartners.length} mitra ditemukan — diurutkan berdasarkan AI Score
              </div>
              <div className="flex flex-col gap-3">
                {filteredPartners.map((partner, idx) => {
                  // Menggunakan skor SAW yang sudah dihitung di useMemo
                  const score = partner.sawScore;
                  
                  return (
                    <motion.button
                      key={partner.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => navigate(`/app/explore/${partner.id}`)}
                      className="w-full flex items-start gap-3 rounded-2xl p-3 text-left transition-all active:scale-98"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <img src={partner.image} alt={partner.name} className="rounded-2xl object-cover flex-shrink-0" style={{ width: 72, height: 72 }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{partner.name}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={11} style={{ color: i < Math.floor(partner.rating) ? "#F59E0B" : "#2D3748", fill: i < Math.floor(partner.rating) ? "#F59E0B" : "transparent" }} />
                              ))}
                              <span style={{ fontSize: 11, color: "#94A3B8", marginLeft: 2 }}>{partner.rating} ({partner.reviewCount})</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin size={11} style={{ color: "#4B5563" }} />
                              <span style={{ fontSize: 11, color: "#64748B" }}>{partner.distance} km • {partner.category}</span>
                            </div>
                          </div>
                          <div
                            className="rounded-xl px-2.5 py-1.5 flex-shrink-0 ml-2"
                            style={{ background: score >= 80 ? "rgba(0,208,132,0.12)" : "rgba(59,130,246,0.12)", border: `1px solid ${score >= 80 ? "rgba(0,208,132,0.2)" : "rgba(59,130,246,0.2)"}` }}
                          >
                            <div style={{ fontSize: 15, fontWeight: 700, color: score >= 80 ? "#00D084" : "#60A5FA" }}>{score}</div>
                            <div style={{ fontSize: 8, color: "#4B5563", textAlign: "center" }}>Score</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: "#4B5563", marginTop: 6 }} className="line-clamp-1">
                          {partner.description}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}

function MapView({ partners, selectedId, onSelect, onMapLoad, center }: any) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE", 
    libraries: libraries
  });

  return isLoaded ? (
    <div className="relative overflow-hidden" style={{ height: 340 }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        onLoad={onMapLoad} 
        options={{
          disableDefaultUI: false, 
          mapTypeId: 'roadmap',   
        }}
      >
        {partners.map((p: any) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            onClick={() => onSelect(p.id)}
          />
        ))}
      </GoogleMap>
    </div>
  ) : <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memuat Peta...</div>;
}
