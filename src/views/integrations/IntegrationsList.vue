<template>
  <div>
  <h2>Integrations</h2>
    <CRow>
        <CCol>
            <CInput v-model="search" placeholder="Search for an Integration" label="Search" />
        </CCol>
    </CRow>
    <CRow>
      <CCol v-for="integration in filtered_results" col=3>
        <CCard>
          <CCardBody>
            <img
              :src="integration.logo"
              style="height: 50px; object-fit: cover"
            />
            <hr />
            <h4>{{ integration.name }}</h4>
            <p  style="min-height:200px; max-height: 225px; overflow-y: scroll">{{ integration.description }}<br><br>
            <b>Supported Actions</b>
            <ul>
              <li v-for="action in integration.manifest.actions"><b>{{ action.name }}</b>: {{ action.description }}</li>
            </ul>
            </p>
          </CCardBody>
          <CCardFooter>
            <CRow>
              <CCol> </CCol>
              <CCol class="text-right">
                <CButton color="primary" size="sm">Configure</CButton>
              </CCol>
            </CRow>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "IntegrationsList",
  computed: {
    ...mapState(["integrations", "current_user"]),
    filtered_results: function() {
        // return results that fuzzy match the search string
        if (this.search != "") {
            return this.integrations.filter(integration => {
                return integration.name.toLowerCase().includes(this.search.toLowerCase());
            })
        }
        return this.integrations;
    }
  },
    data() {
        return {
        search: "",
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
