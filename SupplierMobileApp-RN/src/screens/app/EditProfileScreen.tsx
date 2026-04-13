import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Image, SafeAreaView, Platform, Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete, GooglePlaceData, GooglePlaceDetail } from "react-native-google-places-autocomplete";
import { useApp } from "../../context/AppContext";

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? "";
const CATEGORIES = [
  "Makanan & Minuman", "Elektronik", "Fashion & Pakaian", "Otomotif",
  "Kesehatan", "Furnitur", "Bahan Baku Industri", "Pertanian", "Lainnya",
];

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, setupProfile } = useApp();

  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [description, setDescription] = useState(user?.description || "");
  const [category, setCategory] = useState(user?.category || "");
  const [location, setLocation] = useState(user?.location || "");
  const [coords, setCoords] = useState(user?.coordinates || null);
  const [avatar, setAvatar] = useState<string | null>(
    user?.avatar?.startsWith("http") || user?.avatar?.startsWith("file") ? user.avatar : null
  );
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin Diperlukan", "Akses galeri diperlukan.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const m = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setAvatar(m.uri);
    }
  };

  const handleSave = async () => {
    if (!businessName || !category || !location) {
      Alert.alert("Form Tidak Lengkap", "Nama bisnis, kategori, dan lokasi wajib diisi.");
      return;
    }
    setIsSaving(true);
    try {
      await setupProfile({
        businessName,
        description,
        category,
        location,
        coordinates: coords,
        avatar: avatar || (user?.avatar?.length === 2 ? user.avatar : businessName.substring(0, 2).toUpperCase()),
      });
      Alert.alert("Berhasil", "Profil bisnis berhasil diperbarui.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Gagal", "Tidak dapat menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarText = (businessName || "U").substring(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? <ActivityIndicator size="small" color="#00D084" />
            : <Text style={styles.saveBtnText}>Simpan</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarWrap} onPress={handlePickImage} activeOpacity={0.8}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{avatarText}</Text>
            </View>
          )}
          <View style={styles.cameraOverlay}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.changePhotoLabel}>Ganti Foto Profil</Text>

        {/* Nama Bisnis */}
        <Text style={styles.label}>NAMA BISNIS *</Text>
        <View style={styles.inputRow}>
          <Ionicons name="business-outline" size={18} color="#00D084" />
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Nama bisnis Anda"
            placeholderTextColor="#4B5563"
          />
        </View>

        {/* Deskripsi */}
        <Text style={[styles.label, { marginTop: 16 }]}>TENTANG BISNIS</Text>
        <View style={[styles.inputRow, { height: 90, alignItems: "flex-start", paddingTop: 12 }]}>
          <Ionicons name="document-text-outline" size={18} color="#00D084" style={{ marginTop: 2 }} />
          <TextInput
            style={[styles.input, { textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Deskripsi singkat bisnis..."
            placeholderTextColor="#4B5563"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Kategori */}
        <Text style={[styles.label, { marginTop: 16 }]}>KATEGORI *</Text>
        <TouchableOpacity style={styles.inputRow} onPress={() => setShowCategoryModal(true)} activeOpacity={0.8}>
          <Ionicons name="pricetag-outline" size={18} color="#00D084" />
          <Text style={[styles.input, { color: category ? "#F1F5F9" : "#4B5563" }]}>
            {category || "Pilih Kategori..."}
          </Text>
          <Ionicons name="chevron-down-outline" size={16} color="#64748B" />
        </TouchableOpacity>

        {/* Lokasi */}
        <Text style={[styles.label, { marginTop: 16 }]}>LOKASI OPERASIONAL *</Text>
        <TouchableOpacity style={styles.inputRow} onPress={() => setShowLocationModal(true)} activeOpacity={0.8}>
          <Ionicons name="location-outline" size={18} color="#00D084" />
          <Text style={[styles.input, { color: location ? "#F1F5F9" : "#4B5563" }]} numberOfLines={1}>
            {location || "Pilih lokasi..."}
          </Text>
          {location ? (
            <TouchableOpacity onPress={() => { setLocation(""); setCoords(null); }}>
              <Ionicons name="close-circle" size={16} color="#4B5563" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-forward-outline" size={16} color="#4B5563" />
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Location Modal */}
      <Modal visible={showLocationModal} animationType="slide" statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: "#0A0E1A" }}>
          <SafeAreaView style={styles.modalHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setShowLocationModal(false)}>
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pilih Lokasi</Text>
          </SafeAreaView>
          <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
            <GooglePlacesAutocomplete
              placeholder="Ketik alamat atau nama tempat..."
              onPress={(data: GooglePlaceData, details: GooglePlaceDetail | null) => {
                setLocation(data.description);
                if (details?.geometry?.location) {
                  setCoords({ lat: details.geometry.location.lat, lng: details.geometry.location.lng });
                }
                setShowLocationModal(false);
              }}
              query={{ key: GOOGLE_MAPS_KEY, language: "id", components: "country:id" }}
              fetchDetails
              enablePoweredByContainer={false}
              minLength={2}
              debounce={400}
              textInputProps={{ autoFocus: true, placeholderTextColor: "#4B5563" }}
              styles={{
                container: { flex: 0 },
                textInputContainer: {
                  backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1,
                  borderColor: "rgba(0,208,132,0.3)", borderRadius: 16, paddingHorizontal: 8,
                },
                textInput: { backgroundColor: "transparent", color: "#F1F5F9", fontSize: 14, height: 50 },
                listView: {
                  backgroundColor: "#131929", borderRadius: 16, marginTop: 8,
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
                },
                row: {
                  backgroundColor: "transparent", paddingVertical: 14, paddingHorizontal: 16,
                  borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)",
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
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(0,208,132,0.1)", justifyContent: "center", alignItems: "center" }}>
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
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <TouchableOpacity style={styles.catOverlay} activeOpacity={1} onPress={() => setShowCategoryModal(false)}>
          <View style={styles.catContent}>
            <View style={styles.catHandle} />
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#F1F5F9", marginBottom: 16 }}>Pilih Kategori</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#F1F5F9", flex: 1, marginLeft: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(0,208,132,0.15)" },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: "#00D084" },
  scroll: { padding: 24, paddingBottom: 48 },
  avatarWrap: { alignSelf: "center", marginBottom: 8, position: "relative" },
  avatarImg: { width: 90, height: 90, borderRadius: 24 },
  avatarFallback: {
    width: 90, height: 90, borderRadius: 24, backgroundColor: "#00D084",
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "900", color: "white" },
  cameraOverlay: {
    position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: 10,
    backgroundColor: "#00D084", justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#0B0F1A",
  },
  changePhotoLabel: { textAlign: "center", color: "#00D084", fontSize: 13, fontWeight: "600", marginBottom: 24 },
  label: { fontSize: 11, color: "#94A3B8", fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16, paddingHorizontal: 16, height: 54, marginBottom: 4,
  },
  input: { flex: 1, fontSize: 14, color: "#F1F5F9" },
  modalHeader: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 16, paddingTop: Platform.OS === "android" ? 44 : 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
  },
  catOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  catContent: { backgroundColor: "#161B2C", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  catHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", alignSelf: "center", marginBottom: 16 },
  catItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)",
  },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  orText: { fontSize: 12, color: "#4B5563", fontWeight: "600" },
  gpsBtn: {
    flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 18, padding: 16,
    backgroundColor: "rgba(0,208,132,0.06)", borderWidth: 1, borderColor: "rgba(0,208,132,0.2)",
  },
  gpsBtnText: { fontSize: 14, fontWeight: "700", color: "#F1F5F9" },
  coordsBox: {
    flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16,
    borderRadius: 14, padding: 14, backgroundColor: "rgba(0,208,132,0.08)",
    borderWidth: 1, borderColor: "rgba(0,208,132,0.2)",
  },
});
