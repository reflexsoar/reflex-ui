<template>
  <CContainer class="d-flex content-center min-vh-100">
    <CRow>
      <CCol>
        <CAlert v-if="authStatus() == false"
              closeButton
              color="danger"
              fade
            >
              Failed to change password.
            </CAlert>
          <CCard color="light">
            <CCardBody>
              
              <CForm @submit.prevent="login">
                <h1>Reset Password</h1>
                <p class="text-muted">Enter your new password.</p>
                <CInput
                  placeholder="Password"
                  type="password"
                  autocomplete="current-password"
                  required
                  v-model="password"
                ><template #prepend-content><CIcon name="cil-lock-locked"/></template>
                </CInput>
                <CInput
                  placeholder="Confirm"
                  type="password"
                  autocomplete="current-password"
                  required
                  v-model="confirm_password"
                >
                  <template #prepend-content><CIcon name="cil-lock-locked"/></template>
                </CInput>
                <CRow>
                  <CCol col="12" class="text-left">
                    <CButton color="primary" class="px-4" type="submit">Reset Password</CButton>
                  </CCol>
                </CRow>
              </CForm>
              {{token}}
            </CCardBody>
          </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script>

export default {
  name: 'ResetPassword',
  data(){
    return {
      password: "",
      confirm_password: "",
      token: this.$route.params.token
    }
  },
  methods: {
    login: function () {
      let token = this.token
      let password = this.password
      this.$store.dispatch('resetPassword', { token, data: {password: password}})
      .then(() => this.$router.push('/'))
      .catch(err => console.log(err))
    },
    authStatus: function() {
      if(this.$store.getters.authStatus == 'error') {
        return false
      }
    }
  }
}
</script>
