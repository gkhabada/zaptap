<template lang="pug">
  .stock(:class="{stopped: !active}")
    .header
      .header__left
        // checkbox(:status="~~(!active) * 2" @click="setStock")
        .stop Выберите детали, которые у вас на складе.
        .hint
          .hint-title Так
          checkbox.checkbox_demo(:status="2")
          .hint-title - отмечено всё, а так
          checkbox.checkbox_demo(:status="1")
          .hint-title - часть
      .header__right
        .check__all Отметить всё
        checkbox(:status="allBrandsStatus" @click="toggleAll")
    .information
      .information__text Все запросы приостановлены, вы не будете получать новые запросы, пока не снимите галку.
    .container
      .container__overflow
        .container__scrollable
          .row(v-for="(row, rowIndex) in brandRows" :key="`row_${rowIndex}`")
            .brand(v-for="{brand, status} in row" :key="brand")
              checkbox(:status="status" @click="toggle(brand, status)")
              .title(@click="currentBrand = brand")
                .title__text {{ brand }}
                .title__line

      .scroll
        scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps")


    stock-popup(:brand="currentBrand" :status="currentBrandStatus" @close="currentBrand = null" @toggleBrand="toggle(currentBrand, currentBrandStatus)")
</template>

<script>
import Checkbox from "../../components/Checkbox/Checkbox";
import StockPopup from "../../components/StockPopup/StockPopup";
import { post } from "../../api/request";
import Store from "./store";
import Scroll from "../../components/Scroll/mixin";

export default {
  data: () => ({
    currentBrand: null,
    store: Store.data,
    visible: true,
    active: true
  }),
  computed: {
    detailsLength() {
      let length = 0;
      this.store.details.forEach(({ details }) => (length += details.length));
      return length;
    },
    allBrandsStatus() {
      if (this.brandRows.every(row => row.every(({ status }) => status === 2)))
        return 2;
      if (this.brandRows.some(row => row.some(({ status }) => status !== 0)))
        return 1;
      return 0;
    },
    brandRows() {
      /** @type {[String]} */
      const cars = this.store.cars.map(({ models, title: brandTitle }) => {
        const stockBrand = this.store.sellerStock[brandTitle];
        if (!stockBrand)
          return {
            brand: brandTitle,
            status: 0
          };
        const allModels = models.map(({ generations, title: modelTitle }) => {
          const stockModel = stockBrand[modelTitle];
          if (!stockModel) return 0;
          const allGenerations = generations.map(
            ({ title: generationTitle }) => {
              const stockGeneration = stockModel[generationTitle];
              if (!stockGeneration) return 0;

              const details = stockGeneration.details.length;
              const status = stockGeneration.included
                ? this.detailsLength === details
                  ? 2
                  : details > 0
                    ? 1
                    : 0
                : details === 0
                  ? 2
                  : details < this.detailsLength
                    ? 1
                    : 0;
              return status;
            }
          );
          if (allGenerations.every(s => s === 2)) {
            return 2;
          } else if (allGenerations.some(s => s > 0)) {
            return 1;
          } else {
            return 0;
          }
        });

        if (allModels.every(s => s === 2)) {
          return {
            brand: brandTitle,
            status: 2
          };
        } else if (allModels.some(s => s > 0)) {
          return {
            brand: brandTitle,
            status: 1
          };
        } else {
          return {
            brand: brandTitle,
            status: 0
          };
        }
      });
      const howMuchRows = 4;
      const itemsInRow = Math.floor(cars.length / howMuchRows);
      const rows = [];
      for (let i = 0; i < howMuchRows; i++) {
        const offset = i * itemsInRow;
        const border = offset + itemsInRow;
        rows[i] = cars.slice(offset, border);
      }
      return rows;
    },
    currentBrandStatus() {
      const brandInfo = this.brandRows.flat().find((el) => el.brand === this.currentBrand);
      return brandInfo ? brandInfo.status : 0;
    },
  },
  components: {
    Checkbox,
    StockPopup
  },
  methods: {
    ...Store.methods,
    async toggleAll() {
      const included = this.allBrandsStatus === 2;
      const toggle = brand => {
        const car = this.store.cars.find(({ title }) => title === brand);
        if (!car) return;
        const temp = {};
        car.models.forEach(({ generations, title: modelTitle }) => {
          temp[modelTitle] = {};
          generations.forEach(({ title: generationTitle }) => {
            temp[modelTitle][generationTitle] = {
              included,
              details: []
            };
          });
        });
        return temp;
      };
      const temp = {};
      this.brandRows.forEach(row => {
        row.forEach(({ brand }) => {
          temp[brand] = toggle(brand);
        });
      });
      this.$set(this.store, "sellerStock", temp);
      if (included) {
        await post("/stock/remove-all")
          .then(this.notify)
          .catch(console.log);
      } else {
        await post("/stock/add-all")
          .then(this.notify)
          .catch(console.log);
      }
    },
    toggle(brand, status) {
      const car = this.store.cars.find(({ title }) => title === brand);
      if (!car) return;
      const temp = {};
      if (status === 0) {
        post("/stock/add-subnodes-to-stock", { brand })
          .then(this.notify)
          .catch(console.log);
        car.models.forEach(({ generations, title: modelTitle }) => {
          temp[modelTitle] = {};
          generations.forEach(({ title: generationTitle }) => {
            temp[modelTitle][generationTitle] = {
              included: false,
              details: []
            };
          });
        });
      } else {
        post("/stock/remove-subnodes-from-stock", { brand })
          .then(this.notify)
          .catch(console.log);
        car.models.forEach(({ generations, title: modelTitle }) => {
          temp[modelTitle] = {};
          generations.forEach(({ title: generationTitle }) => {
            temp[modelTitle][generationTitle] = {
              included: true,
              details: []
            };
          });
        });
      }

      this.$set(this.store.sellerStock, brand, temp);
    },
    updateStock() {
      post("/stock/get-stock-status")
        .then(({ data }) => {
          this.active = typeof data.active === "boolean" ? data.active : true;
        })
        .catch(console.log);
    },
    setStock() {
      const active = !this.active;
      this.active = active;
      post("/stock/set-stock-status", { active }).catch(error => {
        this.active = !active;
        console.log(error);
      });
    }
  },
  mixins: [Scroll],
  created() {
    post("/seller/get-all-cars")
      .then(response => {
        const cars = response.data;
        if (!cars || cars.code) return;
        return this.setCars(cars);
      })
      .then(() => {
        this.getSellerStock();
      })
      .catch(console.log);

    this.updateStock();
  }
};
</script>


<style lang="sass" src="./style.sass" scoped></style>
