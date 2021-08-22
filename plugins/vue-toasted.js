import Vue from 'vue'
import Toasted from 'vue-toasted';

Vue.use(Toasted, {
  className: 'toast',
  duration: 5000,
  position: 'bottom-right',
});
