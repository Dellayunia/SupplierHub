import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, Image, SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useProducts } from "../../hooks/useProducts";

const CATEGORIES = [
  "Makanan & Minuman", "Elektronik", "Fashion & Pakaian", "Otomotif",
  "Kesehatan", "Furnitur", "Bahan Baku Industri", "Pertanian", "Lainnya",
];

export default function CatalogScreen() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", unit: "", category: "", photo: null as string | null });

  const openAdd = () => { setEditing(null); setForm({ name: "", description: "", price: "", unit: "", category: "", photo: null }); setShowModal(true); };
  const openEdit = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setEditing(id);
    setForm({ name: p.name, description: p.description, price: p.price, unit: p.unit, category: p.category, photo: p.photo });
    setShowModal(true);
  };

  const save = () => {
    if (!form.name || !form.price) { Alert.alert("Lengkapi", "Nama produk dan harga wajib diisi."); return; }
    if (editing) updateProduct(editing, form);
    else addProduct(form);
    setShowModal(false);
  };

  const del = (id: string) => Alert.alert("Hapus?", "Yakin ingin menghapus produk ini?", [
    { text: "Batal", style: "cancel" },
    { text: "Hapus", style: "destructive", onPress: () => deleteProduct(id) },
  ]);

  const pickPhoto = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") { Alert.alert("Izin Diperlukan", "Izin diperlukan untuk memilih foto."); return; }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const m = await ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 400 } }], { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG });
      setForm((f) => ({ ...f, photo: m.uri }));
    }
  };

  const showPhotoMenu = () => Alert.alert("Foto Produk", "Pilih sumber foto", [
    { text: "📷  Kamera", onPress: () => pickPhoto(true) },
    { text: "🖼️  Galeri", onPress: () => pickPhoto(false) },
    { text: "Batal", style: "cancel" },
  ]);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Katalog Produk</Text>
          <Text style={s.sub}>{products.length} produk terdaftar</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={openAdd} activeOpacity={0.8}>
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {products.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="cube-outline" size={60} color="#2D3748" />
            <Text style={s.emptyTitle}>Katalog Masih Kosong</Text>
            <Text style={s.emptySub}>Tambahkan produk untuk ditawarkan kepada mitra bisnis</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={openAdd}><Text style={{ color: "white", fontWeight: "700" }}>+ Tambah Produk</Text></TouchableOpacity>
          </View>
        ) : products.map((p) => (
          <View key={p.id} style={s.card}>
            {p.photo ? <Image source={{ uri: p.photo }} style={s.cardImg} /> : <View style={s.cardIcon}><Ionicons name="cube" size={28} color="#60A5FA" /></View>}
            <View style={{ flex: 1 }}>
              <Text style={s.cardName}>{p.name}</Text>
              <Text style={s.cardDesc} numberOfLines={2}>{p.description}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <View style={s.price}><Text style={{ fontSize: 13, fontWeight: "700", color: "#00D084" }}>Rp {p.price}</Text></View>
                <Text style={{ fontSize: 11, color: "#64748B" }}>/ {p.unit}</Text>
                {!!p.category && <View style={s.catBadge}><Text style={{ fontSize: 10, color: "#93C5FD", fontWeight: "600" }}>{p.category}</Text></View>}
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <TouchableOpacity style={s.editBtn} onPress={() => openEdit(p.id)} activeOpacity={0.8}><Ionicons name="pencil-outline" size={15} color="#60A5FA" /></TouchableOpacity>
              <TouchableOpacity style={s.delBtn} onPress={() => del(p.id)} activeOpacity={0.8}><Ionicons name="trash-outline" size={15} color="#F87171" /></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

    <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => { setShowModal(false); setShowCategoryModal(false); }}>
        <View style={s.overlay}>
          <ScrollView style={s.sheet} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#F1F5F9" }}>{editing ? "Edit Produk" : "Tambah Produk"}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setShowCategoryModal(false); }}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
            </View>

            <Text style={s.label}>FOTO PRODUK</Text>
            <TouchableOpacity style={s.photoPicker} onPress={showPhotoMenu} activeOpacity={0.8}>
              {form.photo ? (
                <>
                  <Image source={{ uri: form.photo }} style={s.photoImg} />
                  <TouchableOpacity style={s.removePhoto} onPress={() => setForm((f) => ({ ...f, photo: null }))}>
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={s.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={36} color="#00D084" />
                  <Text style={{ color: "#64748B", fontSize: 12, fontWeight: "600", marginTop: 8 }}>Ambil / Pilih Foto</Text>
                  <Text style={{ color: "#374151", fontSize: 10, marginTop: 4 }}>Tampilkan foto produk Anda</Text>
                </View>
              )}
            </TouchableOpacity>

            {([
              { key: "name", label: "NAMA PRODUK *", ph: "Misal: Tepung Terigu" },
              { key: "description", label: "DESKRIPSI", ph: "Deskripsi singkat...", multi: true },
              { key: "price", label: "HARGA (Rp) *", ph: "85.000", num: true },
              { key: "unit", label: "SATUAN", ph: "kg, liter, pcs..." },
            ] as any[]).map(({ key, label, ph, multi, num }) => (
              <View key={key} style={{ marginBottom: 14 }}>
                <Text style={s.label}>{label}</Text>
                <TextInput
                  style={[s.input, multi && { height: 80, textAlignVertical: "top", paddingTop: 12 }]}
                  placeholder={ph} placeholderTextColor="#4B5563"
                  value={(form as any)[key]} onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                  keyboardType={num ? "numeric" : "default"} multiline={!!multi} numberOfLines={multi ? 3 : 1}
                />
              </View>
            ))}

            {/* Kategori Product Select */}
            <View style={{ marginBottom: 14 }}>
              <Text style={s.label}>KATEGORI</Text>
              <TouchableOpacity style={s.inputRow} onPress={() => setShowCategoryModal(true)} activeOpacity={0.8}>
                <Ionicons name="pricetag-outline" size={16} color="#00D084" />
                <Text style={[s.input, { flex: 1, borderWidth: 0, paddingVertical: 0, color: form.category ? "#F1F5F9" : "#4B5563" }]}>
                  {form.category || "Pilih Kategori..."}
                </Text>
                <Ionicons name="chevron-down-outline" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.saveBtn} onPress={save} activeOpacity={0.85}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: "white" }}>{editing ? "Simpan Perubahan" : "Tambah ke Katalog"}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Embedded Category Picker Overlay */}
          {showCategoryModal && (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }]}>
              <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowCategoryModal(false)} />
              <View style={s.catContent}>
                <View style={s.catHandle} />
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#F1F5F9", marginBottom: 16 }}>Pilih Kategori</Text>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={s.catItem}
                    onPress={() => { setForm((f) => ({ ...f, category: cat })); setShowCategoryModal(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: cat === form.category ? "#00D084" : "#94A3B8", fontSize: 14 }}>{cat}</Text>
                    {cat === form.category && <Ionicons name="checkmark" size={16} color="#00D084" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)" },
  title: { fontSize: 22, fontWeight: "800", color: "#F1F5F9" },
  sub: { fontSize: 13, color: "#64748B", marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#00D084", justifyContent: "center", alignItems: "center", shadowColor: "#00D084", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#4B5563", marginTop: 16 },
  emptySub: { fontSize: 13, color: "#374151", textAlign: "center", marginTop: 8 },
  emptyBtn: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14, backgroundColor: "#00D084" },
  card: { flexDirection: "row", gap: 12, borderRadius: 20, padding: 14, marginBottom: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", alignItems: "flex-start" },
  cardImg: { width: 60, height: 60, borderRadius: 14 },
  cardIcon: { width: 60, height: 60, borderRadius: 14, backgroundColor: "rgba(59,130,246,0.1)", justifyContent: "center", alignItems: "center" },
  cardName: { fontSize: 14, fontWeight: "700", color: "#F1F5F9" },
  cardDesc: { fontSize: 12, color: "#64748B", marginTop: 4, lineHeight: 18 },
  price: { backgroundColor: "rgba(0,208,132,0.12)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  catBadge: { backgroundColor: "rgba(59,130,246,0.12)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(59,130,246,0.1)", justifyContent: "center", alignItems: "center" },
  delBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.1)", justifyContent: "center", alignItems: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#161B2C", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: "92%" },
  label: { fontSize: 11, color: "#94A3B8", fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#F1F5F9" },
  saveBtn: { borderRadius: 16, paddingVertical: 16, backgroundColor: "#00D084", alignItems: "center", marginTop: 8, shadowColor: "#00D084", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  photoPicker: { borderRadius: 18, marginBottom: 18, borderWidth: 1.5, borderColor: "rgba(0,208,132,0.25)", borderStyle: "dashed", backgroundColor: "rgba(0,208,132,0.04)", overflow: "hidden", position: "relative" },
  photoPlaceholder: { alignItems: "center", paddingVertical: 32 },
  photoImg: { width: "100%", height: 180, resizeMode: "cover" },
  removePhoto: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 14, paddingHorizontal: 14, height: 50 },
  catOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  catContent: { backgroundColor: "#161B2C", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  catHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", alignSelf: "center", marginBottom: 16 },
  catItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
});
