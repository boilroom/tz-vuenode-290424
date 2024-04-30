import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { InstallCodemirro } from "codemirror-editor-vue3"

const app = createApp(App);

app.use(InstallCodemirro);
app.mount("#app");