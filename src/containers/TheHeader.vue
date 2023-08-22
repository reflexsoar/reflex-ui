<template>
  <CHeader fixed with-subheader light>
    <CToggler
      in-header
      class="ml-3 d-lg-none"
      @click="$store.commit('toggleSidebarMobile')"
      aria-label="Siderbar Toggle"
    />
    <CToggler
      in-header
      class="ml-3 d-md-down-none"
      @click="$store.commit('toggleSidebarDesktop')"
      aria-label="Siderbar Toggle"
    /><CBreadcrumbRouter class="ml-3 border-0 mb-0 pt-3"/>
    <CHeaderBrand class="mx-auto d-lg-none" to="/">
      
    </CHeaderBrand>
    <CHeaderNav class="d-md-down-none mr-auto">
    </CHeaderNav>
    <CHeaderNav class="mr-4">
      <TheHeaderDropdownAccnt/>
    </CHeaderNav>
  </CHeader>
</template>

<script>
import TheHeaderDropdownAccnt from './TheHeaderDropdownAccnt'

export default {
  name: 'TheHeader',
  components: {
    TheHeaderDropdownAccnt
  }
}
</script>
