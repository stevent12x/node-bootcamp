/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// Type is 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:8000/api/v1/users/updateCurrentPassword'
        : 'http://localhost:8000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url: url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Updated!`);
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
