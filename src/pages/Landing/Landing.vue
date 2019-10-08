<template>
  <div class="">
    <div class="blueside"></div>
    <header class="header">
      <div class="header_container">
        <div class="blueside_header"></div>
      </div>
      <div class="header__top">
        <img src="./img/logo.svg" alt="Логотип Zaptap" class="logo" width="101px">
        <div class="header__top-right" @click="auth = true">
          <button data-src="#signup" data-trigger="login" class=" link login">Войти</button>
          <button data-src="#signup" data-trigger="register" class=" link login">Регистрация</button>
        </div>

        <!-- <a href="https://lk.zaptap.ru" class="link login" target="_blank" rel="noopener">ВОЙТИ</a> -->
      </div>

      <section class="header__body">
        <h1>Поиск, покупка и продажа<span class="canbebr"></span> любых б/у запчастей в РФ</h1>
        <!-- <h2>Отныне все могут искать и размещать запчасти бесплатно</h2> -->
      </section>

      <div class="header__bg"></div>

      <div class="header__text">
        <div class="header__text--item">
          <p class="header__text--suboffer">Zaptap <b>бесплатен</b> и подходит для магазинов, разборов, сервисов и
            автолюбителей.</p>
          <div class="header__text__section">
            <div class="header__right__text">
              <p class="header__text__line"><span>Покупателю:</span> ищешь запчасть? Продавцы пришлют варианты, которые
                есть в наличии - опишут состояние и назовут цену</p>
            </div>
          </div>
          <div class="header__text__section">
            <div class="header__right__text">
              <p class="header__text__line"><span>Продавцу:</span> много нереализованных запчастей? Смотри, что ищут
                покупатели и продавай свой склад через zaptap</p>
            </div>
          </div>
          <div class="button__slider show-mobil">Посмотреть сайт</div>
        </div>
        <div class="header__text--separator"></div>
        <div class="header__text--item header___video">
          <div class="embed-responsive embed-responsive-16by9">
            <iframe class="embed-responsive-item"
                    src="https://www.youtube-nocookie.com/embed/wZbDyrmqG1U?rel=0&amp;controls=1&amp;showinfo=0" frameborder="0"
                    allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        </div>
      </div>

      <div class="button__container show-desktop">
        <div class="button__slider ">Посмотреть сайт</div>
      </div>
      <!-- <a href="https://demo.zaptap.ru"
         class="link site"
         target="_blank"
         rel="noopener">Посмотреть сайт</a> -->

    </header>
    <!-- <div class="iframe__position">
      <div class="iframe__block">
      </div>
    </div> -->
    <section class="howitworks">
      <section class="howitworks__body">

        <div class="howitworks__body_half show-desktop">
          <img src="./img/engine-hd-black.png" class="howitworks__body_half--imgbig" alt="">
        </div>

        <div class="howitworks__body_half">
          <section class="register">

            <h4 class="register__title">Зарегистрируйся прямо сейчас</h4>
            <form id="form_modal" data-action="register" class="register__form form_modal form_register">
              <input type="name" class="register__input" name="name" placeholder="Ваше имя (либо название компании)">
              <input type="email" class="register__input" name="email" placeholder="E-mail">
              <input type="password" class="register__input" name="password" placeholder="Пароль">

              <label for="agreed" class="checkbox__container">
                <input type="checkbox" name="agreed" id="agreed">
                <div class="checkbox">
                  <div class="checkbox__square"></div>
                </div>
                <div class="checkbox__title">Я согласен с <a href="#" @click.prepend="agreement = true" class=""
                                                             data-parcel-ignore>условиями
                  сайта</a></div>
              </label>

              <button onclick="localStorage.setItem('bottom_and_popup_reg', 'true');" type="submit"
                      class="register__button">
                <div class="button__message"> Регистрация</div>
                <div class="button__loader"></div>
              </button>
              <div class="error-section "></div>
            </form>


          </section>
        </div>


      </section>
    </section>
    <footer class="footer">
      <small class="copywrite">© {{new Date().getFullYear()}}. Zaptap. Все права защищены.</small>
    </footer>

    <Auth @login="login"  @register="register" :err.sync="serverr" v-if="auth" @close="auth = false" @agreement="agreement = true"/>



    <div class="myslider hidden">

      <div class="close__slider">
        <div class="close__slider__button"></div>
      </div>
      <div class="glide">
        <div class="glide__track" data-glide-el="track">

          <ul class="glide__slides">
            <li class="glide__slide"></li>
            <li class="glide__slide"></li>
            <li class="glide__slide"></li>
            <li class="glide__slide"></li>
            <li class="glide__slide"></li>
            <li class="glide__slide"></li>
            <li class="glide__slide"></li>
          </ul>
        </div>
        <div class="glide__arrows" data-glide-el="controls">
          <button class="glide__arrow glide__arrow--left" data-glide-dir="<">
            <div class="glide-icon-left"></div>
          </button>
          <button class="glide__arrow glide__arrow--right" data-glide-dir=">">
            <div class="glide-icon-right"></div>
          </button>
        </div>
      </div>
    </div>

  <!--  <div id="signup" class="popup_wrapper hidden">
      <div class="click_and_hide_popup"></div>
      <div class="popup_body signup_modal">
        <button class="popup_close modal_close">Закрыть</button>
        <div class="modal_tabs">
          <button id="signin-btn" data-tab="#login" class="trigger_login modal_tabs_button active">Вход</button>
          <button id="signup-btn" data-tab="#register" class="trigger_register modal_tabs_button">Регистрация</button>
        </div>
        <div class="modal_tabs_content">
          <div id="login" class="modal_tabs_content_item show">
            <form data-action="login" class="form_modal form_login">
              <input type="email" name="email" placeholder="E-mail" class="modal_input">
              <input type="password" name="password" placeholder="Пароль" class="modal_input">
              <div class="form_line form_line-center">
                <button class="form_link popup_link" data-src="#remember" type="button">Забыли пароль?</button>
              </div>
              <div class="form_bottom">
                <button class="form_button" type="submit">Войти</button>
              </div>
              <div class="error-section hidden"></div>
            </form>
          </div>
          <div id="register" class="modal_tabs_content_item ">
            <form data-action="register" id="modal_registr_form" class="form_modal form_register">
              <input type="text" name="name" placeholder="Имя" class="modal_input">
              <input type="email" name="email" placeholder="E-mail" class="modal_input">
              <input type="text" name="locality" placeholder="Город" class="modal_input" id="registrationLocality">
              <input type="text" name="phones" placeholder="Телефон" class="modal_input" id="phoneInput">
              <input type="password" name="password" placeholder="Пароль" class="modal_input">
              <div class="form_line reg_line">
                <label for="agreed_reg" class="form_checkbox">
                  <input type="checkbox" name="agreed" id="agreed_reg" checked="checked">
                  <div class="form_checkbox_div"></div>
                  <div class="checkbox__title">Я согласен с <br><a href="#" @click.prepend="agreement = true"
                                                                   class="agreement__link" data-parcel-ignore>условиями
                    сайта</a></div>
                </label>
                <button class="form_button reg_button" onclick="localStorage.setItem('bottom_and_popup_reg', 'false');"
                        type="submit">Регистрация
                </button>
                <div class="error-section hidden"></div>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>-->

    <div id="remember" class="popup_wrapper hidden">
      <div class="click_and_hide_popup"></div>
      <div class="popup_body remeber_modal">
        <button class="popup_close modal_close">Закрыть</button>
        <p class="remember_title">Восстановление пароля</p>
        <p class="remember_subtext">Введите ваш e-mail и мы отправим вам новый пароль</p>
        <form data-action="recover" action="" class="form_modal form_recover">
          <input type="email" name="email" placeholder="E-mail" class="modal_input">
          <button class="form_button remeber_button" type="submit">Отправить</button>
          <div class="error-section hidden"></div>
        </form>
      </div>
    </div>
    <div id="recover_sended" class="hidden popup_wrapper">
      <div class="click_and_hide_popup"></div>
      <div class="popup_body remeber_modal">
        <button class="popup_close modal_close">Закрыть</button>
        <p class="remember_title">Восстановление пароля</p>
        <p class="remember_subtext">Вам направлен пароль на почту</p>
        <p id="recover_email" class="recover_text"></p>
        <button class="form_button recover_button popup_close" type="button">OK</button>

      </div>
    </div>

