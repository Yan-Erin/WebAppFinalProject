"use strict"
let map;
let autocomplete;
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
        fields: ["address_components", "name"],
      };
    autocomplete = new google.maps.places.Autocomplete(building, options);
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
        updateEventList(response['liked_events'], response["active_events"], response["inactive_events"])
        updateEventList(response['liked_events'], response["active_events"], response["inactive_events"])
        
        updateEventList(response['liked_events'], response["active_events"], response["inactive_events"])   
        
        return
    }

    if (xhr.status === 0) {
        displayError("Cannot connect to server", false)
        return
    }

    if (!xhr.getResponseHeader('content-type') === 'application/json') {
        displayError(`Received status = ${xhr.status}`, false)
        return
    }

    let response = JSON.parse(xhr.responseText)
    if (response.hasOwnProperty('error')) {
        displayError(response.error, false)
        return
    }

}

function displayError(message, isForm) {
    let errorElement
    if (isForm) {
        errorElement = document.getElementById("form_error")
    } else {
        errorElement = document.getElementById("update_error")
    }
    errorElement.innerHTML = message
}
//TODO
function showSelectedEvent(event_id) {
    let eventElement = document.getElementById(`id_event_element_${event_id}`)
}

function updateEventList(liked_items, active_items, inactive_items) {
    
    let div = document.getElementById("event_block")

    while (div.hasChildNodes()) {
        div.firstChild.remove();
    }

    function isItemLiked(item) {
        return liked_items.some(liked_item => liked_item.id === item.id);
    }

    while (div.hasChildNodes()) {
        div.firstChild.remove()
    }
    //TODO STYLING FOR PAST EVENTS
    inactive_items.forEach(item => {
        div.prepend(makeEventElement(item), isItemLiked(item))
        let location = {lat: Number(item.lat), lng: Number(item.lng)}
        let marker = new google.maps.Marker({position: location, map: map})
        marker.addListener("click", () => {
            let eventElement = document.getElementById(`id_event_element_${item.id}`).scrollIntoView()
        })
    })

    active_items.forEach(item => {
        div.prepend(makeEventElement(item), isItemLiked(item))
        let location = {lat: Number(item.lat), lng: Number(item.lng)}
        let marker = new google.maps.Marker({position: location, map: map})
        marker.addListener("click", () => {
            let eventElement = document.getElementById(`id_event_element_${item.id}`).scrollIntoView()
        })
    })

    liked_items.forEach(item => {
        div.prepend(makeEventElement(item), true)
        let location = {lat: Number(item.lat), lng: Number(item.lng)}
        let marker = new google.maps.Marker({position: location, map: map})
        marker.addListener("click", () => {
            let eventElement = document.getElementById(`id_event_element_${item.id}`).scrollIntoView()
        })
    })
}
// Builds a new HTML "li" element for the to do list
function makeEventElement(item, liked) {
    let startdate = new Date(`${item.startDate}`)
    startdate = startdate.toLocaleDateString('en-us') + " " + startdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    let enddate = new Date(`${item.endDate}`)
    enddate = enddate.toLocaleDateString('en-us') + " " + enddate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    let deleteButton
    if (item.user == current_user) {
        deleteButton = `<button type="button" class="btn delete_button" id="id_event_delete_${item.id}" onclick="deleteEvent(${item.id})">X</button>`
    } else {
        deleteButton = "<button style='visibility: hidden'>X</button> "
    }

    let likeButton

    if (liked) {
        likeButton = `<button type="button" class="btn like_button" id="id_event_like_${item.id}" onclick="unlikeEvent(${item.id})">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
</svg>  ${item.likeCount}</button>`
    } else {
        likeButton = `<button type="button" class=" btn like_button" id="id_event_like_${item.id}" onclick="likeEvent(${item.id})">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
</svg>  ${item.likeCount}</button>`
    }

    let details = `
        <div class="event" id="id_event_element_${item.id}">   
            ${deleteButton}<br>
            <p class="event-title">${item.name}</p>
            <p class="event-loc">${item.buildingName} ${item.specLocation}</p>
            <p class="event-start">${startdate} - ${enddate}</p>
            <p class="event-description"><u>Description:</u> ${item.description}</p>
            <p class="event-tags"><u>Tags:</u> ${item.tag.trim().split(" ").join(", ")}</p> 
            ${likeButton}
        </div>
    `

    let element = document.createElement("div")
    element.innerHTML = `${details}`

    return element
}

function deleteEvent(event_id) {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return
        updatePage(xhr)
    }

    xhr.open("POST", `/scottysnacc/delete-event/${event_id}`, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`csrfmiddlewaretoken=${getCSRFToken()}`)
}

