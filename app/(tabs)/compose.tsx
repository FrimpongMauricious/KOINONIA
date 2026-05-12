import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/src/auth/auth-context";
import { Topic, TOPIC_DISPLAY_NAMES, USER_FACING_TOPICS } from "@/src/api/types";
import { useCreatePost } from "@/src/features/feed/hooks/use-post-mutations";

const MAX_POST_LENGTH = 1000;
const MAX_TITLE_LENGTH = 100;

export default function ComposeScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [content, setContent] = useState("");
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isGuest, exitGuestMode } = useAuth();
  const createPost = useCreatePost();

  const charactersLeft = useMemo(
    () => MAX_POST_LENGTH - content.length,
    [content],
  );

  const canPublish = content.trim().length > 0 && topic !== null;

  const handlePublish = async () => {
    setErrorMessage(null);
    if (!topic) {
      setErrorMessage("Please select a topic");
      return;
    }
    try {
      await createPost.mutateAsync({
        title: title.trim() || undefined,
        topic,
        content: content.trim(),
      });
      setTitle("");
      setTopic(null);
      setContent("");
      router.back();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  };

  if (isGuest) {
    return (
      <ScreenContainer contentStyle={styles.container}>
        <ThemedView style={styles.guestContainer}>
          <Text style={styles.guestTitle}>Share your faith</Text>
          <ThemedText style={styles.guestBody}>
            Sign up to start posting on Koinonia.
          </ThemedText>
          <Pressable
            style={styles.guestPrimaryBtn}
            onPress={() => { exitGuestMode(); router.replace("/(auth)/register"); }}
          >
            <Text style={styles.guestPrimaryBtnText}>Sign Up</Text>
          </Pressable>
          <Pressable
            style={styles.guestSecondaryBtn}
            onPress={() => { exitGuestMode(); router.replace("/(auth)/login"); }}
          >
            <Text style={styles.guestSecondaryBtnText}>Log In</Text>
          </Pressable>
        </ThemedView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll keyboardAvoiding contentStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Post</Text>
      </View>

      <View style={styles.inner}>
          <TextInput
            style={styles.titleInput}
            placeholder="Add a title (optional)"
            placeholderTextColor="#71767B"
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            onChangeText={setTitle}
          />
          <Text style={styles.titleCharCount}>
            {title.length}/{MAX_TITLE_LENGTH}
          </Text>

          <Pressable
            style={styles.topicButton}
            onPress={() => setTopicModalVisible(true)}
          >
            <Text
              style={[
                styles.topicButtonText,
                !topic && styles.topicButtonPlaceholder,
              ]}
            >
              {topic ? TOPIC_DISPLAY_NAMES[topic] : "Select a topic *"}
            </Text>
            <IconSymbol size={20} name="chevron.down" color="#71767B" />
          </Pressable>

          <TextInput
            style={styles.input}
            multiline
            maxLength={MAX_POST_LENGTH}
            placeholder="Share a scripture-based insight…"
            placeholderTextColor="#71767B"
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />

          <Text style={styles.charCount}>{charactersLeft} characters left</Text>

          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}

          <Pressable
            style={[
              styles.publishBtn,
              (!canPublish || createPost.isPending) && styles.publishBtnDisabled,
            ]}
            onPress={handlePublish}
            disabled={!canPublish || createPost.isPending}
          >
            <Text style={styles.publishBtnText}>
              {createPost.isPending ? "Publishing…" : "Publish"}
            </Text>
          </Pressable>
      </View>

      <Modal
        visible={topicModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTopicModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Topic</Text>
              <Pressable onPress={() => setTopicModalVisible(false)}>
                <IconSymbol size={24} name="xmark" color="#E7E9EA" />
              </Pressable>
            </View>

            {USER_FACING_TOPICS.map((t) => (
              <Pressable
                key={t}
                style={styles.topicOption}
                onPress={() => {
                  setTopic(t);
                  setTopicModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.topicOptionText,
                    topic === t && styles.topicOptionSelected,
                  ]}
                >
                  {TOPIC_DISPLAY_NAMES[t]}
                </Text>
                {topic === t && (
                  <IconSymbol size={20} name="checkmark" color="#1D9BF0" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  guestTitle: {
    color: "#E7E9EA",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  guestBody: {
    color: "#71767B",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  guestPrimaryBtn: {
    width: "100%",
    backgroundColor: "#1D9BF0",
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
  },
  guestPrimaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  guestSecondaryBtn: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#2F3336",
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: "center",
  },
  guestSecondaryBtnText: {
    color: "#E7E9EA",
    fontWeight: "600",
    fontSize: 15,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  headerTitle: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "800",
  },
  inner: {
    padding: 16,
    gap: 12,
  },
  titleInput: {
    backgroundColor: "#16181C",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2F3336",
    borderRadius: 8,
    padding: 12,
    color: "#E7E9EA",
    fontSize: 16,
    fontWeight: "600",
  },
  titleCharCount: {
    color: "#71767B",
    fontSize: 12,
    textAlign: "right",
  },
  topicButton: {
    backgroundColor: "#16181C",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2F3336",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topicButtonText: {
    color: "#E7E9EA",
    fontSize: 16,
  },
  topicButtonPlaceholder: {
    color: "#71767B",
  },
  input: {
    minHeight: 140,
    backgroundColor: "#16181C",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2F3336",
    borderRadius: 8,
    padding: 14,
    color: "#E7E9EA",
    fontSize: 16,
    lineHeight: 24,
  },
  charCount: {
    color: "#71767B",
    fontSize: 13,
    textAlign: "right",
  },
  publishBtn: {
    backgroundColor: "#1D9BF0",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  error: {
    color: "#F4212E",
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#16181C",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  modalTitle: {
    color: "#E7E9EA",
    fontSize: 18,
    fontWeight: "700",
  },
  topicOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  topicOptionText: {
    color: "#E7E9EA",
    fontSize: 16,
  },
  topicOptionSelected: {
    color: "#1D9BF0",
    fontWeight: "600",
  },
});
