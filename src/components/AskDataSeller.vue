<template lang="pug">
  .emptypopup(v-if="loading")
  .popup(v-else)
    .popup__container
      .close(@click.stop="$emit('action', false)")
      .title Укажите ваши данные

      .container
        .container__overflow
          .container__scrollable
            form.form(@submit.prevent="handleSubmit")
              input.input(type="text" v-model="name" placeholder="Имя (или название компании)")
              template(v-for="(phone, i) in phones")
                label.phone
                  input-phone(:value.sync="phones[i]" :style="phoneStyle" placeholder="Телефон")
                  .add__phone(@click="addPhone(i)" v-if="i + 1 === phones.length && phones.length < 3")
                  .remove__phone(@click="removePhone(i)" v-if="i < (phones.length - 1)")
              input.input(type="text" v-model="locality" placeholder="Населенный пункт")
              input.input(type="text" v-model="delivery_price" maxlength="5" placeholder="Цена доставки до т.к.")

              .agreed
                checkbox(:status="agreed" @click="toggleCheckbox('agreed')" title="С условиями политики и договора согласен")

                .agreed__title
                  .agreed__text(@click="toggleCheckbox('agreed')") С условиями
                  router-link.agreed__link(to="/policy" target="_blank" title="Ссылка откроется в новом окне") политики
                  .agreed__text(@click="toggleCheckbox('agreed')") и
                  router-link.agreed__link(to="/contract" target="_blank" title="Ссылка откроется в новом окне") договора
                  .agreed__text(@click="toggleCheckbox('agreed')") согласен
              // .hint * Все поля обязательны
              .err(v-if="showError") Неизвестная ошибка
              button.button(type="submit" :disabled="invalidForm")
                .button__loader(v-if="pending")
                .button__title(v-else) Сохранить

        .scroll
          scroll(v-bind="scrollProps" @scroll="handleScrollbarMovement")
</template>

<script>
import InputPhone from "./InputPhone/InputPhone.vue";
import InputTransport from "./InputTransport.vue";
import Checkbox from "./Checkbox/Checkbox.vue";
import { post } from "../api/request";
import { user } from "../helpers/authorization";
import Scroll from "../components/Scroll/mixin";

export default {
  mixins: [Scroll],
  components: { InputPhone, InputTransport, Checkbox },
  data: () => ({
    loading: true,
    showError: false,
    pending: false,
    visible: true,
    name: "",
    surname: "",
    thirdname: "",
    phones: [""],
    region: "",
    locality: "",
    street: "",
    house: "",
    corps: "",
    office: "",
    delivery_price: "",
    agreed: 0,
    phoneStyle: {
      height: "32px",
      border: "1px solid #dedede",
      borderRadius: "3px",
      marginBottom: "10px",
      padding: "0 10px"
    }
  }),
  computed: {
    invalidForm() {
      if (!this.name.trim()) return true;
      // if (!this.surname.trim()) return true;
      // if (!this.thirdname.trim()) return true;
      if (!this.phones.some(x => x.trim().length >= 6)) return true;
      // if (!this.region.trim()) return true;
      if (!this.locality.trim()) return true;
      // if (this.street.trim().length === 0) return true;
      // if (this.house.trim().length === 0) return true;
      // if (this.corps.trim().length === 0) return true;
      // if (this.office.trim().length === 0) return true;
      if (new String(this.delivery_price).trim().length === 0) return true;
      if (!this.agreed) return true;

      return false;
    }
  },
  methods: {
    getNumberFromString(v) {
      const re = /\d+/;
      const result = re.test(v);
      if (!result) return 0;
      const n = parseFloat(result[0]);
      if (isNaN(n)) return 0;
      return n;
    },
    async handleSubmit() {
      if (this.invalidForm) return;
      this.showError = false;
      this.pending = true;

      const userData = {
        name: this.name,
        surname: this.surname,
        patronymic: this.thirdname,
        phones: this.getStringFromArray(this.phones),
        region: this.region,
        locality: this.locality,
        street: this.street,
        house: this.house,
        corps: this.corps,
        office: this.office,
        delivery_price: this.getNumberFromString(this.delivery_price)
      };

      const result = await post("/profile/set-user-profile", userData)
        .then(({ data }) => {
          console.log(data);
          user.data.name = userData.name;
          user.data.surname = userData.surname;
          return true;
        })
        .catch(err => {
          this.showError = true;
          return false;
        });
      this.pending = false;
      if (!result) return;
      this.$emit("action", true);
    },
    addPhone(i) {
      this.phones.splice(i + 1, 0, "");
    },
    removePhone(i) {
      if (this.phones.length > 1) this.phones.splice(i, 1);
    },
    toggleCheckbox() {
      this.agreed = this.agreed === 2 ? 0 : 2;
      if (this.agreed === 2) {
        localStorage.setItem("licenseagreement", "true");
      } else {
        localStorage.removeItem("licenseagreement");
      }
    },
    getArrayFromString(str) {
      if (typeof str !== "string") return [""];
      return str.split(";");
    },
    getStringFromArray(arr) {
      if (!Array.isArray(arr) || arr.length === 0) return "";
      return arr.join(";");
    },
    async getUser() {
      const id = user.data.user_id;
      if (!id) return;
      const { data } = await post("/profile/get-user-profile/" + id).catch(
        () => ({ data: null })
      );
      this.loading = false;
      if (!data) return;
      console.log(data);
      this.name = data.name || "";
      this.surname = data.surname || "";
      this.thirdname = data.patronymic || "";
      this.phones = this.getArrayFromString(data.phones);
      this.region = data.region || "";
      this.locality = data.locality || "";
      this.street = data.street || "";
      this.house = data.house || "";
      this.corps = data.corps || "";
      this.office = data.office || "";
      this.delivery_price = data.delivery_price || "";

      if (!this.invalidForm) this.$emit("action", true);
    }
  },
  created() {
    this.agreed = localStorage.getItem("licenseagreement") ? 2 : 0;
    this.getUser();
  }
};
</script>

