import Vue from "vue";
import MediaLoader from "../../components/MediaLoader/MediaLoader.vue";
import main from "../../main";
import InputPhone from "../../components/InputPhone/InputPhone.vue";
import InputCounter from "../../components/InputCounter/InputCounter.vue";
import Dropdown from "../../components/Dropdown/Dropdown.vue";
import BuyerRequestPart from "../../components/BuyerRequestPart/BuyerRequestPart.vue";
import { post } from "../../api/request";
import { carProps } from "./store";
import AskDataBuyer from "../../components/AskDataBuyer.vue";
import Scroll from "../../components/Scroll/mixin";
import Checkbox from "../../components/Checkbox/Checkbox";

const data = {
  opened: 0,
  comment: "",
  vinframe: "",
  phone: ""
};

let carParts = [];

/** @typedef {[{title:String, value:String, index: Number}]} carProps */

export default Vue.extend({
  mixins: [Scroll],
  components: {
    Dropdown,
    BuyerRequestPart,
    InputCounter,
    MediaLoader,
    InputPhone,
    AskDataBuyer,
    Checkbox
  },
  data: () => ({
    tempUser: null,
    pending: false,
    AskBuyerData: false,
    carProps,
    carParts,
    data,
    containerHeight: 0,
    mediaLoaderId: -1,
    showErrors: false,
    endPopup: false,
    visible: true,
    widget: false,
  }),
  computed: {
    endPopupСomputed(){
      return this.endPopup;
    },
    errorOptionsPosition() {
      const index = this.error.options;
      if (index < 0) return { top: "0", left: "0" };
      const top = index < 6 ? "-10px" : "45px";
      const offset = `(16.6% * ${index % 6})`;
      const padding = "(8.3% - 114px)";
      const left = `calc(${offset} + ${padding})`;
      return { top, left };
    },
    error() {
      return {
        details: this.details.invalid,
        options: this.options.invalid
      };
    },
    allValid() {
      const details = this.error.details < 0;
      const options = this.error.options < 0;
      // const phone = this.error.phone;
      // const notes = this.error.notes;

      return details && options; //&& phone && notes;
    },
    currentFiles() {
      const id = this.mediaLoaderId;
      if (id < 0) return [];
      const parts = this.carParts[id];
      const media = parts ? parts.media : [];
      return media || [];
    },
    scrollableHeight() {
      return 100;
    },
    options() {
      const options = {
        fields_filter: 0
      };
      let valid = true;
      let invalid = -1;

      carProps.forEach(({ field, picked, items }, i) => {
        const item = items[picked];
        if (!item || !item.value) {
          if (!valid) return;
          if (i < 10) {
            valid = false;
            invalid = i;
          }
          return;
        }
        const value = item.value;
        const title = item.title.length === 0 ? "%" : item.title;
        options[field] = value === "%" ? title : value;
        if (value === "%") options.fields_filter += Math.pow(2, i);
      });
      return {
        options,
        valid,
        invalid
      };
    },
    details() {
      const details = [];
      let valid = true;
      let invalid = -1;

      const check = ({ comment, original, picked, value, media_set_id }, i) => {
        if (comment || original || ~picked || value) {
          if (!(~picked && value)) {
            if (!valid) return;
            valid = false;
            invalid = i;
            return;
          } else {
            const det = {
              comment,
              detail_original_number: original,
              detail_name: value,
              detail_id: picked
            };
            if (media_set_id) det["media_set_id"] = media_set_id;

            details.push({ ...det });
          }
        }
      };

      this.carParts.forEach(check);

      if (details.length === 0) valid = false;
      return {
        valid,
        invalid: details.length === 0 ? 0 : invalid,
        details
      };
    }
  },
  methods: {
    createWidget() {
      const data = {
        options: this.options.options,
        details: this.details.details,
        //notes: this.data.comment || "",
        vin_frame: this.data.vinframe || "",
        //phone: this.data.phone || ""
      };
      const json = JSON.stringify(data);

      post("/widget", json)
        .then(response => {
          if (response.data) {
            let baseUrl = 'https://lk.'+(location.href.indexOf('dev') !== -1 ? 'dev.' : '')+'zaptap.ru';
            prompt(`Виджет успешно создано!\nСкопируйте код для вставки.`,
              `<script src="${baseUrl}/widget.js"></script><iframe width="100%" height="10"
               src="${baseUrl}/widget?id=${response.data.id}" frameborder="0"></iframe>`);
          }
        })
        .catch(error => alert('Ошибка создания виджета :('));
    },
    handleDropdownBlur({ items = [] } = {}, id, search) {
      const index = items.findIndex(
        ({ value }) => String(value).toLowerCase() === search.toLowerCase()
      );
      const item = items[index];
      const pick = this.handleItemPick;
      if (!item && search.length > 1 && id > 2) {
        carProps[id].items.push({
          title: search,
          value: "%",
          index: carProps[id].items.length
        });

        pick(id, carProps[id].items.length - 1);
      } else if (item) {
        pick(id, index);
      }
    },
    async getMediaSet() {
      const { media_set_id } = await post("/buyer/create-media-set").then(
        response => response.data
      );
      return media_set_id;
    },
    async attachMediaSet() {
      const id = this.mediaLoaderId;
      this.mediaLoaderId = -1;
      if (id < 0) return;

      const media_set_id = await this.getMediaSet();
      if (!media_set_id) return;

      this.$set(carParts[id], "media_set_id", media_set_id);

      carParts[id].media.forEach(({ file }) => {
        const body = new FormData();
        body.set("media_element", file, file.name);
        body.set("media_set_id", media_set_id);

        post("/buyer/add-to-media-set", body)
          .then(response => {
            const data = response.data;
            if (data) console.log(response.data);
          })
          .catch(error => console.log(error.message));
      });
    },
    resetTemporaryFiles(tasks = []) {
      if (!Array.isArray(tasks)) return;
      const id = this.mediaLoaderId;
      if (id < 0) return;
      const length = tasks.length;

      for (let i = 0; i < length; i++) {
        const { task, index, file } = tasks.pop();
        if (task === "restore") {
          carParts[id].media.splice(index, 0, file);
        }
        if (task === "remove") {
          this.removeFileFromPart(index);
        }
      }
    },
    removeFileFromPart(fileIndex) {
      const id = this.mediaLoaderId;
      if (id < 0) return;
      carParts[id].media.splice(fileIndex, 1);
    },
    addFileToPart(file) {
      const id = this.mediaLoaderId;
      if (id < 0) return;
      carParts[id].media.push({
        ...file
      });
    },
    addParts() {
      let i = 0;

      while (i++ < 3 && carParts.length < 30) {
        const emptyPart = {
          picked: -1,
          comment: "",
          original: "",
          media: [],
          value: null
        };
        carParts.push(emptyPart);
      }
      /** @type {HTMLElement} */
      const el = this.$el;
      if (!el || typeof el.querySelector !== "function") return;
      const container = el.querySelector(".parts .container__scrollable");
      if (!container) return;
      this.$nextTick(() => {
        container.scrollTop = container.scrollHeight;
      });
    },
    handlePartPick(line, { id, name }) {
      const picked = isNaN(id) ? -1 : id;
      const value = name || "";
      this.$set(this.carParts[line], "picked", picked);
      this.$set(this.carParts[line], "value", value);
    },
    updateComment(id, comment) {
      const value = comment || "";
      this.$set(this.carParts[id], "comment", value);
    },
    updateOriginal(id, original) {
      const value = original || "";
      this.$set(this.carParts[id], "original", value);
    },
    /**
     * @param {Number} id
     * @param {{custom: String, list: carProps, filtered: carProps}} event
     */
    handleKeyEnter(id, event) {
      const { custom, list, filtered } = event;
      const pick = this.handleItemPick;
      if (id > 2) {
        if (custom.length > 0) {
          carProps[id].items.push({
            title: custom,
            value: "%",
            index: carProps[id].items.length
          });
          pick(id, carProps[id].items.length - 1);
        } else if (filtered.length > 0) {
          pick(id, filtered[0].index);
        } else {
          pick(id, list[0].index);
        }
      } else {
        if (filtered.length > 0) {
          pick(id, filtered[0].index);
        } else {
          pick(id, list[0].index);
        }
      }
    },
    clearBefore(id) {
      for (let i = id + 1; i < carProps.length; i++) {
        carProps[i].items = [];
      }
    },
    handleItemPick(id, propIndex) {
      this.showErrors = false;
      this.clearBefore(id);
      carProps[id].picked = propIndex;

      if (carProps.length - 1 > id) {
        this.fetchField(id + 1);
      } else {
        this.data.opened = -1;
      }
    },
    getClassForDropdown(id) {
      const main = `item--${id}--${id > 5 ? "bottom" : "top"}`;
      const opened = this.data.opened === id ? "opened" : "";
      return `${opened} ${main}`;
    },
    /**
     * @param {[String]} data
     * @param {Number} field
     */
    setItemsToField(data, field) {
      if (!Array.isArray(data) || isNaN(field)) return;
      const items = data
        // .sort((a, b) => {
        //   return a.localeCompare(b);
        // })
        .map((item, index) => ({
          title: item,
          value: item || "%",
          index
        }));

      carProps[field].items =
        items && items.length > 0
          ? items
          : [
              {
                title: "",
                value: "%",
                index: 0
              }
            ];
      this.data.opened = -1;
    },
    /**
     * @param {Number} field
     * @type {fields_filter: Number}
     */
    getBodyForField(field) {
      const carProps = this.carProps.slice(0, field);
      const body = {};
      let fields_filter = 0;

      carProps.forEach(({ field, picked, items }, index) => {
        body[field] = items[picked].value;
        fields_filter += body[field] === "%" ? Math.pow(2, index) : 0;
      });
      return Object.assign(body, {
        fields_filter
      });
    },
    /** @param {Number} field */
    fetchField(field) {
      if (field < 0) return;
      const body = this.getBodyForField(field);

      return post("/buyer/autocomplete-options", body)
        .then(({ data }) => {
          const { message } = data || {};
          if (message) return new Error(message);

          return this.setItemsToField(data, field);
        })
        .catch(error => {
          console.log(error.code || "", error.message);
        });
    },
    openLastField() {
      const last = carProps.findIndex(function({ items = [], picked = -1 }) {
        return items.length === 0 || picked === -1;
      });
      this.data.opened = last >= 0 ? last : 0;
    },
    updateContainerHeight() {
      /** @type {HTMLElement} */
      const el = this.$el;
      if (!el || typeof el.querySelector !== "function") return;
      const height = window.innerHeight - 304;
      this.containerHeight = isNaN(height) ? 0 : height >= 0 ? height : 0;
    },
    clearForm() {
      carProps.forEach(car => {
        car.picked = -1;
        car.items = [];
      });

      this.data.comment = "";
      this.data.phone = "";
      this.data.vinframe = "";
      this.data.opened = 0;
      this.carParts.splice(0, carParts.length);
      this.addParts();

      this.fetchField(this.data.opened);
    },
    addRequest() {
      if (this.pending) return;
      this.AskBuyerData = true;
      this.pending = true;
      this.$once("getbuyerdata", res => {
        this.AskBuyerData = false;
        if (res) {
          this.addRequestNext();
        } else {
          this.pending = false;
        }
      });
    },
    addRequestNext() {
      if (!this.allValid) {
        this.showErrors = true;
        this.pending = false;
        return;
      }
      const request = {
        options: this.options.options,
        details: this.details.details,
        notes: this.data.comment || "",
        vin_frame: this.data.vinframe || "",
        phone: this.data.phone || ""
      };
      
      post("/buyer/add-request", request)
        .then(({ data }) => {
          this.endPopup = 1;
          console.log(this.endPopup);
          // if (data) {
          //   this.endPopup = 2;
          //   console.log(request, data);
          //   return;
          // }
          this.clearForm();
          if (!localStorage.getItem("dontShowBuyerRequestPopup")) {
            this.endPopup = 1;
          }
         
        })
        .catch(error => {
          this.endPopup = 2;
          console.log(request, error.message);
        })
        .finally(() => {
          this.endPopup = 1;
          this.pending = false;
        });
    },
    neverShowEndPopup() {
      localStorage.setItem("dontShowBuyerRequestPopup", true);
      this.endPopup = 0;
    }
  },
  mounted() {
   
    let {query = {}} = this.$route;
    if(query.widget) {
      this.widget = true;
    }

    // Start progress-bar
    this.$Progress.start();
    // Add car parts if no exists
    if (carParts.length === 0) this.addParts();
    // Open last field or prefetch and finish progress-bar
    if (this.data.opened < 0) {
      //this.openLastField();
      this.$Progress.finish();
    } else {
      this.fetchField(this.data.opened).then(() => {
        this.$Progress.finish();
      });
    }
    // Update container height on window resize event
    this.updateContainerHeight();
    main.$on("resize", this.updateContainerHeight);
  },
  created() {
    if(!window['info_from_widget']){
      window['info_from_widget'] = (index)=>{
        this.endPopup = index;
      }
    }
    post("profile/get-user-profile", {})
      .then(response => {
        const { data } = response;
        if (!data) return;
        this.tempUser = data;
      })
      .catch(console.log);
  },
  watch: {
    allValid(valid) {
      if (valid) {
        this.showErrors = false;
      }
    }
  }
});
