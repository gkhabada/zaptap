<template lang="pug">
  .orderstable(:class="{finished}")
    comments-viewer(v-bind="{buyerComment, buyerMedia, sellerComment, sellerMedia}"
      v-if="isCommentsVisible"
      @close="resetCommentsView"
      )
    comments-viewer(v-bind="{buyerComment, sellerComment}"
      v-if="isDescriptionVisible"
      :buyertitle="isBuyer ? 'мое примечание' : 'примечание покупателя'"
      :sellertitle="isBuyer ? 'примечание продавца' : 'мое примечание'"
      @close="resetCommentsView"
      )

    client-info(:userid="userid" v-if="userid" @close="userid = false")

    .header
      .header__item(v-for="(h, i) in headers")
        .header__title(v-if="!['finish', 'remove'].includes(h.id)" :class="[h.id, {clientPrice, arrows: $route.name === 'BuyerOrders'}]" @click="headerClick(h.id)") {{ h.title }}
        .header__finish(v-else-if="h.id === 'finish' && !finished")
          .finish__button(@click="finish" :class="{disabled: finishDisabled}") Завершить
          .finish__mark(@click="untoggleAll" v-if="allChecked") Снять выделение
          .finish__mark(@click="toggleAll" v-else) Выбрать все
        .header__remove(v-else-if="i === headers.length - 1")
          .remove__button(@click="removeAll" v-if="!finished") Удалить все

        router-link.table__close(:to="{name: $route.name}")

    .container
      .container__overflow
        .container__scrollable
          template(v-for="{details, user_info: user} in collections" v-if="details && details.length > 0")
            .details__header
              .details__user
                .user__data(@click="userid = user.user_id")
                  .data__common
                    .data__pic
                      .preview {{ `${(user.name || '')[0] || ''}${(user.surname || '')[0] || ''}`}}
                      .image(:style="{backgroundImage: `url('${getUrlFromString(user.user_images)}')`}" v-if="user.user_images")
                    .data__name {{ `${user.name || ''} ${user.surname || ''}` }}
                    .data__city(v-if="user.locality") г. {{ user.locality }}
                    .seller__phone {{ user.phones || 'нет телефона' | firstPhone }}
                    // .data__reviews отзывы
                    // .data__plus {{ user.positive_reviews }}+
                    // .data__minus {{ user.negative_reviews }}-
                    // .data__thumb__up(v-if="user.is_positive")

              .details__tools
                .check__container(v-if="finished")
                  .item__check(:class="{checked: groupChecked(details)}" @click="toggleGroup(details)" v-if="!finished")
                .last__container
                  .item__last
                    .item__comment(v-if="details[0]")
                      .item__note(@click="showDescription(details[0].description, details[0].notes)" :class="{active: hasSomething({seller: details[0].description, buyer: details[0].notes})}") Примечание
                    .item__remove
                      .remove__item(@click="removeGroup(details)" v-if="!finished")


            .line(v-for="(item, i) in details" v-if="item" @click="pick(i)" :class="{picked: picked === i}")
              .line__item(v-for="h in headers" :class="h.id")
                .item__log(v-if="h.id === 'log'") {{ lastLog(item[h.id]).status }}
                .item__value(v-else-if="h.id === 'price'") {{ item[clientPrice ? 'client_price' : 'price'] || 0 }}
                .item__check(v-else-if="h.id === 'finish' && !finished" :class="{checked: isChecked[item.order_detail_id]}" @click="toggle(item.order_detail_id)")
                .item__last(v-else-if="h.id === 'remove'")
                  .item__comment
                    .comment__button(:class="{active: hasSomething(item.comments, item.media)}" @click="setCommentsView(item.comments, item.media)")
                  .item__remove
                    .remove__item(@click="removeDetail(item.order_detail_id)" v-if="!finished")
                .item__value(v-else) {{ item[h.id] }}

      .scroll
        scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps")
</template>

<script>
import { post } from "../../api/request";
import Scroll from "../Scroll/mixin";
import Store from "../../pages/BuyerOrders/store";
import CommentsViewer from "../CommentsViewer/CommentsViewer";
import ClientInfo from "../ClientInfo";
import { getUrlFromString } from "../../helpers/imageLoader.js";

