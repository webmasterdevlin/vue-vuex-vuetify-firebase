import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import autoSize from "vue-textarea-autosize";
import store from "./store";
import firebase from "firebase/app";
import "firebase/firestore";
import router from "./router";

Vue.use(autoSize);

Vue.config.productionTip = false;

// Place here your own web app's Firebase configuration
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();

new Vue({
  store,
  vuetify,
  router,
  render: h => h(App)
}).$mount("#app");
