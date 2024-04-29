import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { InstallCodemirro } from "codemirror-editor-vue3"

const app = createApp(App);

app.config.errorHandler = (err, vm, info) => {
  console.error("111 Error:", err);
  console.error("111 Vue component:", vm);
  console.error("111 Additional info:", info);
};

app.use(InstallCodemirro);
app.mount("#app");