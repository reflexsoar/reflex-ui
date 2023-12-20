<template>
  <CDropdown
    inNav
    class="c-header-nav-items"
    placement="bottom-end"
    add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        <UserLabel :user="current_user" /> <CIcon name="cil-menu" size="xl"/>
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
    <CDropdownItem @click="downloadSOCReport()">
      <CIcon name="cil-cloud-download" />SOC Report
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
import UserLabel from '@/views/components/UserLabel.vue'
export default {
  name: 'TheHeaderDropdownAccnt',
  data () {
    return { 
      itemsCount: 42
    }
  },
  components: {
    UserLabel
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
    },
    downloadSOCReport(uuid) {
      this.$store.dispatch("downloadSOCReport", {organization: this.current_user.organization, days: 30}).then((resp) => {
        // Download the file as a blob
        let blob = new Blob([resp.data])
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'soc-report.html'
        link.click()
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