import Vue from 'vue';

const store = {
  data: {
    cars: [],
    headers: [
      {
        title: 'Номер',
        id: 'buyer_request_id',
        width: '8.52%',
      },
      {
        title: 'Дата',
        id: 'date',
        width: '8.52%',
      },
      {
        title: 'Марка',
        id: 'brand',
        width: '8.52%',
      },
      {
        title: 'Модель',
        id: 'model',
        width: '8.52%',
      },
      {
        title: 'Поколение',
        id: 'year',
        width: '10.13%',
      },
      {
        title: 'Двс',
        id: 'engine_volume',
        width: '6.38%',
      },
      {
        title: 'Привод',
        id: 'drive',
        width: '10.13%',
      },
      {
        title: 'Кпп',
        id: 'transmission',
        width: '6.38%',
      },
      {
        title: 'Кузов',
        id: 'body',
        width: '10.13%',
      },
      {
        title: 'Покупатель',
        id: 'user',
        width: '22.77%', //'31.77%',
      },
    ],
  },
  methods: {
    /** @param {Array} cars */
    setCars(cars) {
      Vue.set(store.data, 'cars', []);
      const dataCars = cars.map(
        ({
          options,
          notes,
          details,
          description,
          user_info,
          vin_frame,
          ...others
        }) => {
          return {
            ...others,
            car: { ...options, description, notes, vin_frame },
            user: user_info || {},
            notes,
            description,
            details: Array.isArray(details) ? details : [],
          };
        },
      );

      Vue.set(store.data, 'cars', [...dataCars]);
    },
    setDetails(data, id) {
      const carId = store.data.cars.findIndex(({ car }) => {
        const buyer_request_id = car && Number(car.buyer_request_id);
        return id === buyer_request_id;
      });
      if (carId <= -1) return;
      store.data.cars[carId].details = data.list.map(detail => detail);
      store.data.cars[carId].user = data.client_info || {};
    },
  },
};

export default store;
