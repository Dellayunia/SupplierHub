import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  category: string;
  photo: string | null;
}

const STORAGE_KEY = "catalog_products";

const DEFAULT_PRODUCTS: Product[] = [
  { id: "1", name: "Tepung Terigu Premium", description: "Tepung protein tinggi", price: "85.000", unit: "25 kg", category: "Bahan Makanan", photo: null },
  { id: "2", name: "Gula Pasir Lokal", description: "Gula putih BPOM tersertifikasi", price: "12.500", unit: "1 kg", category: "Bahan Makanan", photo: null },
  { id: "3", name: "Minyak Goreng Curah", description: "Minyak kelapa sawit murni", price: "13.000", unit: "1 liter", category: "Bahan Makanan", photo: null },
];

export function useProducts() {
  const [products, setProductsState] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const snap = await getDocs(collection(db, "users", user.uid, "products"));
          if (!snap.empty) {
            const loaded = snap.docs.map(d => d.data() as Product);
            setProductsState(loaded);
            await AsyncStorage.setItem(`catalog_${user.uid}`, JSON.stringify(loaded));
          } else {
            // Fallback to local if no cloud data yet
            const val = await AsyncStorage.getItem(`catalog_${user.uid}`);
            if (val) setProductsState(JSON.parse(val));
          }
        } catch (error) {
          const val = await AsyncStorage.getItem(`catalog_${user.uid}`);
          if (val) setProductsState(JSON.parse(val));
        }
      } else {
        const val = await AsyncStorage.getItem(STORAGE_KEY);
        if (val) setProductsState(JSON.parse(val));
      }
      setLoaded(true);
    };
    fetchCatalog();
  }, []);

  const persistLocally = (updated: Product[]) => {
    const user = auth.currentUser;
    if (user) AsyncStorage.setItem(`catalog_${user.uid}`, JSON.stringify(updated));
    else AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addProduct = useCallback(async (p: Omit<Product, "id">) => {
    const newProduct = { id: `${Date.now()}`, ...p };
    const user = auth.currentUser;
    if (user) await setDoc(doc(db, "users", user.uid, "products", newProduct.id), newProduct);

    setProductsState((prev) => {
      const updated = [...prev, newProduct];
      persistLocally(updated);
      return updated;
    });
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const user = auth.currentUser;
    if (user) await setDoc(doc(db, "users", user.uid, "products", id), data, { merge: true });

    setProductsState((prev) => {
      const updated = prev.map((p) => p.id === id ? { ...p, ...data } : p);
      persistLocally(updated);
      return updated;
    });
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    const user = auth.currentUser;
    if (user) await deleteDoc(doc(db, "users", user.uid, "products", id));

    setProductsState((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      persistLocally(updated);
      return updated;
    });
  }, []);

  return { products, loaded, addProduct, updateProduct, deleteProduct };
}
