<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Create Task" :centered="true" size="lg" :show.sync="modalStatus">
      <CAlert :show.sync="error" color="danger" closeButton>
        {{error_message}}
      </CAlert>
      <CForm id="createTaskForm" @submit.prevent="createTask" >
            <CInput
              placeholder="Task Title"
              required
              v-model="title"
              label="Title"
            >
            </CInput>
            <CTextarea
              placeholder="Enter a description for the task.  The more detail the better."
              required
              v-model="description"
              label="Description"
              rows=5
            >
            </CTextarea>
            <label>Owner</label>
            <div role="group" class="form-group">
                <multiselect 
                    v-model="owner" 
                    label="username" 
                    :options="users" 
                    track-by="username" 
                    :searchable="true"
                    :internal-search="false"
                    :options-limit="25"
                    :show-no-results="false"
                    @search-change="usersFind">
                </multiselect>
            </div>
            <label>User Group</label>
            <div role="group" class="form-group">
                <multiselect 
                    v-model="group" 
                    label="group" 
                    :options="groups" 
                    track-by="group" 
                    :searchable="true"
                    :internal-search="false"
                    :options-limit="25"
                    :show-no-results="false"
                    @search-change="groupsFind">
                </multiselect>
            </div>
        </CForm>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton type="submit" form="createTaskForm" color="primary">Create</CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
import { mapState } from "vuex";
export default {
    name: 'AddTaskModal',
    props: {
        show: Boolean,
        case_uuid: String,
        task_count: Number
    },
    data(){
        return {
            title: "",
            description: "",
            groups: [],
            owner: "",
            group: "",
            modalStatus: this.show,
            error: false,
            error_message: "",
            required: true
        }
    },
    watch: {
        show: function() {
            this.modalStatus = this.show
        },
        modalStatus: function(){
            if(this.modalStatus) {
                this.loadTags()
            }
            this.$emit('update:show', this.modalStatus)
        
            if(!this.modalStatus) {
                this.reset()
            }
        }
    },
    computed: mapState(['users']),
    created() {
        this.loadTags()
    },
    methods: {
        usersFind(query) {
            this.$store.dispatch('getUsersByName', query).then(resp => {
                this.users = resp.data
            })
        },
        groupsFind(query) {
            this.$store.dispatch('getGrousByName', query).then(resp => {
                this.users = resp.data
            })
        },
        createTask() {

            let title = this.title
            let description = this.description
            let owner = this.owner
            let group = this.group
            let case_uuid = this.case_uuid
            let order = this.task_count+1

            let data = {title, description, case_uuid, order}

            if(owner) {
                data['owner_uuid'] = owner.uuid
            }

            if(group) {
                data['group_uuid'] = group.uuid
            }
            
            this.$store.dispatch('createCaseTask', data).then(resp => {
                this.modalStatus = false
            }).catch(err => {
                this.error = true
                if(err.response.status == 409) {
                    this.error_message = "A task with this title already exists"
                }
            })
        },
        loadTags: function() {
            this.tag_list = Array()
            this.$store.dispatch('getTags').then(resp => {
                for(let i in resp.data) {
                    this.tag_list.push({'name': resp.data[i].name, 'uuid': resp.data[i].uuid})
                }
            })
        },
        reset() {
            this.title = "",
            this.description = "",
            this.owner = null,
            this.group = null
            this.error = false
            this.error_message = ""
        },
        dismiss() {
            this.reset()
            this.modalStatus = false
        },
        addTag(newTag) {
            const t = {
                name: newTag,
                uuid: ''
            }
            this.tag_list.push(t)
            this.selected_tags.push(t)
        }
    }
}
</script>