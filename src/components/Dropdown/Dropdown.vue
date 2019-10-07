<template lang="pug">
  .container(:class="{opened}")
    .container__overflow(
      :style="`height: ${containerHeight}px`"
      :class="{scrollable: scrollProps.containerHeight < scrollProps.scrollHeight, disabled, opened, errordrop: error}"
      @click.stop=""
      )
      .content(:class="{opened}")
        .title(@click="handleTitleClick" :title="`${title} ${pickedItem}`")
          .title__text(v-if="field !== 'generation'") {{ pickedItem || title }}
          .title__text(v-else) {{ pickedItem || title | generationFilter }}
          .title__arrow(:class="{opened}")

        label.search(:for="field")
          input.search__input(v-model="search" :id="field" @keydown.enter="handleKeyEnter" @focus="$emit('open')" @blur="handleInputBlur" :disabled="disabled")
          .search__icon

        .container__scrollable__dropdown(:style="`height: ${scrollableHeight}px`")
          transition(name="container__scrollable")
            .list(v-if="opened")
              template(v-if="items.length > 0")
                .item(
                  @click="pickItem(index)"
                  v-for="{title, index} in filteredItems"
                  :class="{active: index === picked}"
                  :key="index"
                  :title="title")
                  template(v-if="field !== 'generation'") {{ title || 'Отсутствует' }}
                  template(v-else) {{ title || 'Отсутствует' | generationFilter }}

      .scroll
        scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps" :animation="animation")

</template>
<script src="./">
</script>
<style src="./style.sass" lang="sass" scoped></style>
