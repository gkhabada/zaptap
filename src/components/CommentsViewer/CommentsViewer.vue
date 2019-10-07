<template lang="pug">
  .popupwrapper(@click="close")
    .container(@click.stop="")
      .close(@click="close")
      .preview(v-if="files.length > 0")
        .preview__prev(@click="prevSlide" v-if="active > 0")
        .preview__next(@click="nextSlide" v-if="(active + 1 )< files.length ")

        .preview__image(:style="{backgroundImage: `url('${activeSlide.full}')`, backgroundSize: imageModes[mode]}" )

        .preview__tools
          .remove
          .toggleview(@click="toggleImageMode" :class="imageModes[mode]")

      .comments
        .spoiler(@click="trigger" :class="{open: !isBuyer}" v-if="!(isSellerRequests && notFinished)") {{ prior === 'seller' ? sellertitle ||  'Мой комментарий' : sellertitle || 'Комментарий продавца' | format }}
        template(v-if="!isBuyer && (sellerComment || files.length > 0) && !(isSellerRequests && notFinished)")
          .comment {{ sellerComment }}
            .slider(v-if="files.length > 0")
              .prev(:class="{hidden: !showArrows}" @click="prevCollection" )

              .collection
                .movingblock(:style="{transform: sliderPosition}")
                  .item(v-for="({type, short}, index) in files"
                    :style="{backgroundImage: `url('${short}')`}"
                    :class="{active: active === index}" @click="activeSlide = index")

              .next(:class="{hidden: !showArrows}" @click="nextCollection")

        .spoiler(@click="trigger" :class="{open: isBuyer, sellerrequests: isSellerRequests}")  {{ prior === 'buyer' ? buyertitle || 'Мой комментарий' : buyertitle || 'Комментарий покупателя' | format }}
        template(v-if="isBuyer && (buyerComment || files.length > 0)")
          .comment {{ buyerComment }}
            .slider(v-if="files.length > 0")
              .prev(:class="{hidden: !showArrows}" @click="prevCollection" )

              .collection
                .movingblock(:style="{transform: sliderPosition}")
                  .item(v-for="({type, short}, index) in files"
                    :style="{backgroundImage: `url('${short}')`}"
                    :class="{active: active === index}" @click="activeSlide = index")

              .next(:class="{hidden: !showArrows}" @click="nextCollection")


</template>

<script>
import { getUrlFromString } from '../../helpers/imageLoader';

export default {
  props: {
    buyerComment: String,
    sellerComment: String,
    buyerMedia: Array,
    sellerMedia: Array,
    sellertitle: String,
    buyertitle: String,
  },
  data() {
    return {
      active: 0,
      slides: 9,
      position: 0,
      isBuyer: !this.$route.path.startsWith('/buyer'),
      // backgroundSize: auto|contain
      imageModes: ['auto', 'contain'],
      mode: 0,
    };
  },
  filters: {
    format(v) {
      return v[0].toUpperCase() + v.slice(1);
    },
  },
  computed: {
    prior() {
      const path = String(this.$route.path || '');
      const isBuyer = path.startsWith('/buyer');
      return isBuyer ? 'buyer' : 'seller';
    },
    isSellerRequests() {
      const path = new String(this.$route.path);
      const isSellerRequests = path.startsWith('/seller/requests');
      return isSellerRequests && this.notFinished;
    },
    notFinished() {
      const { type } = this.$route.query;
      if (type === 'finished_orders') return false;
      return true;
    },
    files() {
      const who = this.isBuyer ? 'buyer' : 'seller';
      const media = this[who + 'Media'];
      if (!Array.isArray(media) || media.length === 0) return [];
      return media.map(f => {
        return {
          type: f.type || 'picture',
          short: getUrlFromString(f.preview_image_src),
          full: getUrlFromString(f.full_image_src),
        };
      });
    },
    who() {
      if (this.isBuyer) {
        return this.buyerComment ? 'buyer' : 'seller';
      } else {
        return this.sellerComment ? 'seller' : 'buyer';
      }
    },
    showArrows() {
      return this.files.length > this.slides;
    },
    sliderPosition: {
      get() {
        return `translateX(${-this.position * 60}px)`;
      },
      set(value) {
        this.position = value;
      },
    },
    activeSlide: {
      get() {
        return this.files[this.active] || {};
      },
      set(id) {
        this.active = id;
      },
    },
    isEmpty() {
      const who = this.isBuyer ? 'buyer' : 'seller';

      return !this[who + 'Comment'] && this.files.length === 0;
    },
  },
  methods: {
    toggleImageMode() {
      if (this.mode === 0) return (this.mode = 1);
      if (this.mode === 1) return (this.mode = 0);
    },
    getPictureUrl(url) {
      const prefix = 'https://api.zaptap.ru';
      return prefix + url;
    },
    trigger() {
      if (this.isSellerRequests && this.notFinished) return;
      this.active = 0;
      this.isBuyer = !this.isBuyer;
    },
    prevCollection() {
      const prev = this.position - 3;
      this.position =
        prev >= 0
          ? prev
          : this.position > 0 ? 0 : this.files.length - this.slides;
    },
    nextCollection() {
      const next = this.position + 3;
      const last = this.files.length - this.slides;
      this.position = next <= last ? next : this.position < last ? last : 0;
    },
    prevSlide() {
      this.active = this.active > 0 ? this.active - 1 : this.files.length - 1;
      const min = this.position;
      const max = this.position + this.slides - 1;
      if (max < this.active) {
        this.position = this.active - this.slides + 1;
      } else if (min > this.active) {
        this.position = this.active;
      }
    },
    nextSlide() {
      this.active = this.active < this.files.length - 1 ? this.active + 1 : 0;
      const min = this.position;
      const max = this.position + this.slides - 1;
      if (max < this.active) {
        this.position = this.active - this.slides + 1;
      } else if (min > this.active) {
        this.position = this.active;
      }
    },
    close() {
      this.$emit('close');
    },
    getUrlFromFile(file) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = e => {
          const result = e && e.target && e.target.result;
          if (!result) return reject('No result');
          resolve(result);
        };
        reader.readAsDataURL(file);
      });
    },
    fileHandler(e) {
      const event = e.dataTransfer || e.target;
      const files = event.files;
      const keys = Object.keys(files);
      if (!files || files.length === 0) return (e.target.value = '');

      keys.forEach(fileID => {
        const file = files[fileID];
        if (!file || !file.type.startsWith('image')) return;
        this.getUrlFromFile(file)
          .then(url => {
            this.$emit('file', { file, type: 'picture', url });
          })
          .catch(error => console.log(error));
      });

      e.target.value = '';
    },
  },
  created() {
    if (this.prior === 'buyer') {
      if (this.isEmpty) this.trigger();
      this.$nextTick(() => {
        if (this.isEmpty) this.close();
      });
    } else if (this.prior === 'seller') {
      if (this.isEmpty) this.trigger();
      this.$nextTick(() => {
        if (this.isEmpty) this.close();
      });
    }
  },
  watch: {
    '$route.fullPath'(v, p) {
      if (v !== p) {
        this.close();
      }
    },
  },
};
</script>
<style lang="sass" src="./style.sass" scoped>
</style>
