// import { useState, useRef } from "react";
// import { useNavigate } from "react-router";
// import { motion, AnimatePresence } from "motion/react";
// import { ArrowLeft, Plus, Image as ImageIcon, Tag, Package, DollarSign, Archive, CheckCircle, Trash2, X } from "lucide-react";
// import { useApp } from "../../context/AppContext"; // 1. Tambahkan impor useApp

// // Tipe data untuk Produk B2B
// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: string;
//   unit: string;
//   moq: string;
//   capacity: string;
//   category: string; // Tambahkan properti kategori
//   images: string[]; // Tambahkan properti gambar
// }

// export function CatalogScreen() {
//   const navigate = useNavigate();
//   const { user } = useApp(); // 2. Panggil data user dari memori pusat
//   const fileInputRef = useRef<HTMLInputElement>(null); // Referensi untuk input file tersembunyi
  
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isAdding, setIsAdding] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);

//   // State untuk Form Input
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [unit, setUnit] = useState("Kg");
//   const [moq, setMoq] = useState("");
//   const [capacity, setCapacity] = useState("");
//   const [images, setImages] = useState<string[]>([]); // State untuk menyimpan foto yang diupload

//   // 3. Fungsi untuk menangani upload gambar (mengubah file menjadi URL yang bisa ditampilkan)
//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     if (files.length === 0) return;
    
//     // Hanya ambil sisanya jika totalnya melebihi 3
//     const remainingSlots = 3 - images.length;
//     const filesToProcess = files.slice(0, remainingSlots);

//     filesToProcess.forEach(file => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImages(prev => [...prev, reader.result as string]);
//       };
//       reader.readAsDataURL(file); // Konversi gambar ke format base64
//     });
//   };

//   const removeImage = (index: number) => {
//     setImages(images.filter((_, i) => i !== index));
//   };

//   const handleSaveProduct = async () => {
//     if (!name || !price || !moq) return;
    
//     const newProduct: Product = {
//       id: `prod-${Date.now()}`,
//       name, 
//       description, 
//       price, 
//       unit, 
//       moq, 
//       capacity,
//       category: user?.category || "Belum ada kategori", // Otomatis simpan kategori dari profil
//       images // Simpan gambar
//     };

//     setProducts([newProduct, ...products]);
//     setShowSuccess(true);
    
//     // Reset form
//     setName(""); setDescription(""); setPrice(""); setUnit("Kg"); setMoq(""); setCapacity(""); setImages([]);
    
//     await new Promise((r) => setTimeout(r, 1500));
//     setShowSuccess(false);
//     setIsAdding(false);
//   };

//   const handleDelete = (id: string) => {
//     setProducts(products.filter(p => p.id !== id));
//   };

//   return (
//     <div className="relative flex flex-col min-h-[788px]" style={{ background: "#0B0F1A" }}>
//       {/* Header */}
//       <div className="px-5 pt-6 pb-4 flex items-center justify-between z-10" style={{ background: "rgba(11,15,26,0.9)", backdropFilter: "blur(10px)", position: "sticky", top: 0 }}>
//         <div className="flex items-center gap-3">
//           <button onClick={() => isAdding ? setIsAdding(false) : navigate(-1)} className="flex items-center justify-center rounded-2xl transition-all active:scale-95" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
//             <ArrowLeft size={20} style={{ color: "#F1F5F9" }} />
//           </button>
//           <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>
//             {isAdding ? "Tambah Produk" : "Katalog Saya"}
//           </div>
//         </div>
//         {!isAdding && (
//           <button onClick={() => setIsAdding(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all active:scale-95" style={{ background: "linear-gradient(135deg, #00D084, #3B82F6)", fontSize: 13, color: "white", fontWeight: 600 }}>
//             <Plus size={16} /> Tambah
//           </button>
//         )}
//       </div>

