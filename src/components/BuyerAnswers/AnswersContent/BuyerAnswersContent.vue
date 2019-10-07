<template lang="pug">
  .answerscontent(v-if="answer && answer.all.length > 0")
    comments-viewer(v-bind="{buyerComment, buyerMedia, sellerComment, sellerMedia}"
      v-if="isCommentsVisible"
      @close="resetCommentsView" 
      )
    comments-viewer(v-bind="{buyerComment, sellerComment}"
      v-if="isDescriptionVisible"
      buyertitle="мое примечание"
      sellertitle="примечание продавца"
      @close="resetCommentsView" 
      )

    .top
      .contacts
        a.phone(:href="`tel:${getFirstPhone(user.phones || 'нет телефона')}`") {{ user.phones || 'нет телефона' | firstPhone }}
        .social(v-if="user.social")
          a.social__mail(:href="`mailto:${user.social.mail}`" target="_blank" v-if="user.social.mail" :title="user.social.mail")
          a.social__phone(:href="`https://wa.me/${user.social.whatsapp}`" target="_blank" v-if="user.social.whatsapp" :title="user.social.whatsapp")
          a.social__viber(:href="`viber://add?number=${user.social.viber}`" target="_blank" v-if="user.social.viber" :title="user.social.viber")
          a.social__telegram(:href="`//t.me/${user.social.telegram}`" target="_blank" v-if="user.social.telegram" :title="user.social.telegram")
          a.social__skype(:href="`skype:${user.social.skype}?chat}`" target="_blank" v-if="user.social.skype" :title="user.social.skype")

      //- .check Проверить продавца

    .content
      .tabs
        .tabs__item(:class="{active: currentTab === 'cheapest', disabled: answer.cheapest.length === 0}" @click="tab = 'cheapest'") Самые дешевые запчасти ({{answer.cheapest.length}})
        .tabs__item(:class="{active: currentTab === 'others', disabled: answer.others.length === 0}" @click="tab = 'others'") Остальные запчасти ({{answer.others.length}})
      .table
        .table__content
          .header
            .header__check
            .header__item Запчасти
            .header__item.cost(v-if="showPrice" @click="showPrice = !showPrice") Цена р.
            .header__item.user__cost(v-else @click="showPrice = !showPrice") Цена р. клиенту
            .header__item Состояние
            .header__comment

          .container
            .container__overflow
              .container__scrollable
                .detail(v-for="{detail_name, price, client_price, comments, media, condition, response_detail_id, seller_response_id} in details" :class="{active: inStore[seller_response_id][response_detail_id]}" @click="store.pickDetail(seller_response_id, response_detail_id)")
                  .detail__mark
                  .detail__text {{ detail_name }}
                  .detail__price(v-if="showPrice") {{ price }}
                  .detail__input( type="number" placeholder="Цена клиенту" v-else) {{ client_price || 0 }}
                  //- input.detail__input(:value="client_price" type="number" @change="updatePrice({ response_detail_id, seller_response_id }, $event)" placeholder="Цена клиенту" @click.stop="" v-else)
                  .detail__text {{ condition }}
                  .detail__comment
                    .detail__comment__icon(:class="{active: hasSomething(comments, media)}" @click.stop="setCommentsView(comments, media)")

          .footer
            .footer__delivery Доставка до т.к.
            .footer__price {{ choosen.delivery_price }} р.
            .footer__days {{ delivery.title }}

        .scroll
          scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps")

      .summary
        .tools
          .notes(:class="{disabled: !descriptionExists}" @click.stop="showDescription") Примечания
          .unmark(v-if="marked.length > 0" @click="unmark") Снять выделение
          .markall(@click="markAll" v-else) Выделить все

        .sum
          .sum__title Итого:
          .sum__value {{ cost }} р.

        .buy(@click="buy" :class="{disabled: cartDisabled}") В корзину

      //- .description Низкие цены, хотят быть в топе. Цены ниже, чем говорят по телефону.

  .noanswers(v-else) 

</template>

<script>
import CommentsViewer from '../../CommentsViewer/CommentsViewer';
import store from '../store';
import Scroll from '../../Scroll/mixin';
import { post } from '../../../api/request';
import Vue from 'vue';

