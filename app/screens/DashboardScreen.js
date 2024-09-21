import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getDatabase, ref as dbRef, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Haversine formula for calculating distance between two coordinates
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * (Math.PI / 180); // Convert latitude to radians
  const φ2 = lat2 * (Math.PI / 180);
  const Δφ = (lat2 - lat1) * (Math.PI / 180);
  const Δλ = (lon2 - lon1) * (Math.PI / 180);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // In meters
  return distance;
};

export default function DashboardScreen({ navigation }) {
  const [sosData, setSosData] = useState([]); // For storing SOS alerts
  const [currentLocation, setCurrentLocation] = useState(null); // For storing user location

  const fetchData = async () => {
    // Request location permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to show nearby SOS alerts.');
      return;
    }

    // Get current location
    let location = await Location.getCurrentPositionAsync({});
    setCurrentLocation(location);

    // Get the current logged-in user ID
    const auth = getAuth();
    const currentUserId = auth.currentUser ? auth.currentUser.uid : null;
 

    // Fetch SOS data from Firebase
    const db = getDatabase();
    const sosRef = dbRef(db, 'sos_alerts');
    const snapshot = await get(sosRef);

    if (snapshot.exists()) {
      const alerts = snapshot.val();
      const sosArray = Object.keys(alerts).map(key => ({
        id: key,
        ...alerts[key],
      }));

      // Filter SOS alerts by proximity (within 500 meters) and exclude current user's SOS
      const nearbySos = sosArray.filter(sos => {
        const distance = getDistance(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          sos.location.latitude,
          sos.location.longitude
        );
        // Exclude SOS alerts created by the current user
        return distance <= 500 && sos.userId !== currentUserId; 
      });

      setSosData(nearbySos); // Store nearby SOS alerts
    } else {
      console.log('No SOS alerts found.');
    }
  };

  useEffect(() => {
    if (!currentLocation) {
      fetchData(); // Fetch data only when location is available
    }
  }, [currentLocation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image source={require('../../assets/icon.png')} style={styles.profileImage} />
          <View>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.userName}>Santosh</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <MaterialIcons name="account-circle" size={40} color="white" />
          </TouchableOpacity>
        </View>

        {/* SOS Alerts Section */}
        <Text style={styles.sosTitle}>Current SOS near you</Text>
        <ScrollView contentContainerStyle={styles.sosContainer}>
          {sosData.length > 0 ? (
            sosData.map((sos) => (
              <View key={sos.id} style={styles.sosCard}>
                <Text style={styles.sosName}>User: {sos.userId || 'Anonymous'}</Text>
                <Text style={styles.sosDescription}>{sos.message}</Text>
                {sos.mediaUrl && (
                  <TouchableOpacity onPress={() => { /* Handle video playback or media viewing */ }}>
                    <Text style={styles.sosMediaLink}>View Media</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <Text>No nearby SOS alerts found.</Text>
          )}
        </ScrollView>

        {/* SOS Button */}
        <TouchableOpacity style={styles.sosButton} onPress={() => navigation.navigate('CreateSOS')}>
          <MaterialIcons name="warning" size={24} color="white" />
          <Text style={styles.sosButtonText}>Danger Nearby, Create an SOS!</Text>
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
          <Text style={styles.refreshButtonText}>Refresh Alerts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4A90E2',  // Background color to match the header
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#4A90E2',
    height: 150,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingTop: 40,  // Add padding to separate from status bar
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 20,
    color: 'white',
  },
  userName: {
    fontSize: 16,
    color: 'white',
  },
  sosTitle: {
    margin: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sosContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  sosCard: {
    width: '90%',
    height: 200,  // Increased height to make it larger
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  sosName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  sosDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c30010',
    padding: 15,
    borderRadius: 25,
    margin: 20,
    position: 'absolute',
    bottom: 70,  // Adjusted to make space for the refresh button
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  sosButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  refreshButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    width: '40%',
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
