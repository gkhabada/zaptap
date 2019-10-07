import { post } from "../../api/request";
import Vue from "vue";

const store = {
  data: {
    cars: [],
    details: [],
    sellerStock: {}
  },
  methods: {
    notify() {
      Vue.notify({
        group: "stock",
        text: "Сохранено",
        position: "bottom left",
        max: 3
      });
    },
    /** @param {{brand: {model: [{car_id: Number, generation: String}]}}} cars */
    setCars(cars) {
      return new Promise((resolve, reject) => {
        let sortedBrands = Object.keys(cars)
          .sort((a, b) => a.localeCompare(b));

        // все бренды, которые начинаются не на a-z0-9 - в конце
        sortedBrands = sortedBrands.filter(item => (/^[^a-z0-9]+$/igm).exec(item) === null)
          .concat(sortedBrands.filter(item => (/^[^a-z0-9]+$/igm).exec(item) !== null))
          .map(brand => {
            const models = cars[brand];
            if (!brand) return;

            const brandCars = [];
            const sortedModels = Object.keys(cars[brand])
              //.sort((a, b) => a.localeCompare(b))
              .map(model => {
                const generations = models[model];
                if (!Array.isArray(generations)) return;

                const modelCars = [];
                const sortedGenerations = generations.map(
                  ({ generation, car_id }) => {
                    modelCars.push(car_id);
                    brandCars.push(car_id);
                    return {
                      title: generation || model,
                      car_id
                    };
                  }
                );

                return {
                  title: model,
                  generations: sortedGenerations,
                  cars: modelCars || []
                };
              });

            return {
              title: brand,
              models: sortedModels,
              cars: brandCars || []
            };
          });

        store.data.cars = sortedBrands;
        resolve();
      });
    },
    setDetails(data) {
      return new Promise((resolve, reject) => {
        store.data.details = Object.keys(data)
          .sort((a, b) => a.localeCompare(b))
          .map(unit => ({
            title: unit,
            details: data[unit].map(({ detail_name, detail_id }) => ({
              title: detail_name || "",
              id: detail_id
            }))
          }));
        resolve();
      });
    },
    getAllDetails() {
      return post("/seller/get-all-details")
        .then(response => {
          const data = response.data;
          if (!data || typeof data !== "object" || data.code) return;
          return store.methods.setDetails(data);
        })
        .catch(console.log);
    },
    getDetailsLength() {
      let length = 0;
      store.data.details.forEach(({ details }) => (length += details.length));
      return length;
    },
    setSellerStock(data) {
      if (!data || !Array.isArray(data)) return;

      const length = store.methods.getDetailsLength();
      const collection = store.data.cars;
      const temp = {};
      data.map(({ included_details, not_included_details, car_id }) => {
        const brand = collection.find(({ cars }) => cars.includes(car_id));
        const model = brand.models.find(({ cars }) => cars.includes(car_id));
        const gen = model.generations.find(({ car_id: id }) => car_id === id);

        if (!temp[brand.title]) {
          temp[brand.title] = {};
        }
        if (!temp[brand.title][model.title]) {
          temp[brand.title][model.title] = {};
        }

        if (included_details) {
          temp[brand.title][model.title][gen.title] = {
            details: included_details,
            included: true
          };
        } else if (not_included_details) {
          temp[brand.title][model.title][gen.title] = {
            details: not_included_details,
            included: false
          };
        } else {
          temp[brand.title][model.title][gen.title] = {
            details: [],
            included: true
          };
        }
      });
      store.data.sellerStock = temp;
    },
    getSellerStock() {
      post("/stock/get-seller-stock")
        .then(response => {
          const data = response.data;
          if (!data || typeof data !== "object") return;

          store.methods.setSellerStock(data);
        })
        .catch(console.log);
    }
  }
};

export default store;