//       <div className="flex-1 overflow-y-auto px-5 pb-24">
//         <AnimatePresence mode="wait">
//           {!isAdding ? (
//             // --- TAMPILAN DAFTAR PRODUK ---
//             <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
//               {products.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center text-center mt-20">
//                   <div className="flex items-center justify-center rounded-full mb-4" style={{ width: 80, height: 80, background: "rgba(0,208,132,0.1)" }}>
//                     <Package size={40} style={{ color: "#00D084" }} />
//                   </div>
//                   <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>Katalog Masih Kosong</div>
//                   <div style={{ fontSize: 13, color: "#64748B", maxWidth: 250, marginBottom: 24 }}>Tambahkan produk atau jasa yang Anda tawarkan agar mitra tertarik bekerja sama.</div>
//                   <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 rounded-2xl px-6 py-3.5 transition-all active:scale-95" style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)", fontSize: 14, color: "#F1F5F9", fontWeight: 600 }}>
//                     <Plus size={18} /> Mulai Tambah Produk
//                   </button>
//                 </div>
//               ) : (
//                 <div className="flex flex-col gap-4 mt-2">
//                   {products.map((product) => (
//                     <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 flex gap-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      
//                       {/* 4. Tampilkan Gambar Produk Asli jika ada */}
//                       <div className="rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: 80, height: 80, background: "rgba(255,255,255,0.05)" }}>
//                         {product.images && product.images.length > 0 ? (
//                           <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
//                         ) : (
//                           <ImageIcon size={24} style={{ color: "#64748B" }} />
//                         )}
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <div className="flex justify-between items-start mb-1">
//                           <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</div>
//                           <button onClick={() => handleDelete(product.id)}><Trash2 size={16} style={{ color: "#EF4444" }} /></button>
//                         </div>
//                         <div style={{ fontSize: 14, fontWeight: 700, color: "#00D084", marginBottom: 6 }}>Rp {product.price} <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>/ {product.unit}</span></div>
//                         <div className="flex flex-wrap gap-2 mt-2">
//                           <div className="rounded-lg px-2 py-1 flex items-center gap-1" style={{ background: "rgba(59,130,246,0.1)", fontSize: 10, color: "#3B82F6", fontWeight: 600 }}>
//                             <Archive size={10} /> MOQ: {product.moq} {product.unit}
//                           </div>
//                           {product.capacity && (
//                              <div className="rounded-lg px-2 py-1" style={{ background: "rgba(245,158,11,0.1)", fontSize: 10, color: "#F59E0B", fontWeight: 600 }}>
//                                Suplai: {product.capacity}
//                              </div>
//                           )}
//                         </div>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </motion.div>
//           ) : (
//             // --- TAMPILAN FORM TAMBAH PRODUK ---
//             <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
//               {showSuccess ? (
//                  <div className="flex flex-col items-center justify-center py-20">
//                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full flex items-center justify-center mb-4" style={{ width: 80, height: 80, background: "rgba(0,208,132,0.15)" }}>
//                      <CheckCircle size={40} style={{ color: "#00D084" }} />
//                    </motion.div>
//                    <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>Produk Disimpan!</div>
//                  </div>
//               ) : (
//                 <>
//                   {/* Input File Tersembunyi */}
//                   <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  
//                   {/* Area Upload Foto Produk */}
//                   <div className="flex flex-col items-center mb-6 mt-2">
//                     {images.length > 0 ? (
//                       <div className="flex gap-3 w-full overflow-x-auto pb-2">
//                         {images.map((img, idx) => (
//                           <div key={idx} className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
//                             <img src={img} alt="preview" className="w-full h-full object-cover rounded-xl border border-white/10" />
//                             <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg">
//                               <X size={12} color="white" />
//                             </button>
//                           </div>
//                         ))}
//                         {images.length < 3 && (
//                            <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-white/5 flex-shrink-0" style={{ width: 100, height: 100, borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}>
//                              <Plus size={24} style={{ color: "#00D084", marginBottom: 4 }} />
//                              <div style={{ fontSize: 11, color: "#64748B" }}>Tambah</div>
//                            </div>
//                         )}
//                       </div>
//                     ) : (
//                       <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed w-full cursor-pointer transition-colors hover:bg-white/5" style={{ height: 140, borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}>
//                         <div className="rounded-full p-3 mb-2" style={{ background: "rgba(0,208,132,0.1)" }}>
//                           <ImageIcon size={24} style={{ color: "#00D084" }} />
//                         </div>
//                         <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>Upload Foto Produk</div>
//                         <div style={{ fontSize: 11, color: "#64748B" }}>Maksimal 3 foto (Opsional)</div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Info Dasar */}
//                   <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 12 }}>Informasi Dasar</div>
                  
