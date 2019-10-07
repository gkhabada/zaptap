<template lang="pug">
  .notEmptyCart(v-if="ContentStore.responseIds.length > 0 && !~opened.answer" @click="goToCart")
    .order__info(@click="goToCart")
      .order__counter {{ orderCartDetails }},
      .order__sum сумма
      .order__cost {{ ContentStore.cost[opened.order] || 0 }} р.
      .order__cart
</template>

<script>
import Vue from 'vue';
import ContentStore from './BuyerAnswers/store.js';

export default Vue.extend({
  props: {},
  data() {
    return {
      ContentStore,
    };
  },
  computed: {
    opened() {
      const query = this.$route.query;
      const order = Number(query.order);
      const answer = Number(query.answer);
      return {
        order: isNaN(order) ? -1 : order,
        answer: isNaN(answer) ? -1 : answer,
      };
    },
    orderCartDetails() {
      const details = this.ContentStore.responseIds.length;
      const last = details % 10;

      if (last === 1 && details !== 11) {
        return details + ' запчасть';
      } else if (last > 1 && last < 5 && (details < 5 || details > 21)) {
        return details + ' запчасти';
      } else {
        return details + ' запчастей';
      }
    },
    cost() {},
  },
  methods: {
    goToCart() {
      const query = { ...this.$route.query };
      query.cart = 'opened';
      this.$router.push({ query });
    },
  },
});
</script>

<style scoped>
.order__info {
  display: flex;
  align-items: center;
}
.order__counter {
  color: #9a9da3;
  font-size: 14px;
}
.order__sum {
  color: #525358;
  font-size: 14px;
  margin-left: 10px;
}
.order__cost {
  color: #525358;
  font-size: 14px;
  font-weight: bold;
  margin-left: 5px;
}
.order__cart {
  background: #2e71f0 url('../assets/cart_icon.svg') no-repeat center center;
  width: 31px;
  height: 31px;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 10px;
}
</style>
