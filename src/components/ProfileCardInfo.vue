<template lang="pug">
  .cardinfo(@click="$emit('close')")
    .image(@click.stop="")
      .close(@click.stop="$emit('close')")

</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.cardinfo {
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image {
  position: relative;
  width: 617px;
  height: 530px;
  background: url('../assets/cvcsafety.jpg') no-repeat center center;
}

.close {
  width: 23px;
  height: 23px;
  background: url('../assets/close-popup.svg') no-repeat center center;
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
}
</style>
