'use strict';


class Workout{
  //FIELDS:
  //the date when each object is created
  date = new Date();
  //in the real world, we usually don't create IDs on our own and always use some kind of library in order to create good and unique ID numbers, but we will create our own for now
  id = (Date.now() + '').slice(-10);
  clicks =0;

  constructor(coords,distance,duration){
    this.coords = coords; // [lat,lng]
    this.distance = distance; //in km
    this.duration = duration; // in min
  }
  _setDescription(){
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
  click(){
    this.clicks++;
  }
}

class Running extends Workout{
  type = 'running';
  constructor(coords,distance,duration,cadence){
    super(coords,distance,duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace(){
    //min/km
    this.pace = this.duration/this.distance;
    return this.pace;
  }
}

class Cycling extends Workout{
  type = 'cycling';
  constructor(coords,distance,duration,elevationGain){
    super(coords,distance,duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
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


////////////////////////////////////////////////////////////////////////////////////
//APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapZoomLevel=13;
  #mapEvent;
  #workouts = [];

  constructor(){
    //GET USER'S POSITION
    this._getPosition();

    //GET DATA FROM LOCAL STORAGE
    this._getLocalStorage();

    //ATTACH EVENT HANDLERS
    //we need to bind the this keyword because the eventlister will point to form instead of the app object.
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);  
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
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
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    
    const coords = [latitude, longitude] 
    //DISPLAYING A MAP USING LEAFLET LIBRARY--STEP 2 OF FLOWCHART?

    //whenever we use a third-party library, the first thing to do is to basically include it in our site 

    //copied from the leaflet website
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel); // L is the namespace for Leaflet and we have access to it in this script because we have linked the leaflet script before ours and in that script L is basically a global variable inside the script of leaflet and L has a couple methods that we can use.  
    //second parameter is the zoom level, so 10 would be more zoomed out than 13 etc.

    //the map loads by tiles (one by one) and the appearance of the map can be customizable by themes... previously, the url was 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' and the map looked different


    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    //map.on() is not a method from JavaScript itself, but it comes from the leaflet library. So this map object is in fact an object that was generated by leaflet.
    //map.on() is similar to the standard built-in .addEventListener method.
    
    //Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    //render the markers
    this.#workouts.forEach(work=>{
      this._renderWorkoutMarker(work);
    });
  };
  _showForm(mapE){this.#mapEvent = mapE;
    form.classList.remove('hidden');
    //using the focus method makes it so that when we click on the map and the input form is revealed, the cursor will be focused on the Distance input field.
    //having the cursor focused on an input field adds for a better user experience as they will be able to immediately start typing.
    inputDistance.focus()}

  _hideForm(){
    //Empty inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value ='';

    
    form.style.display = 'none';//for animation when form is hidden
    form.classList.add('hidden');
    setTimeout(()=>form.style.display = 'grid',1000);//for animation when form is hidden
  }

  _toggleElevationField(){//closest selects the closest parent vs querySelector selects the child.
    //when one (Running or cycling) is visible, the other is hidden so we use the toggle method to either turn the hidden class on or off
    //The running type is hard coded in HTML while cycling is hidden. so when the change event happens, both Elevation and Cadence are toggled meaning the running type is hidden while the cycling is now visible.
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }


  _newWorkout(e){
    e.preventDefault()
    //HELPER FUNCTIONS
    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp)); //this will loop over the array  and then each of them will check whether the number is finite or not and in the end the every method will only return true if this value here was true for all of them.

    const allPositive = (...inputs)=> inputs.every(inp =>inp > 0)

    //GET DATA FROM FORM///////////////
    const type = inputType.value;
    const distance = +inputDistance.value;// plus converts the string to a number
    const duration = +inputDuration.value;
    const {lat, lng} = this.#mapEvent.latlng;
    let workout;

    //IF WORKOUT IS RUNNING, CREATE RUNNING OBJECT///////////////
    if(type === 'running'){
      const cadence = +inputCadence.value
      //CHECK IF DATA IS VALID///////////////
      if(
        // !Number.isFinite(distance) || !Number.isFinite(duration)|| !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) || !allPositive(distance,duration,cadence)
      ) 
      return alert('Inputs have to be positive numbers')

      workout = new Running([lat,lng], distance, duration, cadence);
    }

