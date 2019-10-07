<template lang="pug">
  .cartpopup(@click="$emit('agree', false)")
    .container(@click.stop="")
      .close(@click.stop="$emit('agree', false)")
      .message
        p.text Ответственность за покупку запчастей лежит на Вас.
        p.text Позвоните продавцу и напомните о своем заказе.
        .dontshow 
          checkbox(:status="skipNext" @click="toggle")
          .ask.noselect(@click="toggle") Не показывать больше это сообщение
        .ok(@click="$emit('agree', true)") ОК

</template>

<script>
import Vue from "vue";
import Checkbox from "./Checkbox/Checkbox";
export default Vue.extend({
  components: { Checkbox },
  data() {
    return { skipNext: 0 };
  },
  methods: {
    toggle() {
      if (this.skipNext) {
        localStorage.removeItem("showAgreementInCart");
        this.skipNext = 0;
      } else {
        localStorage.setItem("showAgreementInCart", "false");
        this.skipNext = 2;
      }
    }
  },
  created() {
    this.skipNext = localStorage.getItem("showAgreementInCart") ? 2 : 0;
  }
});
</script>

<style lang="sass" scoped>
.cartpopup
  position: fixed
  width: 100%
  height: 100vh
  top: 0
  left: 0
  background: rgba(0,0,0,0.7)
  z-index: 3
  display: flex
  justify-content: center
  align-items: center

.container
  width: 530px
  height: 230px
  box-sizing: border-box
  background: #fff
  position: relative
  padding: 50px 60px

.close
  width: 23px
  height: 23px
  position: absolute
  top: 0
  right: 0
  background: url("../assets/close-popup.svg")

.message
  font-size: 14px
  color: #222
  text-align: center
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center

.text
  margin-bottom: 5px
  text-align: center
  // font-weight: bold

.dontshow
  display: flex
  margin-top: 20px

.ask
  margin-left: 10px
  line-height: 15px
  cursor: pointer

.ok
  width: 80px
  height: 42px
  margin: 30px auto 0
  line-height: 42px
  text-align: center
  background: #2e71f0
  box-sizing: border-box
  border-bottom: 3px solid #2863d1
  font-size: 11px
  color: #fff
  text-transform: uppercase
  border-radius: 3px
  font-weight: bold
  cursor: pointer
</style>
