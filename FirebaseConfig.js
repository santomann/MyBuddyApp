import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDb7sVj8jDLK5jiaHUP_PORqdbv7bbtil4",
  authDomain: "mybuddy-63c27.firebaseapp.com",
  projectId: "mybuddy-63c27",
  storageBucket: "mybuddy-63c27.appspot.com",
  messagingSenderId: "816713220943",
  appId: Platform.OS === 'ios'
    ? "1:816713220943:ios:38db31886912a2ba467b3a"
    : "1:816713220943:android:c08e57072ea274a7467b3a",
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});


export { auth };
export default firebaseConfig;
