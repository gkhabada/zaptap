const store = {
  data: {
    cars: [],
    headers: [
      {
        title: "Новые",
        id: "counter",
        width: "12%"
      },
      {
        title: "Номер",
        id: "buyer_request_id",
        width: "10.5%"
      },
      {
        title: "Марка",
        id: "brand",
        width: "10.5%"
      },
      {
        title: "Модель",
        id: "model",
        width: "11.30%"
      },
      {
        title: "Поколение",
        id: "year",
        width: "14.50%"
      },
      {
        title: "Двс",
        id: "engine_volume",
        width: "7.25%"
      },
      {
        title: "Привод",
        id: "drive",
        width: "12%"
      },
      {
        title: "Кпп",
        id: "transmission",
        width: "9.5%"
      },
      {
        title: "Кузов",
        id: "body",
        width: "12.45%"
      }
      // {
      //   title: '',
      //   id: 'return',
      //   width: '35px',
      // },
    ]
  },
  methods: {
    /** @param {Array} cars */
    setCars(cars, { page = 1, limit = 50 } = {}) {
      if (page === 1 && cars.length === 0) return (store.data.cars = []);

      const dataCars = cars.map(function({
        options,
        notes,
        details,
        user_info,
        vin_frame,
        new_responses,
        description,
        ...others
      }) {
        const counter = parseInt(new_responses);
        return {
          ...others,
          car: { ...options, notes, description, vin_frame },
          user: user_info || {},
          details: details || [],
          counter: !isNaN(counter) ? counter : 0
        };
      });
      // .sort((a, b) => {
      //   return b.car.created_timestamp - a.car.created_timestamp;
      // });
      const startFrom = (page - 1) * limit;
      const endTo = page * limit;
      store.data.cars.splice(startFrom, endTo, ...dataCars);
    }
  }
};

export default store;
