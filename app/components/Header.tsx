import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface HeaderProps {
  username: string;
  userCount: number;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  isRecording: boolean;
  onSignOut: () => void;
  countAnimation: Animated.Value;
}

export const Header = ({
  username,
  userCount,
  showSettings,
  setShowSettings,
  isRecording,
  onSignOut,
  countAnimation,
}: HeaderProps) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.settingsButton} 
        onPress={() => setShowSettings(!showSettings)}
        disabled={isRecording}
      >
        <Text style={styles.settingsButtonText}>⚙️</Text>
      </TouchableOpacity>
      <Text style={styles.title}>ASL Datacollector</Text>
      <View style={styles.userSection}>
        <View style={styles.userInfo}>
          <Text style={styles.usernameText}>{username}</Text>
          <Animated.Text 
            style={[
              styles.userCountText,
              { 
                transform: [
                  { scale: countAnimation },
                  { translateX: Animated.multiply(countAnimation, -10) }
                ],
                fontSize: 14,
                fontWeight: 'bold',
                color: '#4CAF50'
              }
            ]}
          >
            {userCount} videos
          </Animated.Text>
        </View>
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={onSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userInfo: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  userCountText: {
    fontSize: 12,
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 