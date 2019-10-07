<template lang="pug">
  .widget
    .endpopup(@click.stop="endPopup = 0" v-if="showPopupForm")
      .endpopup__container.auto(@click.stop="")
        .endpopup__close(@click.stop="showPopupForm = false")
        .endpopup__body 
            div.input__title Телефон
              input(v-model="userInfo.phones")
            div.input__title Город
              input(v-model="userInfo.locality")
            div.footer__button(@click="submitWithPhonesAndLocality()" :class="{disabled: !phoneAndLocality}")
              .footer__button__text Найти запчасти
    .options
        .title Выберите параметры
          // .widget-btn(v-if="widget" @click="createWidget") Создать виджет

        .error(:style="errorOptionsPosition" v-if="showErrors && error.options > -1 && error.options < 11")
          .error__message Для отправки запроса необходимо заполнить все параметры машины.

        .options__container
          .options-row
            .twice-row
              .dropdown(:class="getClassForDropdown(id)" v-for="(prop, id) in carProps" v-if="id < 2")
                dropdown(v-bind="prop" :opened="data.opened === id && !data.nothingWasOpened" @open="data.opened = id; data.nothingWasOpened = false" @close="data.opened = -1" @pick="handleItemPick(id, $event)" @enter="handleKeyEnter(id, $event)" :error="showErrors && error.options === id" @blur="handleDropdownBlur(prop, id, $event)")
            .twice-row
              .dropdown(:class="getClassForDropdown(id)" v-for="(prop, id) in carProps" v-if=" id > 1 && id < 4")
                dropdown(v-bind="prop" :opened="data.opened === id" @open="data.opened = id" @close="data.opened = -1" @pick="handleItemPick(id, $event)" @enter="handleKeyEnter(id, $event)" :error="showErrors && error.options === id" @blur="handleDropdownBlur(prop, id, $event)")
            .twice-row
              .dropdown(:class="getClassForDropdown(id)" v-for="(prop, id) in carProps" v-if=" id > 3 && id < 6")
                dropdown(v-bind="prop" :opened="data.opened === id" @open="data.opened = id" @close="data.opened = -1" @pick="handleItemPick(id, $event)" @enter="handleKeyEnter(id, $event)" :error="showErrors && error.options === id" @blur="handleDropdownBlur(prop, id, $event)")
          .options-row
            .twice-row
              .dropdown(:class="getClassForDropdown(id)" v-for="(prop, id) in carProps" v-if="id > 5 && id < 8")
                dropdown(v-bind="prop" :opened="data.opened === id" @open="data.opened = id" @close="data.opened = -1" @pick="handleItemPick(id, $event)" @enter="handleKeyEnter(id, $event)" :error="showErrors && error.options === id" @blur="handleDropdownBlur(prop, id, $event)")
            .twice-row
              .dropdown(:class="getClassForDropdown(id)" v-for="(prop, id) in carProps" v-if="id > 7 && id < 10")
                dropdown(v-bind="prop" :opened="data.opened === id" @open="data.opened = id" @close="data.opened = -1" @pick="handleItemPick(id, $event)" @enter="handleKeyEnter(id, $event)" :error="showErrors && error.options === id" @blur="handleDropdownBlur(prop, id, $event)")
            .twice-row
              .dropdown(:class="getClassForDropdown(id)" v-for="(prop, id) in carProps" v-if=" id > 9")
                dropdown(v-bind="prop" :opened="data.opened === id" @open="data.opened = id" @close="data.opened = -1" @pick="handleItemPick(id, $event)" @enter="handleKeyEnter(id, $event)" :error="showErrors && error.options === id" @blur="handleDropdownBlur(prop, id, $event)")

    .parts()
        .title Введите запчасти

        .error(:style="{top: '-10px', left: '40px', zIndex: 1}" v-if="!details.valid && showErrors")
          .error__message Для отправки запроса необходимо выбрать запчасти машины.

        .parts__container
          .container__overflow()
            .container__scrollable(:style="`height: ${carParts.length * 58 + 58}`")
              template(v-for="(line, id) in carParts")
                buyer-request-part(v-bind="line"
                  :id="id"
                  @pick="handlePartPick(id, $event)"
                  @comment="updateComment(id, $event)"
                  @original="updateOriginal(id, $event)"
                  @media="id => mediaLoaderId = id"
                  :error="error.details === id && showErrors"
                  :widget = "widget")

              .last__line
                .visible
                  .add__part(v-if="carParts.length < 30")
                    span(@click="addParts") Добавить запчасть
                  .add__part__fix(v-else)
                  .vin__frame
                    //- .error(:style="{top: '-70px', left: '20px'}" v-if="!data.vinframe && showErrors")
                    //-   .error__message Для отправки запроса необходимо заполнить VIN или Frame
                    input-counter(:value="data.vinframe" :max="17" @input="v => data.vinframe = v" placeholder="VIN или Frame" :validate="true")
                  .phone
                    label.phone__label
                      //- input.phone__input(type="text" placeholder="Телефон клиента" v-model="data.phone")
                      .phone__input
                        input-phone(:value.sync="data.phone" :styles="{paddingLeft: '16px'}" placeholder="Телефон клиента")
                      .question
                        .question__mark ?
                        .question__message
                          span Напишите телефон, это удобно.
                          br
                          span Будет виден только Вам.
                .empty

          .scroll
            scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps")

    .footer
        .footer__container
          .footer__input
            //- .error(:style="{top: '-70px', left: '20px'}" v-if="!data.comment && showErrors")
              .error__message Для отправки запроса необходимо также заполнить примечание.
            input-counter(:value="data.comment" :max="200" @input="v => data.comment = v" placeholder="Примечание")

          .footer__button(:class="{disabled: !allValid}" @click="addRequest")
            .footer__button__loading(v-if="pending")
            .footer__button__text(v-else) Найти запчасти
    media-loader(:files="currentFiles" v-if="mediaLoaderId > -1" @close="mediaLoaderId = -1" @file="addFileToPart" @remove="removeFileFromPart" @attach="attachMediaSet" @cancel="resetTemporaryFiles")
</template>

<script src="./">
</script>
<style src="./style.sass" lang="sass" scoped></style>
