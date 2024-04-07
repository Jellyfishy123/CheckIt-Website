

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
    let selectedEvents = [];
    let tripsBetweenEvents = [];
    const uid = getCurrentUserId();
    const userTasks = items.filter(item => item.userID === uid);
    
    const allEvents = userTasks.map(item => {
        return {
            time: `${item.startDT} to ${item.endDT}`,
            description: item.description, 
            location: item.location
        };
    });
    
    // allEvents initialzation for functionality testing purpose
    // const allEvents = [
    //     {
    //         time: "2024-04-03 12:00 to 2024-04-06 12:00",
    //         description: "task1",
    //         location: "1 HOUGANG STREET 91 HOUGANG 1 SINGAPORE 538692"
    //     },
    //     {
    //         time: "2024-04-06 12:00 to 2024-04-23 13:00",
    //         description: "picnic",
    //         location: "1 TAMAN SERASI BOTANIC GARDENS VIEW SINGAPORE 257717"
    //     },
    //     {
    //         time: "2024-04-03 12:00 to 2024-04-08 12:00",
    //         description: "task3",
    //         location: "50A LORONG H TELOK KURAU H RESIDENCES SINGAPORE 426049"
    //     }
    // ];

    

    function generateTaskCheckboxes() {
        taskList.innerHTML = ''; // Clear existing tasks
        allEvents.forEach((event, index) => {
            const label = document.createElement('label');
            label.className = 'task-checkbox';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `task-${index}`;
            checkbox.name = 'task';
            checkbox.setAttribute('data-index', index);

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
        updateEventsList();
        console.log('Confirmed events:', selectedEvents);
        updateTravelTimes();
        taskSelectionView.classList.add('hidden');
        itineraryView.classList.remove('hidden');
        displayItinerary(selectedEvents);
    });

    changePlanButton.addEventListener('click', () => {
        taskSelectionView.classList.remove('hidden');
        itineraryView.classList.add('hidden');
    });


    function updateEventsList() {
        const checkedTaskIndices = Array.from(document.querySelectorAll('input[name="task"]:checked'))
            .map(checkbox => parseInt(checkbox.getAttribute('data-index'), 10));
    
        selectedEvents = checkedTaskIndices.map(index => allEvents[index]);
    
        // Sort the selectedEvents array based on the start time
        selectedEvents.sort((a, b) => {
            // Extract the start times
            const startTimeA = new Date(a.time.split(" to ")[0]);
            const startTimeB = new Date(b.time.split(" to ")[0]);
    
            return startTimeA - startTimeB;
        });
    
        console.log('Updated selected events:', selectedEvents);
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
            console.log('events displayed');
            if (index < eventsToShow.length - 1) {
                const trip = tripsBetweenEvents[index];
                if (trip) {
                    console.log('display trips now');
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
    

    

    //Functionality for showing trip details and navigating through trips
    viewRouteButton.addEventListener('click', () => {
        console.log('View Route button clicked');
        console.log('Selected events:', selectedEvents);
        if (selectedEvents.length > 1) { // Ensure there are at least two events for a trip
            let content = `
                <div class="route-description">
                    <div id="dynamicMapContainer" class="map-container" style="width: 600px; height: 450px;"></div>
                    <div id="dynamicDirectionsPanel" class="directions-panel"></div>
                </div>
            `;
            routeDetailsSection.innerHTML = content;

            // Initialize the map for the first trip
            currentTripIndex = 0;
            updateMapForCurrentTrip();
        }
    });

    function updateMapForCurrentTrip() {
        if (selectedEvents.length > 1 && currentTripIndex < selectedEvents.length - 1) {
            const startLocation = selectedEvents[currentTripIndex].location;
            const endLocation = selectedEvents[currentTripIndex + 1].location;
            initDynamicMap(startLocation, endLocation);
        }
    }
    
    function updateTravelTimes() {
        let routePromises = [];
        for (let i = 0; i < selectedEvents.length - 1; i++) {
            let startLocation = selectedEvents[i].location;
            let endLocation = selectedEvents[i + 1].location;
            
            let routePromise = new Promise((resolve) => {
                calculateRoute(startLocation, endLocation, (travelTime) => {
                    if (travelTime !== null) {
                        const travelTimeInMinutes = Math.round(travelTime / 60);
                        tripsBetweenEvents[i] = { travelTime: `${travelTimeInMinutes} min` };
                    } else {
                        tripsBetweenEvents[i] = { travelTime: 'Unavailable' };
                    }
                    resolve();
                });
            });
            routePromises.push(routePromise);
        }
    
        Promise.all(routePromises).then(() => {
            console.log('All trips updated:', tripsBetweenEvents);
            // Now safe to call displayItinerary
            displayItinerary(selectedEvents);
        });
    }
    
    
    
    function calculateRoute(start, end, callback) {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route({
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.TRANSIT,
        }, (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                const totalTravelTime = response.routes[0].legs.reduce((total, leg) => total + leg.duration.value, 0);
                callback(totalTravelTime); 
            } else {
                console.error('Directions request failed due to ' + status);
                callback(null); 
            }
        });
    }
    

    function displayRoute(directionsRenderer, start, end) {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route({
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.TRANSIT,
        }, (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
    
    nextTripButton.addEventListener('click', () => {
        if (currentTripIndex < selectedEvents.length - 2) {
            currentTripIndex++;
            updateMapForCurrentTrip();
        }
    });
    
    previousTripButton.addEventListener('click', () => {
        if (currentTripIndex > 0) { // Check if previous trip exists
            currentTripIndex--;
            updateMapForCurrentTrip();
        }
    });

    function initDynamicMap(start, end) {
        console.log('initDynamicMap called with:', start, end); // Debug log
        const map = new google.maps.Map(document.getElementById("dynamicMapContainer"), {
            zoom: 12,
            center: { lat: 1.3483, lng: 103.6831 }, // Center map based on general Singapore area
            disableDefaultUI: true,
        });
        
        const directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map);
        directionsRenderer.setPanel(document.getElementById("dynamicDirectionsPanel"));

        displayRoute(directionsRenderer, start, end);
    }
    
    generateTaskCheckboxes();
});
