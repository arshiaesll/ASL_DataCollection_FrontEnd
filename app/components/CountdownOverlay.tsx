import { View, Text, StyleSheet } from 'react-native';

interface CountdownOverlayProps {
  isRecording: boolean;
  elapsedTime: number;
  maxDuration: number | null;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const CountdownOverlay = ({
  isRecording,
  elapsedTime,
  maxDuration,
}: CountdownOverlayProps) => {
  if (!isRecording) return null;

  const timeDisplay = formatTime(elapsedTime);
  const remainingDisplay = maxDuration ? 
    ` / ${formatTime(maxDuration)}` : 
    ' / ∞';

  return (
    <View style={styles.countdownOverlay}>
      <View style={styles.countdownContent}>
        <Text style={styles.recordingIndicator}>🔴 Recording</Text>
        <Text style={styles.countdownText}>
          {timeDisplay}{remainingDisplay}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  countdownOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
  },
  countdownContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingIndicator: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  countdownText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
}); 