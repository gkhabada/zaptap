<template lang="pug">
  .container
    .container__overflow(:class="{opened, disabled, errordrop: error}" @click.stop="")
      .content(:class="{opened}")
        .title(@click="handleTitleClick" :title="`${title} ${pickedItem}`")
          .title__text {{ pickedItem || title }}
          .title__arrow(:class="{opened}")

        label.search(:for="field")
          input.search__input(v-model="search" :id="field" @keydown.enter="handleKeyEnter" @focus="$emit('open')" :disabled="disabled")
          .search__icon

        .container__scrollable
          transition(name="container__scrollable")
            .list(v-if="opened")
              template(v-if="items.length > 0")
                .item(v-for="{title, index} in filteredItems" :class="{active: index === picked}" @click="pickItem(index)" :key="index" :title="title") {{ title || 'Отсутствует' }}

      .scroll(:class="{opened}")
        scroll(@scroll="handleScrollbarMovement" v-bind="scrollProps" :animation="animation")

</template>
<script src="./">
</script>
<style src="./style.sass" lang="sass" scoped></style>
