<template lang="pug">
  .container
    ask-password(@confirm="$emit('passwordConfirm')" @reject="$emit('passwordReject')" v-if="askPassword" :email="email")

    profile-card-info(v-if="showCardInfo" @close="showCardInfo = false")

    .container__overflow
      .container__scrollable
        .group
          .popup__title Мои данные
          .subtext Будут видны Вашим покупателям и продавцам

        .group
          .title Контакты

          .input__title Имя (либо название компании)
          .input__photo
            input.input__text(type="text" v-model="name" title="Имя")
            label.photo(for="avatar")
              .label__title Аватарка
              profile-photo-preview(:saved="avatar" :recent="changedPhotos.user")
            .bigfile(v-if="fileTooBig.user") Максимальный размер изображения 10 Мегабайт.
            input(type="file" accept=".jpg, .jpeg, .png, .gif" id="avatar" @change="setPhoto('user', $event)" hidden)

          .input__title Фамилия
          input.input__text(type="text" v-model="surname" title="Фамилия")
          .input__title Отчество
          input.input__text(type="text" v-model="thirdname" title="Отчество")

          .input__title Ваши телефоны
          .input__phone(v-for="(phone, index) in phones" title="Телефоны")
            .input__text(:style="{paddingLeft: '0px'}")
              input-phone(:value="phones[index]" @update:value="updateArrayField(phones, index, $event)" :styles="{paddingLeft: '14px'}")
            .input__add(@click="phones.push('')" v-if="phones.length === index + 1 && phones.length < 3")
            .input__remove(@click="phones.splice(index, 1)" v-if="index < (phones.length - 1)")

          .input__title E-mail
          input.input__text(type="email" v-model="email" title="email")
          .validation
            .validation__message(v-for="w in validation") {{ w }}

          // input.input__text(type="text" v-model="whatsapp" placeholder="What's App" title="Логин в whatsapp")
          // input.input__text(type="text" v-model="viber" placeholder="Viber" title="Логин в viber")
          // input.input__text(type="text" v-model="telegram" placeholder="Telegram" title="Логин в telegram")
          .input__title What's App
          .input__text
            input-phone(:value.sync="whatsapp" :style="{padding: '0'}")
          .input__title Viber
          .input__text
            input-phone(:value.sync="viber" :style="{padding: '0'}")
          .input__title Telegram
          .input__text
            input-phone(:value.sync="telegram" :style="{padding: '0'}")
          .input__title Skype
          input.input__text(type="text" v-model="skype" title="Логин skype")
          .input__title Ссылка на ваш сайт
          input.input__text(type="text" v-model="website" title="Ссылка на ваш сайт")

          template(v-if="user.is_seller")
            .input__title Цена доставки до т.к.
            input.input__number(type="number" v-model.number="deliveryCost" title="Цена доставки до т.к.")

          template(v-if="user.is_seller")
            .input__title Срок доставки до т.к.
            input.input__number(type="number" v-model.number="deliveryTerm" title="Срок доставки до т.к.")
            .validation
              .validation__message(v-for="w in deliveryTermValidation") {{ w }}

        .group
          .title Адрес

          .input__title Регион
          input.input__text(type="text" v-model="region" title="Регион")
          .input__title Населенный пункт
          input.input__text(type="text" v-model="city" title="Населенный пункт")
          .input__title Улица
          input.input__text(type="text" v-model="street" title="Улица")

          .input__title__line
            .input__title Дом
            .input__title Корпус
            .input__title Офис

          .line
            input.input__text(type="text" v-model="house" title="Дом")
            input.input__text(type="text" v-model="building" title="Корпус")
            input.input__text(type="text" v-model="office" title="Офис")

        .group
          .title Реквизиты для перечисления денег

        .group
          .title на карту

          .input__title Название банка
          input.input__text(type="text" v-model="bankname" title="Название банка")
          .input__title № карты
          .input__card
            input.input__number(type="text" v-model.number="card" title="№ карты")
            label.input__card__info(@click="showCardInfo = true") Подробнее
          .input__title ФИО получателя
          input.input__text.nopadding(type="text" v-model="recipient" title="ФИО получателя")

        .group
          .title на расчетный счет

          .input__title Расчетный счет
          input.input__number(type="text" v-model.number="checkingAccount" title="Расч. счет")
          .input__title ИНН
          input.input__number(type="text" v-model.number="inn" title="ИНН")
          .input__title БИК
          input.input__number(type="text" v-model.number="bik" title="БИК")
          .input__title Корреспондентский счет
          input.input__number(type="text" v-model.number="corrAccount" title="Корр. счет")
          .input__title Название компании
          input.input__text.nopadding(type="text" v-model="company" title="Название компании")

        .group(v-if="user.is_seller")
          .title Данные компании

          .input__title ИНН продавца
          .input__photo
            input.input__number(type="text" v-model="sellerInn" title="ИНН продавца")
            label.photo(for="innPhoto")
              .label__title фото
              profile-photo-preview(:saved="innPhoto" :recent="changedPhotos.inn")
            .bigfile(v-if="fileTooBig.inn") Максимальный размер изображения 10 Мегабайт.
            input(type="file" accept=".jpg, .jpeg, .png, .gif" id="innPhoto" @change="setPhoto('inn', $event)" hidden)

          .input__title ОГРН продавца
          .input__photo.nopadding
            input.input__number(type="text" v-model="sellerOgrn" title="ОГРН продавца")
            label.photo(for="ogrnPhoto")
              .label__title фото
              profile-photo-preview(:saved="ogrnPhoto" :recent="changedPhotos.ogrn")
            .bigfile(v-if="fileTooBig.ogrn") Максимальный размер изображения 10 Мегабайт.
            input(type="file" accept=".jpg, .jpeg, .png, .gif" id="ogrnPhoto" @change="setPhoto('ogrn', $event)" hidden)

        .group
          .title На кого отправлять запчасти

          .input__title ФИО
          input.input__text(type="text" v-model="deliveryFio" title="ФИО")
          .input__title Серия и номер паспорта
          input.input__text(type="text" v-model="deliveryPassport" title="Серия и номер паспорта")
          .input__title Телефон
          .input__text(:style="{paddingLeft: '0px'}")
            input-phone(:value.sync="deliveryPhone" title="Телефон" :styles="{paddingLeft: '14px'}")
          .input__title Выберите транспортные компании
            br
            template (напишите и нажмите enter, чтобы добавить свою)
          input-transport(:value.sync="transCompanies" )
          // input.input__text.nopadding(type="text" v-model="transCompanies" placeholder="Транспортные компании" title="Транспортные компании")

        .agreed
          checkbox(:status="agreed" @click="toggleCheckbox('agreed')" title="С условиями политики и договора согласен")

          .agreed__title
            .agreed__text(@click="toggleCheckbox('agreed')") С условиями
            router-link.agreed__link(to="/policy" target="_blank" title="Ссылка откроется в новом окне") политики
            .agreed__text(@click="toggleCheckbox('agreed')") и
            router-link.agreed__link(to="/contract" target="_blank" title="Ссылка откроется в новом окне") договора
            .agreed__text(@click="toggleCheckbox('agreed')") согласен

        .button(:class="{disabled: submittable}" @click="save")
          .button__loader(v-if="saving")
          .button__text(v-else) Сохранить
    .scroll
      scroll(v-bind="scrollProps" @scroll="handleScrollbarMovement")
