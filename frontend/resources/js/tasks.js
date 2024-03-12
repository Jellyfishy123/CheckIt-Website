import tasksService from './service/tasksService.js';

document.querySelector("#newTaskStartDTButton").addEventListener("click", () => datepicker("#newTaskStartDT"));
document.querySelector("#newTaskEndDTButton").addEventListener("click", () => datepicker("#newTaskEndDT"));
document.getElementById('addTaskForm').addEventListener('submit', () => {
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
    const form = document.getElementById('addTaskForm');
    const inputs = form.elements;

    // Reset the form fields to their initial state
    for (let i = 0; i < inputs.length; i++) {
        // submit value should not be cleared
        if (inputs[i].type === 'submit') {
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
    'low': '#82D665',
    'medium': '#E5B772',
    'high': '#E99893',
};

const showTasks = async () => {
    items = await tasksService.getAllTasks();

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

    //Helper function
    const createDiv = (className, id) => {
        const div = document.createElement('div');
        div.className = className;
        if (id) div.id = id;
        return div;
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

    const dueTaskContainer = createDiv('d-flex align-items-center justify-content-between col mx-5 my-3', 'dueTaskContainer');

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
    cardContent.appendChild(dueTaskContainer);
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

    const form = document.getElementById('addTaskForm');
    const inputs = form.elements;

    for (let i = 0; i < inputs.length; i++) {

        if (inputs[i].type === 'text') {
            inputs[i].style.backgroundColor = '#D7D7D7';
        }
        if (task[inputs[i].name]) {
            inputs[i].value = task[inputs[i].name];
        }
        inputs[i].disabled = true;
    }

    const modalFooter = $('.modal-footer');
    modalFooter.empty();
    modalFooter.append('<button id="editButton" type="button" class="btn btn-confirm">Edit</button>');

    $('#editButton').on('click', () => editTaskView(task));
    $('#staticBackdrop').on('hidden.bs.modal', resetFormFields);
}

const addTasks = () => {
    const form = document.getElementById('addTaskForm');
    const interestedInputs = [];
    interestedInputs.push(...form.querySelectorAll('input[type="text"]'));
    interestedInputs.push(...form.querySelectorAll('input[name="inOrOut"]:checked'));

    const taskObj = {};

    interestedInputs.forEach(input => {
        taskObj[input.name] = input.value;
    });

    taskObj.priority = 'unassigned';
    tasksService.addTask(taskObj);
    showTasks();
}

const editTaskView = (task) => {
    const modalFooter = $('.modal-footer');
    modalFooter.empty();

    modalFooter.append('<button id="confirmButton" type="button" class="btn btn-confirm">Confirm</button>');
    modalFooter.append('<button id="cancelButton" type="button" class="btn btn-cancel">Cancel</button>');

    const form = document.getElementById('addTaskForm');
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
    $('#cancelButton').on('click', () => viewDetailedTasks(task));

}

const confirmEditTasks = async (task) => {
    const form = document.getElementById('addTaskForm');
    const input = form.elements;

    for (let i = 0; i < input.length; i++) {
        if (input[i].type === 'submit' || input[i].type === 'button') continue;
        task[input[i].name] = input[i].value;
    }

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

showTasks();