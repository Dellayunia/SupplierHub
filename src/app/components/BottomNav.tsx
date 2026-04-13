// import { Home, Map, ClipboardList, User } from "lucide-react";
// import { useNavigate, useLocation } from "react-router";

// const tabs = [
//   { label: "Home", icon: Home, path: "/app/home" },
//   { label: "Explore", icon: Map, path: "/app/explore" },
//   { label: "Lamaran", icon: ClipboardList, path: "/app/applications" },
//   { label: "Profil", icon: User, path: "/app/profile" },
// ];

// export function BottomNav() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   return (
//     <div
//       className="absolute bottom-0 left-0 right-0 z-50"
//       style={{
//         background: "rgba(11, 15, 26, 0.95)",
//         backdropFilter: "blur(20px)",
//         borderTop: "1px solid rgba(255,255,255,0.08)",
//         paddingBottom: 28,
//         paddingTop: 12,
//       }}
//     >
//       <div className="flex items-center justify-around px-4">
//         {tabs.map((tab) => {
//           const Icon = tab.icon;
//           const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + "/");
//           return (
//             <button
//               key={tab.path}
//               onClick={() => navigate(tab.path)}
//               className="flex flex-col items-center gap-1 transition-all duration-200"
//               style={{ minWidth: 60 }}
//             >
//               <div
//                 className="relative flex items-center justify-center rounded-2xl transition-all duration-200"
//                 style={{
//                   width: 44,
//                   height: 30,
//                   background: isActive ? "rgba(0, 208, 132, 0.15)" : "transparent",
//                 }}
//               >
//                 <Icon
//                   size={20}
//                   style={{
//                     color: isActive ? "#00D084" : "#4B5563",
//                     strokeWidth: isActive ? 2.5 : 1.8,
//                   }}
//                 />
//                 {isActive && (
//                   <div
//                     className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full"
//                     style={{ width: 4, height: 4, background: "#00D084" }}
//                   />
//                 )}
//               </div>
//               <span
//                 style={{
//                   fontSize: 10,
//                   fontWeight: isActive ? 600 : 400,
//                   color: isActive ? "#00D084" : "#4B5563",
//                 }}
//               >
//                 {tab.label}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

import { useLocation, useNavigate } from "react-router";
import { Home, Compass, Package, User } from "lucide-react";
import { motion } from "motion/react";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Daftar menu navigasi bawah
  const navItems = [
    { id: "home", label: "Beranda", icon: Home, path: "/app/home" },
    { id: "explore", label: "Peta Mitra", icon: Compass, path: "/app/explore" },
    // --- MENU BARU KITA ---
    { id: "catalog", label: "Katalog", icon: Package, path: "/app/catalog" }, 
    // ----------------------
    { id: "profile", label: "Profil", icon: User, path: "/app/profile" },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-6 pt-4" 
      style={{ 
        background: "linear-gradient(180deg, transparent 0%, rgba(11,15,26,0.95) 40%, #0B0F1A 100%)", 
        backdropFilter: "blur(10px)" 
      }}
    >
      <div className="flex items-center justify-between px-2">
        {navItems.map((item) => {
          // Cek apakah halaman saat ini sama dengan path menu
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-12 transition-all active:scale-95"
              style={{ color: isActive ? "#00D084" : "#64748B" }}
            >
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                style={{ marginBottom: 4 }} 
              />
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
              
              {/* Indikator titik hijau menyala di atas ikon yang aktif */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-3 w-1.5 h-1.5 rounded-full"
                  style={{ background: "#00D084", boxShadow: "0 0 10px #00D084" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}