</template>

<script>
import {
  fields,
  getComputedFields,
  changedFields
} from "../helpers/UserProfileFields.js";
import { post } from "../api/request";
import Checkbox from "../components/Checkbox/Checkbox";
import InputPhone from "../components/InputPhone/InputPhone";
import ProfilePhotoPreview from "../components/ProfilePhotoPreview";
import Vue from "vue";
import Scroll from "../components/Scroll/mixin.js";
import { user, login } from "../helpers/authorization.js";
import AskPassword from "../components/AskPassword.vue";
import InputTransport from "../components/InputTransport";
import ProfileCardInfo from "../components/ProfileCardInfo.vue";

export default Vue.extend({
  mixins: [Scroll],
  components: {
    Checkbox,
    InputPhone,
    ProfilePhotoPreview,
    AskPassword,
    InputTransport,
    ProfileCardInfo
  },
  data: () => ({
    ...fields,
    showCardInfo: false,
    agreed: 0,
    email: "",
    changedFields,
    askPassword: false,
    visible: true,
    fileTooBig: {
      user: false,
      inn: false,
      ogrn: false
    },
    saving: false,
    user,
  }),
  computed: {
    ...getComputedFields(),
    validation() {
      const validation = [];

      const re = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
      if (!re.test(this.email)) validation.push("Введен некорректный email.");
      if (this.email.length > 40)
        validation.push("Максимальная длина email 40 символов.");
      if (this.email.length < 5)
        validation.push("Минимальная длина email 5 символов.");
      return validation;
    },
    deliveryTermValidation() {
      const validation = [];

      if(this.serverdelivery_term.value) {
        if (this.serverdelivery_term.value < 1) validation.push('Минимальный срок доставки до т.к. - 1 день');
        if (this.serverdelivery_term.value > 90) validation.push('Максимальный срок доставки до т.к. - 90 дней');
      }

      return validation;
    },
    submittable() {
      const currentEmail = user.data && user.data.social.mail;
      if (this.agreed === 0) return true;
      if (currentEmail !== this.email) return false;
      if (this.validation.length !== 0) return true;
      if (this.deliveryTermValidation.length !== 0) return true;
      if (this.changedFields.length === 0) return true;
      return false;
    },
    changedPhotos() {
      const fields = Object.keys(this.fileTooBig);
      return fields.reduce((c, field) => {
        const found =
          this.changedFields.find((v = {}) => field === v.field) || {};
        return Object.assign(c, { [field]: found.value || false });
      }, {});
    }
  },
  filters: {},
  methods: {
    updateArrayField(values, index, update) {
      const copy = [...values];
      copy[index] = update;
      this.phones = copy;
    },
    getChangedField(field) {
      const found =
        this.changedFields.find((v = {}) => field === v.field) || {};
      return found.value || false;
    },
    changeEmail() {
      return new Promise((res, rej) => {
        const currentEmail = user.data && user.data.social.mail;
        if (this.email !== currentEmail) {
          this.askPassword = true;
          this.$once("passwordConfirm", () => {
            this.askPassword = false;
            user.data.social.mail = this.email;
            res();
          });
          this.$once("passwordReject", () => {
            this.askPassword = false;
            this.saving = false;
            rej();
          });
        } else {
          res();
        }
      });
    },
    async save() {
      if (this.saving) return;
      this.saving = true;

      await this.changeEmail()
        .then(() => (this.askPassword = false))
        .catch(() => (this.askPassword = false));

      const temp = {};
      const downloadPromise = [];
      const allFields = Object.keys(fields);

      this.changedFields.forEach(({ type, field, value } = {}) => {
        if (type === "image") {
          downloadPromise.push(this.uploadPhoto(value, field));
        } else {
          const serverField = allFields.find(k => fields[k].field === field);
          const fieldName = serverField.slice(6);
          const isArray = Array.isArray(value);

          if (fieldName) temp[fieldName] = isArray ? value.join(";") : value;
        }
      });
      await Promise.all(downloadPromise).catch(err => {
        console.log(err);
        this.saving = false;
      });

      return post("/profile/set-user-profile", temp)
        .then(({ data } = {}) => {
          this.changedFields.splice(0);
          this.saving = false;
        })
        .then(() => {
          const { refresh } = user;
          return login({ refresh });
        })
        .catch(console.log);
    },
    toggleCheckbox(field) {
      const value = Number(this[field]);
      this[field] = value === 0 ? 2 : 0;
      if (this.agreed === 2) {
        localStorage.setItem("licenseagreement", "true");
      } else {
        localStorage.removeItem("licenseagreement");
      }
    },
    getUrlFromFile(file) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = e => {
          const result = e && e.target && e.target.result;
          if (!result) return reject("No result");
          resolve(result);
        };
        reader.readAsDataURL(file);
      });
    },
    setPhoto(field, e = {}) {
      const { files = [] } = e.dataTransfer || e.target || {};
      /** @type {File} */
      const file = files[0];
      const isImage = file instanceof File && file.type.startsWith("image");
      if (!isImage) return;
      const maxSize = 1024 * 1024 * 10; // 10 Mb
      console.log(file.size, maxSize);
      if (file.size >= maxSize) {
        this.fileTooBig[field] = true;
        return;
      }
      this.fileTooBig[field] = false;

      const found = this.changedFields.find((v = {}) => field === v.field);
      if (!found) {
        this.changedFields.push({
          type: "image",
          value: file,
          field
        });
      } else {
        this.$set(found, "value", file);
      }
      // this.$forceUpdate();
      e.target.value = "";
    },
    uploadPhoto(file, field) {
      const body = new FormData();
      body.set("photo", file, file.name);
      body.set("photo_type", field);

      return post("/profile/upload-photo", body)
        .then(({ data } = {}) => {
          if (data) console.log(data);
        })
        .catch(error => console.log(error.message));
    },
    async getUserData() {
      const userData = user.data;
      if (userData) {
        const { social = {} } = user.data;
        this.email = social.mail || "";
      }
      const { data } = await post("/profile/get-user-profile");
      if (!data) return;
      Object.keys(data).forEach(serverField => {
        if (!this["server" + serverField]) return; //console.log('no field: %s', serverField);
        const { field, value } = this["server" + serverField];
        /** @type {String} */
        const serverValue = data[serverField];
        if (Array.isArray(value)) {
          const arrayValue = String(serverValue || "")
            .split(";")
            .filter(x => x);
          const isPhones = serverField === "phones";
          const isEmpty = arrayValue.length === 0;
          this[field] = isPhones && isEmpty ? [""] : arrayValue;
        } else {
          this[field] = String(serverValue || "");
        }
      });
    }
  },
  created() {
    this.getUserData();
    this.agreed = localStorage.getItem("licenseagreement") ? 2 : 0;
  },
  beforeDestroy() {
    this.changedFields.splice(0);
    Object.keys(fields).forEach(k => {
      const field = this[k];
      field.value = Array.isArray(field.value) ? [] : "";
    });
  }
});
</script>

