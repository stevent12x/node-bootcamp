/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';
import { signup } from './signup';

const $ = document.querySelector.bind(document);

// DOM elements
const mapbox = $('#map');
const loginForm = $('.form--login');
const logoutBtn = $('.nav__el--logout');
const userDataForm = $('.form-user-data');
const userPasswordForm = $('.form-user-password');
const userSignUpForm = $('.form-user-signup');

// Delegation
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    const email = $('#email').value;
    const password = $('#password').value;
    e.preventDefault();
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    const name = $('#name').value;
    const email = $('#email').value;
    e.preventDefault();
    updateSettings({ name, email }, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', e => {
    const passwordCurrent = $('#password-current').value;
    const password = $('#password').value;
    const passwordConfirm = $('#password-confirm').value;
    e.preventDefault();
    updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
  });
}

if (userSignUpForm) {
  userSignUpForm.addEventListener('submit', e => {
    const name = $('#name').value;
    const email = $('#email').value;
    const password = $('#password').value;
    const passwordConfirm = $('#passwordConfirm').value;
    e.preventDefault();
    signup(name, email, password, passwordConfirm);
  });
}
