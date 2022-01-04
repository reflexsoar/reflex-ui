<template>
<CRow>
  <CCol col>
    <CCard><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
        <CCardBody>
            <CForm @submit.prevent="createInput" >
                <h1>Create Input</h1>
                <p class="text-muted">Fill out the form below to create a new input.</p>
                <CInput
                  placeholder="Input Name"
                  required
                  v-model="name"
                  label="Input Name"
                >
                </CInput>
                <CRow>
                  <CCol lg="6" sm="12">
                  <CSelect 
                    label="Plugin"
                    placeholder="Select an input type"
                    :options="['Elasticsearch','Exchange Mailbox','API','Webhook']"
                    v-model="plugin"
                    @change="populateConfig($event)"
                  > 
                  </CSelect>
                  </CCol>
                  <CCol lg="6" sm="12">
                  <CSelect 
                    label="Credential"
                    :options="credential_list"
                    v-model="credential"
                    @change="selectCredential($event)"
                    placeholder="Select a credential if required by the input"
                  >
                  </CSelect>
                  </CCol>
                </CRow>
                <CTextarea
                  placeholder="Enter a description for the input.  The more detail the better."
                  required
                  v-model="description"
                  label="Description"
                  rows=5
                >
                </CTextarea>
                <CRow>
                  <CCol>
                  <CTextarea
                    placeholder='{}'
                    description="The configuration tells the reflex agent what sources to poll."
                    required
                    v-model="config"
                    label="Configuration"
                    rows=8
                  >
                  </CTextarea>
                  </CCol>
                  <CCol>
                  <CTextarea
                    placeholder='{}'
                    description="Field mappings tell the input what source data to extract as observables."
                    required
                    v-model="field_mapping"
                    label="Field Mapping"
                    rows=8
                  >
                  </CTextarea>
                  </CCol>
                </CRow>
                <div role="group" class="form-group">
                  <label class="typo__label">Tags</label>
                  <multiselect v-model="selected" placeholder="Select tags to apply to this input" :taggable="true" tag-placeholder="Add new tag" track-by="name" label="name" :options="tag_list" :multiple="true" @tag="addTag">
                  </multiselect>
                </div>
                <CRow>
                  <CCol col="12" class="text-right">
                    <CButton color="primary" class="px-4" type="submit">Create</CButton>
                  </CCol>
                </CRow>
              </CForm>
        </CCardBody>
    </CCard>
  </CCol>
</CRow>
</template>

<script>
import {mapState} from "vuex";
import {vSelect} from "vue-select";
import {required, minLength, between} from 'vuelidate/lib/validators'
import { parse } from '@babel/core';

export default {
    name: 'CreateInput',
    created() {
      this.loadTags()
      this.$store.dispatch('getCredentialList')
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages     
    },
    methods: {
      createInput: function () {
        let name = this.name
        let description = this.description
        let credential = this.credential
        let config = btoa(this.config)
        let field_mapping = btoa(this.field_mapping)
        let plugin = this.plugin
        let tags = this.tags
        let credential_list = this.credential_list
        this.$store.dispatch('createInput', { name, description, config, field_mapping, plugin, credential, tags })
        .then(resp => {
          this.$router.go(-1)
        })
      },
      addTag(newTag) {
        const t = {
          name: newTag,
          uuid: '',
          color: '#ffffff'
        }
        this.tags.push(newTag)
        this.tag_list.push(t)
        this.selected.push(t)
      },
      selectCredential(event) {
        this.credential = event.target.value        
      },
      loadTags: function() {
          this.$store.dispatch('getTags').then(resp => {
              for(let i in resp.data) {
                  this.tag_list.push({'name': resp.data[i].name, 'uuid': resp.data[i].uuid})
              }
          })
      },
      populateConfig(event) {
        let conf = ""
        let map = ""
        let value = event.target.value
        this.plugin = event.target.value
        if (value == "Elasticsearch") {
          conf = '{"hosts":["https://localhost:9200"],"distro":"opensearch","index":".siem-signals-*","lucene_filter":"", "cafile":"","scheme":"https","rule_name":"signal.rule.name","auth_method":"http_auth","search_size":200,"search_period":"15m","check_hostname":false,"severity_field":"signal.rule.severity","source_reference":"signal.parent.id","cert_verification":"none","description_field":"signal.rule.description","tag_fields":[], "signature_fields": []}'
          map = '{"fields":[{"field": "host.name", "alias":"hostname", "data_type": "host", "tlp": 3, "tags": ["workstation"]}]}'
        }
        if (value == "Exchange Mailbox") {
          conf = '{"hosts": ["https://ews.mydomain.com"], "mailbox_name": "phishing@reflexsoar.com", "poll_interval": "30m"}'
          map = '{}'
        }
        if (value == "API") {
          conf = '{"url":"https://myapi.com"}'
          map = '{}'
        }
        if (value == "Webhook") {
          conf = '{"url":"https://mywebhook.com"}'
          map = '{}'
        }

        this.field_mapping = JSON.stringify(JSON.parse(map), null, 4)
        this.config = JSON.stringify(JSON.parse(conf), null, 4)
        return
      }
    },
    computed: mapState(['credential_list']),
    data(){
      return {
        name: "",
        description: "",
        config: "",
        field_mapping: "",
        credential: "",
        plugin: "",
        type: "",
        success: false,
        errorMessage: "",
        test: 0,
        tags: [],
        selected: [],
        tag_list: []
      }
    }
}
</script>
