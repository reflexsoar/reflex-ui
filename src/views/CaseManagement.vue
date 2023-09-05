<template>
  <CRow
    ><CCol xs="12" lg="12">
      <h1 class="page-heading">Case Management</h1>
      <CAlert :show.sync="alert.show" :color="alert.type" closeButton>
        {{ alert.message }}
      </CAlert>
      <CTabs
        :activeTab.sync="activeTab"
        addNavWrapperClasses="page-nav"
        addTabClasses="page-nav-tab-body"
        addNavClasses="page-nav-tab"
      >
        <CTab active>
          <template slot="title"> Cases </template>

          <Cases></Cases>
        </CTab>
        <CTab v-if="this.$store.getters.user_has_permission('update_case_template')">
          <template slot="title"> Case Templates </template>
          <CaseTemplates></CaseTemplates>
        </CTab>
      </CTabs> </CCol
  ></CRow>
</template>

<script>
import { mapState } from "vuex";
const Cases = () => import("@/views/CaseList");
const CaseTemplates = () => import("@/views/CaseTemplateList");
export default {
  name: "CaseManagement",
  components: {
    Cases: Cases,
    CaseTemplates,
  },
  data() {
    return {
      activeTab: 0,
    };
  },
  computed: mapState(["alert", "current_user"]),
  created() {
    if (this.current_user.default_org) {
      this.$store.dispatch("getOrganizations", {});
    }
    this.$store.commit("add_start"); // Stop the success/fail add from showing up when changing from other pages
  },
};
</script>
