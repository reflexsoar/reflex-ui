<template>
  <div class="c-app">
    <TheSidebar />
    <CWrapper>
      <TheHeader />
      <div class="c-body">
        <main class="c-main">
          <CContainer fluid
            ><CToaster :autohide="10000">
                <CToast
                v-for="toast in toasts"
                  :key="toast.key"
                  :show="true"
                  :header="toast.header"
                >
                  {{toast.message}}<span v-if="toast.refresh"> Click <span onclick="window.location.reload();" style="cursor: pointer; text-decoration: underline;">here</span> to refresh.</span><br>
                  Task ID: {{toast.key}}
                </CToast>
              
            </CToaster>

            <router-view></router-view>
          </CContainer>
        </main>
        <TheFooter />
      </div>
    </CWrapper>
  </div>
</template>

<script>
import TheSidebar from "./TheSidebar";
import TheHeader from "./TheHeader";
import TheFooter from "./TheFooter";
import { mapState } from "vuex";

export default {
  name: "TheContainer",
  components: {
    TheSidebar,
    TheHeader,
    TheFooter,
  },
  computed: mapState(["alert", "toasts", "running_tasks"]),
  created: function() {
    this.refresh = setInterval(function() {

      if(this.running_tasks !== undefined) {
        for(let t in this.running_tasks) {
          this.$store.dispatch('checkTaskStatus', {uuid: this.running_tasks[t]}).then(resp => {
            if(resp.data.tasks.length > 0) {
              let task = resp.data.tasks[0]
              let key = task.uuid
              let message = ''
              let header = ''
              let refresh = false
              if(task.task_type == 'bulk_dismiss_events') {
                message = 'Bulk dismiss task complete.'
                header = 'Bulk Dismiss Complete'
                refresh = true
              }

              this.$store.commit('add_toast', {message: message, header: header, key: key, refresh: refresh})
              this.$store.commit('delete_task', this.running_tasks[t])
            }
          })
        }
      }     

    }.bind(this), 10000)
  },
  beforeDestroy: function() {
      clearInterval(this.refresh)
    }
};
</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
  padding: 0px;
  margin: 0px;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
