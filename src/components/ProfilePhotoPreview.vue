<template lang="pug">
  .preview
    .limiter
      .picture(:style="{backgroundImage: `url('${image}')`}")
</template>

<script>
import Vue from 'vue';
import { getUrlFromString, getUrlFromFile } from '../helpers/imageLoader.js';

export default Vue.extend({
  props: {
    saved: Array,
    recent: { type: [File, Boolean] },
  },
  data() {
    return {
      imageUrl: '',
    };
  },
  computed: {
    image() {
      const exists = s => typeof s === 'string' && s.length > 0;
      if (exists(this.imageUrl)) return this.imageUrl;

      const notArray = !Array.isArray(this.saved);
      if (notArray) return '';
      return getUrlFromString(this.saved[this.saved.length - 1]);
    },
  },
  watch: {
    recent: {
      handler(file) {
        if (!file) return;
        getUrlFromFile(file, 200)
          .then(url => {
            this.imageUrl = url;
          })
          .catch(err => {
            console.log(err);
            this.imageUrl = '';
          });
      },
      immediate: true,
    },
  },
});
</script>

<style lang="sass" scoped>
  .preview
    position: absolute
    right: -130px
    top: -30px

    &:hover
      z-index: 1
    
  
  .picture
    width: 100px
    height: 100px
    border-radius: 50px
    background-size: cover
    background-position: center
</style>

