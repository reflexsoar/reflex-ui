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
              v-if="!hasFilters"
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
                  <span
                    class="application-name"
                    @click="toggleFilter('name', item.name)"
                    >{{ item.name }}</span
                  >
                </td>
              </template>
              <template #vendor="{ item }">
                <td>
                  <span
                    class="application-name"
                    @click="toggleFilter('vendor', item.vendor)"
                    >{{ item.vendor }}</span
                  >
                </td>
              </template>
            </CDataTable>
            <span v-if="hasFilters">
              <!-- show the filters as tags that can be removed -->
              <span style="display: flex; margin: 10px">
                <span
                  v-for="(filter, key) in filters"
                  :key="key"
                  style="display: block; margin-right: 5px"
                >
                  <!-- show the list items in a horizontal list -->
                  <li v-for="(value, index) in filter" :key="index" style="display: flex">
                    <CBadge
                      color="secondary"
                      class="tag tag-clickable"
                      @click="toggleFilter(key, value)"
                      ><b>{{ key }}</b>: {{ value }}&nbsp;x</CBadge
                    >
                  </li>
                </span>
              </span>
            </span>
            <CDataTable
              v-if="hasFilters && application_endpoints.length > 0"
              :items="application_endpoints"
              :fields="endpoint_fields"
              :loading="loading"
              :items-per-page="25"
              :sorter="{ external: false, resetable: true }"
              :noItemsView="{
                noResults: 'No Endpoints found',
                noItems: 'No Endpoints found',
              }"
              column-filter
              pagination
            >
              <template #agent="{ item }">
                <td>
                  <b>{{ item.agent.name }}</b>
                </td>
              </template>
              <template #name="{ item }">
                <td>
                  <span
                    class="application-name"
                    @click="toggleFilter('name', item.name)"
                    >{{ item.name }}</span
                  >
                </td>
              </template>
              <template #version="{ item }">
                <td>
                  <span
                    class="application-name"
                    @click="toggleFilter('version', item.version)"
                    >{{ item.version }}</span
                  >
                </td>
              </template>
              <template #vendor="{ item }">
                <td>
                  <span
                    class="application-name"
                    @click="toggleFilter('vendor', item.vendor)"
                    >{{ item.vendor }}</span
                  >
                </td>
              </template>
              <template #install_date="{ item }">
                <td>
                  {{ item.install_date | moment }}
                </td>
              </template>
            </CDataTable>
          </CCard>
        </CCol>
      </CRow>
    </CCol>
  </CRow>
</template>

<style>
.application-name {
  cursor: pointer;
  color: #321fdb;
}
</style>

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
    ...mapState([
      "application_summary",
      "application_endpoints",
      "current_user",
      "organizations",
    ]),
    hasFilters: function () {
      return Object.keys(this.filters).some((key) => {
        return this.filters[key].length > 0;
      });
    },
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
      filters: {
        name: [],
        vendor: [],
        version: [],
      },
      organization: null,
      fields: [
        { key: "name", label: "Name", sortable: true },
        { key: "vendor", label: "Vendor", sortable: true },
        { key: "version_count", label: "Versions", sortable: true },
        { key: "endpoint_count", label: "Endpoints", sortable: true },
      ],
      endpoint_fields: ["agent", "name", "vendor", "version", "install_date"],
    };
  },
  methods: {
    toggleFilter(key, value) {
      if (this.filters[key].includes(value)) {
        this.removeFilter(key, value);
      } else {
        this.setFilter(key, value);
      }
      /* If there are filters set, then we need to get the application endpoints */
      if (this.hasFilters) {
        this.getApplicationEndpoints(this.organization);
      } else {
        this.getApplicationSummary(this.organization);
      }
    },
    hasFilters() {
      return Object.keys(this.filters).some((key) => {
        return this.filters[key].length > 0;
      });
    },
    removeFilter(key, value) {
      this.filters[key] = this.filters[key].filter((v) => {
        return v !== value;
      });
    },
    setFilter(key, value) {
      if (!this.filters[key].includes(value)) {
        this.filters[key].push(value);
      }
    },
    getOrganizations(org) {
      this.$store.dispatch("getOrganizations", { organization: org });
    },
    getApplicationEndpoints(org = null) {
      this.loading = true;
      this.$store
        .dispatch("getApplicationEndpoints", {
          organization: org,
          name: this.filters.name,
          vendor: this.filters.vendor,
          version: this.filters.version,
        })
        .then(() => {
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
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
