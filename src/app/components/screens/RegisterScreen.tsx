import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Semua kolom wajib diisi");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setIsLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1200));
    register(name, email, password);
    navigate("/profile-setup");
  };

  return (
    <div
      className="min-h-[788px] flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0A0E1A 0%, #0B1120 60%, #0A1828 100%)" }}
    >
      <div
        className="absolute top-0 inset-x-0 h-72 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Back button + Header */}
      <div className="flex items-center gap-3 px-6 pt-4 pb-2 z-10">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center justify-center rounded-2xl"
          style={{ width: 40, height: 40, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ArrowLeft size={18} style={{ color: "#94A3B8" }} />
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>Buat Akun Baru</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Mulai temukan mitra bisnis Anda</div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 px-6 py-3 z-10">
        {["Akun", "Profil", "Siap!"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div
                className="flex items-center justify-center rounded-full text-xs font-bold"
                style={{
                  width: 24, height: 24,
                  background: i === 0 ? "linear-gradient(135deg, #00D084, #3B82F6)" : "rgba(255,255,255,0.06)",
                  color: i === 0 ? "white" : "#4B5563",
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: 11, color: i === 0 ? "#00D084" : "#4B5563" }}>{step}</span>
            </div>
            {i < 2 && <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.08)", width: 20 }} />}
          </div>
        ))}
      </div>

      {/* Form */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-4 mt-2 rounded-3xl p-6 z-10"
        style={{
          background: "rgba(19, 25, 41, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {error && (
          <div
            className="rounded-xl px-4 py-3 mb-4"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#F87171" }}
          >
            {error}
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Nama Lengkap</label>
          <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
            <User size={18} style={{ color: "#00D084", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Ahmad Fauzan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 14, color: "#F1F5F9" }}
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Email Bisnis</label>
          <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
            <Mail size={18} style={{ color: "#00D084", flexShrink: 0 }} />
            <input
              type="email"
              placeholder="email@bisnis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 14, color: "#F1F5F9" }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
          <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
            <Lock size={18} style={{ color: "#00D084", flexShrink: 0 }} />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 14, color: "#F1F5F9" }}
            />
            <button onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={16} style={{ color: "#64748B" }} /> : <Eye size={16} style={{ color: "#64748B" }} />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div className="mb-6">
          <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Konfirmasi Password</label>
          <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
            <Lock size={18} style={{ color: "#00D084", flexShrink: 0 }} />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 14, color: "#F1F5F9" }}
            />
          </div>
        </div>

        {/* Register button */}
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)",
            boxShadow: "0 8px 24px rgba(0,208,132,0.3)",
            fontSize: 15,
            fontWeight: 700,
            color: "white",
          }}
        >
          {isLoading ? (
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          ) : (
            <>DAFTAR SEKARANG <ArrowRight size={18} /></>
          )}
        </button>

        {/* Terms */}
        <div className="text-center mt-4" style={{ fontSize: 11, color: "#4B5563", lineHeight: 1.6 }}>
          Dengan mendaftar, Anda menyetujui{" "}
          <span style={{ color: "#00D084" }}>Syarat & Ketentuan</span> dan{" "}
          <span style={{ color: "#00D084" }}>Kebijakan Privasi</span> kami.
        </div>
      </motion.div>

      <div className="flex items-center justify-center gap-1 mt-4 z-10" style={{ fontSize: 13 }}>
        <span style={{ color: "#64748B" }}>Sudah punya akun?</span>
        <button onClick={() => navigate("/login")} style={{ color: "#00D084", fontWeight: 600 }}>
          Masuk di sini
        </button>
      </div>
    </div>
  );
}