<style lang="sass" scoped>
@import "../assets/mixins.sass"

.popup
  width: 635px
  height: 100%
  position: relative
  background: #fff
  // margin: 0 auto
  padding: 39px 0 140px
  box-sizing: border-box

.popup__title
  color: #2a313d
  font-size: 20px
  font-family: 'Fira Sans', sans-serif
  text-align: center

.subtext
  color: #2a313d
  font-size: 14px
  margin-top: 16px
  margin-bottom: 34px
  text-align: center

.group
  // margin-bottom: 34px
  // margin-left: 116px
  max-width: 420px
  margin: 0 auto 34px

.title
  font-size: 16px
  line-height: 11px
  text-align: center
  color: #2a313d
  margin-bottom: 28px
  font-weight: 700

.input__photo
  position: relative

.input__photo,
.input__phone,
.input__card
  width: 418px
  height: 35px
  border: 1px solid #e0e0e0
  border-radius: 3px
  box-sizing: border-box
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: 19px

.input__text,
.input__number
  width: 100%
  max-width: 418px
  box-sizing: border-box
  height: 35px
  outline: none
  background: none
  padding: 0 14px
  color: #b1b1b1 - #888
  font-size: 14px
  font-weight: 300
  border: 1px solid #e0e0e0
  border-radius: 3px
  margin-bottom: 13px

  @include placeholder
    color: #b1b1b1
    font-size: 14px
    font-weight: 300

