<template lang="pug">
  .loadingpage(v-if="isLoading")
    .loadingtitle Идет загрузка заказов, подождите...
    .loadingcircle
  .buyerorders(:class="{opened: isOpened}" v-else)
    seller-orders-update-popup(v-if="!isUpdated && this.opened < 0 && !popupClosed" @close="popupClosed = true")
  
    .header
      transition(name="fade" mode="out-in")
        .filter(v-if="!isOpened")
          label.search
            input.search__input(type="text" v-model="filter" placeholder="№ заказа")
            .search__icon


          .dropdown
            dropdown(v-bind="{field: 'brand', title: 'Марка', items: filters.brands, picked: picked.brand}" :opened="openedFilter === 0" @open="openedFilter = 0" @close="openedFilter = -1" @pick="handleFilterItemPick('brand', $event)" @enter="handleFilterEnter('brand', $event)")
          .dropdown
            dropdown(v-bind="{field: 'model', title: 'Модель', items: filters.models, picked: picked.model}" :opened="openedFilter === 1" @open="openedFilter = 1" @close="openedFilter = -1" @pick="handleFilterItemPick('model', $event)" @enter="handleFilterEnter('model', $event)")
          .dropdown
            dropdown(v-bind="{field: 'year', title: 'Поколение', items: filters.generations, picked: picked.generation}" :opened="openedFilter === 2" @open="openedFilter = 2" @close="openedFilter = -1" @pick="handleFilterItemPick('generation', $event)" @enter="handleFilterEnter('year', $event)")

          .clear__filters(v-if="!filterClear" @click="resetFilters") Сбросить фильтр
      // .contacts__client(v-if="choosen && choosen.user")
        .client__city Клиент
        .client__phone {{ choosen.user.phones || 'нет телефона' | firstPhone }}

      transition(name="opacity" mode="out-in")
        .folders(v-if="!isOpened")
          template(v-for="({title, id}, i) in tabs")
            router-link.folders__item(:to="{query: {type: id}}" :class="{active: tab === id}") {{ title }} ({{orders[i]}})

    .content
      .table
        table-component(v-bind="tableBinds" emptyMessage="Заказов нет")

      .current
        buyer-orders-table(:details="choosen ? choosen.details : []"
          :picked="choosen && choosen.pickedDetail || 0"
          :opened="opened"
          :finished="true"
          :checked="checked || []"
          :updateFunction="getCars"
          @pick="handleDetailPick"
          @toggle="handleCheckboxToggle"
          @finish="handleCarFinish")

</template>

<script>
import Store from "./store";
import { post } from "../../api/request";
import TableComponent from "../../components/TableComponent/TableComponent";
import BuyerOrdersTable from "../../components/BuyerOrdersTable/BuyerOrdersTable";
import SellerOrdersUpdatePopup from "../../components/SellerOrdersUpdatePopup";
import Dropdown from "../../components/Dropdown/Dropdown";

