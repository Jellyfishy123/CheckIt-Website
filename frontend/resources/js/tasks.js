import firebaseConfig from './models/firebaseConfig.js';
import tasksService from './service/tasksService.js';
import apiService from './service/weatherService.js';
import weatherService from './service/weatherService.js';

let selectedTextContent = 'Today';
let selectedNum = 0;

document.querySelector("#newTaskStartDTButton").addEventListener("click", () => datepicker("#newTaskStartDT"));
document.querySelector("#newTaskEndDTButton").addEventListener("click", () => datepicker("#newTaskEndDT"));
document.getElementById('taskForm').addEventListener('submit', () => {
    addTasks();
    resetFormFields();
});

const datepicker = (id) => {
    flatpickr(id, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        allowInput: false,
        clickOpens: false
    }).open();
}

const resetFormFields = () => {
    const form = document.getElementById('taskForm');
    const inputs = form.elements;

    // Reset the form fields to their initial state
    for (let i = 0; i < inputs.length; i++) {
        // submit and radio buttons value should not be reset
        if (inputs[i].type === 'submit' || inputs[i].type === 'radio') {
            inputs[i].disabled = false;
            continue;
        }
        inputs[i].value = '';
        inputs[i].disabled = false;
    }
}

const updateMasterCheckbox = () => {
    const scrollContainer = document.getElementById('scrollContainer');
    const allCheckboxes = scrollContainer.querySelectorAll('input[type="checkbox"]');
    const selectedCheckboxes = scrollContainer.querySelectorAll('input[type="checkbox"]:checked');
    document.getElementById('selectAll').checked = allCheckboxes.length == selectedCheckboxes.length;
};

// Items array
let items = [];

const priorityOptions = {
    'unassigned': '#f5f5f5',
    'low': '#A4E8B3',
    'medium': '#E8C9A4',
    'high': '#E8ACA4',
};

const getCurrentUserId = () => {
    // return firebase.auth().currentUser.uid;
    return '1';//for testing purposes
}

//Helper function
const createDiv = (className, id) => {
    const div = document.createElement('div');
    div.className = className;
    if (id) div.id = id;
    return div;
}

