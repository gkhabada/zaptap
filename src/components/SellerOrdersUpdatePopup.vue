<template lang="pug">
  .askupdate(@click="reload")
    .message У вас новый заказ! Хотите обновить страницу?
    .button Обновить
    .close(@click.stop="$emit('close')") Закрыть
</template>

<script>
export default {
  methods: {
    reload() {
      document.location.reload();
    },
  },
};
</script>

<style lang="scss" scoped>
.askupdate {
  cursor: pointer;
  position: fixed;
  top: 0;
  left: 190px;
  width: calc(100% - 190px);
  height: 60px;
  background: #0072f4;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  font-size: 14px;
  z-index: 99999;

  // &:hover {
  //   background: #1c86ff;
  // }
}

.button {
  font-weight: bold;
}

.close {
  position: absolute;
  right: 20px;
  font-size: 14px;
  font-weight: normal;
  border: 1px solid #fff;
  padding: 3px 5px;
  border-radius: 5px;

  &:hover {
    background: #fff;
    color: #0072f4;
  }
}
</style>


