<template>
<CRow>
  <CCol col>
    <CCard><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
        <CCardBody>
            <CForm @submit.prevent="createCredential" >
                <h1>Create Credential</h1>
                <p class="text-muted">Fill out the form below to create a new credential.</p>
                <CInput
                  placeholder="Credential Name"
                  required
                  v-model="name"
                  label="Name"
                >
                </CInput>
                <CRow>
                  <CCol>
                    <CInput
                      placeholder="Username"
                      required
                      v-model="username"
                      label="Username"
                    >
                    </CInput>
                  </CCol>
                  <CCol>
                    <CInput
                      placeholder="A secret"
                      required
                      type="password"
                      autocomplete="current-password"
                      v-model="secret"
                      label="Secret"
                    >
                    </CInput>
                  </CCol>
                </CRow>
                <CTextarea
                  placeholder="Enter a description for the credential.  The more detail the better."
                  required
                  v-model="description"
                  label="Description"
                >
                  <template #prepend-content><CIcon name="cil-description"/></template>
                </CTextarea>
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
    name: 'CreateCredential',
    created() {
      this.$store.commit('add_start') // Stop the success/fail add from showing up when changing from other pages     
    },
    methods: {
      createCredential: function () {
        let name = this.name
        let description = this.description
        let username = this.username
        let secret = this.secret
        this.$store.dispatch('createCredential', { name, username, secret, description })
        .then(resp => {
          this.$router.go(-1)
        })
      }
    },
    data(){
      return {
        name: "",
        description: "",
        username: "",
        secret: "",
        success: false,
        errorMessage: "",
        test: 0,
        selected: ""
      }
    }
}
</script>
