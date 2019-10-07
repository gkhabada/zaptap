<template lang="pug">
  .cart
    ask-data-buyer(v-if="AskBuyerData" @action="$emit('getbuyerdata', $event)")
  
    agreement(v-if="showPopup" @agree="addOrder")
    .cart__header(v-if="choosen")
      .cart__info
        .cart__back(@click="cartOpened = false")
        .cart__title Корзина:
        .cart__number заказ №{{ order }}
        .cart__car {{ choosen.car.brand }} {{ choosen.car.model }} {{ choosen.car.generation }}
        template(v-if="choosen.phone")
          .cart__client , клиент
          .cart__phone {{ choosen.phone || 'нет телефона' | firstPhone }}
      .cart__unadded
        unnadded-list(v-bind="$props" :answers="answers")
        // .unadded__title Недобавленные ({{ unadded.length }})
        // .unadded__list
        //   .unadded__item(v-for="item in unadded") {{ item }}

    .header
      .header__names Запчасти
      .header__cost(v-if="showPrice" @click="showPrice = !showPrice") Цена р.
      .header__user__cost(@click="showPrice = !showPrice" v-else) Цена р. клиенту
      .header__condition Состояние

    .container
      .container__overflow
        .container__scrollable
          .answer(v-for="({details, answer}, seller_response_id) in answers" :key="seller_response_id" v-if="details.length > 0")
            .answer__header
              .info(v-if="answer.user")
                .avatar
                  .preview {{ getInitials(answer.user) }}
                  .image(:style="{backgroundImage: `url('${getUrlFromString(answer.user.user_images)}')`}" v-if="answer.user.user_images")
                .username {{ `${answer.user.name || ''} ${answer.user.surname}` }}
                .city {{ answer.user.locality }}
                .phone {{ answer.user.phones || 'нет телефона' | firstPhone }}

              .removeanswer(@click="removeAnswer(seller_response_id)")

            .answer__body
              .detail(v-for="{ response_detail_id, client_price, detail_name, condition, price } in details")
                .detail__text {{ detail_name }}
                .detail__price(v-if="showPrice") {{ price }}
                input.detail__input(:value="client_price" type="number" @change="updatePrice({ response_detail_id, seller_response_id }, $event)" placeholder="Цена клиенту" @click.stop="" v-else)
                .detail__text {{ condition }}
                .removedetail
                  .removedetail__icon(@click="removeDetail({ response_detail_id, seller_response_id })")

            .answer__footer
              .footer__delivery Доставка до т.к.
              .footer__price {{ answer.delivery_price }}
              .footer__days {{ delivery(answer.estimated_delivery_days).title }}

            .answer__cost
              .cost__title Итого
              .cost__number {{ answersCost[seller_response_id] }}
              .cost__emptyspace


      .scroll
        scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps")

    .summary
      .note Перед оплатой позвоните продавцу и уточните наличие запчастей.
      .summary__cost
        .summary__title Итого:
        .summary__value {{ store.cost[order] || 0 }} р.
      .summary__pay(@click="showAgreement") В заказ

</template>

<script>
import store from "../store";
import Scroll from "../../Scroll/mixin";
import { post } from "../../../api/request";
import UnnaddedList from "../../BuyerAnswersCartUnnadded";
import Agreement from "../../BuyerAnswersCartPopup";
import AskDataBuyer from "../../AskDataBuyer.vue";
import { getUrlFromString } from "../../../helpers/imageLoader.js";

