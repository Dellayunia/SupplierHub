import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Star, MapPin, Building2, Phone, Mail, CheckCircle, ChevronRight, Package, Box, FileText, Send, Sparkles, X, Gift } from "lucide-react";
import { PARTNERS } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
// 1. TAMBAHKAN IMPOR GOOGLE MAPS DI SINI
import { useJsApiLoader } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

export function PartnerDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addApplication } = useApp();
  
  // 2. UBAH PARTNER MENJADI STATE AGAR BISA DINAMIS
  const [partner, setPartner] = useState<any>(null);

  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [offerSample, setOfferSample] = useState(false);
  const [tone, setTone] = useState("formal");
  const [aiDraft, setAiDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 3. LOAD MESIN GOOGLE MAPS
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY_HERE", // Gunakan API Key yang sama
    libraries: libraries,
  });

  // 4. AMBIL DETAIL MITRA ASLI DARI GOOGLE MAPS
  useEffect(() => {
    // Cek apakah ini ID dummy (jika Anda membuka dari halaman Explore lama yang mungkin masih dummy)
    const dummyPartner = PARTNERS.find((p) => p.id === id);
    if (dummyPartner) {
      setPartner(dummyPartner);
      return;
    }

    // Jika bukan dummy, tarik detail dari Google
    if (isLoaded && id) {
      const mapDiv = document.createElement('div');
      const map = new window.google.maps.Map(mapDiv);
      const service = new window.google.maps.places.PlacesService(map);

      service.getDetails({ placeId: id }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          
          // Hitung ulang jaraknya secara presisi
          let dist = 0;
          if (user?.coordinates && place.geometry?.location) {
             const R = 6371;
             const lat1 = user.coordinates.lat;
             const lon1 = user.coordinates.lng;
             const lat2 = place.geometry.location.lat();
             const lon2 = place.geometry.location.lng();
             const dLat = (lat2 - lat1) * (Math.PI / 180);
             const dLon = (lon2 - lon1) * (Math.PI / 180);
             const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
             const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
             dist = parseFloat((R * c).toFixed(1));
          }

          // Format datanya agar cocok dengan UI kita
          setPartner({
            id: place.place_id,
            name: place.name,
            category: "Mitra Bisnis Area Anda",
            rating: place.rating || 4.0,
            distance: dist,
            location: place.vicinity || place.formatted_address || "Lokasi tidak diketahui",
            image: place.photos && place.photos.length > 0 
                   ? place.photos[0].getUrl({ maxWidth: 800 }) 
                   : "https://placehold.co/800x600/1a2640/4B5563?text=Toko+Mitra",
            description: "Mitra ini ditemukan secara real-time dari peta digital. Mereka berpotensi menjadi klien B2B yang strategis untuk distribusi produk dan ekspansi bisnis Anda.",
            phone: place.formatted_phone_number || "",
            website: place.website || ""
          });
        } else {
          // Fallback darurat jika internet putus saat menarik data
          setPartner(PARTNERS[0]);
        }
      });
    }
  }, [id, isLoaded, user]);

  useEffect(() => {
    const fetchMyProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const productsRef = collection(db, "users", currentUser.uid, "products");
          const snapshot = await getDocs(productsRef);
          setMyProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Gagal memuat produk:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchMyProducts();
  }, []);

  const toggleProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const generateAIDraft = async () => {
    setIsGenerating(true);
    try {
      const selectedNames = myProducts
        .filter((p) => selectedProducts.includes(p.id))
        .map((p) => p.name)
        .join(", ");

      const res = await axios.post("http://localhost:3000/api/generate-proposal", {
        supplierName: user?.businessName || user?.name || "Supplier",
        supplierCategory: user?.category || "",
        partnerName: partner?.name || "Mitra",
        partnerCategory: partner?.category || "",
        tone,
        productNames: selectedNames,
        offerSample,
      });

      setAiDraft(res.data.proposalText);
    } catch (e) {
      console.error("Gagal generate proposal dari backend:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newApp = {
      id: `app-${Date.now()}`,
      partnerId: partner.id,
      partnerName: partner.name,
      partnerImage: partner.image,
      status: "pending",
      date: new Date().toISOString(),
      proposalText: aiDraft,
      offerSample: offerSample,
      selectedProductIds: selectedProducts
    };
    await addApplication(newApp as any);
    setIsSubmitting(false);
    setShowWizard(false);
    alert("Proposal kerja sama berhasil dikirim!");
    navigate("/app/home");
  };

  // LAYAR LOADING SAAT MENARIK DATA GOOGLE
  if (!partner) {
    return (
      <div className="flex flex-col h-screen items-center justify-center" style={{ background: "#0B0F1A" }}>
         <div className="animate-pulse flex flex-col items-center">
            <Building2 size={40} style={{ color: "#00D084", marginBottom: 16 }} />
            <div style={{ color: "#F1F5F9", fontWeight: 600, fontSize: 16 }}>Memuat Profil Mitra...</div>
         </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-[788px]" style={{ background: "#0B0F1A" }}>
      
      {/* Latar Belakang & Foto Asli Google */}
      <div className="relative h-64">
        <img src={partner.image} alt={partner.name} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,15,26,0) 0%, #0B0F1A 100%)" }} />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-5 flex items-center justify-center rounded-2xl backdrop-blur-md" style={{ width: 44, height: 44, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <ArrowLeft size={20} style={{ color: "#F1F5F9" }} />
        </button>
      </div>

      <div className="flex-1 px-5 -mt-6 relative z-10 pb-28">
        <div className="flex justify-between items-start mb-2">
          <div className="rounded-xl px-3 py-1" style={{ background: "rgba(0,208,132,0.15)", color: "#00D084", fontSize: 11, fontWeight: 700 }}>
            {partner.category}
          </div>
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-1" style={{ background: "rgba(245,158,11,0.15)" }}>
            <Star size={14} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B" }}>{partner.rating}</span>
          </div>
        </div>
        
        <div style={{ fontSize: 24, fontWeight: 800, color: "#F1F5F9", lineHeight: 1.2, marginBottom: 8 }}>{partner.name}</div>
        
        <div className="flex items-center gap-2 mb-6" style={{ color: "#94A3B8", fontSize: 13 }}>
          <MapPin size={14} /> {partner.location} • {partner.distance} km
        </div>

        <div className="flex gap-3 mb-8">
          <button 
            onClick={() => {
              if (partner?.phone) window.location.href = `tel:${partner.phone}`;
              else alert("Maaf, nomor telepon mitra ini tidak tersedia di Google Maps.");
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 transition-all active:scale-95" 
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: partner?.phone ? "#F1F5F9" : "#64748B", fontWeight: 600 }}
          >
            <Phone size={16} /> Hubungi
          </button>
          <button 
            onClick={() => {
              if (partner?.website) window.open(partner.website, '_blank');
              else alert("Maaf, mitra ini tidak mencantumkan alamat website resmi.");
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 transition-all active:scale-95" 
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: partner?.website ? "#F1F5F9" : "#64748B", fontWeight: 600 }}
          >
            <Building2 size={16} /> Profil Web
          </button>
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 12 }}>Tentang Mitra</div>
        <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6, marginBottom: 24 }}>
          {partner.description}
        </p>
      </div>

      {/* Tombol Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 z-20" style={{ background: "linear-gradient(180deg, transparent 0%, #0B0F1A 100%)" }}>
        <button onClick={() => setShowWizard(true)} className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all active:scale-95 shadow-2xl" style={{ background: "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)", fontSize: 16, fontWeight: 700, color: "white" }}>
          <Sparkles size={20} /> APPLY KERJA SAMA
        </button>
      </div>

      {/* MULTI-STEP WIZARD OVERLAY */}
      <AnimatePresence>
        {showWizard && (
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0B0F1A" }}>
            
            {/* Wizard Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(11,15,26,0.9)", backdropFilter: "blur(10px)" }}>
              <div className="flex items-center gap-3">
                <button onClick={() => { if(step > 1) setStep(step-1); else setShowWizard(false); }} className="p-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <ArrowLeft size={18} color="white" />
                </button>
                <div>
                  <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>LANGKAH {step} DARI 3</div>
                  <div style={{ fontSize: 15, color: "white", fontWeight: 700 }}>
                    {step === 1 ? "Pilih Produk & Sampel" : step === 2 ? "Smart Drafting AI" : "Pratinjau Proposal"}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowWizard(false)}><X size={20} color="#64748B" /></button>
            </div>

            {/* Wizard Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6 pb-24">
              
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 20 }}>Pilih produk dari katalog Anda yang ingin ditawarkan ke <strong style={{color:"white"}}>{partner.name}</strong>.</div>
                  
                  {isLoadingProducts ? (
                    <div className="text-center text-sm text-[#00D084] py-10">Memuat katalog...</div>
                  ) : myProducts.length === 0 ? (
                    <div className="text-center text-sm text-[#94A3B8] py-10">Katalog Anda kosong. Silakan tambahkan produk di menu Profil terlebih dahulu.</div>
                  ) : (
                    <div className="flex flex-col gap-3 mb-8">
                      {myProducts.map(prod => (
                        <div key={prod.id} onClick={() => toggleProduct(prod.id)} className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors" style={{ background: selectedProducts.includes(prod.id) ? "rgba(0,208,132,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedProducts.includes(prod.id) ? "rgba(0,208,132,0.4)" : "rgba(255,255,255,0.08)"}` }}>
                           <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: selectedProducts.includes(prod.id) ? "#00D084" : "rgba(255,255,255,0.1)" }}>
                             {selectedProducts.includes(prod.id) && <CheckCircle size={14} color="white" />}
                           </div>
                           <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                             {prod.images && prod.images[0] ? <img src={prod.images[0]} className="w-full h-full object-cover"/> : <Package className="m-auto mt-3 opacity-50"/>}
                           </div>
                           <div className="flex-1">
                             <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{prod.name}</div>
                             <div style={{ fontSize: 12, color: "#00D084", fontWeight: 600 }}>Rp {prod.price} <span className="text-[#64748B] font-normal">/{prod.unit}</span></div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 12 }}>Opsi Tambahan</div>
                  <div onClick={() => setOfferSample(!offerSample)} className="flex items-start gap-4 p-4 rounded-2xl cursor-pointer" style={{ background: offerSample ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${offerSample ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                     <div className="rounded-full p-2 flex-shrink-0" style={{ background: offerSample ? "#F59E0B" : "rgba(255,255,255,0.1)" }}>
                       <Gift size={20} color="white" />
                     </div>
                     <div className="flex-1">
                       <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>Ajukan Pengiriman Sampel</div>
                       <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.4 }}>Tawarkan pengiriman sampel fisik gratis agar mitra dapat melihat kualitas barang Anda.</div>
                     </div>
                     <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1" style={{ borderColor: offerSample ? "#F59E0B" : "#64748B", background: offerSample ? "#F59E0B" : "transparent" }}>
                       {offerSample && <CheckCircle size={14} color="white" />}
                     </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 20 }}>Pilih gaya bahasa, dan biarkan AI Gemini menyusun proposal kerja sama Anda dalam hitungan detik.</div>
                  
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {[
                      { id: "formal", label: "👔 Formal Profesional" },
                      { id: "casual", label: "🤝 Ramah & Persuasif" },
                      { id: "direct", label: "⚡ Singkat & Jelas" }
                    ].map(t => (
                      <button key={t.id} onClick={() => setTone(t.id)} className="flex-shrink-0 px-4 py-2 rounded-xl transition-all" style={{ background: tone === t.id ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${tone === t.id ? "#3B82F6" : "rgba(255,255,255,0.1)"}`, color: tone === t.id ? "#60A5FA" : "#94A3B8", fontSize: 13, fontWeight: 600 }}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <button onClick={generateAIDraft} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 mb-6 transition-all active:scale-95" style={{ background: isGenerating ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)", color: "white", fontSize: 14, fontWeight: 700 }}>
                    {isGenerating ? <><Sparkles size={16} className="animate-spin"/> Sedang Berpikir...</> : <><Sparkles size={16}/> {aiDraft ? "Tulis Ulang dengan AI" : "Buat Draf Sekarang"}</>}
                  </button>

                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-10 rounded-t-2xl flex items-center px-4" style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <FileText size={14} color="#94A3B8" className="mr-2" />
                      <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>Isi Surat Penawaran</span>
                    </div>
                    <textarea 
                      value={aiDraft} 
                      onChange={(e) => setAiDraft(e.target.value)} 
                      placeholder="Surat penawaran Anda akan muncul di sini..."
                      className="w-full bg-transparent rounded-2xl p-4 pt-14 outline-none resize-none" 
                      style={{ height: 300, border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 14, lineHeight: 1.6 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "white" }}>
                    <div className="p-5 border-b" style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{user?.businessName || "Bisnis Saya"}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{user?.category} • {user?.location || "Indonesia"}</div>
                    </div>
                    
                    <div className="p-5">
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 12, textTransform: "uppercase" }}>Kepada: {partner.name}</div>
                      <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                        {aiDraft || "Belum ada draf surat dibuat."}
                      </div>

                      <div className="mt-8 pt-6 border-t" style={{ borderColor: "#E2E8F0" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>LAMPIRAN:</div>
                        
                        {offerSample && (
                           <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: "#FEF3C7", border: "1px dashed #F59E0B" }}>
                             <Gift size={16} color="#D97706" />
                             <span style={{ fontSize: 12, fontWeight: 700, color: "#D97706" }}>Permintaan Pengiriman Sampel Tersertakan</span>
                           </div>
                        )}

                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {myProducts.filter(p => selectedProducts.includes(p.id)).map(prod => (
                            <div key={prod.id} className="flex-shrink-0 border rounded-xl p-2 w-32" style={{ borderColor: "#E2E8F0" }}>
                               <div className="w-full h-20 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                 {prod.images && prod.images[0] ? <img src={prod.images[0]} className="w-full h-full object-cover"/> : null}
                               </div>
                               <div style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prod.name}</div>
                               <div style={{ fontSize: 10, color: "#00D084", fontWeight: 700 }}>Rp {prod.price}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Wizard Footer */}
            <div className="p-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(11,15,26,0.95)" }}>
              {step < 3 ? (
                 <button onClick={() => { if(step === 1 && !aiDraft) generateAIDraft(); setStep(step + 1); }} className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all active:scale-95" style={{ background: "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)", fontSize: 15, fontWeight: 700, color: "white" }}>
                   LANJUTKAN <ChevronRight size={18} />
                 </button>
              ) : (
                 <button onClick={handleSubmit} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all active:scale-95" style={{ background: isSubmitting ? "rgba(0,208,132,0.4)" : "#00D084", fontSize: 15, fontWeight: 700, color: "white", boxShadow: "0 8px 20px rgba(0,208,132,0.3)" }}>
                   {isSubmitting ? "MENGIRIM..." : <><Send size={18} /> KIRIM PROPOSAL SEKARANG</>}
                 </button>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
