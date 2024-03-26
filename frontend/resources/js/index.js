
document.querySelector("#newTaskStartDTButton").addEventListener("click", function () {
    datepicker("#newTaskStartDT");
});

document.querySelector("#newTaskEndDTButton").addEventListener("click", function () {
    datepicker("#newTaskEndDT");
});

document.getElementById('addTaskForm').addEventListener('submit', function () {
    addTasks();
    resetFormFields();
});

function datepicker(id) {
    flatpickr(id, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        allowInput: false,
        clickOpens: false
    }).open();
}

function resetFormFields() {
    // Get the form and the inputs
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

// Create an array of items for testing
var items = [
    {
        id: 1,
        title: 'Task 1',
    },
    {
        id: 2,
        title: 'testing long task name to check text wrap and overflow hidden',
    }
    ,
    {
        id: 3,
        title: 'testing long task name to check text wrap and overflow hidden',
    },
    {
        id: 4,
        title: 'testing long task name to check text wrap and overflow hidden',
    },
    
];

const priorityOptions = {
    'low': 'btn-success',
    'medium': 'btn-warning',
    'high': 'btn-danger',
};

function showTasks() {
    const cardContent = document.getElementById('card-body');
    cardContent.innerHTML = '';
    cardContent.classList.add('row');

    if (items.length == 0) {
        cardContent.innerHTML = `
            <div class="card-body d-flex align-items-center justify-content-center">
                <p>Currently empty... <br>
                Click <a href="#"> here</a> to find some activities!</p>
            </div>
        `;
        return;
    }


    const taskContainer = document.createElement('div');
    taskContainer.className = 'd-flex align-items-center col mx-5 my-3 p-4 overflow-auto';
    taskContainer.style.maxHeight = '400px';
    taskContainer.id = 'taskContainer';


    const headerDiv = document.createElement('div');
    headerDiv.className = 'headerDiv w-100 justify-content-between';

    const checkboxAndHeaderContainer = document.createElement('div');
    checkboxAndHeaderContainer.className = '';
    checkboxAndHeaderContainer.className = "d-flex align-items-center justify-content-between";
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkboxAndHeaderContainer.appendChild(checkbox);

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

    // Create another new card
    const dueTaskContainer = document.createElement('div');
    dueTaskContainer.className = 'd-flex align-items-center justify-content-between col mx-5 my-3';
    dueTaskContainer.id = 'dueTaskContainer';

    // Add each item to the card
    items.forEach(function (item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'w-100 d-flex';

        const itemCheckbox = document.createElement('input');
        itemCheckbox.type = 'checkbox';
        itemCheckbox.value = item.id;
        itemCheckbox.className = 'me-3';
        itemElement.appendChild(itemCheckbox);

        const itemBox = document.createElement('div');
        //overflow-hidden is used to hide the text that overflows the box
        itemBox.className = 'rounded bg-light w-100 p-2 mt-3 position-relative';
        itemBox.textContent = item.title;
        itemBox.style.fontStyle = 'normal';
        itemBox.style.color = '#676767';
        itemBox.addEventListener('click', () => viewDetailedTasks(item));
        itemElement.appendChild(itemBox);
        taskContainer.appendChild(itemElement);

        // // Add popover to itemBox
        // itemBox.setAttribute('data-bs-toggle', 'popover');
        // itemBox.setAttribute('data-bs-html', 'true');
        // itemBox.setAttribute('data-bs-trigger', 'hover');
        // itemBox.setAttribute('data-bs-placement', 'top');
        // itemBox.setAttribute('title', 'Choose color');
        // itemBox.setAttribute('data-bs-content', `
        //     <button class="btn btn-sm btn-danger" data-color="red">Red</button>
        //     <button class="btn btn-sm btn-warning" data-color="orange">Orange</button>
        //     <button class="btn btn-sm btn-success" data-color="green">Green</button>
        // `);
        // Add mouseenter event listener to itemBox
        itemBox.addEventListener('mouseenter', function (event) {
            // Create new card
            const colorCard = document.createElement('div');
            colorCard.className = 'card';
            colorCard.style.height = 'fit-content';
            colorCard.style.width = 'fit-content';

            // Add color buttons to card
            const colorCardBody = document.createElement('div');
            colorCardBody.className = 'card-body d-flex justify-content-between gap-2';

            for (const color in priorityOptions) {
                const button = document.createElement('button');
                button.className = `btn btn-sm ${priorityOptions[color]}`;
                colorCardBody.appendChild(button);
            }

            colorCard.appendChild(colorCardBody);

            // Add event listener to color buttons
            colorCard.addEventListener('click', function (event) {
                if (event.target.matches('[data-color]')) {
                    event.preventDefault();
                    itemBox.style.backgroundColor = event.target.dataset.color;
                    document.body.removeChild(colorCard);
                }
            });

            // Append card to document body at mouse position
            colorCard.style.position = 'absolute';
            colorCard.style.zIndex = '999';

            itemBox.appendChild(colorCard);
        });

        itemBox.addEventListener('mouseleave', (e) => removeColorCard(e));
        taskContainer.appendChild(itemElement);
    });


    cardContent.appendChild(taskContainer);
    cardContent.appendChild(dueTaskContainer);

}
// Function to remove colorCard
function removeColorCard(e) {
    const targetDocument = e.target;
    const colorCard = targetDocument.querySelector('.card');
    if (colorCard && !colorCard.matches(':hover')) {
        targetDocument.removeChild(colorCard);
    }
}

// Function to view detailed tasks
function viewDetailedTasks(task) {
    // Open the modal
    $('#staticBackdrop').modal('show'); // Assuming 'staticBackdrop' is the id of your Bootstrap modal

    // Get the form and the inputs
    const form = document.getElementById('addTaskForm');
    const inputs = form.elements;

    // Fill the form with the task details and disable the inputs
    for (let i = 0; i < inputs.length; i++) {
        if (task[inputs[i].name]) {
            inputs[i].value = task[inputs[i].name];
        }
        inputs[i].disabled = true;
    }

    // Reset the form fields when the modal is closed
    $('#staticBackdrop').on('hidden.bs.modal', resetFormFields);

    console.log("Hello ", task);
}



// Function to add tasks
function addTasks() {
    const form = document.getElementById('addTaskForm');
    const interestedInputs = [];
    interestedInputs.push(...form.querySelectorAll('input[type="text"]'));
    interestedInputs.push(...form.querySelectorAll('input[name="inOrOut"]:checked'));

    const taskObj = {};

    interestedInputs.forEach(input => {
        taskObj[input.name] = input.value;
    });

    // add taskObj to database. For now, simulate by adding to items array.
    // Delete when database is ready, id is generated by the database
    const generatedId = Math.ceil(Math.random() * 10000000);
    taskObj['id'] = generatedId;
    items.push(taskObj);

    showTasks();
}

// Function to edit tasks
function editTasks() {
    // Code to edit tasks goes here

}

// Function to delete tasks
function deleteTasks() {
    // Code to delete tasks goes here
}


// Function to handle all tasks
function allTasks() {
    // Call the function to update the card content
    showTasks();

    // // Call the function to view detailed tasks
    // viewDetailedTasks();

    // // Call the function to add tasks
    // addTasks();

    // // Call the function to edit tasks
    // editTasks();

    // // Call the function to delete tasks
    // deleteTasks();
}

// Call the function to handle all tasks
allTasks();