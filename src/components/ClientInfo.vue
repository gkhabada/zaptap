<template lang="pug">
  .popup
    .popup__container(v-if="user")
      .print(@click="printPage")
      .close(@click="$emit('close')")
      .client
        .popup__title Данные {{isSeller ? 'покупателя' : 'продавца'}}

        .containerclientinfo
          .container__overflowclientinfo
            .container__scrollableclientinfo
              .group(v-if="avatar")
                .avatar(:style="{backgroundImage: `url('${avatar}')`}")
                  img.image(:src="avatar")
              .group(v-for="{collection, title} in fieldList")
                .title {{ title }}
                .line(v-for="{type, field, title} in collection" :class="{noline: Array.isArray(type())}")
                  template(v-if="field === 'receiver_passport'")
                    template(v-if="isOrdersPage")
                      .field {{ title }}
                      .value {{ user[field] || 'не указаны' }}

                  template(v-else-if="['seller_inn', 'seller_ogrn'].includes(field)")
                    .field {{ title }}
                    .value.inline
                      .value__text {{ user[field] || 'не указан' }}
                      a.value__photo(
                        target="_blank"
                        :href="user[field + '_photo']" 
                        v-if="user[field + '_photo']"
                        ) фото

                  .array(v-else-if="Array.isArray(type())")
                    .array__item
                      .field {{ title }}
                      .value {{ list(user[field])[0] || 'не указан' }}
                    .array__item(v-for="value in list(user[field] || []).slice(1)")
                      .field 
                      .value {{ value }}

                  template(v-else-if="typeof type() === 'number'")
                    .field {{ title }}
                    .value {{ user[field] || 'не указана' }}

                  template(v-else)
                    .field {{ title }}
                    a.value(
                      v-if="field === 'site' && user[field]"
                      :href="user[field]"
                      target="_blank"
                      ) {{ user[field] }}
                    .value(v-else) {{ user[field] || 'не указан' }}
          .scroll
            scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps")

    .popup__container(v-else)
      .loading
</template>

<script>
import Vue from 'vue';
import { post } from '../api/request';
import fields from '../helpers/clientProfileFields.js';
import Scroll from './Scroll/mixin.js';
import clientProfileFields from '../helpers/clientProfileFields.js';
import { getUrlFromString } from '../helpers/imageLoader.js';

export default Vue.extend({
  mixins: [Scroll],
  props: {
    userid: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      fix: 'clientinfo',
      user: null,
      fields,
      visible: true,
    };
  },
  computed: {
    fieldList() {
      const copy = [...this.fields];
      copy.forEach(group => {
        group.collection = group.collection.filter(({ field }) => {
          return !field.includes('photo');
        });
      });
      return copy;
    },
    avatar() {
      const { user_images = '' } = this.user || {};
      const avatar = String(user_images)
        .split(';')[0]
        .trim();
      return getUrlFromString(avatar);
    },
    isOrdersPage() {
      const { path } = this.$route || {};
      return new String(path).includes('orders');
    },
    isSeller() {
      const { path } = this.$route || {};
      return new String(path).includes('seller');
    },
  },
  methods: {
    list(v) {
      return String(v || '').split(';');
    },
    printPage() {
      print();
    },
    async getUser(id) {
      const { data } = await post('/profile/get-user-profile/' + this.userid);
      if (!data) return;
      this.user = data;
    },
  },
  created() {
    this.getUser(this.userid);
  },
});
</script>

<style lang="sass" scoped>
  .popup
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100vh
    display: flex
    justify-content: center
    align-items: center
    background: rgba(0,0,0,0.7)
    z-index: 4

  .popup__container
    width: 635px
    background: #fff
    max-height: calc(100vh - 100px)
    padding: 34px 0
    position: relative

  .close
    width: 23px
    height: 23px
    background: url('../assets/close-popup.svg') no-repeat center center
    position: absolute
    right: 0
    top: 0
    cursor: pointer

  .popup__title
    font-size: 20px
    font-family: 'Fira Sans', sans-serif
    text-align: center

  .group
    margin-top: 25px
    font-family: 'Roboto', sans-serif
    color: #2A313D
    
    &:last-child
      margin-bottom: 50px

  .title
    text-align: center
    font-size: 16px
    font-weight: bold
    margin-bottom: 20px

  .line
    display: flex
    font-size: 14px
    line-height: 40px
    position: relative

    &.noline
      display: block
      height: auto

  .array__item
    display: flex
    height: 40px

  .field
    width: 50%
    text-align: right
    color: #A0A0A0
    padding-right: 10px
    height: 40px
    border-right: 1px solid rgba(35, 37, 44, 0.1)


  .value
    width: 50%
    text-align: left
    height: 40px
    padding-left: 10px

    &.inline
      display: flex

  a.value
    color: #2A313D

  .value__photo
    margin-left: 20px
    color: #007EFF
    

  .containerclientinfo
    display: flex
    position: relative
    justify-content: center

  .container__overflowclientinfo
    overflow: hidden
    width: 100%
    max-height: calc(100vh - 100px)

  .container__scrollableclientinfo
    overflow-y: scroll
    height: 100%
    width: calc(100% + 20px)

  .scroll
    position: absolute
    top: 0
    right: 0
    height: 100%
    width: 20px

  .print
    height: 24px
    width: 24px
    background: url("../assets/print_icon.svg") no-repeat center center
    position: absolute
    left: 39px
    top: 36px
    cursor: pointer

  .loading
    font-size: 14px
    font-family: 'Roboto', sans-serif
    text-align: center
    background: url("../assets/loading.svg") no-repeat center center
    width: 50px
    margin: 0 auto
    height: 50px

  .avatar
    width: 100px
    height: 100px
    background-size: cover
    background-position: center
    border-radius: 50px
    margin: 0 auto
    box-shadow: 0 0 2px rgba(0,0,0,0.5)

  .image
    width: 100px
    height: 100px
    border-radius: 50px
    opacity: 0


  @media print
    .image
      opacity: 1
    .popup__container
      max-height: none
      background: #fff

    .container__overflowclientinfo
      overflow: visible
      overflow-x: hidden
      height: auto
      max-height: none

    .container__scrollableclientinfo
      height: auto
      overflow-y: visible  
    .popup
      position: absolute
      top: 0
      left: 0
      width: 100%
      height: auto
      display: flex
      justify-content: center
      align-items: flex-start

    .value__photo
      display: hidden

</style>
<style lang="sass">
  @media print
    body
      overflow: visible
    a
      text-decoration: none

</style>
