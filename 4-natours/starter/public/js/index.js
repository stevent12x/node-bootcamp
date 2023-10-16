/* eslint-disable */
import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './mapbox';

// DOM elements
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form');

// Delegation
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    e.preventDefault();
    login(email, password);
  });
}