const showTasks = async () => {
    items = await tasksService.getAllTasks();

    const uid = getCurrentUserId();
    items = items.filter(item => item.userID === uid);

    const cardContent = document.getElementById('card-body');
    cardContent.style.height = " 700px";
    cardContent.innerHTML = '';
    cardContent.classList.add('row');

    if (items.length === 0) {
        cardContent.innerHTML = `
        <div class="card-body d-flex align-items-center justify-content-center">
            <p>Currently empty... <br>
            Click <a href="#"> here</a> to find some activities!</p>
        </div>
    `;
        return;
    }
    const taskContainer = createDiv('d-flex align-items-center col mx-5 mb-3 my-3 p-3', 'taskContainer');

    const headerDiv = createDiv('headerDiv w-100 justify-content-between');

    const checkboxAndHeaderContainer = createDiv('d-flex align-items-center justify-content-between');

    const masterCheckbox = document.createElement('input');
    masterCheckbox.id = 'selectAll';
    masterCheckbox.type = 'checkbox';
    checkboxAndHeaderContainer.appendChild(masterCheckbox);

    masterCheckbox.addEventListener('change', (e) => {
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach((checkbox) => {
            checkbox.checked = e.target.checked;
        });
    });

    const header = document.createElement('h2');
    header.textContent = 'All Tasks';
    header.style.fontFamily = 'Roboto Mono';
    header.style.fontStyle = 'normal';
    header.style.color = '#676767';
    header.classList.add('ms-3')
    checkboxAndHeaderContainer.appendChild(header);

    headerDiv.appendChild(checkboxAndHeaderContainer);

    const dropdown = document.createElement('select');
    const placeholderOption = document.createElement('option');
    placeholderOption.textContent = 'SortBy';
    dropdown.appendChild(placeholderOption);

    headerDiv.appendChild(dropdown);
    taskContainer.appendChild(headerDiv);

    const hr = document.createElement('hr');
    hr.className = 'double w-100';
    taskContainer.appendChild(hr);

    const scrollContainer = createDiv('w-100 m-3 overflow-auto pe-3', 'scrollContainer');
    scrollContainer.style.height = '450px';

    //Create each Todo item
    items.forEach((item) => {
        const itemElement = createDiv('w-100 d-flex');

        const itemCheckbox = document.createElement('input');
        itemCheckbox.type = 'checkbox';
        itemCheckbox.value = item.id;
        itemCheckbox.className = 'me-3';
        itemCheckbox.addEventListener('change', updateMasterCheckbox);
        itemElement.appendChild(itemCheckbox);

        const itemBox = createDiv('rounded w-100 p-2 mt-3 position-relative');
        itemBox.textContent = item.title;
        itemBox.style.fontStyle = 'normal';
        itemBox.style.color = '#676767';

        // Breaks word if it exceeds the container width
        itemBox.style.wordBreak = 'break-word';
        itemBox.style.backgroundColor = priorityOptions[item.priority] || '#f5f5f5';
        itemBox.addEventListener('click', () => viewDetailedTasks(item));
        itemElement.appendChild(itemBox);

        //Priority Color
        itemBox.addEventListener('mouseenter', (event) => {
            const colorCard = createDiv('card');
            colorCard.style.height = 'fit-content';
            colorCard.style.width = 'fit-content';

            const colorCardBody = createDiv('card-body d-flex justify-content-between gap-2');

            for (const priority in priorityOptions) {
                const button = document.createElement('button');
                button.className = 'btn btn-sm';
                button.style.backgroundColor = priorityOptions[priority];

                button.onclick = () => {
                    itemBox.style.backgroundColor = priorityOptions[priority];
                    itemBox.style.transitionDuration = '0.5s';
                    itemBox.removeChild(colorCard);
                    item.priority = priority;
                    tasksService.updateTask(item);

                    showTasks();
                };
                colorCardBody.appendChild(button);
            }

            colorCard.appendChild(colorCardBody);
            colorCard.style.position = 'absolute';
            colorCard.style.zIndex = '999';

            colorCard.onclick = (event) => event.stopPropagation();
            itemBox.appendChild(colorCard);
        });

        itemBox.addEventListener('mouseleave', (e) => removeColorCard(e));
        scrollContainer.appendChild(itemElement);
    });

    taskContainer.appendChild(scrollContainer);

    // Clear button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'CLEAR';
    clearButton.className = 'btn';
    clearButton.style.fontFamily = 'Roboto Mono';
    clearButton.style.backgroundColor = '#FFAE73';
    clearButton.style.color = 'white';
    clearButton.addEventListener('click', deleteTasks);

    taskContainer.appendChild(clearButton);
    cardContent.appendChild(taskContainer);

    //create div for duetaskcontainer fitting the width of the taskDetectionContainer
    const taskDetectionContainer = createDiv('d-flex align-items-center  col mx-5 my-3', 'dueTaskContainer');
    //Header
    const dueTaskHeader = document.createElement('h2');
    dueTaskHeader.textContent = 'Upcoming Tasks';
    dueTaskHeader.style.fontFamily = 'Roboto Mono';
    dueTaskHeader.style.fontStyle = 'normal';
    dueTaskHeader.style.color = '#676767';
    dueTaskHeader.classList.add('ms-3', 'mt-3');

    taskDetectionContainer.appendChild(dueTaskHeader);

    //Due tasks container
    const dueTaskSelectionContainer = createDiv('w-100 d-flex align-items-center justify-content-between', 'dueTaskSelectionContainer');

    //Sub header
    const dueTaskHeader2 = document.createElement('h3');
    dueTaskHeader2.textContent = 'Due ';
    dueTaskHeader2.style.fontFamily = 'Roboto Mono';
    dueTaskHeader2.style.fontStyle = 'normal';
    dueTaskHeader2.style.color = '#676767';
    dueTaskHeader2.classList.add('ms-3', 'd-flex');

    //Dropdown
    const dueTaskHeaderDropdown = document.createElement('select');
    dueTaskHeaderDropdown.classList.add('form-select', 'w-100', 'ms-3', 'me-3');

    const dueTaskHeaderPlaceholderOption = document.createElement('option');
    dueTaskHeaderPlaceholderOption.textContent = selectedTextContent;
    dueTaskHeaderPlaceholderOption.value = selectedNum;
    dueTaskHeaderPlaceholderOption.hidden = true;

    dueTaskHeaderDropdown.appendChild(dueTaskHeaderPlaceholderOption);

    const options = [
        { text: 'Overdue', value: -1 },
        { text: 'Today', value: 0 },
        { text: 'Tomorrow', value: 1 },
        { text: 'This week', value: 7 },
        { text: 'Next week', value: 14 }
    ];

    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.textContent = option.text;
        optionElement.value = option.value;
        dueTaskHeaderDropdown.appendChild(optionElement);
    });

    dueTaskHeaderDropdown.style.fontFamily = 'Roboto Mono';
    dueTaskHeaderDropdown.style.fontStyle = 'normal';
    dueTaskHeaderDropdown.style.color = '#676767';

    dueTaskHeader2.appendChild(dueTaskHeaderDropdown);
    taskDetectionContainer.appendChild(dueTaskHeader2);

    //scroll container for due tasks
    const dueTaskScrollContainer = createDiv('w-100 overflow-auto', 'dueTaskScrollContainer');
    dueTaskScrollContainer.style.height = '180px';

    dueTaskHeaderDropdown.addEventListener('change', (e) => {
        dueTaskScrollContainer.innerHTML = '';
        selectedTextContent = e.target.selectedOptions[0].textContent;
        selectedNum = e.target.value;
        showDueTasks(selectedNum);
    });

    taskDetectionContainer.appendChild(dueTaskScrollContainer);

    // Weather content container
    const weatherContentContainer = document.createElement('div');
    weatherContentContainer.classList.add('d-flex', 'align-items-center', 'justify-content-center');

    const currentWeatherContainer = await showWeather();
    weatherContentContainer.appendChild(currentWeatherContainer);

    const weatherImpactedTasksHeader = document.createElement('text');
    weatherImpactedTasksHeader.textContent = 'Weather Impacted Task(s)';
    weatherImpactedTasksHeader.style.fontFamily = 'Roboto Mono';
    weatherImpactedTasksHeader.style.fontStyle = 'normal';

    //Weather Scroll Container
    const weatherImpactedTaskScrollContainer = createDiv('w-100 overflow-auto', 'weatherImpactedTaskScrollContainer');
    weatherImpactedTaskScrollContainer.style.height = '180px';

    taskDetectionContainer.appendChild(hr);
    taskDetectionContainer.appendChild(weatherContentContainer);
    taskDetectionContainer.appendChild(weatherImpactedTasksHeader);

    taskDetectionContainer.appendChild(weatherImpactedTaskScrollContainer);

    cardContent.appendChild(taskDetectionContainer);
    showDueTasks(selectedNum);
    showWeatherImpactedTasks(items);
}

