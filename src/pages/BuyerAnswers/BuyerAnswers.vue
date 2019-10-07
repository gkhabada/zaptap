<template lang="pug">
  .buyeranswerscart(v-if="cartOpened")
    cart(:order="opened" :choosen="choosen" :collection="collection || []" @update="updateCollection")
  .loadingpage(v-else-if="isLoading")
    .loadingtitle Идет загрузка ответов, подождите...
    .loadingcircle
  .buyeranswers(:class="{opened: isOpened}" v-else)
    buyer-answers-update-popup(v-if="!isUpdated && this.answer < 0 && !popupClosed" @close="popupClosed = true")
    .header
      .filter(v-if="!isOpened")
        label.search
          input.search__input(type="text" v-model="filter" placeholder="№ запроса")
          .search__icon

        .dropdown
          dropdown(v-bind="{field: 'brand', title: 'Марка', items: filters.brands, picked: picked.brand}" :opened="openedFilter === 0" @open="openedFilter = 0" @close="openedFilter = -1" @pick="handleFilterItemPick('brand', $event)" @enter="handleFilterEnter('brand', $event)")
        .dropdown
          dropdown(v-bind="{field: 'model', title: 'Модель', items: filters.models, picked: picked.model}" :opened="openedFilter === 1" @open="openedFilter = 1" @close="openedFilter = -1" @pick="handleFilterItemPick('model', $event)" @enter="handleFilterEnter('model', $event)")
        .dropdown
          dropdown(v-bind="{field: 'generation', title: 'Поколение', items: filters.generations, picked: picked.generation}" :opened="openedFilter === 2" @open="openedFilter = 2" @close="openedFilter = -1" @pick="handleFilterItemPick('generation', $event)" @enter="handleFilterEnter('year', $event)")

        .clear__filters(v-if="!filterClear" @click="resetFilters") Сбросить фильтр

      .answer__details(v-else-if="choosen && answer >= 0")
        .answer__info
          .answer__id Запрос № {{ opened }}
          template(v-if="choosen.phone")
            .answer__client , клиент
            .answer__phone {{ choosen.phone || 'Нет телефона' | firstPhone }}
        .order__info
          .order__counter {{ orderCartDetails }},
          .order__sum сумма
          .order__cost {{ ContentStore.cost[opened] || 0 }} р.
          .order__cart(@click="cartOpened = orderCartDetailsCount > 0" :class="{disabled: orderCartDetailsCount <= 0}")

    .content
      .table
        table-component(v-bind="{cars: filteredStoreCars, opened, headers: store.headers, isOpened}" emptyMessage="Ответов пока нет" @end="handleScrollToEnd")

      .current
        buyer-answers-list(v-bind="{choosen, collection, answer, collectionLoading}")

      .answer
        buyer-answers-content(:choosen="choosenCollection" :answer="choosenAnswer" @update="updateCollection")

</template>

<script>
import Store from './store';
import { post } from '../../api/request';
import TableComponent from '../../components/TableComponent/TableComponent';
import Dropdown from '../../components/Dropdown/Dropdown';
import BuyerAnswersList from '../../components/BuyerAnswers/AnswersList/BuyerAnswersList';
import BuyerAnswersContent from '../../components/BuyerAnswers/AnswersContent/BuyerAnswersContent';
import BuyerAnswersUpdatePopup from '../../components/BuyerAnswersUpdatePopup.vue';
import Cart from '../../components/BuyerAnswers/AnswersCart/AnswersCart';
import ContentStore from '../../components/BuyerAnswers/store';
import Vue from 'vue';

