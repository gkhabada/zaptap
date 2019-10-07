<template lang="pug">
  transition(name="popup")
    .popup(v-show="brandExists" @click="handleBlur")
      .popup__content
        .close

        .brand
          .brand__checkbox
            checkbox(:status="status" @click="toggleBrand")
          .brand__title  {{ brand }}
        .container
          .container__overflow
            .container__scrollable
              //- MODELS
              .item(v-for="model in models" :key="model.title")
                .item__title(:class="{opened: active.model[model.title]}" :title="model.title")
                  checkbox(:status="model.status" @click="checkModel(model)")
                  .title__text(@click="toggle('model', model.title, $event)") {{ model.title }}
                  .title__line(@click="toggle('model', model.title, $event)")
                  .title__status(:class="{opened: active.model[model.title]}" @click="toggle('model', model.title, $event)")

                .item__body(v-if="active.model[model.title]")
                  //- GENERATIONS
                  .item(v-for="generation in model.generations" :key="model.title + generation.title")
                    .item__title.generations(:class="{opened: active.generation[generation.title]}" :title="generation.title" @click="getUnitsForGeneration(model, generation)")
                      checkbox(:status="generation.status" @click="checkGeneration(model, generation)")
                      .title__text(@click="toggle('generation', generation.title, $event)") {{ generation.title }}
                      .title__line(@click="toggle('generation', generation.title, $event)")
                      .title__status(:class="{opened: active.generation[generation.title]}" @click="toggle('generation', generation.title, $event)")

                    .item__body(v-if="active.generation[generation.title]")
                      //- UNIT
                      .item(v-for="unit in allUnits[model.title + generation.title]" :key="model.title + generation.title + unit.title")
                        .item__title.units(:class="{opened: active.unit[unit.title]}" :title="unit.title")
                          checkbox(:status="unit.status" @click="checkUnit(model, generation, unit)")
                          .title__text(@click="toggle('unit', unit.title, $event, model, generation, unit)") {{ unit.title }}
                          .title__line(@click="toggle('unit', unit.title, $event, model, generation, unit)" v-if="unit.details.length > 0")
                          .title__status(:class="{opened: active.unit[unit.title]}" v-if="unit.details.length > 0" @click="toggle('unit', unit.title, $event, model, generation, unit)")

                        .item__body(v-if="active.unit[unit.title] && unit.details.length > 0")
                          //- DETAIL
                          .item(v-for="detail in unit.details" :key="model.title + generation.title + unit.title + detail.title")
                            .item__title.details(:title="detail.title" @click="checkDetail(model, generation, unit, detail)")
                              checkbox(:status="detail.status")
                              .title__text.details {{ detail.title }}

          .scroll
            scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps" :animation='animation')

</template>

<script>
import Store from "../../pages/SellerStock/store";
import Scroll from "../Scroll/mixin";
import { post } from "../../api/request";
import Checkbox from "../Checkbox/Checkbox";

