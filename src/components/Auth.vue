<template>
  <div class="auth">

    <div id="signup" v-if="show === 'auth'" class="popup_wrapper">
      <div class="click_and_hide_popup" @click="closePopup()"></div>
      <div class="popup_body signup_modal">
        <button class="popup_close modal_close" @click="closePopup()">Закрыть</button>
        <div class="modal_tabs">
          <button @click="formType = 'login'" :class="['trigger_login modal_tabs_button', + (formType === 'login') ? 'active' : '']">Вход</button>
          <button @click="formType = 'register'" :class="['trigger_register modal_tabs_button', + (formType === 'register') ? 'active' : '']">Регистрация</button>
        </div>
        <div class="modal_tabs_content">
          <div id="login" v-show="formType === 'login'" class="">
            <form data-action="login" class="form_modal form_login" @submit.prevent="login">
              <input type="email" v-model="email" name="email" placeholder="E-mail" class="modal_input">
              <input type="password" v-model="password" name="password" placeholder="Пароль" class="modal_input">
              <div class="servererr" v-if="err">Неверный логин или пароль</div>
              <div class="form_line form_line-center">
                <button class="form_link popup_link" data-src="#remember" type="button">Забыли пароль?</button>
              </div>
              <div class="form_bottom">
                <button class="form_button" type="submit">Войти</button>
              </div>
              <div class="error-section hidden"></div>
            </form>
          </div>
          <div id="register" v-show="formType === 'register'" class="">
            <form data-action="register" id="modal_registr_form" class="form_modal form_register" @submit.prevent="register">
              <input required type="text" v-model="name" name="name" placeholder="Имя" class="modal_input">
              <input required type="email" v-model="email" name="email" placeholder="E-mail" class="modal_input">
              <input required type="text" v-model="locality" name="locality" placeholder="Город" class="modal_input" id="registrationLocality">
              <input required type="tel" v-model="phones" name="phones" placeholder="Телефон (9 символов)" class="modal_input" id="phoneInput">
              <input required type="password" v-model="password" name="password" placeholder="Пароль" class="modal_input">
              <div class="form_line reg_line">
                <label for="agreed_reg" class="form_checkbox">
                  <input required type="checkbox" v-model="agreed" name="agreed" id="agreed_reg" checked="checked">
                  <div class="form_checkbox_div"></div>
                  <div class="checkbox__title">
                    Я согласен с <br>
                    <a href="#" @click.prepend="showAgreement()" class="agreement__link" data-parcel-ignore>условиями сайта</a>
                  </div>
                </label>
                <button class="form_button reg_button" onclick="localStorage.setItem('bottom_and_popup_reg', 'false');"
                        type="submit">Регистрация
                </button>
                <div class="error-section hidden"></div>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>

    <div id="choose_role" class="popup_wrapper" v-if="show === 'role'">
      <div class="click_and_hide_popup"></div>
      <div class="popup_body choose_role__modal">
        <form action="" @submit.prevent="choseRoleAndRegistry()">
          <h3 class="choose_role__title">Я хочу работать как:</h3>
          <div class="choose_role__buttons">
            <label :class="['choose_role__button', roles === 'roleBuyer' ? 'choose_role__button_state_selected' : '']">
              <input required type="radio" style="display: none" v-model="roles" value="roleBuyer">
              <div class="choose_role__button--img img1"></div>
              <p class="choose_role__button--title">Покупатель</p>
            </label>
            <label :class="['choose_role__button', roles === 'roleSeller' ? 'choose_role__button_state_selected' : '']">
            <input required type="radio" style="display: none" v-model="roles" value="roleSeller">
              <div class="choose_role__button--img img2"></div>
              <p class="choose_role__button--title">Продавец</p>
            </label>
            <label :class="['choose_role__button', roles === 'roleBoth' ? 'choose_role__button_state_selected' : '']">
              <input required type="radio" style="display: none" v-model="roles" value="roleBoth">
              <div class="choose_role__button--img img3"></div>
              <p class="choose_role__button--title">Покупатель и продавец</p>
            </label>
            <!--<button class="choose_role__button choose_role__button_state_selected" id="roleBuyer">
              <div class="choose_role__button&#45;&#45;img img1"></div>
              <p class="choose_role__button&#45;&#45;title">Покупатель</p>
            </button>
            <button class="choose_role__button" id="roleSeller">
              <div class="choose_role__button&#45;&#45;img img2"></div>
              <p class="choose_role__button&#45;&#45;title">Продавец</p>
            </button>
            <button class="choose_role__button" id="roleBoth">
              <div class="choose_role__button&#45;&#45;img img3"></div>
              <p class="choose_role__button&#45;&#45;title">Покупатель и продавец</p>
            </button>-->
          </div>
          <div class="choose_role__footer">
            <button class="form_button recover_button" type="submit">OK</button>
          </div>
        </form>
      </div>
    </div>

    <div id="register_send" class="popup_wrapper" v-if="show === 'complete'">
      <div class="click_and_hide_popup" @click="closePopup()"></div>
      <div class="popup_body remeber_modal">
        <button class="popup_close modal_close" @click="closePopup()">Закрыть</button>
        <p class="remember_title">Вам отправлен Email.</p>
        <p class="remember_subtext">Для входа в аккаунт необходимо перейти по ссылке в письме</p>
        <p id="recover_email" class="recover_text"></p>
        <button class="form_button recover_button" @click="closePopup()" type="button">OK</button>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  props: {
    err: Boolean
  },
  data () {
    const dev = process.env.PROD_ENV === 'development';
    return {
      name: '',
      locality: '',
      phones: '',
      email: '',
      password: '',
      agreed: '',
      roles: '',
      formType: 'login',
      show: 'auth',
      landingLink: dev ? '//dev.zaptap.ru' : '//zaptap.ru'
    };
  },
  computed: {
    validation () {
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
    }
  },
  watch: {
    email () {
      this.resetErrs();
    },
    password () {
      this.resetErrs();
    }
  },
  methods: {
    showAgreement () {
      this.$emit('agreement');
    },
    closePopup () {
      this.$emit('close');
    },
    resetErrs () {
      this.$emit('update:err', false);
    },
    login () {
      const { email: vEmail, password: vPassword } = this.validation;
      if (vEmail.length > 0) return;

      const { email, password } = this;
      this.$emit('login', { email, password });
    },
    register () {
      this.show = 'role';
    },
    choseRoleAndRegistry () {
      let regInfo = {
        email: this.email,
        name: this.name,
        locality: this.locality,
        phones: this.phones,
        password: this.password,
        roles: this.roles
      };
      this.show = 'complete';
      this.$emit('register', regInfo);
    }
  }
};
</script>
