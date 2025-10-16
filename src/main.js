import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './services/firebase'

// Bootstrap for responsiveness
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

import '@fortawesome/fontawesome-free/css/all.min.css'

createApp(App).use(store).use(router).mount('#app')