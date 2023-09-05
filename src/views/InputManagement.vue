<template>
  <CRow
    ><CCol xs="12" lg="12">
      <h1 class="page-heading">
        Input Management<button
          type="button"
          class="kb"
          onclick="window.open('https://docs.reflexsoar.com/en/latest/inputs')"
        >
          <CIcon name="cil-book" size="lg" />
        </button>
      </h1>

      <CTabs
        addNavWrapperClasses="page-nav"
        addTabClasses="page-nav-tab-body"
        addNavClasses="page-nav-tab"
      >
        <CTab active>
          <template slot="title"> <CIcon name="cil-terminal" /> Inputs </template>
          <Inputs></Inputs>
        </CTab>
        <CTab>
          <template slot="title">
            <CIcon name="cil-sitemap" /> Field Templates
            <CBadge color="primary">BETA</CBadge>
          </template>
          <InputFieldMappingList></InputFieldMappingList>
        </CTab>
      </CTabs> </CCol
  ></CRow>
</template>

<script>
import Inputs from "./InputsList.vue";
import InputFieldMappingList from "./InputFieldMappingList.vue";

export default {
  name: "InputManagement",
  components: {
    Inputs,
    InputFieldMappingList,
  },
  created() {
    this.$store.commit("add_start"); // Stop the success/fail add from showing up when changing from other pages
  },
};
</script>
