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

if(navigator.geolocation)
//the function .getCurrentPosition() accepts two callback functions. 1) THE FIRST one AKA the POSITION PARAMETER will be called when the browser successfully got the coordinates of the current position of the user 2) THE SECOND callback is the Error Callback which is the one that is gonna be called when there happened while getting the coordinates
  navigator.geolocation.getCurrentPosition(function(position){
    // console.log(position);
    const {latitude} = position.coords;
    const {longitude} = position.coords;
    // console.log(latitude,longitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`)
  }, function(){
    alert('Could not get your position')
  })