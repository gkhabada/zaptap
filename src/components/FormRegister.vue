<template lang="pug">
  .loginform
    template(v-if="!registered")
      .logo
      .type Регистрация
      .container
        form(@submit.prevent="register")
          input.input(type="email" v-model="email" placeholder="Введите email" name="email")
          input.input(type="password" v-model="password" placeholder="Введите пароль" name="pass")
          input.input(type="password" v-model="passwordRepeat" placeholder="Повторите пароль" name="passrepeat")
          button.button(type="submit") Регистрация
          
        .errors
          .email(v-for="w in validation.email" v-if="email.length > 3") {{w}}
          .password(v-for="w in validation.password" v-if="password.length > 3") {{w}}
          .password(v-if="passwordRepeat.length >= 8 && password !== passwordRepeat") Пароли не совпадают
        .servererr(v-if="err") Данный email уже занят

      .register(@click="$emit('toggle')") Авторизация
    .registered(v-else)
      .registered__message Почти все готово. Ссылка с подтверждением прийдет к вам на почту в течении нескольких минут.
</template>

<script>
export default {
  props: {
    err: Boolean,
    registered: Boolean,
  },
  data() {
    return {
      email: '',
      password: '',
      passwordRepeat: '',
    };
  },
  computed: {
    validation() {
      const email = [];
      const password = [];

      const re = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
      if (!re.test(this.email)) email.push('Введен некорректный email.');
      if (this.email.length > 40)
        email.push('Максимальная длина email 40 символов.');
      if (this.email.length < 5)
        email.push('Минимальная длина email 5 символов.');
      if (this.password.length < 8)
        password.push('Минимальная длина пароля 8 символов.');
      return { email, password };
    },
  },
  watch: {
    email() {
      this.resetErrs();
    },
    password() {
      this.resetErrs();
    },
    passwordRepeat() {
      this.resetErrs();
    },
  },
  methods: {
    resetErrs() {
      this.$emit('update:logerr', false);
      this.$emit('update:regerr', false);
    },
    register() {
      const { email: vEmail, password: vPassword } = this.validation;
      if (vEmail.length + vPassword.length > 0) return;
      if (this.password !== this.passwordRepeat) return;

      const { email, password } = this;
      this.$emit('register', { email, password });
    },
  },
};
</script>


<style lang="scss" scoped>
.type {
  font-size: 24px;
  color: #fff;
  font-weight: bold;
  margin-bottom: 20px;
}

.loginform {
  background: #363c48;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Roboto', sans-serif;
}

.container {
  width: 300px;
  padding: 35px 18px 15px;
  box-shadow: 0 0 10px #363c48 - #222;
  box-sizing: border-box;
  border-radius: 3px;
  background: #fff;
  position: relative;
}

.title {
  font-weight: bold;
  text-align: center;
  font-weight: 14px;
  margin-bottom: 20px;
}

.input {
  font-size: 14px;
  line-height: 30px;
  margin-bottom: 10px;
  border: 1px solid #363c48;
  outline: none;
  color: #363c48;
  border-radius: 3px;
  padding: 0 5px;
  width: 100%;
  box-sizing: border-box;
}

.button {
  width: 100%;
  text-align: center;
  background: #363c48;
  color: #fff;
  border: none;
  padding: 10px 0;
  cursor: pointer;
}

.errors,
.servererr {
  font-size: 13px;
  margin-top: 20px;
  line-height: 16px;
  color: #363c48;
}

.servererr {
  color: rgb(241, 77, 77);
}

.register {
  color: #fff;
  font-size: 14px;
  margin-top: 20px;
  text-decoration: underline;
  cursor: pointer;
}

.logo {
  width: 100px;
  height: 50px;
  background: url('../assets/zaptap.png') no-repeat center center;
  position: absolute;
  top: 30px;
  z-index: 0;
}

.registered {
  width: 500px;
  padding: 20px 30px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 5px;
}

.registered__message {
  font-size: 16px;
  color: #555;
  text-align: center;
}
</style>
