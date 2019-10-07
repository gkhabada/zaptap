<template lang="pug">
  .container(:class="{opened, animation}" :style="`height: ${opened ? containerHeight : 0}px`")
    input.input(:class="testError ? 'error' : ''" type="text" :value="search" placeholder="Наименование запчастей" @focus="attachListener" @input="handleInput" @keydown.enter="handleEnter")
    .content
      .container__overflow
        .container__scrollable(:style="`height: ${opened ? containerHeight : 0}px`")
          //- .item(v-for="{found, detail_id, detail_name} in autocomplete" @click="pickItem(detail_id, detail_name)" :key="detail_name" :title="detail_name")
          //-   span.piece {{ detail_name }}
          template(v-for="{found, detail_id, detail_name} in autocomplete" )
            .item(@click="pickItem(detail_id, detail_name)" :title="detail_name")
              span.piece(v-for="piece in found" :class="{hint: piece.hint}") {{ piece.text }}

      //- .scroll
      //-   scroll(@scroll="handleScrollbarMovement" v-bind="Object.assign(scrollProps, {scrollHeight, containerHeight})" :animation="animation")

</template>

<script src="./">
</script>
<style src="./style.sass" lang="sass" scoped></style>

<style scoped>
    .error{
        border: 1px red solid;
        box-sizing: border-box
    }
</style>