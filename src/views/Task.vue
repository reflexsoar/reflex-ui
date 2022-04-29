<template>
    <div>
    <CRow>
        <CCol col="8">
        <b>{{task_data.title}}</b>
        <br />
        {{task_data.description}}<br>
        </CCol>
        <CCol col="2">
            <div @mouseenter="owner_hover = true" @mouseleave="owner_hover = false">
                <span v-if="!edit_owner">
                    <b>Assigned To: </b>&nbsp;
                    <span v-if="task_data.owner.username">{{task_data.owner.username}}</span>
                    <span v-else>Unassigned</span>
                    <a v-if="owner_hover && task_data.status != 2" @click="edit_owner = !edit_owner">&nbsp;<CIcon name='cilPencil' size="sm"></CIcon></a>
                </span>
                <span v-else>
                    <multiselect 
                        v-model="task_data.owner" 
                        label="username" 
                        :options="users" 
                        track-by="username" 
                        :searchable="true"
                        :internal-search="false"
                        :options-limit="25"
                        :show-no-results="false"
                        v-bind:disabled="task_data.status == 2" 
                        @search-change="usersFind"
                        @select="changeTaskOwner($event, task_data.uuid)"
                        v-on:focusout.native="edit_owner == false"
                        >
                    </multiselect>
                </span>
                <span v-if="task_data.start_date" v-c-tooltip="task_data.start_date"><br><small><b>Started:</b> {{task_data.start_date | moment('from','now')}}</small><br></span>
                <span v-if="task_data.finish_date" v-c-tooltip="task_data.finish_date"><small><b>Finished:</b> {{task_data.finish_date | moment('from','now')}}</small></span>
            </div>
        </CCol>
        <CCol col="1"><CButton color="primary" size="sm" disabled>{{task_data.status | statusIcon}}</CButton></CCol>
        <CCol col="1" class="text-right">
        <CButtonGroup>
            <CButton size="sm" v-if="task_data.status == 1" color="success" @click="showCloseTaskModal(task_data.uuid)" v-c-tooltip="'Complete task'"><CIcon name="cilCheckCircle"/></CButton>
            <CButton size="sm" v-if="task_data.status == 0" color="success" @click="startTask(task_data.uuid)" v-c-tooltip="'Start Task'"><CIcon name="cilMediaPlay"/></CButton>
            <CButton size="sm" color="secondary" v-c-tooltip="'View Notes'" @click="toggleNotes(task_data.uuid)"><CIcon name="cilNotes"/></CButton>                
            <CButton size="sm" v-if="task_data.status == 0" color="danger" v-c-tooltip="'Delete task'" v-bind:hidden="task_data.from_template" @click="showDeleteTaskModal(task_data.uuid)"><CIcon name="cilXCircle"/></CButton>
        </CButtonGroup>
        </CCol>
    </CRow>
    <CCollapse :show.sync="collapse">
        <br>
        <div v-if="task_data.notes.length > 0">
            <timeline>
                <timeline-item v-for="note in task_data.notes" :key="note.uuid" >
                    <CCard>
                        <CCardHeader class="bg-light">Note from <b>{{note.created_by.username}}</b> <i v-if="note.after_complete">after task was complete</i> on {{note.created_at | moment('LLLL')}} </CCardHeader>
                        <CCardBody><vue-markdown>{{note.note}}</vue-markdown></CCardBody>
                    </CCard>
                </timeline-item>
            </timeline>
        </div>
        <div v-else>
            No Notes
        </div><br>
        <CRow>
            <CCol>
                <CTextarea v-model="note" rows="5" placeholder="Enter your notes here..."></CTextarea>
                <CButton @click="createNote(task_data.uuid)" size="sm" color="primary">Save Note</CButton>
            </CCol>
        </CRow>
    </CCollapse>
    <CModal title="Delete Task" color="danger" :centered="true" size="lg" :show.sync="deleteTaskModal">
      <div>
        Deleting a task is a permanent action, any edits to the task will be removed.
      </div>
      <template #footer>
          <CButton @click="deleteTaskModal = !deleteTaskModal" color="secondary">Dismiss</CButton>
        <CButton @click="deleteAction(task_data.uuid)" color="danger">Delete</CButton>
      </template>
    </CModal>
    <CModal title="Complete Task" color="success" :centered="true" size="lg" :show.sync="closeTaskModal">
      <div>
        You are about to complete this task, are you sure all items in the task are complete?
      </div>
      <template #footer>
          <CButton @click="closeTaskModal = !closeTaskModal" color="secondary">Dismiss</CButton>
        <CButton @click="closeTask(task_data.uuid)" color="success">Yes</CButton>
      </template>
    </CModal>
    </div>
</template>
        

<script>
import { mapState } from "vuex";
import { Timeline, TimelineItem, TimelineTitle } from "vue-cute-timeline";
import 'vue-cute-timeline/dist/index.css'
export default {
  name: "Task",
  computed: mapState(["current_user", "settings", "users"]),
  components: {
    Timeline,
    TimelineItem,
    TimelineTitle,
  },
  props: {
    task: Object,
    deleteAction: Function,
    startAction: Function,
    closeAction: Function
  },
  data() {
    return {
        edit_owner: false,
        owner_hover: false,
        notes: [],
        collapse: false,
        note: "",
        loading: false,
        task_data: this.task,
        deleteTaskModal: false,
        closeTaskModal: false
    };
  },
  methods: {
    showCloseTaskModal(uuid) {
        this.closeTaskModal = !this.closeTaskModal
    },
    showDeleteTaskModal(uuid) {
        this.deleteTaskModal = !this.deleteTaskModal
    },
    startTask(uuid) {
        this.$store.dispatch('updateCaseTask', {uuid, data: {status: 1}}).then(resp => {
            this.task_data = this.$store.getters.case_task
        })
    },
    closeTask(uuid) {
        this.$store.dispatch('updateCaseTask', {uuid, data: {status: 2}}).then(resp => {
            this.task_data = this.$store.getters.case_task
            this.closeTaskModal = !this.closeTaskModal    
        })
    },
    usersFind(query) {
        this.$store.dispatch('getUsersByName', query).then(resp => {
            this.users = resp.data
        })
    },
    changeTaskOwner(event, uuid) {
        let data = {
           'owner_uuid': event.uuid
        }
        this.$store.dispatch('updateCaseTask', {uuid, data}).then(resp => {
            this.task = this.$store.getters.case_task
        })
        this.edit_owner = false
        this.owner_hover = false
    },
    toggleNotes(uuid) {
        
        this.loading = true
        this.collapse = !this.collapse
        
    },
    createNote(uuid) {
        
        let data = {
            'note': this.note
        }
        this.$store.dispatch('addTaskNote', {uuid, data}).then(resp => {
            if(this.task_data.notes.length >= 1) {
                this.task_data.notes.push(resp.data)
            } else {
                this.task_data.notes = [resp.data]
            }
            this.note = ""
        })
    }
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