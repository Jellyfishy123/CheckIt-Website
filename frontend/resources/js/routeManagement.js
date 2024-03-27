document.addEventListener('DOMContentLoaded', () => {
    const viewRouteButton = document.getElementById('view-route');
    const changePlanButton = document.getElementById('change-plan');
    const nextTripButton = document.getElementById('next-trip');
    const previousTripButton = document.getElementById('previous-trip');
    const itinerarySection = document.getElementById('itinerary');
    const detailsSection = document.getElementById('details');
    const confirmBtn = document.getElementById('confirm-btn');
    const taskSelectionView = document.getElementById('task-selection-view');
    const itineraryView = document.getElementById('itinerary-view');
    const allTasksCheckbox = document.getElementById('allTask');
    const taskList = document.getElementById('taskList');
    const routeDetailsSection = document.getElementById('route-details');

    let currentTripIndex = 0;

    const allEvents = [
        { time: '8:00 AM to 10:00 AM', description: 'Lesson @NTU Gaia' },
        { time: '11:00 AM to 12:00 PM', description: 'Event @Queenstown' },
        { time: '1:00 PM to 3:00 PM', description: 'Lunch @JCube' }
    ];

    const tripsBetweenEvents = [
        { travelTime: '55 min' }, // between 1st and 2nd event
        { travelTime: '45 min' }  // between 2nd and 3rd event
    ];

    function generateTaskCheckboxes() {
        taskList.innerHTML = ''; // Clear existing tasks
        allEvents.forEach((event, index) => {
            const label = document.createElement('label');
            label.className = 'task-checkbox';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `task-${index}`;
            checkbox.name = 'task';
            checkbox.setAttribute('data-index', index); // Store the index of the event

            const checkmark = document.createElement('span');
            checkmark.className = 'checkmark';

            const textNode = document.createTextNode(event.description);
            label.append(checkbox, checkmark, textNode);
            taskList.appendChild(label);
        });
    }

    allTasksCheckbox.addEventListener('change', () => {
        document.querySelectorAll('input[name="task"]').forEach(checkbox => {
            checkbox.checked = allTasksCheckbox.checked;
        });
    });

    confirmBtn.addEventListener('click', () => {
        taskSelectionView.classList.add('hidden');
        itineraryView.classList.remove('hidden');
        updateEventsList();
        displayItinerary();
    });

    changePlanButton.addEventListener('click', () => {
        taskSelectionView.classList.remove('hidden');
        itineraryView.classList.add('hidden');
    });


    function updateEventsList() {
        const checkedTaskIndices = Array.from(document.querySelectorAll('input[name="task"]:checked'))
            .map(checkbox => parseInt(checkbox.getAttribute('data-index'), 10)); // Use data-index to store the event index

        const selectedEvents = checkedTaskIndices.map(index => allEvents[index]);

        displayItinerary(selectedEvents);
    }
    

    function displayItinerary(eventsToShow) {
        let content = '';
        eventsToShow.forEach((event, index) => {
            // Add event
            content += `
                <div class="event">
                    <div class="time">${event.time}</div>
                    <div class="description">${event.description}</div>
                </div>
            `;
            // Add trip between events, if it exists
            if (index < eventsToShow.length - 1) { // Ensure there's a next event
                const trip = tripsBetweenEvents[index]; // Assuming tripsBetweenEvents matches the eventsToShow structure
                if (trip) { // Check if there's a corresponding trip
                    content += `
                        <div class="trip">
                            <img class="transport-icon" src="./resources/images/transport.jpg">
                            <div class="travel-time">${trip.travelTime}</div>
                        </div>
                    `;
                }
            }
        });
        itinerarySection.innerHTML = content;
    }
    

    // Additional functionality for showing trip details and navigating through trips
    // isEvent, showTripDetails, viewRouteButton, nextTripButton, previousTripButton event listeners
    viewRouteButton.addEventListener('click', () => {
        let content = '';
        content += `
            <div class="route-description">
                <div class="map-container">
                    <img class="map-image" src="./resources/images/map1.jpg">
                </div>
                <div class="trip-details">
                    <img class="trip-details-image" src="./resources/images/tripDetails1.jpg">
                </div>
            </div>
    
        `;
        routeDetailsSection.innerHTML = content;
    });

    generateTaskCheckboxes();
});
