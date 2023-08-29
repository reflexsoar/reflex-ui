<template>
  <div>
    <CRow class="page-heading page-heading-row page-heading-no-nav page-heading-pb-10">
      <CCol>
        <h1>Integrations</h1>
      </CCol>
      <CCol>
        <CInput v-model="search" placeholder="Search for an Integration" />
      </CCol>
      <CCol>
        <h1>
          <button
            type="button"
            class="kb"
            onclick="window.open('https://docs.reflexsoar.com/en/latest/integrations')"
          >
            <CIcon name="cil-book" size="lg" />
          </button>
        </h1>
      </CCol>
    </CRow>
    <CRow>
      <CCol col="2">
        <CRow>
          <CCol>
            <h3>Categories</h3>
            <!-- Show each category as a ListGroup without a bullet and a count of the number of integrations in that category -->
            <CListGroup>
              <CListGroupItem
                color="secondary"
                :active="category_filter == null"
                @click="category_filter = null"
                style="cursor: pointer"
              >
                <!-- Align the badge to the right of the list item -->
                <CRow>
                  <CCol> All </CCol>
                  <CCol class="text-right" col="3">
                    <span class="badge badge-primary">
                      {{ integrations.length }}</span
                    >
                  </CCol>
                </CRow>
              </CListGroupItem>
              <CListGroupItem
                color="secondary"
                v-for="category in categories"
                :key="category.name"
                :active="category_filter == category.name"
                @click="category_filter = category.name"
                style="cursor: pointer"
              >
                <CRow>
                  <CCol>
                    {{ category.name }}
                  </CCol>
                  <CCol class="text-right" col="3">
                    <span class="badge badge-primary">
                      {{ category.count }}</span
                    >
                  </CCol>
                </CRow>
              </CListGroupItem>
            </CListGroup>
          </CCol>
        </CRow>
      </CCol>
      <CCol>
        <CRow>
          <CCol v-for="integration in filtered_results" col="3">
            <IntegrationCard :integration="integration" />
          </CCol>
        </CRow>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { mapState } from "vuex";

import IntegrationCard from "./IntegrationCard";

export default {
  name: "IntegrationsList",
  components: {
    IntegrationCard,
  },
  computed: {
    ...mapState(["integrations", "current_user"]),
    filtered_results: function () {
      // return results that fuzzy match the search string

      if (this.search == "" && this.category_filter == null) {
        return this.integrations;
      }
      if (this.search == "" && this.category_filter != null) {
        return this.integrations.filter((integration) => {
          return integration.category.includes(this.category_filter);
        });
      }
      if (this.search != "") {
        if (this.category_filter != null) {
          return this.integrations.filter((integration) => {
            return (
              integration.name.toLowerCase().includes(this.search.toLowerCase()) &&
              integration.category.includes(this.category_filter)
            );
          });
        } else {
          return this.integrations.filter((integration) => {
            return integration.name.toLowerCase().includes(this.search.toLowerCase());
          });
        }
      }
      return this.integrations;
    },
    categories: function () {
      // return a list of categories and the number of integrations in each category
      var categories = [];
      this.integrations.forEach((integration) => {
        integration.category.forEach((category) => {
          var found = false;
          categories.forEach((cat) => {
            if (cat.name == category) {
              cat.count += 1;
              found = true;
            }
          });
          if (!found) {
            categories.push({ name: category, count: 1 });
          }
        });
      });
      return categories;
    },
  },
  data() {
    return {
      search: "",
      category_filter: null,
    };
  },
  created() {
    this.loadIntegrations();
  },
  methods: {
    loadIntegrations() {
      this.$store.dispatch("getIntegrations");
    },
  },
};
</script>
