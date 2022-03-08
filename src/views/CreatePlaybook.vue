<template>
<CRow>
  <CCol col>
    <CCard><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
        <CCardBody>
            <CForm @submit.prevent="createPlaybook" >
                <h1>Create Playbook</h1>
                <p class="text-muted">Fill out the form below to create a new playbook.</p>
                <CInput
                  placeholder="Playbook Name"
                  required
                  v-model="name"
                  label="Playbook Name"
                >
                </CInput>
                <CTextarea
                  placeholder="Enter a description for the playbook.  The more detail the better."
                  required
                  v-model="description"
                  label="Description"
                >
                  <template #prepend-content><CIcon name="cil-description"/></template>
                </CTextarea>
                <!--<div role="group" class="form-group">
                  <label class="typo__label">Organization</label>
                  <multiselect v-model="organization_uuid" placeholder="Select an organization" track-by="label" label="label" :options="formatOrgSelect()">
                  </multiselect>
                </div>-->
                <div role="group" class="form-group">
                  <label class="typo__label">Tags</label>
                  <multiselect v-model="selected" placeholder="Select tags to apply to this playbook" :taggable="true" tag-placeholder="Add new tag" track-by="name" label="name" :options="tags" :multiple="true" @tag="addTag">
                  </multiselect>
                </div>
                <!--<CRow>
                  <CCol col="12">
                    <label>Tags</label>
                    <v-select placeholder="Enter your tags here..." taggable multiple push-tags v-model="selected" name="tags" :options="tags" label="name">
                      <span slot='no-options'><i>No tags found...add your own by typing</i></span>
                    </v-select>
                    <br>
                  </CCol>
                </CRow>-->
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
import {required, minLength, between, url} from 'vuelidate/lib/validators'

export default {
    name: 'CreatePlaybook',
    created() {
      this.$store.dispatch('getTags')
      this.$store.dispatch('getOrganizations', {})
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages     
    },
    methods: {
      createPlaybook: function () {
        let name = this.name
        let description = this.description
        let url = this.url
        let organization_uuid = this.organization_uuid['value']
        this.$store.dispatch('createPlaybook', { name, description, url, organization_uuid })
        .then(resp => {
          let uuid = resp.data.uuid
          if(this.selected.length > 0) {
            let selected_tags = this.selected
            let addTags = {
              'tags': []
            }
            for(const tag in selected_tags) {
              if(selected_tags[tag]['name'] !== undefined) {
                  addTags['tags'].push(selected_tags[tag]['name'])
              } else {
                  addTags['tags'].push(selected_tags[tag])
              }
              
            }
            let postbody = {
              'uuid': uuid,
              'data': addTags
            }
            this.$store.dispatch('addTagsToPlaybook', postbody)
          }
          this.$router.go(-1)
        })
      },
      formatOrgSelect: function () {
          let opts = []
          let orgs = this.organizations
          for (const org in orgs) {
              opts.push({'value': orgs[org]['uuid'], 'label': orgs[org]['name']})
          }
          return opts
      },
      addTag(newTag) {
        const tag = {
          name: newTag,
          uuid: '',
          color: '#ffffff'
        }
        this.tags.push(tag)
        this.selected.push(tag)
      }
    },
    computed: mapState(['tags','organizations']),
    data(){
      return {
        name: "",
        description: "",
        url: "",
        success: false,
        errorMessage: "",
        organization_uuid: "",
        test: 0,
        selected: ""
      }
    }
}
</script>
