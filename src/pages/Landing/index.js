import Agreement from '../Agreement.vue'
import Auth from '../../components/Auth.vue';

import { user, login, register, redirectIfUnauthorized, isLocalhost } from "../../helpers/authorization";

import { Forms } from "./js/forms";
import { Headerbtns } from "./js/headerbtns";
import { Popup } from "./js/popup";
import { Slider } from "./js/slider";
import { Tabs } from "./js/tabs";
import { Mask } from './js/mask';

export default {
  name: 'Landing',
  components: {
    Agreement,
    Auth
  },
  data () {
    return {
      auth: false,
      serverr: false,
      agreement: false
    }
  },
  mounted() {
    addEventListener("load", () => {
        window.popup = new Popup();
        const form = new Forms();
        const slider = new Slider();
        const tabs = new Tabs();
        // const copyright = new Copyright();
        const headerbtns = new Headerbtns();
        initMask();
        if (process.env.PROD_ENV === "development") {
            const link = document.querySelector(".link.login");
            link.href = "https://lk.dev.zaptap.ru";
        }
        const chooseRoleButtons = document.querySelectorAll('.choose_role__button');
        for (const button of chooseRoleButtons) {
            button.addEventListener('click', (event) => {
                chooseRoleButtons.forEach((elem) => {
                    elem.classList.remove('choose_role__button_state_selected');
                });
                button.classList.toggle('choose_role__button_state_selected');
            });
        }
        // document.addEventListener('click', (e)=>{
        //   console.log([e.target])
        // })
        const popup_body = document.getElementsByClassName('popup_body');
        for (const iterator of popup_body) {
            iterator.addEventListener('click', function (event) {
                event.stopPropagation();
            });
        }
    });
    function initMask() {
        const maskInputs = document.getElementsByClassName('mask-input');
        for (const input of maskInputs) {
            const element = new Mask(input);
        }
    }
    window.addEventListener('message', (event) => {
        if (event.data === "SHOW_POPUP") {
            document.getElementById('roleSeller').style.display = "none";
            const ev = document.createEvent('HTMLEvents');
            ev.initEvent('click', false, true);
            document.getElementsByClassName('trigger_register')[0].dispatchEvent(ev);
            window.popup.open("#signup");
        }
    }, false);
    window.SetLocalityAndPhone = function () {
        // const popup_phone_and_locality = document.getElementById('');
        popup.open('#phone_and_locality');
    };
    window.SignupAfterChooseRole = function () {
        localStorage.setItem('selectedRole', document.getElementsByClassName('choose_role__button_state_selected')[0].getAttribute('id'));
        document.getElementById('roleSeller').style.display = "flex";
        if (localStorage.getItem('bottom_and_popup_reg') !== 'true') {
            localStorage.setItem('bottom_and_popup_reg', 'submit__popup');
            window.popup.close();
            const evt = new Event("submit");
            document.getElementById('modal_registr_form').dispatchEvent(evt);
        }
        else {
            localStorage.setItem('bottom_and_popup_reg', 'submit__bottom');
            window.popup.close();
            const evt = new Event("submit");
            document.getElementById('form_modal').dispatchEvent(evt);
        }
    };








      (function (d, w, c) {
        (w[c] = w[c] || []).push(function () {
          try {
            w.yaCounter51216455 = new Ya.Metrika2({
              id: 51216455,
              clickmap: true,
              trackLinks: true,
              accurateTrackBounce: true,
              webvisor: true
            });
          } catch (e) { }
        });

        var n = d.getElementsByTagName("script")[0],
          s = d.createElement("script"),
          f = function () { n.parentNode.insertBefore(s, n); };
        s.type = "text/javascript";
        s.async = true;
        s.src = "https://mc.yandex.ru/metrika/tag.js";

        if (w.opera == "[object Opera]") {
          d.addEventListener("DOMContentLoaded", f, false);
        } else { f(); }
      })(document, window, "yandex_metrika_callbacks2");
  },
  methods: {
    // toggleform() {
    //   if (this.formtype === "login") {
    //     this.formtype = "register";
    //   } else {
    //     this.formtype = "login";
    //   }
    // },
    async login({ email, password }) {
      this.pending = true;
      this.serverr = false;
      await login({ email, password }).catch(err => {
        this.serverr = true;
      });
      this.pending = false;
    },
    async register(...args) {
      this.pending = true;
      this.serverr = false;
      await register(args).catch(err => {
        this.serverr = true;
      });
      if (!this.serverr) this.isRegistered = true;
      this.pending = false;
    },
  }
};
