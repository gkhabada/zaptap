<template lang="pug">
  .loadingcontainer(v-if="pending")
    .loading
    .loading__message Загрузка, пожалуйста подождите.

  div(v-else-if="!isAuthorized && isLocalhost && !isWidget")
    landing

  .wrapper(v-else-if="isUserDataLoaded && !isWidget")
    notifications(group="stock" classes="notification" position="bottom right" :max="3" :duration="6000")
    tour(:type="tourPage" v-if="tourPage" @close="tourPage = null")
    sidebar(@tour="handleTour")
    .content
      vue-header
        template(slot="tour" slot-scope="tour" v-if="showTour")
          tour(type="global" :func="{menu: tour.openmenu, close: dontShowTour}" :changeRoute="true" @close="showTour = false")
      transition(name="show" mode="out-in")
        router-view
    //- vue-progress-bar

  .wrapper(v-else-if="isWidget")
    router-view

</template>

<script>
import VueHeader from "../VueHeader/VueHeader.vue";
import Sidebar from "../Sidebar/Sidebar.vue";
import Vue from "vue";
import { user, login, register, redirectIfUnauthorized, isLocalhost } from "../../helpers/authorization";
import buyerAnswersStore from "../BuyerAnswers/store.js";
import { post } from "../../api/request";

import Landing from '../../pages/Landing/Landing'

const Tour = () => import("../Tour.vue");

export default Vue.extend({
  components: {
    VueHeader,
    Sidebar,
    Tour,
    Landing
  },
  data: () => ({
    showTour: false,
    tourPage: null,
    pending: true,
    user,
    isLocalhost,
    serverr: false,
    formtype: "login",
    isRegistered: false,
    isWidget: false,
  }),
  computed: {
    isAuthorized() {
        console.log(this.user.token);
      return !!this.user.token;
    },
    isUserDataLoaded() {
      console.log(1, this.user)
      return !!this.user.data;
    },
  },
  methods: {
    toggleform() {
      if (this.formtype === "login") {
        this.formtype = "register";
      } else {
        this.formtype = "login";
      }
    },
    handleTour() {
      const { name, query = {} } = this.$route;
      const { order, answer, type } = query;
      const isOrder = !isNaN(Number(order)) && Number(order) >= 0;
      const isAnswer = !isNaN(Number(answer)) && Number(answer) >= 0;
      const isFinished = type === "finished_orders";
      if (name === "BuyerAnswers") {
        this.tourPage = isAnswer
          ? name + "Answer"
          : isOrder
            ? name + "Order"
            : name;
      } else if (name === "BuyerOrders") {
        this.tourPage = isOrder ? name + "Order" : name;
      } else if (name === "SellerRequests") {
        this.tourPage = isFinished
          ? name + "Finished"
          : isOrder
            ? name + "Order"
            : name;
      } else if (name === "SellerOrders") {
        this.tourPage = isOrder ? name + "Order" : name;
      } else if (name === "SellerStock") {
        return;
      } else {
        this.tourPage = name;
      }
    },
    dontShowTour() {
      post("/user/enable-tutorial", JSON.stringify(false)).catch(console.log);
      localStorage.setItem("showtour", "false");
    }
  },
  watch: {
    isAuthorized: () => {
      redirectIfUnauthorized();
    },
  },
  async mounted() {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    let name = null;
    let max = 10;
    while(!name && max--) {
      await delay(20);
      if(typeof this.$route!=='undefined')
        name = this.$route.name;
    }

    if(name === 'Widget') {
      localStorage.setItem('isWidget', 'true');
      this.isWidget = true;
      this.pending = false;
      document.body.classList.add('no-jdiv');
      return;
    }
    else{
        localStorage.setItem('isWidget', 'false');
    }

    if (name === "Validate") {
      const { token, refresh } = this.$route.params;
      await login({ refresh }, token);
      buyerAnswersStore.$emit("authorized");
      this.$router.push("/");
      this.showTour = true;
    }

    const { data, refresh } = user;

    if (this.isUserDataLoaded) {
      this.pending = false;
      return;
    }
    if (refresh) {
      await login({ refresh });
      this.$nextTick(() => {
        if (user.data && user.data.show_tutorial) {
          this.showTour = true;
        }
      });
      buyerAnswersStore.$emit("authorized");
    }
    else {
      redirectIfUnauthorized();
    }

    this.pending = false;
  }
});
</script>

<style src="./style.sass" lang="sass" scoped></style>
<style lang="sass">
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button
  -webkit-appearance: none
  -moz-appearance: none
  appearance: none
  margin: 0

.notifications
  max-width: 150px
.notification
  padding: 10px !important
  margin: 0 5px 5px !important
  font-size: 12px !important
  color: #ffffff !important
  border-left: 5px solid (#363c48 + #666) !important
  background: #363c48 !important
  font-family: 'Roboto', sans-serif !important
</style>
