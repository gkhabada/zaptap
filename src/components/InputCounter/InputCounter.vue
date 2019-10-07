<template lang="pug">
  label.container(:class="{disabled, counterror: error}")
    input.input(type="text" :maxlength="max" :value="value" @input="handleInput" :placeholder="placeholder" :disabled="disabled")
    .counter {{ left }} символ{{ suffix(left)}}
</template>


<script>
export default {
  props: {
    max: {
      type: Number,
    },
    value: {
      type: [String, Number],
    },
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Boolean,
    },
    validate: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    left() {
      return this.max - this.value.length;
    },
  },
  methods: {
    suffix(left) {
      // LAST 2 NUMBERS
      const end = left % 100;
      if (
        end % 10 === 0 ||
        (end >= 5 && end <= 20) ||
        (end % 10 >= 5 && end % 10 <= 9)
      ) {
        return 'ов';
      } else if (end % 10 === 1) {
        return '';
      } else if (end % 10 >= 2 && end % 10 <= 4) {
        return 'а';
      }
    },
    handleInput(e) {
      const { target } = e || {};
      if (!target) return;
      e.preventDefault();
      e.target.value = e.target.value.substr(0, this.max)
      /** @type {{value: string}} */
      const { value } = target;
      if (this.validate) {
        const notAlphaNumeric = /[^a-zA-Z0-9]+/g;
        const filtered = value.split(notAlphaNumeric).join('');
        this.$emit('input', filtered);
        e.target.value = filtered;
      } else {
        this.$emit('input', e.target.value);
      }
    }
  }
};
</script>
<style src="./style.sass" lang="sass" scoped></style>