export default Vue.extend({
  mixins: [Scroll],
  components: {
    CommentsViewer,
  },
  props: {
    answer: {
      type: Object,
    },
    choosen: {
      type: Object,
    },
  },
  data: () => ({
    isDescriptionVisible: false,
    isCommentsVisible: false,
    visible: true,
    tab: 'cheapest',
    showPrice: true,
    commentPopup: '',
    store,
    buyerComment: null,
    sellerComment: null,
    buyerMedia: null,
    sellerMedia: null,
  }),
  computed: {
    descriptionExists() {
      return String(this.choosen.description || '').trim();
    },
    cartDisabled() {
      return this.marked.length === 0;
    },
    showCommentsViewer() {
      return (
        this.buyerComment ||
        this.sellerComment ||
        this.buyerMedia ||
        this.sellerMedia
      );
    },
    cartOpened: {
      get() {
        const cart = this.$route.query.cart;
        return cart === 'opened';
      },
      set(v) {
        const query = { ...this.$route.query };
        if (v) {
          query.cart = 'opened';
        } else {
          delete query.cart;
        }
        this.$router.push({ query });
      },
    },
    delivery() {
      const day = this.choosen.estimated_delivery_days;
      const last = day % 10;

      if (last === 1 && day !== 11) {
        return { index: day, title: day + ' день' };
      } else if (last > 1 && last < 5 && (day < 5 || day > 21)) {
        return { index: day, title: day + ' дня' };
      } else {
        return { index: day, title: day + ' дней' };
      }
    },
    cost() {
      return this.marked.reduce((sum, id) => {
        const { price } =
          this.answer.all.find(x => id == x.response_detail_id) || {};
        const cost = parseInt(price);
        if (!isFinite(cost)) return sum;
        return sum + cost;
      }, 0);
    },
    user() {
      if (this.choosen) return this.choosen.user || {};
      return {};
    },
    currentTab() {
      if (!this.answer) return -1;
      const cheapest = this.answer['cheapest'];
      const others = this.answer['others'];
      if (this.tab === 'cheapest') {
        return cheapest.length > 0 ? 'cheapest' : 'others';
      } else {
        return others.length > 0 ? 'others' : 'cheapest';
      }
    },
    details() {
      if (!this.answer) return [];
      return this.answer[this.currentTab];
    },
    marked() {
      if (!this.choosen) return;
      const answer = this.choosen.seller_response_id;
      return Object.keys(this.inStore[answer]).filter(
        key => this.inStore[answer][key],
      );
    },
    inStore() {
      const temp = {};
      this.details.forEach(({ seller_response_id, response_detail_id }) => {
        const seller = this.store.picked[seller_response_id];
        const detail = {};
        if (!seller) {
          detail[response_detail_id] = false;
        } else {
          detail[response_detail_id] = seller[response_detail_id] || false;
        }
        temp[seller_response_id] = { ...temp[seller_response_id], ...detail };
      });
      return temp;
    },
  },
  methods: {
    getFirstPhone(v) {
      return String(v).split(';')[0];
    },
    showDescription() {
      this.isDescriptionVisible = true;
      this.buyerComment = String(this.choosen.notes || '').trim();
      this.buyerMedia = [];
      this.sellerComment = String(this.choosen.description || '').trim();
      this.sellerMedia = [];
    },
    resetCommentsView(comments, media) {
      this.isCommentsVisible = false;
      this.isDescriptionVisible = false;
      this.buyerComment = null;
      this.sellerComment = null;
      this.buyerMedia = null;
      this.sellerMedia = null;
    },
    setCommentsView(comments, media) {
      this.isCommentsVisible = true;
      const view = this.getCommentsView(comments, media);
      const { buyerComment, sellerComment, buyerMedia, sellerMedia } = view;
      this.buyerComment = buyerComment;
      this.sellerComment = sellerComment;
      this.buyerMedia = buyerMedia;
      this.sellerMedia = sellerMedia;
    },
    getCommentsView(comments = {}, media = {}) {
      const buyerComment = String(comments.buyer || '').trim();
      const sellerComment = String(comments.seller || '').trim();
      const buyerMedia = Array.isArray(media.buyer) ? media.buyer : [];
      const sellerMedia = Array.isArray(media.seller) ? media.seller : [];
      return {
        buyerComment,
        sellerComment,
        buyerMedia,
        sellerMedia,
      };
    },
    hasSomething(comments, media) {
      const { sellerComment, sellerMedia } = this.getCommentsView(
        comments,
        media,
      );
      return sellerComment.length > 0 || sellerMedia.length > 0;
    },
    unmark() {
      const statuses = this.inStore[this.choosen.seller_response_id];
      Object.keys(statuses)
        .filter(key => statuses[key])
        .forEach(key => {
          this.store.pickDetail(this.choosen.seller_response_id, key);
        });
    },
    markAll() {
      const statuses = this.inStore[this.choosen.seller_response_id];
      Object.keys(statuses)
        .filter(key => !statuses[key])
        .forEach(key => {
          this.store.pickDetail(this.choosen.seller_response_id, key);
        });
    },
    buy() {
      if (this.cartDisabled) return;
      const orderId = this.choosen.option_id;
      const sellerId = this.choosen.seller_response_id;

      const keys = this.marked.map(x => Number(x));
      const details = this.answer.all.filter(x => {
        const id = Number(x.response_detail_id);
        return keys.includes(id);
      });
      // store.cart.ORDER
      const cartOrder = { ...store.cart[orderId] };
      // store.cart.ORDER.SELLER
      cartOrder[sellerId] = { ...cartOrder[sellerId] };

      if (cartOrder[sellerId].details) {
        cartOrder[sellerId].details.push(...details);
      } else {
        cartOrder[sellerId].details = details;
      }
      cartOrder[sellerId].answer = this.choosen;
      this.$set(this.store.cart, orderId, cartOrder);
      this.unmark();
      // if (cartOrder[sellerId].details.length > 0)
      // this.cartOpened = true;
    },
    updatePrice({ response_detail_id, seller_response_id }, event) {
      const value = parseInt(event.target.value);
      const client_price = isNaN(value) ? 0 : value;
      this.$emit('update', {
        who: {
          response_detail_id,
          seller_response_id,
        },
        value: { client_price },
      });
      post('buyer/set-client-price', { response_detail_id, client_price })
        .then(({ data }) => console.log(data))
        .catch(error => console.log(error.message));
    },
  },
});
</script>


<style lang="sass" src="./style.sass" scoped>
</style>
