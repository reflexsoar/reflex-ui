<template>
    <router-view></router-view> 
</template>

<script>

export default {
    name: 'Organizations',
    created() {
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
    }
}
</script>