.input__card,
.input__photo
  .input__text,
  .input__number
    padding-right: 38px
    border: none
    margin-bottom: 0

.input__card__info
  font-size: 14px
  color: #2e71f0
  line-height: 35px
  height: 35px
  padding-right: 13px
  position: relative
  text-decoration: underline
  cursor: pointer

.input__phone
  .input__text,
  .input__number
    border: none
    margin-bottom: 0

.inputphone
  padding: 0 14px

.line .input__text,
.nopadding
  margin-bottom: 0

.line
  display: flex
  justify-content: space-between

  .input__text
    width: 31%

  .input__text:nth-child(2)
    margin: 0 14px

.input__number
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button,
    -webkit-appearance: none
    -moz-appearance: textfield
    appearance: none
    margin: 0
  &
    -webkit-appearance: none
    -moz-appearance: textfield
    appearance: none


.photo
  font-size: 14px
  color: #2e71f0
  line-height: 35px
  height: 35px
  padding-right: 13px
  padding-left: 28px
  position: relative
  // text-decoration: underline
  cursor: pointer

  &::before
    content: ''
    display: block
    width: 18px
    height: 17px
    background: url("../assets/clip.svg") no-repeat center center
    position: absolute
    top: 9px
    left: 0px

.label__title
  text-decoration: underline

