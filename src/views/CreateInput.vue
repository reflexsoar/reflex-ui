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
                <CSelect sm="4"
                  label="Credential"
                  :options="credential_list"
                  v-model="credential"
                  @change="selectCredential($event)"
                  placeholder="Select a credential if required by the input"
                >
                </CSelect>
                <CTextarea
                  placeholder="Enter a description for the input.  The more detail the better."
                  required
                  v-model="description"
                  label="Description"
                >
                </CTextarea>
                <CTextarea
                  placeholder=
                  '{
  "setting": "value"
}'
                  required
                  v-model="config"
                  label="Configuration"
                >
                </CTextarea>
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

export default {
    name: 'CreateInput',
    created() {
      this.$store.dispatch('getTags')
      this.$store.dispatch('getCredentialList')
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages     
    },
    methods: {
      createInput: function () {
        let name = this.name
        let description = this.description
        let credential = this.credential
        let config = btoa(this.config)
        let tags = this.tags
        let credential_list = this.credential_list
        let tag_list = this.tag_list
        this.$store.dispatch('createInput', { name, description, config, credential, tags })
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
      }
    },
    computed: mapState(['tag_list', 'credential_list']),
    data(){
      return {
        name: "",
        description: "",
        config: "",
        credential: "",
        success: false,
        errorMessage: "",
        test: 0,
        tags: [],
        selected: []
      }
    }
}
</script>
