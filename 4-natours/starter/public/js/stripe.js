/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = window.Stripe(
  'pk_test_51O41GjDIcocosCLL6X15SvgugyDJMqJhdOMZBpS6IwBFReNfQFAclq4PIVDwWM9ov5SPgunguKHqdZmhIpDXxNNu00PmSabakQ'
);

export const bookTour = async tourId => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
