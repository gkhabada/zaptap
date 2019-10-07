import Scroll from '../Scroll/mixin';
import translit from '../../api/translit';
import main from '../../main';

const props = {
  field: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  picked: {
    type: Number,
    default: -1,
    validator: function(value) {
      return value >= -1;
    },
  },
  opened: {
    type: Boolean,
    default: false,
  },
  disable: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
};

const computed = {
  disabled() {
    if (!this.items) return true;
    return this.items.length === 0 || this.disable;
  },
  pickedItem() {
    return this.picked >= 0 && this.items[this.picked]
      ? this.items[this.picked].title || 'Отсутствует'
      : '';
  },
  status() {
    return this.opened ? 'opened' : 'closed';
  },
  filteredItems() {
    /** @type {[{value: String, title: String}]} */
    const items = this.items;
    if (!items) return [];
    return items.filter((item) => {
      const search = this.search.toUpperCase();
      const title = item.title.toUpperCase();
      const translited = translit(search);

      if (item.value === '%') return [];
      return title.startsWith(search) || title.startsWith(translited);
    });
  },
  containerHeight() {
    const maxHeight = this.windowHeight[this.status];
    const items = this.filteredItems.length || 1;
    const itemHeight = 23;
    if (this.opened) {
      const scrollHeight = items * itemHeight;
      return scrollHeight + 92 >= maxHeight
        ? maxHeight > 92 ? maxHeight : 92
        : scrollHeight + 92;
    } else {
      return maxHeight;
    }
  },
  scrollableHeight() {
    const items = this.filteredItems.length || 1;
    const itemHeight = 23;
    const containerHeight = this.containerHeight;

    const scrollHeight = items * itemHeight;

    return containerHeight >= scrollHeight
      ? scrollHeight
      : containerHeight - 92;
  },
};

const methods = {
  autoPick() {
    if (this.items.length === 1) this.pickItem(0);
  },
  handleKeyEnter() {
    this.$emit('enter', {
      custom: this.search,
      list: this.items,
      filtered: this.filteredItems,
    });
  },
  handleBlurFunction(e) {
    /** @type {HTMLElement} */
    const target = e.target;
    if (!target) return;
    /** @type {HTMLElement} */
    const el = this.$el;
    if (!el) return;
    if (!el.contains(target)) {
      this.$emit('close');
    }
  },
  pickItem(index) {
    this.$emit('pick', index);
  },
  handleTitleClick() {
    if (this.disabled) return;
    if (!this.opened) {
      this.manually = true;
      this.$emit('open');
    } else {
      this.$emit('close');
    }
  },
  setDefaultHeights() {
    window.requestAnimationFrame(() => {
      if (!this.opened) return;
      /** @type {HTMLElement} */
      const el = this.$el;
      if (!el) return;
      const props = el.getBoundingClientRect();
      const height = window.innerHeight - (props.top + 21);
      this.windowHeight.opened = height;
    });
  },
  focus() {
    setTimeout(() => {
      /** @type {HTMLElement} */
      const el = this.$el;
      if (!el || !this.opened) return;
      this.visible = true;
      this.setScrollProps();
      const input = el.querySelector('input');
      if (input) input.focus();
    }, 300);
  },
};

const mounted = function() {
  methods.setDefaultHeights.bind(this)();
  main.$on('resize', methods.setDefaultHeights.bind(this));

  this.handleBlur = methods.handleBlurFunction.bind(this);

  if (this.opened) {
    methods.focus.bind(this)();
    document.addEventListener('click', this.handleBlur);
  }
};

const watch = {
  opened(opened) {
    if (opened) {
      this.visible = true;
      methods.setDefaultHeights.bind(this)();
      document.addEventListener('click', this.handleBlur);

      methods.focus.bind(this)();

      if (!this.manually) methods.autoPick.bind(this)();
    } else {
      this.visible = false;
      this.manually = false;
      document.removeEventListener('click', this.handleBlur);
    }
  },
  scrollableHeight(containerHeight) {
    this.animation = true;
    this.scrollProps.containerHeight = containerHeight;
    this.scrollProps.scrollHeight = this.scrollableHeight;
    setTimeout(() => {
      this.animation = false;
    }, 300);
  },
};

const beforeDestroy = function() {
  document.removeEventListener('click', methods.handleBlur.bind(this));
};

const mixins = [Scroll];

export default {
  props,
  data: () => ({
    search: '',
    windowHeight: { opened: 41, closed: 41 },
    animation: false,
    handleBlur: null,
    manually: false,
    visible: false,
  }),
  computed,
  methods,
  mounted,
  watch,
  mixins,
};
