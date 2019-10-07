<template lang="pug">
  .loginform
    .logo
    .type Авторизация
    .container
      form(@submit.prevent="login")
        input.input(type="email" v-model="email" placeholder="Введите email" name="email")
        input.input(type="password" v-model="password" placeholder="Введите пароль" name="pass")
        button.button(type="submit") Войти на сайт

      .servererr(v-if="err") Неверный логин или пароль

    a.register(:href="landingLink") Регистрация
</template>

<script>
export default {
  props: {
    err: Boolean
  },
  data() {
    const dev = process.env.PROD_ENV === "development";
    return {
      email: "",
      password: "",
      landingLink: dev ? "//dev.zaptap.ru" : "//zaptap.ru"
    };
  },
  computed: {
    validation() {
      const email = [];
      const password = [];

      const re = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
      if (!re.test(this.email)) email.push("Введен некорректный email.");
      if (this.email.length > 40)
        email.push("Максимальная длина email 40 символов.");
      if (this.email.length < 5)
        email.push("Минимальная длина email 5 символов.");
      if (this.password.length < 8)
        password.push("Минимальная длина пароля 8 символов.");
      return { email, password };
    }
  },
  watch: {
    email() {
      this.resetErrs();
    },
    password() {
      this.resetErrs();
    }
  },
  methods: {
    resetErrs() {
      this.$emit("update:err", false);
    },
    login() {
      const { email: vEmail, password: vPassword } = this.validation;
      if (vEmail.length > 0) return;

      const { email, password } = this;
      this.$emit("login", { email, password });
    }
  }
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
  font-family: "Roboto", sans-serif;
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
  background: url("../assets/loginlogo.svg") no-repeat center center;
  position: absolute;
  top: 30px;
  z-index: 0;
}
</style>