//                   {/* 5. Kolom Kategori (Otomatis & Read-Only) */}
//                   <div className="mb-4">
//                     <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Kategori Produk</label>
//                     <div className="flex items-center rounded-2xl px-4 gap-3 opacity-60" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", height: 52 }}>
//                       <Tag size={18} style={{ color: "#64748B", flexShrink: 0 }} />
//                       <input 
//                         type="text" 
//                         value={user?.category || "Belum ada kategori"} 
//                         disabled 
//                         className="flex-1 bg-transparent outline-none cursor-not-allowed" 
//                         style={{ fontSize: 14, color: "#94A3B8" }} 
//                       />
//                     </div>
//                     <div style={{ fontSize: 10, color: "#64748B", marginTop: 6, fontStyle: "italic" }}>
//                       *Kategori otomatis disesuaikan dengan profil bisnis Anda.
//                     </div>
//                   </div>

//                   <div className="mb-4">
//                     <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Nama Produk *</label>
//                     <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
//                       <Package size={18} style={{ color: "#00D084", flexShrink: 0 }} />
//                       <input type="text" placeholder="Misal: Kopi Robusta Grade A" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ fontSize: 14, color: "#F1F5F9" }} />
//                     </div>
//                   </div>
                  
//                   <div className="mb-6">
//                     <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Deskripsi</label>
//                     <textarea placeholder="Jelaskan spesifikasi atau keunggulan produk..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-2xl px-4 py-3 bg-transparent outline-none resize-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 14, color: "#F1F5F9", minHeight: 80 }} />
//                   </div>

//                   {/* Detail B2B */}
//                   <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 12 }}>Spesifikasi B2B</div>
//                   <div className="flex gap-3 mb-4">
//                     <div className="flex-1">
//                       <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Harga *</label>
//                       <div className="flex items-center rounded-2xl px-4 gap-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
//                         {/* Mengganti DollarSign dengan teks Rp yang di-styling */}
//                         <span style={{ fontSize: 15, fontWeight: 700, color: "#00D084", marginTop: 1 }}>Rp</span>
//                         <input type="number" placeholder="45000" value={price} onChange={(e) => setPrice(e.target.value)} className="flex-1 w-full bg-transparent outline-none" style={{ fontSize: 14, color: "#F1F5F9" }} />
//                       </div>
//                     </div>
//                     <div className="w-28">
//                       <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Satuan</label>
//                       <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full rounded-2xl px-3 outline-none appearance-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52, fontSize: 14, color: "#F1F5F9" }}>
//                         <option value="Kg" style={{ color: 'black' }}>/ Kg</option>
//                         <option value="Ton" style={{ color: 'black' }}>/ Ton</option>
//                         <option value="Pcs" style={{ color: 'black' }}>/ Pcs</option>
//                         <option value="Dus" style={{ color: 'black' }}>/ Dus</option>
//                         <option value="Liter" style={{ color: 'black' }}>/ Liter</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="mb-4">
//                     <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Minimal Order (MOQ) *</label>
//                     <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
//                       <Archive size={18} style={{ color: "#3B82F6", flexShrink: 0 }} />
//                       <input type="number" placeholder={`Misal: 50 (dalam satuan ${unit})`} value={moq} onChange={(e) => setMoq(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ fontSize: 14, color: "#F1F5F9" }} />
//                     </div>
//                   </div>

//                   <div className="mb-8">
//                     <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Kapasitas Suplai (Opsional)</label>
//                     <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
//                       <Archive size={18} style={{ color: "#F59E0B", flexShrink: 0 }} />
//                       <input type="text" placeholder="Misal: 2 Ton / Bulan" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ fontSize: 14, color: "#F1F5F9" }} />
//                     </div>
//                   </div>

