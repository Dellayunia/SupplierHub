import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Switch, Modal
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "../../context/AppContext";

interface NotifSettings {
  newApplication: boolean;
  applicationAccepted: boolean;
  applicationRejected: boolean;
  newPartnerNearby: boolean;
  weeklyDigest: boolean;
  promotions: boolean;
}

const DEFAULT_SETTINGS: NotifSettings = {
  newApplication: true,
  applicationAccepted: true,
  applicationRejected: true,
  newPartnerNearby: false,
  weeklyDigest: true,
  promotions: false,
};

const NOTIF_ITEMS = [
  {
    group: "Lamaran & Status", color: "#00D084",
    items: [
      { key: "newApplication", label: "Lamaran Terkirim", desc: "Konfirmasi saat lamaran berhasil dikirim" },
      { key: "applicationAccepted", label: "Lamaran Diterima", desc: "Notifikasi saat mitra menerima lamaran Anda" },
      { key: "applicationRejected", label: "Lamaran Ditolak", desc: "Notifikasi saat lamaran tidak diterima" },
    ],
  },
  {
    group: "Rekomendasi", color: "#3B82F6",
    items: [
      { key: "newPartnerNearby", label: "Mitra Baru di Area Anda", desc: "Notifikasi saat ada mitra baru terdeteksi" },
      { key: "weeklyDigest", label: "Ringkasan Mingguan", desc: "Laporan aktivitas setiap minggu via notifikasi" },
    ],
  },
  {
    group: "Lainnya", color: "#F59E0B",
    items: [
      { key: "promotions", label: "Promosi & Info Terbaru", desc: "Update fitur dan penawaran dari SupplierHub" },
    ],
  },
];

export default function NotificationScreen() {
  const navigation = useNavigation();
  const { notifications, markNotificationAsRead } = useApp();
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("notif_settings").then((val) => {
      if (val) setSettings(JSON.parse(val));
    });
  }, []);

  const toggle = async (key: keyof NotifSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    await AsyncStorage.setItem("notif_settings", JSON.stringify(updated));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Halaman Notifikasi</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount} Baru</Text>
          </View>
        )}
        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={20} color="#F1F5F9" />
        </TouchableOpacity>
      </View>

      {/* NOTIFICATION INBOX */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => (
          <TouchableOpacity 
            key={notif.id} 
            style={[styles.notifCard, !notif.read && styles.notifCardUnread]} 
            onPress={() => markNotificationAsRead(notif.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.notifIconWrap, { backgroundColor: notif.bg }]}>
              <Ionicons name={notif.icon as any} size={20} color={notif.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <Text style={[styles.notifTitle, !notif.read && { color: "#F1F5F9" }]}>{notif.title}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
              <Text style={styles.notifDesc}>{notif.desc}</Text>
            </View>
            {!notif.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* SETTINGS MODAL */}
      <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.container, { backgroundColor: "#161B2C" }]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setShowSettings(false)}>
              <Ionicons name="chevron-down" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pengaturan Notifikasi</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
            {NOTIF_ITEMS.map((group) => (
              <View key={group.group} style={{ marginBottom: 20 }}>
                <View style={styles.groupHeader}>
                  <View style={[styles.groupDot, { backgroundColor: group.color }]} />
                  <Text style={styles.groupTitle}>{group.group}</Text>
                </View>
                <View style={styles.card}>
                  {group.items.map((item, idx) => (
                    <View key={item.key} style={[styles.itemRow, idx < group.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        <Text style={styles.itemDesc}>{item.desc}</Text>
                      </View>
                      <Switch
                        value={settings[item.key as keyof NotifSettings]}
                        onValueChange={() => toggle(item.key as keyof NotifSettings)}
                        trackColor={{ false: "rgba(255,255,255,0.1)", true: group.color }}
                        thumbColor="white"
                        ios_backgroundColor="rgba(255,255,255,0.1)"
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#F1F5F9", flex: 1 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center", alignItems: "center",
  },
  unreadBadge: { backgroundColor: "rgba(0,208,132,0.15)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  unreadText: { fontSize: 11, fontWeight: "700", color: "#00D084" },
  
  // INBOX STYLES
  notifCard: {
    flexDirection: "row", gap: 14, padding: 16, borderRadius: 18, marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  notifCardUnread: { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" },
  notifIconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  notifTitle: { fontSize: 14, fontWeight: "700", color: "#94A3B8", flex: 1, marginRight: 8 },
  notifTime: { fontSize: 11, color: "#64748B", marginTop: 2 },
  notifDesc: { fontSize: 13, color: "#94A3B8", lineHeight: 20, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#00D084", alignSelf: "center", marginLeft: 8 },

  // SETTINGS STYLES
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  groupDot: { width: 8, height: 8, borderRadius: 4 },
  groupTitle: { fontSize: 13, fontWeight: "700", color: "#94A3B8" },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", overflow: "hidden",
  },
  itemRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  itemLabel: { fontSize: 14, fontWeight: "600", color: "#F1F5F9", marginBottom: 3 },
  itemDesc: { fontSize: 12, color: "#64748B", lineHeight: 18 },
});