const showWeather = async () => {
    const weatherData = await apiService.getWeatherData();
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    const weatherConditions = ['light rain', 'moderate rain', 'rain', 'shower rain', 'thunderstorm'];
    const isWeatherImpacted = weatherConditions.some(condition => weatherCondition.includes(condition));

    // Create weather container
    const currentWeatherContainer = createDiv('d-flex flex-column align-items-center justify-content-center');

    const weatherTextHeader = document.createElement('h2');
    weatherTextHeader.textContent = isWeatherImpacted ? 'Weather Warning!' : 'Weather Forecast';
    weatherTextHeader.style.fontFamily = 'Roboto Mono';
    weatherTextHeader.style.fontStyle = 'normal';
    weatherTextHeader.style.color = '#676767';
    weatherTextHeader.style.marginBottom = '0px';
    
    currentWeatherContainer.appendChild(weatherTextHeader);

    const weathercontent = createDiv('d-flex align-items-center justify-content-center', 'weathercontent');

    const weatherText = document.createElement('h3');
    weatherText.textContent = weatherData.weather[0].description;
    weatherText.style.fontFamily = 'Roboto Mono';
    weatherText.style.fontStyle = 'normal';
    weatherText.style.color = '#676767';
    weatherText.style.marginTop = '0px';
    weathercontent.appendChild(weatherText);

    const weatherIcon = document.createElement('img');
    weatherIcon.src = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;
    weatherIcon.alt = 'Weather Icon';
    weathercontent.appendChild(weatherIcon);

    currentWeatherContainer.appendChild(weathercontent);

    return currentWeatherContainer;
};

