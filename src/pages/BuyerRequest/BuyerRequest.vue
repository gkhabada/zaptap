<template lang="pug">

  keep-alive
    .wrapper
      ask-data-buyer(v-if="AskBuyerData" @action="$emit('getbuyerdata', $event)" v-bind="{tempUser}")

      .endpopup(@click.stop="endPopup = 0" v-if="endPopupСomputed")
        .endpopup__container(@click.stop="")
          .endpopup__close(@click.stop="endPopup = 0")

          .endpopup__message(v-if="endPopup === 1") Ваш запрос отправлен всем продавцам. Скоро будут приходить от них
            router-link(to="/buyer/answers") ответы.
            .endpopup__check(@click="neverShowEndPopup")
              checkbox
              .endpopup__check__text не показывать больше
          .endpopup__message(v-else) Возникла ошибка. Попробуйте проверить данные еще раз.

      iframe(width="100%" height="100%" src="/widget" frameborder="0")

</template>

<script src="./">
</script>
<style src="./style.sass" lang="sass" scoped></style>
