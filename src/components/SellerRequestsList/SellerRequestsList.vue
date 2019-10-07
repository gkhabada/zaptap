<template lang="pug">
  .sellerlist(:class="tab")
    ask-data-seller(v-if="AskDataSeller" @action="$emit('getsellerdata', $event)")

    comments-viewer(v-bind="{buyerComment, buyerMedia, sellerComment, sellerMedia}" v-if="showCommentsViewer" @close="resetCommentsView()" prior="buyer")

    media-loader(:files="currentFiles" v-if="isMediaLoaderVisible" @close="closeMediaLoader" @file="addFileToPart" @remove="removeFileFromPart"  @cancel="resetTemporaryFiles")

    .popup(v-if="popup" @click="$emit('answer', false)")
      .popup__container(@click.stop="")
        .popup__close(@click="$emit('answer', false)")
        .popup__body
          .popup__text=`Больше запросы на данную запчасть Вам не будут приходить, пока Вы не поставите соответствующую галочку во вкладке “Склад” в личном кабинете.`
            b Вы действительно хотите удалить эту запчасть?
          .popup__buttons
            .buttons__no(@click="$emit('answer', false)") Нет
            .buttons__yes(@click="$emit('answer', true)") Да

          .popup__checkbox
            checkbox(:status="askAgain ? 0 : 2" @click="toggleAskAgain")
            .askagain(@click="toggleAskAgain") не показывать больше

    .list
      .container
        .container__overflow
          .return(@click="backToTable")

          .container__scrollable
            .detail(v-for="detail in details" v-if="isDetailVisible(response[detail.request_detail_id])")
              .detail__header
                template
                  .detail__name(v-if="detail.detail_name") {{ detail.detail_name }}
                  .detail__name(v-else-if="detail.requested_detail") {{ detail.requested_detail.detail_name }}
                  .detail__name(v-else) Нет названия
                template
                  .detail__original(v-if="detail.detail_original_number") ориг. № {{ detail.detail_original_number}}
                  .detail__original(v-else-if="detail.requested_detail && detail.requested_detail.detail_original_number") ориг. № {{ detail.requested_detail.detail_original_number }}
                  .detail__original(v-else) ориг. № отсутствует
                template
                  .detail__notexists(v-if="tab === 'finished_orders'")
                  .detail__notexists(v-else)
                    span(@click="removeDetailFromStock(detail.request_detail_id)") нет на складе
                .detail__user__comment
                  .comment__icon(@click="setCommentsView(detail)" v-if="tab !== 'finished_orders'" :class="{disabled: !detail.comment && !detail.media_elements}")

              .detail__body(v-for="(res, i) in response[detail.request_detail_id]")
                .detail__cost
                  input.detail__input(type="number" v-model.number="res.cost" placeholder="Цена" :disabled="tab === 'finished_orders'" :class="{incorrect: showIncorrectDetails && incorrectDetails.includes(`${detail.request_detail_id}-${i}-cost`)}")
                .detail__state
                  dropdown(v-bind="res.status"
                    :full="true"
                    :disable="tab === 'finished_orders'"
                    :error="showIncorrectDetails && incorrectDetails.includes(`${detail.request_detail_id}-${i}-status`)"
                    @open="openState(detail.request_detail_id, i)"
                    @close="closeState(detail.request_detail_id, i)"
                    @pick="pickState(detail.request_detail_id, i, $event)"
                    @enter="enterState(detail.request_detail_id, i, $event)")
                .detail__comment
                  input-counter(:max="50" :value="res.comment || ''"
                    :disabled="tab === 'finished_orders'" placeholder="Комментарий" @input="setComment(detail.request_detail_id, i, $event)")
                .detail__right
                  .detail__tools
                    .comment__icon(v-if="tab === 'finished_orders'" @click="openMediaLoader(detail, i)" :class="{disabled: !hasCommentOrMedia(detail)}")
                    .detail__media(@click="openMediaLoader(detail, i)" :class="{notactive: !res.media}" v-else)
                      template(v-if="res.media") {{res.media | photoCounter}}фото
                      template(v-else) фото
                    .detail__close(@click="removeDetailVariant(detail.request_detail_id, i)" v-if="tab !== 'finished_orders'")
                  .detail__add(v-if="i === (response[detail.request_detail_id].length - 1) && tab !== 'finished_orders'"
                              @click="addDetailVariant(detail.request_detail_id, i)")
                    span.detail__add__text Добавить запчасть

        .scroll
          scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps")

    .footer
      .vinframe
        .title VIN или Frame
        .value(v-if="car.vin_frame") {{ car.vin_frame }}
        .value(v-else) не указан

      .notes
        input-counter(:max="200" :value="description" placeholder="Примечание" @input="v => description = v" :disabled="tab === 'finished_orders'")

      .delivery
        dropup(field="delivery"
              :disable="tab === 'finished_orders'"
              title="Срок доставки до т.к"
              :items="days"
              :opened="isDeliveryListOpened"
              :picked="pickedDate"
              :error="showIncorrectDetails && !~pickedDate"
              @open="isDeliveryListOpened = true"
              @close="isDeliveryListOpened = false"
              @pick="pickDate"
              @enter="enterDate")

      .answer(@click="answer" v-if="tab !== 'finished_orders'") Ответить