const showWeatherImpactedTasks = async (item) => {
    const weatherImpactedTaskScrollContainer = document.getElementById('weatherImpactedTaskScrollContainer');
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); //to compare only the date

    //only impact outdoor tasks
    const outdoorTasks = item.filter(task => task.inOrOut === 'outdoor');

    //get weather data
    const weatherData = await apiService.getWeatherData();

    //check for weather impacted tasks

    outdoorTasks.forEach((task) => {
        const taskDate = new Date(task.endDT);
        taskDate.setHours(0, 0, 0, 0);

        const dueinDays = Math.floor((taskDate - currentDate) / (1000 * 60 * 60 * 24));

        const weatherCondition = weatherData.weather[0].main.toLowerCase();
        const weatherConditions = ['light rain', 'rain', 'shower rain', 'thunderstorm'];
        const isWeatherImpacted = weatherConditions.some(condition => weatherCondition.includes(condition));

        if (dueinDays == 0 && isWeatherImpacted) {
            const weather = weatherData.weather[0].description;
            const weatherIcon = weatherData.weather[0].icon;

            const weatherImpactedTaskElement = createDiv('w-100 d-flex');
            const weatherImpactedTaskBox = createDiv('rounded w-100 p-2 mx-3 mt-3 position-relative');
            weatherImpactedTaskBox.textContent = task.title;
            weatherImpactedTaskBox.style.fontStyle = 'normal';
            weatherImpactedTaskBox.style.color = '#676767';
            weatherImpactedTaskBox.style.wordBreak = 'break-word';
            weatherImpactedTaskBox.style.backgroundColor = priorityOptions[task.priority] || '#f5f5f5';
            weatherImpactedTaskElement.appendChild(weatherImpactedTaskBox);
            weatherImpactedTaskScrollContainer.appendChild(weatherImpactedTaskElement);
        }
    });

    if (weatherImpactedTaskScrollContainer.innerHTML === '') {

        //change weatherimpactedtaskheader content to "No weather impacted tasks"
        const weatherImpactedTasksHeader = document.querySelector('text');
        weatherImpactedTasksHeader.textContent = 'No Weather Impacted Task(s)';
        
    }

}

const showDueTasks = async (selectedNum) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); //to compare only the date

    const dueTaskScrollContainer = document.getElementById('dueTaskScrollContainer');

    items.sort((a, b) => new Date(a.endDT) - new Date(b.endDT));

    items.forEach((item) => {
        const dueDate = new Date(item.endDT);
        dueDate.setHours(0, 0, 0, 0);

        let dueinDays = Math.floor((dueDate - currentDate) / (1000 * 60 * 60 * 24));
        if (dueinDays < 0) {
            dueinDays = -1;
        }

        // Show tasks that are due today, tomorrow, this week, next week, or overdue
        if ((dueinDays == selectedNum) ||
            (selectedNum == 7 && dueinDays >= 0 && dueinDays < selectedNum) ||
            (selectedNum == 14 && dueinDays >= 7 && dueinDays < selectedNum)) {

            const dueitemElement = createDiv('w-100 d-flex');
            const dueitemBox = createDiv('rounded w-100 p-2 mx-3 mt-3 position-relative');
            dueitemBox.textContent = item.title;
            dueitemBox.style.fontStyle = 'normal';
            dueitemBox.style.color = '#676767';
            dueitemBox.style.wordBreak = 'break-word';
            dueitemBox.style.backgroundColor = priorityOptions[item.priority] || '#f5f5f5';
            dueitemElement.appendChild(dueitemBox);
            dueTaskScrollContainer.appendChild(dueitemElement);
        }
    });

    if (dueTaskScrollContainer.innerHTML === '') {
        const noDueTasks = createDiv('w-100 d-flex justify-content-center');
        noDueTasks.textContent = 'No due task(s)';
        dueTaskScrollContainer.appendChild(noDueTasks);
    }
}

const removeColorCard = (e) => {
    const targetDocument = e.target;
    const colorCard = targetDocument.querySelector('.card');
    if (colorCard && !colorCard.matches(':hover')) {
        targetDocument.removeChild(colorCard);
    }
}

