<template lang="pug">
  .loadingpage(v-if="isLoading")
    .loadingtitle Идет загрузка запросов, подождите...
    .loadingcircle
  .sellerrequests(:class="{opened: isOpened}" v-else)
    client-info(:userid="userid" v-if="userid" @close="userid = false")
    comments-viewer(
      :buyerComment="choosen ? choosen.notes : ''"
      :sellerComment="choosen ? choosen.description : ''"
      v-if="isDescriptionVisible"
      buyertitle="примечание покупателя"
      @close="isDescriptionVisible = false"
      )
    //- seller-requests-notactive
    .header
      .filter(v-if="!isOpened")
        .dropdown(v-for="(f, i) in filterList")
          template(v-if="f.field === 'date'")
            vue-datepicker(:date.sync="date"
                    :opened="openedFilter === i"
                    @open="openFilter(i)"
                    @close="closeFilter(i)"
                    @pick="handleDatePick")
          template(v-else)
            dropdown(v-bind="f"
                    :opened="openedFilter === i"
                    :items="filters[f.field]"
                    :picked="picked[f.field]"
                    @open="openFilter(i)"
                    @close="closeFilter(i)"
                    @pick="handleFilterItemPick(f.field, $event)"
                    @enter="handleFilterEnter(f.field, $event)")

        .clear__filters(v-if="!filterClear" @click="resetFilters") Сбросить фильтр

      .user(v-else-if="choosen")
        .user__data
          .data__common(@click="userid = user.user_id")
            .data__pic
              .preview {{ `${(user.name || '')[0] || ''}${(user.surname || '')[0] || ''}`}}
              .image(:style="{backgroundImage: `url('${getUrlFromString(user.user_images)}')`}" v-if="user.user_images")

            .data__name {{ `${user.name || ''} ${user.surname || ''}` }}
            // .data__reviews отзывы
            // .data__plus {{ user.positive_reviews }}+
            // .data__minus {{ user.negative_reviews }}-
            // .data__thumb__up(v-if="user.is_positive")

        .user__contacts
          .contacts__seller
            .seller__city г. {{ user.locality }}
            a.seller__phone(:href="`tel:${getFirstPhone(user.phones || 'нет телефона')}`") {{ user.phones || 'нет телефона' | firstPhone }}
            .seller__social(v-if="user.social")
              a.social__mail(:href="`mailto:${user.social.mail}`" target="_blank" v-if="user.social.mail" :title="user.social.mail")
              a.social__phone(:href="`https://wa.me/${user.social.whatsapp}`" target="_blank" v-if="user.social.whatsapp" :title="user.social.whatsapp")
              a.social__viber(:href="`viber://add?number=${user.social.viber}`" target="_blank" v-if="user.social.viber" :title="user.social.viber")
              a.social__telegram(:href="`tg://resolve?domain=${user.social.telegram}`" target="_blank" v-if="user.social.telegram" :title="user.social.telegram")
              a.social__skype(:href="`skype:${user.social.skype}?chat}`" target="_blank" v-if="user.social.skype" :title="user.social.skype")


          .contacts__client
            .client__comment
              .comment__title(@click="isDescriptionVisible = true" :class="{active: choosen && choosen.notes}") Примечание

      transition(name="opacity" mode="out-in")
        .folders(v-if="!isOpened")
          router-link.folders__item(:to="{query: {type: id}}" v-for="({title, id}, i) in tabs" :class="{active: tab === id}" :key="id") {{ title }} ({{ orders[i] }})

    .content
        .table
          table-component(v-bind="{cars: filteredStoreCars, opened, headers: store.headers, isOpened, emptyMessage: 'Запросов пока нет'}")

        .current
          seller-requests-list(:choosen="choosen" :deliveryTerm="deliveryTerm" @update="getCars" @update:details="updateDetails")

</template>

