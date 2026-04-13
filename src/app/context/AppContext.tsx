import React, { createContext, useContext, useState, useEffect } from "react"; // Tambahkan useEffect
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"; // Tambahkan onAuthStateChanged
import { Application, APPLICATIONS } from "../data/mockData";
import { doc, setDoc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
interface User {
  name: string;
  email: string;
  businessName: string;
  category: string;
  location: string;
  description: string;
  avatar: string;
  coordinates?: { lat: number; lng: number };
}

interface AppContextType {
  isAuthenticated: boolean;
  isProfileSetup: boolean;
  user: User | null;
  applications: Application[];
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  setupProfile: (data: Partial<User>) => void;
  logout: () => void;
  addApplication: (app: Application) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileSetup, setIsProfileSetup] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

// Memantau perubahan status otentikasi Firebase & Mengambil Data Lamaran
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              name: userData.name || "User",
              email: firebaseUser.email || "",
              businessName: userData.businessName || "",
              category: userData.category || "",
              location: userData.location || "",
              description: userData.description || "",
              avatar: userData.avatar || firebaseUser.email?.substring(0, 2).toUpperCase() || "U",
              coordinates: userData.coordinates || null,
            });
            setIsProfileSetup(!!userData.businessName);
          } else {
             setUser({ name: "User", email: firebaseUser.email || "", businessName: "", category: "", location: "", description: "", avatar: "U" });
             setIsProfileSetup(false);
          }
          setIsAuthenticated(true);

          // --- KODE BARU: AMBIL DATA LAMARAN DARI DATABASE ---
          const appsRef = collection(db, "users", firebaseUser.uid, "applications");
          const appsSnap = await getDocs(appsRef);
          const loadedApps = appsSnap.docs.map(doc => doc.data() as Application);
          
          // Urutkan lamaran dari yang paling baru
          loadedApps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setApplications(loadedApps);
          // ---------------------------------------------------

        } catch (error) {
          console.error("Gagal memuat profil/lamaran pengguna:", error);
        }
      } else {
        setIsAuthenticated(false);
        setIsProfileSetup(false);
        setUser(null);
        setApplications([]); // Kosongkan lamaran jika logout
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userUid = userCredential.user.uid;

      // Membaca laci "users" di database berdasarkan ID Pengguna yang login
      const docRef = doc(db, "users", userUid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // JIKA DATANYA ADA (User lama)
        const userData = docSnap.data();
        setUser({
          name: userData.name || "User",
          email: email,
          businessName: userData.businessName || "",
          category: userData.category || "",
          location: userData.location || "",
          description: userData.description || "",
          avatar: userData.avatar || email.substring(0, 2).toUpperCase(),
          coordinates: userData.coordinates || null,
        });
        
        // Cek apakah dia sudah pernah ngisi nama bisnis?
        if (userData.businessName) {
          setIsProfileSetup(true); // Langsung lempar ke Home
        } else {
          setIsProfileSetup(false); // Lempar ke halaman Setup Profile
        }
      } else {
        // JIKA DATANYA TIDAK ADA DI DATABASE
        setUser({
          name: "User", email, businessName: "", category: "", location: "", description: "", avatar: "U"
        });
        setIsProfileSetup(false);
      }
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Error login:", error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userUid = userCredential.user.uid;

      const initialData = {
        name: name,
        email: email,
        avatar: name.substring(0, 2).toUpperCase(),
      };

      // Membuat laci pertama kali di database
      await setDoc(doc(db, "users", userUid), initialData);

      setUser({
        ...initialData, businessName: "", category: "", location: "", description: ""
      });
      setIsAuthenticated(true);
      setIsProfileSetup(false);
      alert("Pendaftaran Berhasil!");
    } catch (error: any) {
      console.error("Error pendaftaran:", error);
      alert("Gagal mendaftar: " + error.message);
    }
  };

 
  const setupProfile = async (data: Partial<User>) => {
      try {
        const currentUser = auth.currentUser;
        
        // 1. Update State Global (Memori React)
        const updatedUser = user ? { ...user, ...data } : (data as User);
        setUser(updatedUser);

        // 2. Simpan ke LocalStorage (Kunci agar data tidak hilang saat refresh)
        localStorage.setItem("supplier_user", JSON.stringify(updatedUser));

        // 3. Simpan ke Firebase Firestore
        if (currentUser) {
          await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
        }
        
        setIsProfileSetup(true);
      } catch (error) {
        console.error("Error menyimpan ke database:", error);
      }
    };
  const logout = async () => {
    try {
      await signOut(auth); // Keluar dari sesi Firebase
      setIsAuthenticated(false);
      setIsProfileSetup(false);
      setUser(null);
    } catch (error) {
      console.error("Error logout:", error);
    }
  };

  const addApplication = async (app: Application) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Simpan ke laci "applications" milik user tersebut di Firestore
        await setDoc(doc(db, "users", currentUser.uid, "applications", app.id), app);
        
        // Update tampilan secara instan
        setApplications((prev) => [app, ...prev]);
      }
    } catch (error) {
      console.error("Gagal menyimpan lamaran ke database:", error);
      alert("Gagal mengirim lamaran. Periksa koneksi Anda.");
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isProfileSetup,
        user,
        applications,
        login,
        register,
        setupProfile,
        logout,
        addApplication,
      }}
    >
      {/* Tampilkan Loading Screen sederhana saat Firebase sedang mengecek sesi */}
      {!isAuthReady ? (
         <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0A0E1A', color: 'white' }}>
            Memuat...
         </div>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