.input__add,
.input__remove
  width: 15px
  min-width: 15px
  height: 15px
  cursor: pointer
  padding-right: 10px
  background: no-repeat 0 center
  background-size: contain

.input__add
  background-image: url("../assets/input-add.svg")

.input__remove
  background-image: url("../assets/input-remove.svg")

.container__scrollable
  overflow-y: scroll
  height: 100%
  width: calc(100% + 20px)
  padding: 30px 0 30px 100px
  box-sizing: border-box

.container__overflow
  height: calc(100vh - 42px)
  overflow: hidden
  width: 100%

.container
  height: 100%
  display: flex
  font-family: 'Roboto', sans-serif
  // margin-top: 34px

.agreed
  display: flex
  // margin-left: 116px
  cursor: pointer
  justify-content: center

.agreed__title
  font-size: 14px
  margin-left: 11px
  line-height: 15px

.agreed__text
  color: #444343
  display: inline
  user-select: none

.agreed__link
  color: #2e71f0
  display: inline-block
  margin: 0 4px

.button
  color: #fff
  font-size: 11px
  text-transform: uppercase
  font-weight: 700
  height: 42px
  line-height: 42px
  width: 160px
  box-sizing: border-box
  text-align: center
  background: #2e71f0
  border-bottom: 3px solid #2863d1
  border-radius: 3px
  margin: 42px auto 0
  cursor: pointer

  &.disabled
    cursor: default
    color: #aaa
    background: #dcdcdc
    border-bottom-color: #bebebe


.scroll
  margin-right: 10px
  height: calc(100vh - 82px)
  margin-top: 20px

.bigfile
  font-size: 12px
  color: #f55
  position: absolute
  top: 37px
  right: 0

.button__loader
  background: url("../assets/loading.svg") no-repeat center center
  width: 160px
  margin: 0 auto
  height: 39px

.validation
  margin: 0 0 10px

.validation__message
  font-size: 13px
  color: #f55

.input__title
  font-size: 13px
  color: #555
  padding-left: 15px
  margin-bottom: 5px
  box-sizing: border-box

.input__title__line
  display: flex
  .input__title
    width: 33.3%
</style>