<script>
import Store from "./store";
import { post } from "../../api/request";
import TableComponent from "../../components/TableComponent/TableComponent";
import Dropdown from "../../components/Dropdown/Dropdown";
import VueDatepicker from "../../components/VueDatepicker/VueDatepicker";
import SellerRequestsList from "../../components/SellerRequestsList/SellerRequestsList";
import ClientInfo from "../../components/ClientInfo";
import Vue from "vue";
import CommentsViewer from "../../components/CommentsViewer/CommentsViewer";
import SellerRequestsNotactive from "../../components/SellerRequestsNotactive";
import { getUrlFromString } from "../../helpers/imageLoader.js";

const placeholder = {
  items: [],
  picked: -1,
  opened: false
};

export default Vue.extend({
  data() {
    return {
      isLoading: true,
      isDescriptionVisible: false,
      userid: false,
      openedFilter: -1,
      store: Store.data,
      allCars: { active_orders: [], finished_orders: [] },
      tabs: [
        { title: "Текущие", id: "active_orders" },
        { title: "Отвеченные", id: "finished_orders" }
      ],
      checked: [],
      date: [],
      filterList: [
        { field: "date", title: "По дням" },
        { field: "brand", title: "Марка" },
        { field: "model", title: "Модель" },
        { field: "generation", title: "Поколение" },
        { field: "city", title: "Город" }
      ],
      picked: {
        brand: -1,
        model: -1,
        generation: -1,
        city: -1
      },
      deliveryTerm: 0,
    };
  },
  components: {
    TableComponent,
    Dropdown,
    VueDatepicker,
    SellerRequestsList,
    ClientInfo,
    CommentsViewer,
    SellerRequestsNotactive
  },
  computed: {
    filterClear() {
      if (this.date.length > 0) return false;
      if (this.picked.brand > -1) return false;
      if (this.picked.model > -1) return false;
      if (this.picked.generation > -1) return false;
      if (this.picked.city > -1) return false;
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
              this.filters.generation[this.picked.generation] || {};
            return props.car.generation === picked.title;
          } else if (this.picked.model > -1) {
            const picked = this.filters.model[this.picked.model] || {};
            return props.car.model === picked.title;
          } else {
            const picked = this.filters.brand[this.picked.brand] || {};
            return props.car.brand === picked.title;
          }
        })
        .filter(({ car, user }) => {
          const dateStart = Math.min(...this.date);
          const dateEnd = Math.max(...this.date);
          const ts = car.created_timestamp;
          let between = true;
          if (this.date.length > 0) between = ts > dateStart;
          if (this.date.length === 2)
            between = ts >= dateStart && ts <= dateEnd;
          const choosen = this.filters.city[this.picked.city] || {};
          const inCity =
            this.picked.city > -1 ? user.locality === choosen.title : true;
          return between && inCity;
        });
    },
    filters() {
      if (!this.allCars || !this.allCars[this.tab])
        return { brand: [], model: [], generation: [], city: [] };

      const options = this.allCars[this.tab].map(({ options }) => options);
      const takeDifferent = (c, v) => {
        if (!c.includes(v)) return [...c, v];
        return c;
      };
      const cities = this.allCars[this.tab]
        .map(({ user_info }) => {
          if (!user_info) return;
          return user_info.locality;
        })
        .filter(x => x)
        .reduce(takeDifferent, [])
        .map((title, index) => ({ title, index }));
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
      return {
        brand: brands,
        model: models,
        generation: generations,
        city: cities
      };
    },
    isOpened() {
      return this.opened >= 0;
    },
    ordersArray() {
      const all = this.allCars[this.tab].map(({ options }) => {
        return options.buyer_request_id;
      });
      return all;
    },
    orders() {
      const result = [];
      const active = this.allCars["active_orders"];
      const finished = this.allCars["finished_orders"];
      result[0] = active ? active.length : 0;
      result[1] = finished ? finished.length : 0;
      return result;
    },
    opened() {
      const query = this.$route.query;
      const order = Number(query.order);
      return isNaN(order) ? -1 : order;
    },
    choosen() {
      const allCars = this.allCars;
      if (!allCars) return;
      const id = this.opened;
      /** @type {Array} */
      const cars = this.store.cars;
      const car = cars.find(({ car = {} } = {}) => car.buyer_request_id === id);
      return car || null;
    },
    user() {
      if (!this.choosen) return {};
      return this.choosen.user || {};
    },
    tab() {
      const type = this.$route.query.type || "";
      return type === "finished_orders" ? "finished_orders" : "active_orders";
    }
  },
  watch: {
    tab(tab) {
      if (!this.allCars) return this.setCars([]);
      this.setCars(this.allCars[this.tab] || []);
    },
    ordersArray(orders) {
      if (!orders) return;
      if (~orders.indexOf(this.opened)) return;
      const query = { ...this.$route.query };
      delete query.order;
      this.$router.push({ query });
    }
  },
  methods: {
    ...Store.methods,
    getFirstPhone(v) {
      return String(v).split(";")[0];
    },
    getUrlFromString,
    resetFilters() {
      this.date = [];
      this.picked.brand = -1;
      this.picked.model = -1;
      this.picked.generation = -1;
      this.picked.city = -1;
    },
    updateDetails({ requestId, details = [] } = {}) {
      const cars = this.allCars[this.tab];
      const noCars = !Array.isArray(cars);
      const ok = !isNaN(requestId) && Array.isArray(details);
      if (noCars || !ok) return;
      // find current car
      const carPosition = cars.findIndex(({ options = {} } = {}) => {
        const { buyer_request_id } = options;
        return buyer_request_id === requestId;
      });
      const car = cars[carPosition];
      // find details in car
      const { details: carDetails } = car || {};
      const noDetails = !Array.isArray(carDetails);
      if (noDetails) return;
      // remove all not found details
      let counter = 0;
      carDetails.forEach(({ request_detail_id } = {}, index) => {
        const id = Number(request_detail_id);
        if (!details.includes(id)) {
          carDetails.splice(index - counter, 1);
          counter++;
        }
      });
      this.$set(this.allCars[this.tab][carPosition], "details", [
        ...carDetails
      ]);
      this.setCars(this.allCars[this.tab]);
    },
    addFileToPart(file) {
      const id = this.mediaLoaderId;
      if (id < 0) return;
      carParts[id].media.push({
        ...file
      });
    },
    openFilter(i) {
      this.openedFilter = i;
    },
    closeFilter() {
      this.openedFilter = -1;
    },
    handleDatePick(date) {},
    getCars() {
      const activeLink = "/seller/get-relevant-requests";
      const finishedLink = "/seller/get-answered-requests";
      // чтобы получить delivery_term. Да, лишний запрос, но от беков не дождешься пока что-то сделают ;(
      const userInfo = "/profile/get-user-profile";
      const requests = [post(activeLink), post(finishedLink), post(userInfo)];

      return Promise.all(requests)
        .then(([active, finished, user]) => {
          this.deliveryTerm = +user.data.delivery_term || 0;

          this.$set(this.allCars, "active_orders", []);
          this.$set(this.allCars, "finished_orders", []);
          this.setCars([]);

          const getData = ({ data } = {}) => {
            return Array.isArray(data) ? data : [];
          };
          this.allCars.active_orders = getData(active);
          this.allCars.finished_orders = getData(finished);

          this.setCars(this.allCars[this.tab]);
          return [
            ...this.allCars.active_orders,
            ...this.allCars.finished_orders
          ];
        })
        .catch(error => console.log(error.message));
    },
    handleFinishResponse() {
      this.$emit("finishresponse");
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

      const query = { ...this.$route.query };
      delete query.order;
      this.$router.push({ query });

      this.$on("finishresponse", this.getCars);
    },
    handleCheckboxToggle(detailId) {
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
    this.getCars()
      .then(cars => {
        this.isLoading = false;
        if (~this.opened) {
          const choosen = cars.find(({ options = {} } = {}) => {
            return options.buyer_request_id === this.opened;
          });
          if (!choosen) this.$router.push("/seller/requests");
        }
      })
      .catch(err => {
        this.isLoading = false;
        console.log(err);
      });
  }
});
</script>

<style lang="sass" src="./style.sass" scoped>
</style>
