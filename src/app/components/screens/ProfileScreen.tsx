import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Edit3, LogOut, MapPin, Tag, Bell, Shield, ChevronRight, TrendingUp, Target, Users, Zap, Package } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { BottomNav } from "../BottomNav";

export function ProfileScreen() {
  const navigate = useNavigate();
  const { applications, logout } = useApp();
  const { user } = useApp();
// Di dalam return UI:
  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#00D084]">
    {user?.avatar && user.avatar.length > 2 ? (
      // Jika avatar berisi Base64 (foto), tampilkan gambarnya
      <img 
        src={user.avatar} 
        alt="Profile" 
        className="w-full h-full object-cover" 
      />
    ) : (
      // Jika avatar hanya berisi inisial (misal: "KM"), tampilkan teks
      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-2xl font-bold text-white">
        {user?.avatar || "U"}
      </div>
    )}
  </div>
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const stats = {
    total: applications.length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    pending: applications.filter((a) => a.status === "pending").length,
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: Package, label: "Katalog Produk", desc: "Kelola produk & spesifikasi B2B", color: "#00D084", action: () => navigate("/app/catalog") },
    // { icon: Bell, label: "Notifikasi", desc: "Kelola notifikasi lamaran", color: "#F59E0B" },
    // { icon: Shield, label: "Keamanan Akun", desc: "Password & verifikasi 2 langkah", color: "#3B82F6" },
    { icon: Zap, label: "Rekomendasi AI", desc: "Lihat mitra terbaik untuk Anda", color: "#00D084", action: () => navigate("/app/recommendation") },
  ];

  return (
    <div className="relative flex flex-col min-h-[788px]" style={{ background: "#0B0F1A" }}>
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Profile header */}
        <div
          className="px-5 pt-4 pb-6 relative overflow-hidden"
          style={{ background: "linear-gradient(180deg, rgba(0,208,132,0.07) 0%, transparent 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,208,132,0.06) 0%, transparent 70%)" }} />

          <div className="flex items-start justify-between mb-5">
            <div style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>Profil Saya</div>
            <button
              onClick={() => navigate("/profile-setup")}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2"
              style={{ background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)", fontSize: 12, color: "#00D084", fontWeight: 600 }}
            >
              <Edit3 size={13} /> Edit
            </button>
          </div>

          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="flex items-center justify-center rounded-3xl"
                style={{
                  width: 76,
                  height: 76,
                  background: "linear-gradient(135deg, #00D084, #3B82F6)",
                  fontSize: 28,
                  fontWeight: 800,
                  color: "white",
                  boxShadow: "0 8px 24px rgba(0,208,132,0.3)",
                }}
              >
                {(user?.businessName || user?.name || "U").substring(0, 2).toUpperCase()}
              </div>
              {/* Online indicator */}
              <div
                className="absolute -bottom-1 -right-1 rounded-full border-2"
                style={{ width: 18, height: 18, background: "#00D084", borderColor: "#0B0F1A" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>
                {user?.businessName || user?.name || "Pengguna"}
              </div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{user?.email}</div>
              <div
                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-0.5 mt-2"
                style={{ background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.15)" }}
              >
                <div className="rounded-full" style={{ width: 6, height: 6, background: "#00D084" }} />
                <span style={{ fontSize: 10, color: "#00D084", fontWeight: 600 }}>AKTIF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="px-5 mb-4">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {[
              { icon: Tag, label: "Kategori", value: user?.category || "Belum diset", color: "#3B82F6" },
              { icon: MapPin, label: "Lokasi", value: user?.location || "Belum diset", color: "#00D084" },
            ].map((item, i) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <item.icon size={16} style={{ color: item.color, flexShrink: 0 }} />
                <div className="flex-1">
                  <div style={{ fontSize: 10, color: "#4B5563", fontWeight: 600, marginBottom: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: "#F1F5F9" }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="px-5 mb-4">
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 10 }}>📊 Statistik Lamaran</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", value: stats.total, color: "#3B82F6", icon: Target },
              { label: "Diterima", value: stats.accepted, color: "#00D084", icon: Users },
              { label: "Proses", value: stats.pending, color: "#F59E0B", icon: TrendingUp },
              { label: "Ditolak", value: stats.rejected, color: "#EF4444", icon: Target },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileTap={{ scale: 0.95 }}
                className="rounded-2xl p-3 flex flex-col items-center gap-1"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: "#64748B", textAlign: "center" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress chart */}
        <div className="px-5 mb-4">
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10 }}>Tingkat Keberhasilan</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: stats.total > 0 ? `${(stats.accepted / stats.total) * 100}%` : "0%",
                    background: "linear-gradient(135deg, #00D084, #3B82F6)",
                  }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#00D084" }}>
                {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#4B5563" }}>
              {stats.accepted} dari {stats.total} lamaran diterima
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="px-5 mb-4">
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 10 }}>⚙️ Pengaturan</div>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {menuItems.map((item, i) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-white/5"
                style={{ borderBottom: i < menuItems.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              >
                <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 36, height: 36, background: `${item.color}15` }}>
                  <item.icon size={16} style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{item.desc}</div>
                </div>
                <ChevronRight size={14} style={{ color: "#2D3748" }} />
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="px-5 mb-4">
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 14, fontWeight: 600, color: "#EF4444" }}
            >
              <LogOut size={16} />
              Keluar dari Akun
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-4"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 4, textAlign: "center" }}>
                Yakin ingin keluar?
              </div>
              <div style={{ fontSize: 12, color: "#64748B", textAlign: "center", marginBottom: 12 }}>
                Anda harus masuk kembali untuk menggunakan aplikasi
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl py-2.5"
                  style={{ background: "rgba(255,255,255,0.05)", fontSize: 13, fontWeight: 600, color: "#94A3B8" }}
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-xl py-2.5"
                  style={{ background: "#EF4444", fontSize: 13, fontWeight: 700, color: "white" }}
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="px-5 pb-4 text-center">
          <div style={{ fontSize: 11, color: "#1E293B" }}>SupplierAI v1.0.0 • Made with ❤️ in Indonesia</div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
