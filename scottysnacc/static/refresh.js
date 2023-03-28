"use strict"
let map;
function initMap() {
    let CMU = {lat: 40.443336, lng: -79.944023};
    map = new google.maps.Map(
        document.getElementById('map'), {
            zoom: 15,
            center: CMU,
            disableDefaultUI: true,
        }
    )
}

function setUpSearch() {
    let building = document.getElementById("id_building_location_input_text");
    let options = {
        componentRestrictions: { country: "us" },
        fields: ["address_components"],
      };
    let autocomplete = new google.maps.places.Autocomplete(building, options);
}

function setUpDateTime() {
    $('#id_start_time_input_text').datetimepicker();
    $('#id_end_time_input_text').datetimepicker();
}

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
        updateEventList(response["events"])
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
//TODO
function displayError() {
}

function showSelectedEvent(event_id) {
    let eventElement = document.getElementById(`id_event_element_${event_id}`)
    console.log("HII")
}

function updateEventList(items) {
    // Removes all existing to-do list items
    let div = document.getElementById("event_block")
   
    // Adds each to do list item received from the server to the displayed list
    items.forEach(item => {
        // Check if item already exists on the page
        if (document.getElementById(`id_event_element_${item.id}`) == null) {
            //If not, add a new list item element
            div.prepend(makeEventElement(item))
            let location = {lat: Number(item.lat), lng: Number(item.lng)}
            let marker = new google.maps.Marker({position: location, map: map})
            marker.addListener("click", () => {
                let eventElement = document.getElementById(`id_event_element_${item.id}`).scrollIntoView()
            })
        }
    });
}
// Builds a new HTML "li" element for the to do list
function makeEventElement(item) {
    let startdate = new Date(`${item.startDate}`)
    startdate = startdate.toLocaleDateString('en-us') + " " + startdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    let enddate = new Date(`${item.endDate}`)
    enddate = enddate.toLocaleDateString('en-us') + " " + enddate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    let details = `
        <div class="event" id="id_event_element_${item.id}">
        <p> ${startdate} </p>
        </div>
    `
    let element = document.createElement("div")
    element.innerHTML = `${details}`

    return element
}

function addEvent() {
    let eventNameElement = document.getElementById("id_name_input_text")
    let eventNameValue = eventNameElement.value
    let buildingElement = document.getElementById("id_building_location_input_text")
    let buildingValue = buildingElement.value

    let geocoder = new google.maps.Geocoder();

    let lng = '';
    let lat = '';

    let descriptionElement = document.getElementById("id_description_input_text")
    let descriptionValue = descriptionElement.value

    let specLocationElement = document.getElementById("id_specific_location_input_text")
    let specLocationValue = specLocationElement.value

    let startTimeElement = document.getElementById("id_start_time_input_text")
    let startTimeValue = startTimeElement.value

    let endTimeElement = document.getElementById("id_end_time_input_text")
    let endTimeValue = endTimeElement.value

    let tagElement = document.getElementById("id_tag_input_text")
    let tagValue = tagElement.value

    eventNameElement.value = ''
    buildingElement.value = ''
    descriptionElement.value = ''
    specLocationElement.value = ''
    startTimeElement.value = ''
    endTimeElement.value = ''
    tagElement.value = ''

    geocoder.geocode( {'address': buildingValue}, function(results, status) {
        //TODO error handling
        if (status == google.maps.GeocoderStatus.OK) {
            console.log("GEOCODER SUCCESS")
            lng = String(results[0].geometry.location.lng())
            lat = String(results[0].geometry.location.lat())

            let xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) return
                updatePage(xhr)
            }
            xhr.open("POST", `/scottysnacc/add-event`, true)
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
            xhr.send(`event_name=${eventNameValue}&lng=${lng}&lat=${lat}&building=${buildingValue}&description=${descriptionValue}&specLocation=${specLocationValue}&start=${startTimeValue}&end=${endTimeValue}&tag=${tagValue}&csrfmiddlewaretoken=${getCSRFToken()}`)
            
        }
    });
}

function makeNewEventBlock() {
    console.log("MAKE NEW EVENT BLOCK MADE")
    let elemet = document.getElementById("id_new_event")
    let details = `
        <div id="new-event-block">
            <h2>Add an Event</h2>
            <p> Fill out form to enter your event </p>
            <div class='event-form'>
                <label>Event Name</label>
                <input type="text" name="name"  id="id_name_input_text"/>

                <label>Building Location</label>
                <input type="text" name="building_location"  id="id_building_location_input_text"/>

                <label>Floor/Room Location</label>
                <input type="text" name="specific_location"  id="id_specific_location_input_text"/>

                <label>Start Time</label>
                <input type="text" name="start_time"  id="id_start_time_input_text"/>

                <label>End Time</label>
                <input type="text" name="end_time"  id="id_end_time_input_text"/>

                <label>Description</label>
                <input type="text" name="description"  id="id_description_input_text"/>

                <label>Tags</label>
                <input type="text" name="tags"  id="id_tag_input_text"/>

                <button  onclick="addEvent()">+</button>
            </div>
        </div>
    `
    let element= document.createElement("div");
    element.innerHTML = `${details}`;
    elemet.prepend(element);
    setUpSearch();
    setUpDateTime();
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