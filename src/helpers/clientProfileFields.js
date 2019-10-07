export default [
  {
    title: '',
    collection: [
      { type: String, field: 'surname', title: 'Фамилия' },
      { type: String, field: 'name', title: 'Имя' },
      { type: String, field: 'patronymic', title: 'Отчество' },
    ],
  },
  {
    title: 'Контакты',
    collection: [
      { type: Array, field: 'phones', title: 'Телефон' },
      { type: String, field: 'email', title: 'Почта' },
      { type: String, field: 'whatsapp', title: `What's App` },
      { type: String, field: 'viber', title: 'Viber' },
      { type: String, field: 'telegram', title: 'Telegram' },
      { type: String, field: 'skype', title: 'Skype' },
      { type: String, field: 'site', title: 'Сайт' },
      { type: Number, field: 'delivery_price', title: 'Цена доставки до т.к.' },
    ],
  },
  {
    title: 'Адрес',
    collection: [
      { type: String, field: 'region', title: 'Регион' },
      { type: String, field: 'locality', title: 'Населеный пункт' },
      { type: String, field: 'street', title: 'Улица' },
      { type: String, field: 'house', title: 'Дом' },
      { type: String, field: 'corps', title: 'Корпус' },
      { type: String, field: 'office', title: 'Офис' },
    ],
  },
  {
    title: 'Реквизиты для перечисления денег на карту',
    collection: [
      { type: String, field: 'bank_name', title: 'Название банка' },
      { type: String, field: 'cart_number', title: '№ карты' },
      { type: String, field: 'cartholder_full_name', title: 'ФИО получателя' },
    ],
  },
  {
    title: 'Реквизиты для перечисления денег на рассчетный счет',
    collection: [
      { type: String, field: 'payment_account', title: 'Расч. счет' },
      { type: String, field: 'inn', title: 'ИНН' },
      { type: String, field: 'bic', title: 'БИК' },
      { type: String, field: 'correspondent_account', title: 'Корр. счет' },
      { type: String, field: 'company_name', title: 'Название компании' },
    ],
  },
  {
    title: 'Данные компании',
    collection: [
      { type: String, field: 'seller_inn', title: 'ИНН продавца' },
      { type: Array, field: 'seller_inn_photos', title: 'фото' },
      { type: String, field: 'seller_ogrn', title: 'ОГРН продавца' },
      { type: Array, field: 'seller_ogrn_photos', title: 'фото' },
    ],
  },
  {
    title: 'На кого отправлять в случае возврата?',
    collection: [
      { type: String, field: 'receiver_full_name', title: 'ФИО' },
      { type: String, field: 'receiver_phone', title: 'Телефон' },
      { type: String, field: 'receiver_passport', title: 'Паспортные данные' },
      {
        type: Array,
        field: 'receiver_trans_comps',
        title: 'Транспортные компании',
      },
    ],
  },
];
