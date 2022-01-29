<template>
  <CModal title="Update Organization" :centered="true" size="lg" :show.sync="modalStatus">
      <CRow>
          <CCol>
                <CAlert :show="error" color="danger" closeButton>
                    {{error_message}}
                </CAlert>
          </CCol>
      </CRow>
      <CRow>
          <CCol>
              <CForm @submit.prevent="updateOrganization()" id="update_organization_form">
                <CInput
                    placeholder="The name of the organization"
                    required
                    v-model="organization.name"
                    label="Name"
                />
                <CTextarea
                    placeholder="Enter a description for the organization"
                    required
                    v-model="organization.description"
                    rows=4
                    label="Description"
                />
                <CInput
                    placeholder="https://www.example.com"
                    v-model="organization.url"
                    label="Website"
                />
                <CTextarea
                    placeholder="Enter the e-mail domains that can be associated with reflex accounts (one per line)"
                    v-model="organization.logon_domains"
                    label="Logon Domains"
                    required
                    rows=5
                    description="Admins can only create users with emails at these domains"
                />
              </CForm>
            </CCol>
      </CRow>
      <template #footer>
          <CButton color="secondary" @click="dismiss()">Dismiss</CButton>
          <CButton color="primary" type="submit" form="update_organization_form" v-bind:disabled="submitted"><CSpinner color="secondary" size="sm" v-if="submitted"/><span v-else>Update</span></CButton>
      </template>
  </CModal>
</template>

<script>
export default {
    name: 'EditOrganizationWizard',
    props: {
        show: Boolean,
        uuid: String
    },
    data() {
        return {
            modalStatus: this.show,
            submitted: false,
            organization: {
                name: '',
                description: '',
                url: '',
                logon_domains: ''
            },
            error: false,
            error_message: '',
        }
    },
    watch: {
        show: function() {
            this.$store.dispatch('getOrganization', this.uuid).then(resp => {
                this.organization = this.$store.getters.organization
                this.modalStatus = this.show 
            })
        },
        modalStatus: function() {
            if(!this.modalStatus) {
                this.dismiss()
            }
            this.$emit('update:show', this.modalStatus)
        }
    },
    methods: {
        updateOrganization() {
            let data = this.organization
            this.$store.dispatch('updateOrganization', {uuid: this.uuid, data: data}).then(resp => {
                this.dismiss()
            })
        },
        createOrganization() {

            this.submitted = true

            this.organization.logon_domains = this.organization.logon_domains.split('\n')

            // Check to see if the confirm password and user password match
            if(this.organization.admin_user.password !== this.confirm_password) {
                this.error = true
                this.error_message = "Passwords do not match"
                this.step = 2
                this.submitted = false
            } else {
                this.error = false
                this.error_message = ''                
            }

            // Make sure the user's email is in the organizations logon domains
            if(this.organization.logon_domains && !this.organization.logon_domains.includes(this.organization.admin_user.email.split('@')[1])) {
                this.error = true
                this.error_message = "Admin's email domain not in Organization Logon Domains"
                this.step = 2
                this.submitted = false
            } else {
                this.error = false
                this.error_message = ''                
            }

            let organization = this.organization

            this.$store.dispatch('createOrganization', organization).then(resp => {
                this.error = false
                this.error_message = ''
                this.step = 1
                this.modalStatus = false
                this.submitted = false                
            }).catch(err => {
                this.error = true
                this.error_message = err.response.data.message
                this.step = 1
                this.submitted = false
            })

            
        },
        dismiss() {
            this.organization = {
                name: '',
                description: '',
                url: '',
                logon_domains: ''
            }
            this.step = 1
            this.error = false
            this.error_message = ''
            this.submitted = false
            this.modalStatus = false
        }
    }
}
</script>

<style>

</style>