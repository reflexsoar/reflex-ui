<template>
  <CModal :show.sync="show" title="Service Provider URLs">
    <CInput label="ACS URL" :value="acs_url" readonly>
        <template #append>
            <CButton color="primary" size="sm" @click="copyToClipboard(acs_url, $event)">Copy</CButton>
        </template>
    </CInput>
    <CInput label="SLO URL" :value="slo_url" readonly>
    <template #append>
            <CButton color="primary" size="sm" @click="copyToClipboard(slo_url, $event)">Copy</CButton>
        </template>
    </CInput>
    <CInput label="Entity ID" :value="entity_id" readonly>
    <template #append>
            <CButton color="primary" size="sm" @click="copyToClipboard(entity_id, $event)">Copy</CButton>
        </template>
    </CInput>
  </CModal>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "SPUrlsModal",
  props: {
    show: Boolean,
    provider_uuid: String,
  },
  watch: {
    show: function () {

      
    },
  },
  data() {
    return {
      loading: false,
      error: false,
      error_message: "",
      acs_url: window.location.origin+"/api/v2.0/auth/sso/"+this.provider_uuid+"/acs",
      slo_url: window.location.origin+"/api/v2.0/auth/sso/"+this.provider_uuid+"/slo",
      entity_id: "reflexsoar:sp:"+this.provider_uuid+":saml2",
    };
  },
  methods: {
    copyToClipboard(text, event) {
        navigator.clipboard.writeText(text);
        // Set the text of the button to "Copied!"
        event.target.innerText = "Copied!";
        // Reset the text of the button after 2 seconds
        setTimeout(() => {
            event.target.innerText = "Copy";
        }, 2000);
    }
  }
};
</script>
