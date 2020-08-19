
export const mapService = {
    getLocs,
    saveLocations,
    getPlaces,
    deletePlace
}

const KEY_PLACES = 'places';
var gPlaces;

function saveLocations(place){
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

function getPlaces(){
    return gPlaces;
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


function removeFromStorage(key){
    localStorage.removeItem(key);
}