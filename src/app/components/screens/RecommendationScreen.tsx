import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Star, MapPin, Zap, TrendingUp, ArrowLeft, ChevronRight } from "lucide-react";
import { PARTNERS, calculateScore } from "../../data/mockData";
import { BottomNav } from "../BottomNav";

const RADIUS_OPTIONS = [2, 5, 10, 20];

export function RecommendationScreen() {
  const navigate = useNavigate();
  const [radius, setRadius] = useState(10);

  const recommendations = useMemo(() => {
    return PARTNERS.filter((p) => p.distance <= radius)
      .map((p) => ({ ...p, score: calculateScore(p.rating, p.distance, radius) }))
      .sort((a, b) => b.score - a.score);
  }, [radius]);

  return (
    <div className="relative flex flex-col min-h-[788px]" style={{ background: "#0B0F1A" }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-4" style={{ background: "rgba(0,208,132,0.04)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center rounded-2xl" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ArrowLeft size={18} style={{ color: "#94A3B8" }} />
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>Rekomendasi AI</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Berdasarkan lokasi & rating Google Maps</div>
          </div>
        </div>

        {/* Algorithm info */}
        <div className="rounded-2xl p-3 mb-4" style={{ background: "rgba(0,208,132,0.06)", border: "1px solid rgba(0,208,132,0.12)" }}>
          <div className="flex items-start gap-2">
            <Zap size={16} style={{ color: "#00D084", flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#00D084", marginBottom: 3 }}>Algoritma Scoring AI</div>
              <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace", background: "rgba(0,0,0,0.3)", padding: "6px 10px", borderRadius: 8, lineHeight: 1.6 }}>
                score = (rating/5 × 0.6) + (1 - jarak/radius × 0.4)
              </div>
            </div>
          </div>
        </div>

        {/* Radius filter */}
        <div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 8 }}>📍 Radius Pencarian</div>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className="flex-1 rounded-xl py-2 transition-all"
                style={{
                  background: radius === r ? "linear-gradient(135deg, #00D084, #3B82F6)" : "rgba(255,255,255,0.05)",
                  border: radius === r ? "none" : "1px solid rgba(255,255,255,0.08)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: radius === r ? "white" : "#64748B",
                }}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-28">
        <div style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
          <span style={{ color: "#00D084", fontWeight: 700 }}>{recommendations.length}</span> mitra dalam radius{" "}
          <span style={{ color: "#F1F5F9", fontWeight: 600 }}>{radius} km</span>
        </div>

        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div style={{ fontSize: 48 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#F1F5F9" }}>Tidak Ada Hasil</div>
            <div style={{ fontSize: 13, color: "#64748B", textAlign: "center" }}>Coba perbesar radius pencarian Anda</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recommendations.map((partner, idx) => {
              const ratingScore = Math.round((partner.rating / 5) * 0.6 * 100);
              const distScore = Math.round((1 - partner.distance / radius) * 0.4 * 100);
              return (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="rounded-3xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  {/* Rank strip */}
                  <div
                    className="flex items-center justify-between px-4 py-2"
                    style={{
                      background: idx < 3 ? "linear-gradient(135deg, rgba(0,208,132,0.1), rgba(59,130,246,0.1))" : "rgba(255,255,255,0.02)",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 16 }}>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: idx < 3 ? "#00D084" : "#64748B" }}>
                        Rank #{idx + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} style={{ color: "#00D084" }} />
                      <span style={{ fontSize: 11, color: "#00D084", fontWeight: 600 }}>AI Score: {partner.score}</span>
                    </div>
                  </div>

                  {/* Partner info */}
                  <button
                    onClick={() => navigate(`/app/explore/${partner.id}`)}
                    className="w-full p-4 flex items-start gap-3 text-left"
                  >
                    <img src={partner.image} alt={partner.name} className="rounded-2xl object-cover flex-shrink-0" style={{ width: 68, height: 68 }} />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>{partner.name}</div>
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={12} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                        <span style={{ fontSize: 12, color: "#F59E0B", fontWeight: 600 }}>{partner.rating}</span>
                        <span style={{ fontSize: 12, color: "#2D3748" }}>({partner.reviewCount} ulasan)</span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        <MapPin size={12} style={{ color: "#4B5563" }} />
                        <span style={{ fontSize: 12, color: "#64748B" }}>{partner.distance} km • {partner.category}</span>
                      </div>

                      {/* Score breakdown */}
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-lg p-2" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.12)" }}>
                          <div style={{ fontSize: 9, color: "#F59E0B", fontWeight: 600, marginBottom: 2 }}>RATING</div>
                          <div style={{ height: 3, borderRadius: 99, background: "rgba(245,158,11,0.2)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${ratingScore}%`, background: "#F59E0B", borderRadius: 99 }} />
                          </div>
                          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{ratingScore}pts</div>
                        </div>
                        <div className="flex-1 rounded-lg p-2" style={{ background: "rgba(0,208,132,0.08)", border: "1px solid rgba(0,208,132,0.12)" }}>
                          <div style={{ fontSize: 9, color: "#00D084", fontWeight: 600, marginBottom: 2 }}>JARAK</div>
                          <div style={{ height: 3, borderRadius: 99, background: "rgba(0,208,132,0.2)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${distScore}%`, background: "#00D084", borderRadius: 99 }} />
                          </div>
                          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{distScore}pts</div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: "#2D3748", flexShrink: 0, marginTop: 4 }} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
