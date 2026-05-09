import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/src/auth/auth-context";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setErrorMessage(null);
    setLoading(true);
    try {
      await register({ username, email, password, displayName: displayName || undefined });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll keyboardAvoiding contentStyle={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the Koinonia community</Text>

        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Username (lowercase, no spaces)"
            placeholderTextColor="#71767B"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Display name"
            placeholderTextColor="#71767B"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#71767B"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Password"
              placeholderTextColor="#71767B"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeBtn}
            >
              <IconSymbol
                size={20}
                name={showPassword ? "eye.slash" : "eye"}
                color="#71767B"
              />
            </Pressable>
          </View>
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
            {loading ? "Please wait…" : "Create Account"}
          </Text>
        </Pressable>

        <Link href="/(auth)/login">
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Log in</Text></Text>
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
  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16181C",
    borderWidth: 1,
    borderColor: "#2F3336",
    borderRadius: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: "#E7E9EA",
    fontSize: 16,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 13,
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
