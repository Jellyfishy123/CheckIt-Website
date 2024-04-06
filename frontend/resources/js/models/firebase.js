import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

class FirebaseAuthWrapper {
    constructor(auth) {
        this.auth = auth;
    }

    signInWithEmailAndPassword(email, password) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    createUserWithEmailAndPassword(email, password) {
        return createUserWithEmailAndPassword(this.auth, email, password);
    }
}

const auth = new FirebaseAuthWrapper(getAuth(app));
export default {db, auth};