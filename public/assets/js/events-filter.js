let visitorPosition;
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((pos) => visitorPosition = pos);
}
const eventsForm = document.getElementById('eventsForm');
eventsForm.addEventListener('submit', (e) => e.preventDefault());
eventsForm.addEventListener('change', () => {
  const data = new FormData(eventsForm);
  const filterParams = Array.from(data.entries());
  const positionFilter = filterParams.filter(([key,]) => key === 'position').map(([,value]) => value)[0];
  const distanceFilter = filterParams.filter(([key,]) => key === 'distance').map(([,value]) => value)[0];

  let coords;
  if (positionFilter === 'me') {
    coords = visitorPosition.coords;
  } else if (!!positionFilter) {
    coords = {
      latitude: document.getElementById('city' + positionFilter).dataset.latitude,
      longitude: document.getElementById('city' + positionFilter).dataset.longitude
    };
  }
  const events = document.getElementsByClassName('card-event');

  for (let i = 0; i < events.length; i++) {
    const eventCoords = {
      latitude: events[i].getElementsByClassName('zip')[0].dataset.latitude,
      longitude: events[i].getElementsByClassName('zip')[0].dataset.longitude
    };
    if (
      (positionFilter && distance(coords, eventCoords) > distanceFilter * 1000)
    ) {
      events[i].style.display = 'none';
    } else {
      events[i].style.display = 'initial';
    }
  }
});

const distance = (coords1, coords2) => {
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

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.closest('.dropdown')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
