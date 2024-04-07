

const getCurrentUserId = () => {
    return localStorage.getItem('userId');
}

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
    let items = [];
    const uid = getCurrentUserId();
    const userTasks = items.filter(item => item.userID === uid);
    const allEvents = userTasks.map(item => {
        return {
            time: `${item.startDT} to ${item.endDT}`,
            description: item.description, 
            location: item.location
        };
    });

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
            content += `
                <div class="event">
                    <div class="time">${event.time}</div>
                    <div class="description">${event.description}</div>
                </div>
            `;

            if (index < eventsToShow.length - 1) {
                const trip = tripsBetweenEvents[index];
                if (trip) {
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
        // Create a container for the map and directions panel
        let content = `
            <div class="route-description">
                <div id="dynamicMapContainer" class="map-container" style="width: 600px; height: 450px;"></div>
                <div id="dynamicDirectionsPanel" class="directions-panel"></div>
            </div>
        `;
        routeDetailsSection.innerHTML = content;
    
        // Now, initialize the map and directions renderer
        initDynamicMap();
    });
    
    function initDynamicMap() {
    const map = new google.maps.Map(document.getElementById("dynamicMapContainer"), {
        zoom: 12, // Adjust zoom level as needed for best view
        center: { lat: 1.3483, lng: 103.6831 }, // Center map based on general Singapore area or specific route
        disableDefaultUI: true,
    });
    
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById("dynamicDirectionsPanel"));

    const start = 'Nanyang Technological University, Singapore';
    const end = 'Changi Airport, Singapore';
    calculateAndDisplayRoute(directionsRenderer, start, end);
}

    
    function calculateAndDisplayRoute(directionsRenderer, start, end) {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route({
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
        }, (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
    

    generateTaskCheckboxes();
});
