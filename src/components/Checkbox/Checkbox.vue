<template lang="pug">
  .box(:class="{all: status === 2, almost: status === 1}" @click="onClick")
</template>
<script>
export default {
  props: {
    status: {
      type: Number,
      default: 0
    }
  },
  methods: {
    onClick() {
      this.$emit("click");
    }
  }
};
</script>
<style lang="sass" scoped>
.box
  width: 13px
  min-width: 13px
  height: 13px
  box-sizing: border-box
  border: 1px solid #dfdfdf
  cursor: pointer
  position: relative

.almost::after
  content: ''
  display: block
  position: absolute
  width: 7px
  height: 7px
  background: #f02e60
  top: 2px
  left: 2px

.all::after
  content: ''
  display: block
  position: absolute
  width: 13px
  height: 13px
  background: url("../../assets/checkbox.svg") no-repeat center center
  top: -1px
  left: -1px

</style>
