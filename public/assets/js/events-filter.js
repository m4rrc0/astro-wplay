const eventTypes = {
  festival: 'Festival',
  gameTime: 'Moment ludique',
  tournament: 'Tournoi',
  gamesMarket: 'Bouse aux jeux',
  training: 'Formation',
  pro: 'Événement professionnel',
  other: 'Autre'
};
const eventsForm = document.getElementById('eventsForm');
const resetBtn = document.getElementById('resetBtn');
const proximityBtn = document.getElementById('proximityBtn');
const eventTypeBtn = document.getElementById('eventTypeBtn');
const events = document.getElementsByClassName('card-event');
const dropdowns = document.getElementsByClassName('dropdown-content');
const eventsPhrase = document.getElementById('eventsPhrase');

// Ask for visitor position
let visitorPosition;
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition((pos) => visitorPosition = pos);
}

// Update form inputs with URL parameters
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.size > 0) {
  const form = document.forms['eventsForm'];
  for (const param of urlParams) {
    if (param[0] === 'types') {
      for (const type in document.forms['eventsForm'].elements[param[0]]) {
        if (document.forms['eventsForm'].elements[param[0]][type].id === param[1]) {
          document.forms['eventsForm'].elements[param[0]][type].checked = true;
        }
      }
    } else {
      form.elements[param[0]].value = param[1];
    }
  }
  filterEvents(eventsForm);
}

/**
 * Filter events in events page using the parameters in the form
 * @param {*} eventsForm 
 */
function filterEvents(eventsForm) {
  // Get the data from the form
  const data = new FormData(eventsForm);
  const filterParams = Array.from(data.entries());
  const positionFilter = filterParams.filter(([key,]) => key === 'position').map(([,value]) => value)[0];
  const distanceFilter = filterParams.filter(([key,]) => key === 'distance').map(([,value]) => value)[0];
  const typesFilter = filterParams.filter(([key,]) => key === 'types').map(([,value]) => value);
  
  // Update the current page URL
  window.history.replaceState(null, null, filterParams.reduce(
    (queryString, param, index) => {
      if (!param[1] || (param[0] === 'distance' && param[1] === '10')) {
        return queryString;
      }
      return queryString + param[0] + "=" + param[1] + (index === filterParams.length - 1 ? "" : "&")
    },
    "?"
  ));

  // Update the reset button display
  if (!!positionFilter || (!!typesFilter && typesFilter.length)) {
    resetBtn.style.display = 'initial';
  } else {
    resetBtn.style.display = 'none';
  }

  // Update the proximity button
  let coords;
  if (!!positionFilter) {
    proximityBtn.classList.add('color-palette-teal');
    proximityBtn.innerText = positionFilter;

    // Get the coordinates to check the distance
    if (positionFilter === 'Ma position') {
      coords = visitorPosition.coords;
    } else {
      coords = {
        latitude: document.getElementById('city' + positionFilter).dataset.latitude,
        longitude: document.getElementById('city' + positionFilter).dataset.longitude
      };
    }
  } else {
    proximityBtn.classList.remove('color-palette-teal');
    proximityBtn.innerText = 'A proximité de';
  }

  // Update the event type button
  if (!!typesFilter && typesFilter.length) {
    eventTypeBtn.classList.add('color-palette-teal');
    eventTypeBtn.innerText = typesFilter.map(typeFilter => eventTypes[typeFilter]).join(', ');
  } else {
    eventTypeBtn.classList.remove('color-palette-teal');
    eventTypeBtn.innerText = 'Types';
  }

  // Filter the events
  let eventsCount = 0;
  for (let i = 0; i < events.length; i++) {
    const eventCoords = {
      latitude: events[i].getElementsByClassName('zip')[0].dataset.latitude,
      longitude: events[i].getElementsByClassName('zip')[0].dataset.longitude
    };
    if (
      (positionFilter && (!eventCoords.latitude || distance(coords, eventCoords) > distanceFilter * 1000)) ||
      (typesFilter && typesFilter.length && (typesFilter.length > 1 || typesFilter[0] !== '') && !typesFilter.some(type => {
        if (events[i].dataset.types) {
          if (type === 'other') {
            return events[i].dataset.types.split(',').some(t => !['festival', 'gameTime', 'tournament', 'gamesMarket', 'training', 'pro'].includes(t))
          }
          return events[i].dataset.types.split(',').includes(type);
        }
        return false;
      })) 
    ) {
      events[i].style.display = 'none';
    } else {
      events[i].style.display = 'initial';
      eventsCount++;
    }
  }

  // Update the events phrase
  const splitedEventsPhrase = eventsPhrase.innerText.split('/');
  eventsPhrase.innerText = (eventsCount !== events.length ? eventsCount + '/' : '') + (splitedEventsPhrase.length > 1 ? splitedEventsPhrase[1] : splitedEventsPhrase[0]);
};

/**
 * Calculate the distance between 2 GPS coordinates
 * @param {*} coords1 
 * @param {*} coords2 
 * @returns 
 */
function distance(coords1, coords2) {
  const R = 6371e3; // metres
  const φ1 = coords1.latitude * Math.PI/180; // φ, λ in radians
  const φ2 = coords2.latitude * Math.PI/180;
  const Δφ = (coords2.latitude - coords1.latitude) * Math.PI/180;
  const Δλ = (coords2.longitude - coords1.longitude) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // in metres
};

/**
 * Close the dropdown menu if the user clicks outside of it
 * @param {*} event 
 */
function closeDropdowns(event) {
  if (!event.target.closest('.dropdown')) {
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};

eventsForm.onsubmit = (e) => e.preventDefault();
eventsForm.onchange = () => filterEvents(eventsForm);
resetBtn.onclick = (e) => {
  e.preventDefault();
  eventsForm.reset();
  filterEvents(eventsForm);
};

window.onclick = closeDropdowns;
