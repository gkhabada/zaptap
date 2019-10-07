<template lang="pug">
  .askpassword
    .ask
      .question Введите пароль, чтобы сменить email.
      input.input(type="password" placeholder="Пароль" v-model="password" name="password" @input="wrongpass = false")
      .wrongpass(v-if="wrongpass") Неверный пароль
      .errmsg(v-if="showError && password.length < 8") Минимум 8 символов
      .buttons
        .confirm(@click="confirm")
          .button__loader(v-if="pending")
          .button__text(v-else) Подтвердить
        .reject(@click="$emit('reject')") Отмена
</template>

<script>
import { post } from '../api/request';

export default {
  props: {
    email: String,
  },
  data() {
    return {
      password: '',
      showError: false,
      wrongpass: false,
      pending: false,
    };
  },
  methods: {
    confirm() {
      if (this.password.length < 8) {
        this.showError = true;
        return;
      }
      this.pending = true;
      post('/user/email-change', {
        email: this.email,
        password: this.password,
      })
        .then(() => {
          this.pending = false;
          this.$emit('confirm');
        })
        .catch(err => {
          this.pending = false;
          this.wrongpass = true;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/mixins.sass';

.askpassword {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ask {
  background: #fff;
  width: 300px;
  padding: 20px 30px;
}

.question {
  font-size: 14px;
  color: #555;
}

.input {
  width: 100%;
  max-width: 220px;
  box-sizing: border-box;
  height: 35px;
  outline: none;
  background: none;
  padding: 0 14px;
  color: #b1b1b1 - #888;
  font-size: 14px;
  font-weight: 300;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  margin-bottom: 13px;
  margin-top: 15px;

  @include placeholder {
    color: #b1b1b1;
    font-size: 14px;
    font-weight: 300;
  }
}

.buttons {
  display: flex;
}

.confirm,
.reject {
  color: #fff;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  height: 42px;
  line-height: 42px;
  box-sizing: border-box;
  text-align: center;
  background: #2e71f0;
  display: inline-block;
  border-bottom: 3px solid #2863d1;
  border-radius: 3px;
  cursor: pointer;
  width: 120px;
  &.disabled {
    cursor: default;
    color: #aaa;
    background: #dcdcdc;
    border-bottom-color: #bebebe;
  }
}

.reject {
  margin-left: 10px;
  background: #aaa;
  border-bottom-color: #888;
  width: 90px;
}

.errmsg,
.wrongpass {
  color: #555;
  font-size: 13px;
  line-height: 18px;
  margin-bottom: 10px;
}

.wrongpass {
  color: #f55;
}

.button__loader {
  background: url('../assets/loading.svg') no-repeat center center;
  width: 120px;
  margin: 0 auto;
  height: 39px;
}
</style>

