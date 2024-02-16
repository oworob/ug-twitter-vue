import { createApp } from 'vue'
import App from './App.vue'
import router from './Router.js'
import store from './DataStore.js'

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
