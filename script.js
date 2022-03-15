'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//Using the Geolocation API
if(navigator.geolocation)
//the function .getCurrentPosition() accepts two callback functions. 1) THE FIRST one AKA the POSITION PARAMETER will be called when the browser successfully got the coordinates of the current position of the user 2) THE SECOND callback is the Error Callback which is the one that is gonna be called when there happened while getting the coordinates
  navigator.geolocation.getCurrentPosition(function(position){
    // console.log(position);
    const {latitude} = position.coords;
    const {longitude} = position.coords;
    // console.log(latitude,longitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude]
    //copied from the leaflet website
    const map = L.map('map').setView(coords, 13); // L is the namespace for Leaflet and we have access to it in this script because we have linked the leaflet script before ours and in that script L is basically a global variable inside the script of leaflet and L has a couple methods that we can use.  
    //second parameter is the zoom level, so 10 would be more zoomed out than 13 etc.

    //the map loads by tiles (one by one) and the appearance of the map can be customizable by themes... previously, the url was 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' and the map looked different
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker(coords).addTo(map)
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup();
    }, function(){
    alert('Could not get your position')
  });

//DISPLAYING A MAP USING LEAFLET LIBRARY

//whenever we use a third-party library, the first thing to do is to basically include it in our site

