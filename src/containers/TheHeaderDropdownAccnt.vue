<template>
  <CDropdown
    inNav
    class="c-header-nav-items"
    placement="bottom-end"
    add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        
        <CIcon name="cil-menu" size="xl"/>
        
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
    <CDropdownItem onclick="window.open('https://github.com/reflexsoar/reflex-docs')">
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
export default {
  name: 'TheHeaderDropdownAccnt',
  data () {
    return { 
      itemsCount: 42
    }
  },
  computed: {
    isLoggedIn: function() {return this.$store.getters.isLoggedIn}
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