
import { mapService } from './mapService.js'

var map;
var marker;


mapService.getLocs()
    .then(locs => console.log('locs', locs))

window.onload = () => {
    var lat = new URLSearchParams(window.location.href).get('lat')
    var lng = new URLSearchParams(window.location.href).get('lng')
    if (!lat && !lng) {
        lat = 32.0749831
        lng = 34.9120554
    }
    initMap(+lat, +lng)
        .then(() => {
            addMarker({ lat: +lat, lng: +lng });
            renderLocationsList();
            mapService.getGeocode();
        })
        .then(() => {
            addEvenetListeners();
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

function addEvenetListeners() {
    onMapClick();
    onMyLocationClick();
    onCopyLocation();
    onSearch();
    onRemoveLocation();
}

function onMapClick() {
    map.addListener('click', onGetPosition);
}

function onGetPosition(event) {
    openModal();
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    goToLocation(lat, lng);
    var elBtnSave = document.querySelector('.btn-save');
    elBtnSave.onclick = function () {
        var elLocationName = document.querySelector(".location-name").value;
        if (!elLocationName) return;
        var location = mapService.createLocation(lat, lng, elLocationName);
        mapService.saveLocations(location);
        document.querySelector(".location-name").value = '';
        closeModal();
        renderLocationsList();
    }
}

function goToLocation(lat, lng) {
    marker.setMap(null);
    panTo(lat, lng);
    addMarker({ lat, lng });
    renderWeather(lat, lng);
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

function renderLocationsList() {
    var places = mapService.getPlaces();
    if (!places) return;
    var strHtmls = places.map(function (place) {
        return `<tr>
        <td class="cell">${place.id}</td>
        <td class="cell">${place.name}</td>
        <td class="cell">${place.lat.toFixed(2)} | ${place.lng.toFixed(2)}</td>
        <td class="cell cell-delete"><button data-id= "${place.id}" class="remove-btn">Delete</button></td>
        <td class="cell"><button data-lat= "${place.lat}" data-lng= "${place.lng}" class="go-btn">Go</button></td>
    </tr>`
    })
    document.querySelector('.locations-container tbody').innerHTML = strHtmls.join('');
    onRemoveLocation();
    onGo();
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
            marker.setMap(null);
            addMarker(pos);
        })
}


function showLocation(position) {
    var date = new Date(position.timestamp);
    initMap(position.coords.latitude, position.coords.longitude);
}


function onSearch() {
    var elBtnSearch = document.querySelector('.search-btn');
    elBtnSearch.addEventListener('click', searchPlace);
}

function searchPlace() {
    var elSearch = document.querySelector('.my-search').value;
    mapService.getGeocode(elSearch)
        .then(placeData => {
            var addressName = placeData.results[0].formatted_address;
            var lat = placeData.results[0].geometry.location['lat'];
            var lng = placeData.results[0].geometry.location['lng'];
            var location = mapService.createLocation(lat, lng, addressName);
            goToLocation(lat, lng);
            mapService.saveLocations(location);
            renderLocationsList();
            document.querySelector('.my-search').value = '';
        })
}

function onRemoveLocation() {
    var elBtns = document.querySelectorAll('.remove-btn');
    elBtns.forEach(btn => {
        btn.onclick = function (ev) {
            // if (!ev.target.dataset.id) return;
            const placeId = ev.target.dataset.id;
            mapService.deletePlace(placeId);
            renderLocationsList();
        }
    })
}

function onGo() {
    var elBtns = document.querySelectorAll('.go-btn');
    elBtns.forEach(btn => {
        btn.onclick = function (ev) {
            const placeLat = ev.target.dataset.lat;
            const placeLng = ev.target.dataset.lng;
            goToLocation(+placeLat, +placeLng)
        }
    })
}


function onCopyLocation() {
    var elCopyLocationBtn = document.querySelector('.copy-btn');
    elCopyLocationBtn.addEventListener('click', copyLocation);
}

function copyLocation() {
    var places = mapService.getPlaces();
    if (!places) return;
    var copyText = `https://matancris.github.io/travelTip/index.html?&lat=${places[places.length - 1].lat}&lng=${places[places.length - 1].lng}`
    navigator.clipboard.writeText(copyText)
        .then(() => {
            return copyText;
        }, function () {
            return 'failed';
        });
}


function renderWeather(lat, lng) {
    mapService.getWeather(lat, lng)
        .then(weatherTemp => console.log(weatherTemp));
        // <h2>Weather Today</h2>
        //             <h4>name</h4>
        //             <p>weather.description</p>
        //             <p>main:
        //                 feels_like: 298.55
        //                 humidity: 73
        //                 pressure: 1005
        //                 temp: 297.43
        //                 temp_max: 297.59
        //                 temp_min: 297.15</p>
}