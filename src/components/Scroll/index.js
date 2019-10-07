import Hammer from 'hammerjs'
import main from '../../main'

const props = {
  /** Complete container height */
  scrollHeight: {
    type: Number,
    default: 0,
  },
  /** Current scroll position */
  scrollPosition: {
    type: Number,
    default: 0,
  },
  /** Visible height of container */
  containerHeight: {
    type: Number,
    default: 0,
  },
  animation: {
    type: Boolean,
    default: false,
  },
}

const computed = {
  position() {
    const position = this.scrollPosition
    /** @type {HTMLElement} */
    const el = this.$el
    if (!el || isNaN(position)) return 0
    const animation = this.animation
    const height = el.offsetHeight - methods.getScrollHeight.bind(this)()
    return position * height / 100 || 0
  },
  visible() {
    return this.containerHeight > 0 && this.containerHeight < this.scrollHeight
  },
}

const methods = {
  getScrollHeight() {
    /** @type {HTMLElement} */
    const el = this.$el
    const difference = this.containerHeight / this.scrollHeight

    if (!el) return this.defaultHeight

    const height = el.offsetHeight
    const updated = difference * height

    if (isNaN(updated)) return this.defaultHeight
    if (updated < this.defaultHeight) return this.defaultHeight
    if (updated > height) return height
    return updated
  },
  setOffset(offset) {
    /** @type {HTMLElement} */
    const el = this.$el
    if (!el || typeof el.querySelector !== 'function') return
    /** @type {HTMLElement} */
    const scroll = el.querySelector('.scroll')
    if (!scroll) return

    const value = `translateY(${offset}px)`
    scroll.style.WebkitTransform = value
    scroll.style.msTransform = value
    scroll.style.transform = value
  },
  handleScroll(e) {
    methods.setScrollPosition.bind(this)(e.center.y)

    /** @type {HTMLElement} */
    const el = this.$el
    if (!el) return
    const scroll = methods.getScrollPosition.bind(this)()
    const container = methods.getContainerPosition.bind(this)()
    /** Current scroll position */
    const difference = scroll - container
    /** Container block height */
    const height = el.offsetHeight - methods.getScrollHeight.bind(this)()
    /** Scroll position in percentages */
    const progress = difference * 100 / height
    if (isNaN(progress)) return
    this.$emit('scroll', progress)
  },
  setScrollPosition(cursorPosition) {
    /** @type {HTMLElement} */
    const el = this.$el
    if (!el) return

    const containerPosition = methods.getContainerPosition.bind(this)()
    /** Container height */
    const containerHeight = el.offsetHeight
    /** Scroll height */
    const scrollHeight = methods.getScrollHeight.bind(this)()
    /** Next scroll position */
    const position = cursorPosition - containerPosition - scrollHeight / 2
    /** Scroll bottom side position after update */
    const scrollBottom = position + scrollHeight
    const offset =
      cursorPosition - scrollHeight / 2 <= containerPosition
        ? 0
        : scrollBottom >= containerHeight
          ? containerHeight - scrollHeight
          : position
    methods.setOffset.bind(this)(offset)
  },
  getContainerPosition() {
    /** @type {HTMLElement} */
    const el = this.$el
    if (!el) return

    return el.getBoundingClientRect().top || 0
  },
  getScrollPosition() {
    /** @type {HTMLElement} */
    const el = this.$el
    if (!el) return

    const scroll = el.querySelector('.scroll')
    if (!scroll) return 0
    return scroll.getBoundingClientRect().top
  },
  attachListener() {
    /** @type {HTMLElement} */
    const el = this.$el
    if (!el) return

    const mc = new Hammer(el)
    if (!mc) return
    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }))

    mc.on('tap press pan', methods.handleScroll.bind(this))

    this.destroy = () => mc.destroy()
  },
}

const beforeDestroy = function() {
  if (this.destroy) this.destroy()
  if (this.animationSequence) clearInterval(this.animationSequence)
}

const watch = {
  animation(value, prev) {
    if (value && !prev) {
      this.animationSequence = setInterval(() => {
        this.$forceUpdate()
      }, 60)
    }
    if (!value && prev) {
      if (this.animationSequence) clearInterval(this.animationSequence)
      this.$forceUpdate()
    }
  },
  position(v) {
    methods.setOffset.bind(this)(v)
    this.height = methods.getScrollHeight.bind(this)()
  },
  visible(visible) {
    if (visible) {
      methods.attachListener.bind(this)()
    } else {
      if (this.destroy) this.destroy()
    }
  },
}

const updateHeight = function() {
  if (!this.$el) return
  if (this.destroy) this.destroy()

  methods.attachListener.bind(this)()
  this.height = methods.getScrollHeight.bind(this)()
  main.$on('resize', () => {
    this.height = methods.getScrollHeight.bind(this)()
  })
}

const updated = updateHeight
const mounted = updateHeight

export default {
  props,
  data: () => ({
    height: 20,
    defaultHeight: 20,
    /** Hammer destroyer */
    destroy: null,
    animationSequence: null,
  }),
  methods,
  computed,
  watch,
  updated,
  mounted,
}
