const fields = [
  ['brand', 'Марка'],
  ['model', 'Модель'],
  ['generation', 'Поколение'],
  ['engine_volume', 'Объем двигателя'],
  ['engine_type', 'Тип двигателя'],
  ['engine_power', 'Мощность'],
  ['drive', 'Привод'],
  ['body', 'Тип кузова'],
  ['transmission', 'Кпп'],
  ['body_number', 'Код кузова'],
  ['engine_number', 'Код двигателя'],
  ['market', 'Рынок'],
]
export const carProps = fields.map(([field, title]) => ({
  field,
  title,
  items: [],
  picked: -1,
}))
