import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, LayoutAnimation,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const FAQ_DATA = [
  {
    id: "1",
    question: "Bagaimana cara mendaftar sebagai supplier?",
    answer: "Tap tombol 'Daftar di sini' di halaman login. Isi nama, email, dan password. Setelah berhasil mendaftar, Anda akan diarahkan ke halaman Siapkan Profil Bisnis untuk melengkapi data usaha Anda.",
  },
  {
    id: "2",
    question: "Bagaimana cara menemukan mitra bisnis?",
    answer: "Buka tab 'Peta Mitra' di bagian bawah layar. Anda dapat melihat mitra dalam tampilan peta atau daftar. Gunakan filter kategori untuk mempersempit pencarian. Algoritma AI kami akan mengurutkan mitra berdasarkan jarak dan rating (SAW Algorithm).",
  },
  {
    id: "3",
    question: "Apa itu AI Score pada setiap mitra?",
    answer: "AI Score adalah nilai 0-100 yang dihitung menggunakan algoritma SAW (Simple Additive Weighting). Skor ini mempertimbangkan jarak (bobot 60%) dan rating bintang (bobot 40%). Semakin tinggi skornya, semakin direkomendasikan mitra tersebut untuk Anda.",
  },
  {
    id: "4",
    question: "Bagaimana cara mengajukan kerja sama?",
    answer: "1. Cari mitra di halaman Peta Mitra\n2. Tap mitra yang ingin dihubungi\n3. Tap tombol 'Ajukan Kerjasama' di bawah halaman detail\n4. Atur gaya bahasa dan produk yang ingin ditawarkan\n5. Tap 'Generate dengan AI' untuk membuat draf proposal otomatis\n6. Edit jika perlu, lalu tap 'Kirim Lamaran'",
  },
  {
    id: "5",
    question: "Apakah data lokasi saya aman?",
    answer: "Ya. Data lokasi hanya digunakan untuk menemukan mitra bisnis terdekat dan tidak dibagikan ke pihak ketiga. Anda dapat mengatur izin lokasi kapan saja melalui Pengaturan HP Anda.",
  },
  {
    id: "6",
    question: "Bagaimana cara mengubah password?",
    answer: "Buka tab Profil → Keamanan Akun. Masukkan password lama Anda, lalu buat password baru minimal 6 karakter. Sistem akan memverifikasi identitas Anda sebelum mengizinkan perubahan.",
  },
  {
    id: "7",
    question: "Mengapa rekomendasi mitra tidak muncul?",
    answer: "Pastikan:\n• Backend server sedang berjalan\n• Koneksi internet aktif\n• Izin lokasi telah diberikan ke aplikasi\n\nJika masalah berlanjut, coba restart aplikasi.",
  },
  {
    id: "8",
    question: "Bagaimana cara memperbarui profil bisnis?",
    answer: "Buka tab Profil → Edit Profil. Anda dapat mengubah foto, nama bisnis, deskripsi, kategori, dan lokasi operasional. Perubahan akan langsung tersimpan ke database.",
  },
];

function FAQItem({ item }: { item: typeof FAQ_DATA[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.faqCard, open && styles.faqCardOpen]}
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen(!open);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={open ? "#00D084" : "#4B5563"} />
      </View>
      {open && <Text style={styles.faqAnswer}>{item.answer}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bantuan & FAQ</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Ionicons name="help-buoy" size={36} color="#60A5FA" />
          <Text style={styles.heroTitle}>Ada yang bisa kami bantu?</Text>
          <Text style={styles.heroDesc}>
            Temukan jawaban dari pertanyaan yang sering diajukan di bawah ini.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>PERTANYAAN YANG SERING DIAJUKAN</Text>

        {FAQ_DATA.map((item) => <FAQItem key={item.id} item={item} />)}

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#F59E0B" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#F1F5F9" }}>Masih ada pertanyaan?</Text>
            <Text style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
              Hubungi tim support kami di{" "}
              <Text style={{ color: "#60A5FA" }}>support@supplierai.id</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F1A" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#F1F5F9" },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  heroCard: {
    borderRadius: 20, padding: 24, marginBottom: 20, alignItems: "center",
    backgroundColor: "rgba(59,130,246,0.07)", borderWidth: 1, borderColor: "rgba(59,130,246,0.15)",
  },
  heroTitle: { fontSize: 17, fontWeight: "700", color: "#F1F5F9", marginTop: 12, marginBottom: 8 },
  heroDesc: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#4B5563", letterSpacing: 0.5, marginBottom: 12 },
  faqCard: {
    borderRadius: 16, padding: 16, marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
  },
  faqCardOpen: { borderColor: "rgba(0,208,132,0.25)", backgroundColor: "rgba(0,208,132,0.04)" },
  faqHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  faqQuestion: { fontSize: 13, fontWeight: "600", color: "#F1F5F9", flex: 1, lineHeight: 20 },
  faqAnswer: { fontSize: 13, color: "#94A3B8", marginTop: 12, lineHeight: 22 },
  contactCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 14, borderRadius: 18, padding: 16, marginTop: 8,
    backgroundColor: "rgba(245,158,11,0.07)", borderWidth: 1, borderColor: "rgba(245,158,11,0.15)",
  },
});