export default Vue.extend({
  components: {
    TableComponent,
    Dropdown,
    BuyerAnswersList,
    BuyerAnswersContent,
    Cart,
    BuyerAnswersUpdatePopup,
  },
  data() {
    return {
      popupClosed: false,
      lastFetch: Date.now(),
      isUpdated: true,
      isLoading: true,
      filter: '',
      openedFilter: -1,
      store: Store.data,
      ContentStore,
      checked: [],
      collection: [],
      collectionLoading: false,
      picked: {
        brand: -1,
        model: -1,
        generation: -1,
      },
      // starting request from page 1 with 10 requests.
      page: 1,
      limit: 50,
      isRequestsLoading: true,
      lastLoadedPage: 0,
      lastPage: Infinity,
    };
  },
  computed: {
    filterClear() {
      if (this.filter.length > 0) return false;
      if (this.picked.brand > -1) return false;
      if (this.picked.model > -1) return false;
      if (this.picked.generation > -1) return false;
      return true;
    },
    filteredStoreCars() {
      const cars = this.store.cars;
      return cars
        .filter(props => {
          if (this.picked.brand < 0) {
            return true;
          } else if (this.picked.generation > -1) {
            const picked =
              this.filters.generations[this.picked.generation] || {};
            return props.car.generation === picked.title;
          } else if (this.picked.model > -1) {
            const picked = this.filters.models[this.picked.model] || {};
            return props.car.model === picked.title;
          } else {
            const picked = this.filters.brands[this.picked.brand] || {};
            return props.car.brand === picked.title;
          }
        })
        .filter(({ car = {}, phone = '' } = {}) => {
          // const t = s => s.replace(/\D/g, '').trim();
          // const tphone = t(phone);
          // const tfilter = t(this.filter);
          // const isPhone =
          //   ~tphone.indexOf(tfilter) || ~tphone.indexOf(tfilter.slice(1));
          return ~String(car.buyer_request_id).indexOf(this.filter);
        });
    },
    filters() {
      const defaultFilters = { brands: [], models: [], generations: [] };
      const cars = this.store.cars || [];
      if (!Array.isArray(cars)) {
        return defaultFilters;
      }

      const carsOptions = cars.map(({ car }) => car);

      const takeDifferent = (c, title, index) => {
        const ok = title && !c.includes(title);
        if (ok) return [...c, { title }];
        return c;
      };
      const indexate = ({ title }, index) => {
        return { title, index };
      };

      const brands = carsOptions
        .map(({ brand }) => brand)
        .reduce(takeDifferent, [])
        .map(indexate);

      const choosenBrand = brands[this.picked.brand] || {};
      const models = carsOptions
        .map(({ model, brand }) => {
          const sameBrand = choosenBrand.title === brand;
          if (!sameBrand) return;
          return model;
        })
        .reduce(takeDifferent, [])
        .map(indexate);

      const choosenModel = models[this.picked.model] || {};
      const generations = carsOptions
        .map(({ generation, model }) => {
          const sameModel = choosenModel.title === model;
          if (!sameModel) return;
          return generation;
        })
        .reduce(takeDifferent, [])
        .map(indexate);

      return { brands, models, generations };
    },
    orderCartDetailsCount() {
      const cart = this.ContentStore.cart;
      const answers = cart[this.opened];
      if (!answers) return 0;
      return Object.keys(answers).reduce((sum, answerId) => {
        const answer = answers[answerId];
        if (!answer || !answer.details) return 0;
        return sum + answer.details.length;
      }, 0);
    },
    orderCartDetails() {
      const details = this.orderCartDetailsCount;
      const last = details % 10;

      if (!details) return '0 запчастей';

      if (last === 1 && details !== 11) {
        return details + ' запчасть';
      } else if (last > 1 && last < 5 && (details < 5 || details > 21)) {
        return details + ' запчасти';
      } else {
        return details + ' запчастей';
      }
    },
    cartOpened: {
      get() {
        const cart = this.$route.query.cart;
        return cart === 'opened';
      },
      set(v) {
        const query = { ...this.$route.query };
        if (v) {
          query.cart = 'opened';
        } else {
          delete query.cart;
        }
        this.$router.push({ query });
      },
    },
    choosenCollection() {
      return (
        this.collection.find(
          ({ seller_response_id }) => seller_response_id === this.answer,
        ) || null
      );
    },
    answers() {
      // FLATTEN ARRAY
      const allDetails = [];
      const temp = {};
      this.collection.forEach(item => {
        const sellerId = item.seller_response_id;
        const details =
          item.details.map(detail => ({ ...detail, sellerId })) || [];
        if (!sellerId || !details) return;
        allDetails.push(...details);
      });
      // FOR EVERY DETAIL MOVE TO CHEAP OR OTHERS
      allDetails.forEach(item => {
        const sellerId = item.sellerId;
        const price = parseInt(item.price);
        const id = item.request_detail_id;
        if (this.ContentStore.allCartDetails.includes(id)) return;
        if (isNaN(price)) return;
        // FIND CHEAPEST
        const cheapest = allDetails.find(itemFound => {
          const foundId = itemFound.request_detail_id;
          const foundPrice = parseInt(itemFound.price);
          if (isNaN(foundPrice) || foundId !== id) return;
          return foundPrice < price;
        });
        // IF FOUND: MOVE TO CHEAPEST IF NOT - TO OTHERS
        if (!temp[sellerId]) {
          temp[sellerId] = {
            cheapest: [],
            others: [],
            all: [],
          };
        }
        if (!cheapest) {
          temp[sellerId].cheapest.push(item);
        } else {
          temp[sellerId].others.push(item);
        }
        temp[sellerId].all.push(item);
      });
      return temp;
    },
    isOpened() {
      return this.opened >= 0 && this.answer >= 0;
    },
    opened() {
      const query = this.$route.query;
      const order = Number(query.order);
      return isNaN(order) ? -1 : order;
    },
    answer() {
      const query = this.$route.query;
      const answer = Number(query.answer);
      return isNaN(answer) ? -1 : answer;
    },
    choosenAnswer() {
      return this.answers[this.answer] || null;
    },
    choosen() {
      const id = this.opened;
      /** @type {Array} */
      const cars = this.store.cars;
      return cars.find(({ car }) => car.buyer_request_id === id) || null;
    },
    user() {
      if (this.choosen) return this.choosen.user || {};
      return {};
    },
  },
  watch: {
    choosen(choosen) {
      if (choosen) {
        this.setDetails({ data: [] });
        const request_id =
          choosen && choosen.car && Number(choosen.car.buyer_request_id);
        if (isNaN(request_id)) return;

        this.collectionLoading = true;
        post('/buyer/get-responses-for-request', { request_id })
          .then(this.setDetails)
          .catch(error => console.log(error.message));
      }
    },
    choosenAnswer(answer) {
      if (!answer) return;
      const url = '/buyer/mark-response-as-viewed';
      return post(url, { seller_response_id: this.answer })
        .then(response => response.data)
        .catch(error => console.log(error.message));
    },
    // collection(collection) {
    //   if (this.answer === -1) return
    //   if (!collection || collection.length === 0) {
    //     const query = this.$route.query
    //     query.answer = -1
    //     return this.$router.push({ query })
    //   }
    //   const answer = collection.find(
    //     ({ seller_response_id }) => seller_response_id === this.answer
    //   )
    //   if (!answer) {
    //     const query = { ...this.$route.query }
    //     query.answer = collection[0].seller_response_id
    //     return this.$router.push({ query })
    //   }
    // },
  },
  methods: {
    ...Store.methods,
    resetFilters() {
      this.filter = '';
      this.picked.brand = -1;
      this.picked.model = -1;
      this.picked.generation = -1;
    },
    updateCollection({ who, value }) {
      if (!who || !value) return;
      const { response_detail_id: resId, seller_response_id: selId } = who;
      /** Collection Id */
      const cI = this.collection.findIndex(col => {
        return col.seller_response_id === selId;
      });
      if (!~cI) return;
      /** Detail Id */
      const dI = this.collection[cI].details.findIndex(det => {
        return det.response_detail_id === resId;
      });
      if (!~dI) return;
      const update = {
        ...this.collection[cI].details[dI],
        ...value,
      };
      this.$set(this.collection[cI].details, dI, update);
    },
    handleScrollToEnd(scrolledItems) {
      if (this.isRequestsLoading) return;
      if (isNaN(scrolledItems)) {
        const page = ++this.lastLoadedPage;
        if (page >= this.lastPage) return;
        this.getCars(page);
      } else {
        const page = Math.floor(scrolledItems / this.limit) + 1;
        if (page >= this.lastPage) return;
        this.getCars(page > 0 ? page : 0);
      }
    },
    getCars(page) {
      this.isRequestsLoading = true;
      const ids = this.ContentStore.allResponseIds;
      const noId = !Array.isArray(ids);
      this.isLoading = true;
      post('/buyer/get-all-requests', {
        page,
        limit: this.limit,
        cart: noId ? [] : ids,
      })
        .then(response => {
          this.isRequestsLoading = false;
          const data = response.data;
          if (!Array.isArray(data)) {
            this.lastPage = page;
            this.setCars([], { page, limit: this.limit });
            this.isLoading = false;
            return;
          }
          if (data.length < this.limit) {
            this.lastPage = page;
          }
          this.isLoading = false;
          this.setCars(data || [], { page, limit: this.limit });
        })
        .catch(error => {
          this.isRequestsLoading = false;
          this.isLoading = false;
          console.log(error.message);
        });
    },
    setDetails(response) {
      const data = response.data;
      const ok = Array.isArray(data) && this.choosen;
      this.collectionLoading = false;

      if (!ok) return (this.details = []);
      this.collection = [];
      const carId = this.choosen.car.buyer_request_id;
      if (isNaN(carId)) return (this.details = []);
      this.collection = data
        .map(({ details, user_info, ...other }) => {
          return { ...other, details, user: user_info || {} };
        })
        .filter(({ details }) => details);
    },
    handleFinishResponse() {
      this.$emit('finishresponse');
    },
    handleFilterItemPick(field, event) {
      if (field === 'model' || field === 'generation') {
        this.picked.generation = -1;
      }
      if (field === 'brand') {
        this.picked.model = -1;
      }
      this.$set(this.picked, field, event);
      this.openedFilter = -1;
    },
    handleFilterEnter(field, event) {
      if (event.custom.length === 0) {
        this.handleFilterItemPick(field, -1);
      } else if (event.filtered.length > 0) {
        this.handleFilterItemPick(field, event.filtered[0].index);
      } else {
        this.handleFilterItemPick(field, -1);
      }
    },
    async checkForUpdates() {
      const { data } = await post('/buyer/get-last-response').catch(err => {
        console.log(err);
        return { data: null };
      });
      const ts = data || 0;
      if (!ts) return;
      if (this.lastFetch < ts) {
        this.isUpdated = false;
      }
    },
  },
  created() {
    this.getCars(++this.lastLoadedPage);
    this.lastFetch = Date.now();
    this.$options.timer = setInterval(this.checkForUpdates, 5000);
  },
  beforeDestroy() {
    clearInterval(this.$options.timer);
  },
});
</script>

<style lang="sass" src="./style.sass" scoped>
</style>
