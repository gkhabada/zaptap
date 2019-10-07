// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./components/App/App";
import router from "./router";
import VueProgressBar from "vue-progressbar";
import "default-passive-events";
// import filters from './api/filters';
import Notifications from "vue-notification";
Vue.use(Notifications);

Vue.config.productionTip = false;

Vue.use(VueProgressBar);
Vue.filter("firstPhone", phones => {
  if (typeof phones !== "string") return phones;
  return phones.split(";")[0] || phones;
});
/* eslint-disable no-new */
export default new Vue({
  el: "#app",
  router,
  components: { App },
  template: "<App/>",
  mounted() {
    window.onresize = e => {
      window.requestAnimationFrame(() => {
        this.$emit("resize", e);
      });
    };
  },
  created() {
    // this.$Progress.start()
    // this.$router.beforeEach((to, from, next) => {
    //   this.$Progress.start()
    //   next()
    // })
  }
});
