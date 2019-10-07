import Scroll from '../Scroll/Scroll';
import main from '../../main';
import debounce from 'lodash.debounce';

const components = {
  Scroll,
};

const removeListener = function() {
  /** @type {HTMLElement} */
  const el = this.$el;
  if (!el || !el.querySelector || !this.visible) return;
  const container = el.querySelector('.container__scrollable' + this.fix);
  if (!container) return;

  container.removeEventListener('scroll', this.scrollHandler);
};

const methods = {
  setScrollProps() {
    removeListener.bind(this)();
    /** @type {HTMLElement} */
    const el = this.$el;
    if (!el || !el.querySelector || !this.visible) return;
    const container = el.querySelector('.container__scrollable' + this.fix);
    if (!container) return;

    container.addEventListener('scroll', this.scrollHandler);
    this.scrollProps.scrollHeight = container.scrollHeight;
    this.scrollProps.containerHeight = container.offsetHeight;

    const scrollable = container.scrollHeight - container.offsetHeight;
    const progress = (container.scrollTop * 100) / scrollable;
    this.$set(this.scrollProps, 'scrollPosition', progress);
  },
  handleContainerScroll(container) {
    if (!container) return;
    const scrollHeight = container.scrollHeight;
    const visibleHeight = container.offsetHeight;
    const scrollable = scrollHeight - visibleHeight;

    const progress = (container.scrollTop * 100) / scrollable;
    this.$set(this.scrollProps, 'scrollPosition', progress);
  },
  handleScrollbarMovement(progress) {
    /** @type {HTMLElement} */
    const el = this.$el;
    if (!el || !el.querySelector) return;

    const container = el.querySelector('.container__scrollable' + this.fix);
    if (!container) return;
    const scrollHeight = container.scrollHeight;
    const visibleHeight = container.offsetHeight;
    const scrollable = scrollHeight - visibleHeight;

    container.scrollTop = (scrollable * progress) / 100;
  },
};

const updated = function() {
  if (this.$el || !this.$el.querySelector) {
    this.$nextTick(() => {
      this.setScrollProps();
    });
  }
};

const mounted = function() {
  this.scrollHandler = e => {
    methods.handleContainerScroll.bind(this)(e.target);
  };
  main.$on('resize', methods.setScrollProps.bind(this));
  methods.setScrollProps.bind(this)();
};

const beforeDestroy = removeListener.bind(this);

/** Returns scroll methods for parent */
export default {
  data: function() {
    return {
      fix: '',
      scrollProps: {
        /** Complete container height */
        scrollHeight: 0,
        /** Current scroll position */
        scrollPosition: 0,
        /** Visible height of container */
        containerHeight: 0,
      },
      /** Container scroll event handler */
      scrollHandler: null,
    };
  },
  components,
  methods,
  mounted,
  updated,
  beforeDestroy,
};
