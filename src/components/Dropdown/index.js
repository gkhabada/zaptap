import Scroll from "../Scroll/mixin";
import translit from "../../api/translit";
import main from "../../main";
import Vue from "vue";

export default Vue.extend({
  filters: {
    generationFilter(value = "") {
      const v = String(value);
      const r = /\(\d{4} . \d{4}\)/;
      const e = r.exec(v);
      if (!e || e.index < 0) return v;
      const template = v.slice(0, e.index).trim();
      const years = (e[0] || "").slice(1, -1).trim();
      return `${years} (${template})`;
    }
  },
  props: {
    field: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    picked: {
      type: Number,
      default: -1,
      validator: function(value) {
        return value >= -1;
      }
    },
    opened: {
      type: Boolean,
      default: false
    },
    full: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean
    }
  },
  data() {
    return {
      search: "",
      windowHeight: { opened: 41, closed: 41 },
      animation: false,
      handleBlur: null,
      manually: false,
      visible: false,
      fix: "__dropdown"
    };
  },
  computed: {
    disabled() {
      return this.disable;
    },
    pickedItem() {
      return this.picked >= 0 && this.items[this.picked]
        ? this.items[this.picked].title || "Отсутствует"
        : "";
    },
    status() {
      return this.opened ? "opened" : "closed";
    },
    filteredItems() {
      /** @type {[{value: String, title: String}]} */
      const items = this.items;
      let result = items.filter(item => {
        const search = this.search.toUpperCase();
        const title = item.title.toUpperCase();
        const translited = translit(search);

        if (item.value === "%") return [];
        return title.startsWith(search) || title.startsWith(translited);
      });
      if (this.field === "engine_power") {
        result = [...items].sort((a, b) => Number(a.value) - Number(b.value));
      }
      return result;
    },
    containerHeight() {
      // Minimum container height with input + all items
      // const maxHeight = this.windowHeight[this.status];
      // const minHeight = 92;
      // const items = this.filteredItems.length || 1;
      // const itemHeight = 23;
      // const scrollHeight = items * itemHeight;
      // if (this.opened) {
      //   return scrollHeight + minHeight >= maxHeight
      //     ? maxHeight > minHeight
      //       ? maxHeight
      //       : minHeight
      //     : scrollHeight + minHeight;
      // } else {
      //   return maxHeight;
      // }
      const maxHeight = this.windowHeight[this.status];
      const minHeight = 92;
      const items = this.filteredItems.length || 1;
      const itemHeight = 23;
      const scrollHeight = items * itemHeight;
      if (this.opened) {
        return Math.min(minHeight + scrollHeight, 300);
      }
      else {
        return maxHeight;
      }
    },
    scrollableHeight() {
      // Scrollable container height
      const items = this.filteredItems.length || 1;
      const itemHeight = 23;
      const scrollHeight = items * itemHeight;
      const cutHeight = this.containerHeight - 92;

      return scrollHeight + 92 < this.containerHeight
        ? scrollHeight
        : cutHeight > 0
        ? cutHeight
        : 0;
    }
  },
  methods: {
    autoPick() {
      if (this.items.length === 1) this.pickItem(0);
    },
    handleKeyEnter() {
      this.$emit("enter", {
        custom: this.search,
        list: this.items,
        filtered: this.filteredItems
      });
    },
    handleInputBlur(e) {
      const rel = e.relatedTarget;
      const inside = rel
        ? this.$el.contains(e.relatedTarget)
        : this.$el.contains(e.target);
      if (!inside) this.$emit("close");
    },
    handleBlurFunction(e = {}) {
      /** @type {HTMLElement} */
      const target = e.target;
      if (!target) return;
      /** @type {HTMLElement} */
      const el = this.$el;
      if (!el) return;
      if (!el.contains(target)) {
        this.$emit("blur", this.search);
        this.$emit("close");
      }
    },
    pickItem(index) {
      this.$emit("pick", index);
    },
    handleTitleClick() {
      if (this.disabled) return;
      if (!this.opened) {
        this.manually = true;
        this.$emit("open");
      } else {
        this.$emit("close");
      }
    },
    setDefaultHeights() {
      window.requestAnimationFrame(() => {
        if (!this.opened) return;
        /** @type {HTMLElement} */
        const el = this.$el;
        if (!el || !el.querySelector) return;
        const props = el.getBoundingClientRect();
        const height = window.innerHeight - (props.top + 21);
        //this.windowHeight.opened = height > 400 ? 400 : height;
        this.windowHeight.opened = Math.min(400, height);
      });
    },
    focus() {
      setTimeout(() => {
        /** @type {HTMLElement} */
        const el = this.$el;
        if (!el || !this.opened) return;
        this.visible = true;
        this.setScrollProps();
        const input = el.querySelector("input");
        // if (input) input.focus();
      }, 300);
    }
  },
  mounted() {
    this.setDefaultHeights();
    main.$on("resize", () => this.setDefaultHeights());

    this.handleBlur = this.handleBlurFunction;

    if (this.opened) {
      this.focus();
      document.addEventListener("click", this.handleBlur);
    }
  },
  watch: {
    opened(opened) {
      if (opened) {
        this.visible = true;
        this.setDefaultHeights();
        document.addEventListener("click", this.handleBlur);

        this.focus();

        if (!this.manually) this.autoPick();
      } else {
        this.search = "";
        this.visible = false;
        this.manually = false;
        document.removeEventListener("click", this.handleBlur);
      }
    },
    scrollableHeight(scrollableHeight) {
      this.animation = true;
      this.scrollProps.containerHeight = this.containerHeight;
      this.scrollProps.scrollHeight = scrollableHeight;
      setTimeout(() => {
        this.animation = false;
      }, 300);
    }
  },
  beforeDestroy() {
    document.removeEventListener("click", () => this.handleBlur());
  },
  mixins: [Scroll]
});
