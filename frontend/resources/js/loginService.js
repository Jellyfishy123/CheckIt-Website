// loginService.js

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import firebase from 'firebase/app';
import 'firebase/auth';
import firebaseConfig from './models/firebaseConfig.js';

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function signInWithEmailAndPassword(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
}

function createUserWithEmailAndPassword(email, password) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
}

export { signInWithEmailAndPassword, createUserWithEmailAndPassword };
