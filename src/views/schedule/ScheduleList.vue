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
                        <template #active="{item}">
                            <td><CBadge color="success" class="tag" size="sm" v-if="item.active">Active</CBadge>
                            <CBadge color="danger" class="tag" size="sm" v-else>Inactive</CBadge></td>
                        </template>
                        <template #name="{item}">
                        
                                <td>
                                    <b>{{ item.name }}</b><br>
                                    {{ item.description }}
                                </td>
                            
                        </template>
                        <template #ineffect="{item}">
                            <td>
                                <CBadge v-if="item.schedule_active" color="success" class="tag">Yes</CBadge>
                                <CBadge v-else color="danger" class="tag">No</CBadge>
                            </td>
                        </template>
                        <template #actions="{item}">
                            <td class="text-right">
                                <CDropdown toggler-text="Manage" size="sm" color="secondary">
                                    <CDropdownItem @click="editSchedule(item.uuid)"><CIcon name="cilPencil"/>&nbsp;Edit</CDropdownItem>
                                    <CDropdownItem v-if="!item.active" @click="activateSchedule(item.uuid)"><CIcon name="cilCheck"/>&nbsp;Activate</CDropdownItem>
                                    <CDropdownItem v-if="item.active" @click="deactivateSchedule(item.uuid)"><CIcon name="cilBan"/>&nbsp;Deactivate</CDropdownItem>
                                    <CDropdownItem @click="deleteSchedule(item.uuid)"><CIcon name="cilTrash"/>&nbsp;Delete</CDropdownItem>
                                </CDropdown>
                            </td>
                        </template>
                        <template #organization="{item}">
                            <td>
                                <OrganizationBadge :uuid="item.organization"/>
                            </td>
                        </template>
                    </CDataTable>
                </CCard>
            </CCol>
        </CRow>
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
import OrganizationBadge from '../OrganizationBadge.vue'

export default {
    name: 'ScheduleList',
    components: {
        ScheduleWizard,
        OrganizationBadge
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
                { key: 'active', label: 'Active', sortable: true, _style: 'width: 5%' },
                { key: 'name', label: 'Name', sortable: true, _style: 'width: 60%' },
                { key: 'ineffect', label: 'In Effect'},
                { key: 'actions', label: '' }
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
        },
        activateSchedule(uuid) {
            this.$store.dispatch('updateSchedule', {uuid: uuid, data: { active: true } })
        },
        deactivateSchedule(uuid) {
            this.$store.dispatch('updateSchedule', {uuid: uuid, data: { active: false } })
        }
    },
    mounted() {
        this.$store.dispatch('getSchedules', {})
        if(this.current_user.default_org && this.current_user.permissions.view_organizations) {
            this.fields.splice(2, 0, 'organization')
        }
    }
}
</script>