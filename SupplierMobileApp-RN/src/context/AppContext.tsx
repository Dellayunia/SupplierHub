import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { auth, db } from "../lib/firebase";
import { Application, APPLICATIONS } from "../data/mockData";

export interface User {
  name: string;
  email: string;
  businessName: string;
  category: string;
  location: string;
  description: string;
  avatar: string;
  coordinates?: { lat: number; lng: number } | null;
}

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  icon: string;
  color: string;
  bg: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  isProfileSetup: boolean;
  isAuthReady: boolean;
  user: User | null;
  applications: Application[];
  notifications: AppNotification[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  setupProfile: (data: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  addApplication: (app: Application) => Promise<void>;
  addNotification: (title: string, desc: string, icon: string, color: string, bg: string) => void;
  markNotificationAsRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileSetup, setIsProfileSetup] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("local_notifs").then(val => {
      if (val) {
        setNotifications(JSON.parse(val));
      } else {
        setNotifications([
          { id: "init_1", title: "Pembaruan Aplikasi v1.0", desc: "Selamat datang di SupplierHub! Coba mulai ajukan proposal dengan AI.", time: "Baru saja", read: false, icon: "megaphone", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" }
        ]);
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            const resolvedUser: User = {
              name: userData.name || "User",
              email: firebaseUser.email || "",
              businessName: userData.businessName || "",
              category: userData.category || "",
              location: userData.location || "",
              description: userData.description || "",
              avatar: userData.avatar || firebaseUser.email?.substring(0, 2).toUpperCase() || "U",
              coordinates: userData.coordinates || null,
            };
            setUser(resolvedUser);
            setIsProfileSetup(!!userData.businessName);
            await AsyncStorage.setItem("supplier_user", JSON.stringify(resolvedUser));
          } else {
            const basicUser: User = {
              name: "User",
              email: firebaseUser.email || "",
              businessName: "",
              category: "",
              location: "",
              description: "",
              avatar: "U",
            };
            setUser(basicUser);
            setIsProfileSetup(false);
          }
          setIsAuthenticated(true);

          // Load applications from Firestore
          const appsRef = collection(db, "users", firebaseUser.uid, "applications");
          const appsSnap = await getDocs(appsRef);
          const loadedApps = appsSnap.docs.map((d) => d.data() as Application);
          loadedApps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setApplications(loadedApps);
        } catch (error) {
          console.error("Gagal memuat profil:", error);
        }
      } else {
        setIsAuthenticated(false);
        setIsProfileSetup(false);
        setUser(null);
        setApplications([]);
        await AsyncStorage.removeItem("supplier_user");
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userUid = userCredential.user.uid;
    const docRef = doc(db, "users", userUid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const resolvedUser: User = {
        name: userData.name || "User",
        email,
        businessName: userData.businessName || "",
        category: userData.category || "",
        location: userData.location || "",
        description: userData.description || "",
        avatar: userData.avatar || email.substring(0, 2).toUpperCase(),
        coordinates: userData.coordinates || null,
      };
      setUser(resolvedUser);
      setIsProfileSetup(!!userData.businessName);
    } else {
      setUser({ name: "User", email, businessName: "", category: "", location: "", description: "", avatar: "U" });
      setIsProfileSetup(false);
    }
    setIsAuthenticated(true);
  };

  const register = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userUid = userCredential.user.uid;
    const initialData = {
      name,
      email,
      avatar: name.substring(0, 2).toUpperCase(),
    };
    await setDoc(doc(db, "users", userUid), initialData);
    setUser({ ...initialData, businessName: "", category: "", location: "", description: "" });
    setIsAuthenticated(true);
    setIsProfileSetup(false);
  };

  const setupProfile = async (data: Partial<User>) => {
    const currentUser = auth.currentUser;
    const updatedUser = user ? { ...user, ...data } : (data as User);
    setUser(updatedUser);
    await AsyncStorage.setItem("supplier_user", JSON.stringify(updatedUser));
    if (currentUser) {
      await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });
    }
    setIsProfileSetup(true);
  };

  const logout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setIsProfileSetup(false);
    setUser(null);
    await AsyncStorage.removeItem("supplier_user");
  };

  const addApplication = async (app: Application) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await setDoc(doc(db, "users", currentUser.uid, "applications", app.id), app);
      setApplications((prev) => [app, ...prev]);
      
      // Hit trigger local notification
      addNotification(
        "Lamaran Terkirim",
        `Proposal kerja sama ke ${app.partnerName} berhasil dikirim!`,
        "paper-plane",
        "#00D084",
        "rgba(0,208,132,0.12)"
      );

    } else {
      Alert.alert("Error", "Anda harus login untuk mengirim lamaran.");
    }
  };

  const addNotification = (title: string, desc: string, icon: string, color: string, bg: string) => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`, title, desc, time: "Baru saja", read: false, icon, color, bg
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      AsyncStorage.setItem("local_notifs", JSON.stringify(updated));
      return updated;
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      AsyncStorage.setItem("local_notifs", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isProfileSetup,
        isAuthReady,
        user,
        applications,
        notifications,
        login,
        register,
        setupProfile,
        logout,
        addApplication,
        addNotification,
        markNotificationAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