const viewDetailedTasks = (task) => {
    $('#staticBackdrop').modal('show');

    const form = document.getElementById('taskForm');
    const header = document.getElementById('newTaskLabel');
    header.textContent = 'Task Details';

    const inputs = form.elements;

    for (let i = 0; i < inputs.length; i++) {

        if (inputs[i].type === 'text') {
            inputs[i].style.backgroundColor = '#D7D7D7';
            inputs[i].value = task[inputs[i].name];
        } else if (inputs[i].name === 'inOrOut') {
            inputs[i].checked = task[inputs[i].name] === inputs[i].value;
        }

        inputs[i].disabled = true;
    }

    //Create Edit Button
    const modalFooter = $('.modal-footer');
    modalFooter.empty();
    modalFooter.append('<button id="editButton" type="button" class="btn btn-confirm">Edit</button>');

    $('#editButton').on('click', () => editTaskView(task));
    $('#staticBackdrop').on('hidden.bs.modal', () => {
        resetFormFields();

        const modalFooter = $('.modal-footer');
        modalFooter.empty();
        modalFooter.append('<button id="confirmButton" type="submit" class="btn btn-confirm" data-bs-dismiss="modal">Confirm</button>');
        modalFooter.append('<button id="cancelButton" type="button" class="btn btn-cancel" data-bs-dismiss="modal" >Cancel</button>');

        for (let i = 0; i < inputs.length; i++) {

            if (inputs[i].type === 'text') {
                inputs[i].style.backgroundColor = '#F6F4F3';
            }

            if (inputs[i].type !== 'confirmButton' && inputs[i].type !== 'cancelButton') {
                inputs[i].disabled = false;
            }
        }
    });
}

const addTasks = () => {

    const uid = getCurrentUserId();
    const header = document.getElementById('newTaskLabel');
    header.textContent = 'New Task';

    const form = document.getElementById('taskForm');
    const interestedInputs = [];
    interestedInputs.push(...form.querySelectorAll('input[type="text"]'));
    interestedInputs.push(...form.querySelectorAll('input[name="inOrOut"]:checked'));

    const taskObj = {};

    interestedInputs.forEach(input => {
        taskObj[input.name] = input.value;
    });

    //add userID to taskObj
    taskObj.userID = uid;

    console.log(taskObj);
    taskObj.priority = 'unassigned';
    tasksService.addTask(taskObj);

    showTasks();
}

const editTaskView = (task) => {
    const header = document.getElementById('newTaskLabel');
    header.textContent = 'Edit Task';

    const modalFooter = $('.modal-footer');
    modalFooter.empty();

    modalFooter.append('<button id="confirmButton" type="button" class="btn btn-confirm">Confirm</button>');
    modalFooter.append('<button id="cancelButton" type="button" class="btn btn-cancel">Cancel</button>');

    const form = document.getElementById('taskForm');
    const inputs = form.elements;

    for (let i = 0; i < inputs.length; i++) {

        if (inputs[i].type === 'text') {
            inputs[i].style.backgroundColor = '#F6F4F3';
        }

        if (inputs[i].type !== 'confirmButton' && inputs[i].type !== 'cancelButton') {
            inputs[i].disabled = false;
        }
    }

    $('#confirmButton').on('click', () => confirmEditTasks(task));
    $('#cancelButton').on('click', () => {
        viewDetailedTasks(task);
    });
}

const confirmEditTasks = async (task) => {
    const form = document.getElementById('taskForm');
    const input = form.elements;

    for (let i = 0; i < input.length; i++) {
        if (input[i].type === 'submit' || input[i].type === 'button') continue;

        if (input[i].type === 'text') {
            task[input[i].name] = input[i].value;
        } else if (input[i].name === 'inOrOut' && input[i].checked) {
            task[input[i].name] = input[i].value;
        }
    }

    console.log(task);

    await tasksService.updateTask(task);
    viewDetailedTasks(task);
    showTasks();
}

const deleteTasks = async () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(async (checkbox) => {
        if (checkbox.id == 'selectAll') return;

        await tasksService.deleteTask(checkbox.value);
    });

    showTasks();
};

window.resetFormFields = resetFormFields;

showTasks();