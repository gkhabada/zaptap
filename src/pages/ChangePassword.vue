<template lang="pug">
  .changepassword
    form.form(@submit.prevent="handleSubmit")
      h1.title Сменить пароль
      label
        .input__title Текущий пароль
        input.input(type="password" v-model="current" placeholder="Текущий пароль")

      label
        .input__title Новый пароль
        input.input(type="password" name="password" v-model="next" placeholder="Новый пароль")
        .errmsg(v-if="next.length > 0") {{ errors[0] }}

      button.button(type="submit" :disabled="errors.length > 0")
        .loading(v-if="pending")
        .message(v-else) Сменить

      .errors
        .errmsg(v-for="err in serverErrors") {{ err }}
</template>

<script>
import { post } from '../api/request';
export default {
  data: () => ({
    current: '',
    next: '',
    pending: false,
    serverErrors: [],
  }),
  computed: {
    errors() {
      const errors = [];
      if (this.next.length < 8) {
        errors.push('Минимальная длина пароля 8 символов');
      }
      if (this.next.length > 32) {
        errors.push('Максимальная длина пароля 32 символа');
      }
      return errors;
    },
  },
  methods: {
    async handleSubmit() {
      if (this.errors.length > 0) return;
      this.pending = true;
      this.serverErrors.splice(0);
      const body = {
        password: this.current,
        new_password: this.next,
      };
      const { err } = await post('/user/password-change', body)
        .then(() => ({ err: null }))
        .catch((err = {}) => {
          const { status } = err.response || {};
          if (status === 401) this.serverErrors.push('Неверный пароль');
          return { err };
        });
      this.pending = false;
      if (err) return;
      this.$router.push('/');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/mixins.sass';

.changepassword {
  font-family: 'Roboto', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 42px);
}

.form {
  width: 300px;
  padding: 20px 40px;
  box-sizing: border-box;
  background: #fafafa;
  box-shadow: 0 0 5px rgb(219, 219, 219);
  border-radius: 3px;
}

.title {
  font-size: 24px;
  text-align: center;
  color: #222;
  margin-bottom: 20px;
}

.input {
  border-radius: 3px;
  padding: 0 16px;
  border: 1px solid #dcdcdc;
  background: #fff;
  width: 100%;
  height: 100%;
  background: none;
  box-sizing: border-box;
  outline: none;
  color: #b1b1b1 - #888;
  font-size: 14px;
  display: block;
  height: 42px;
  line-height: 42px;

  @include placeholder {
    color: #b1b1b1;
    font-size: 14px;
    font-weight: 400;
  }
}

.input__title {
  color: #555;
  font-size: 14px;
  margin-bottom: 5px;
  margin-top: 10px;
}

.button {
  color: #fff;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  height: 42px;
  line-height: 42px;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  background: #2e71f0;
  border: none;
  border-bottom: 3px solid #2863d1;
  border-radius: 3px;
  margin: 0 auto;
  margin-top: 20px;
  display: block;
  cursor: pointer;

  &:disabled {
    background: #dedede;
    color: #b1b1b1;
    border-bottom-color: #bebebe;
    cursor: not-allowed;
  }
}

.loading {
  background: url('../assets/loading.svg') no-repeat center center;
  width: 50px;
  margin: 0 auto;
  height: 42px;
}

.errmsg {
  font-size: 14px;
  color: #555;
  margin-top: 5px;
}
</style>
