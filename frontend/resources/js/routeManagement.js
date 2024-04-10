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
    const mapView = document.getElementById('map-view'); 
    const allTasksCheckbox = document.getElementById('allTask');
    const directionsPanel = document.getElementById("dynamicDirectionsPanel");
    const dynamicMapContainer = document.getElementById("dynamicMapContainer");
    const backButton = document.getElementById('back-button');
    const switchRoute = document.getElementById('switch-route');
    const previousTripButton = document.getElementById('previous-trip');
    const nextTripButton = document.getElementById('next-trip');

    let currentTripIndex = 0;
    let items = [];
    let allEvents;
    let selectedEvents = [];
    let tripsBetweenEvents = [];


    // Retrieve tasks from database
    tasksService.getAllTasks().then(fetchedItems => {
        const uid = getCurrentUserId();
        const now = new Date(); // Get the current time
    
        items = fetchedItems.filter(item => {
            // Ensure the user ID matches and the current time is within the task's start and end times
            const startDT = new Date(item.startDT);
            const endDT = new Date(item.endDT);
            return item.userID === uid && now >= startDT && now <= endDT;
        });
    
        allEvents = items.map(item => {
            return {
                time: `${item.startDT} to ${item.endDT}`,
                title: item.title, 
                location: item.location
            };
        });
    
        generateTaskCheckboxes(allEvents);
    });
    
    const timepicker = (selector, eventIndex, isStartTime) => {
        flatpickr(selector, {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i", // Format adjusted to store only time
            allowInput: false,
            clickOpens: true,
            onChange: function(selectedDates, dateStr) {
                // Since dateStr is in "H:i" format, it only contains the time part
                if (isStartTime) {
                    // Update the start time for the event at eventIndex
                    allEvents[eventIndex].startTime = dateStr;
                } else {
                    // Update the end time for the event at eventIndex
                    allEvents[eventIndex].endTime = dateStr;
                }
            }
        });
    };
    
    

    function generateTaskCheckboxes(events) {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        events.forEach((event, index) => {
            // Container for the entire task item.
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
    
            // Label that acts as a clickable area for the checkbox.
            const label = document.createElement('label');
            label.className = 'task-checkbox';
            label.setAttribute('for', `task-${index}`);
    
            // Actual checkbox input.
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `task-${index}`;
            checkbox.name = 'task';
            checkbox.setAttribute('data-index', index);

            checkbox.addEventListener('change', updateMasterCheckbox);
    
            // Custom checkmark span.
            const checkmark = document.createElement('span');
            checkmark.className = 'checkmark';
    
            // Container for the text.
            const textFrame = document.createElement('div');
            textFrame.className = 'text-frame';
            const textNode = document.createTextNode(event.title);
            textFrame.appendChild(textNode);
    
            // Assemble the label with the checkbox and text frame.
            label.appendChild(checkbox);
            label.appendChild(checkmark);
            label.appendChild(textFrame);
    
            // Container for time selection placed directly within task-item.
            const timeSelectionContainer = document.createElement('div');
            timeSelectionContainer.className = 'time-selection-container';
            
            const startTimeLabel = document.createElement('div');
            startTimeLabel.textContent = 'Start Time:';
            startTimeLabel.className = 'input-instruction';

            // Start time input.
            const startTimeInput = document.createElement('input');
            startTimeInput.className = 'time-input';
            startTimeInput.id = `start-time-${index}`;
            
            const endTimeLabel = document.createElement('div');
            endTimeLabel.textContent = 'End Time:';
            endTimeLabel.className = 'input-instruction';

            // End time input.
            const endTimeInput = document.createElement('input');
            endTimeInput.className = 'time-input';
            endTimeInput.id = `end-time-${index}`;
    
            // Append time inputs to their container.
            timeSelectionContainer.appendChild(startTimeLabel);
            timeSelectionContainer.appendChild(startTimeInput);
            timeSelectionContainer.appendChild(endTimeLabel);
            timeSelectionContainer.appendChild(endTimeInput);
            
    
            // Append label and time selection container to taskItem.
            taskItem.appendChild(label);
            taskItem.appendChild(timeSelectionContainer);
    
            // Append the task item to the list.
            taskList.appendChild(taskItem);
    
            // Initialize Flatpickr on the time inputs.
            timepicker(`#start-time-${index}`, index, true); // Corrected to pass 'index' as 'eventIndex'
            timepicker(`#end-time-${index}`, index, false); // Corrected to pass 'index' as 'eventIndex'
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
        // First, ensure the selected events are up to date
        updateEventsList();
    
        // Check if each selected event has both start and end times set
        const allTimesSet = selectedEvents.every(event => 
            event.startTime && event.endTime
        );
        console.log('Start time for all tasks: ', selectedEvents.every.startTime);
    
        if (!allTimesSet) {
            window.alert("Please ensure all selected tasks have both start and end times set.");
            return; 
        }
    
        if (selectedEvents.length >= 2) {
            // If all times are set and there are at least two events, proceed with the process
            updateTravelTimes();
            taskSelectionView.classList.add('hidden');
            itineraryView.classList.remove('hidden');
            displayItinerary(selectedEvents);
        } else {
            // If there are less than two selected events, inform the user
            window.alert("Please select at least two events to plan your route.");
        }
    });
    
    

    changePlanButton.addEventListener('click', () => {
        taskSelectionView.classList.remove('hidden');
        itineraryView.classList.add('hidden');
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
    
        // Check if any of the selected events do not have a startTime defined
        const allStartTimesDefined = selectedEvents.every(event => event.startTime !== undefined && event.startTime !== '');
    
        if (!allStartTimesDefined) {
            return; // Prevent the function from proceeding further
        }
    
        // If all start times are defined, proceed to sort the selectedEvents array based on the start time
        selectedEvents.sort((a, b) => {
            const [hourA, minuteA] = a.startTime.split(':').map(Number);
            const [hourB, minuteB] = b.startTime.split(':').map(Number);
    
            // Convert times to minutes for comparison
            const minutesA = hourA * 60 + minuteA;
            const minutesB = hourB * 60 + minuteB;
    
            return minutesA - minutesB;
        });
    
        console.log('Updated selected events:', selectedEvents);
    }
    
    
    

    function displayItinerary(eventsToShow) {
        let content = '';
        content += `<div class = "table-header">
                        <div class = "todo-duration">Todo Duration</div>
                        <div class = "travel-time-display">Travel Time</div>
                        <div class = "todo">Todos</div>
                    </div>`
        eventsToShow.forEach((event, index) => {
            const timeRange = `${event.startTime} to ${event.endTime}`;
            content += `
                <div class="event">
                    <div class="time">${timeRange}</div>
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
                            <div class="dots">.............</div>
                            <img class="transport-icon" src="./resources/images/transport.jpg">
                            <div class="travel-time">${trip.travelTime}</div>
                            <div class="dots">.............</div>
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
        
        if (selectedEvents.length > 1) {
            itineraryView.classList.add('hidden');
            mapView.classList.remove('hidden');

            if(selectedEvents.length > 2){
                switchRoute.classList.remove('hidden');
                nextTripButton.addEventListener('click', () => {
                    if (currentTripIndex < selectedEvents.length - 1) {
                        currentTripIndex++;
                        updateMapForCurrentTrip();
                        refreshNavigationButtons();
                    }
                });
            
                previousTripButton.addEventListener('click', () => {
                    if (currentTripIndex > 0) {
                        currentTripIndex--;
                        updateMapForCurrentTrip();
                        refreshNavigationButtons();
                    }
                });
            }else{
                switchRoute.classList.add('hidden');
            }

            // Initialize the map for the first trip, add event listeners for new buttons, etc.
            // Make sure to use unique IDs or manage dynamically created elements appropriately.
            currentTripIndex = 0;
            updateMapForCurrentTrip();
        }
    });


    backButton.addEventListener('click', function() {
        mapView.classList.add('hidden'); // Hide the map view
        itineraryView.classList.remove('hidden'); // Show the itinerary view
    });
    

    function refreshNavigationButtons() {
        const hasPrevious = currentTripIndex > 0;
        const hasNext = currentTripIndex < selectedEvents.length - 2;
    
    
        // Enable or disable the "Previous Trip" button
        if (hasPrevious) {
            previousTripButton.disabled = false;
            previousTripButton.classList.remove("disabled"); 
        } else {
            previousTripButton.disabled = true;
            previousTripButton.classList.add("disabled");
        }
    
        // Enable or disable the "Next Trip" button
        if (hasNext) {
            nextTripButton.disabled = false;
            nextTripButton.classList.remove("disabled");
        } else {
            nextTripButton.disabled = true;
            nextTripButton.classList.add("disabled");
        }
    }
    

    function updateMapForCurrentTrip() {
        if (selectedEvents.length > 1 && currentTripIndex < selectedEvents.length - 1) {
            const startLocation = selectedEvents[currentTripIndex].location;
            const endLocation = selectedEvents[currentTripIndex + 1].location;
            // Today's date components
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth(); // Note: January is 0
            const day = today.getDate();

            // Extract hour and minute from endTime
            const [hour, minute] = selectedEvents[currentTripIndex].endTime.split(":").map(Number);

            // Combine today's date with the event's endTime
            let departureTime = new Date(year, month, day, hour, minute);

            console.log("Calculated departureTime is:", departureTime);

            initDynamicMap(startLocation, endLocation, departureTime);
            if(selectedEvents.length > 2) refreshNavigationButtons();
        }
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
        directionsPanel.innerHTML = ''; // Clear existing directions
        const map = new google.maps.Map(dynamicMapContainer, {
            zoom: 12,
            center: { lat: 1.3483, lng: 103.6831 }, // Center map based on general Singapore area
            disableDefaultUI: true,
        });
        
        const directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map);
        directionsRenderer.setPanel(directionsPanel);
        displayRoute(directionsRenderer, start, end, departureTime);
    }
    
});