function likeEvent(event_id) {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return
        if (xhr.status == 200) {
            // Change the button to "Unlike"
            let jsonResponse = JSON.parse(xhr.responseText);
            let like_count = jsonResponse.like_count[event_id];
            document.getElementById(`id_event_like_${event_id}`).innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
            </svg>  ${like_count}`;
            document.getElementById(`id_event_like_${event_id}`).onclick = function () { unlikeEvent(event_id); };

            // Update liked_events list
            liked_events.push(`id=${event_id},`);
        }
    }

    xhr.open("POST", `/scottysnacc/like-event/${event_id}`, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`csrfmiddlewaretoken=${getCSRFToken()}`)
}

function unlikeEvent(event_id) {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return
        updatePage(xhr)
        if (xhr.status == 200) {
            // Change the button to "like"
            let jsonResponse = JSON.parse(xhr.responseText);
            let like_count = jsonResponse.like_count[event_id];
            document.getElementById(`id_event_like_${event_id}`).innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
          </svg>  ${like_count}`;
            document.getElementById(`id_event_like_${event_id}`).onclick = function () { likeEvent(event_id); };

            // Update liked_events list
            liked_events.push(`id=${event_id},`);
        }
    }
    
    xhr.open("POST", `/scottysnacc/unlike-event/${event_id}`, true)
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    xhr.send(`csrfmiddlewaretoken=${getCSRFToken()}`)
}

function checkEventForm (context) {
    if (context["eventNameValue"] == "") {
        displayError("Please enter event name", true)
        return false;
    }
    if (context["buildingValue"] == "") {
        displayError("Please enter event location", true)
        return false;
    }
    if (context["startTimeValue"] == "") {
        displayError("Please enter event start time", true)
        return false;
    }
    if (context["endTimeValue"] == "") {
        displayError("Please enter event end time", true)
        return false;
    }
    let startDate = new Date(context["startTimeValue"])
    let endDate = new Date(context["endTimeValue"])

    if (startDate >= endDate) {
        displayError("Event start time cannot be later than end time", true)
        return false;
    }
    if (context["tags"] == "") {
        displayError("Please select event tags", true)
        return false;
    }

    return true;
}

function addEvent() {
    let eventNameElement = document.getElementById("id_name_input_text")
    let eventNameValue = eventNameElement.value

    
    let buildingElement = document.getElementById('id_building_location_input_text')
    let buildingAddr = buildingElement.value

    let buildingName = ""
    let place = autocomplete.getPlace();

    if (place != null) {   
        buildingName = place.name
    }
    else {
        displayError("Please select an event location from the recommended list", true)
        return
    }

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

    let tags = " "

    let allElement = document.getElementById("tag_all")
    if (allElement.checked) {
        tags += "All "
    }

    let undergradElement = document.getElementById("tag_undergrad")
    if (undergradElement.checked) {
        tags += "Undergraduate "
    }

    let graduateElement = document.getElementById("tag_graduate")
    if (graduateElement.checked) {
        tags += "Graduate "
    }

    let CFAElement = document.getElementById("tag_CFA")
    if (CFAElement.checked) {
        tags += "CFA "
    }

    let CITElement = document.getElementById("tag_CIT")
    if (CITElement.checked) {
        tags += "CIT "
    }

    let DCElement = document.getElementById("tag_DC")
    if (DCElement.checked) {
        tags += "DC "
    }

    let MCSElement = document.getElementById("tag_MCS")
    if (MCSElement.checked) {
        tags += "MCS "
    }

    let SCSElement = document.getElementById("tag_SCS")
    if (SCSElement.checked) {
        tags += "SCS "
    }

    let TPRElement = document.getElementById("tag_TPR")
    if (TPRElement.checked) {
        tags += "TPR "
    }

    let HNZElement = document.getElementById("tag_HNZ")
    if (HNZElement.checked) {
        tags += "HNZ "
    }

    var context = {"eventNameValue": eventNameValue,
               "buildingValue": buildingAddr,
               "startTimeValue": startTimeValue,
               "endTimeValue": endTimeValue,
               "tagValue": tags
            }

    if (checkEventForm(context)) {
        geocoder.geocode( {'address': buildingAddr}, function(results, status) {
            //TODO error handling
            if (status == google.maps.GeocoderStatus.OK) {
                var x = document.getElementById("new-event-block");
                x.style.display = "none";
                var btn = document.getElementById("new-event-btn")
                btn.style.display = "block";

                lng = String(results[0].geometry.location.lng())
                lat = String(results[0].geometry.location.lat())
    
                let xhr = new XMLHttpRequest()
                xhr.onreadystatechange = function() {
                    if (xhr.readyState !== 4) return
                    updatePage(xhr)
                }
    
                xhr.open("POST", `/scottysnacc/add-event`, true)
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
                xhr.send(`event_name=${eventNameValue}&lng=${lng}&lat=${lat}&buildingAddr=${buildingAddr}&buildingName=${buildingName}&description=${descriptionValue}&specLocation=${specLocationValue}&start=${startTimeValue}&end=${endTimeValue}&tag=${tags}&csrfmiddlewaretoken=${getCSRFToken()}`)
            }
            else {
                displayError("Cannot geocode the event location", true)
            }
        });
    }
}
function closeEvent() {
    var x = document.getElementById("new-event-block");
    var btn = document.getElementById("new-event-btn")
    if (x.style.display === "none") {
      x.style.display = "block";
      btn.style.display = "none";
    } else {
      x.style.display = "none";
      btn.style.display = "block";
    }
}

