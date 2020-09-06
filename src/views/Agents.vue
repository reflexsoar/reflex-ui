<template>
  <router-view></router-view>
</template>

<script>

const Agents = () => import('@/views/AgentsList')
const AgentGroups = () => import('@/views/AgentGroupList')
export default {
    name: 'AgentsList',
    components: {
      'Agents': Agents,
      'AgentGroups': AgentGroups
    },
    created() {
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages
    }
}
</script>
