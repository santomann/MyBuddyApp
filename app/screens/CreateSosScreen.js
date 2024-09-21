import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // For picking or recording videos
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage'; // Firebase Storage for video uploads
import { getDatabase, ref as dbRef, push, set } from 'firebase/database';
import { uploadBytesResumable } from 'firebase/storage'; // Firebase Realtime Database
import * as Location from 'expo-location'; // For accessing location
import * as FileSystem from 'expo-file-system';

export default function CreateSosScreen({ navigation }) {
  const [message, setMessage] = useState('');
  const [media, setMedia] = useState(null); // For storing the video URI
  const [location, setLocation] = useState(null); // To store user's location
  const currentUserId = 'Test'; //

  // Request location permissions and get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location is required!');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  // Record a video using the device camera
  const recordVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        alert('Permission to access the camera is required!');
        return;
      }

      console.log("The recording has started");
      // Launch the camera and allow the user to record a video
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.2,
      });

      
    console.log("recording in progress");
    console.log(result);

      if (!result.canceled) {
        setMedia(result.assets[0].uri); // Store the video URI
        console.log('Video recorded:', result.assets[0].uri);
      }
    } catch (err) {
      console.error('Failed to record video', err);
    }
  };

  // Pick a video from the media library
  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access the media library is required!');
      return;
    }


    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.1,
    });


    if (!result.canceled) {
      setMedia(result.assets[0].uri); // Store the video URI
      console.log('Video picked:', result.assets[0].uri);
    }
  };

  const uploadMedia = async (fileUri) => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
  
      // Log the file size to see if it's too large
      console.log('File size (bytes):', blob.size);
  
      const storage = getStorage();
      const storageRef = ref(storage, `sos_media/${Date.now()}`);
  
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media');
    }
  };
  
  const handleSendSOS = async () => {
    try {
      let mediaUrl = null;
  
      if (media) {
        console.log('Uploading media:', media);
        mediaUrl = await uploadMedia(media); // Upload the video to Firebase Storage
      }
  
      if (!location) {
        alert('Location not available.');
        return;
      }
  
      // Push SOS details to Firebase Realtime Database
      const db = getDatabase();
      const sosRef = push(dbRef(db, 'sos_alerts'));
  
      await set(sosRef, {
        message,
        mediaUrl, // Store the video URL
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        timestamp: Date.now(),
        userId: currentUserId,
      });
  
      alert('SOS sent successfully!');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error sending SOS:', error.message);
      alert('Failed to send SOS. Please try again.');
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an SOS</Text>

      <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
        <MaterialIcons name="videocam" size={24} color="white" />
        <Text style={styles.mediaButtonText}>Pick Video</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.mediaButton} onPress={recordVideo}>
        <MaterialIcons name="videocam" size={24} color="white" />
        <Text style={styles.mediaButtonText}>Record Video</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Enter your message"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <TouchableOpacity style={styles.sendButton} onPress={handleSendSOS}>
        <MaterialIcons name="send" size={24} color="white" />
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  mediaButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  input: {
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
});
