import firebaseConfig from './models/firebaseConfig.js';
import tasksService from './service/tasksService.js'

const getCurrentUserId = () => {
    return localStorage.getItem('userId');
}

document.addEventListener('DOMContentLoaded', () => {
    const viewRouteButton = document.getElementById('view-route');
    const changePlanButton = document.getElementById('change-plan');
    const itinerarySection = document.getElementById('itinerary');
    const confirmBtn = document.getElementById('confirm-btn');
    const taskSelectionView = document.getElementById('task-selection-view');
    const itineraryView = document.getElementById('itinerary-view');
    const allTasksCheckbox = document.getElementById('allTask');
    const routeDetailsSection = document.getElementById('route-details');

    let currentTripIndex = 0;
    let items = [];
    let allEvents;
    let selectedEvents = [];
    let tripsBetweenEvents = [];

    // Retrieve tasks from database
    
    tasksService.getAllTasks().then(fetchedItems => {
        const uid = getCurrentUserId();
        items = fetchedItems.filter(item => item.userID === uid);
    
        allEvents = items.map(item => {
            return {
                time: `${item.startDT} to ${item.endDT}`,
                title: item.title, 
                location: item.location
            };
        });
    
        generateTaskCheckboxes(allEvents);
    });
    
    

    function generateTaskCheckboxes(events) {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = ''; 
        events.forEach((event, index) => {
            const label = document.createElement('label');
            label.className = 'task-checkbox';
    
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `task-${index}`;
            checkbox.name = 'task';
            checkbox.setAttribute('data-index', index);
    
            checkbox.addEventListener('change', updateMasterCheckbox);
    
            const checkmark = document.createElement('span');
            checkmark.className = 'checkmark';
    
            const textNode = document.createTextNode(event.title);
            label.append(checkbox, checkmark, textNode);
            taskList.appendChild(label);
        });
    }

    function updateMasterCheckbox() {
        const allCheckboxes = document.querySelectorAll('#taskList input[type="checkbox"][name="task"]');
        const selectedCheckboxes = document.querySelectorAll('#taskList input[type="checkbox"][name="task"]:checked');
        document.getElementById('allTask').checked = allCheckboxes.length === selectedCheckboxes.length;
    }

    allTasksCheckbox.addEventListener('change', function() {
        document.querySelectorAll('#taskList input[type="checkbox"][name="task"]').forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    confirmBtn.addEventListener('click', () => {
        updateEventsList();
        console.log('Confirmed events:', selectedEvents);
        if (selectedEvents.length >= 2) {
            updateTravelTimes();
            taskSelectionView.classList.add('hidden');
            itineraryView.classList.remove('hidden');
            displayItinerary(selectedEvents);
        } else {
            // If there are less than two selected events, alert the user
            alert("Please select at least two events to plan your route.");
        }
    });

    changePlanButton.addEventListener('click', () => {
        taskSelectionView.classList.remove('hidden');
        itineraryView.classList.add('hidden');
        routeDetailsSection.innerHTML = '';
        document.getElementById('switch-route').innerHTML = '';
    });


    function updateEventsList() {
        const checkedTaskIndices = Array.from(document.querySelectorAll('input[name="task"]:checked'))
            .map(checkbox => parseInt(checkbox.getAttribute('data-index'), 10));
    
        selectedEvents = checkedTaskIndices.map(index => {
            if (allEvents && index < allEvents.length) {
                return allEvents[index];
            } else {
                console.error('Invalid index or allEvents not ready:', index);
                return null; 
            }
        }).filter(event => event !== null); // Filter out invalid entries
            
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
                    <div class="title">${event.title}</div>
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
            let routeContent = `
                <div class="route-description">
                    <div id="dynamicMapContainer" class="map-container"></div>
                    <div id="dynamicDirectionsPanel" class="directions-panel"></div>
            </div>
            `;
            routeDetailsSection.innerHTML = routeContent;
            
            if(selectedEvents.length > 2){
                let buttonContent = `
                <button id="previous-trip">PREVIOUS TRIP</button>
                <button id="next-trip">NEXT TRIP</button>
                `;
                document.getElementById('switch-route').innerHTML = buttonContent;
                document.getElementById('next-trip').addEventListener('click', () => {
                    if (currentTripIndex < selectedEvents.length - 2) {
                        currentTripIndex++;
                        updateMapForCurrentTrip();
                    }
                });
    
                document.getElementById('previous-trip').addEventListener('click', () => {
                    if (currentTripIndex > 0) {
                        currentTripIndex--;
                        updateMapForCurrentTrip();
                    }
                });
            }

            // Initialize the map for the first trip
            currentTripIndex = 0;
            updateMapForCurrentTrip();
        }
        refreshNavigationButtons();
    });

    function refreshNavigationButtons() {
        const hasPrevious = currentTripIndex > 0;
        const hasNext = currentTripIndex < selectedEvents.length - 2;
    
        // Dynamically set the disabled state or styling of the buttons
        // Assuming you've added the buttons to the switch-route div as in your original code
        let buttonContent = `
            <button id="previous-trip" ${!hasPrevious ? 'disabled' : ''}>PREVIOUS TRIP</button>
            <button id="next-trip" ${!hasNext ? 'disabled' : ''}>NEXT TRIP</button>`;
        document.getElementById('switch-route').innerHTML = buttonContent;
    
        attachNavigationButtonListeners();
    }
    
    function attachNavigationButtonListeners() {
        const nextTripButton = document.getElementById('next-trip');
        const previousTripButton = document.getElementById('previous-trip');
    
        nextTripButton.addEventListener('click', () => {
            if (currentTripIndex < selectedEvents.length - 2) {
                currentTripIndex++;
                updateMapForCurrentTrip();
            }
        });
    
        previousTripButton.addEventListener('click', () => {
            if (currentTripIndex > 0) {
                currentTripIndex--;
                updateMapForCurrentTrip();
            }
        });
    
        // Refresh button states after attaching listeners
        refreshNavigationButtons();
    }

    function updateMapForCurrentTrip() {
        if (selectedEvents.length > 1 && currentTripIndex < selectedEvents.length - 1) {
            const startLocation = selectedEvents[currentTripIndex].location;
            const endLocation = selectedEvents[currentTripIndex + 1].location;
            let departureTime = new Date(selectedEvents[currentTripIndex].time.split(" to ")[1]);
            initDynamicMap(startLocation, endLocation, departureTime);
        }
        refreshNavigationButtons();
    }
    
    function updateTravelTimes() {
        let routePromises = [];
        for (let i = 0; i < selectedEvents.length - 1; i++) {
            let startLocation = selectedEvents[i].location;
            let endLocation = selectedEvents[i + 1].location;
            let departureTime = new Date(selectedEvents[i].time.split(" to ")[1]);
            console.log('departure time is:', departureTime);
            
            let routePromise = new Promise((resolve) => {
                calculateRoute(startLocation, endLocation, departureTime, (travelTime) => {
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
    
    
    
    function calculateRoute(start, end, departureTime, callback) {
        console.log(`Requesting directions from ${start} to ${end} with departure at ${departureTime}`);
    
        const directionsService = new google.maps.DirectionsService();
        directionsService.route({
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.TRANSIT,
            transitOptions: {
                departureTime: departureTime,
            },
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
    
    

    function displayRoute(directionsRenderer, start, end, departureTime) {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route({
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.TRANSIT,

            transitOptions: {
                departureTime: departureTime,
            },

        }, (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
    

    function initDynamicMap(start, end, departureTime) {
        console.log('initDynamicMap called with:', start, end);
        const directionsPanel = document.getElementById("dynamicDirectionsPanel");
        directionsPanel.innerHTML = ''; // Clear existing directions
        const map = new google.maps.Map(document.getElementById("dynamicMapContainer"), {
            zoom: 12,
            center: { lat: 1.3483, lng: 103.6831 }, // Center map based on general Singapore area
            disableDefaultUI: true,
        });
        
        const directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map);
        directionsRenderer.setPanel(document.getElementById("dynamicDirectionsPanel"));
        displayRoute(directionsRenderer, start, end, departureTime);
    }
    
});