function makeNewEventBlock() {
    console.log("MAKE NEW EVENT BLOCK MADE")
    let elemet = document.getElementById("id_new_event")
    let details = `
        <div id="new-event-block">
            <div id="new-event-text">
            <div class='new-event-img'>
                <button class="close-btn" onclick="closeEvent()">x</button>
                <img  src="static/img/grid_small_round.svg" >
                <h2>Add an Event</h2>
                <p> Fill out form to enter your event </p>
            </div>
            
            <div class='form-group event-form'>
                <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-map" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.502.502 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103zM10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98 4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z"/>
                </svg>   Event Name</label>
                <input type="text" name="name"  class="form-control" id="id_name_input_text"/>
                <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt" viewBox="0 0 16 16">
                <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                </svg>  Building Location</label>
                <input type="text" name="building_location" class="form-control" id="id_building_location_input_text"/>

                <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.319 1.319 0 0 0-.37.265.301.301 0 0 0-.057.09V14l.002.008a.147.147 0 0 0 .016.033.617.617 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.619.619 0 0 0 .146-.15.148.148 0 0 0 .015-.033L12 14v-.004a.301.301 0 0 0-.057-.09 1.318 1.318 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465-1.281 0-2.462-.172-3.34-.465-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411z"/>
                </svg>  Floor/Room Location</label>
                <input type="text" name="specific_location" class="form-control" id="id_specific_location_input_text"/>

                <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                </svg>  Start Time</label>
                <input type="text" name="start_time" class="form-control" id="id_start_time_input_text"/>

                <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                </svg>  End Time</label>
                <input type="text" name="end_time" class="form-control" id="id_end_time_input_text"/>

                <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-newspaper" viewBox="0 0 16 16">
                <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5v-11zM12 14c.37 0 .654-.211.853-.441.092-.106.147-.279.147-.531V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5H12z"/>
                <path d="M2 3h10v2H2V3zm0 3h4v3H2V6zm0 4h4v1H2v-1zm0 2h4v1H2v-1zm5-6h2v1H7V6zm3 0h2v1h-2V6zM7 8h2v1H7V8zm3 0h2v1h-2V8zm-3 2h2v1H7v-1zm3 0h2v1h-2v-1zm-3 2h2v1H7v-1zm3 0h2v1h-2v-1z"/>
                </svg>  Description</label>
                <input type="text" name="description" class="form-control" id="id_description_input_text"/>

                <label><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tag" viewBox="0 0 16 16">
                <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z"/>
                <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z"/>
                </svg>  Tags</label><br>
                <input type="checkbox" name="tags" id="tag_all"> All 
                <input type="checkbox" name="tags" id="tag_undergrad"> Undergraduate 
                <input type="checkbox" name="tags" id="tag_graduate"> Graduate <br>
                <input type="checkbox" name="tags" id="tag_CFA"> CFA 
                <input type="checkbox" name="tags" id="tag_CIT"> CIT 
                <input type="checkbox" name="tags" id="tag_DC"> DC 
                <input type="checkbox" name="tags" id="tag_MCS"> MCS 
                <input type="checkbox" name="tags" id="tag_SCS"> SCS 
                <input type="checkbox" name="tags" id="tag_TPR"> TPR 
                <input type="checkbox" name="tags" id="tag_HNZ"> HNZ <br>
                <div id="form_error"></div>
                <button  id='event-submit' class='btn-default' onclick="addEvent()">Submit</button>
            </div>
            </div>
        </div>
    `
    let element= document.createElement("div");
    element.innerHTML = `${details}`;
    elemet.prepend(element);
    setUpSearch();
    setUpDateTime();
    var btn = document.getElementById("new-event-btn")
    btn.style.display = "none";
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