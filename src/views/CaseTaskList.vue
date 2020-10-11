<template>
    <div>
        <div v-if="loading">
            <CRow >
                <CCol col="12">
                <div style="margin: auto; text-align:center; verticle-align:middle;">
                    <CSpinner color="dark" style="width:6rem;height:6rem;"/>
                </div>
                </CCol>
            </CRow>
        </div>
        <div v-else>
        <CListGroup flush v-if="tasks && tasks.length > 0">
            <CListGroupItem v-for="task in tasks" :key="task.uuid">
                <Task :task="task" :deleteAction="deleteTask"/>
            </CListGroupItem>
        </CListGroup>
         <CCardBody v-else>No tasks</CCardBody>
    </div>   
    </div>
</template>

<script>
import { vSelect } from "vue-select";
import { mapState } from "vuex";
import Task from "./Task"
export default {
  name: "CaseTaskList",
  components: {
      Task
  },
  props: {
    uuid: String
  },
  data() {
      return {
          show_details: [],
          collapse: [],
          tasks: [],
          owner_hover: [],
          edit_owner: [],
          task_note: "",
          deleteTaskModal: false,
          closeTaskModal: false,
          target_task: "",
          loading: false,
          notes: {}
      }
  },
  computed: mapState(['users']),
  methods: {
    
    loadTasks() {
        this.loading = true
        this.$store.dispatch('getCaseTasks', this.uuid).then(resp => {
            this.tasks = this.$store.getters.case_tasks
            for(let t in this.tasks) {
                let task = this.tasks[t]
                this.tasks[t]['notes'] = []
                this.$set(this.collapse, task.uuid, false)
                this.$set(this.owner_hover, task.uuid, false)
                this.$set(this.edit_owner, task.uuid, false)
            }
            this.loading = false
        })

    },
    deleteTask(uuid) {
        this.$store.dispatch('deleteCaseTask', uuid).then(resp => {
            this.tasks = this.$store.getters.case_tasks
            this.target_task = ""
            this.deleteTaskModal = !this.deleteTaskModal            
        })        
    }
  },
  created() {
      this.loadTasks()
      
  },
  filters: {
      
  }
};
</script>
