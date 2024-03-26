const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');
const loginClick = document.querySelector('.login-btn');
const registerClick = document.querySelector('.register-btn');

registerLink.addEventListener('click', () => {
    wrapper.classList.add('active');
});

loginClick.addEventListener('click', () => {
    save('login');
});

registerClick.addEventListener('click', () => {
    save('register');
});

loginLink.addEventListener('click', () => {
    wrapper.classList.remove('active');
});

btnPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
    wrapper.classList.remove('active');
});

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import firebaseConfig from './models/firebaseConfig.js';
console.log(firebaseConfig)

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function showMessage(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert';
    alertElement.textContent = message;
    alertElement.style.color = 'red'; // Set color to red
    alertElement.style.position = 'absolute';
    alertElement.style.top = 'auto';
    alertElement.style.left = 'auto';
    alertElement.style.width = '20%';
    alertElement.style.height = '20%';
    alertElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black overlay
    alertElement.style.display = 'flex';
    alertElement.style.justifyContent = 'center';
    alertElement.style.alignItems = 'center';
    alertElement.style.zIndex = '9999';

    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    messageElement.style.padding = '20px';
    messageElement.style.backgroundColor = 'white'; // White background for the message
    messageElement.style.borderRadius = '5px';

    //alertElement.appendChild(messageElement);

    // Add the alert to the DOM
    document.body.appendChild(alertElement);

    // Remove the alert after a certain duration (e.g., 5 seconds)
    setTimeout(() => {
        alertElement.remove();
    }, 1000); // 5000 milliseconds = 1 seconds
}


function save(formType) {
    let email, password, username;
    if (formType === 'login') {
        email = document.getElementById('login-email').value;
        password = document.getElementById('login-password').value;

        if (!email || !password) {
            // Display error message to user
            showMessage("Please fill out all fields");
            return; // Stop execution if any field is empty
        }

        // Authenticate user with Firebase Authentication
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Redirect to home page after successful login
                window.location.href = 'home.html';
            })
            .catch((error) => {
                console.error("Error signing in:", error);
                // Handle authentication errors (e.g., display error message to user)
            });
    } else if (formType === 'register') {
        console.log('register runs')
        username = document.getElementById('register-username').value;
        email = document.getElementById('register-email').value;
        password = document.getElementById('register-password').value;

         // Check if any of the fields are empty
        if (!username || !email || !password) {
            // Display error message to user
            showMessage("Please fill out all fields");
            return; // Stop execution if any field is empty
        }

        // Push user credentials to the database
        database.ref('users').push({
            username: username,
            email: email,
            password: password
        }).then(() => {
            console.log('Data saved successfully!');
            // Clear input fields after submission
            document.getElementById('register-username').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
            // Redirect to the login page
            window.location.href = 'login.html';
        }).catch(error => {
            console.error("Error saving data:", error);
            // Handle database saving errors (e.g., display error message to user)
        });
    }
}




