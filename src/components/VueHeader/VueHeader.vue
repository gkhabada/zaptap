<template lang="pug">
  .wrapper
    slot(name="tour" :openmenu="open")
    img.menu(src="../../assets/menu.svg", v-on:click="showMenu($event)")

    //- .tools
      .buyer
        .tools__title Покупатель:
        .notifications
          .counter 12
          .notifications__body
        .messages
          .counter 99+
          .messages__body

      .seller
        .tools__title Продавец:
        .notifications.active
          //- .counter
          .notifications__body
        .messages
          //- .counter
          .messages__body

    .user(@click="isMenuOpened = !isMenuOpened" :class="{active: isMenuOpened}")
      .avatar(:style="getPic(user.data.user_images)")
      .name {{ user.data.name }} {{ user.data.surname }}

    transition(name="navigation")
      nav.navigation(v-if="isMenuOpened")
        ul.list
          li.list__item
            router-link.list__link(to="/profile") Мои данные
          li.list__item(@click="isMenuOpened = false" v-if="user.is_seller")
            router-link.list__link(to="/seller/stock") Мой склад
          li.list__item
            .list__link(@click="rolePopupVisible = true") Моя роль

          .list__delimiter

          //- li.list__item(@click="isMenuOpened = false")
          //-   router-link.list__link(to="/social") Соц. сети
          //- li.list__item(@click="isMenuOpened = false")
            router-link.list__link(to="/workhow") Работать как
          li.list__item(@click="isMenuOpened = false")
            router-link.list__link(to="/changepassword") Сменить пароль
          li.list__item(@click="isMenuOpened = false")
            a.list__link(@click.prevent="logout") Выйти

        .icons
          a.icon.vk(href="https://vk.com/zaptap" target="_blank" rel="noopener")
          a.icon.ok(href="https://ok.ru/group/54284801867938" target="_blank" rel="noopener")
    role-popup(:showing="rolePopupVisible" v-if="rolePopupVisible" @close="rolePopupVisible = false")
</template>
<script>
import Vue from "vue";
import { logout, user } from "../../helpers/authorization";
import { getUrlFromString } from "../../helpers/imageLoader.js";
import RolePopup from '../RolePopup';

export default Vue.extend({
  components: {
    RolePopup
  },
  data: () => ({
    avatar: "/static/avatar.png",
    isMenuOpened: false,
    user,
    rolePopupVisible: false,
    isMainMenuOpened: false
  }),
  methods: {
    showMenu(event) {
      if (!this.isMainMenuOpened) {
        $('#sidebar-wrapper').animate({opacity: 0}, 1, () => {})
        $(".list__counter").hide();
        $(".logo").hide();
        $('#sidebar-wrapper').animate({width: '300px'}, 500, () => {})
        $('#sidebar-wrapper').animate({opacity: 1}, 200, () => {})
        this.isMainMenuOpened = true;
        $(".list__counter").show(500);
        $(".logo").show(500);
      }
      else {
        $(".list__counter").hide();
        $('#sidebar-wrapper').animate({opacity: 0}, 200, () => {})
        $('#sidebar-wrapper').animate({width: '0px'}, 500, () => {})
        this.isMainMenuOpened = false;
      }
    },
    logout() {
      logout();
    },
    open() {
      this.$nextTick(() => {
        this.isMenuOpened = true;
      });
    },
    getPic(url) {
      return { backgroundImage: `url("${this.getUrlFromString(url)}")` };
    },
    getUrlFromString,
    handleMenuBlur(e) {
      if (!this.$el) return;
      /** @type {HTMLElement} */
      const el = e.target;
      /** @type {HTMLElement} */
      const menu = this.$el.querySelector(".navigation");
      /** @type {HTMLElement} */
      const user = this.$el.querySelector(".user");

      if (!menu || !user) return;

      if (!menu.contains(el) && !user.contains(el)) {
        this.isMenuOpened = false;
        document.removeEventListener("click", this.handleMenuBlur);
      }
    }
  },
  watch: {
    "$route.fullPath"() {
      this.isMenuOpened = false;
    },
    isMenuOpened(value) {
      if (value) {
        document.addEventListener("click", this.handleMenuBlur);
      }
    }
  }
});
</script>

