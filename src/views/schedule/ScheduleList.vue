<template>
    <div>
        <CRow>
            <CCol>
                <h2 class="page-sub-header">Configured Schedules</h2>
            </CCol>
            <CCol class="text-right">
                <CButton color="primary" @click="newSchedule()">New Schedule</CButton>
            </CCol>
        </CRow>
        <CRow>
            <CCol>
                <CCard>
                    <CDataTable
                        :items="schedules"
                        :fields="fields"
                        :items-per-page="10"
                        :responsive="false"
                        :noItemsView='{ noResults: "No schedules found", noItems: "No schedules" }'
                        >
                        <template #default="{ item, index }">
                            <td>{{ item.name }}</td>
                            <td>{{ item.description }}</td>
                            <td>{{ item.organization.name }}</td>
                            <td>
                                <CButtonGroup>
                                    <CButton color="primary" @click="editSchedule(item.uuid)">Edit</CButton>
                                    <CButton color="danger" @click="deleteSchedule(item.uuid)">Delete</CButton>
                                </CButtonGroup>
                            </td>
                        </template>
                    </CDataTable>
                </CCard>
            </CCol>
        </CRow> {{ current_user.organization }} {{ schedule }}
        <ScheduleWizard :show.sync="show_wizard" :mode="wizard_mode" :source_schedule="schedule"></ScheduleWizard>
        <CModal :show.sync="show_delete_confirmation" title="Confirm Delete" color="danger">
            <p>Are you sure you want to delete the schedule <b>{{ target_schedule.name }}</b>? If yes, enter the schedule name in the field below.</p>
            <CInput v-model="delete_confirm" placeholder="Enter the schedule name"></CInput>
            <template #footer>
                <CButton color="danger" @click="confirmDelete(target_schedule.uuid)" v-bind:disabled="delete_confirm != target_schedule.name">Delete</CButton>
                <CButton color="secondary" @click="cancelDelete()">Cancel</CButton>
            </template>
        </CModal>
    </div>
</template>
<script>

import { mapState } from 'vuex';

import ScheduleWizard from './ScheduleWizard.vue'

export default {
    name: 'ScheduleList',
    components: {
        ScheduleWizard
    },
    computed: {
        ...mapState(['schedules', 'current_user'])
    },
    data() {
        return {
            schedule: {},
            show_wizard: false,
            wizard_mode: 'create',
            loading: false,
            target_schedule: {},
            delete_confirm: "",
            show_delete_confirmation: false,
            fields: [
                { key: 'name', label: 'Name', sortable: true },
                { key: 'description', label: 'Description', sortable: true },
                { key: 'organization', label: 'Organization', sortable: true },
                { key: 'actions', label: 'Actions' }
            ]
        }
    },
    methods: {
        newSchedule() {
            this.schedule = {
                name: '',
                description: '',
                organization: this.current_user.organization,
                monday: {
                    custom: false,
                    hours: [],
                    active: true
                },
                tuesday: {
                    custom: false,
                    hours: [],
                    active: true
                },
                wednesday: {
                    custom: false,
                    hours: [],
                    active: true
                },
                thursday: {
                    custom: false,
                    hours: [],
                    active: true
                },
                friday: {
                    custom: false,
                    hours: [],
                    active: true
                },
                saturday: {
                    custom: false,
                    hours: [],
                    active: true
                },
                sunday: {
                    custom: false,
                    hours: [],
                    active: true
                },
                timezone: '(UTC+00:00)'
            }
            this.wizard_mode = 'create'
            this.show_wizard = true
        },
        editSchedule(uuid) {
            this.schedule = this.schedules.find(schedule => schedule.uuid === uuid)
            this.wizard_mode = 'edit'
            this.show_wizard = true
        },
        deleteSchedule(uuid) {
            this.target_schedule = this.schedules.find(schedule => schedule.uuid === uuid)
            this.show_delete_confirmation = true
        },
        confirmDelete(uuid) {
            this.$store.dispatch('deleteSchedule', uuid)
            this.cancelDelete()
        },
        cancelDelete() {
            this.target_schedule = {}
            this.delete_confirm = ""
            this.show_delete_confirmation = false
        }
    },
    mounted() {
    }
}
</script>