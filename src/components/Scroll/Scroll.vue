<template lang="pug">
  transition(name="scroll")
    .wrapper(v-if="visible")
      .scroll(:style="`height: ${height}px`")

</template>
<script src="./">
</script>
<style src="./style.sass" lang="sass" scoped></style>