export default {
  props: ["brand","status"],
  data: () => ({
    visible: true,
    store: Store.data,
    active: {
      model: {},
      generation: {},
      unit: {}
    },
    animation: false,
    models: [],
    allUnits: {}
  }),
  components: {
    Checkbox
  },
  computed: {
    detailsLength() {
      let length = 0;
      this.store.details.forEach(({ details }) => (length += details.length));
      return length;
    },
    brandExists() {
      return typeof this.brand === "string";
    }
  },
  mixins: [Scroll],
  methods: {
    ...Store.methods,
    toggleBrand() {
      this.$emit('toggleBrand');
      this.models = this.getModels();
    },
    getUnitsForGeneration(model, generation) {
      const car = this.store.cars.find(({ title }) => title === this.brand);
      if (!car) return {};
      const temp = {};
      const sellerStock = this.store.sellerStock;

      this.$set(
        this.allUnits,
        model.title + generation.title,
        this.getUnits({ model, generation })
      );
    },
    checkModel(model) {
      const { status } = model;
      const currentState = this.store.sellerStock[this.brand] || {};
      currentState[model.title] = currentState[model.title] || {};
      if (status === 0) {
        post("/stock/add-subnodes-to-stock", {
          brand: this.brand,
          model: model.title
        })
          .then(this.notify)
          .catch(console.log);
        model.generations.forEach(generation => {
          currentState[model.title][generation.title] = {
            included: false,
            details: []
          };
        });
      } else {
        post("/stock/remove-subnodes-from-stock", {
          brand: this.brand,
          model: model.title
        })
          .then(this.notify)
          .catch(console.log);
        model.generations.forEach(generation => {
          currentState[model.title][generation.title] = {
            included: true,
            details: []
          };
        });
      }

      this.$set(this.store.sellerStock, this.brand, currentState);
      model.generations.forEach(generation => {
        this.getUnitsForGeneration(model, generation);
      });
      this.models = this.getModels();
      this.$forceUpdate();
    },
    checkGeneration(model, generation) {
      const { status } = generation;
      const currentState = this.store.sellerStock[this.brand] || {};
      currentState[model.title] = currentState[model.title] || {};
      if (status === 0) {
        post("/stock/add-subnodes-to-stock", {
          brand: this.brand,
          model: model.title,
          generation: generation.title
        })
          .then(this.notify)
          .catch(console.log);
        currentState[model.title][generation.title] = {
          included: false,
          details: []
        };
      } else {
        post("/stock/remove-subnodes-from-stock", {
          brand: this.brand,
          model: model.title,
          generation: generation.title
        })
          .then(this.notify)
          .catch(console.log);
        currentState[model.title][generation.title] = {
          included: true,
          details: []
        };
      }

      this.$set(this.store.sellerStock, this.brand, currentState);

      this.getUnitsForGeneration(model, generation);
      this.models = this.getModels();
      this.$forceUpdate();
    },
    checkUnit(model, generation, unit) {
      const { status } = unit;
      const currentState = this.store.sellerStock[this.brand] || {};
      currentState[model.title] = currentState[model.title] || {};
      if (unit.title === "Другое") {
        const currentGeneration = currentState[model.title][
          generation.title
        ] || { included: true, details: [] };
        currentState[model.title][generation.title] = currentGeneration;

        const detail = {
          detail_id: 0,
          car: {
            brand: this.brand,
            model: model.title,
            generation: generation.title
          }
        };

        if (status === 0) {
          post("/stock/add-detail-to-stock", detail)
            .then(this.notify)
            .catch(console.log);

          if (currentGeneration.included) {
            currentState[model.title][generation.title].details.push(0);
          } else {
            const i = currentGeneration.details.indexOf(0);
            if (~i)
              currentState[model.title][generation.title].details.splice(i, 1);
          }
        } else {
          post("/stock/remove-detail-from-stock", detail)
            .then(this.notify)
            .catch(console.log);

          if (currentGeneration.included) {
            const i = currentGeneration.details.indexOf(0);
            if (~i)
              currentState[model.title][generation.title].details.splice(i, 1);
          } else {
            currentState[model.title][generation.title].details.push(0);
          }
        }
        this.$set(this.store.sellerStock, this.brand, currentState);

        this.getUnitsForGeneration(model, generation);
        this.models = this.getModels();
        this.$forceUpdate();
        return;
      }
      // STATUS === 0
      if (status === 0) {
        post("/stock/add-unit-to-stock", {
          unit: unit.title,
          car: {
            brand: this.brand,
            model: model.title,
            generation: generation.title
          }
        })
          .then(this.notify)
          .catch(console.log);
        const currentGeneration = currentState[model.title][
          generation.title
        ] || { included: true, details: [] };
        const unitIds = unit.details.map(({ id }) => id);
        const included = currentGeneration.included;
        const details_ = currentGeneration.details;
        let details;
        if (included) {
          details = [...details_, unitIds.filter(id => !details_.includes(id))];
        } else {
          details = details_.filter(id => !unitIds.includes(id));
        }

        currentState[model.title][generation.title] = Object.assign(
          {},
          { included, details }
        );
        // STATUS === 2 || 1
      } else {
        post("/stock/remove-unit-from-stock", {
          unit: unit.title,
          car: {
            brand: this.brand,
            model: model.title,
            generation: generation.title
          }
        })
          .then(this.notify)
          .catch(console.log);
        const currentGeneration = currentState[model.title][
          generation.title
        ] || { included: false, details: [] };
        const unitIds = unit.details.map(({ id }) => id);
        const included = currentGeneration.included;
        const details_ = currentGeneration.details;
        let details;
        if (included) {
          details = details_.filter(id => !unitIds.includes(id));
        } else {
          details = details_.concat(
            unitIds.filter(id => !details_.includes(id))
          );
        }

        currentState[model.title][generation.title] = Object.assign(
          {},
          { included, details }
        );
      }

      this.$set(this.store.sellerStock, this.brand, currentState);

      this.getUnitsForGeneration(model, generation);
      this.models = this.getModels();
      this.$forceUpdate();
    },
    checkDetail(model, generation, unit, detail) {
      const { status } = detail;
      const currentState = this.store.sellerStock[this.brand] || {};
      currentState[model.title] = currentState[model.title] || {};
      if (status === 0) {
        post("/stock/add-detail-to-stock", {
          detail_id: detail.id,
          car: {
            brand: this.brand,
            model: model.title,
            generation: generation.title
          }
        })
          .then(this.notify)
          .catch(console.log);
        const currentGeneration = currentState[model.title][
          generation.title
        ] || {
          included: true,
          details: [detail.id]
        };
        const included = currentGeneration.included;
        const details = currentGeneration.details;
        const exists = details.findIndex(id => id === detail.id);

        if (included && exists < 0) details.push(detail.id);
        if (!included && exists >= 0) details.splice(exists, 1);
        currentState[model.title][generation.title] = Object.assign(
          {},
          { included, details }
        );
      } else {
        post("/stock/remove-detail-from-stock", {
          detail_id: detail.id,
          car: {
            brand: this.brand,
            model: model.title,
            generation: generation.title
          }
        })
          .then(this.notify)
          .catch(console.log);
        const currentGeneration = currentState[model.title][
          generation.title
        ] || {
          included: false,
          details: [detail.id]
        };
        const included = currentGeneration.included;
        const details = currentGeneration.details;
        const exists = details.findIndex(id => id === detail.id);

        if (!included && exists < 0) details.push(detail.id);
        if (included && exists >= 0) details.splice(exists, 1);
        currentState[model.title][generation.title] = Object.assign(
          {},
          { included, details }
        );
      }
      this.$set(this.store.sellerStock, this.brand, currentState);
      this.getUnitsForGeneration(model, generation);
      this.models = this.getModels();
      this.$forceUpdate();
    },
    getUnits({ model, generation }) {
      const stockDetails = this.store.details;

      if (!model || !generation) return [];

      const allUnits = stockDetails.map(unit => {
        const defaultUnit = Object.assign({}, unit, {
          status: 0,
          details: unit.details.map(detail => {
            return Object.assign({}, detail, { status: 0 });
          })
        });

        const sellerModels = this.store.sellerStock[this.brand];
        if (!sellerModels) return Object.assign({}, defaultUnit);
        const sellerGenerations = sellerModels[model.title];
        if (!sellerGenerations) return Object.assign({}, defaultUnit);
        const sellerCar = sellerGenerations[generation.title];
        if (!sellerCar) return Object.assign({}, defaultUnit);

        const allDetails = unit.details.map(detail => {
          const isActive = sellerCar.details.includes(detail.id);
          const status = sellerCar.included
            ? isActive
              ? 2
              : 0
            : isActive
              ? 0
              : 2;
          return Object.assign({}, detail, { status });
        });
        if (allDetails.every(({ status }) => status === 2)) {
          return Object.assign({}, defaultUnit, {
            details: allDetails,
            status: 2
          });
        } else if (allDetails.some(({ status }) => status > 0)) {
          return Object.assign({}, defaultUnit, {
            details: allDetails,
            status: 1
          });
        } else {
          return Object.assign({}, defaultUnit);
        }
      });
      const defaultOther = {
        status: 0,
        details: [],
        title: "Другое"
      };
      const sellerModels = this.store.sellerStock[this.brand];
      if (!sellerModels) return [...allUnits, defaultOther];
      const sellerGenerations = sellerModels[model.title];
      if (!sellerGenerations) return [...allUnits, defaultOther];
      const sellerCar = sellerGenerations[generation.title];
      if (!sellerCar) return [...allUnits, defaultOther];
      const isActive = sellerCar.details.includes(0);
      return [
        ...allUnits,
        {
          status: sellerCar.included ? (isActive ? 2 : 0) : isActive ? 0 : 2,
          details: [],
          title: "Другое"
        }
      ];
    },
    getModels() {
      const car = this.store.cars.find(({ title }) => title === this.brand);
      if (!car) return [];

      const models = car.models;
      if (!models) return [];
      const stockDetails = this.store.details;

      const sellerModels = this.store.sellerStock[this.brand];
      const defaultBrand = models.map(model =>
        Object.assign({}, model, {
          status: 0,
          generations: model.generations.map(generation =>
            Object.assign({}, generation, { status: 0 })
          )
        })
      );
      if (!sellerModels) return Object.assign({}, defaultBrand);
      // MODELS
      const allModels = models.map(({ generations, ...model }) => {
        const sellerGenerations = sellerModels[model.title];
        const defaultModel = Object.assign({}, model, {
          status: 0,
          generations: generations.map(generation =>
            Object.assign({}, generation, { status: 0 })
          )
        });
        if (!sellerGenerations) return Object.assign({}, defaultModel);
        // GENERATIONS
        /** @type {[{car_id: Number, title: String, status: (0|1|2)}]} */
        const allGenerations = generations.map(generation => {
          const defaultGeneration = Object.assign({}, generation, {
            status: 0
          });

          const sellerCar = sellerGenerations[generation.title];
          if (!sellerCar) return Object.assign({}, defaultGeneration);

          const details = sellerCar.details.length;
          defaultGeneration.status = sellerCar.included
            ? details === this.detailsLength
              ? 2
              : details > 0
                ? 1
                : 0
            : details === 0
              ? 2
              : details < this.detailsLength
                ? 1
                : 0;

          return Object.assign({}, defaultGeneration);
        });

        if (allGenerations.every(({ status }) => status === 2)) {
          return Object.assign({}, defaultModel, {
            generations: allGenerations,
            status: 2
          });
        } else if (allGenerations.some(({ status }) => status > 0)) {
          return Object.assign({}, defaultModel, {
            generations: allGenerations,
            status: 1
          });
        } else {
          return Object.assign({}, defaultModel, {
            generations: allGenerations
          });
        }
      });

      return allModels;
    },
    getCheckboxStatus(isIncluded, length) {
      const isFull = this.detailsLength === length;
      const isEmpty = length === 0;
      return isIncluded
        ? isFull
          ? 2
          : isEmpty
            ? 0
            : 1
        : isEmpty
          ? 2
          : isFull
            ? 0
            : 1;
    },
    toggle(type, key, event, model, generation, unit) {
      if (key === "Другое") return this.checkUnit(model, generation, unit);
      this.animation = true;
      const status = this.active[type][key];

      if (status) {
        /** @type {HTMLElement} */
        const item = event.target;
        const parent = item.parentNode.parentNode;
        const body = parent.childNodes.item(1);
        const height = body.scrollHeight;

        body.style.height = height + "px";
        window.requestAnimationFrame(() => {
          body.style.height = "0px";
        });

        window.setTimeout(() => {
          this.$set(this.active[type], key, !status);
        }, 200);
        return;
      }

      this.$set(this.active[type], key, !status);
      this.$nextTick(() => {
        /** @type {HTMLElement} */
        const item = event.target;
        const parent = item.parentNode.parentNode;
        const parentBody = parent.parentNode;
        const body = parent.childNodes.item(1);
        const height = body.scrollHeight;

        body.style.height = height + "px";

        if (!parentBody.classList.contains("container__scrollable")) {
          parentBody.style.height = "auto";
        }

        window.setTimeout(() => {
          body.style.height = "auto";
        }, 200);
      });

      window.setTimeout(() => {
        this.animation = false;
      }, 200);
      if (type !== "unit") this.$set(this.active, "unit", {});
    },
    handleBlur(event) {
      /** @type {HTMLElement} */
      const target = event.target;
      const popup = this.$el.querySelector(".popup__content");

      if (!popup.contains(target) || target.classList.contains("close")) {
        this.$set(this.active, "model", {});
        this.$set(this.active, "generation", {});
        this.$set(this.active, "unit", {});
        this.$emit("close");
      }
    }
  },
  watch: {
    brand(brand) {
      if (brand) {
        this.models = this.getModels();
      }
    }
  },
  created() {
    this.getAllDetails();
  }
};
</script>


<style lang="sass" src="./style.sass" scoped></style>
