// login.js

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from './loginService.js';

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
            showMessage("Please fill out all fields");
            return;
        }

        signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                window.location.href = 'home.html';
            })
            .catch((error) => {
                console.error("Error signing in:", error);
            });
    } else if (formType === 'register') {
        username = document.getElementById('register-username').value;
        email = document.getElementById('register-email').value;
        password = document.getElementById('register-password').value;

        if (!username || !email || !password) {
            showMessage("Please fill out all fields");
            return;
        }

        createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Data saved successfully!');
                document.getElementById('register-username').value = '';
                document.getElementById('register-email').value = '';
                document.getElementById('register-password').value = '';
                window.location.href = 'login.html';
            })
            .catch((error) => {
                console.error("Error saving data:", error);
            });
    }
}

window.addEventListener('load', () => {
    // Code to check for stored authentication state
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        // User is authenticated, redirect to home page
        window.location.href = 'home.html';
    }
});





