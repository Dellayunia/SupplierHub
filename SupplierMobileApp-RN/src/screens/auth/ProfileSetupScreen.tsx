import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Image, Alert, Modal, SafeAreaView, Platform, KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete, GooglePlaceData, GooglePlaceDetail } from "react-native-google-places-autocomplete";
import { AuthStackParamList } from "../../navigation/AuthStack";
import { useApp } from "../../context/AppContext";

type Nav = StackNavigationProp<AuthStackParamList, "ProfileSetup">;

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? "";
const CATEGORIES = [
  "Makanan & Minuman", "Elektronik", "Fashion & Pakaian", "Otomotif",
  "Kesehatan", "Furnitur", "Bahan Baku Industri", "Pertanian", "Lainnya",
];

export default function ProfileSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { setupProfile } = useApp();

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  // ─── Pick Image ───────────────────────────────────────────────────────────
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin Diperlukan", "Akses galeri diperlukan untuk memilih foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setAvatar(manipulated.uri);
    }
  };

  // ─── GPS Detect ───────────────────────────────────────────────────────────
  const detectLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin Diperlukan", "Izin lokasi diperlukan.");
      return;
    }
    setDetectingLocation(true);
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
        );
        const data = await res.json();
        if (data.results?.[0]) {
          setLocation(data.results[0].formatted_address);
        }
      } catch {
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
      setShowLocationModal(false);
    } catch {
      Alert.alert("Gagal", "Tidak dapat membaca posisi GPS.");
    } finally {
      setDetectingLocation(false);
    }
  };

  // ─── Save Profile ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!businessName || !category || !location) {
      Alert.alert("Form Tidak Lengkap", "Nama bisnis, kategori, dan lokasi wajib diisi.");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    await setupProfile({
      businessName,
      description,
      category,
      location,
      coordinates: coords,
      avatar: avatar || businessName.substring(0, 2).toUpperCase(),
    });
    setDone(true);
  };

  // ─── Success State ────────────────────────────────────────────────────────
  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0E1A", justifyContent: "center", alignItems: "center" }}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={52} color="#00D084" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#F1F5F9", marginTop: 20 }}>
          Profil Berhasil Dibuat!
        </Text>
        <Text style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>
          Siap temukan mitra bisnis Anda...
        </Text>
      </View>
    );
  }

  // ─── Main Form ────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Siapkan Profil Bisnis</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarBtn} onPress={handlePickImage} activeOpacity={0.8}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={28} color="#00D084" />
                <Text style={{ fontSize: 10, color: "#64748B", fontWeight: "600", marginTop: 4 }}>PILIH FOTO</Text>
              </>
            )}
          </TouchableOpacity>
          {avatar && (
            <TouchableOpacity style={styles.removeAvatar} onPress={() => setAvatar(null)}>
              <Ionicons name="close" size={12} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Nama Bisnis */}
        <Text style={styles.label}>NAMA BISNIS *</Text>
        <View style={styles.inputRow}>
          <Ionicons name="business-outline" size={18} color="#00D084" />
          <TextInput
            style={styles.input}
            placeholder="Masukkan nama bisnis Anda..."
            placeholderTextColor="#4B5563"
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>

        {/* Deskripsi */}
        <Text style={[styles.label, { marginTop: 14 }]}>TENTANG BISNIS</Text>
        <View style={[styles.inputRow, { height: 90, alignItems: "flex-start", paddingTop: 12 }]}>
          <Ionicons name="document-text-outline" size={18} color="#00D084" style={{ marginTop: 2 }} />
          <TextInput
            style={[styles.input, { textAlignVertical: "top" }]}
            placeholder="Ceritakan singkat bisnis Anda..."
            placeholderTextColor="#4B5563"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Kategori */}
        <Text style={[styles.label, { marginTop: 14 }]}>KATEGORI UTAMA *</Text>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setShowCategoryModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="pricetag-outline" size={18} color="#00D084" />
          <Text style={[styles.input, { color: category ? "#F1F5F9" : "#4B5563" }]}>
            {category || "Pilih Kategori..."}
          </Text>
          <Ionicons name="chevron-down-outline" size={16} color="#64748B" />
        </TouchableOpacity>

        {/* Lokasi — opens search modal */}
        <Text style={[styles.label, { marginTop: 14 }]}>LOKASI OPERASIONAL *</Text>
        <TouchableOpacity
          style={styles.inputRow}
          onPress={() => setShowLocationModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="location-outline" size={18} color="#00D084" />
          <Text
            style={[styles.input, { color: location ? "#F1F5F9" : "#4B5563" }]}
            numberOfLines={1}
          >
            {location || "Cari atau gunakan GPS..."}
          </Text>
          {location ? (
            <TouchableOpacity onPress={() => { setLocation(""); setCoords(null); }}>
              <Ionicons name="close-circle" size={16} color="#4B5563" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-forward-outline" size={16} color="#4B5563" />
          )}
        </TouchableOpacity>

        {/* Konfirmasi */}
        <TouchableOpacity
          style={[styles.btn, (!businessName || !category || !location) && styles.btnDisabled]}
          onPress={handleSave}
          disabled={isLoading || !businessName || !category || !location}
          activeOpacity={0.8}
        >
          {isLoading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.btnText}>KONFIRMASI PROFIL</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* ─── Location Search Modal ──────────────────────────────────────────── */}
      <Modal visible={showLocationModal} animationType="slide" statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, backgroundColor: "#0A0E1A" }}
        >
          {/* Header */}
          <SafeAreaView style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowLocationModal(false)}
              style={styles.modalBackBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pilih Lokasi</Text>
          </SafeAreaView>

          {/* Google Places Autocomplete — full screen, no ScrollView parent */}
          <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
            <GooglePlacesAutocomplete
              placeholder="Ketik alamat, nama gedung, atau kota..."
              onPress={(data: GooglePlaceData, details: GooglePlaceDetail | null) => {
                setLocation(data.description);
                if (details?.geometry?.location) {
                  setCoords({
                    lat: details.geometry.location.lat,
                    lng: details.geometry.location.lng,
                  });
                }
                setShowLocationModal(false);
              }}
              query={{
                key: GOOGLE_MAPS_KEY,
                language: "id",
                components: "country:id",
              }}
              fetchDetails
              enablePoweredByContainer={false}
              minLength={2}
              debounce={400}
              textInputProps={{
                autoFocus: true,
                placeholderTextColor: "#4B5563",
              }}
              styles={{
                container: { flex: 0 },
                textInputContainer: {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(0,208,132,0.3)",
                  borderRadius: 16,
                  paddingHorizontal: 8,
                  overflow: "hidden",
                },
                textInput: {
                  backgroundColor: "transparent",
                  color: "#F1F5F9",
                  fontSize: 14,
                  height: 50,
                },
                listView: {
                  backgroundColor: "#131929",
                  borderRadius: 16,
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.07)",
                  overflow: "hidden",
                },
                row: {
                  backgroundColor: "transparent",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.05)",
                },
                description: { color: "#F1F5F9", fontSize: 13 },
                poweredContainer: { display: "none" },
              }}
              renderLeftButton={() => (
                <View style={{ justifyContent: "center", paddingLeft: 8 }}>
                  <Ionicons name="search-outline" size={18} color="#00D084" />
                </View>
              )}
              renderRow={(rowData) => (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={styles.rowIconBox}>
                    <Ionicons name="location-outline" size={16} color="#00D084" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: "#F1F5F9", fontWeight: "600" }} numberOfLines={1}>
                      {rowData.structured_formatting?.main_text || rowData.description}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }} numberOfLines={1}>
                      {rowData.structured_formatting?.secondary_text || ""}
                    </Text>
                  </View>
                </View>
              )}
            />

            {/* Divider */}
            <View style={styles.orRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>atau</Text>
              <View style={styles.divider} />
            </View>

            {/* GPS Button */}
            <TouchableOpacity
              style={styles.gpsBtn}
              onPress={detectLocation}
              disabled={detectingLocation}
              activeOpacity={0.85}
            >
              {detectingLocation ? (
                <>
                  <ActivityIndicator size="small" color="#00D084" />
                  <Text style={styles.gpsBtnText}>Mendeteksi lokasi GPS...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="navigate" size={20} color="#00D084" />
                  <View>
                    <Text style={styles.gpsBtnText}>Gunakan Lokasi GPS Saya</Text>
                    <Text style={{ fontSize: 11, color: "#64748B" }}>Deteksi otomatis berdasarkan posisi Anda</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* Selected location display */}
            {!!coords && (
              <View style={styles.coordsBox}>
                <Ionicons name="checkmark-circle" size={16} color="#00D084" />
                <Text style={{ fontSize: 12, color: "#00D084", flex: 1 }} numberOfLines={2}>
                  {location}
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── Category Modal ─────────────────────────────────────────────────── */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.catOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.catContent}>
            <View style={styles.catHandle} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#F1F5F9", marginBottom: 16 }}>
              Pilih Kategori
            </Text>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.catItem}
                onPress={() => { setCategory(cat); setShowCategoryModal(false); }}
                activeOpacity={0.7}
              >
                <Text style={{ color: cat === category ? "#00D084" : "#94A3B8", fontSize: 14 }}>{cat}</Text>
                {cat === category && <Ionicons name="checkmark" size={16} color="#00D084" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: "700", color: "#F1F5F9", textAlign: "center", marginBottom: 24 },
  avatarSection: { alignItems: "center", marginBottom: 28, position: "relative", alignSelf: "center" },
  avatarBtn: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 2, borderColor: "rgba(0,208,132,0.4)", borderStyle: "dashed",
    justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  avatarImg: { width: 100, height: 100, borderRadius: 50 },
  removeAvatar: {
    position: "absolute", top: 0, right: 0, backgroundColor: "#EF4444",
    borderRadius: 10, padding: 4,
  },
  label: { fontSize: 11, color: "#94A3B8", fontWeight: "700", marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16, paddingHorizontal: 16, height: 54, marginBottom: 4,
  },
  input: { flex: 1, fontSize: 14, color: "#F1F5F9" },
  btn: {
    borderRadius: 16, paddingVertical: 18, marginTop: 28,
    backgroundColor: "#00D084", alignItems: "center",
    shadowColor: "#00D084", shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  btnDisabled: { backgroundColor: "rgba(255,255,255,0.06)", shadowOpacity: 0 },
  btnText: { fontSize: 16, fontWeight: "800", color: "white", letterSpacing: 0.5 },
  successCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(0,208,132,0.12)",
    justifyContent: "center", alignItems: "center",
  },

  // ─── Location Modal ─────────────────────────────────────────────────────────
  modalHeader: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 44 : 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
  },
  modalBackBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#F1F5F9" },
  rowIconBox: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(0,208,132,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  orText: { fontSize: 12, color: "#4B5563", fontWeight: "600" },
  gpsBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 18, padding: 16,
    backgroundColor: "rgba(0,208,132,0.06)", borderWidth: 1, borderColor: "rgba(0,208,132,0.2)",
  },
  gpsBtnText: { fontSize: 14, fontWeight: "700", color: "#F1F5F9" },
  coordsBox: {
    flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16,
    borderRadius: 14, padding: 14, backgroundColor: "rgba(0,208,132,0.08)",
    borderWidth: 1, borderColor: "rgba(0,208,132,0.2)",
  },

  // ─── Category Modal ─────────────────────────────────────────────────────────
  catOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  catContent: {
    backgroundColor: "#161B2C", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  catHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "center", marginBottom: 16,
  },
  catItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)",
  },
});
