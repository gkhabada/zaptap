<template lang="pug">
    .container(:class="[tab, {opened: isOpened}]")
        client-info(:userid="userid" v-if="userid" @close="userid = false")

        table-specification-list(v-bind="{car: currentCar}" v-if="!emptyCurrentCar")

        .emptytable(v-if="cars.length === 0")
            .emptytable__message {{ emptyMessage }}

        .table_s(v-else)
            .header
                .header__item(v-for="(h, index) in headers" :style="{width: width[index]}") {{ h.title }}
            .container__overflow
                .container__scrollable
                    div(v-for="({car, user, counter}, i) in cars" :key="i" @click="updateParams(car)")
                        router-link.line(:to="getOrderLink(car)" :class="{active: car.buyer_request_id == $route.query.order}")
                            .line__item(v-for="(h, index) in headers" :class="h.id" :style="{width: width[index]}")
                                //- BRAND
                                .line__brand(
                                v-if="h.id === 'brand'"
                                    :title="car[h.id]"
                                        :style="{backgroundImage: `url('/static/brands/${car['brand']}.png')`}"
                                )
                                //- COUNTER
                                .line__counter(v-else-if="h.id === 'counter'" :title="counter + ' новых'") {{ counter ? `+${counter}` : '-' }}
                                //- YEAR
                                .line__year(v-else-if="h.id === 'year'" :title="car.generation || '-'")
                                    //- template(v-if="car['generation_year_start'] && car['generation_year_finish']")
                                    //-   .year__start {{ car['generation_year_start'] }}
                                    //-   .year__finish {{ car['generation_year_finish'] }}
                                    template(v-if="car['generation'] && car['generation'] !== '%'")
                                        .year__start {{ car['generation'] }}
                                    template(v-else) {{ '-' }}
                                //- USER
                                .line__user(v-else-if="h.id === 'user'" :title="getPhone(user.phones) + ' - ' + user.name")
                                    .user(v-if="user" @click.prevent="userid = user.user_id")
                                        .user__main
                                            .user__photo
                                                .preview {{ (user.name || '')[0] }}{{ (user.surname || '')[0] }}
                                                .image(v-if="user.user_images" :style="{backgroundImage: `url('${getUrlFromString(user.user_images)}')`}")
                                            .user__info
                                                .user__name {{ `${user.name || ''} ${user.surname || ''}` }}
                                                .user__city г. {{ user.locality }}

                                        // .user__votes
                                        //   .user__upvotes +{{ user.positive_reviews }}
                                        //   .user__downvotes -{{ user.negative_reviews }}

                                        // .user__nice(:class="{active: user.is_positive}")
                                        // .user__favourite(:class="{active: user.is_favorite}")
                                    .user(v-else) -
                                //- DATE
                                .line__date(v-else-if="h.id === 'date'" :title="car['created_timestamp'] | todate")
                                    .line__date__value(v-if="car['created_timestamp']") {{ car['created_timestamp'] | todate('twoDigitYear') }}
                                    .line__date__value(v-else) -
                                //- RETURN
                                //- .line__return(v-else-if="h.id === 'return'")
                                //- OTHERS
                                .line__item__title(:title="car[h.id]" v-else) {{ car[h.id] && car[h.id] !== '%' ? car[h.id] : '-' }}

        .scroll
            scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps")
</template>