export default {
  mixins: [Scroll],
  components: {
    CommentsViewer,
    ClientInfo
  },
  props: {
    details: {
      type: Array,
      required: true
    },
    picked: {
      type: Number,
      required: true
    },
    opened: {
      type: Number,
      required: true
    },
    finished: {
      type: Boolean,
      required: true
    },
    checked: {
      type: Array,
      required: true
    },
    updateFunction: {
      type: Function,
      required: true
    }
  },
  data: () => ({
    isCommentsVisible: false,
    isDescriptionVisible: false,
    store: Store,
    visible: true,
    clientPrice: false,
    userid: false,
    headers: [
      { id: "order_detail_id", title: "Номер заказа" },
      { id: "log", title: "Информация" },
      { id: "detail_name", title: "Запчасть" },
      { id: "price", title: "Цена" },
      { id: "condition", title: "Состояние" },
      { id: "finish", title: "" },
      { id: "remove", title: "" }
    ],
    buyerComment: null,
    sellerComment: null,
    buyerMedia: null,
    sellerMedia: null,
    finishUpdates: 0
  }),
  computed: {
    allChecked() {
      const length = this.collections
        .map(({ details }) => details.length)
        .reduce((s, v) => s + v, 0);
      return length === this.checked.length;
    },
    collections() {
      return Array.isArray(this.details) ? this.details : [];
    },
    collectionsLength() {
      return this.collections.reduce((s, { details = [] } = {}) => {
        return s + (details.length || 0);
      }, 0);
    },
    isChecked() {
      const result = {};
      this.checked.forEach(id => {
        result[id] = true;
      });
      return result;
    },
    finishDisabled() {
      return this.checked.length === 0 && this.finishUpdates === 0;
    },
    isBuyer() {
      return String(this.$route.path || "").startsWith("/buyer");
    }
  },
  methods: {
    getUrlFromString,
    showDescription(description, notes) {
      this.isDescriptionVisible = true;
      this.sellerComment = description;
      this.buyerComment = notes;
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
      const {
        buyerComment,
        sellerComment,
        buyerMedia,
        sellerMedia
      } = this.getCommentsView(comments, media);

      this.buyerComment = buyerComment;
      this.sellerComment = sellerComment;
      this.buyerMedia = buyerMedia;
      this.sellerMedia = sellerMedia;
      this.isCommentsVisible = true;
    },
    getCommentsView(
      { buyer: buyerComment, seller: sellerComment } = {},
      { buyer: buyerMedia = [], seller: sellerMedia = [] } = {}
    ) {
      return {
        buyerComment: typeof buyerComment === "string" ? buyerComment : "",
        sellerComment: typeof sellerComment === "string" ? sellerComment : "",
        buyerMedia: Array.isArray(buyerMedia) ? buyerMedia : [],
        sellerMedia: Array.isArray(sellerMedia) ? sellerMedia : []
      };
    },
    hasSomething(comments, media) {
      const {
        buyerComment,
        sellerComment,
        buyerMedia,
        sellerMedia
      } = this.getCommentsView(comments, media);

      const isBuyer = this.isBuyer;

      if ((!isBuyer && buyerComment) || (isBuyer && sellerComment)) return true;
      if (
        (!isBuyer && buyerMedia.length > 0) ||
        (isBuyer && sellerMedia.length > 0)
      )
        return true;
      return false;
    },
    groupChecked(details = []) {
      if (!Array.isArray(details)) return;
      return details.reduce((stat, { order_detail_id } = {}) => {
        return stat && this.isChecked[order_detail_id];
      }, true);
    },
    setClientPrice(i, e) {
      const value = e.target.value;
      this.table[i].client_price = value;
    },
    removeAll() {
      const copy = [...this.details];
      copy.forEach(({ details = {} } = {}) => {
        details.forEach(({ order_detail_id } = {}) => {
          if (!isFinite(order_detail_id)) return;
          this.removeDetail(order_detail_id);
        });
      });
    },
    removeGroup(details = []) {
      const copy = [...details];
      if (!Array.isArray(details)) return;
      copy.forEach(({ order_detail_id } = {}) =>
        this.removeDetail(order_detail_id)
      );
    },
    removeDetail(id) {
      Store.methods.removeDetail(this.opened, id);
      this.$nextTick(() => {
        if (this.collectionsLength === 0) {
          const q = { ...this.$route.query };
          delete q.order;
          setTimeout(() => {
            this.$router.push(q);
            this.updateFunction();
          }, 300);
        }
      });
    },
    headerClick(id) {
      if (id.includes("price") && this.$route.name === "BuyerOrders") {
        this.clientPrice = !this.clientPrice;
        this.headers[3].title = this.clientPrice ? "Цена клиенту" : "Цена";
      }
    },
    finish() {
      if (this.finishDisabled) return;
      this.finishUpdates = 0;

      post("/order/mark-details-as-finished", {
        order_details_id: this.checked
      })
        .then(response => {
          this.updateFunction();
          // document.location.reload();
        })
        .catch(error => {
          console.log(error.message);
        });

      const finishedDetails = this.details.reduce(
        (s, { details = [] } = {}) => {
          const copy = [...details];
          const notFinished = copy.filter(
            ({ is_finished } = {}) => !is_finished
          ).length;
          return s + notFinished;
        },
        0
      );
      const isFinished = this.checked.length === finishedDetails;
      // if (isFinished) this.$emit('finish');
    },
    toggleAll() {
      this.finishUpdates++;
      const table = [];
      this.collections.forEach(({ details }) => table.push(...details));
      table.forEach(({ order_detail_id } = {}) => {
        if (this.checked.includes(order_detail_id)) return;
        this.$emit("toggle", order_detail_id);
      });
    },
    untoggleAll() {
      this.finishUpdates = 0;
      const table = [];
      this.collections.forEach(({ details }) => table.push(...details));
      table.forEach(({ order_detail_id }) => {
        if (!this.checked.includes(order_detail_id)) return;
        this.$emit("toggle", order_detail_id);
      });
    },
    toggleGroup(details = []) {
      if (!Array.isArray(details)) return;
      details.forEach(({ order_detail_id } = {}) => {
        this.toggle(order_detail_id);
      });
    },
    toggle(orderDetailId) {
      this.finishUpdates++;
      this.$emit("toggle", orderDetailId);
    },
    pick(i) {
      this.$emit("pick", i);
    },
    lastLog(log) {
      return Array.isArray(log)
        ? log[log.length - 1]
        : { status: "Нет истории" };
    },
    isEmpty(comment) {
      return !comment || comment.length === 0 ? "empty" : "";
    }
  }
};
</script>

<style lang="sass" src="./style.sass" scoped></style>
