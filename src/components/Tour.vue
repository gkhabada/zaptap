<template lang="pug">
  .layout(@click="close")
    .tour(:style="position.message" @click.stop="")
      .message
        .close(@click="close")
        .text {{ message }}
      .controls
        .prev(@click="change(-1)" v-if="state > 0")
        .next(@click="change(1)" v-if="state + 1 < tour.length")
    .mark(:style="position.mark")
</template>

<script>
import Vue from "vue";
import { tourList } from "../api/tour.js";
import {user} from '../helpers/authorization';

export default Vue.extend({
  props: {
    type: {
      type: String,
      required: true
    },
    func: {
      type: Object,
      default: () => ({})
    },
    changeRoute: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      state: 0
    };
  },
  computed: {
    tour() {
      if(this.type === 'global') {
        if(user.is_buyer && user.is_seller) {
          return tourList['RoleBoth'];
        }
        else if(user.is_buyer) {
          return tourList['RoleBuyer'];
        }
        else {
          return tourList['RoleSeller'];
        }
      }

      return tourList[this.type];
    },
    tourState() {
      return (this.tour || [])[this.state];
    },
    message() {
      return this.tourState.message;
    },
    page() {
      return this.tourState.page;
    },
    position() {
      const px = (v, b) => `${Math.abs(v) + (b || 0)}px`;
      const [x, y] = this.tourState.position;
      const xx = x >= 0 ? "left" : "right";
      const yy = y >= 0 ? "top" : "bottom";

      const message = { [xx]: px(x), [yy]: px(y) };
      const mark = { [xx]: px(x, -30), [yy]: px(y, 10) };
      return { message, mark };
    },
    showMenu() {
      return this.tourState.hasOwnProperty('showMenu') && this.tourState.showMenu;
    },
  },
  methods: {
    change(state) {
      this.state += state;
      this.$emit("change", this.state);
      this.$nextTick(() => {
        const func = this.showMenu ? this.func['menu'] : function() {};
        setTimeout(func, 150);
      });
    },
    close() {
      const close = this.func["close"] || function() {};
      close();
      this.$emit("close");
    }
  },
  watch: {
    page: {
      handler(page) {
        if (this.changeRoute) {
          this.$router.push({ name: page });
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.func.close) {
      this.func.close();
    }

    this.change(0);
  }
});
</script>

<style lang="sass" scoped>
$tt: 0.3s
$transition: top $tt, bottom $tt, left $tt, right $tt

.layout
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100vh
  z-index: 99999999
  background: rgba(0,0,0,0.3)

.tour
  position: fixed
  width: 420px
  padding: 35px 0 0 42px
  box-sizing: border-box
  background: #fff
  box-shadow: 0 0 60px 20px rgba(0,0,0,0.1)
  border-radius: 5px 5px 25px 5px
  transition: $transition

.message
  padding-right: 42px
  position: relative

.text
  font-family: 'Roboto', sans-serif
  line-height: 20px
  font-size: 16px
  color: #555

.close
  position: absolute
  right: 10px
  top: -25px
  width: 12px
  height: 12px
  background: url("../assets/detail_close.svg") no-repeat center center
  cursor: pointer

.mark
  position: fixed
  background: rgba(240, 46, 96, 0.5)
  width: 20px
  height: 20px
  border-radius: 10px
  display: flex
  justify-content: center
  align-items: center
  animation: pulse 2s infinite
  transition: $transition

  &::after
    content: ''
    display: block
    width: 6px
    height: 6px
    background: rgba(240, 46, 96, 1)
    box-shadow: 0 0 5px rgba(255,255,255,0.3)
    border-radius: 3px
    animation: pulse 2s infinite reverse

.controls
  height: 38px
  width: 100%
  display: flex
  justify-content: flex-end

.prev,
.next
  width: 38px
  height: 38px
  margin-left: 7px
  border-radius: 19px
  cursor: pointer

.prev
  background: url("../assets/tourprev.svg") no-repeat center center

.next
  background: url("../assets/tournext.svg") no-repeat center center

@keyframes pulse
  0%
    transform: scale(1)
  50%
    transform: scale(1.3)
  100%
    transform: scale(1)

</style>

