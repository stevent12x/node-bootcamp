/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm, role) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
        role
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'User Created Successfully!');
      window.setTimeout(() => {
        location.replace('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
