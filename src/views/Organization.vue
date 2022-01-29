<template>
<div>
    <router-view></router-view>
</div>
</template>

<script>
export default {
  name: 'OrganizationSettings',
  created() {
    this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
  }
}
</script>