//                   {/* Save Button */}
//                   <button onClick={handleSaveProduct} disabled={!name || !price || !moq} className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all active:scale-95" style={{ background: (!name || !price || !moq) ? "rgba(0,208,132,0.3)" : "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)", boxShadow: (!name || !price || !moq) ? "none" : "0 8px 24px rgba(0,208,132,0.3)", fontSize: 15, fontWeight: 700, color: "white" }}>
//                     SIMPAN PRODUK
//                   </button>
//                 </>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Plus, Image as ImageIcon, Tag, Package, Archive, CheckCircle, Trash2, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
// 1. TAMBAH IMPOR FIREBASE DI SINI
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  moq: string;
  capacity: string;
  category: string;
  images: string[];
}

export function CatalogScreen() {
  const navigate = useNavigate();
  const { user } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // State loading untuk mengambil data

  // State untuk Form Input
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("Kg");
  const [moq, setMoq] = useState("");
  const [capacity, setCapacity] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // 2. FUNGSI MEMBACA DATA DARI DATABASE SAAT HALAMAN DIBUKA
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Buka laci "products" milik user yang sedang login
        const productsRef = collection(db, "users", currentUser.uid, "products");
        const snapshot = await getDocs(productsRef);
        
        const loadedProducts = snapshot.docs.map(doc => ({
          id: doc.id, // Ambil ID asli dari dokumen Firebase
          ...doc.data()
        })) as Product[];
        
        setProducts(loadedProducts);
      } catch (error) {
        console.error("Gagal memuat produk:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProducts();
  }, []);

  // 3. FUNGSI UPLOAD & KOMPRESI GAMBAR OTOMATIS
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const remainingSlots = 3 - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Buat kanvas virtual untuk mengecilkan foto
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // Maksimal lebar foto 800px
          const MAX_HEIGHT = 800; // Maksimal tinggi foto 800px
          let width = img.width;
          let height = img.height;

          // Kalkulasi proporsi ukuran baru
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          // Gambar ulang foto di kanvas dengan ukuran lebih kecil
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Kompres menjadi format JPEG dengan kualitas 70%
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          
          // Simpan hasil kompresi ke state
          setImages(prev => [...prev, compressedBase64]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file); 
    });
  };
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 3. FUNGSI MENYIMPAN DATA KE DATABASE
  const handleSaveProduct = async () => {
    if (!name || !price || !moq) return;
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("Sesi telah habis, silakan login kembali.");
        return;
      }

      const newProductData = {
        name, 
        description, 
        price, 
        unit, 
        moq, 
        capacity,
        category: user?.category || "Belum ada kategori",
        images,
        createdAt: new Date().toISOString() // Simpan waktu pembuatan
      };

      // Simpan ke laci "products" di Firestore
      const productsRef = collection(db, "users", currentUser.uid, "products");
      const docRef = await addDoc(productsRef, newProductData);

      // Update tampilan tanpa perlu refresh
      const savedProduct: Product = { id: docRef.id, ...newProductData };
      setProducts([savedProduct, ...products]);
      
      setShowSuccess(true);
      
      // Reset form
      setName(""); setDescription(""); setPrice(""); setUnit("Kg"); setMoq(""); setCapacity(""); setImages([]);
      
      await new Promise((r) => setTimeout(r, 1500));
      setShowSuccess(false);
      setIsAdding(false);
    } catch (error) {
      console.error("Gagal menyimpan produk:", error);
      alert("Gagal menyimpan produk, periksa koneksi internet Anda.");
    }
  };

  // 4. FUNGSI MENGHAPUS DATA DARI DATABASE
  const handleDelete = async (id: string) => {
    const isConfirm = window.confirm("Yakin ingin menghapus produk ini?");
    if (!isConfirm) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Hapus dokumen berdasarkan ID-nya di Firestore
      await deleteDoc(doc(db, "users", currentUser.uid, "products", id));
      
      // Update tampilan
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
    }
  };

  return (
    <div className="relative flex flex-col min-h-[788px]" style={{ background: "#0B0F1A" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between z-10" style={{ background: "rgba(11,15,26,0.9)", backdropFilter: "blur(10px)", position: "sticky", top: 0 }}>
        <div className="flex items-center gap-3">
          <button onClick={() => isAdding ? setIsAdding(false) : navigate(-1)} className="flex items-center justify-center rounded-2xl transition-all active:scale-95" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <ArrowLeft size={20} style={{ color: "#F1F5F9" }} />
          </button>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>
            {isAdding ? "Tambah Produk" : "Katalog Saya"}
          </div>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all active:scale-95" style={{ background: "linear-gradient(135deg, #00D084, #3B82F6)", fontSize: 13, color: "white", fontWeight: 600 }}>
            <Plus size={16} /> Tambah
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <AnimatePresence mode="wait">
          {!isAdding ? (
            // --- TAMPILAN DAFTAR PRODUK ---
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {isLoadingData ? (
                <div className="flex justify-center items-center py-20">
                  <div style={{ color: "#00D084", fontWeight: 600 }}>Memuat Katalog...</div>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center mt-20">
                  <div className="flex items-center justify-center rounded-full mb-4" style={{ width: 80, height: 80, background: "rgba(0,208,132,0.1)" }}>
                    <Package size={40} style={{ color: "#00D084" }} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>Katalog Masih Kosong</div>
                  <div style={{ fontSize: 13, color: "#64748B", maxWidth: 250, marginBottom: 24 }}>Tambahkan produk atau jasa yang Anda tawarkan agar mitra tertarik bekerja sama.</div>
                  <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 rounded-2xl px-6 py-3.5 transition-all active:scale-95" style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)", fontSize: 14, color: "#F1F5F9", fontWeight: 600 }}>
                    <Plus size={18} /> Mulai Tambah Produk
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-2">
                  {products.map((product) => (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 flex gap-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      
                      <div className="rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ width: 80, height: 80, background: "rgba(255,255,255,0.05)" }}>
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={24} style={{ color: "#64748B" }} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</div>
                          <button onClick={() => handleDelete(product.id)} className="p-1"><Trash2 size={16} style={{ color: "#EF4444" }} /></button>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#00D084", marginBottom: 6 }}>Rp {product.price} <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>/ {product.unit}</span></div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="rounded-lg px-2 py-1 flex items-center gap-1" style={{ background: "rgba(59,130,246,0.1)", fontSize: 10, color: "#3B82F6", fontWeight: 600 }}>
                            <Archive size={10} /> MOQ: {product.moq} {product.unit}
                          </div>
                          {product.capacity && (
                             <div className="rounded-lg px-2 py-1" style={{ background: "rgba(245,158,11,0.1)", fontSize: 10, color: "#F59E0B", fontWeight: 600 }}>
                               Suplai: {product.capacity}
                             </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            // --- TAMPILAN FORM TAMBAH PRODUK ---
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {showSuccess ? (
                 <div className="flex flex-col items-center justify-center py-20">
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full flex items-center justify-center mb-4" style={{ width: 80, height: 80, background: "rgba(0,208,132,0.15)" }}>
                     <CheckCircle size={40} style={{ color: "#00D084" }} />
                   </motion.div>
                   <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>Produk Disimpan!</div>
                 </div>
              ) : (
                <>
                  {/* Input File Tersembunyi */}
                  <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  
                  {/* Area Upload Foto Produk */}
                  <div className="flex flex-col items-center mb-6 mt-2">
                    {images.length > 0 ? (
                      <div className="flex gap-3 w-full overflow-x-auto pb-2">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
                            <img src={img} alt="preview" className="w-full h-full object-cover rounded-xl border border-white/10" />
                            <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg">
                              <X size={12} color="white" />
                            </button>
                          </div>
                        ))}
                        {images.length < 3 && (
                           <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-white/5 flex-shrink-0" style={{ width: 100, height: 100, borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}>
                             <Plus size={24} style={{ color: "#00D084", marginBottom: 4 }} />
                             <div style={{ fontSize: 11, color: "#64748B" }}>Tambah</div>
                           </div>
                        )}
                      </div>
                    ) : (
                      <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed w-full cursor-pointer transition-colors hover:bg-white/5" style={{ height: 140, borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}>
                        <div className="rounded-full p-3 mb-2" style={{ background: "rgba(0,208,132,0.1)" }}>
                          <ImageIcon size={24} style={{ color: "#00D084" }} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>Upload Foto Produk</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>Maksimal 3 foto (Opsional)</div>
                      </div>
                    )}
                  </div>

                  {/* Info Dasar */}
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 12 }}>Informasi Dasar</div>
                  
                  <div className="mb-4">
                    <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Kategori Produk</label>
                    <div className="flex items-center rounded-2xl px-4 gap-3 opacity-60" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", height: 52 }}>
                      <Tag size={18} style={{ color: "#64748B", flexShrink: 0 }} />
                      <input 
                        type="text" 
                        value={user?.category || "Belum ada kategori"} 
                        disabled 
                        className="flex-1 bg-transparent outline-none cursor-not-allowed" 
                        style={{ fontSize: 14, color: "#94A3B8" }} 
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Nama Produk *</label>
                    <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
                      <Package size={18} style={{ color: "#00D084", flexShrink: 0 }} />
                      <input type="text" placeholder="Misal: Kopi Robusta Grade A" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ fontSize: 14, color: "#F1F5F9" }} />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Deskripsi</label>
                    <textarea placeholder="Jelaskan spesifikasi atau keunggulan produk..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-2xl px-4 py-3 bg-transparent outline-none resize-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 14, color: "#F1F5F9", minHeight: 80 }} />
                  </div>

                  {/* Detail B2B */}
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 12 }}>Spesifikasi B2B</div>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Harga *</label>
                      <div className="flex items-center rounded-2xl px-4 gap-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#00D084", marginTop: 1 }}>Rp</span>
                        <input type="number" placeholder="45000" value={price} onChange={(e) => setPrice(e.target.value)} className="flex-1 w-full bg-transparent outline-none" style={{ fontSize: 14, color: "#F1F5F9" }} />
                      </div>
                    </div>
                    <div className="w-28">
                      <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Satuan</label>
                      <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full rounded-2xl px-3 outline-none appearance-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52, fontSize: 14, color: "#F1F5F9" }}>
                        <option value="Kg" style={{ color: 'black' }}>/ Kg</option>
                        <option value="Ton" style={{ color: 'black' }}>/ Ton</option>
                        <option value="Pcs" style={{ color: 'black' }}>/ Pcs</option>
                        <option value="Dus" style={{ color: 'black' }}>/ Dus</option>
                        <option value="Liter" style={{ color: 'black' }}>/ Liter</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Minimal Order (MOQ) *</label>
                    <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
                      <Archive size={18} style={{ color: "#3B82F6", flexShrink: 0 }} />
                      <input type="number" placeholder={`Misal: 50`} value={moq} onChange={(e) => setMoq(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ fontSize: 14, color: "#F1F5F9" }} />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Kapasitas Suplai (Opsional)</label>
                    <div className="flex items-center rounded-2xl px-4 gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: 52 }}>
                      <Archive size={18} style={{ color: "#F59E0B", flexShrink: 0 }} />
                      <input type="text" placeholder="Misal: 2 Ton / Bulan" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ fontSize: 14, color: "#F1F5F9" }} />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button onClick={handleSaveProduct} disabled={!name || !price || !moq} className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all active:scale-95" style={{ background: (!name || !price || !moq) ? "rgba(0,208,132,0.3)" : "linear-gradient(135deg, #00D084 0%, #3B82F6 100%)", boxShadow: (!name || !price || !moq) ? "none" : "0 8px 24px rgba(0,208,132,0.3)", fontSize: 15, fontWeight: 700, color: "white" }}>
                    SIMPAN PRODUK
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}