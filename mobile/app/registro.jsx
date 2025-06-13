import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/bases/supabase";
import { Mail, Lock, Phone } from "lucide-react-native";

const Registro = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !phone || !password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setLoading(false);
      if (signUpError.message.includes("User already registered")) {
        Alert.alert(
          "Erro",
          "Este e-mail já está cadastrado. Tente fazer login."
        );
      } else if (signUpError.message.includes("Password should be at least 6 characteres")) {
        Alert.alert(
          "Erro",
          "A senha deve ter no mínimo 6 caracteres."
        );
      } else {
        console.log(signUpError.message);
        Alert.alert("Erro", "Erro ao criar a conta. Tente novamente.");
      }
      return;
    }

    // Se registrou, salva o telefone na tabela users_info
    if (signUpData?.user?.id) {
      // Limpa o telefone para só números
      const phoneNumberClean = phone.replace(/\D/g, "");

      const { error: insertError } = await supabase
        .from("users_info")
        .insert([
          {
            user_id: signUpData.user.id,
            phone_number: phoneNumberClean,
          },
        ]);

      if (insertError) {
        console.log("Erro ao salvar telefone:", insertError);
        Alert.alert(
          "Atenção",
          "Conta criada, mas houve problema ao salvar o telefone."
        );
      }
    }

    setLoading(false);
    Alert.alert(
      "Sucesso",
      "Cadastro realizado! Verifique seu e-mail para ativar a conta.",
      [{ text: "OK", onPress: () => router.push("/login") }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <Image
          source={require("@/assets/images/shield.webp")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.inputContainer}>
        <Mail size={20} style={styles.icon} />
        <TextInput
          placeholder="Digite seu e-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        {/* Ícone genérico para telefone */}
        <Phone size={20} style={styles.icon} />
        <TextInput
          placeholder="Digite seu telefone"
          keyboardType="phone-pad"
          style={styles.input}
          value={phone}
          onChangeText={(text) => setPhone(text.replace(/\D/g, ""))}
          maxLength={15}
        />
      </View>

      <View style={styles.inputContainer}>
        <Lock size={20} style={styles.icon} />
        <TextInput
          placeholder="Crie uma senha"
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <Lock size={20} style={styles.icon} />
        <TextInput
          placeholder="Repita a senha"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Registro;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: 180,
    height: 180,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  icon: {
    marginRight: 8,
    color: "#9d4edd",
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#8244cd",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  loginText: {
    color: "#007AFF",
    textAlign: "center",
    fontSize: 14,
  },
});