</template>

<script>
import InputCounter from '../InputCounter/InputCounter';
import Dropup from '../Dropup/Dropup';
import Dropdown from '../Dropdown/Dropdown';
import Checkbox from '../Checkbox/Checkbox';
import { post } from '../../api/request';
import Scroll from '../Scroll/mixin';
import MediaLoader from '../MediaLoader/MediaLoader';
import CommentsViewer from '../CommentsViewer/CommentsViewer.vue';
import Vue from 'vue';
import AskDataSeller from '../AskDataSeller';

export default Vue.extend({
  components: {
    InputCounter,
    Dropup,
    Dropdown,
    Checkbox,
    MediaLoader,
    CommentsViewer,
    AskDataSeller,
  },
  props: {
    choosen: {
      type: Object,
    },
    deliveryTerm: {
      type: Number,
    },
  },
  filters: {
    photoCounter(media = []) {
      if (!Array.isArray(media)) return '0 ';
      const photos = media.filter(({ type }) => true || type === 'picture');
      return photos.length > 0 ? photos.length + ' ' : '';
    },
    videoCounter(media = []) {
      if (!Array.isArray(media)) return '0 ';
      const videos = media.filter(({ type }) => type === 'video');
      return videos.length > 0 ? photos.length + ' ' : '';
    },
  },
  mixins: [Scroll],
  data: () => ({
    AskDataSeller: false,
    buyerComment: null,
    buyerMedia: null,
    sellerComment: null,
    sellerMedia: null,
    description: '',
    isDeliveryListOpened: false,
    pickedDate: -1,
    response: {},
    askAgain: true,
    popup: false,
    visible: true,
    mediaLoaderId: { responseId: -1, detailId: -1 },
    showIncorrectDetails: false,
  }),
  computed: {
    incorrectDetails() {
      const incorrect = [];
      let noPrice = [];
      let hasPrice=false;
      if (!this.showIncorrectDetails) return incorrect;
      Object.keys(this.response)
        .map(id => ({ response: this.response[id], id }))
        .forEach(({ response = [], id }) => {
          response.forEach(({ cost, status, comment } = {}, i) => {
            if (cost || ~status.picked || comment) {
              if (!cost) noPrice.push(`${id}-${i}-cost`);
              else hasPrice=true;
              if (!~status.picked) incorrect.push(`${id}-${i}-status`);
            }
          });
        });
      if(!hasPrice){
          noPrice.forEach((item)=>{
              incorrect.push(item);
          })
      }
      return incorrect;
    },
    showCommentsViewer() {
      if (this.tab === 'finished_orders') {
        return this.buyerComment || this.sellerComment || this.buyerMedia;
      } else {
        return this.buyerComment || this.buyerMedia;
      }
    },
    isMediaLoaderVisible() {
      const { responseId, detailId } = this.mediaLoaderId || {};
      const ok =
        isFinite(responseId + detailId) && responseId >= 0 && detailId >= 0;
      return ok;
    },
    currentFiles() {
      const visible = this.isMediaLoaderVisible;
      if (!visible) return [];
      const { responseId, detailId } = this.mediaLoaderId;
      const { media } = this.response[responseId][detailId] || {};
      if (!Array.isArray(media)) return [];
      return media;
    },
    tab() {
      const type = this.$route.query.type || '';
      return type === 'finished_orders' ? 'finished_orders' : 'active_orders';
    },
    car() {
      return this.choosen ? this.choosen.car || {} : {};
    },
    details() {
      if (!this.choosen) return [];
      const { details } = this.choosen;
      const noDetails = !Array.isArray(details);
      if (noDetails) return [];

      if (this.tab === 'finished_orders') {
        const found = [];
        const c = [];
        details.forEach((detail = {}) => {
          const detailId = detail.request_detail_id;
          const isFound = found.includes(detailId);
          if (!isFound) {
            found.push(detailId);
            c.push(detail);
          }
        });
        return c;
      }
      return details;
    },
    days() {
      return Array.from({ length: 90 }, (_, day_) => {
        const day = day_ + 1;
        const last = day % 10;

        if (last === 1 && day !== 11) {
          return { index: day, title: day + ' день' };
        } else if (last > 1 && last < 5 && (day < 5 || day > 21)) {
          return { index: day, title: day + ' дня' };
        } else {
          return { index: day, title: day + ' дней' };
        }
      });
    },
  },
  watch: {
    details: {
      handler(details) {
        this.description = '';
        this.pickedDate = -1;
        this.response = {};

        if (!this.choosen) return;

        if (this.tab === 'finished_orders') {
          this.updateFinishedDetails(details);
        } else {
          this.updateActiveDetails(details);
        }
      },
      immediate: true,
    },
  },
  methods: {
    resetTemporaryFiles(tasks = []) {
      if (!Array.isArray(tasks)) return;
      const { responseId, detailId } = this.mediaLoaderId || {};
      if (responseId < 0 || detailId < 0) return;

      const length = tasks.length;
      for (let i = 0; i < length; i++) {
        const { task, index, file } = tasks.pop();
        if (task === 'restore') {
          const response = this.response[responseId];
          response[detailId].media.splice(index, 0, file);
        }
        if (task === 'remove') {
          const response = this.response[responseId];
          response[detailId].media.splice(index, 1);
        }
      }
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
      const view = this.getCommentsView(comments, media);
      const { sellerComment, sellerMedia } = view;
      return sellerComment.length > 0 || sellerMedia.length > 0;
    },
    hasCommentOrMedia(detail) {
      const view = this.getCommentsView(
        { buyer: detail.requested_detail.comment, seller: detail.comment },
        { buyer: [], seller: detail.media_elements },
      );
      return (
        view.buyerComment ||
        view.sellerComment ||
        view.buyerMedia.length > 0 ||
        view.sellerMedia.length > 0
      );
    },
    updateActiveDetails(details) {
      details.forEach(detail => {
        const { request_detail_id: id } = detail || {};
        const noId = isNaN(id);
        if (noId) return;
        this.$set(this.response, id, [{ status: this.getBodyForState() }]);
      });
    },
    updateFinishedDetails(details) {
      const noDetails = !Array.isArray(details);
      if (noDetails) return;

      const {
        estimated_delivery_days,
        description,
        details: choosenDetails,
      } = this.choosen;

      const delivery = Number(estimated_delivery_days);
      const noDelivery = isNaN(delivery);
      this.pickedDate = noDelivery ? -1 : delivery - 1;
      this.description = this.choosen.description || '';

      choosenDetails.forEach(detail => {
        const id = Number(detail && detail.request_detail_id);
        const noId = isNaN(id);
        if (noId) return;
        const item = {
          status: this.getOneItemState(detail.condition),
          cost: detail.price,
          comment: detail.comment,
          media: detail.media_elements || [],
        };
        const { requested_detail = {} } = detail || {};
        const { media_elements = [] } = requested_detail;
        // media_elements.forEach(srcs => {
        //   const src = String(
        //     srcs.full_image_src ||
        //       srcs.medium_image_src ||
        //       srcs.preview_image_src ||
        //       '',
        //   ).trim();
        //   if (!src) return;
        //   item.media.push({ type: 'picture', url: src });
        // });

        if (item.media.length === 0) {
          delete item.media;
        }

        if (this.response[id]) {
          this.response[id].push(item);
        } else {
          this.$set(this.response, id, [item]);
        }
      });
    },
    resetCommentsView() {
      this.buyerComment = this.buyerMedia = this.sellerComment = this.sellerMedia = null;
    },
    setCommentsView({ comment, media_elements, requested_detail } = {}) {
      if (this.tab === 'finished_orders') {
        const { media_elements: sellerMedia, comment: sellerComment } =
          requested_detail || {};
        this.buyerComment = String(sellerComment || '').trim() || null;
        this.buyerMedia = sellerMedia || null;
        this.sellerComment = String(comment || '').trim() || null;
        this.sellerMedia = media_elements || null;
      } else {
        this.buyerComment = String(comment || '').trim() || null;
        this.buyerMedia = media_elements || null;
        const { media_elements: sellerMedia, comment: sellerComment } =
          requested_detail || {};
        this.sellerComment = String(sellerComment || '').trim() || null;
        this.sellerMedia = sellerMedia || null;
      }
    },
    openMediaLoader(detail = {}, detailId) {
      if (this.tab === 'finished_orders') {
        this.setCommentsView(detail);
        return;
      }
      const { request_detail_id: responseId } = detail;
      if (!isFinite(responseId, detailId)) {
        console.log('Not correct ids: ', responseId, detailId);
        return;
      }
      this.mediaLoaderId.responseId = responseId;
      this.mediaLoaderId.detailId = detailId;
    },
    closeMediaLoader() {
      this.attachMediaSet();
      this.mediaLoaderId.responseId = -1;
      this.mediaLoaderId.detailId = -1;
    },

    async getMediaSet() {
      const { media_set_id } = await post('/buyer/create-media-set').then(
        response => response.data,
      );
      return media_set_id;
    },
    async attachMediaSet() {
      if (!this.isMediaLoaderVisible) return;

      const { responseId, detailId } = this.mediaLoaderId;
      const detail = this.response[responseId][detailId];

      const media_set_id = Number(await this.getMediaSet());
      if (!isFinite(media_set_id)) return;

      this.$set(
        this.response[responseId][detailId],
        'media_set_id',
        media_set_id,
      );

      if (!Array.isArray(detail.media)) return;
      this.closeMediaLoader();
      detail.media.forEach(({ file }) => {
        const body = new FormData();
        body.set('media_element', file, file.name);
        body.set('media_set_id', media_set_id);

        post('/buyer/add-to-media-set', body)
          .then(response => {
            const data = response.data;
            if (data) console.log(response.data);
          })
          .catch(error => console.log(error.message));
      });
    },
    removeFileFromPart(fileIndex) {
      if (!this.isMediaLoaderVisible) return;

      const { responseId, detailId } = this.mediaLoaderId;
      const detail = this.response[responseId][detailId];

      if (!Array.isArray(detail.media)) return;

      detail.media.splice(fileIndex, 1);
    },
    addFileToPart(file) {
      if (!this.isMediaLoaderVisible) return;

      const { responseId, detailId } = this.mediaLoaderId;
      const detail = this.response[responseId][detailId];
      if (!Array.isArray(detail.media)) {
        this.$set(this.response[responseId][detailId], 'media', []);
      }
      detail.media.push({
        ...file,
      });
    },
    backToTable() {
      this.$emit('update');
      const query = { ...this.$route.query };
      delete query.order;
      this.$router.push({ query });
      // document.location.reload();
    },
    answer() {
      if (this.pending) return;
      this.AskDataSeller = true;
      this.pending = true;
      this.$once('getsellerdata', res => {
        this.AskDataSeller = false;
        if (res) {
          this.answerNext();
        } else [(this.pending = false)];
      });
    },
    answerNext() {
      this.showIncorrectDetails = true;
      const isIncorrect = this.incorrectDetails.length > 0;
      const isNoDate = this.pickedDate < 0;

      if (isIncorrect || isNoDate) {
        this.pending = false;
        return;
      }
      this.showIncorrectDetails = false;

      /** buyer_request_id from car */
      const requestId = Number(this.car.buyer_request_id);
      const noRequestId = isNaN(requestId);
      if (noRequestId) {
        this.pending = false;
        return;
      }

      const answer = {
        details: [],
        estimated_delivery_days: this.pickedDate + 1,
        option_id: requestId,
        description: this.description || '',
      };

      const responseCopy = { ...this.response };

      Object.keys(this.response).forEach(responseId => {
        const details = this.response[responseId];
        if (!Array.isArray(details)) return;
        const detailsCopy = [...details];
        detailsCopy.forEach((detail = {}, i) => {
          const { comment, cost, status = {}, media_set_id } = detail;
          const noCost = isNaN(cost);
          const noStatus = isNaN(status.picked) || status.picked === -1;

          if (noCost || noStatus) return;

          answer.details.push({
            comment: comment || '',
            price: cost,
            condition: status.items[status.picked].title,
            request_detail_id: Number(responseId),
          });

          const mediasetExists = !isNaN(media_set_id);

          if (mediasetExists) {
            Object.assign(answer.details[i], { media_set_id });
          }
          // update this.response[id] by removing answered details
          details.splice(i, 1);
        });
        // this.$set(this.response, responseId, detailsCopy);
      });
      this.$emit('update:details', {
        requestId,
        details: Object.keys(this.response),
      });
      post('/seller/add-response', answer)
        .then(response => {
          const { code, message } = response.data || {};
          if (code || message) {
            console.log(code, message);
            this.response = responseCopy;
          }
        })
        .then(this.backToTable)
        .catch(error => {
          console.log(error.message);
          this.response = responseCopy;
        })
        .finally(() => {
          this.pending = false;
          this.showIncorrectDetails = false;
        });
    },
    pickDate(i) {
      this.pickedDate = i - 1;
      this.isDeliveryListOpened = false;
    },
    enterDate({ custom, list, filtered }) {
      if (custom.length === 0) {
        this.pickDate(0);
      } else if (filtered.length === 0) {
        this.pickDate(1);
      } else {
        this.pickDate(filtered[0].index);
      }
    },
    openState(id, i) {
      Object.keys(this.response).forEach(idkey => {
        this.response[idkey].forEach((_, ikey) => {
          this.closeState(idkey, ikey);
        });
      });
      this.$set(this.response[id][i]['status'], 'opened', true);
      setTimeout(this.setScrollProps, 250);
    },
    closeState(id, i) {
      this.$set(this.response[id][i]['status'], 'opened', false);
      setTimeout(this.setScrollProps, 250);
    },
    pickState(id, i, event) {
      this.$set(this.response[id][i]['status'], 'picked', event);
      this.closeState(id, i);
    },
    enterState(id, i, { custom, list, filtered }) {
      const current = this.response[id][i]['status'].items;

      if (filtered.length === 0) {
        current.push({ title: custom, index: list.length });
        this.$set(this.response[id][i]['status'], 'items', current);
        this.pickState(id, i, list.length - 1);
      } else if (filtered.length === list.length) {
        this.pickState(id, i, -1);
      } else {
        this.pickState(id, i, filtered[0].index);
      }
    },
    isDetailVisible(list) {
      return list && list.length > 0;
    },
    getOneItemState(status) {
      return {
        field: 'state',
        title: status,
        items: [{ title: status, index: 0 }],
        picked: 0,
      };
    },
    getBodyForState() {
      const statuses = ['Хорошее', 'Среднее', 'Плохое'];
      return {
        field: 'state',
        title: 'Состояние',
        items: statuses.map((title, index) => ({ title, index })),
        opened: false,
        // среднее по-умолчанию
        picked: 1,
      };
    },
    setComment(id, i, comment) {
      if (!this.response[id]) return;
      this.$set(this.response[id][i], 'comment', comment);
    },
    addDetailVariant(id, i) {
      this.response[id].push({ status: this.getBodyForState() });
    },
    removeDetail(id) {
      const detail = this.details.find(d => d.request_detail_id === id);
      if (!detail) return;
      const detailId = parseInt(detail.detail_id);
      if (!isFinite(detailId)) return;
      post('/stock/remove-detail-from-stock', {
        car: {
          brand: this.car.brand,
          model: this.car.model,
          generation: this.car.generation,
        },
        detail_id: detailId,
      })
        .then(r => r.data)
        .catch(error => console.log(error.message));

      this.$delete(this.response, id);
    },
    removeDetailVariant(id, i) {
      if (!this.response[id]) return;
      const list = this.response[id];

      if (list.length < 2) {
        // if last item, ask for remove from stock
        if (this.askAgain) {
          this.popup = true;
          return this.$once('answer', answer => {
            if (answer) this.removeDetail(id);
            this.popup = false;
          });
        } else {
          this.removeDetail(id);
        }
      } else {
        list.splice(i, 1);
      }
    },
    removeDetailFromStock(id) {
      // if last item, ask for remove from stock
      if (this.askAgain) {
        this.popup = true;
        return this.$once('answer', answer => {
          if (answer) this.removeDetail(id);
          this.popup = false;
        });
      } else {
        this.removeDetail(id);
      }
    },
    getAskAgain() {
      const key = 'seller_requests_askagain';
      const state = localStorage.getItem(key);
      const askAgain = state && state === 'true';
      return !askAgain;
    },
    toggleAskAgain() {
      const k = 'seller_requests_askagain';
      const current = this.getAskAgain();
      if (!current) {
        localStorage.removeItem(k);
        this.askAgain = true;
      } else {
        localStorage.setItem(k, true);
        this.askAgain = false;
      }
    },
  },
  mounted() {
    this.askAgain = this.getAskAgain();
    this.pickedDate = this.deliveryTerm ? this.deliveryTerm-1 : -1;
  },
});
</script>

<style lang="sass" src="./style.sass" scoped>
</style>
