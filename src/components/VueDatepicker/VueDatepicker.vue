<template lang="pug">
  .datepicker(:class="{opened}")
    .title(@click.stop="toggle")
      .default(v-if="!correctDate") По дням
      .dates(v-else)
        span.first(v-if="!isNaN(first)") {{ first | todate}}
        span.last(v-if="!isNaN(last)") {{ ' - ' }}
        span.last(v-if="!isNaN(last)") {{ last | todate }}
    .picker
      .month
        .prev(@click="prevMonth")
        .curr {{ currentPage }}
        .next(@click="nextMonth")

      .week
        .week__item(v-for="day in week") {{ day }}

      .calendar
        .day(v-for="({status, cl, day, empty}, i) in days" :class="cl" @click="pick(day)" :key="i") {{ empty ? '' : day }}

</template>

<script>
import { todate } from '../../api/filters'

const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

export default {
  filters: { todate },
  props: {
    date: { type: Array, required: true },
    opened: { type: Boolean, required: true },
  },
  data: () => ({
    page: {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
    },
    week: ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПН', 'СБ', 'ВС'],
  }),
  computed: {
    values() {
      return Array.from(this.date, this.ms)
    },
    first() {
      const value = Math.min(...this.values)
      if (isNaN(value) || !isFinite(value)) return NaN
      return value
    },
    last() {
      const value = Math.max(...this.values)
      if (isNaN(value) || !isFinite(value)) return
      return value !== this.first ? value : NaN
    },
    correctDate() {
      return !isNaN(this.first) && !isNaN(this.last)
    },
    currentPage() {
      return `${months[this.page.month]} ${this.page.year}`
    },
    days() {
      const { year, month } = this.page
      const daysInPage = new Date(year, month + 1, 0).getDate()
      const daysOffset = new Date(year, month, 1).getDay()

      const empty = { empty: true, cl: 'empty', day: -1 }
      const offset = new Array(daysOffset).fill(empty)
      const days = Array.from(new Array(daysInPage), (_, day) => {
        const status = this.getDayStatus(day + 1)
        const cl = this.getClass(status)

        return { status, cl, day: day + 1 }
      })

      return Array.from(offset).concat(days)
    },
  },
  methods: {
    toggle() {
      this.opened ? this.close() : this.open()
    },
    open() {
      this.$emit('open')
    },
    close() {
      this.$emit('close')
    },
    getClass(status) {
      if (status === 'last') return ['inrange', 'last']
      if (status === 'first') return ['inrange', 'first']
      if (status) return ['inrange']
      return []
    },
    pick(day) {
      if (day < 1) return
      const copy = this.date
      const dayTimestamp = this.getTimestampFromDay(day)
      // IF EXISTS - DO NOTHING
      if (dayTimestamp === copy[0] || dayTimestamp === copy[1]) return
      // IF NOT - PUSH
      copy.push(dayTimestamp)
      // IF MORE THAN 2 - DELETE
      if (copy.length > 2) copy.shift()
      this.$emit('update:date', copy)
    },
    ms(time) {
      const date = new Date(time)
      if (!date) return
      return date.getTime()
    },
    getTimestampFromDay(day) {
      const { year, month } = this.page
      return new Date(year, month, day).getTime()
    },
    getDayStatus(day) {
      const dayTimestamp = this.getTimestampFromDay(day)
      // DAY BEFORE 1
      if (day < 1) return false
      // DAY BETWEEN FIRST && LAST
      if (this.correctDate) {
        if (dayTimestamp === this.first) return 'first'
        if (dayTimestamp === this.last) return 'last'
        if (dayTimestamp > this.first && dayTimestamp < this.last) return true
        return false
      }
      // FIRST DAY
      if (!isNaN(this.first) && dayTimestamp === this.first) return 'first'
      return false
    },
    prevMonth() {
      if (this.page.month > 0) {
        this.page.month--
      } else {
        this.page.month = 11
        this.page.year--
      }
    },
    nextMonth() {
      if (this.page.month < 11) {
        this.page.month++
      } else {
        this.page.month = 0
        this.page.year++
      }
    },
    blurHandler(e) {
      const el = this.$el
      const isQ = el.querySelector
      if (!isQ) return

      if (!this.$el.contains(e.target)) {
        this.close()
      }
    },
    setContainerHeight(opened) {
      const el = this.$el
      const isQ = el.querySelector
      if (!isQ) return
      this.$nextTick(() => {
        const picker = el.querySelector('.picker')
        if (opened) {
          picker.style.height = 20 + picker.scrollHeight + 'px'
          picker.style.padding = '20px 20px'
          setTimeout(() => {
            picker.style.overflow = 'visible'
          }, 200)
        } else {
          picker.style.overflow = 'hidden'
          picker.style.height = 0 + 'px'
          picker.style.padding = '0px 0px'
        }
      })
    },
  },
  watch: {
    // OPEN CORRECT PAGE
    opened(opened) {
      document.addEventListener('click', this.blurHandler)

      const { year, month } = this.page
      const ts = new Date(year, month).getTime()
      const inrange = ts >= this.first && ts <= this.last
      const page = {
        year: new Date(this.first).getFullYear(),
        month: new Date(this.first).getMonth(),
      }
      if (opened && this.correctDate) {
        if (!inrange) this.page = { ...page }
      } else if (opened && !isNaN(this.first)) {
        const fts = new Date(this.first)
        const isInpage = year === fts.getFullYear() && month === fts.getMonth()
        if (!isInpage) this.page = { ...page }
      } else if (!opened) {
        document.removeEventListener('click', this.blurHandler)
      }
      this.setContainerHeight(opened)
    },
  },
}
</script>


<style lang="sass" src="./style.sass" scoped>
</style>
