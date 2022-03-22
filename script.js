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

class Workout{
  //FIELDS:
  //the date when each object is created
  date = new Date();
  //in the real world, we usually don't create IDs on our own and always use some kind of library in order to create good and unique ID numbers, but we will create our own for now
  id = (Date.now() + '').slice(-10);

  constructor(coords,distance,duration){
    this.coords = coords; // [lat,lng]
    this.distance = distance; //in km
    this.duration = duration; // in min
  }
}

class Running extends Workout{
  constructor(coords,distance,duration,cadence){
    super(coords,distance,duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace(){
    //min/km
    this.pace = this.duration/this.distance;
    return this.pace;
  }
}

class Cycling extends Workout{
  constructor(coords,distance,duration,elevationGain){
    super(coords,distance,duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed(){
    //km/h
    this.speed = this.distance/(this.duration/60);//divide duration by 60 since it is by hours not minutes
    return this.speed; 
  }
}

//experiements
// const run1= new Running([39,-12],5.2,24,178);
// const cycling1= new Cycling([39,-12],27,95,523);

console.log(run1,cycling1);

////////////////////////////////////////////////////////////////////////////////////
//APPLICATION ARCHITECTURE
class App {
  #map;
  #mapEvent;
  constructor(){
    this._getPosition();
    //we need to bind the this keyword because the eventlister will point to form instead of the app object.
    form.addEventListener('submit', this._newWorkout.bind(this));
  
    inputType.addEventListener('change', this._toggleElevationField);  
  }

  _getPosition(){
    //Using the Geolocation API
    if(navigator.geolocation)
      //the function .getCurrentPosition() accepts two callback functions. 1) THE FIRST one AKA the POSITION PARAMETER will be called when the browser successfully got the coordinates of the current position of the user 2) THE SECOND callback is the Error Callback which is the one that is gonna be called when there happened while getting the coordinates
      //we have to manually bind the this keyword to whatever we need. bind() borrows a function and creates a copy... "this" keyword replaced with the object passed in as an argument
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
          alert('Could not get your position')
        });
  }
  _loadMap(position){
    // console.log(position);
    //STEP ONE OF FLOWCHART?
    const {latitude} = position.coords;
    const {longitude} = position.coords;
    // console.log(latitude,longitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    
    const coords = [latitude, longitude] 
    //DISPLAYING A MAP USING LEAFLET LIBRARY--STEP 2 OF FLOWCHART?

    //whenever we use a third-party library, the first thing to do is to basically include it in our site 

    //copied from the leaflet website
    this.#map = L.map('map').setView(coords, 13); // L is the namespace for Leaflet and we have access to it in this script because we have linked the leaflet script before ours and in that script L is basically a global variable inside the script of leaflet and L has a couple methods that we can use.  
    //second parameter is the zoom level, so 10 would be more zoomed out than 13 etc.

    //the map loads by tiles (one by one) and the appearance of the map can be customizable by themes... previously, the url was 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' and the map looked different


    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    //map.on() is not a method from JavaScript itself, but it comes from the leaflet library. So this map object is in fact an object that was generated by leaflet.
    //map.on() is similar to the standard built-in .addEventListener method.
    
    //Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  };
  _showForm(mapE){this.#mapEvent = mapE;
    form.classList.remove('hidden');
    //using the focus method makes it so that when we click on the map and the input form is revealed, the cursor will be focused on the Distance input field.
    //having the cursor focused on an input field adds for a better user experience as they will be able to immediately start typing.
    inputDistance.focus()}


  _toggleElevationField(){//closest selects the closest parent vs querySelector selects the child.
    //when one (Running or cycling) is visible, the other is hidden so we use the toggle method to either turn the hidden class on or off
    //The running type is hard coded in HTML while cycling is hidden. so when the change event happens, both Elevation and Cadence are toggled meaning the running type is hidden while the cycling is now visible.
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }


  _newWorkout(e){
    e.preventDefault() 
      //Clear input fields
      inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value ='';
  
  
      //display marker
       //this function has access to mapEvent because it is a global variable.
        const {lat, lng} = this.#mapEvent.latlng;
  
        //.marker() creates the marker
        //.addTo() adds the marker to the app
        //.bindPopup() create a pop up and bind it to the marker-- instead of inputting a simple string, you can also create a brand new popup object which will then contain a couple of options
        //.openPopup()
        L.marker([lat,lng]).addTo(this.#map)
        .bindPopup(L.popup({
          maxWidth:250,
          minWidth: 100,
          autoClose: false,
          closeOnClick:false,
          className: 'running-popup'
        }))
        .setPopupContent('Workout')
        .openPopup();
  }
}

const app = new App();
//app._getPosition(); //in order to trigger the geolocation API, this method needs to be called so that it method would get executed right at the point when the application loads and that is because we already know all the code thats in the top level scope(so outside of any function) will get executed immediately as the script loads....however it would be cleaner to have this method inside of the class. So it would be better to call this method inside of the constructor method since the constructor method will be executed as soon as the new app object is created. And the new app object is created immediately as the page loads so that would mean this _getPosition() method would load when the page loads as well.