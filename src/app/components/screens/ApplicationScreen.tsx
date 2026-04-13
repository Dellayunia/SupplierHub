import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Clock, CheckCircle, XCircle, FileText, Building2, Calendar, ChevronRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function ApplicationScreen() {
  const navigate = useNavigate();
  const { applications } = useApp();
  
  // State untuk filter tab (Semua, Proses, Diterima, Ditolak)
  const [activeTab, setActiveTab] = useState("all");

  // Menyaring data berdasarkan tab yang dipilih
  const filteredApps = applications.filter(app => 
    activeTab === "all" ? true : app.status === activeTab
  );

  // Fungsi untuk memformat tanggal (ISO ke format lokal)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  return (
    <div className="relative flex flex-col min-h-[788px]" style={{ background: "#0B0F1A" }}>
      
      {/* Header Statis */}
      <div className="px-5 pt-6 pb-4 z-10" style={{ background: "rgba(11,15,26,0.9)", backdropFilter: "blur(10px)", position: "sticky", top: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate("/app/home")} 
            className="flex items-center justify-center rounded-2xl transition-all active:scale-95" 
            style={{ width: 40, height: 40, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <ArrowLeft size={20} style={{ color: "#F1F5F9" }} />
          </button>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>
            Riwayat Lamaran
          </div>
        </div>

        {/* Tab Navigasi Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {[
            { id: "all", label: "Semua" },
            { id: "pending", label: "Diproses" },
            { id: "accepted", label: "Diterima" },
            { id: "rejected", label: "Ditolak" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-4 py-2 rounded-xl transition-all"
              style={{ 
                background: activeTab === tab.id ? "rgba(0,208,132,0.15)" : "rgba(255,255,255,0.05)", 
                border: `1px solid ${activeTab === tab.id ? "#00D084" : "rgba(255,255,255,0.08)"}`, 
                color: activeTab === tab.id ? "#00D084" : "#94A3B8", 
                fontSize: 13, fontWeight: 600 
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Daftar Lamaran */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <AnimatePresence mode="wait">
          {filteredApps.length === 0 ? (
             <motion.div 
               key="empty"
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
               className="flex flex-col items-center justify-center text-center mt-24"
             >
               <div className="rounded-full p-6 mb-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                 <FileText size={48} style={{ color: "rgba(255,255,255,0.1)" }} />
               </div>
               <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>Belum Ada Data</div>
               <div style={{ fontSize: 13, color: "#64748B", maxWidth: 250 }}>
                 {activeTab === "all" 
                   ? "Anda belum mengirimkan proposal kerja sama apa pun ke target mitra." 
                   : `Tidak ada proposal dengan status ${activeTab} saat ini.`}
               </div>
             </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 mt-2">
              {filteredApps.map((app) => (
                <motion.div 
                  key={app.id}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-[24px] p-4 relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Status Badge di Pojok Kanan Atas */}
                  <div className="absolute top-4 right-4 rounded-lg px-2.5 py-1 flex items-center gap-1.5" 
                    style={{ 
                      background: app.status === "accepted" ? "rgba(0,208,132,0.15)" : app.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                      color: app.status === "accepted" ? "#00D084" : app.status === "rejected" ? "#EF4444" : "#F59E0B",
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase"
                    }}
                  >
                    {app.status === "accepted" && <CheckCircle size={12} />}
                    {app.status === "rejected" && <XCircle size={12} />}
                    {app.status === "pending" && <Clock size={12} />}
                    {app.status === "accepted" ? "Diterima" : app.status === "rejected" ? "Ditolak" : "Diproses"}
                  </div>

                  {/* Info Mitra */}
                  <div className="flex items-center gap-3 mb-4 pr-24">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <img src={app.partnerImage} alt={app.partnerName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 2 }}>{app.partnerName}</div>
                      <div className="flex items-center gap-1.5" style={{ fontSize: 11, color: "#94A3B8" }}>
                        <Calendar size={12} /> {formatDate(app.date)}
                      </div>
                    </div>
                  </div>

                  {/* Cuplikan Proposal */}
                  <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-start gap-2">
                      <FileText size={14} color="#64748B" className="mt-0.5 flex-shrink-0" />
                      <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {app.proposalText}
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <button className="w-full flex items-center justify-between px-1 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#60A5FA" }}>Lihat Detail Surat</div>
                    <ChevronRight size={16} color="#60A5FA" />
                  </button>

                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}