import { ref, get, set, push, child, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import firebase from '../models/firebase.js';

const feedbackRef = ref(firebase.db, 'feedbacks');

const getAllFeedbacks = async () => {
    const items = [];
    await get(feedbackRef).then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const id = childSnapshot.key;
            const data = childSnapshot.val();
            items.push({id: id, ...data});
        });
    }).catch((error) => {
        console.error(error);
    });

    return items;
};

const addFeedback = async (feedback) => {
    await push(feedbackRef, feedback).then(() => {
        console.log('feedback added');
    }).catch((error) => {
        console.error(error);
    });
};

const deleteFeedback = async (id) => {
    const childRef = child(feedbackRef, id);
    remove(childRef).then(() => {
        console.log('feedback deleted');
    }).catch((error) => {
        console.error(`Error removing ${id}`, error);
    });
};

const updateFeedback = async (feedback) => {
    const feedbackClone = {...feedback};
    const childRef = child(feedbackRef, feedbackClone.id);

    delete feedbackClone.id;
    set(childRef, feedbackClone).then(() => {
        console.log('feedback updated');
    }).catch((error) => {
        console.error(`Error updating ${id}`, error);
    });
}

export default {
    getAllFeedbacks,
    addFeedback,
    deleteFeedback,
    updateFeedback
};