<!--    <div id="register_send" class="hidden popup_wrapper">
      <div class="click_and_hide_popup"></div>
      <div class="popup_body remeber_modal">
        <button class="popup_close modal_close">Закрыть</button>
        <p class="remember_title">Вам отправлен Email.</p>
        <p class="remember_subtext">Для входа в аккаунт необходимо перейти по ссылке в письме</p>
        <p id="recover_email" class="recover_text"></p>
        <button class="form_button recover_button popup_close" type="button">OK</button>
      </div>
    </div>

    <button data-src="#phone_and_locality" style="display: none" class="popup_link">phone_and_locality</button>

    <div id="phone_and_locality" class="hidden popup_wrapper">
      <div class="click_and_hide_popup"></div>
      <div class="popup_body remeber_modal">
        <button class="popup_close modal_close">Закрыть</button>
        <form data-action="set-locality" class="form_modal">
          <input type="text" name="locality" placeholder="Город" class="modal_input">
          <input type="text" name="phones" value="+7" placeholder="Телефон" class="mask-input modal_input" id="phoneInput">
          <div class="error-section hidden"></div>
          <button class="form_button recover_button " type="submit">OK</button>
        </form>
      </div>
    </div>

    <div id="choose_role" class="popup_wrapper hidden">
      <div class="click_and_hide_popup"></div>
      <div class="popup_body choose_role__modal">
        <h3 class="choose_role__title">Я хочу работать как:</h3>
        <div class="choose_role__buttons">
          <button class="choose_role__button" id="roleBuyer">
            <div class="choose_role__button&#45;&#45;img img1"></div>
            <p class="choose_role__button&#45;&#45;title">Покупатель</p>
          </button>
          <button class="choose_role__button" id="roleSeller">
            <div class="choose_role__button&#45;&#45;img img2"></div>
            <p class="choose_role__button&#45;&#45;title">Продавец</p>
          </button>
          <button class="choose_role__button" id="roleBoth">
            <div class="choose_role__button&#45;&#45;img img3"></div>
            <p class="choose_role__button&#45;&#45;title">Покупатель и продавец</p>
          </button>
        </div>
        <div class="choose_role__footer">
          <button class="form_button recover_button" type="button" onclick="SignupAfterChooseRole()">OK</button>
        </div>
      </div>
    </div>-->

    <div class="popup_wrapper" v-if="agreement">
      <div class="click_and_hide_popup" @click="agreement = false"></div>
      <div class="agreement_popup_body">
        <button class="popup_close modal_close" @click.prepend="agreement = false">Закрыть</button>
        <agreement/>
      </div>
    </div>


    <noscript>
      <div><img src="https://mc.yandex.ru/watch/51216455" style="position:absolute; left:-9999px;" alt=""/></div>
    </noscript>


  </div>
</template>

<script src="./">
</script>
<style src="./style.scss" lang="scss"></style>
