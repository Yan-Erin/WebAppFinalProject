"use strict"

// Sends a new request to update the to-do list
function getEvent() {
    let xhr = new XMLHttpRequest()
    console.log("Refresh");
    xhr.onreadystatechange = function() {
        if (this.readyState !== 4) return
        updatePage(xhr)
    }

    xhr.open("GET", "/scottysnacc/events", true)
    xhr.send()
}

function updatePage(xhr) {
    if (xhr.status === 200) {
        let response = JSON.parse(xhr.responseText)
        updateEventList(response)
        return
    }

    if (xhr.status === 0) {
        displayError("Cannot connect to server")
        return
    }

    if (!xhr.getResponseHeader('content-type') === 'application/json') {
        displayError(`Received status = ${xhr.status}`)
        return
    }

    let response = JSON.parse(xhr.responseText)
    if (response.hasOwnProperty('error')) {
        displayError(response.error)
        return
    }

}

function updateError() {
}

function updateEventList(items) {
    // Removes all existing to-do list items
    let list = document.getElementById("event_block")
   
    // Adds each to do list item received from the server to the displayed list
    items["events"].forEach(item => {
     // Check if item already exists on the page
     let existingItem =  document.getElementById(`id_event-element_${item.id}`);

     if (existingItem == null) {
         //If not, add a new list item element
         let element = makeEventElement(item);
        //  element.dataset.id = item.id;
        //  list.prepend(element);
     }
    });
}
// Builds a new HTML "li" element for the to do list
function makeEventElement(item) {
    let details = `
        <div class="event" id="id_event-element_${item.id}">
            NEW EVENT ELEMENT
        </div>
    `
    let element = document.createElement("div")
    element.innerHTML = `${details}`

    return element
}

function addEvent(user_id) {
    let eventNameElement = document.getElementById(`id_name_input_text_${user_id}`)
    let eventNameValue = eventNameElement.value

    let buildingElement = document.getElementById(`id_building_location_input_text_${user_id}`)
    let buildingValue = buildingElement.value

    let geocoder = new google.maps.Geocoder();

    let lng;
    let lat;

    geocoder.geocode( {'address': buildingValue}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            lng = results[0].geometry.location.lng()
            lat = results[0].geometry.location.lat()
        }
    });

    let descriptionElement = document.getElementById()

    // Continue reading events from 

    eventNameElement.value = ''

    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return
        updatePage(xhr)
    }

    xhr.open("POST", `/scottysnacc/add-event`, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`event_name=${eventNameValue}&lng=${lng}&lat=${lat}&csrfmiddlewaretoken=${getCSRFToken()}`)
}

function makeNewEventBlock(user_id) {
    console.log("MAKE NEW EVENT BLOCK MADE")
    let elemet = document.getElementById("id_new_event")
    let details = `
        <div id="new-event-block">
            <h2>Add an Event</h2>
            <p> Fill out form to enter your event </p>
            <div class='event-form'>
                <label>Event Name</label>
                <input type="text" name="name"  id="id_name_input_text_${user_id}"/>

                <label>Building Location</label>
                <input type="text" name="building_location"  id="id_building_location_input_text_${user_id}"/>

                <label>Floor/Room Location</label>
                <input type="text" name="specific_location"  id="id_specific_location_input_text_${user_id}"/>

                <label>Start Time</label>
                <input type="text" name="start_time"  id="id_start_time_input_text_${user_id}"/>

                <label>End Time</label>
                <input type="text" name="end_time"  id="id_end_time_input_text_${user_id}"/>

                <label>Description</label>
                <input type="text" name="time"  id="id_description_input_text_${user_id}"/>

                <button onclick="addEvent(${user_id})">+</button>
            </div>
        </div>
    `
    let element= document.createElement("div");
    element.innerHTML = `${details}`;
    elemet.prepend(element);
    return null
}

function getCSRFToken() {
    let cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim()
        if (c.startsWith("csrftoken=")) {
            return c.substring("csrftoken=".length, c.length)
        }
    }
    return "unknown";
}