<style lang="sass" scoped>
.wrapper
  height: 42px
  width: calc(100vw - 190px)
  overflow: hidden
  background: #f6f6f6
  display: flex
  justify-content: space-between
  align-items: center
  font-family: 'Roboto', sans-serif
  padding-right: 37px
  box-sizing: border-box
  border-bottom: 1px solid #e5eef8

  @media screen and (max-width: 700px)
    width: 100%

.menu
  height: 0
  width: 0
  cursor: pointer
  filter: invert(45%)

  @media screen and (max-width: 700px)
    height: 23px
    width: 50px

.tools
  display: flex
  justify-content: center
  cursor: default

.buyer,
.seller
  display: flex
  align-items: center

.buyer
  padding-right: 10px
  border-right: 1px solid #e5eef8

.seller
  padding-left: 32px

.tools__title
  font-size: 14px
  color: #555
  font-weight: bold
  margin-right: 7px

.notifications
  background: url('../../assets/notification-bell.svg') no-repeat center center

.messages
  background: url('../../assets/notification-message.svg') no-repeat center center

.notifications,
.messages
  position: relative
  width: 43px
  height: 43px
  cursor: pointer

  &:hover
    background-color: #ededed

  &.active
    background-color: #ededed
    &::after
      content: ''
      display: block
      width: 100%
      height: 2px
      background: #0072f4
      position: absolute
      bottom: 0
      left: 0

.counter
  position: absolute
  left: 50%
  top: 8px
  background: #f02e60
  color: #fff
  font-size: 9px
  height: 14px
  line-height: 14px
  padding: 0 5px
  border-radius: 8px

.user
  display: flex
  align-items: center
  cursor: pointer
  position: relative
  user-select: none

.avatar
  width: 31px
  min-width: 31px
  height: 31px
  background: no-repeat center 0
  border-radius: 50%
  margin-right: 16px
  background-position: center
  background-size: cover

.name
  color: #2e71f0
  font-size: 14px
  font-weight: 700
  position: relative
  line-height: 13px

  &::after
    content: ''
    display: block
    width: 8px
    height: 5px
    background: url("../../assets/header-navigation-arrow.svg") no-repeat
    position: absolute
    right: -19px
    top: 4px
    transition: transform 0.3s

.user.active .name::after
  transform: rotate(180deg)

.navigation
  /*height: 214px*/
  display: block
  position: absolute
  top: 43px
  right: 0
  width: 216px
  background: #fff
  box-shadow: 0 10px 30px rgba(0,0,0,0.1)
  padding: 25px 0 43px
  box-sizing: border-box
  transition: transform 0.2s, opacity 0.2s
  transform: translateY(0%)
  opacity: 1
  // FIX
  z-index: 4

.navigation-enter,
.navigation-leave-to
  transform: translateY(-50%)
  opacity: 0



.list__item
  list-style: none
  padding-left: 38px
  margin-bottom: 14px
  height: 9px
  line-height: 9px

  &:last-child
    margin-bottom: 0

.list__link
  color: #a6a6a6 - #444
  text-decoration: none
  font-size: 13px
  cursor: pointer

  &:hover
    color: #a6a6a6 - #222

.list__delimiter
  width: 182px
  height: 1px
  background: #e9e9e9
  margin-left: 19px
  margin-top: 23px
  margin-bottom: 19px

.icons
  position: relative
  top: 20px
  display: flex
  align-items: center
  /*margin-top: 20px*/
  margin-left: 40px

.icon
  width: 16px
  height: 16px
  cursor: pointer
  display: block
  text-decoration: none

  &.vk
    background: url("../../assets/vk.svg") no-repeat center center
  &.ok
    margin-left: 10px
    background: url("../../assets/okru.svg") no-repeat center center

</style>
