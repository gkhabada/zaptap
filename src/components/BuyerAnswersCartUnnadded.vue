<template lang="pug">
  .unnadded__container
    .title(@click="toggle" :class="{opened: showList}") Недобавленные ({{ unnadded.length }})
    .containerunnadded(:style="{height: `${maxHeight}px`}" v-if="showList")
      .container__overflowunnadded
        .container__scrollableunnadded
          .detail(v-for="d in unnadded" :title="d") {{ d }}

      .scrollunnadded
        scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps" :scrollHeight="maxHeight - 30")
</template>

<script>
import Vue from 'vue';
import Scroll from './Scroll/mixin.js';
import { post } from '../api/request';

export default Vue.extend({
  mixins: [Scroll],
  props: {
    order: { type: Number, required: true },
    collection: { type: Array, required: true },
    answers: { type: Object },
  },
  data: function() {
    return {
      // Scroll suffix for nested elements
      fix: 'unnadded',
      visible: true,
      showList: false,
    };
  },
  computed: {
    maxHeight: function() {
      return this.unnadded.length * 25 + 30;
    },
    added: function() {
      const answerKeys = Object.keys(this.answers);
      const answerDetails = [];

      answerKeys.forEach(key => {
        const { details = [] } = this.answers[key];
        answerDetails.push(...details);
      });

      return answerDetails;
    },
    unnadded: function() {
      const unnadded = [];
      this.collection.forEach(({ details = [] } = {}) => {
        details.forEach(({ request_detail_id, detail_name }) => {
          const found = this.exists(detail_name);
          const isAdded = unnadded.includes(detail_name);
          if (found || isAdded) return;
          unnadded.push(detail_name);
        });
      });
      return unnadded;
    },
  },
  methods: {
    exists: function(id) {
      return this.added.find(({ detail_name }) => {
        return detail_name === id;
      });
    },
    closeOnBlur: function({ target }) {
      if (this.$el.contains && !this.$el.contains(target)) {
        this.showList = false;
        this.removeListener();
      }
    },
    toggle: function() {
      this.showList = !this.showList;
      document.addEventListener('click', this.closeOnBlur, true);
    },
    removeListener: function() {
      document.removeEventListener('click', this.removeOnBlur);
    },
  },
  beforeDestroy: function() {
    this.removeListener();
  },
});
</script>

<style lang="sass" scoped>
.unnadded__container
  position: absolute
  right: 0
  top: 0
  width: 250px
  z-index: 2

.title
  text-align: right
  color: #2e71f0
  font-weight: bold
  font-size: 15px
  padding-right: 20px
  cursor: pointer
  position: relative

  &::after
    content: ''
    display: block
    width: 11px
    height: 10px
    position: absolute
    right: 0
    top: 4px
    background: url("../assets/arrowdown_bigger.svg") no-repeat right center
    transition: transform 0.2s
  
  &.opened::after
    transform: rotate(-180deg)

.containerunnadded
  background: #fff
  box-shadow: 0 0 30px rgba(0,0,0,0.1)
  padding: 15px 25px
  margin-top: 5px
  box-sizing: border-box
  max-height: calc(100vh - 110px)
  border-radius: 3px
  display: flex

.container__overflowunnadded
  // max-height: 100%
  width: 100%
  overflow: hidden

.container__scrollableunnadded
  overflow-y: scroll
  height: 100%
  width: calc(100% + 20px)

.scroll
  // height: calc(100vh - 140px)

.detail
  font-size: 14px
  color: #555
  line-height: 25px
  width: calc(100% - 20px)
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis

</style>

