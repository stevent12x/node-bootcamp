/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.locations);
// console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1Ijoic3RldmVudDEyeCIsImEiOiJjbG5vbmg2anYwMWVhMmptd3NodnN3ODV3In0.SOsue2JqJI0UF_iTmZNkwA';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/stevent12x/clnrdtand00c301pahtxw2ydc',
  scrollZoom: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  const el = document.createElement('div');
  el.className = 'marker';

  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
