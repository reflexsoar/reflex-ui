<template>
<CRow>
  <CCol col>
    <CCard>
        <CCardBody>
            <CForm @submit.prevent="createOrganization" >
                <h1>Create Organization</h1>
                <p class="text-muted">Fill out the form below to create a new organization. Organizations are the parent container for projects you will be working on.</p>
                <CInput
                  placeholder="Name"
                  autocomplete="username email"
                  required
                  v-model="name"
                >
                </CInput>
                <CTextarea
                  placeholder="Description"
                  autocomplete="curent-password"
                  required
                  v-model="description"
                >
                  <template #prepend-content><CIcon name="cil-description"/></template>
                </CTextarea>
                <CInput
                  placeholder="URL"
                  autocomplete="curent-password"
                  required
                  v-model="url"
                  rows=12
                >
                  <template #prepend-content><CIcon name="cil-link"/></template>
                </CInput>
                <CRow>
                  <CCol col="12">
                    <v-select placeholder="Enter your tags here..." taggable multiple push-tags v-model="selected" name="tags" :options="tags" label="name">
                      <span slot='no-options'>Bruh</span>
                    </v-select>
                  </CCol>
                </CRow>
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

export default {
    name: 'CreateOrganization',
    created() {
      this.$store.dispatch('getTags')
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages      
    },
    methods: {
      createOrganization: function () {
        let name = this.name
        let description = this.description
        let url = this.url
        this.$store.dispatch('createOrganization', { name, description, url })
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
            this.$store.dispatch('addTagsToOrganization', postbody)
          }
          this.$router.push({path: '/organizations/'+uuid})
        })
      }
    },
    computed: mapState(['tags']),
    data(){
      return {
        name: "",
        description: "",
        url: "",
        success: false,
        errorMessage: "",
        selected: ""
      }
    }
}
</script>
