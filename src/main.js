import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import firebase from "firebase/app";

Vue.config.productionTip = false;

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCiYobfnaRfLHnjrFLFRaryc9FVL6_ODhc",
    authDomain: "vue-slack-clone-679fe.firebaseapp.com",
    databaseURL: "https://vue-slack-clone-679fe.firebaseio.com",
    projectId: "vue-slack-clone-679fe",
    storageBucket: "vue-slack-clone-679fe.appspot.com",
    messagingSenderId: "1071991328741",
    appId: "1:1071991328741:web:7a85eca3fa2393412fe90c",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

window.firebase = firebase;

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount("#app");
