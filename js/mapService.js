
export const mapService = {
    getLocs,
    saveLocations,
    getPlaces,
    deletePlace,
    makeId,
    removeFromStorage,
    createLocation
}

const KEY_PLACES = 'places';
var gPlaces;
var p = [{
    id: 111,
    name: 'Hila',
    lat: 32,
    lng: 32
}]
function saveLocations(place) {
    var places = loadFromStorage(KEY_PLACES);
    if (!places) places = [];
    places.push(place);
    gPlaces = places;
    saveToStorage(KEY_PLACES, places);
    console.log(gPlaces);
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
    // var places = loadFromStorage(KEY_PLACES);
    // if (!places) places = []
    return p;
}

function updatePlaces(pos) {
    console.log("updatePlaces -> pos", pos)
    p.push(createPlace(pos))
}

function createPlace(pos) {
    let place = {
        id: 111,
        name: 'Hila',
        lat: pos.lat,
        lng: pos.lng
    }
    console.log(place);
    return place;

}


//TODO: check if working 
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


function removeFromStorage(key) {
    localStorage.removeItem(key);
}


function makeId(length=5) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(var i=0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}

function createLocation(lat,lng,name){
    return {
        id: mapService.makeId(),
            name,
            lat,
            lng,
            createdAt: Date.now()
    }
}
