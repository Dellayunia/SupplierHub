import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useApp } from "../../context/AppContext";

export function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, isProfileSetup } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && isProfileSetup) {
        navigate("/app/home");
      } else if (isAuthenticated && !isProfileSetup) {
        navigate("/profile-setup");
      } else {
        navigate("/login");
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, isProfileSetup, navigate]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[788px] relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0A0E1A 0%, #0D1520 50%, #0A1828 100%)" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(0,208,132,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{ borderColor: "rgba(0,208,132,0.08)", width: 120 + i * 80, height: 120 + i * 80 }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "backOut" }}
        className="flex flex-col items-center gap-4 z-10"
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-3xl mb-2"
          style={{
            width: 96,
            height: 96,
            background: "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)",
            boxShadow: "0 20px 60px rgba(0,208,132,0.4)",
          }}
        >
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <path d="M26 8L44 20V32L26 44L8 32V20L26 8Z" stroke="white" strokeWidth="2.5" fill="none" />
            <path d="M26 8L26 44" stroke="white" strokeWidth="2" opacity="0.5" />
            <path d="M8 20L44 20" stroke="white" strokeWidth="2" opacity="0.5" />
            <path d="M8 32L44 32" stroke="white" strokeWidth="2" opacity="0.5" />
            <circle cx="26" cy="26" r="6" fill="white" />
            <path d="M14 14L38 38" stroke="white" strokeWidth="1.5" opacity="0.3" />
            <path d="M38 14L14 38" stroke="white" strokeWidth="1.5" opacity="0.3" />
          </svg>
        </div>

        {/* App name */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center"
        >
          <div
            className="font-black tracking-tight"
            style={{
              fontSize: 36,
              background: "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SupplierAI
          </div>
          <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
            Temukan Mitra Bisnis Terbaik
          </div>
        </motion.div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-24 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 6, height: 6, background: "#00D084" }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Version */}
      <div className="absolute bottom-8" style={{ fontSize: 12, color: "#1E293B" }}>
        v1.0.0 • SupplierAI MVP
      </div>
    </div>
  );
}
