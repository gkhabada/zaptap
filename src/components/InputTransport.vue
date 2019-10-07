<template lang="pug">
  .input__container
    label.label
      .autocomplete(v-if="visibleList")
        .item(v-for="(item, i) in filtered" @click="addTransport(i)") {{ item }}
      input.input(type="text" v-model="transport" :placeholder="placeholder" @click="showList" @focus="handleFocus" @keydown.enter="handleEnter")
    .choosen
      span.choosen__item(v-for="(item, i) in value" @click="removeTransport(i)" :title="item") {{ item }}
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
    },
    placeholder: String,
  },
  data: () => ({
    transport: '',
    visibleList: false,
    autocomplete: [
      'ПЭК',
      'Деловые линии',
      'Байкал-Сервис',
      'ЖелДорЭкспедиция',
      'Энергия',
      'РАТЭК',
      'Автотрейдинг',
      'КИТ',
      'СДЭК',
    ],
    extended: [],
  }),
  computed: {
    filtered() {
      const allCompanies = [...this.extended, ...this.autocomplete];
      return allCompanies.filter(x => {
        const equal = String(x)
          .toUpperCase()
          .startsWith(String(this.transport).toUpperCase());
        const notExists = !this.value.includes(x);
        return equal && notExists;
      });
    },
  },
  methods: {
    addTransport(i) {
      const v = this.filtered[i];
      this.$emit('update:value', [...this.value, v]);
      this.visibleList = false;
      this.transport = '';
    },
    removeTransport(i) {
      const c = [...this.value];
      c.splice(i, 1);
      this.$emit('update:value', c);
    },
    handleEnter(event) {
      if (!this.transport) return;
      this.extended.push(this.transport);
      this.addTransport(this.filtered.length - 1);
    },
    showList() {
      this.visibleList = true;
    },
    handleFocus(event) {
      this.visibleList = true;
      document.addEventListener('click', this.handleBlur);
    },
    handleBlur({ target } = {}) {
      const exist = this.$el && this.$el.querySelector;
      if (exist && target.contains(this.$el)) {
        this.visibleList = false;
        this.destroyHandler();
      }
    },
    destroyHandler() {
      document.removeEventListener('click', this.handleBlur);
    },
  },
  mounted() {
    this.extended = this.value;
  },
  beforeDestroy() {
    this.destroyHandler();
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/mixins.sass';

.input__container {
  width: 100%;
  margin-bottom: 10px;
}

.label {
  position: relative;
  height: 32px;
  display: block;
}

.input {
  width: 100%;
  height: 32px;
  background: none;
  box-sizing: border-box;
  border: 1px solid #dedede;
  border-radius: 3px;
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

.autocomplete {
  position: absolute;
  bottom: 32px;
  left: 10px;
  font-size: 13px;
  padding: 10px 0;
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  max-height: 150px;
  overflow-y: auto;
}

.item {
  line-height: 25px;
  padding: 0 20px;
  cursor: pointer;

  &:hover {
    background: #dedede;
  }
}

.choosen {
  font-size: 13px;
  color: #2e71f0;
}

.choosen__item {
  margin-right: 10px;
  margin-top: 5px;
  max-width: 100px;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: normal;
  cursor: pointer;
  position: relative;
  padding-left: 15px;

  &::before {
    content: '';
    display: inline-block;
    position: absolute;
    left: 0;
    top: 2px;
    width: 13px;
    height: 10px;
    white-space: nowrap;
    background: url('../assets/remove_detail.svg') no-repeat center center;
  }
}
</style>
