<template>
  <div class="detailslist">
    <div class="title" @click="toggle" :class="{opened: showList}">
      <div class="title__text">Список запчастей</div>
      <div class="title__arrow" :class="{opened: showList}"></div>
    </div>
    <div class="containerdetailslist" :style="{height: showList ? 'calc(100vh - 190px)' : '0px'}">
      <div class="container__overflowdetailslist">
        <div class="container__scrollabledetailslist">
          <div
            class="detail__item"
            v-for="(detail, key) in details"
            :title="detail.detail_name"
            :key="key"
          >{{detail.detail_name}}</div>
        </div>
      </div>
      <div class="scrolldetailslist">
        <scroll v-bind="scrollProps" @scroll="handleScrollbarMovement"/>
      </div>
    </div>
  </div>
</template>

<script>
import Scroll from "./Scroll/mixin.js";

export default {
  mixins: [Scroll],
  props: {
    details: [Array]
  },
  data() {
    return {
      visible: true,
      fix: "detailslist",
      showList: false
    };
  },
  methods: {
    toggle() {
      this.showList = !this.showList;
      this.$options.timer = setTimeout(() => {
        this.setScrollProps();
      }, 350);
    }
  },
  mounted() {
    this.$root.$on("resize", () => {
      clearTimeout(this.$options.timer);
      this.$options.timer = setTimeout(() => {
        this.setScrollProps();
      }, 350);
    });
  }
};
</script>

<style lang="scss" scoped>
.detailslist {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.title {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 57px;
  text-align: center;
  cursor: pointer;
}
.title__text {
  font-size: 15px;
  font-weight: bold;
  color: #2e71f0;
  margin-right: 10px;
}
.title__arrow {
  width: 11px;
  height: 10px;
  background: url("../assets/arrowdown_bigger.svg") no-repeat center center;
  transition: transform 0.2s;

  &.opened {
    transform: rotate(180deg);
  }
}
.containerdetailslist {
  height: calc(100vh - 190px);
  transition: height 0.3s ease-in-out;
}
.detail__item {
  font-size: 14px;
  color: #26282f;
  height: 43px;
  padding: 0 36px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 43px;

  &:nth-child(2n) {
    background: #f6f6f6;
  }
}
.scrolldetailslist {
}

.containerdetailslist {
  margin-top: 5px;
  box-sizing: border-box;
  max-height: calc(100vh - 190px);
  display: flex;
  justify-content: space-between;
}
.container__overflowdetailslist {
  // max-height: 100%;
  width: 100%;
  overflow: hidden;
}

.container__scrollabledetailslist {
  overflow-y: scroll;
  height: 100%;
  width: calc(100% + 20px);
}
</style>
