<template>
  <div>
    <CCard style="min-height: 260px; max-height: 260px">
      <CCardBody style="overflow-x: auto">
        <CRow style="padding-bottom: 10px">
          <CCol class="integration-logo-wrapper">
            <img :src="integration.logo" class="integration-card-logo" />
          </CCol>
          <CCol class="text-right">
            <CButton color="primary" :to="`${integration.product_identifier}`" size="sm">Configure</CButton>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <h5>{{ integration.name }}</h5>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <p>{{ integration.brief_description }}</p>
          </CCol>
        </CRow>
        <CRow>
            <CCol>
                Contains <b>{{ supported_actions.length }}</b> supported actions.
            </CCol>
        </CRow>
      </CCardBody>
      <CCardFooter>
        <CRow>
          <CCol>
            <TagBucket :tags="integration.tags" />
          </CCol>
          <CCol class="text-right">
            <small class="text-muted">Version: {{ integration.version }}</small>
          </CCol>
        </CRow>
      </CCardFooter>
    </CCard>
  </div>
</template>

<script>

import TagList from "../components/TagList"
import TagBucket from "../components/TagBucket"

export default {
  name: "IntegrationCard",
  components: {
    TagBucket
  },
  props: {
    integration: Object,
  },
  computed: {
    supported_actions: function() {
        return this.integration.manifest.actions.map((i) => {
            return i.friendly_name
        })
    }
  }
};
</script>
