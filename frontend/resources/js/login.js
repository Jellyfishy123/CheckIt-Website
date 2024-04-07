// login.js
import loginService from './service/loginService.js';

const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');
const loginClick = document.querySelector('.login-btn');
const registerClick = document.querySelector('.register-btn');

registerLink.addEventListener('click', () => {
    clearMessage('login-msg')
    wrapper.classList.add('active');
});

loginClick.addEventListener('click', () => {
    save('login');
});

registerClick.addEventListener('click', () => {
    save('register');
});

loginLink.addEventListener('click', () => {
    clearMessage('register-msg')
    registerform.reset();
    wrapper.classList.remove('active');
});

btnPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
});

const loginform = document.getElementById('loginForm');
const registerform = document.getElementById('registerForm');

iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
    wrapper.classList.remove('active');
    loginform.reset();
    registerform.reset();

    const loginErrorDiv = document.getElementById('login-msg');
    loginErrorDiv.style.display = 'none';

    const registerErrorDiv = document.getElementById('register-msg');
    registerErrorDiv.style.display = 'none';
});

function clearMessage(id) {
    const messageDiv = document.getElementById(id);
    messageDiv.style.display = 'none';
    messageDiv.textContent = '';
}

function showMessage(message, id, color) {
    const showMessageDiv = document.getElementById(id);
    clearMessage(id);

    //display the new message
    showMessageDiv.textContent = message;
    showMessageDiv.style.color = color;
    showMessageDiv.style.display = 'block';
    console.log("Error message displayed: ", message);

}

function save(formType) {
    let email, password, username;
    if (formType === 'login') {
        email = document.getElementById('login-email').value;
        password = document.getElementById('login-password').value;

        if (!email || !password) {
            showMessage("Please fill out all fields", 'login-msg',"#d97d71");
            return;
        }
        
        loginService.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                localStorage.setItem('user', JSON.stringify(userCredential.user));
                localStorage.setItem('userId', userCredential.user.uid);    
                window.location.href = 'home.html';
            })
            .catch((error) => {
                showMessage("Invalid email or password", 'login-msg',"#d97d71");
                console.error("Error signing in:", error);
            });

    } else if (formType === 'register') {
        username = document.getElementById('register-username').value;
        email = document.getElementById('register-email').value;
        password = document.getElementById('register-password').value;

        if (!username || !email || !password) {
            showMessage("Please fill out all fields", 'register-msg',"#d97d71");
            return;
        }

        //check if checkbox is checked
        if (!document.getElementById('terms').checked) {
            showMessage("Please agree to terms and conditions", 'register-msg',"#d97d71");
            return;
        }

        loginService.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Data saved successfully!');
                document.getElementById('register-username').value = '';
                document.getElementById('register-email').value = '';
                document.getElementById('register-password').value = '';
                showMessage("Registration successful. Proceed to Login", 'register-msg',"#62bd76"); 
            })
            .catch((error) => {
                showMessage("Email already in use", 'register-msg',"#d97d71");
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





