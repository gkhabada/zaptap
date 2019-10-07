import { post } from '../../api/request';

const store = {
  data: {
    cars: [],
    headers: [
      {
        title: 'Номер',
        id: 'buyer_request_id',
        width: '11.85%',
      },
      {
        title: 'Марка',
        id: 'brand',
        width: '11.85%',
      },
      {
        title: 'Модель',
        id: 'model',
        width: '13.91%',
      },
      {
        title: 'Год',
        id: 'year',
        width: '10.77%',
      },
      {
        title: 'Двс',
        id: 'engine_volume',
        width: '11.85%',
      },
      {
        title: 'Привод',
        id: 'drive',
        width: '14.5%',
      },
      {
        title: 'Кпп',
        id: 'transmission',
        width: '10.77%',
      },
      {
        title: 'Кузов',
        id: 'body',
        width: '14.5%',
      },
    ],
  },
  methods: {
    /** @param {Array} cars */
    setCars(cars) {
      const dataCars = [];
      cars.forEach((car) => {
        dataCars.push({
          car,
          user: {},
          details: [],
          pickedDetail: -1,
          carId: car.buyer_request_id,
        });
      });
      store.data.cars = dataCars;
    },
    setDetails({ sellers_list } = {}, id) {
      if (!Array.isArray(sellers_list)) return;
      const carId = store.data.cars.findIndex(({ car }) => {
        const buyer_request_id = car && Number(car.buyer_request_id);
        return id === buyer_request_id;
      });
      if (carId <= -1) return;
      store.data.cars[carId].details = sellers_list.map((detail) => detail);
    },
    removeDetail(carId, detailId) {
      const foundCar = store.data.cars.find(({ carId: storeCarId } = {}) => {
        return Number(carId) === Number(storeCarId);
      });
      if (!foundCar) return;
      const details = Array.isArray(foundCar.details) ? foundCar.details : [];
      let item = -1;
      const foundDetailsGroup = details.find(({ details } = {}) => {
        return details.find(({ order_detail_id } = {}, i) => {
          if (order_detail_id === detailId) {
            item = i;
            return true;
          }
        });
      });
      if (!~item) return;
      const copy = foundDetailsGroup.details[item];
      foundDetailsGroup.details.splice(item, 1);
      post('/order/delete-order-detail', { order_detail_id: detailId })
        .then((response) => {
          const error = response.data;
          if (error) {
            foundDetailsGroup.details.splice(item, 0, copy);
            console.log(error.message);
          }
        })
        .catch((error) => {
          console.log(error.message);
          foundDetailsGroup.details.splice(item, 0, copy);
        });
    },
  },
};

export default store;
