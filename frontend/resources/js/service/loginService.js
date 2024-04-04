// loginService.js
import firebase from "../models/firebase.js";

function signInWithEmailAndPassword(email, password) {
    return firebase.auth.signInWithEmailAndPassword(email, password);
}

function createUserWithEmailAndPassword(email, password) {
    return firebase.auth.createUserWithEmailAndPassword(email, password);
}

export default { signInWithEmailAndPassword, createUserWithEmailAndPassword };
