import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient} from 'expo-linear-gradient';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91'); // Add a default country code
  const [verificationCode, setVerificationCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const sendVerification = async () => {
    setIsSending(true);
    try {
        const response = await fetch('your address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber }),
        });
        const data = await response.json();
        if (data.success) {
            console.log('Verification code sent');
            Alert.alert('Success', 'Verification code sent to your phone.');
        } else {
            console.log('Error sending verification code:', data.message);
            Alert.alert('Error', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'Failed to send verification code.');
    } finally {
        setIsSending(false);
    }
  };

  const verifyCode = async () => {
    setIsVerifying(true);
    try {
        const response = await fetch('address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber, 
                code: verificationCode, 
                name,      
                id,        
                password   
            }),
        });
        const data = await response.json();
        if (data.success) {
            console.log('Phone number verified');
            Alert.alert('Success', 'Phone number verified.');
            // Navigate to the next screen or perform further actions
            navigation.navigate('Login');  // Replace 'Login' with the actual screen name
        } else {
            console.log('Verification failed:', data.message);
            Alert.alert('Error', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'Failed to verify code.');
    } finally {
        setIsVerifying(false);
    }
};

  return (
    <LinearGradient colors={['#f7f7f7', '#d1d1d1']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter ID"
          value={id}
          onChangeText={setId}
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
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <TouchableOpacity 
          style={styles.verificationButton} 
          onPress={sendVerification}
          disabled={isSending}
        >
          <Text style={styles.buttonText}>
            {isSending ? "Sending..." : "Send Verification Code"}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Verification Code"
          keyboardType="number-pad"
          value={verificationCode}
          onChangeText={setVerificationCode}
        />
        <TouchableOpacity 
          style={styles.verificationButton} 
          onPress={verifyCode}
          disabled={isVerifying}
        >
          <Text style={styles.buttonText}>
            {isVerifying ? "Verifying..." : "Verify Code"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  verificationButton: {
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
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  loginButton: {
    marginTop: 10,
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
});
