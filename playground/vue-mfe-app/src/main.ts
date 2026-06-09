import createVueMicroApp from "@microtsm/vue";
import "./style.css";
import App from "./App.vue";
import "./router";

export const { mount, unmount } = createVueMicroApp(App, {
  el: "#app",
});
