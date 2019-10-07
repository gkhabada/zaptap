<template lang="pug">
  .line(:class="{parterror: error}")
    .line__id {{ id + 1}}
    .inputs
      .line__name(:class="{picked: picked > -1}")
        input-autocomplete(:testError = "testError" :picked="picked" :value.sync="value" @pick="$emit('pick',$event)")
      .line__comment(:class="{comment}")
        input-counter(:value="comment" :max="50" placeholder="Комментарий" @input="updateField('comment', $event)")
      .line__original(:class="{original}")
        input.input__original(:value="original" maxlength="20" placeholder="Оригинальный номер" @input="e => updateField('original', e.target.value)")
    .line__upload(:class="{inviz:widget}")
      .upload__link(@click="$emit('media', id)") {{ photos.length ? photos.length : ''}} фото
      // /{{ videos.length ? videos.length : '' }} видео
</template>

<script src="./">
</script>
<style src="./style.sass" lang="sass" scoped></style>
