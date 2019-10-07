<template lang="pug">
  .wrapper(id="sidebar-wrapper")
    .header
      .logo
      nav.navigation
        //- ul.list(:class="{active: activeNavigation === 'buyer'}")
        ul.list(:class="{active: true}" v-if="user.is_buyer")
          .list__title(@click="toggle('buyer')")
            .list__category Купить
            //- .list__counter(v-if="buyerCounter && activeNavigation === 'seller'" :style="{top: '16px'}") {{ buyerCounter }}

          li.list__item(v-for="item in buyerLinks" :class="{active: isActive(item.url)}" @click.stop="")
            router-link.list__link(:to="item.url") {{ item.name }}
              .list__counter(v-if="toNum(item.counter) > 0") {{ item.counter }}

        //- ul.list.seller(:class="{active: activeNavigation === 'seller'}")
        ul.list.seller(:class="{active: true}" v-if="user.is_seller")
          .list__title(@click="toggle('seller')")
            .list__category Продать
            //- .list__counter(v-if="sellerCounter && activeNavigation === 'buyer'" :style="{top: '16px'}") {{ sellerCounter }}

          li.list__item(v-for="item in sellerLinks" :class="{active: isActive(item.url)}" @click.stop="")
            router-link.list__link(:to="item.url") {{ item.name }}
              .list__counter(v-if="toNum(item.counter) > 0") {{ item.counter }}

    .footer
      .tour(@click="$emit('tour')") Тур по странице
      .chat-container(v-on:click="chatClick($event)")
        img.chat(src="../../assets/chat.svg")
        p Онлайн-чат
      //  p(id="online-chat-caption") Онлайн-чат
      // .footer__links
        router-link.footer__links__item(to="/faq") FAQ
        router-link.footer__links__item(to="/support") Тех поддержка

</template>
<script>
import { post } from "../../api/request";
import { user } from "../../helpers/authorization";
import ContentStore from "../BuyerAnswers/store";

export default {
  data: () => ({
    ContentStore,
    buyerLinks: [
      { name: "Запрос", url: "/", counter: 0 },
      { name: "Ответы", url: "/buyer/answers", counter: 0 },
      { name: "Заказы", url: "/buyer/orders", counter: 0 }
    ],
    sellerLinks: [
      { name: "Запросы", url: "/seller/requests", counter: 0 },
      { name: "Заказы", url: "/seller/orders", counter: 0 }
    ],
    openedNavigation: null,
    user,
  }),
  computed: {
    buyerCounter() {
      return this.buyerLinks[1].counter + this.buyerLinks[2].counter;
    },
    sellerCounter() {
      return this.sellerLinks[0].counter + this.sellerLinks[1].counter;
    },
    activeNavigation() {
      const path = this.$route.path || "";
      const opened = this.openedNavigation;
      if (opened) return opened;
      return String(path).startsWith("/seller") ? "seller" : "buyer";
    }
  },
  methods: {
    chatClick: function(e) {
      // let bodyClassList = document.body.classList;
      // if (bodyClassList.contains("no-jdiv")) {
      //   document.body.classList.remove("no-jdiv");
      //   jivo_api.open();
      //   document.getElementById("online-chat-caption").innerText = "Скрыть онлайн-чат";
      // }
      // else {
      //   jivo_api.close();
      //   document.body.classList.add("no-jdiv");
      //   document.getElementById("online-chat-caption").innerText = "Онлайн-чат";
      // }
      Tawk_API.toggle();

    },
    toNum(number) {
      const result = Number(number);
      return isNaN(result) ? 0 : result;
    },
    isActive(url) {
      return url === this.$route.path;
    },
    toggle(menu) {
      const active = this.activeNavigation;
      this.openedNavigation = active === "buyer" ? "seller" : "buyer";
    },
    reset() {
      this.buyerLinks[1].counter = 0;
      this.buyerLinks[2].counter = 0;
      this.sellerLinks[0].counter = 0;
      this.sellerLinks[1].counter = 0;
    },
    updateCounters() {
      if (!user.token || !this.ContentStore) return;
      const ids = this.ContentStore.allResponseIds;
      const noId = !Array.isArray(ids);
      this.isLoading = true;

      post("profile/get-counters", { cart: noId ? [] : ids })
        .then(({ data = {} }) => {
          const ok = typeof data === "object" && !Array.isArray(data);
          if (!ok) return this.reset();
          const bR = Number(data.buyer_responses);
          this.buyerLinks[1].counter = isFinite(bR) ? bR : 0;

          // const bO = Number(data.buyer_orders);
          // this.buyerLinks[2].counter = isFinite(bO) ? bO : 0;

          const sR = Number(data.seller_requests);
          this.sellerLinks[0].counter = isFinite(sR) ? sR : 0;

          const sO = Number(data.seller_orders);
          this.sellerLinks[1].counter = isFinite(sO) ? sO : 0;
        })
        .catch(({ message = "Unexpected Error" } = {}) => console.log(message));
    }
  },
  watch: {
    "$route.path"(path) {
      this.openedNavigation = null;
      this.updateCounters();
    }
  },
  mounted() {
    this.updateCounters();
    this.$options.timer = setInterval(this.updateCounters, 60 * 1000);
  },
  beforeDestroy() {
    clearInterval(this.$options.timer);
  }
};
</script>
<style src="./style.sass" lang="sass" scoped></style>
