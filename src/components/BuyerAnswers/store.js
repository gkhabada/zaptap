import Vue from 'vue';
import main from '../../main';
import { post } from '../../api/request';

const store = new Vue({
  data: () => ({
    picked: {},
    cart: {},
  }),
  computed: {
    cost() {
      const orderKeys = Object.keys(this.cart);
      const temp = {};
      orderKeys.forEach(orderId => {
        const answers = this.cart[orderId];
        const orderCost = Object.keys(answers).reduce((sum, key) => {
          return (
            (answers[key].details || []).reduce((dsum, { price }) => {
              const cost = Number(price);
              return isNaN(cost) ? dsum : dsum + cost;
            }, 0) + sum
          );
        }, 0);
        temp[orderId] = isNaN(orderCost) ? 0 : orderCost;
      });
      return temp;
    },
    allCartDetails() {
      const allDetails = [];
      Object.keys(this.cart)
        .map(orderId => {
          const order = this.cart[orderId];
          return { answerKeys: Object.keys(order), order };
        })
        .forEach(({ answerKeys, order }) => {
          return answerKeys.forEach(answerId =>
            allDetails.push(
              ...order[answerId].details.map(x => x.request_detail_id),
            ),
          );
        });

      return allDetails;
    },
    allResponseIds() {
      const allDetails = [];
      Object.keys(this.cart)
        .map(orderId => {
          const order = this.cart[orderId];
          return { answerKeys: Object.keys(order), order };
        })
        .forEach(({ answerKeys, order }) => {
          return answerKeys.forEach(answerId =>
            allDetails.push(
              ...order[answerId].details.map(x => x.response_detail_id),
            ),
          );
        });

      return allDetails;
    },
    responseIds() {
      const responseIds = [];
      const order = this.cart[this.opened];
      if (!order) return responseIds;
      Object.keys(order).forEach(orderId => {
        const { details } = order[orderId] || {};
        if (!Array.isArray(details)) return;
        responseIds.push(...details.map(x => x.response_detail_id));
      });

      return responseIds;
    },
    opened() {
      const query = main.$route.query;
      const order = Number(query.order);
      return isNaN(order) ? -1 : order;
    },
  },
  methods: {
    pickDetail(seller, detail) {
      const parent = this.picked[seller];
      if (!parent) {
        const temp = {};
        temp[detail] = true;
        this.$set(this.picked, seller, temp);
      } else {
        const state = parent ? parent[detail] || false : false;
        this.$set(this.picked[seller], detail, !state);
      }
    },
    getResponsesForRequest(requestId) {
      return post('/buyer/get-responses-for-request', {
        request_id: requestId,
      }).then(this.setDetails);
    },
    updateCart() {
      Object.keys(this.cart).forEach(responseId => {
        const answers = this.cart[responseId];

        this.getResponsesForRequest(responseId)
          .then(({ data } = {}) => {
            const ok = Array.isArray(data);
            if (!ok) {
              this.$delete(this.cart, responseId);
              return;
            }

            Object.keys(answers).forEach(sellerResponseId => {
              const exist = data.find(({ seller_response_id }) => {
                const resIdLocal = Number(sellerResponseId);
                const resIdRequest = Number(seller_response_id);
                return (
                  !isNaN(resIdLocal + resIdRequest) &&
                  resIdLocal === resIdRequest
                );
              });
              if (!exist) {
                this.$delete(this.cart[responseId], sellerResponseId);
                return;
              }
              const { details = [] } = answers[sellerResponseId];
              const { details: requestDetails } = exist;
              const ok =
                Array.isArray(details) && Array.isArray(requestDetails);
              if (!ok) {
                this.$delete(this.cart[responseId], sellerResponseId);
                return;
              }
              const copy = [...details];
              let deletedItems = 0;
              details.forEach(({ response_detail_id: lrid }, i) => {
                const detailExist = requestDetails.find(
                  ({ response_detail_id: rid }) => {
                    return (
                      Number(lrid) === Number(rid) && !isNaN(Number(lrid + rid))
                    );
                  },
                );
                if (!detailExist) {
                  copy.splice(i - deletedItems, 1);
                }
              });
              if (copy.length === 0) {
                this.$delete(this.cart[responseId], sellerResponseId);
                return;
              }
              this.$set(
                this.cart[responseId][sellerResponseId],
                'details',
                copy,
              );
            });
          })
          .catch(err => {
            console.log(err);
          });
      });
    },
  },
  watch: {
    cart: {
      deep: true,
      handler(cart) {
        let result = JSON.stringify({});
        try {
          result = JSON.stringify(cart);
        } catch (error) {
          result = JSON.stringify({});
        }
        localStorage.setItem('buyeranswerscart', result);
      },
    },
  },
  created() {
    const cartFromStore = localStorage.getItem('buyeranswerscart');
    let result = {};
    try {
      result = JSON.parse(cartFromStore);
    } catch (error) {
      result = {};
    }
    this.cart = result || {};
    this.$on('authorized', this.updateCart);
  },
});

export default store;