export default {
  data() {
    return {
      lastFetch: Date.now(),
      popupClosed: false,
      isUpdated: true,
      isLoading: true,
      filter: "",
      openedFilter: -1,
      picked: {
        brand: -1,
        model: -1,
        generation: -1
      },
      store: Store.data,
      allCars: { active_orders: [], finished_orders: [] },
      tabs: [
        { title: "Текущие", id: "active_orders" },
        { title: "Завершенные", id: "finished_orders" }
      ],
      checked: []
    };
  },
  components: {
    TableComponent,
    BuyerOrdersTable,
    Dropdown,
    SellerOrdersUpdatePopup
  },
  computed: {
    filterClear() {
      if (this.filter.length > 0) return false;
      if (this.picked.brand > -1) return false;
      if (this.picked.model > -1) return false;
      if (this.picked.generation > -1) return false;
      return true;
    },
    tableBinds() {
      return {
        cars: this.filteredStoreCars,
        opened: this.opened,
        headers: this.store.headers,
        isOpened: this.isOpened
      };
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
        .filter(({ car }) => {
          return ~String(car.buyer_request_id).indexOf(this.filter);
        });
    },
    filters() {
      if (!this.allCars || !this.allCars[this.tab])
        return { brands: [], models: [], generations: [] };

      const options = this.allCars[this.tab].map(options => options);
      const takeDifferent = (c, v) => {
        if (!c.includes(v)) return [...c, v];
        return c;
      };
      const brands = options
        .map(({ brand }) => brand)
        .filter(x => x)
        .reduce(takeDifferent, [])
        .map((title, index) => ({
          title,
          index
        }));
      const models = options
        .map(({ model, brand }) => {
          if (this.picked.brand < 0) return;
          const choosen = brands[this.picked.brand];
          if (choosen && choosen.title !== brand) return;
          return model;
        })
        .filter(x => x)
        .reduce(takeDifferent, [])
        .map((title, index) => ({
          title,
          index
        }));
      const generations = options
        .map(({ generation, model }) => {
          if (this.picked.model < 0) return;
          const choosen = models[this.picked.model];
          if (choosen && choosen.title !== model) return;
          return generation;
        })
        .filter(x => x)
        .reduce(takeDifferent, [])
        .map((title, index) => ({
          title,
          index
        }));
      return { brands, models, generations };
    },
    isOpened() {
      return this.opened >= 0;
    },
    orders() {
      const all = this.allCars;
      if (!all) return [0, 0];
      return [all["active_orders"].length, all["finished_orders"].length];
    },
    opened() {
      const query = this.$route.query;
      const order = Number(query.order);
      return isNaN(order) ? -1 : order;
    },
    choosen() {
      const id = this.opened;
      /** @type {Array} */
      const cars = this.store.cars;
      return cars.find(({ car }) => car.buyer_request_id === id);
    },
    user() {
      if (!this.choosen) return {};
      const pickedDetail =
        this.choosen.pickedDetail > 0 ? this.choosen.pickedDetail : 0;
      const detail = this.choosen.details[pickedDetail];
      return (detail && detail.user_info) || {};
    },
    tab() {
      const type = this.$route.query.type || "";
      return type === "finished_orders" ? "finished_orders" : "active_orders";
    }
  },
  watch: {
    choosen: {
      handler({ car } = {}) {
        const buyer_request_id = car && Number(car.buyer_request_id);
        if (isNaN(buyer_request_id)) return;

        post("/order/get-seller-order", { buyer_request_id })
          .then(({ data = {} } = {}) => {
            const { sellers_list, client_info } = data;
            if (!sellers_list) return this.setDetails([], buyer_request_id);
            this.setDetails(data, buyer_request_id);
          })
          .catch(error => {
            console.log(error.message);
          });
      },
      immediate: true
    },
    tab(tab) {
      if (!this.allCars) return this.setCars([]);
      this.setCars(this.allCars[this.tab] || []);
    }
  },
  created() {
    this.getCars();
  },
  methods: {
    ...Store.methods,
    async checkForUpdates() {
      const { data } = await post("/seller/get-last-order").catch(err => {
        console.log(err);
        return { data: null };
      });
      const ts = data || 0;
      if (!ts) return;
      if (this.lastFetch < ts) {
        this.isUpdated = false;
      }
    },
    resetFilters() {
      this.filter = "";
      this.picked.brand = -1;
      this.picked.model = -1;
      this.picked.generation = -1;
    },
    getCars() {
      this.isLoading = true;
      post("/order/get-all-seller-orders", {})
        .then(response => {
          const data = response.data;
          const ok = data && data.active_orders && data.finished_orders;
          if (!ok) {
            const query = { ...this.$route.query };
            delete query.order;
            this.isLoading = false;
            this.$router.push({ query });
            return this.setCars([]);
          }
          this.$set(this.allCars, "active_orders", data.active_orders);
          this.$set(this.allCars, "finished_orders", data.finished_orders);
          this.setCars(data[this.tab] || []);
          this.isLoading = false;
        })
        .catch(error => {
          this.isLoading = false;
          console.log(error.message);
        });
    },
    handleFilterItemPick(field, event) {
      if (field === "model" || field === "generation") {
        this.picked.generation = -1;
      }
      if (field === "brand") {
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
    handleCarFinish() {
      const requestId = this.opened;
      /** @type {Array} */
      const cars = this.store.cars;
      const carId = cars.findIndex(
        ({ car }) => car.buyer_request_id === requestId
      );
      const car = cars.splice(carId, 1);

      const query = Object.assign({}, this.$route.query);
      delete query.order;
      this.$router.push({ query });
    },
    handleCheckboxToggle(detailId) {
      if (typeof detailId === "undefined") return;
      const inArrayIndex = this.checked.findIndex(index => detailId === index);
      if (inArrayIndex < 0) return this.checked.push(detailId);
      this.checked.splice(inArrayIndex, 1);
    },
    handleDetailPick(i) {
      const id = this.opened;
      /** @type {Array} */
      const cars = this.store.cars;
      const current = cars.findIndex(({ car }) => car.buyer_request_id === id);
      Store.data.cars[current].pickedDetail = i;
    }
  },
  created() {
    this.getCars();
    this.lastFetch = Date.now();
    this.$options.timer = setInterval(this.checkForUpdates, 5000);
  },
  beforeDestroy() {
    clearInterval(this.$options.timer);
  }
};
</script>

<style lang="sass" src="./style.sass" scoped>
</style>
