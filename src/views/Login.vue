<template>
  <CContainer class="d-flex content-center min-vh-100">
    <CRow>
      <CCol>
        <CAlert v-if="authStatus() == false"
              closeButton
              color="danger"
              fade
            >
              Failed to login. Invalid username or password.
            </CAlert>
        <CCardGroup>
          <CCard color="light">
            <CCardBody>
              
              <CForm @submit.prevent="login">
                <h1>Login</h1>
                <p class="text-muted">Sign In to your account</p>
                <CInput
                  placeholder="Email"
                  autocomplete="username email"
                  required
                  v-model="username"
                >
                  <template #prepend-content><CIcon name="cil-user"/></template>
                </CInput>
                <CInput
                  placeholder="Password"
                  type="password"
                  autocomplete="current-password"
                  required
                  v-model="password"
                >
                  <template #prepend-content><CIcon name="cil-lock-locked"/></template>
                </CInput>
                <CRow>
                  <CCol col="6" class="text-left">
                    <CButton color="primary" class="px-4" type="submit">Login</CButton>
                  </CCol>
                  <CCol col="6" class="text-right">
                    <CButton color="secondary" to="/forgot_password">Forgot password?</CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
          <CCard
            color="muted"
            text-color="dark"
            class="text-center py-5 d-sm-down-none"
            body-wrapper
          >
            
            <h1 style="font-size: 5em">re<span class="text-info">flex</span></h1>
            <p>Welcome to Reflex, your Security Orchestration, Automation and Response Platform.  To get started, log in to the left. </p>
            
          </CCard>
        </CCardGroup>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script>

export default {
  name: 'Login',
  data(){
    return {
      username: "",
      password: ""
    }
  },
  methods: {
    login: function () {
      let username = this.username
      let password = this.password
      this.$store.dispatch('login', { username, password })
      .then(() => {
        if(this.$store.getters.authStatus == "mfa_check") {
          this.$router.push('/mfa')
        } else if (this.$store.getters.authStatus == "success") {
          this.$router.push('/')
        }
      })
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
