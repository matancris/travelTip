
export const mapService = {
    getLocs,
    saveLocations,
    getPlaces,
    deletePlace,
    makeId,
    createLocation,
    getGeocode,
    getWeather
}

const KEY_PLACES = 'places';
const API_KEY = 'AIzaSyD1ec5ZBq44fHgj80BHM1nri4zCteC8bRs';
const API_KEY_WEATHER = '4c4c9086df5dd45af57429240b91bbdf'
var gPlaces;

function saveLocations(place) {
    var places = loadFromStorage(KEY_PLACES);
    if (!places) places = [];
    places.push(place);
    gPlaces = places;
    saveToStorage(KEY_PLACES, places);
}

var locs = [{ lat: 11.22, lng: 22.11 }]

function getLocs() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(locs);
        }, 2000)
    });
}

function getPlaces() {
    gPlaces = loadFromStorage(KEY_PLACES);
    return gPlaces;
}


function deletePlace(placeId) {
    var placeIdx = gPlaces.findIndex(function (place) {
        return placeId === place.id;
    })
    gPlaces.splice(placeIdx, 1);
    saveToStorage(KEY_PLACES, gPlaces);
}


function saveToStorage(key, val) {
    var str = JSON.stringify(val);
    localStorage.setItem(key, str)
}

function loadFromStorage(key) {
    var str = localStorage.getItem(key);
    var val = JSON.parse(str)
    return val;
}


function makeId(length = 5) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}

function createLocation(lat, lng, name) {
    return {
        id: mapService.makeId(),
        name,
        lat,
        lng,
        createdAt: Date.now()
    }
}


function getGeocode(place) {
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=${API_KEY}`)
        .then(res => res.data)
}



function getWeather(lat, lng){
    return axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&APPID=${API_KEY_WEATHER}`)
     .then(res =>res.data)
}