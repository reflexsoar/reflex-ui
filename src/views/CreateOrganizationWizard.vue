<template>
  <CModal title="Create Organization" :closeOnBackdrop="false" :centered="true" size="lg" :show.sync="modalStatus">
      <CRow>
          <CCol>
                <CAlert :show="error" color="danger" closeButton>
                    {{error_message}}
                </CAlert>
          </CCol>
      </CRow>
      <CRow>
          <CCol>
              <CForm @submit.prevent="createOrganization()" id="create_organization_form">
                <div v-if="step == 1">
                    <h5>Define the Organization</h5>
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
                        description="One per line.  Admins can only create users with emails at these domains"
                    />
                </div>
                <div v-if="step == 2">
                    <h5>Create Admin User</h5>
                    <p>Create the first user in the organization.  This user will be an admin by default.</p>
                    <CInput
                        v-model="organization.admin_user.username"
                        label="User Alias"
                        placeholder="Enter a unique alias for the user"
                        description="A user alias is used for quick referencing a user in comments, case assignment, and other places using @mentions." 
                        required
                    />
                    <CRow>
                        <CCol>
                            <CInput
                                placeholder="First Name"
                                required
                                v-model="organization.admin_user.first_name"
                                label="First Name"
                            />
                        </CCol>
                        <CCol>
                            <CInput
                                placeholder="Last Name"
                                required
                                v-model="organization.admin_user.last_name"
                                label="Last Name"
                            />
                        </CCol>
                    </CRow>
                    <CInput
                        placeholder="Email"
                        v-model="organization.admin_user.email"
                        label="E-mail"
                        required
                    />
                    <CInput
                        placeholder="Password"
                        v-model="organization.admin_user.password"
                        label="Password"
                        type="password"
                        required
                    />
                    <CInput
                        placeholder="Password"
                        v-model="confirm_password"
                        label="Confirm Password"
                        type="password"
                        required
                    />
                </div>
                <div v-if="step == 3">
                    <h5>Review</h5>
                    <p>Please carefully review the details below before submitting this form.</p>
                    <h5>Organization Details</h5>
                    <b>Organization Name:</b> {{organization.name}}<br>
                    <b>Description:</b> {{organization.description}}<br>
                    <b>Website:</b> {{organization.url}}</br>
                    <span v-if="organization.logon_domains">
                        <b>Logon Domains:</b><br>
                        <ul>
                            <li v-for="domain in organization.logon_domains.split('\n')" v-bind:key="domain">{{domain}}</li>
                        </ul>
                    </span>
                    <br>
                    <h5>Admin User Details</h5>
                    <b>Username:</b> {{organization.admin_user.username}}<br>
                    <b>Full Name:</b> {{organization.admin_user.first_name}} {{organization.admin_user.last_name}}<br>
                    <b>Email</b>: {{organization.admin_user.email}}<br>
                </div>
              </CForm>
            </CCol>
      </CRow>
      <template #footer>
          <CButton color="secondary" @click="dismiss()">Dismiss</CButton>
          <CButton color="secondary" v-if="step == 2 || step == 3" @click="prevStep()">Previous</CButton>
          <CButton color="success" v-if="step == 1 || step == 2" @click="nextStep()">Next</CButton>
          <CButton color="primary" type="submit" form="create_organization_form" v-bind:disabled="step != 3 || submitted"><CSpinner color="secondary" size="sm" v-if="submitted"/><span v-else>Create</span></CButton>
      </template>
  </CModal>
</template>

<script>
export default {
    name: 'CreateOrganizationWizard',
    props: {
        show: Boolean,
        mode: 'Create'
    },
    data() {
        return {
            modalStatus: this.show,
            submitted: false,
            organization: {
                name: '',
                description: '',
                url: '',
                admin_user: {
                    username: '',
                    email: '',
                    password: '',
                    first_name: '',
                    last_name: ''                    
                }
            },
            confirm_password: '',
            error: false,
            error_message: '',
            step: 1
        }
    },
    watch: {
        show: function() {
            this.modalStatus = this.show
        },
        modalStatus: function() {
            if(!this.modalStatus) {
                this.dismiss()
            }
            this.$emit('update:show', this.modalStatus)
        }
    },
    methods: {
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
                admin_user: {
                    username: '',
                    email: '',
                    password: '',
                    first_name: '',
                    last_name: ''                    
                }
            }
            this.step = 1
            this.confirm_password = ''
            this.error = false
            this.error_message = ''
            this.submitted = false
            this.modalStatus = false
        },
        nextStep() {
            if(this.step != 3) {
                this.step += 1
            }
        },
        prevStep() {
            if(this.step != 1) {
                this.step -= 1
            }
        }
    }
}
</script>

<style>

</style>