<template lang="pug">
  .role_popup(@click="$emit('close')")
    .container.choose_role__modal(@click.stop="")
      .close(@click.stop="$emit('close')")
      h3.choose_role__title Я хочу работать как:
      .choose_role__buttons
        button.choose_role__button(:class="{active:onlyBuyer}" @click="changeRole(true, false)")
          .choose_role__button--img.img1
          p.choose_role__button--title Покупатель
        button.choose_role__button(:class="{active:onlySeller}" @click="changeRole(false, true)")
          .choose_role__button--img.img2
          p.choose_role__button--title Продавец
        button.choose_role__button(:class="{active:both}" @click="changeRole(true, true)")
          .choose_role__button--img.img3
          p.choose_role__button--title Покупатель и продавец
      .choose_role__footer
        button.form_button.recover_button(type='button' @click="confirm") OK
</template>

<script>
  import Vue from "vue";
  import {user} from '../helpers/authorization';
  import {post} from '../api/request';

  export default {
    props: [
      'showing',
    ],
    data: () => ({
      is_buyer: false,
      is_seller: false,
    }),
    computed: {
      onlyBuyer() {
        return this.is_buyer && !this.is_seller;
      },
      onlySeller() {
        return !this.is_buyer && this.is_seller;
      },
      both() {
        return this.is_buyer && this.is_seller;
      }
    },
    methods: {
      changeRole(isBuyer, isSeller) {
        this.is_buyer = isBuyer;
        this.is_seller = isSeller;
      },
      confirm() {
        localStorage.setItem("is_buyer", this.is_buyer);
        localStorage.setItem("is_seller", this.is_seller);

        user.is_buyer = this.is_buyer;
        user.is_seller = this.is_seller;

        post('/user/set-roles', {
          is_buyer: this.is_buyer,
          is_seller: this.is_seller,
        })
        .then((response) => {
          //
        })
        .catch((error) => {
          //
        });

        this.$emit('close');

        // редирект, если поменялась роль и текущая страница уже недоступна из-за роли
        if(this.onlySeller && ['BuyerRequest', 'BuyerAnswers', 'BuyerOrders'].includes(this.$route.name)) {
          this.$router.push({name:'SellerRequests'});
        }
        else if(this.onlyBuyer && ['SellerStock', 'SellerRequests', 'SellerOrders'].includes(this.$route.name)) {
          this.$router.push({name:'BuyerRequest'});
        }
      },
    },
    mounted() {
      this.is_buyer = user.is_buyer;
      this.is_seller = user.is_seller;
    },
  }
</script>

<style lang="scss" scoped>
  button {
    border:none;
    outline: none;
    background-color:transparent;
    cursor: pointer;
  }

  .form_button {
    background-color: rgb(240, 46, 96);
    box-shadow: 0px 3px 9px 0px rgba(212, 27, 74, 0.41);
    color:#fff;
    text-transform: uppercase;
    width: 120px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    margin: auto;
  }

  .recover_button {
    width: 78px;
    margin: auto;
  }

  .close {
    width: 23px;
    height: 23px;
    position: absolute;
    top: 0;
    right: 0;
    background: url("../assets/close-popup.svg");
    cursor: pointer;
  }

  .role_popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container {
    position: relative;
    max-width: 800px;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    margin: 0 auto;
    background: #fff;
    overflow-y: auto;
    max-height: 100vh;
  }

  .choose_role__modal {
    max-width: 680px;
    display: flex;
    flex-flow: column nowrap;
    padding: 50px 40px;
    align-items: center;
  }

  .choose_role__title {
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 40px;
  }

  .choose_role__buttons {
    display: flex;
    justify-content: center;
    flex-flow: row wrap;
    margin-bottom: 35px;
  }

  .choose_role__button {
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-around;
    align-items: center;
    border-radius: 5px;
    background-color: rgb(238, 238, 238);
    box-shadow: 0px 4px 0px 0px rgba(0, 0, 1, 0.1);
    width: 178px;
    height: 212px;
    padding: 20px;
    margin-left: 7px;
    margin-right: 7px;
  }

  .choose_role__button:hover,
  .choose_role__button.active {
    background-color: rgb(44, 109, 232);
    box-shadow: 0px 4px 0px 0px #2862d0;
    color: #fff;
  }

  .choose_role__button--title {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
  }

  .choose_role__button--img {
    overflow: hidden;
  }

  .img1 {
    background: url("../assets/choose_1.png") no-repeat;
    width: 67px;
    height: 57px;
    background-position-x: 0px;
  }

  .choose_role__button:hover .img1,
  .choose_role__button.active .img1 {
    background-position-x: -67px;
  }

  .img2 {
    background: url("../assets/choose_2.png") no-repeat;
    width: 52px;
    height: 63px;
    background-position-x: 0px;
  }

  .choose_role__button:hover .img2,
  .choose_role__button.active .img2 {
    background-position-x: -52px;
  }

  .img3 {
    background: url("../assets/choose_3.png") no-repeat;
    width: 78px;
    height: 72px;
    background-position-x: 0px;
  }

  .choose_role__button:hover .img3,
  .choose_role__button.active .img3 {
    background-position-x: -78px;
  }

  @media (max-width: 675px) {
    .choose_role__buttons {
      flex-flow: column nowrap;
      align-items: center;
      width: 100%;
    }

    .choose_role__footer {
      width: 100%;
    }

    .choose_role__button {
      max-width: 245px;
      width: 100%;
      margin: 0;
      margin-bottom: 20px;
      flex-flow: row nowrap;
      height: 70px;
      padding: 0;
      justify-content: center;
      align-items: center;
    }

    .choose_role__button--img {
      -webkit-transform: scale(0.7);
      -moz-transform: scale(0.7);
      -ms-transform: scale(0.7);
      -o-transform: scale(0.7);
      transform: scale(0.7);
      position: relative;
      left: -20px;
    }

    .img2 {
      left: -30px;
    }

    .choose_role__button--title {
      max-width: 106px;
      text-align: left;
    }
  }
</style>
