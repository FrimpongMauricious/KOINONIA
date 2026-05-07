import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/src/auth/auth-context";

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setErrorMessage(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll keyboardAvoiding contentStyle={styles.container}>
      <View style={styles.inner}>
        <AppLogo size={64} />
        <Text style={styles.title}>Log In</Text>
        <Text style={styles.subtitle}>Welcome back to Koinonia</Text>

        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#71767B"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#71767B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {errorMessage ? (
          <Text style={styles.error}>{errorMessage}</Text>
        ) : null}

        <Pressable
          style={[styles.primaryBtn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.primaryBtnText}>
            {loading ? "Please wait…" : "Continue"}
          </Text>
        </Pressable>

        <Link href="/(auth)/register">
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Sign up</Text></Text>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
  },
  inner: {
    padding: 24,
    gap: 16,
    alignItems: "center",
  },
  title: {
    color: "#E7E9EA",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#71767B",
    fontSize: 15,
    textAlign: "center",
    marginTop: -8,
  },
  formGroup: {
    width: "100%",
    gap: 10,
    marginTop: 8,
  },
  input: {
    width: "100%",
    backgroundColor: "#16181C",
    borderWidth: 1,
    borderColor: "#2F3336",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: "#E7E9EA",
    fontSize: 16,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: "#1D9BF0",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  linkText: {
    color: "#71767B",
    fontSize: 14,
    textAlign: "center",
  },
  linkAccent: {
    color: "#1D9BF0",
  },
  error: {
    color: "#F4212E",
    fontSize: 13,
    textAlign: "center",
    width: "100%",
  },
});
