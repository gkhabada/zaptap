<template lang="pug">
  .popup(@click="close" v-if="!isActive && !isClosed")
    .popup__container(@click.stop="")
      .close(@click="close")
      .message
        p.line Запросы приостановлены Вам.
        p.line Чтобы возобновить процесс получения запросов,
        p.line поставьте галочку

      .check(@click="setActive")
        checkbox(:status="~~isActive * 2")
        span.checkbox__title Возобновить запросы

  .emptypopup(v-else)
</template>

<script>
import Checkbox from './Checkbox/Checkbox';
import { post } from '../api/request';

export default {
  data() {
    return {
      isActive: true,
      isClosed: false,
      pending: false,
    };
  },
  components: {
    Checkbox,
  },
  methods: {
    close() {
      if (this.pending) return;
      this.isClosed = true;
    },
    async setActive() {
      if (this.pending) return;
      this.pending = true;
      this.isActive = true;
      const { data } = await post('/stock/set-stock-status', {
        active: true,
      }).catch(err => {
        this.pending = false;
        console.log(err);
        this.isActive = false;
      });
      this.pending = false;
      if (data) {
        console.log(data);
        this.isActive = false;
      }
    },
    async getStatus() {
      const { data = {} } = await post('/stock/get-stock-status').catch(err => {
        console.log(err);
        this.isActive = false;
      });
      this.isActive = typeof data.active === 'boolean' ? data.active : true;
    },
  },
  created() {
    this.getStatus();
  },
};
</script>

<style scoped>
.popup {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10;
}

.popup__container {
  width: 450px;
  height: 165px;
  background: #fff;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.close {
  width: 23px;
  height: 23px;
  background: url('../assets/close-popup.svg') no-repeat center;
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
}

.message {
  text-align: center;
  font-size: 14px;
  color: #555;
}

.check {
  display: flex;
  margin-top: 20px;
  cursor: pointer;
}

.checkbox__title {
  font-size: 14px;
  color: #555;
  margin-left: 10px;
  line-height: 14px;
}
</style>

