import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      // Tunggu jawaban dari Firebase
      await login(email, password); 
      
      // JIKA BARIS DI ATAS SUKSES, barulah pindah ke Home
      navigate("/app/home"); 
    } catch (err) {
      // JIKA GAGAL (password salah / email tidak ada), tampilkan tulisan merah
      setError("Email atau password yang Anda masukkan salah!"); 
    } finally {
      setIsLoading(false); // Matikan animasi putaran loading
    }
  };

  return (
    <div
      className="min-h-[788px] flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0A0E1A 0%, #0B1120 60%, #0A1828 100%)" }}
    >
      {/* Top gradient blob */}
      <div
        className="absolute top-0 inset-x-0 h-72 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,208,132,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-8 px-6 z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center rounded-2xl mb-4"
          style={{
            width: 64,
            height: 64,
            background: "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)",
            boxShadow: "0 12px 40px rgba(0,208,132,0.35)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 52 52" fill="none">
            <path d="M26 8L44 20V32L26 44L8 32V20L26 8Z" stroke="white" strokeWidth="2.5" fill="none" />
            <circle cx="26" cy="26" r="6" fill="white" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-center"
        >
          <div
            className="font-black"
            style={{
              fontSize: 28,
              background: "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SupplierAI
          </div>
          <div style={{ fontSize: 14, color: "#64748B", marginTop: 2 }}>
            Selamat datang kembali!
          </div>
        </motion.div>
      </div>

      {/* Form card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mx-4 rounded-3xl p-6 z-10"
        style={{
          background: "rgba(19, 25, 41, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>
          Masuk ke Akun Anda
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3 mb-4"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#F87171" }}
          >
            {error}
          </div>
        )}

        {/* Email input */}
        <div className="mb-4">
          <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>
            Email
          </label>
          <div
            className="flex items-center rounded-2xl px-4 gap-3 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              height: 52,
            }}
          >
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

        {/* Password input */}
        <div className="mb-6">
          <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>
            Password
          </label>
          <div
            className="flex items-center rounded-2xl px-4 gap-3 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              height: 52,
            }}
          >
            <Lock size={18} style={{ color: "#00D084", flexShrink: 0 }} />
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 14, color: "#F1F5F9" }}
            />
            <button onClick={() => setShowPass(!showPass)} className="focus:outline-none">
              {showPass ? (
                <EyeOff size={16} style={{ color: "#64748B" }} />
              ) : (
                <Eye size={16} style={{ color: "#64748B" }} />
              )}
            </button>
          </div>
          <div className="text-right mt-2">
            <button style={{ fontSize: 12, color: "#00D084" }}>Lupa password?</button>
          </div>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all duration-200 active:scale-95"
          style={{
            background: isLoading ? "rgba(0,208,132,0.5)" : "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)",
            boxShadow: "0 8px 24px rgba(0,208,132,0.3)",
            fontSize: 15,
            fontWeight: 700,
            color: "white",
            letterSpacing: "0.02em",
          }}
        >
          {isLoading ? (
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          ) : (
            <>
              MASUK
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </motion.div>

      {/* Quick demo login
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mx-4 mt-3 rounded-2xl p-4 z-10"
        style={{ background: "rgba(0,208,132,0.05)", border: "1px solid rgba(0,208,132,0.15)" }}
      >
        <div style={{ fontSize: 12, color: "#64748B", textAlign: "center", marginBottom: 8 }}>
          Demo — gunakan akun berikut
        </div>
        <button
          onClick={() => {
            setEmail("demo@supplierai.id");
            setPassword("demo1234");
          }}
          style={{ fontSize: 12, color: "#00D084", display: "block", textAlign: "center", width: "100%" }}
        >
          demo@supplierai.id • demo1234
        </button>
      </motion.div> */}

      {/* Register link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-1 mt-4 z-10"
        style={{ fontSize: 13 }}
      >
        <span style={{ color: "#64748B" }}>Belum punya akun?</span>
        <button onClick={() => navigate("/register")} style={{ color: "#00D084", fontWeight: 600 }}>
          Daftar di sini
        </button>
      </motion.div>
    </div>
  );
}
