<template>
  <div class="flex-grid login-wrapper" style="margin-top: 0px">
    <div class="d-col-3 login-box">
      <CForm @submit.prevent="login">
        <img v-bind:src="logo_path" class="login-logo"/>
        <CInput
          placeholder="Email"
          autocomplete="username email"
          required
          v-model="email"
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
        <div class="flex-grid">
          <div class="d-col">
            <button class="btn btn-primary"  type="submit">Login</button>&nbsp;
            <button class="btn btn-secondary" @click="loginWithSSO">Login with SSO</button>
          </div>
          <div class="d-col">
            <button class="btn btn-secondary" to="/forgot_password">Forgot password?</button>
          </div>
        </div>
      </CForm>
    </div>
    <div class="d-col-9 login-image">
    </div>
  </div>
</template>

<style scoped>

/*
.login-btn-primary {
    background-color: #035657 !important;
    border-color: #034444 !important ;
    color: #fff
}

.login-btn-primary:hover {

  background-color: rgba(0,0,0, 1.25)
}

.login-btn {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  line-height: 1.5;
  border: 1px solid;
  border-radius: 0.25rem;
  background-color: #cfcfcf;
  border-color: #9f9f9f;
}

.login-btn:focus {
  outline: 2;
  outline-color: #cfcfcf;
}


.login-btn:hover {

  background-color: rgba(0,0,0, 0.25)
}*/

.login-logo {
  width: 60%;
  max-width: 300px;
  margin-bottom: 10%;
}

.login-wrapper {
  /* Should extend all the way to the bottom of the page  */
  min-height: 100vh;
  background-color: #333;
  background-image: url('https://media.discordapp.net/attachments/1053061816453976124/1187490984288862208/netsurge_a_cyber_security_center_full_of_desks_and_monitors_the_6ffdc80f-4046-49fa-a7c1-d8e30288efd8.webp?ex=65971429&is=65849f29&hm=a27fc1d0dda5db64700a1466ff8b365210e40a833adb1b42bf561e6f06213f4b&=&format=webp&width=1920&height=1080');

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-box {
  background-color: #ebedef;
  padding: 25px !important;
  justify-content: left;
  min-height: 100vh;
  /* Right shadow */
  -webkit-box-shadow: 0px 0px 25px 0px rgba(0,0,0,0.75);
  -moz-box-shadow: 0px 0px 25px 0px rgba(0,0,0,0.75);
  box-shadow: 0px 0px 25px 0px rgba(0,0,0,0.75);
}
</style>

<script>

export default {
  name: 'Login',
  data(){
    return {
      email: "",
      password: "",
      logo_path: require("../assets/img/color-logo-dots.png"),
      sso_disabled: false
    }
  },
  methods: {
    login: function () {
      let email = this.email
      let password = this.password
      this.$store.dispatch('login', { email, password })
      .then(() => {
        if(this.$store.getters.authStatus == "mfa_check") {
          this.$router.push('/mfa')
        } else if (this.$store.getters.authStatus == "success") {
          this.$store.dispatch('getMe').then(resp => {
            this.$router.push('/')
          })
          
        }
      })
      .catch(err => console.log(err))
    },
    loginWithSSO: function() {
      let email = this.email
      this.$store.dispatch('loginWithSAML', {email}).then(resp => {
        window.location.href = resp.data
      }).catch(err => {
        this.sso_disabled = true
      })
    },
    authStatus: function() {
      if(this.$store.getters.authStatus == 'error') {
        return false
      }
    }
  }
}
</script>
