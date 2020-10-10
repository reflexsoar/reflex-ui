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
            <CListGroupItem v-for="task in tasks" :key="task.title">
                <CRow>
                    <CCol col="8">
                    <b>{{task.title}}</b>
                    <br />
                    {{task.description}}
                    </CCol>
                    <CCol col="2">
                        <div @mouseenter="owner_hover[task.uuid] = true" @mouseleave="owner_hover[task.uuid] = false">
                            <span v-if="!edit_owner[task.uuid]">
                                <b>Assigned To: </b>&nbsp;
                                <span v-if="task.owner.username">{{task.owner.username}}</span>
                                <span v-else>Unassigned</span>
                                <a v-if="owner_hover[task.uuid] && task.status != 2" @click="edit_owner[task.uuid] = !edit_owner[task.uuid]">&nbsp;<CIcon name='cilPencil' size="sm"></CIcon></a>
                            </span>
                            <span v-else>
                                <multiselect 
                                    v-model="task.owner" 
                                    label="username" 
                                    :options="users" 
                                    track-by="username" 
                                    :searchable="true"
                                    :internal-search="false"
                                    :options-limit="25"
                                    :show-no-results="false"
                                    v-bind:disabled="task.status == 2" 
                                    @search-change="usersFind"
                                    @select="changeTaskOwner($event, task.uuid)"
                                    v-on:focusout.native="edit_owner[task.uuid] == false"
                                    >
                                </multiselect>
                            </span>
                        </div>
                    </CCol>
                    <CCol col="1"><CButton color="primary" size="sm" disabled>{{task.status | statusIcon}}</CButton></CCol>
                    <CCol col="1" class="text-right">
                    <CButtonGroup>
                        <CButton size="sm" v-if="task.status == 1" color="success" @click="showCloseTaskModal(task.uuid)" v-c-tooltip="'Complete task'"><CIcon name="cilCheckCircle"/></CButton>
                        <CButton size="sm" v-if="task.status == 0" color="success" @click="startTask(task.uuid)" v-c-tooltip="'Start Task'"><CIcon name="cilMediaPlay"/></CButton>
                        <CButton size="sm" color="secondary" v-c-tooltip="'View Notes'" @click="collapse[task.uuid] = !collapse[task.uuid]"><CIcon name="cilNotes"/></CButton>                
                        <CButton size="sm" v-if="task.status == 0" color="danger" v-c-tooltip="'Delete task'" v-bind:hidden="task.from_template" @click="showDeleteTaskModal(task.uuid)"><CIcon name="cilXCircle"/></CButton>
                    </CButtonGroup>
                    </CCol>
                </CRow>
                <CCollapse :show.sync="collapse[task.uuid]">
                    <br>
                    <div style="max-height: 300px; overflow-y: scroll; overflow-x:hidden; padding-right: 10px;">
                    <CRow v-if="task.notes">
                        <CCol>
                            <CCard  v-for="note in task.notes" :key="note.uuid" >
                                <CCardBody><vue-markdown>{{note}}</vue-markdown></CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                    </div><br>
                    <CRow>
                        <CCol>
                            <CTextarea v-model="task_note" rows="5" placeholder="Enter your notes here..."></CTextarea>
                            <CButton @click="createNote(task.uuid)" size="sm" color="primary">Save Note</CButton>
                        </CCol>
                    </CRow>
                </CCollapse>
            </CListGroupItem>
        </CListGroup>
    </div>
    <CCardBody v-else>No tasks</CCardBody>
    <CModal title="Delete Task" color="danger" :centered="true" size="lg" :show.sync="deleteTaskModal">
      <div>
        Deleting a task is a permanent action, any edits to the task will be removed.
      </div>
      <template #footer>
          <CButton @click="deleteTaskModal = !deleteTaskModal" color="secondary">Dismiss</CButton>
        <CButton @click="deleteTask()" color="danger">Delete</CButton>
      </template>
    </CModal>
    <CModal title="Complete Task" color="success" :centered="true" size="lg" :show.sync="closeTaskModal">
      <div>
        You are about to complete this task, are you sure all items in the task are complete?
      </div>
      <template #footer>
          <CButton @click="closeTaskModal = !closeTaskModal" color="secondary">Dismiss</CButton>
        <CButton @click="closeTask()" color="success">Yes</CButton>
      </template>
    </CModal>
    </div>
</template>

<script>
import { vSelect } from "vue-select";
import { mapState } from "vuex";
export default {
  name: "CaseTaskList",
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
          loading: false
      }
  },
  computed: mapState(['users']),
  methods: {
    toggleNotes(uuid) {
        this.collapse[uuid] = !this.collapse[uuid]
    },
    loadTasks() {
        this.loading = true
        this.$store.dispatch('getCaseTasks', this.uuid).then(resp => {
            this.tasks = this.$store.getters.case_tasks
            for(let t in this.tasks) {
                let task = this.tasks[t]
                task['notes'] = []
                this.$set(this.collapse, task.uuid, false)
                this.$set(this.owner_hover, task.uuid, false)
                this.$set(this.edit_owner, task.uuid, false)
            }
            this.loading = false
        })

    },
    showCloseTaskModal(uuid) {
        this.target_task = uuid;
        this.closeTaskModal = !this.closeTaskModal
    },
    showDeleteTaskModal(uuid) {
        this.target_task = uuid;
        this.deleteTaskModal = !this.deleteTaskModal
    },
    createNote(uuid) {
        let task = this.tasks.filter(task => task.uuid === uuid)[0]
        if(!('notes' in task)) {
            task['notes'] = [this.task_note]
        } else {
            task.notes.push(this.task_note)
        }
        
        this.task_note = ''
    },
    usersFind(query) {
        this.$store.dispatch('getUsersByName', query).then(resp => {
            this.users = resp.data
        })
    },
    changeTaskOwner(event, uuid) {
        this.edit_owner[uuid] = false
        this.owner_hover[uuid] = false

        let data = {
           'owner_uuid': event.uuid
        }
        this.$store.dispatch('updateCaseTask', {uuid, data}).then(resp => {
            this.tasks = this.$store.getters.case_tasks
        })
    },
    startTask(uuid) {
        this.$store.dispatch('updateCaseTask', {uuid, data: {status: 1}}).then(resp => {
            this.tasks = this.$store.getters.case_tasks
        })
    },
    closeTask() {
        let uuid = this.target_task
        this.$store.dispatch('updateCaseTask', {uuid, data: {status: 2}}).then(resp => {
            this.tasks = this.$store.getters.case_tasks
            this.target_task = ""
            this.closeTaskModal = !this.closeTaskModal    
        })
    },
    deleteTask() {
        let uuid = this.target_task
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
      statusIcon(status) {
          switch(status) {
              case 0: return 'Open';
              case 1: return 'In Progress';
              case 2: return 'Closed';
          }
      }
  }
};
</script>
