import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { supabase } from "@/bases/supabase";
import { UserIcon, Trash2Icon, PlusIcon } from "lucide-react-native";

const countries = [
  { name: "Brasil", code: "BR", ddi: "+55", flag: "🇧🇷" },
  { name: "Estados Unidos", code: "US", ddi: "+1", flag: "🇺🇸" },
  { name: "Portugal", code: "PT", ddi: "+351", flag: "🇵🇹" },
];

const TrustedContactsTab = () => {
  const [userId, setUserId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (user) setUserId(user.id);
    };
    getSession();
  }, []);

  useEffect(() => {
    if (userId) fetchContacts();
  }, [userId]);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar contatos:", error);
    } else {
      setContacts(data);
    }
  };

  const handleAddContact = async () => {
    const { name, email, phone } = newContact;
    if (!name || !email) return;

    const formattedPhone = phone
      ? selectedCountry.ddi.replace(/\D/g, "") + phone.replace(/\D/g, "")
      : null;

    const { error } = await supabase.from("contacts").insert([
      {
        user_id: userId,
        name,
        email,
        phone: formattedPhone,
      },
    ]);

    if (error) {
      console.error("Erro ao adicionar contato:", error);
    } else {
      setModalVisible(false);
      setNewContact({ name: "", email: "", phone: "" });
      setSelectedCountry(countries[0]);
      fetchContacts();
    }
  };

  const handleRemoveContact = async (id) => {
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao remover contato:", error);
    } else {
      fetchContacts();
    }
  };

  const formatPhoneNumber = (raw) => {
    const cleaned = raw.replace(/\D/g, "");
    if (cleaned.length < 10) return cleaned;

    const ddd = cleaned.slice(0, 2);
    const first =
      cleaned.length === 11 ? cleaned.slice(2, 7) : cleaned.slice(2, 6);
    const second =
      cleaned.length === 11 ? cleaned.slice(7, 11) : cleaned.slice(6, 10);

    return `(${ddd}) ${first}-${second}`;
  };

  const renderContact = ({ item }) => (
    <View style={styles.contactItem}>
      <UserIcon size={32} color="#666" />
      <View style={styles.contactInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.text}>{item.email}</Text>
        <Text style={styles.text}>{item.phone || "Sem telefone"}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveContact(item.id)}>
        <Trash2Icon color="red" size={24} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contatos de Confiança</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <PlusIcon size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        ListEmptyComponent={
          <Text style={{ marginTop: 20 }}>Nenhum contato ainda.</Text>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Contato</Text>

            <TextInput
              placeholder="Nome"
              value={newContact.name}
              onChangeText={(text) =>
                setNewContact({ ...newContact, name: text })
              }
              style={styles.input}
            />

            <TextInput
              placeholder="E-mail"
              autoCapitalize="none"
              value={newContact.email}
              onChangeText={(text) =>
                setNewContact({ ...newContact, email: text })
              }
              style={styles.input}
            />

            <TouchableOpacity
              style={[
                styles.input,
                { flexDirection: "row", alignItems: "center" },
              ]}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={{ marginRight: 8 }}>{selectedCountry.flag}</Text>
              <Text>
                {selectedCountry.name} ({selectedCountry.ddi})
              </Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Telefone (apenas números)"
              value={formatPhoneNumber(newContact.phone)}
              onChangeText={(text) =>
                setNewContact({ ...newContact, phone: text.replace(/\D/g, "") })
              }
              style={styles.input}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handleAddContact}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setNewContact({ name: "", email: "", phone: "" });
                  setSelectedCountry(countries[0]);
                }}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Picker de País */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar País</Text>
            {countries.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={styles.input}
                onPress={() => {
                  setSelectedCountry(country);
                  setShowCountryPicker(false);
                }}
              >
                <Text>
                  {country.flag} {country.name} ({country.ddi})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  contactInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "bold" },
  text: { fontSize: 14, color: "#555" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: "#999",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default TrustedContactsTab;
