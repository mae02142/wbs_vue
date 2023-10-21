import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/index';
import axios from 'axios'
import ganttastic from '@infectoone/vue-ganttastic'

const apiClient = axios.create({
  baseURL: 'http://localhost:8030',
  withCredentials: true,
  headers: {
    Accept: 'application/json;charset=utf-8',
    'Content-Type': 'application/json;charset=utf-8'
  }
});

const app = createApp(App);

// Provide the API client to all components
app.provide('$apiClient', apiClient);

app.use(router).use(ganttastic).use(store).mount('#app');