export default {
  name: "AnswersCart",
  mixins: [Scroll],
  components: {
    UnnaddedList,
    Agreement,
    AskDataBuyer
  },
  props: {
    order: {
      type: Number,
      required: true
    },
    choosen: {
      type: Object
    },
    collection: {
      type: Array
    }
  },
  data: () => ({
    store,
    visible: true,
    showPrice: true,
    showPopup: false,
    AskBuyerData: false,
    pending: false
  }),
  computed: {
    cartOpened: {
      get() {
        const cart = this.$route.query.cart;
        return cart === "opened";
      },
      set(v) {
        const query = { ...this.$route.query };
        if (v) {
          query.cart = "opened";
        } else {
          delete query.cart;
        }
        this.$router.push({ query });
      }
    },
    answers() {
      if (this.order < 0) return;
      return this.store.cart[this.order] || {};
    },
    answersCost() {
      const costs = {};
      Object.keys(this.answers).forEach(k => {
        const { answer, details } = this.answers[k];
        costs[k] = this.getCost(answer, details);
      });
      return costs;
    },
    answersLength() {
      return Object.keys(this.answers)
        .map(k => this.answers[k].details.length)
        .reduce((s, v) => s + v, 0);
    }
  },
  methods: {
    getUrlFromString,
    getCost(answer = {}, details = []) {
      const { delivery_price = 0 } = answer;
      const sum = details.reduce((s, { price = 0 }) => {
        const p = Number(price);
        return isNaN(p) ? s : s + p;
      }, 0);
      const d = Number(delivery_price);
      return isNaN(d) ? sum : sum + d;
    },
    getInitials(user = { name: "", surname: "" }) {
      const { name, surname } = user;
      return ((name || "")[0] || "") + ((surname || "")[0] || "");
    },
    showAgreement() {
      const skip = localStorage.getItem("showAgreementInCart");
      if (skip) return this.addOrder(true);
      this.showPopup = true;
    },
    addOrder(result) {
      if (this.pending) return;
      this.AskBuyerData = true;
      this.showPopup = false;
      this.pending = true;
      this.$once("getbuyerdata", res => {
        this.AskBuyerData = false;
        if (res) {
          this.addOrderNext(result);
        } else {
          this.pending = false;
        }
      });
    },
    addOrderNext(result) {
      if (!result) {
        this.pending = false;
        return;
      }
      const ids = this.store.responseIds;
      const responseIds = Array.isArray(ids) ? ids : [];
      const requestId = parseInt(this.order);
      if (!isFinite(requestId)) {
        this.pending = false;
        return;
      }

      post("order/add-order", {
        buyer_request_id: requestId,
        seller_response_detail_ids: responseIds
      })
        .then(response => {
          const err = response.data;
          if (err) {
            return Promise.reject(err);
          }
          this.$delete(this.store.cart, requestId);
        })
        .catch(err => console.log(err))
        .finally(() => {
          this.pending = false;
        });
    },
    delivery(day_) {
      const day = Number(day_);
      const last = day % 10;

      if (last === 1 && day !== 11) {
        return { index: day, title: day + " день" };
      } else if (last > 1 && last < 5 && (day < 5 || day > 21)) {
        return { index: day, title: day + " дня" };
      } else {
        return { index: day, title: day + " дней" };
      }
    },
    removeAnswer(sellerId) {
      this.$delete(this.store.cart[this.order], sellerId);
    },
    removeDetail({ response_detail_id, seller_response_id }) {
      const detailIndex = this.store.cart[this.order][
        seller_response_id
      ].details.findIndex(({ response_detail_id: detailId }) => {
        return Number(response_detail_id) === Number(detailId);
      });
      this.store.cart[this.order][seller_response_id].details.splice(
        detailIndex,
        1
      );
    },
    updatePrice({ response_detail_id, seller_response_id }, event) {
      const value = parseInt(event.target.value);
      const client_price = isNaN(value) ? 0 : value;
      this.$emit("update", {
        who: {
          response_detail_id,
          seller_response_id
        },
        value: { client_price }
      });
      const order = this.store.cart[this.order];
      if (!order) this.$set(this.store.cart, this.order, {});
      const answer = order[seller_response_id] || {};
      if (!answer)
        this.$set(this.store.cart[this.order], seller_response_id, {});
      const details = answer.details || [];
      if (!answer)
        this.$set(
          this.store.cart[this.order][seller_response_id],
          "details",
          []
        );
      const found = details.findIndex(
        d => d.response_detail_id === response_detail_id
      );
      if (~found) {
        this.$set(
          this.store.cart[this.order][seller_response_id].details[found],
          "client_price",
          client_price
        );
      }

      post("buyer/set-client-price", { response_detail_id, client_price })
        .then(({ data }) => console.log(data))
        .catch(error => console.log(error.message));
    }
  },
  watch: {
    answersLength: {
      immediate: true,
      handler(l) {
        if (l === 0) this.cartOpened = false;
      }
    }
  }
};
</script>

<style lang="sass" src="./style.sass" scoped>
</style>
