<template>
  <div class="specificationslist" :class="{opened: showList}">
    <div class="title" @click="toggle" :class="{opened: showList}">
      <div class="title__text">Параметры</div>
      <div class="title__arrow" :class="{opened: showList}"></div>
    </div>
    <div class="containerspecificationslist" :style="{height: showList ? 'calc(100vh - 190px)' : '0px'}">
      <div class="container__overflowspecificationslist">
        <div class="container__scrollablespecificationslist">
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Марка:</span> {{car.brand}}
          </div>
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Модель:</span> {{car.model}}
          </div>
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Поколение:</span> {{car.generation}}
          </div>
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Объем двигателя:</span> {{car.engine_volume}}
          </div>
          <div class="detail__item" :title="car.engine_type" :key="key">
            <span class="specName">Тип двигателя:</span> {{car.engine_type}}
          </div>
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Мощьность:</span> {{car.engine_power}}
          </div>
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Привод:</span> {{car.drive}}
          </div>
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Тип кузова:</span> {{car.body}}
          </div>
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Кпп:</span> {{car.transmission}}
          </div>
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Код кузова:</span> {{car.body_number}}
          </div>
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Код двигателя:</span> {{car.engine_number}}
          </div>
          <div class="detail__item" :title="car.detail_name" :key="key">
            <span class="specName">Рынок:</span> {{car.market}}
          </div>
        </div>
      </div>
      <div class="scrollspecificationslist">
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
            car: {Object}
        },
        data() {
            return {
                visible: true,
                fix: "specificationslist",
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
  .specName{
    color: black;
    font-weight: 700;
  }
  .specificationslist {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 2;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    &.opened{
      height: 100%;
    }
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
  .containerspecificationslist {
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
  .scrollspecificationslist {
  }

  .containerspecificationslist {
    margin-top: 5px;
    box-sizing: border-box;
    max-height: calc(100vh - 190px);
    display: flex;
    justify-content: space-between;
  }
  .container__overflowspecificationslist {
    // max-height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .container__scrollablespecificationslist {
    overflow-y: scroll;
    height: 100%;
    width: calc(100% + 20px);
  }
</style>
