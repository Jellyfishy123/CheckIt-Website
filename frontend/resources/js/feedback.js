import firebaseConfig from './models/firebaseConfig.js';
import feedbackService from './service/feedbackService.js';

document.getElementById('taskForm').addEventListener('submit', () => {
    addFeedback();
    resetFormFields();
});

const getCurrentUserId = () => {
    // return firebase.auth().currentUser.uid;
    return '1';//for testing purposes
}

const addFeedback = () => {
    const uid = getCurrentUserId();

    const interestedInputs = [];
    const form = document.getElementById('feedbackForm');
    interestedInputs.push(...form.querySelector('#newFeedback'));

    const feedbackObj = {};

    interestedInputs.forEach(input => {
        feedbackObj[input.name] = input.value;
    });

    //add userID to feedbackObj
    feedbackObj.userID = uid;

    console.log(feedbackObj);
    feedbackService.addFeedback(feedbackObj);
}
