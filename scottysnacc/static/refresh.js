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
        updateEventList(response["active_events"], response["inactive_events"])
        
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

function updateEventList(active_items, inactive_items) {
    let div = document.getElementById("event_block")

    while (div.hasChildNodes()) {
        div.firstChild.remove()
    }
    //TODO STYLING FOR PAST EVENTS
    inactive_items.forEach(item => {
        div.prepend(makeEventElement(item))
        let location = {lat: Number(item.lat), lng: Number(item.lng)}
        let marker = new google.maps.Marker({position: location, map: map})
        marker.addListener("click", () => {
            let eventElement = document.getElementById(`id_event_element_${item.id}`).scrollIntoView()
        })
    })

    active_items.forEach(item => {
        div.prepend(makeEventElement(item))
        let location = {lat: Number(item.lat), lng: Number(item.lng)}
        let marker = new google.maps.Marker({position: location, map: map})
        marker.addListener("click", () => {
            let eventElement = document.getElementById(`id_event_element_${item.id}`).scrollIntoView()
        })
    })
}
// Builds a new HTML "li" element for the to do list
function makeEventElement(item) {
    let startdate = new Date(`${item.startDate}`)
    startdate = startdate.toLocaleDateString('en-us') + " " + startdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    let enddate = new Date(`${item.endDate}`)
    enddate = enddate.toLocaleDateString('en-us') + " " + enddate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    let details = `
        <div class="event" id="id_event_element_${item.id}">    
            <p class="event-title">${item.name}</p>
            <p class="event-loc">${item.building} ${item.specLocation}</p>
            <p class="event-start">${startdate} - ${enddate}</p>
            <p class="event-description">${item.description}</p>
            <p class="event-tags">${item.tag}</p>
        </div>
    `

    if (item.user == current_user) {
        details += `
        <button type="button" id="id_event_delete_${item.id}" onclick="deleteEvent(${item.id})">X</button>
        `
    }

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

// context = {"eventNameValue": eventNameValue,
//"buildingValue": buildingValue,
//"specLocationValue": specLocationValue,
//"startTimeValue": startTimeValue,
//"endTimeValue": endTimeElement
//}
function checkEventForm (context) {
    if (context["eventNameValue"] == "" || context["buildingValue"] == '' || context["specLocationValue"] == "") {
        console.log("1")
        return false;
    }
    if (context["startTimeValue"] == "" || context["endTimeValue"]== ""){
        console.log("2")
        return false;
    }
    return true;
}

function addEvent() {
    let eventNameElement = document.getElementById("id_name_input_text")
    let eventNameValue = eventNameElement.value

    let place = autocomplete.getPlace();

    let buildingValue = place.name;

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
    let allValue = allElement.value
    if (allValue == "on") {
        tags += "All "
    }

    let undergradElement = document.getElementById("tag_undergrad")
    let undergradValue = undergradElement.value
    if (undergradValue == "on") {
        tags += "Undergraduate "
    }

    let graduateElement = document.getElementById("tag_graduate")
    let graduateValue = graduateElement.value
    if (graduateValue == "on") {
        tags += "Graduate "
    }

    let CFAElement = document.getElementById("tag_CFA")
    let CFAValue = CFAElement.value
    if (CFAValue == "on") {
        tags += "CFA "
    }

    let CITElement = document.getElementById("tag_CIT")
    let CITValue = CITElement.value
    if (CITValue == "on") {
        tags += "CIT "
    }

    let DCElement = document.getElementById("tag_DC")
    let DCValue = DCElement.value
    if (DCValue == "on") {
        tags += "DC "
    }

    let MCSElement = document.getElementById("tag_MCS")
    let MCSValue = MCSElement.value
    if (MCSValue == "on") {
        tags += "MCS "
    }

    let SCSElement = document.getElementById("tag_SCS")
    let SCSValue = SCSElement.value
    if (SCSValue == "on") {
        tags += "SCS "
    }

    let TPRElement = document.getElementById("tag_TPR")
    let TPRValue = TPRElement.value
    if (TPRValue == "on") {
        tags += "TPR "
    }

    let HNZElement = document.getElementById("tag_HNZ")
    let HNZValue = HNZElement.value
    if (HNZValue == "on") {
        tags += "HNZ "
    }

    var context = {"eventNameValue": eventNameValue,
               "buildingValue": buildingValue,
               "specLocationValue": specLocationValue,
               "startTimeValue": startTimeValue,
               "endTimeValue": endTimeElement
            }
    if (checkEventForm(context)) {
        console.log("WORKED");
        var x = document.getElementById("new-event-block");
        x.style.display = "none";
        var btn = document.getElementById("new-event-btn")
        btn.style.display = "block";
    }

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
            xhr.send(`event_name=${eventNameValue}&lng=${lng}&lat=${lat}&building=${buildingValue}&description=${descriptionValue}&specLocation=${specLocationValue}&start=${startTimeValue}&end=${endTimeValue}&tag=${tags}&csrfmiddlewaretoken=${getCSRFToken()}`)
            
        }
    });
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