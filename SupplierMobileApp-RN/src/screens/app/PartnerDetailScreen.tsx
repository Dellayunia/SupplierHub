import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
  TextInput, Modal, ActivityIndicator, Alert, SafeAreaView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { AppStackParamList } from "../../navigation/AppStack";
import { useApp } from "../../context/AppContext";
import { Application, AttachedProduct } from "../../data/mockData";
import { useProducts, Product } from "../../hooks/useProducts";

type Route = RouteProp<AppStackParamList, "PartnerDetail">;
const BACKEND_URL = "http://172.20.10.2:3000"; // IP PC di jaringan hotspot

const TONES = [
  { id: "formal", label: "Formal" },
  { id: "casual", label: "Santai" },
  { id: "direct", label: "Langsung" },
];

export default function PartnerDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { partner } = route.params;
  const { user, addApplication } = useApp();
  const { products } = useProducts();

  const [showModal, setShowModal] = useState(false);
  const [tone, setTone] = useState("formal");
  const [productNames, setProductNames] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [offerSample, setOfferSample] = useState(false);
  const [proposal, setProposal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const generateProposal = async () => {
    setIsGenerating(true);
    const selectedNames = products.filter((p: Product) => selectedProductIds.includes(p.id)).map((p: Product) => p.name).join(", ");
    const combinedProducts = [selectedNames, productNames].filter(Boolean).join(", ");

    try {
      const res = await axios.post(`${BACKEND_URL}/api/generate-proposal`, {
        supplierName: user?.businessName || user?.name,
        supplierCategory: user?.category,
        partnerName: partner.name,
        partnerCategory: partner.category,
        tone,
        productNames: combinedProducts,
        offerSample,
      });
      setProposal(res.data.proposalText || "");
    } catch {
      // Fallback template
      setProposal(
        `Yth. Tim Pembelian ${partner.name},\n\nPerkenalkan, kami dari ${user?.businessName || "bisnis kami"}. Kami tertarik menjalin kemitraan strategis sebagai pemasok untuk bisnis Anda. Kami menawarkan produk: ${combinedProducts}.\n\nHormat kami,\n${user?.businessName || "Tim kami"}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!proposal) {
      Alert.alert("Proposal Kosong", "Harap generate proposal terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    const attachedProducts: AttachedProduct[] = products
      .filter((p: Product) => selectedProductIds.includes(p.id))
      .map((p: Product) => ({ id: p.id, name: p.name, price: p.price, unit: p.unit, photo: p.photo }));

    const app: Application = {
      id: `app_${Date.now()}`,
      partnerId: partner.id,
      partnerName: partner.name,
      partnerImage: partner.image,
      partnerCategory: partner.category,
      message: proposal,
      status: "pending",
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      attachedProducts: attachedProducts.length > 0 ? attachedProducts : undefined,
    };
    try {
      await addApplication(app);
      setShowModal(false);
      setProposal("");
      setSelectedProductIds([]);
      setProductNames("");
      Alert.alert("Berhasil! 🎉", "Lamaran kerja sama berhasil dikirim.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert("Gagal", "Gagal mengirim lamaran. Periksa koneksi Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={{ position: "relative" }}>
          <Image source={{ uri: partner.image }} style={styles.heroImg} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Name & Category */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{partner.name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{partner.category}</Text>
              </View>
            </View>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{partner.rating}</Text>
              <Text style={styles.reviewCount}>({partner.reviewCount})</Text>
            </View>
          </View>

          {/* Info rows */}
          {[
            { icon: "location-outline", text: partner.address, color: "#64748B" },
            { icon: "call-outline", text: partner.phone, color: "#64748B" },
            { icon: "time-outline", text: partner.openHours, color: "#64748B" },
            { icon: "navigate-outline", text: `${partner.distance} km dari lokasi Anda`, color: "#00D084" },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Ionicons name={item.icon as any} size={16} color={item.color} />
              <Text style={[styles.infoText, { color: item.color }]}>{item.text}</Text>
            </View>
          ))}

          {/* Description */}
          <View style={styles.desc}>
            <Text style={styles.sectionTitle}>Tentang Mitra</Text>
            <Text style={styles.descText}>{partner.description}</Text>
          </View>

          {/* Reviews */}
          <Text style={styles.sectionTitle}>Ulasan ({partner.reviews?.length || 0})</Text>
          {(partner.reviews || []).map((review: any) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={styles.reviewAvatar}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#00D084" }}>{review.avatar}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#F1F5F9" }}>{review.author}</Text>
                    <Text style={{ fontSize: 11, color: "#64748B" }}>{review.date}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 2 }}>
                  {[1,2,3,4,5].map((s) => (
                    <Ionicons key={s} name="star" size={12} color={s <= review.rating ? "#F59E0B" : "#2D3748"} />
                  ))}
                </View>
              </View>
              <Text style={{ fontSize: 13, color: "#94A3B8", lineHeight: 20 }}>{review.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.applySection}>
        <TouchableOpacity style={styles.applyBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
          <Ionicons name="send-outline" size={18} color="white" />
          <Text style={styles.applyBtnText}>Ajukan Kerjasama</Text>
        </TouchableOpacity>
      </View>

      {/* Proposal Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#F1F5F9" }}>Buat Proposal AI</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product Picker */}
              <Text style={styles.label}>Pilih Produk dari Katalog</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
                {products.length === 0 && (
                  <Text style={{ fontSize: 12, color: "#64748B", fontStyle: "italic", marginLeft: 4 }}>
                    Katalog Anda kosong.
                  </Text>
                )}
                {products.map((p: Product) => {
                  const selected = selectedProductIds.includes(p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.productPill, selected && styles.productPillActive]}
                      onPress={() => toggleProduct(p.id)}
                      activeOpacity={0.8}
                    >
                      {p.photo ? (
                        <Image source={{ uri: p.photo }} style={styles.pillImg} />
                      ) : (
                        <Ionicons name="cube" size={14} color={selected ? "white" : "#64748B"} />
                      )}
                      <Text style={[styles.pillText, selected && { color: "white" }]}>{p.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.label}>Produk Tambahan (Opsional)</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ketik produk lain..."
                  placeholderTextColor="#4B5563"
                  value={productNames}
                  onChangeText={setProductNames}
                />
              </View>

              <Text style={[styles.label, { marginTop: 16 }]}>Gaya Bahasa</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                {TONES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.toneBtn, tone === t.id && styles.toneBtnActive]}
                    onPress={() => setTone(t.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[{ fontSize: 13, color: "#64748B" }, tone === t.id && { color: "white", fontWeight: "700" }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}
                onPress={() => setOfferSample(!offerSample)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, offerSample && styles.checkboxActive]}>
                  {offerSample && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text style={{ fontSize: 13, color: "#94A3B8" }}>Tawarkan sampel gratis</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.generateBtn} onPress={generateProposal} activeOpacity={0.85} disabled={isGenerating}>
                {isGenerating
                  ? <ActivityIndicator color="white" />
                  : <><Ionicons name="sparkles" size={16} color="white" /><Text style={styles.generateBtnText}>Generate dengan AI</Text></>}
              </TouchableOpacity>

              {!!proposal && (
                <View style={styles.proposalBox}>
                  <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Draf Proposal:</Text>
                  <TextInput
                    style={styles.proposalInput}
                    value={proposal}
                    onChangeText={setProposal}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              )}

              {!!proposal && (
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85} disabled={isSubmitting}>
                  {isSubmitting
                    ? <ActivityIndicator color="white" />
                    : <><Ionicons name="send" size={16} color="white" /><Text style={styles.submitBtnText}>Kirim Lamaran</Text></>}
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  heroImg: { width: "100%", height: 260, resizeMode: "cover" },
  backBtn: {
    position: "absolute", top: 48, left: 16, width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center",
  },
  content: { padding: 20 },
  name: { fontSize: 22, fontWeight: "800", color: "#F1F5F9", marginBottom: 8 },
  categoryBadge: {
    alignSelf: "flex-start", backgroundColor: "rgba(0,208,132,0.15)",
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  categoryText: { fontSize: 12, color: "#00D084", fontWeight: "600" },
  ratingBox: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 18, fontWeight: "700", color: "#F59E0B" },
  reviewCount: { fontSize: 12, color: "#64748B" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  infoText: { fontSize: 13, flex: 1 },
  desc: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginTop: 16, marginBottom: 20,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#F1F5F9", marginBottom: 12 },
  descText: { fontSize: 13, color: "#94A3B8", lineHeight: 22 },
  reviewCard: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 12,
  },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(0,208,132,0.1)",
    justifyContent: "center", alignItems: "center",
  },
  applySection: {
    position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36,
    backgroundColor: "rgba(11,15,26,0.95)",
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.07)",
  },
  applyBtn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10,
    borderRadius: 18, paddingVertical: 16, backgroundColor: "#00D084",
    shadowColor: "#00D084", shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  applyBtnText: { fontSize: 16, fontWeight: "800", color: "white" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#161B2C", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, maxHeight: "85%",
  },
  label: { fontSize: 11, color: "#94A3B8", fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 },
  productPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  productPillActive: { backgroundColor: "#00D084", borderColor: "#00D084" },
  pillImg: { width: 16, height: 16, borderRadius: 4 },
  pillText: { fontSize: 13, color: "#94A3B8", fontWeight: "600" },
  toneBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  toneBtnActive: { backgroundColor: "#00D084", borderColor: "transparent" },
  inputWrap: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14,
  },
  textInput: { fontSize: 14, color: "#F1F5F9", paddingVertical: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  checkboxActive: { backgroundColor: "#00D084", borderColor: "#00D084" },
  generateBtn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
    borderRadius: 16, paddingVertical: 14, backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  generateBtnText: { fontSize: 14, fontWeight: "700", color: "white" },
  proposalBox: {
    marginTop: 16, backgroundColor: "rgba(0,208,132,0.05)", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(0,208,132,0.15)", padding: 14,
  },
  proposalInput: { fontSize: 13, color: "#94A3B8", lineHeight: 22, minHeight: 120 },
  submitBtn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
    borderRadius: 16, paddingVertical: 14, marginTop: 12, backgroundColor: "#00D084",
    shadowColor: "#00D084", shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  submitBtnText: { fontSize: 14, fontWeight: "800", color: "white" },
});
