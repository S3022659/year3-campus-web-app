import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import { createAuth0 } from '@auth0/auth0-vue';

import App from './App.vue';
import { appConfig, buildAuth0Options } from './config/appConfig';

const app = createApp(App);

app.use(createAuth0(buildAuth0Options(appConfig)));

// Optionally provide the config to the app for injection where needed
app.provide('appConfig', appConfig);

app.use(createPinia());
app.use(router);

app.mount('#app');
