import React, { useState } from 'react';
import { View, Image, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDatabase, ref, get, child } from 'firebase/database';  
import { initializeApp, getApps } from 'firebase/app';
import firebaseConfig from '../../FirebaseConfig';  

// Initialize Firebase if it hasn't been initialized yet
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

export default function LoginScreen({ navigation }) {
  const [ID, setID] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogin = async () => {
    try {
      const db = getDatabase();
      const dbRef = ref(db);

      const snapshot = await get(child(dbRef, `users`));

      if (snapshot.exists()) {
        const users = snapshot.val();
        const user = Object.values(users).find(user => user.id === ID);

        if (user) {
          if (user.password === password) {
            navigation.navigate('Dashboard');
          } else {
            Alert.alert('Error', 'Incorrect password.');
          }
        } else {
          Alert.alert('Error', 'User ID not found.');
        }
      } else {
        Alert.alert('Error', 'No users found in the database.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Error', 'Failed to log in. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#f7f7f7', '#d1d1d1']}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Image source={require('../../assets/icon.png')} style={styles.icon} />
      </View>
      <Text style={styles.title}>Welcome Back</Text>
      <TextInput
        style={styles.input}
        placeholder="ID"
        value={ID}
        onChangeText={setID}
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#666"
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.registerText}>Don't have an account?</Text>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButton: {
    height: 50,
    width: '100%',
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  registerButton: {
    marginTop: 10,
    height: 50,
    width: '100%',
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
