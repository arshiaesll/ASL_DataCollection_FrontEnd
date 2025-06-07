import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { VideoQuality, FileType } from './VideoRecorder';
import { RecordingInterval } from './RecordingOptions';

interface SettingsOverlayProps {
  showSettings: boolean;
  recordingInterval: RecordingInterval;
  setRecordingInterval: (interval: RecordingInterval) => void;
  quality: VideoQuality;
  setQuality: (quality: VideoQuality) => void;
  fileType: FileType;
  setFileType: (fileType: FileType) => void;
  isRecording: boolean;
}

export const SettingsOverlay = ({
  showSettings,
  recordingInterval,
  setRecordingInterval,
  quality,
  setQuality,
  fileType,
  setFileType,
  isRecording,
}: SettingsOverlayProps) => (
  <View style={[styles.settingsOverlay, !showSettings && styles.hidden]}>
    <View style={styles.settingGroup}>
      <Text style={styles.settingLabel}>Recording Duration:</Text>
      <View style={styles.optionsRow}>
        {(['5s', '10s', '30s', '1m', '∞'] as RecordingInterval[]).map((interval) => (
          <TouchableOpacity
            key={interval}
            style={[styles.option, recordingInterval === interval && styles.selectedOption]}
            onPress={() => setRecordingInterval(interval)}
            disabled={isRecording}
          >
            <Text style={[styles.optionText, recordingInterval === interval && styles.selectedOptionText]}>
              {interval}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    <View style={styles.settingGroup}>
      <Text style={styles.settingLabel}>Video Quality:</Text>
      <View style={styles.optionsRow}>
        {(['2160p', '1080p', '720p', '480p', '360p'] as VideoQuality[]).map((q) => (
          <TouchableOpacity
            key={q}
            style={[styles.option, quality === q && styles.selectedOption]}
            onPress={() => setQuality(q)}
            disabled={isRecording}
          >
            <Text style={[styles.optionText, quality === q && styles.selectedOptionText]}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    <View style={styles.settingGroup}>
      <Text style={styles.settingLabel}>File Type:</Text>
      <View style={styles.optionsRow}>
        {(Platform.OS === 'web' ? ['webm'] : ['mp4', 'mov']).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.option, fileType === type && styles.selectedOption]}
            onPress={() => setFileType(type as FileType)}
            disabled={isRecording}
          >
            <Text style={[styles.optionText, fileType === type && styles.selectedOptionText]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  settingsOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 15,
    zIndex: 1,
  },
  hidden: {
    display: 'none',
  },
  settingGroup: {
    marginBottom: 15,
  },
  settingLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#81b0ff',
    borderColor: '#fff',
  },
  optionText: {
    color: 'white',
    fontSize: 14,
  },
  selectedOptionText: {
    fontWeight: '600',
  },
}); 