<script>
    import Scroll from "../Scroll/mixin";
    import TableSpecificationList from "../TableSpecificationsList.vue"
    import {todate} from "../../api/filters";
    import ClientInfo from "../ClientInfo";
    import {getUrlFromString} from "../../helpers/imageLoader.js";

    export default {
        filters: {
            todate,
            generationFilterFirst(value = "") {
                const v = String(value);
                const r = /\(?\d{4} ?. ?\d{4}\)?/;
                const e = r.exec(v);
                if (!e || e.index < 0) return v;
                const val = e[0] || "";
                if (val[0] === "(") {
                    return val.slice(1, 5);
                } else {
                    return val.slice(0, 4);
                }
            },
            generationFilterLast(value = "") {
                const v = String(value);
                const r = /\(?\d{4} ?. ?\d{4}\)?/;
                const e = r.exec(v);
                if (!e || e.index < 0) return;
                const val = e[0] || "";
                if (val[val.length - 1] === ")") {
                    return val.slice(-5, -1);
                } else {
                    return val.slice(-4);
                }
            }
        },
        components: {
            ClientInfo, TableSpecificationList
        },
        props: {
            emptyMessage: {
                type: String,
                required: true
            },
            cars: {
                type: Array,
                required: true
            },
            opened: {
                type: Number,
                required: true
            },
            headers: {
                type: Array,
                required: true
            },
            isOpened: {
                type: Boolean,
                required: true
            }
        },
        data: () => ({
            maxHeight: 0,
            visible: true,
            userid: false,
            currentCar: {},
        }),
        computed: {
            emptyCurrentCar() {
                for (let key in this.currentCar) {
                    if (this.currentCar.hasOwnProperty(key))
                        return false;
                }
                return true;
            },
            scrollItemsLeft() {
                const {length: carsLength} = this.cars || [];
                if (isNaN(this.scrolledItems)) return carsLength;
                return carsLength - this.scrolledItems;
            },
            scrolledToEnd() {
                if (isNaN(this.scrolledItems)) return true;
                const {containerHeight = 0} = this.scrollProps;
                const maxContainerItems = Math.ceil(containerHeight / 43);
                return this.scrollItemsLeft < maxContainerItems + 1;
            },
            scrolledItems() {
                const {
                    scrollHeight = 0,
                    containerHeight = 0,
                    scrollPosition = 0
                } = this.scrollProps;
                const maxScrollHeight = scrollHeight - containerHeight;
                const itemHeight = 43;
                const maxScrollableItems = maxScrollHeight / itemHeight;
                const currentScrolledItems = (maxScrollableItems * scrollPosition) / 100;
                return Math.floor(currentScrolledItems);
            },
            tab() {
                const type = this.$route.query.type || "";
                return type === "finished_orders" ? "finished_orders" : "active_orders";
            },
            table() {
                return this.cars.map(car => car.car);
            },
            width() {
                const exception = ["year", "model", "counter"];
                if (this.isOpened) {
                    return this.headers.map(
                        ({width, id}) => (exception.includes(id) ? null : "0%")
                    );
                } else {
                    return this.headers.map(({width}) => width);
                }
            }
        },
        methods: {
            updateParams(car) {
                console.log(car);
                this.currentCar = car;
            },
            getUrlFromString,
            getPhone(phones) {
                if (typeof phones !== "string") return phones;
                return phones.split(";")[0] || phones;
            },
            getOrderLink(item) {
                const currentQuery = this.$route.query;
                const nextQuery = Object.assign({}, currentQuery, {
                    order: item.buyer_request_id
                });
                // delete nextQuery.answer
                return {query: nextQuery};
            },
            setHeight() {
                window.requestAnimationFrame(() => {
                    const el = this.$el;
                    if (!el) return;
                    const props = el.getBoundingClientRect();
                    const height = window.innerHeight - (props.top + 43);
                    this.maxHeight = height >= 0 ? height : 0;
                });
            }
        },
        mounted() {
            this.setHeight();
            this.cars.forEach((item) => {
                if (this.$route.query.order == item.car.buyer_request_id) {
                    this.currentCar = item.car;
                }
            })
        },
        watch: {
            scrolledToEnd(scrolled) {
                if (scrolled) {
                    this.$emit("end", this.scrolledItems + this.scrollItemsLeft);
                }
            },
            cars() {
                this.scrollProps.scrollHeight = 0;
                if (this.scrolledToEnd) {
                    this.$emit("end", this.scrolledItems + this.scrollItemsLeft);
                }
            }
        },
        mixins: [Scroll]
    };
</script>


<style lang="sass" src="./style.sass" scoped>
</style>
