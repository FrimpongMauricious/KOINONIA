import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/auth-context";
import PostingAvatar from "@/assets/images/posting_avatar.svg";
import ReadingBibleAvatar from "@/assets/images/reading_bible_avatar.svg";
import SocialMediaReactions from "@/assets/images/social_media_reactions.svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    headline: "Welcome to Koinonia",
    subtitle: "A community of believers sharing faith",
  },
  {
    id: "2",
    headline: "Reflect on the Word",
    subtitle: "Share verses, sermons, and what God is teaching you",
  },
  {
    id: "3",
    headline: "Share your story",
    subtitle: "Post on Faith, Prayer, Worship, and more",
  },
  {
    id: "4",
    headline: "Engage with the body",
    subtitle: "Like, comment, and follow fellow believers",
  },
];

const SVG_SIZE = SCREEN_WIDTH * 0.6;

function SlideIllustration({ id }: { id: string }) {
  if (id === "1") {
    return (
      <Image
        source={require("@/assets/images/KOINONIA_image.jpg")}
        style={styles.slideImage}
        resizeMode="contain"
      />
    );
  }
  if (id === "2") {
    return <ReadingBibleAvatar width={SVG_SIZE} height={300} />;
  }
  if (id === "3") {
    return <PostingAvatar width={SVG_SIZE} height={300} />;
  }
  return <SocialMediaReactions width={SVG_SIZE} height={300} />;
}

function Dots({ count, current }: { count: number; current: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === current && styles.dotActive]}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const auth = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  }

  function goTo(index: number) {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  }

  async function handleComplete() {
    await auth.completeOnboarding();
    router.replace("/(auth)/login");
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip button */}
      <Pressable style={styles.skipButton} onPress={handleComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.illustrationContainer}>
              <SlideIllustration id={item.id} />
            </View>
            <Text style={styles.headline}>{item.headline}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Controls */}
      <View style={styles.controls}>
        {/* Back arrow */}
        <Pressable
          style={[styles.arrowButton, currentIndex === 0 && styles.hidden]}
          onPress={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>

        <Dots count={SLIDES.length} current={currentIndex} />

        {/* Forward arrow or final buttons */}
        {currentIndex < SLIDES.length - 1 ? (
          <Pressable style={styles.arrowButton} onPress={() => goTo(currentIndex + 1)}>
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.getStartedButton} onPress={handleComplete}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  skipButton: {
    position: "absolute",
    top: 24,
    right: 20,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    color: "#aaa",
    fontSize: 15,
    fontWeight: "500",
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  illustrationContainer: {
    height: "50%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  slideImage: {
    width: SCREEN_WIDTH * 0.65,
    height: 280,
    borderRadius: 16,
  },
  headline: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 22,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  arrowButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  hidden: {
    opacity: 0,
  },
  arrowText: {
    color: "#fff",
    fontSize: 36,
    lineHeight: 40,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#444",
  },
  dotActive: {
    backgroundColor: "#1D9BF0",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  getStartedButton: {
    backgroundColor: "#1D9BF0",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  getStartedText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
