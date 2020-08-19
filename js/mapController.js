
import { mapService } from './mapService.js'

var map;
var marker;


mapService.getLocs()
    .then(locs => console.log('locs', locs))


window.onload = () => {
    var lat = new URLSearchParams(window.location.href).get('lat')
    console.log("window.onload -> lat", window.location)
    var lng = new URLSearchParams(window.location.href).get('lng')
    console.log("window.onload -> lng", lng)
    if (lat === 'latitude' || lng === 'longitude') {
        lat = 32.0749831
        lng = 34.9120554
    }
    initMap(lat,lng)
        .then(() => {
            addMarker({ lat: +lat, lng: +lng });
            onMapClick();
            onMyLocationClick();
            renderLocationList()
            onCopyLocation()
            // onSearch();
        })
        .catch(console.log('INIT MAP ERROR'));

    getPosition()
        .then(pos => {
            console.log('User position is:', pos.coords);
        })
        .catch(err => {
            console.log('Cannot get user-position', err);
        })
}


function initMap(lat = 32.0749831, lng = 34.9120554) {
    return _connectGoogleApi()
        .then(() => {
            map = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
        })
}


function addMarker(loc) {
    // console.log('in add marker' ,loc);
    marker = new google.maps.Marker({
        position: loc,
        map: map,
        title: 'Hello World!'
    });
    return marker;
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng);
    map.panTo(laLatLng);
}

function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyD1ec5ZBq44fHgj80BHM1nri4zCteC8bRs';
    var elGoogleApi = document.createElement('script');
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    elGoogleApi.async = true;
    document.body.append(elGoogleApi);

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve;
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}


function onMapClick() {
    map.addListener('click', onGetPosition)

}


function onGetPosition(event) {
    openModal();
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    var elBtnSave = document.querySelector('.btn-save');
    elBtnSave.onclick = function () {
        var elLocationName = document.querySelector(".location-name").value;
        if (!elLocationName) return;
        var location = mapService.createLocation(lat, lng, elLocationName);
        marker.setMap(null);
        addMarker({ lat: location.lat, lng: location.lng });
        panTo(location.lat, location.lng);
        mapService.saveLocations(location);
        document.querySelector(".location-name").value = '';
        closeModal();
        renderLocationList();
    }
}


function openModal() {
    var elModal = document.querySelector('.modal');
    elModal.hidden = false;
}

function closeModal() {
    var elModal = document.querySelector('.modal');
    elModal.hidden = true;
}


document.querySelector('.btn').addEventListener('click', (ev) => {
    mapService.panTo(35.6895, 139.6917);
})

function getPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}


function renderLocationList() {
    var places = mapService.getPlaces();
    if (!places) return;
    //TODO: RENDER THE RELEVNAT DATA and add button go- pan the map in the position -MATAN
    var strHtmls = places.map(function (place) {
        return `<tr>
        <td class="cell">${place.id}</td>
        <td class="cell">${place.name}</td>
        <td class="cell">${place.lat.toFixed(2)} | ${place.lng.toFixed(2)}</td>
        <td class="cell"><button class="remove-btn">Delete</button></td>
        <td class="cell"><button class="go-btn">Go</button></td>
    </tr>`
    })
    document.querySelector('.locations-container tbody').innerHTML = strHtmls.join('')
}

// onclick="onRemove('${place.id}')

//TODO:CHECK IF WORKING -HILLA
function onRemove(placeId) {
    mapService.deletePlace(placeId);
    renderLocationList();
}


function onMyLocationClick() {
    var elBtnMyLocation = document.querySelector('.my-location-btn');
    elBtnMyLocation.addEventListener('click', getMyLocation);
}

function getMyLocation() {
    getPosition()
        .then(myLocation => {
            showLocation(myLocation)
            var pos = { lat: myLocation.coords.latitude, lng: myLocation.coords.longitude };
            //TODO: CHECK WHAT IS THE BUG -MATAN
            marker.setMap(null);
            addMarker(pos);
        })
}


function showLocation(position) {
    var date = new Date(position.timestamp);
    initMap(position.coords.latitude, position.coords.longitude);
}



// // TODO - HILLA
// Implement search: user enters an address (such as Tokyo) use the google
// Geocode API to turn it into cords (such as: {lat: 35.62, lng:139.79})
// pan the map and also add it as new location.

// function onSearch(){
//     var elBtnSearch = document.querySelector('.serach-btn');
//     elBtnSearch.addEventListener('click',
// }




//TODO -MATAN
// Create a ‘copy link’ button that saves a link to the clipboard. The link
// will be to your application (URL for GitHub pages) with the Lat and Lng
// params. When opening the link your proj should open a map showing the
// location according to the lat/lng from the query string parameters.
// a. This app should be deployed to github-pages, so the URL should be
// something like:
// https://github.io/me/travelTip/index.html?lat=3.14&lng=1.63
// b. When app loads it looks into the query string params and if there are
// lat/lng params (see here), it will display accordingly.


function onCopyLocation() {
    var elCopyLocationBtn = document.querySelector('.copy-btn');
    elCopyLocationBtn.addEventListener('click', copyLocation);
}
function copyLocation() {
    var places = mapService.getPlaces();
    if (!places) return;
    var copyText = `https://matancris.github.io/travelTip/index.html?lat=${places[places.length - 1].lat}&lng=${places[places.length - 1].lng}`
    navigator.clipboard.writeText(copyText)
        .then(() => {
            return copyText;
        }, function () {
            return 'failed';
        });
    // document.execCommand("copy")
}

function onGetCopiedLocation() {
    var lan = new URLSearchParams('lat=latitude&lng=longitude').get('lat')
    var lng = new URLSearchParams('lat=latitude&lng=longitude').get('lng')
}
