<template>
  <div>DETAILS</div>
</template>

<script>

export default {
    name: 'IntegrationDetails',
    created() {
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
    }
}
</script>
