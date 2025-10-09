// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence,  browserSessionPersistence} from "firebase/auth";
import { getFunctions } from "firebase/functions"
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB-73itLZzPKbxkg5jcjpLT8En1zVwLG1w",
    authDomain: "fit5032s2.firebaseapp.com",
    projectId: "fit5032s2",
    storageBucket: "fit5032s2.firebasestorage.app",
    messagingSenderId: "213899957335",
    appId: "1:213899957335:web:8d8bb69695c667e58eff12",
    measurementId: "G-3P77VKYT3T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 初始化服务
export const auth = getAuth(app);
// setPersistence(auth, browserSessionPersistence)
export const db = getFirestore(app)
export const functions = getFunctions(app)
export const storage = getStorage(app)

export default app