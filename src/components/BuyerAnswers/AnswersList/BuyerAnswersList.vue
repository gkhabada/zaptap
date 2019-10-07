<template lang="pug">
  .loading(v-if="collectionLoading")
  .answerslist(v-else-if="answersLength > 0 && choosen && collection.length > 0")
    client-info(:userid="userid" v-if="userid" @close="userid = false")
    BuyerAnswersDetailsList(v-bind="{details: choosen.details}")
    
    .container
      .container__overflow
        .container__scrollable
          BuyerAnswersHeaderCart
          .detail__container(v-for="{ details, user, seller_response_id } in sortedCollection" @click="getAnswer(seller_response_id)" :class="{active: Number(seller_response_id) === answer}" v-if="answers[seller_response_id]")
            .detail
              .detail__left(v-if="user")
                .avatar
                  .preview {{ getInitials(user) }}
                  .image(:style="{backgroundImage: `url('${getUrlFromString(user.user_images)}')`}" v-if="user.user_images")
                .info
                  .info__main
                    .info__name(
                      :title="user.display_name"
                      @click.stop="userid = user.user_id"
                      ) {{ `${user.name} ${user.surname}` }}
                  .info__second
                    .info__city(:title="user.city") г.{{ user.locality }}
                    //- .reviews(:title="`${user.positive_reviews} положительных и ${user.negative_reviews} негативных отзывов`")
                    //-   .reviews__title Отзывы
                    //-   .reviews__plus +{{ user.positive_reviews }}
                    //-   .reviews__minus -{{ user.negative_reviews }}
                    //- .whois
                    //-   .whois__criminal(v-if="user.is_criminal" title="Этот продавец был замечен в мошенничестве")
                    //-   .whois__positive(v-if="user.is_positive")
                    //-   .whois__negative(v-else)
                    //-   .whois__favourite(v-if="user.is_favorite" title="Продавец в избранных")
                    //-   .whois__notfavourite(title="Добавить продавца в избранные" v-else)
              .counters
                .cheap {{ answers[seller_response_id] ? answers[seller_response_id].cheapest.length : 0 }} дешевых
                .expensive {{ answers[seller_response_id] ? answers[seller_response_id].others.length : 0 }} остальных
              //- .remove(title="Удалить ответ")

      .scroll
        scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps")

  .answersempty(v-else-if="choosen")
    BuyerAnswersHeaderCart
    BuyerAnswersDetailsList(v-bind="{details: choosen.details}")

    .emptymessage(v-if="ContentStore.responseIds.length === 0")
      span По этому запросу еще нет ответов
      br
      span от продавцов
</template>

<script>
import Scroll from "../../Scroll/mixin";
import BuyerAnswersHeaderCart from "../../BuyerAnswersHeaderCart.vue";
import BuyerAnswersDetailsList from "../../BuyerAnswersDetailsList.vue";
import ContentStore from "../store.js";
import Vue from "vue";
import ClientInfo from "../../ClientInfo";
import { getUrlFromString } from "../../../helpers/imageLoader";

export default Vue.extend({
  props: {
    choosen: {
      type: Object
    },
    collection: {
      type: Array,
      required: true
    },
    answer: Number,
    collectionLoading: Boolean
  },
  components: {
    BuyerAnswersHeaderCart,
    ClientInfo,
    BuyerAnswersDetailsList
  },
  data: () => ({ visible: true, ContentStore, userid: false }),
  computed: {
    answersLength() {
      return Object.keys(this.answers).length;
    },
    answers() {
      // FLATTEN ARRAY
      const allDetails = [];
      const temp = {};
      this.collection.forEach(item => {
        const sellerId = item.seller_response_id;
        const details =
          item.details.map(detail => ({ ...detail, sellerId })) || [];
        if (!sellerId || !details) return;
        allDetails.push(...details);
      });
      // FOR EVERY DETAIL MOVE TO CHEAP OR OTHERS
      allDetails.forEach(item => {
        const sellerId = item.sellerId;
        const price = parseInt(item.price);
        const id = item.request_detail_id;
        if (this.ContentStore.allCartDetails.includes(id)) return;
        if (isNaN(price)) return;
        // FIND CHEAPEST
        const cheapest = allDetails.find(itemFound => {
          const foundId = itemFound.request_detail_id;
          const foundPrice = parseInt(itemFound.price);
          if (isNaN(foundPrice) || foundId !== id) return;
          return foundPrice < price;
        });
        // IF FOUND: MOVE TO CHEAPEST IF NOT - TO OTHERS
        if (!temp[sellerId]) {
          temp[sellerId] = {
            cheapest: [],
            others: [],
            all: []
          };
        }
        if (!cheapest) {
          temp[sellerId].cheapest.push(item);
        } else {
          temp[sellerId].others.push(item);
        }
        temp[sellerId].all.push(item);
      });
      return temp;
    },
    sortedCollection() {
      const answers = this.answers;
      const collection = this.collection;
      return collection.sort((a, b) => {
        const objA = answers[a.seller_response_id] || {};
        const objB = answers[b.seller_response_id] || {};
        const cheapA = objA.cheapest || [];
        const cheapB = objB.cheapest || [];
        const allA = objA.all || [];
        const allB = objB.all || [];
        const isEqual = cheapB.length === cheapA.length;
        return isEqual
          ? allB.length - allA.length
          : cheapB.length - cheapA.length;
      });
    }
  },
  mixins: [Scroll],
  methods: {
    getUrlFromString,
    getInitials(user = { name: "", surname: "" }) {
      const { name, surname } = user;
      return ((name || "")[0] || "") + ((surname || "")[0] || "");
    },
    getAnswer(id) {
      const query = { ...this.$route.query };
      query.answer = id;
      this.$router.push({ query });
    }
  },
  watch: {
    collectionLoading(isLoading, prev) {
      if (prev && !isLoading) {
        const query = { ...this.$route.query };
        if (this.answersLength === 0 && !this.collectionLoading) {
          // delete query.answer;
          this.$router.push({ query });
        } else if (this.answersLength > 0 && !this.answers[this.answer]) {
          if (!query.answer) return;
          query.answer = Object.keys(this.answers)[0];
          this.$router.push({ query });
        }
      }
    }
  }
});
</script>

<style lang="sass" src="./style.sass" scoped>
</style>