<style lang="scss" scoped>
@import "../assets/mixins.sass";

.popup {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.7);
}

.popup__container {
  width: 530px;
  padding: 45px 55px 45px 65px;
  position: relative;
  background: #fff;
  box-sizing: border-box;
  height: 390px;
  max-height: 100vh;
}

.close {
  position: absolute;
  width: 23px;
  height: 23px;
  right: 0;
  top: 0;
  cursor: pointer;
  background: url("../assets/close-popup.svg") no-repeat center center;
}

.title {
  font-weight: bold;
  font-size: 16px;
  color: #222;
  text-align: center;
}

.form {
  margin-top: 30px;
  width: 100%;
}

.input {
  width: 100%;
  height: 32px;
  border: 1px solid #dedede;
  border-radius: 3px;
  margin-bottom: 10px;
  box-sizing: border-box;
  background: none;
  outline: none;
  color: #b1b1b1 - #888;
  font-size: 13px;
  padding: 0 10px;

  @include placeholder {
    color: #b1b1b1;
    font-size: 13px;
    font-weight: 300;
  }
}

.phone {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.add__phone,
.remove__phone {
  position: absolute;
  top: 8px;
  right: 15px;
  width: 15px;
  min-width: 15px;
  height: 15px;
  cursor: pointer;
  background: no-repeat 0 center;
}

.add__phone {
  background-image: url("../assets/input-add.svg");
}

.remove__phone {
  background-image: url("../assets/input-remove.svg");
}

.button {
  color: #fff;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  height: 42px;
  line-height: 42px;
  width: 160px;
  box-sizing: border-box;
  text-align: center;
  background: #2e71f0;
  border: none;
  border-bottom: 3px solid #2863d1;
  border-radius: 3px;
  margin: 0 auto;
  display: block;
  cursor: pointer;

  &:disabled {
    background: #dedede;
    color: #b1b1b1;
    border-bottom-color: #bebebe;
    cursor: not-allowed;
  }
}
.hint,
.err {
  font-size: 13px;
  text-align: center;
  margin-bottom: 10px;
  color: #555;
}

.err {
  color: rgb(235, 55, 55);
}
.agreed {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  margin-top: 10px;
}

.agreed__title {
  font-size: 14px;
  margin-left: 11px;
  line-height: 15px;
  cursor: pointer;
}

.agreed__text {
  color: #444343;
  display: inline;
  user-select: none;
  cursor: pointer;
}

.agreed__link {
  color: #2e71f0;
  display: inline-block;
  margin: 0 4px;
  cursor: pointer;
}
.container__scrollable {
  overflow-y: scroll;
  height: 100%;
  width: calc(100% + 20px);
  padding-right: 20px;
  box-sizing: border-box;
}
.container__overflow {
  height: 100%;
  overflow: hidden;
  width: 100%;
}
.container {
  height: 100%;
  display: flex;
}
.button__loader {
  background: url("../assets/loading.svg") no-repeat center center;
  width: 160px;
  margin: 0 auto;
  height: 39px;
}
</style>