    //IF WORKOUT IS CYCLING, CREATE CYCLING OBJECT///////////////
    if(type === 'cycling'){
      const elevation = +inputElevation.value
        //CHECK IF DATA IS VALID///////////////
        if(
          !validInputs(distance, duration, elevation) || !allPositive(distance,duration)
        ) 
        return alert('Inputs have to be positive numbers')

        workout = new Cycling([lat,lng], distance, duration, elevation);
    }
    //ADD NEW OBJECT TO WORKOUT ARRAY///////////////
    this.#workouts.push(workout);
    // console.log(workout);


    //RENDER WORKOUT ON MAP AS MARKER///////////////
    this._renderWorkoutMarker(workout)
    //RENDER WORKOUT ON LIST///////////////
    this._renderWorkout(workout);

    //HIDE FORM AND CLEAR INPUT FIELDS///////////////
    this._hideForm();

    //Set local storage to all workouts
    this._setLocalStorage();
      
  }

  _renderWorkoutMarker(workout){
    //.marker() creates the marker
    //.addTo() adds the marker to the app
    //.bindPopup() create a pop up and bind it to the marker-- instead of inputting a simple string, you can also create a brand new popup object which will then contain a couple of options
    //.openPopup()
    L.marker(workout.coords).addTo(this.#map)
    .bindPopup(L.popup({
      maxWidth:250,
      minWidth: 100,
      autoClose: false,
      closeOnClick:false,
      className: `${workout.type}-popup`
    }))
    .setPopupContent(`${workout.type ==='running'? '🏃‍♂️':'🚴‍♀️'} ${workout.description}`)
    .openPopup();
  }

  _renderWorkout(workout){
    // console.log(workout.type)
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${workout.type ==='running'? '🏃‍♂️':'🚴‍♀️'}</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">min</span>
      </div>
    `;
    if(workout.type === 'running')
      html +=`
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">👣</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
    `;
    if(workout.type === 'cycling')
    html +=`
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain.toFixed(1)}</span>
      <span class="workout__unit">m</span>
    </div>
    `;

    form.insertAdjacentHTML('afterend',html);//this will basically add the new element at the end of the form.
  };

  _moveToPopup(e){
    const workoutEl = e.target.closest('.workout');//selecting the workout element
    // console.log(workoutEl);

    //ignore null with guard clause
    if(!workoutEl) return;

    //finding the workout within the workout array
    const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
    // console.log(workout);

    //moving the map to the coords of the workout clicked on
    this.#map.setView(workout.coords, this.#mapZoomLevel,{
      animate: true,//read documentation if you want to see all of your options for this method
      pan:{
        duration:1
      }
    });
    //using the public interface
    // workout.click();
  }
  _setLocalStorage(){
    //We will use the local storage API which is an API that the browser provides for us
    //local storage is a simple key value store..so needs a key and a value
    //JSON.stringify() converts any object in javascript to a string
    //local storage is only used for small amounts of data because storing large amount of data in local storage will slow down the application.
    localStorage.setItem('workouts', JSON.stringify(this.#workouts))
  }
  _getLocalStorage(){
    const data = JSON.parse(localStorage.getItem('workouts'));//converts the strings to objects
    //a problem will arise with the click counter now since we converted the workout objects to strings and back again and are now just regular objects and not created from the running or cycling class so the objects will not inherit any of their methods. There is a way to restore it, however it is a lot of work so we will disable the click function as it was only set to show a problem with using local storage.
    // console.log(data);

    if(!data) return;

    this.#workouts = data;
    this.#workouts.forEach(work =>{
      this._renderWorkout(work);
      // this._renderWorkoutMarker(work)-----this doesn't work since _renderWorkoutMarker is executed immediately after the page loads so its trying to render the workout marker before the map is even loaded
    }); //we use forEach since it doesn't return a new array
  }
  reset(){
    localStorage.removeItem('workouts');
    location.reload();//location is basically a big object that contains a lot of methods and properties in the browser and one of those methods is the ability to reload the page.

    //go to the console and type in app.reset() and all the workouts will be deleted.
  }
}

const app = new App();
//app._getPosition(); //in order to trigger the geolocation API, this method needs to be called so that it method would get executed right at the point when the application loads and that is because we already know all the code thats in the top level scope(so outside of any function) will get executed immediately as the script loads....however it would be cleaner to have this method inside of the class. So it would be better to call this method inside of the constructor method since the constructor method will be executed as soon as the new app object is created. And the new app object is created immediately as the page loads so that would mean this _getPosition() method would load when the page loads as well.