import { ref, get, set, push, child, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import firebase from '../models/firebase.js';

const tasksRef = ref(firebase.db, 'tasks');

const getAllTasks = async () => {
    const items = [];
    await get(tasksRef).then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const id = childSnapshot.key;
            const data = childSnapshot.val();
            items.push({ id: id, ...data });
        });
    }).catch((error) => {
        console.error(error);
    });

    return items;
};

const addTask = async (task) => {
    await push(tasksRef, task).then(() => {
        console.log('Task added');
        console.log('Task name:', task.title);
    }).catch((error) => {
        console.error(error);
    });
};

const deleteTask = async (id) => {
    const childRef = child(tasksRef, id);
    //if no id is provided, alert user
    remove(childRef).then(() => {
        console.log('Task deleted');
        alert('Task(s) Deleted Succefully!');
    }).catch((error) => {
        console.error(`Error removing ${id}`, error);
    });
};

const updateTask = async (task) => {
    const taskClone = { ...task };
    const childRef = child(tasksRef, taskClone.id);

    delete taskClone.id;
    set(childRef, taskClone).then(() => {
        console.log('Task updated');
    }).catch((error) => {
        console.error(`Error updating ${id}`, error);
    });
}

export default {
    getAllTasks,
    addTask,
    deleteTask,
    updateTask
};