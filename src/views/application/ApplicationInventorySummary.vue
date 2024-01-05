<template>
  <CRow>
    <CCol>
      <CRow class="page-heading page-heading-row page-heading-no-nav">
        <CCol>
          <h1>Application Inventory</h1>
        </CCol>
        <CCol>
          <label>Total Applications</label>
          <h3>{{ application_summary.total }}</h3>
        </CCol>
        <CCol v-if="current_user.default_org">
          <SelectInput
            :options="organizations"
            option_label="name"
            option_key="uuid"
            :value.sync="organization"
            label="Organization"
            @change="getApplicationSummary"
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <CCard>
            <CDataTable
              :items="application_summary.applications"
              :fields="fields"
              :loading="loading"
              :items-per-page="25"
              :sorter="{ external: false, resetable: true }"
              :noItemsView="{
                noResults: 'No Applications found',
                noItems: 'No Applications found',
              }"
              column-filter
              pagination
            >
              <template #name="{ item }">
                <td>
                  <b>{{ item.name }}</b>
                </td>
              </template>
            </CDataTable>
          </CCard>
        </CCol>
      </CRow>
    </CCol>
  </CRow>
</template>

<script>
import { mapState } from "vuex";

import ObjectAttribute from "@/views/components/ObjectAttribute.vue";
import SelectInput from "@/views/components/SelectInput.vue";

export default {
  name: "ApplicationInventorySummary",
  components: {
    ObjectAttribute,
    SelectInput,
  },
  computed: {
    ...mapState(["application_summary", "current_user", "organizations"]),
  },
  mounted() {
    this.getApplicationSummary();
    this.organization = this.current_user.organization;
    if (this.current_user.default_org) {
      this.getOrganizations(this.organization);
    }
  },
  data() {
    return {
      loading: false,
      organization: null,
      fields: [
        { key: "name", label: "Name", sortable: true },
        { key: "vendor", label: "Vendor", sortable: true},
        { key: "version_count", label: "Versions", sortable: true},
        { key: "endpoint_count", label: "Endpoints", sortable: true}
      ],
    };
  },
  methods: {
    getOrganizations(org) {
      this.$store.dispatch("getOrganizations", { organization: org });
    },
    getApplicationSummary(org = null) {
      this.loading = true;
      this.$store
        .dispatch("getApplicationSummary", { organization: org })
        .then(() => {
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>
