<template>
  <CDropdown
    inNav
    class="c-header-nav-items"
    placement="bottom-end"
    add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        
        {{current_user.username}}&nbsp;<CIcon name="cil-menu" size="xl"/>
        
      </CHeaderNavLink>
    </template>
    
    <CDropdownHeader
      tag="div"
      class="text-center"
      color="light"
    >
      <strong>Settings</strong>
    </CDropdownHeader>
    <CDropdownItem @click="profile">
      <CIcon name="cil-user" />Profile
    </CDropdownItem>
    <CDropdownItem onclick="window.open('https://docs.reflexsoar.com')">
      <CIcon name="cil-book" />Documentation
    </CDropdownItem>
    <CDropdownItem onclick="window.open('https://support.reflexsoar.com')">
      <CIcon name="cil-life-ring" />Support
    </CDropdownItem>
    <CDropdownDivider/>
    <CDropdownItem @click="logout">
      <CIcon name="cil-lock-locked" />Logout
    </CDropdownItem>
  </CDropdown>
</template>

<script>
import {mapState} from "vuex";
export default {
  name: 'TheHeaderDropdownAccnt',
  data () {
    return { 
      itemsCount: 42
    }
  },
  computed: {
    isLoggedIn: function() {return this.$store.getters.isLoggedIn},
    ...mapState(['current_user'])
  },
  methods: {
    profile: function() {
      this.$router.push('/my_profile')
    },
    logout: function() {
      this.$store.dispatch('logout')
      .then(() => {
        this.$router.push('/login')
      })
    }
  }
}
</script>

<style scoped>
  .c-icon {
    margin-right: 0.3rem;
  }
</style>