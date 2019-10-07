// import Scroll from '../Scroll/mixin';
import main from '../../main';
import { post } from '../../api/request';
// import debounce from 'lodash.debounce';
// import { getAutocomplete } from './utils.js';
import Vue from 'vue';

export default Vue.extend({
  props: {
    picked: {
      type: Number,
      default: -1,
      validator: function(value) {
        return value >= -1;
      },
    },
    value: String,
    testError: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      touch: false,
      search: '',
      items: [],
      opened: false,
      maxHeight: 0,
      animation: false,
      // autocompleteList: [],
    };
  },
  computed: {
    visible() {
      return this.scrollHeight > 0;
    },
    scrollHeight() {
      return this.items.length * 24;
    },
    containerHeight() {
      if (!this.opened) return 0;
      const height = this.items.length * 24;
      const maxHeight = this.maxHeight;
      return height >= 0 ? (height <= maxHeight ? height : maxHeight) : 0;
    },
    autocomplete() {
      const withHint = [];
      const withoutHint = [];
      this.items.forEach(item => {
        const { found = [] } = item || {};
        const hasHint = found.some(part => part.hint);
        if (hasHint) {
          withHint.push(item);
        } else {
          withoutHint.push(item);
        }
      });
      return [...withHint, ...withoutHint];
    },
  },
  methods: {
    // getAutocomplete,
    pickItem(id, name) {
      this.$emit('pick', { id, name });
      this.opened = false;
      this.search = name;
    },
    handleFieldBlur(e) {
      /** @type {HTMLElement} */
      const el = this.$el;
      /** @type {HTMLElement} */
      const target = e.target;
      if (!el || !target || !el.contains(target)) {
        const item = this.items.find(
          ({ detail_name }) =>
            String(detail_name).toLowerCase() === this.search.toLowerCase(),
        );
        if (item) {
          this.pickItem(item.detail_id, item.detail_name);
        }
        this.opened = false;
        this.removeEventListener();
      }
      this.touch = false;
    },
    /** @param {MouseEvent} e */
    attachListener() {
      this.opened = true;
      this.fetchAutocomplete();
      document.addEventListener('click', this.handleFieldBlur);
    },
    removeEventListener() {
      document.removeEventListener('click', this.handleFieldBlur);
    },
    handleEnter({ target } = {}) {
      // pick what in search and blur
      this.pickItem(0, this.search);
      if (!target.blur) return;
      target.blur();

      // or pick first item or search if autocomplete empty

      // const autocompleteEmpty = this.autocompleteList.length === 0;
      // if (!autocompleteEmpty) {
      //   const { detail_name, detail_id } = this.autocompleteList[0];
      //   this.search = detail_name;
      //   this.pickItem(detail_id, detail_name);
      // } else if (this.search) {
      //   this.pickItem(0, this.search);
      // }
    },
    handleInput(e) {
      this.search = e.target.value || '';
      if (this.search) {
        this.$emit('pick', { id: 0, name: this.search });
      } else {
        this.$emit('pick', { id: -1, name: '' });
      }
      // this.$emit('pick', this.search ? 0 : -1);
      this.fetchAutocomplete();
    },
    fetchAutocomplete() {
      /**
       * DO NOT FETCH UNDER 2 SYMBOLS OR ENABLE
       * THROTTLE/DEBOUNCE in getAutocomplete
       */
      const search = this.search;
      if (search.length < 2) {
        this.items = [];
        return;
      }
      post('/buyer/autocomplete-detail-name', {
        detail_name: this.search,
      })
        .then(({ data }) => {
          if (this.search !== search) {
            this.items = [];
            return;
          }
          if (data.message) {
            this.items = [];
            return;
          }
          const items = Array.isArray(data) ? data : [];

          const worker = new Worker('static/autocomplete.js');
          worker.postMessage({ items, search: this.search });

          worker.addEventListener('message', e => {
            if (search !== this.search) return;
            const result = e.data;
            this.items = Array.isArray(result) ? result : [];
          });
        })
        .catch(console.log);
    },
    setHeight() {
      this.animation = true;
      setTimeout(() => {
        this.animation = false;
      }, 300);
      window.requestAnimationFrame(() => {
        if (!this.opened) return;
        /** @type {HTMLElement} */
        const el = this.$el;
        if (!el) return;
        const props = el.getBoundingClientRect();
        const height = window.innerHeight - (props.top + 42) - 100;
        this.maxHeight = height >= 0 ? height : 0;
      });
    },
  },
  watch: {
    opened(opened) {
      if (opened) {
        this.setHeight();
      }
    },
    items(items) {
      if (this.opened) {
        this.setHeight();
      }
      // const ok = items.length > 0 && this.search.length > 1;
      // if (!ok) return;
      // const search = this.search;
      // const worker = new Worker('static/autocomplete.js');

      // worker.postMessage({ items: this.items, search: this.search });
      // worker.addEventListener('message', e => {
      //   if (search !== this.search) return;
      //   const items = e.data;
      //   this.autocompleteList = Array.isArray(items)
      //     ? items.filter(x => x)
      //     : [];
      // });
    },
    picked(picked) {
      if (picked < 0) {
        this.search = '';
      }
    },
  },
  // mixins: [Scroll],
  mounted() {
    if (this.value) this.search = this.value;
    this.setHeight;
    main.$on('resize', this.setHeight);
  },
  beforeDestroy() {
    this.removeEventListener();
  },
});
