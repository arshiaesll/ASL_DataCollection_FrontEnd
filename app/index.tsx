import {
  StyleSheet,
  View,
  Text,
  Switch,
  Pressable,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useState, useEffect, useRef } from "react";
import {
  VideoRecorder,
  VideoQuality,
  FileType,
} from "./components/VideoRecorder";
import {
  RecordingOptions,
  RecordingInterval,
} from "./components/RecordingOptions";
import { VideoPlayer } from "./components/VideoPlayer";
import { SettingsOverlay } from "./components/SettingsOverlay";
import { CountdownOverlay } from "./components/CountdownOverlay";
import { Header } from "./components/Header";
import { router } from "expo-router";
import getEnvVars from "../config/environment";

const { apiUrl } = getEnvVars();

const SIGN_WORDS = [
  "laptop",
  "brown",
  "Name",
  "Weight",
  "Favorite",
  "Hamburger",
];

export default function HomePage() {
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [key, setKey] = useState(0);
  const [recordingInterval, setRecordingInterval] =
    useState<RecordingInterval>("∞");
  const [permission, requestPermission] = useCameraPermissions();
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState<VideoQuality>("720p");
  const [fileType, setFileType] = useState<FileType>(
    Platform.OS === "web" ? "webm" : "mp4"
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [maxDuration, setMaxDuration] = useState<number | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [videoMimeType, setVideoMimeType] = useState<string>("video/mp4");
  const [currentSignName, setCurrentSignName] = useState<string>("");
  const [username, setUsername] = useState("");
  const [signLabel, setSignLabel] = useState("");
  const [tempRecordedVideo, setTempRecordedVideo] = useState<string | null>(
    null
  );
  const [isReviewing, setIsReviewing] = useState(false);
  const [searchStatus, setSearchStatus] = useState<{
    message: string;
    status: "none" | "success" | "error";
  }>({
    message: "",
    status: "none",
  });
  const [userCount, setUserCount] = useState(0);
  const countAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        const status = await requestPermission();
        console.log("Camera permission status:", status);
        if (status.granted) {
          setIsCameraEnabled(true);
          setKey((prevKey) => prevKey + 1);
        }
      }
    })();
  }, [permission, requestPermission]);

  useEffect(() => {
    // Check if user is signed in and listen for changes
    const handleStorageChange = async () => {
      const currentUsername = localStorage.getItem("username");
      if (!currentUsername) {
        // Use setTimeout to ensure navigation happens after layout mount
        setTimeout(() => {
          router.replace("/sign-in");
        }, 0);
      } else {
        setUsername(currentUsername);
        // Fetch user count
        try {
          const response = await fetch(`${apiUrl}/user-counts`);
          const data = await response.json();
          if (data.status === "success") {
            const userInfo = data.users.find(
              (u: any) => u.username === currentUsername
            );
            setUserCount(userInfo?.count || 0);
          }
        } catch (error) {
          console.error("Error fetching user count:", error);
        }
      }
    };

    // Initial check
    handleStorageChange();

    // Listen for changes
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      // Set max duration based on recordingInterval
      const max =
        recordingInterval === "∞"
          ? null
          : recordingInterval.endsWith("m")
          ? parseInt(recordingInterval) * 60
          : parseInt(recordingInterval);

      setMaxDuration(max);
      setElapsedTime(0);

      interval = setInterval(() => {
        setElapsedTime((prev) => {
          if (max && prev >= max) {
            clearInterval(interval);
            setIsRecording(false); // Stop recording when max duration is reached
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setElapsedTime(0);
      setMaxDuration(null);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, recordingInterval]);

  useEffect(() => {
    // Get a random word on component mount
    const randomWord =
      SIGN_WORDS[Math.floor(Math.random() * SIGN_WORDS.length)];
    handleWordSelect(randomWord);
  }, []);

  const toggleCamera = (value: boolean) => {
    console.log("Toggle camera called with value:", value);
    if (permission?.granted) {
      setIsCameraEnabled(value);
    } else {
      console.log("Camera permission not granted");
      alert("Camera permission not granted");
    }
  };

  const handleRecordingComplete = async (uri: string, duration: number) => {
    setIsRecording(false);
    setTempRecordedVideo(uri);
    setIsReviewing(true);
  };

  const handleSave = async () => {
    if (tempRecordedVideo) {
      await handleVideoRecordingComplete(tempRecordedVideo, 0);
      setTempRecordedVideo(null);
      setIsReviewing(false);
    }
  };

  const handleDiscard = () => {
    setTempRecordedVideo(null);
    setIsReviewing(false);
  };

  const toggleRecording = () => {
    if (!isCameraEnabled) {
      alert("Please enable camera first");
      return;
    }
    setIsRecording(!isRecording);
  };

  const handleSignOut = () => {
    console.log("Sign out clicked");
    try {
      localStorage.removeItem("username");
      setUsername("");
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handleWordSelect = async (word: string) => {
    setSignLabel(word);

    // Trigger search immediately after selecting the word
    try {
      setSearchStatus({
        message: "Searching...",
        status: "none",
      });
      setVideoBase64(null);
      setVideoUri(null);

      const response = await fetch(`${apiUrl}/search-sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: word }),
      });

      const data = await response.json();

      if (data.status === "success" && data.videoData) {
        console.log("Received video data, length:", data.videoData.length);
        setVideoBase64(data.videoData);
        setVideoMimeType(data.mimeType || "video/mp4");
        setCurrentSignName(word);
      } else {
        setSearchStatus({
          message: data.message,
          status: "error",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchStatus({
        message: "Error processing video data",
        status: "error",
      });
    }
  };

  const handleVideoRecordingComplete = async (
    uri: string,
    duration: number
  ) => {
    try {
      if (!username.trim() || !signLabel.trim()) {
        setSearchStatus({
          message: "Please enter both username and sign label",
          status: "error",
        });
        return;
      }

      const response = await fetch(uri);
      const blob = await response.blob();
      console.log("Video recording size:", blob.size, "bytes");
      console.log("Video recording type:", blob.type);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(",")[1];

        const uploadResponse = await fetch(`${apiUrl}/upload-video`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            video_data: base64data,
            username: username.trim(),
            label: signLabel.trim(),
            mime_type: blob.type,
          }),
        });

        const result = await uploadResponse.json();
        if (result.status === "success") {
          setSearchStatus({
            message: `Video uploaded successfully at ${new Date().toLocaleTimeString()}`,
            status: "success",
          });
          setUserCount((prev) => prev + 1);
          // animateCount();
          // Select a new random word after successful upload
          const randomWord =
            SIGN_WORDS[Math.floor(Math.random() * SIGN_WORDS.length)];
          handleWordSelect(randomWord);
        } else {
          setSearchStatus({
            message: "Failed to upload video: " + result.message,
            status: "error",
          });
        }
      };
    } catch (error) {
      console.error("Error uploading video recording:", error);
      setSearchStatus({
        message: "Error uploading video",
        status: "error",
      });
    }
  };

  const handlePreviousWord = () => {
    const currentIndex = SIGN_WORDS.indexOf(signLabel);
    const newIndex = (currentIndex - 1 + SIGN_WORDS.length) % SIGN_WORDS.length;
    handleWordSelect(SIGN_WORDS[newIndex]);
  };

  const handleNextWord = () => {
    const currentIndex = SIGN_WORDS.indexOf(signLabel);
    const newIndex = (currentIndex + 1) % SIGN_WORDS.length;
    handleWordSelect(SIGN_WORDS[newIndex]);
  };

  // const animateCount = () => {
  //   countAnimation.setValue(1);
  //   Animated.sequence([
  //     Animated.spring(countAnimation, {
  //       toValue: 2.2,
  //       friction: 4,
  //       tension: 20,
  //       useNativeDriver: true,
  //     }),
  //     Animated.spring(countAnimation, {
  //       toValue: 1,
  //       friction: 8,
  //       tension: 80,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // };

  return (
    <View style={styles.container}>
      <Header
        username={username}
        userCount={userCount}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        isRecording={isRecording}
        onSignOut={handleSignOut}
        countAnimation={countAnimation}
      />

      {/* <View style={styles.currentWordContainer}>
        <Text style={styles.currentWordText}>{signLabel || "Loading..."}</Text>
      </View> */}
      <View style={styles.wordSelectorContainer}>
        <TouchableOpacity onPress={handlePreviousWord}>
          <Text style={styles.arrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.currentWordContainer}>
          <Text style={styles.currentWordText}>
            {signLabel || "Loading..."}
          </Text>
        </View>

        <TouchableOpacity onPress={handleNextWord}>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
      {searchStatus.status !== "none" && (
        <Text
          style={[
            styles.searchStatus,
            searchStatus.status === "success"
              ? styles.successText
              : styles.errorText,
          ]}
        >
          {searchStatus.message}
        </Text>
      )}

      <View style={styles.contentContainer}>
        <View style={styles.cameraContainer}>
          {isCameraEnabled ? (
            tempRecordedVideo ? (
              <View style={styles.previewContainer}>
                <VideoPlayer
                  uri={tempRecordedVideo}
                  mimeType="video/webm"
                  signName="Preview"
                />
              </View>
            ) : (
              <VideoRecorder
                key={key}
                recordingInterval={recordingInterval}
                isRecording={isRecording}
                onRecordingComplete={handleRecordingComplete}
                quality={quality}
                fileType={fileType}
              />
            )
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.placeholderText}>Camera Preview</Text>
            </View>
          )}
        </View>

        <View style={styles.rightContainer}>
          {(videoUri || videoBase64) && !tempRecordedVideo && (
            <VideoPlayer
              uri={videoUri || undefined}
              base64Data={videoBase64 || undefined}
              mimeType={videoMimeType}
              signName={currentSignName}
            />
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlsLeft}>
          <View style={styles.controlItem}>
            <Text style={styles.controlText}>Camera</Text>
            <Switch
              value={isCameraEnabled}
              onValueChange={toggleCamera}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>
        </View>

        {!isReviewing ? (
          <Pressable
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={toggleRecording}
            disabled={!isCameraEnabled}
          />
        ) : (
          <View style={styles.reviewButtonsContainer}>
            <TouchableOpacity
              style={[styles.reviewButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.reviewButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reviewButton, styles.discardButton]}
              onPress={handleDiscard}
            >
              <Text style={styles.reviewButtonText}>Discard</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <SettingsOverlay
        showSettings={showSettings}
        recordingInterval={recordingInterval}
        setRecordingInterval={setRecordingInterval}
        quality={quality}
        setQuality={setQuality}
        fileType={fileType}
        setFileType={setFileType}
        isRecording={isRecording}
      />
      <CountdownOverlay
        isRecording={isRecording}
        elapsedTime={elapsedTime}
        maxDuration={maxDuration}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  cameraContainer: {
    flex: 2,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    overflow: "hidden",
    aspectRatio: 16 / 9,
  },
  previewContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  audioContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    overflow: "hidden",
    padding: 10,
  },
  audioVisualizer: {
    flex: 1,
    width: "100%",
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  audioPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    color: "#666",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 6,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    minHeight: 48,
  },
  controlsLeft: {
    flexDirection: "row",
    gap: 20,
  },
  controlItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  controlText: {
    fontSize: 14,
    marginRight: 4,
  },
  recordButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ff4444",
    cursor: "pointer",
    opacity: 0.9,
  },
  recordButtonActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  rightContainer: {
    flex: 1,
    gap: 10,
  },
  currentWordContainer: {
    backgroundColor: "#f8f8f8",
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    marginHorizontal: 10,
    alignSelf: "center",
  },
  currentWordText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  searchStatus: {
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  successText: {
    color: "#4CAF50",
  },
  errorText: {
    color: "#f44336",
  },
  reviewButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    width: 100,
    justifyContent: "center",
  },
  reviewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  discardButton: {
    backgroundColor: "#f44336",
  },
  reviewButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  wordSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // or 'center' with margin
  },

  arrow: {
    fontSize: 32,
    paddingHorizontal: 16,
  },

  // currentWordContainer: {
  //   paddingHorizontal: 12,
  // },

  // currentWordText: {
  //   fontSize: 24,
  //   fontWeight: "bold",
  // },
});
