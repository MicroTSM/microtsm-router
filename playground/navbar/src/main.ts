import createVueMicroApp from '@microtsm/vue';
import App from '@/App.vue';

export const { mount, unmount } = createVueMicroApp(App, {
    el: '#app', // Only used for standalone development
});
