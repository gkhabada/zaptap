export const fields = {
  servername: {
    value: '',
    field: 'name',
  },
  serversurname: {
    value: '',
    field: 'surname',
  },
  serverpatronymic: {
    value: '',
    field: 'thirdname',
  },
  serveruser_images: {
    value: [],
    field: 'avatar',
  },
  serverphones: {
    value: [''],
    field: 'phones',
  },
  serverwhatsapp: {
    value: '',
    field: 'whatsapp',
  },
  serverviber: {
    value: '',
    field: 'viber',
  },
  servertelegram: {
    value: '',
    field: 'telegram',
  },
  serverskype: {
    value: '',
    field: 'skype',
  },
  serversite: {
    value: '',
    field: 'website',
  },
  serverdelivery_price: {
    value: '',
    field: 'deliveryCost',
  },
  serverdelivery_term: {
    value: '',
    field: 'deliveryTerm',
  },
  serverregion: {
    value: '',
    field: 'region',
  },
  serverlocality: {
    value: '',
    field: 'city',
  },
  serverstreet: {
    value: '',
    field: 'street',
  },
  serverhouse: {
    value: '',
    field: 'house',
  },
  servercorps: {
    value: '',
    field: 'building',
  },
  serveroffice: {
    value: '',
    field: 'office',
  },
  serverbank_name: {
    value: '',
    field: 'bankname',
  },
  servercart_number: {
    value: '',
    field: 'card',
  },
  servercartholder_full_name: {
    value: '',
    field: 'recipient',
  },
  serverpayment_account: {
    value: '',
    field: 'checkingAccount',
  },
  serverinn: {
    value: '',
    field: 'inn',
  },
  serverbic: {
    value: '',
    field: 'bik',
  },
  servercorrespondent_account: {
    value: '',
    field: 'corrAccount',
  },
  servercompany_name: {
    value: '',
    field: 'company',
  },
  serverseller_inn: {
    value: '',
    field: 'sellerInn',
  },
  serverseller_inn_photos: {
    value: [],
    field: 'innPhoto',
  },
  serverseller_ogrn: {
    value: '',
    field: 'sellerOgrn',
  },
  serverseller_ogrn_photos: {
    value: [],
    field: 'ogrnPhoto',
  },
  serverreceiver_full_name: {
    value: '',
    field: 'deliveryFio',
  },
  serverreceiver_passport: {
    value: '',
    field: 'deliveryPassport',
  },
  serverreceiver_phone: {
    value: '',
    field: 'deliveryPhone',
  },
  serverreceiver_trans_comps: {
    value: [],
    field: 'transCompanies',
  },
};

export const changedFields = [];

/**
 * Compare two arrays
 * @param {Array} a first array
 * @param {Array} b second array
 */
const isEqualArray = function(a, b) {
  if (a.length !== b.length) return false;
  return !a.some((v, i) => {
    if (Array.isArray(v) || Array.isArray(b[i])) {
      return isEqualArray(v, b[i]);
    }
    return v !== b[i];
  });
};

export function getComputedFields() {
  const props = {};
  Object.keys(fields).forEach(serverField => {
    const { field } = fields[serverField];
    props[field] = {
      get: () => fields[serverField].value,
      set: value => {
        const inCache = changedFields.find((v = {}) => v.field === field);

        const valueIsArray = Array.isArray(value);
        const dataIsArray = Array.isArray(fields[serverField].value);
        const photoField =
          serverField.includes('image') || serverField.includes('photo');

        if (dataIsArray) {
          if (valueIsArray) {
            // push update to changedFields array
            if (!inCache && !photoField) {
              const equal = isEqualArray(value, fields[serverField].value);
              const fromEmpty = fields[serverField].value.length === 0;
              if (!fromEmpty && !equal) {
                changedFields.push({ field, value });
              }
            } else if (inCache) {
              inCache.value = value;
            }
            fields[serverField].value = [];
            fields[serverField].value.push(...value);
          } else {
            console.log(
              'Trying to assign %s type to Array. %s',
              typeof value,
              field,
            );
          }
        } else {
          if (!inCache) {
            const different = value !== fields[serverField].value;
            const fromEmpty = value && !fields[serverField].value;
            if (!fromEmpty && different) {
              changedFields.push({
                field,
                value,
              });
            }
          } else {
            inCache.value = value;
          }

          fields[serverField].value = value || '';
        }
      },
    };
  });
  return props;
}
