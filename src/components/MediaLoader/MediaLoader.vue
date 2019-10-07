<template lang="pug">
  .medialoader(@click="cancel")
    .container(@click.stop="")
      .close(@click="cancel")
      template(v-if="isEmpty")
        .disklaimer
          .disklaimer__icon
          .disklaimer__text Фото/видео следует делать в светлом месте, дефекты должны быть показаны максимально подробно. Запчасти при этом должны быть чистые.

        label.placeholder(for="fileList" :class="{dragover}" @dragover.prevent="dragover = true" @dragleave.prevent="dragover = false")
          .placeholder__text
            span Перетащите сюда файлы для загрузки или укажите путь

      template(v-else)
        .preview
          .preview__prev(@click="prevSlide" v-if="active > 0")
          .preview__next(@click="nextSlide" v-if="active + 1 < files.length")

          .preview__image(:style="{backgroundImage: `url('${activeSlide.url}')`, backgroundSize: imageModes[mode] }")

          .preview__tools
            .remove(@click="removeActiveFile")
            .toggleview(@click="toggleImageMode" :class="imageModes[mode]")

      .footer
        .slider(v-if="!isEmpty")
          .prev(:class="{ hidden: !showArrows || isStartPosition }" @click="prevCollection")

          .collection
            .movingblock(:style="{transform: sliderPosition}")
              .item(v-for="({type, url}, index) in files"
                :style="{backgroundImage: `url('${url}')`}"
                :class="{active: active === index}" @click="activeSlide = index")

          .next(:class="{ hidden: !showArrows || isEndPosition }" @click="nextCollection")

          label.addmore(for="fileList")

        .tools
          .limit(v-if="isEmpty") Не более 200 мб
          .button(:class="{full: isEmpty}" @click="attachFiles") Прикрепить

      input(type="file" accept=".jpg, .jpeg, .png, .gif" id="fileList" @change="fileHandler" hidden multiple)
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  props: {
    files: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      active: 0,
      // max items in sliderCollection
      slides: 9,
      position: 0,
      dragover: false,
      // backgroundSize: auto|contain
      imageModes: ['auto', 'contain'],
      mode: 0,
      // remove this list onWindowClose if we not attached it
      tempImageList: [],
    };
  },
  computed: {
    showArrows() {
      return this.files.length > this.slides;
    },
    isEndPosition() {
      return this.files.length - this.position <= this.slides;
    },
    isStartPosition() {
      return this.position === 0;
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
      return this.files.length === 0;
    },
  },
  methods: {
    attachFiles() {
      this.tempImageList = [];
      this.$emit('attach');
      this.close();
    },
    toggleImageMode() {
      if (this.mode === 0) return (this.mode = 1);
      if (this.mode === 1) return (this.mode = 0);
    },
    decrementTempImageList(i) {
      this.tempImageList.forEach((item, index) => {
        if (item.index === i) {
          item.task = 'nothing';
          return;
        }
        if (item.index > i) item.index--;
      });
    },
    removeActiveFile() {
      this.decrementTempImageList(this.active);
      // Restore this file if we cancel upload
      // this.tempImageList.push({
      //   task: 'restore',
      //   index: this.active,
      //   file: this.files[this.active],
      // });
      this.$emit('remove', this.active);
      if (this.active >= this.files.length) {
        this.active = this.files.length > 0 ? this.active - 1 : 0;
      }
    },
    prevCollection() {
      if (this.isStartPosition) return;
      const prev = this.position - 3;
      this.position =
        prev >= 0
          ? prev
          : this.position > 0 ? 0 : this.files.length - this.slides;
    },
    nextCollection() {
      if (this.isEndPosition) return;
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
    cancel() {
      this.$emit('cancel', this.tempImageList);
      this.close();
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
      e.preventDefault();
      this.dragover = false;
      const event = e.dataTransfer || e.target;
      const files = event.files;
      const keys = Object.keys(files);
      if (!files || files.length === 0) return (e.target.value = '');

      keys.forEach(fileID => {
        const file = files[fileID];
        if (!file || !file.type.startsWith('image')) return;
        this.getUrlFromFile(file)
          .then(url => {
            this.tempImageList.push({
              task: 'remove',
              index: this.files.length,
            });
            this.$emit('file', { file, type: 'picture', url });
          })
          .catch(error => console.log(error));
      });

      e.target.value = '';
    },
  },
  mounted() {
    document.addEventListener('drop', this.fileHandler, false);
    document.addEventListener('dragover', event => event.preventDefault());
  },
  beforeDestroy() {
    this.tempImageList.splice(0);
    document.removeEventListener('drop', this.fileHandler);
    document.removeEventListener('dragover', event => event.preventDefault());
  },
  watch: {
    '$route.fullPath'(v, p) {
      if (v !== p) {
        this.close();
      }
    },
  },
});
</script>

<style lang="sass" src="./style.sass" scoped>
</style>
