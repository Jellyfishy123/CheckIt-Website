import firebaseConfig from './models/firebaseConfig.js';
import feedbackService from './service/feedbackService.js';

document.getElementById('feedbackForm').addEventListener('submit', () => {
    addFeedback();
    resetFormFields();
});

const getCurrentUserId = () => {
    return localStorage.getItem('userId');
}

const addFeedback = () => {
    const uid = getCurrentUserId();

    const interestedInputs = [];
    const form = document.getElementById('feedbackForm');
    interestedInputs.push(form.querySelector('#newFeedback'));

    const feedbackObj = {};

    interestedInputs.forEach(input => {
        feedbackObj[input.name] = input.value;
    });

    //add userID to feedbackObj
    feedbackObj.userID = uid;

    console.log(feedbackObj);
    feedbackService.addFeedback(feedbackObj);
}

const resetFormFields = () => {
    const form = document.getElementById('feedbackForm');
    const errorMessage = document.querySelector("#errorMessage");
    const feedbackTextarea = document.querySelector("#newFeedback");

    feedbackTextarea.value = '';
}
