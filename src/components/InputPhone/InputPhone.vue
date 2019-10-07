<template lang="pug">
  input.inputphone(type="text" :value="phone" maxlength="18" @change="handleChange" @input="handleInput" @blur="handleBlur" @click="handleFocus" v-bind="$props")
</template>

<script>
export default {
  props: {
    value: String,
  },
  data() {
    return {
      position: 0,
    };
  },
  computed: {
    phone: {
      get() {
        return String(this.value || '');
      },
      set(v = '') {
        const value = String(v);
        event.target.value = value;
        this.$emit('update:value', value);
      },
    },
  },
  methods: {
    handleFocus(e) {
      e.target.value = '+7';
    },
    handleChange(event) {
      const type = String(event.inputType).startsWith('delete');
      const pos = event.target.selectionStart;
      const old = this.phone;
      const isClick = event.type === 'click';
      const recent = this.mask(event.target.value);
      this.phone = recent;

      this.$nextTick(() => {
        if (recent.length >= old.length) {
          const nextDigit = recent.slice(pos).match(/\d/);
          if (nextDigit) {
            const next = pos + nextDigit.index;
            if (pos < 4) {
              this.setCursor(5);
            } else if (recent[next - 1] === ' ' || recent[next - 1] === '-') {
              this.setCursor(next + 1);
            } else {
              this.setCursor(next);
            }
          } else {
            this.setCursor(recent.length);
          }
        } else {
          const prevDigit = recent
            .slice(0, pos)
            .split('')
            .reverse()
            .join('')
            .match(/\d/);
          if (prevDigit && pos > 3) {
            this.setCursor(pos - prevDigit.index);
          } else {
            this.setCursor(4);
          }
        }
      });
    },
    correctPhone(value = '') {
      if (!value.startsWith('+7')) {
        const fromPlus = value.startsWith('+');
        this.phone = '+7' + (fromPlus ? '' : value);
        return;
      }
      this.phone = value;
    },
    handleBlur() {
      this.$nextTick(() => {
        if (this.phone.length <= 2) {
          this.phone = '';
        }
      });
    },
    handleInput(event) {
      this.correctPhone(event.target.value);
    },
    handleFocus(event) {
      this.position = event.target.selectionStart;
      this.correctPhone(event.target.value);
      this.handleChange(event);
    },
    mask(value = '') {
      const trimmed = String(value)
        .replace(/\D/gi, '')
        .slice(0, 11)
        .split('');
      if (trimmed[0] === '7') trimmed.shift();
      const result = trimmed.reduce((result, num, i) => {
        let post = '';
        if (i === 2) post = ') ';
        if (i === 5 || i === 7) post = '-';
        post = i < trimmed.length - 1 ? post : '';
        return result + num + post;
      }, '');
      return new String(
        result ? '+7 (' + result : value.startsWith('+7') ? '+7' : '',
      ).slice(0, 18);
    },
    setCursor(pos) {
      const input = this.$el;
      if (!input || !input.querySelector) return;

      if (!input) {
        return false;
      } else if (input.createTextRange) {
        var textRange = input.createTextRange();
        textRange.collapse(true);
        textRange.moveEnd(pos);
        textRange.moveStart(pos);
        textRange.select();
        return true;
      } else if (input.setSelectionRange) {
        input.setSelectionRange(pos, pos);
        return true;
      }
      this.position = pos;

      return false;
    },
  },
};
</script>

<style lang="sass" scoped>
  @import "../../assets/mixins.sass"
  .inputphone
    width: 100%
    height: 100%
    background: none
    box-sizing: border-box
    border: none
    outline: none
    color: #b1b1b1 - #888
    font-size: 14px

    @include placeholder
      color: #b1b1b1
      font-size: 14px
      font-weight: 400
</style>
