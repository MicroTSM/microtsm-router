import createVueMicroApp from "@microtsm/vue";
import "./style.css";
import App from "./App.vue";

export const { mount, unmount } = createVueMicroApp(App, {
  el: "#app",
});
