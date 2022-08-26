<template>
    <CRow>
        <CCol>
            <h2><CBadge color="primary">BETA</CBadge>&nbsp;Notification Channels<button type="button" class="kb"
                    onclick="window.open('https://docs.reflexsoar.com/en/latest/notifications')">
                    <CIcon name='cil-book' size="lg" />
                </button></h2>
                <p>Notification Channels define where Notifications get sent when an Event Rule, Case Rule or System Wide events action calls for a notification to be sent.</p>
                <CAlert :show="true" color="info"><b>Beta Feature</b>: This feature is in beta and requires a specific agent version and API version.</CAlert>
            <CButton color="primary" @click="createNotificationChannel()">New Channel</CButton><br><br>
            <CCard>
                <CCardHeader>
                    <b>Notification Channels</b>
                </CCardHeader>

                <CCardBody>
                    <CDataTable :hover="hover" :striped="striped" :bordered="bordered" :small="small" :fixed="fixed"
                        :items="notification_channels" :fields="fields" :items-per-page="small ? 25 : 10" :dark="dark"
                        :sorter="{ external: true, resetable: true }" style="border-top: 1px solid #cfcfcf;">
                        <template #name="{ item }">
                            <td>
                                <b>{{ item.name }}</b><br>
                                {{item.description}}
                            </td>
                        </template>
                        <template #channel_type="{item}">
                            <td style="text-transform: capitalize">
                                {{format_channel_type(item.channel_type)}}
                            </td>
                        </template>
                        <template #organization="{ item }">
                            <td>
                                <OrganizationBadge :uuid="item.organization"/>
                            </td>
                        </template>
                        <template #enabled="{item}">
                            <td>
                                <CBadge :color="item.enabled ? 'success' : 'danger'">{{item.enabled ? 'Enabled' : 'Disabled'}}</CBadge>
                            </td>
                        </template>
                        <template #manage="{item}">
                            <td>
                                <CButtonGroup>
                                    <CButton aria-label="Edit Detection" @click="editNotificationChannelModal(item.uuid)" size="sm" color="info" v-c-tooltip="{content:'Edit Notification Channel', placement:'left'}"><CIcon name='cilPencil'/></CButton>
                                </CButtonGroup>
                            </td>
                        </template>
                    </CDataTable><CPagination :activePage.sync="active_page" :pages="pagination.pages" />
                </CCardBody>
            </CCard>
            <CRow>
                <CCol>
                    <CCardBody>
                        
                    </CCardBody>
                </CCol>
            </CRow>
        </CCol>
        <NotificationsChannelModal :mode="modal_mode" :show.sync="notification_channel_modal" :channel="notification_channel" />    </CRow>
    
</template>

<script>
import { mapState } from "vuex";
import OrganizationBadge  from "../OrganizationBadge.vue";
import NotificationsChannelModal from "./NotificationsChannelModal.vue";

export default {
    name: 'NotificationChannelsList',
    components: {
        OrganizationBadge,
        NotificationsChannelModal
    },
    props: {
        caption: {
            type: String,
            default: "Table",
        },
        hover: Boolean,
        striped: Boolean,
        bordered: Boolean,
        small: Boolean,
        fixed: Boolean,
        dark: Boolean
    },
    computed: mapState(["notification_channels", "alert", "current_user"]),
    created() {
        this.getNotificationChannels();
        if(this.current_user.default_org) {
        if (!this.fields.includes('organization')) {
            this.$store.dispatch('getOrganizations', {})
            this.fields.splice(1,0,{key:'organization', sorter: false})
        }}
    },
    data() {
        return {
            loading: true,
            active_page: 1,
            pagination: {
                pages: 1
            },
            fields: [
                'name',
                'channel_type',
                'enabled',
                {key: 'manage', label: 'Manage', sorter: false},
            ],
            notification_channel_modal: false,
            modal_mode: 'Create',
            notification_channel: {},
            empty_channel: {
                email_configuration: {
                    mail_to: [],
                    subject: '',
                    mail_from: '',
                    smtp_server: '',
                    smtp_port: 25,
                    use_tls: false,
                    credential: null,
                    message_template: '',
                },
                slack_configuration: {
                    webhook_url: '',
                    message_template: ''
                },
                teams_configuration: {
                    webhook_url: '',
                    message_template: ''
                },
                pagerduty_configuration: {
                    webhook_url: '',
                    message_template: ''
                },
            }
        }
    },
    methods: {
        getNotificationChannels(page = 1, sort_by = 'created_at', sort_direction = 'desc') {
            this.loading = true
            this.$store.dispatch("getNotificationChannels", { page: page, sort_by: sort_by, sort_direction: sort_direction }).then(() => {
                this.loading = false
            })
        },
        createNotificationChannel() {
            this.modal_mode = 'Create'
            Object.assign(this.notification_channel, this.empty_channel)
            this.notification_channel_modal = true
        },
        editNotificationChannelModal(uuid) {
            this.modal_mode = 'Edit'
            Object.assign(this.notification_channel, this.notification_channels.find(channel => channel.uuid === uuid))
            this.notification_channel_modal = true
            //this.$store.dispatch("getNotificationChannel", { uuid: uuid })
            //this.$store.dispatch("showModal", { component: "EditNotificationChannelModal" })
        },
        format_channel_type(s){
            let formatted_string = s.replace(/_/g, ' ')
            return formatted_string
        }
    }
}

</script>