<template>
    <div>
        <link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css" />
        <CModal title="Create Event Rule" :centered="false" size="xl" :show.sync="modalStatus" :closeOnBackdrop="false">
            <template #header>
                <h5 style="text-transform: capitalize">{{ mode }} Notification Channel</h5>
                <span class="text-right">
                    <button type="button" aria-label="Close" class="close" @click="dismiss()">
                        ×
                    </button>
                    <button type="button" class="kb" aria-label="Documentation"
                        onclick="window.open('https://docs.reflexsoar.com/en/latest/notifications')">
                        <CIcon name="cil-book" size="lg" />
                    </button>
                </span>
            </template>
            <div>
                <CRow>
                    <CCol>
                        <CAlert :show.sync="error" color="danger" closeButton>
                            {{ error_message }}
                        </CAlert>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol>
                        <CTabs :fade="false" variant="pills" :activeTab.sync="step"
                            :vertical="{ navs: 'col-md-2', content: 'col-md-10' }">
                            <CTab title="1. Overview">
                                <CSelect label="Organization" placeholder="Select an organization"
                                    v-if="current_user.role.permissions.view_organizations"
                                    :value.sync="channel.organization" :options="orgs" @change="reloadMeta()"/>
                                <CSelect label="Channel Type" placeholder="Select the type of channel being configured"
                                    :value.sync="channel.channel_type" :options="channel_types" />
                                <CInput v-model="channel.name" label="Name" placeholder="Channel Name" />
                                <CTextarea v-model="channel.description" label="Description"
                                    placeholder="A friendly description of the channel" :rows="5" />
                                <label for="is_global">Global Channel</label><br>
                                    <CSwitch id="is_global" :checked.sync="channel.is_global" label-on="Yes" label-off="No" label="Global Channel" color="success"/>
                            </CTab>
                            <CTab title="2. Configuration" :disabled="!channel.channel_type">
                                <div v-if="channel.channel_type == 'email'">
                                    <h4>Email Configuration</h4>
                                    <CSelect :value.sync="channel.email_configuration.credential" label="Credential"
                                        placeholder="Select an email credential" :options="credential_list" />
                                    <CInput v-model="channel.email_configuration.mail_from" label="Send From"
                                        placeholder="The e-mail address to send as" />
                                    <CInput v-model="channel.email_configuration.subject" label="Email Subject"
                                        placeholder="Email Subject" />
                                    <label for="mail_recipients">Email Recipients</label><br>
                                    <multiselect id="mail_recipients" v-model="channel.email_configuration.mail_to" :taggable="true"
                                        :multiple="true" :options="recipients" @tag="addRecipient" :searchable="true"
                                        placeholder="Select recipients"
                                        :close-on-select="false"/><br>
                                    <CTextarea v-model="channel.email_configuration.message_template"
                                        label="Message Template" placeholder="Message Template" rows="5" />
                                    <h5>SMTP Server Configuration</h5>
                                    <CRow>
                                        <CCol>
                                        <CInput v-model="channel.email_configuration.smtp_server" label="SMTP Server"
                                            placeholder="SMTP Server" />
                                        </CCol>
                                        <CCol>
                                        <CInput v-model.number="channel.email_configuration.smtp_port" label="SMTP Port"
                                            placeholder="SMTP Port" />
                                        </CCol>
                                    </CRow>
                                    <label for="use_tls">Use TLS</label><br>
                                    <CSwitch id="use_tls" :checked.sync="channel.email_configuration.use_tls" label-on="Yes" label-off="No" label="Use TLS" color="success"/>
                                    
                                </div>
                                <div v-if="channel.channel_type == 'teams_webhook'">
                                    <h4>Teams Configuration</h4>
                                    <CInput v-model="channel.teams_configuration.webhook_url" label="Teams Webhook URL"
                                        placeholder="Teams Webhook URL" />
                                    <CTextarea v-model="channel.teams_configuration.message_template"
                                        label="Message Template" placeholder="Message Template" rows="5" />
                                </div>
                                <div v-if="channel.channel_type == 'slack_webhook'">
                                    <h4>Slack Configuration</h4>
                                    <CInput v-model="channel.slack_configuration.webhook_url" label="Slack Webhook URL"
                                        placeholder="Slack Webhook URL" />
                                    <CTextarea v-model="channel.slack_configuration.message_template"
                                        label="Message Template" placeholder="Message Template" rows="5" />
                                </div>
                                <div v-if="channel.channel_type == 'pagerduty_api'">
                                    <h4>PagerDuty Configuration</h4>
                                    <CSelect :value.sync="channel.pagerduty_configuration.credential" label="Credential"
                                        placeholder="Select an email credential" :options="credential_list" />
                                    <CInput v-model="channel.pagerduty_configuration.default_from" label="Default From"
                                        placeholder="The e-mail to send the incident from" />
                                    <CTextarea v-model="channel.pagerduty_configuration.message_template"
                                        label="Message Template" placeholder="Message Template" rows="5" />
                                </div>
                                <div v-if="channel.channel_type == 'rest_api'">
                                    <h4>REST API Configuration</h4>
                                    <p>The REST API Notificaiton Channel will send the configured POST request to the API destination configured.</p>
                                    <CInput v-model="channel.rest_api_configuration.api_url" label="API URL"
                                        placeholder="API URL" />
                                    <h5>Headers</h5>
                                    <CButton color="primary" size="sm" @click="channel.rest_api_configuration.headers.push({key:'',value:''})">Add Header</CButton><br><br>
                                    <div v-for="header, i in channel.rest_api_configuration.headers" :key="i">
                                        <CRow>
                                            <CCol col=3><CInput v-model="channel.rest_api_configuration.headers[i].key" label="Header Name" placeholder="Header Name" /></CCol>
                                            <CCol col=7><CInput v-model="channel.rest_api_configuration.headers[i].value" label="Header Value" placeholder="Header Value" /></CCol>
                                            <CCol><label>&nbsp;</label><br><CButton color="danger" size="sm" @click="channel.rest_api_configuration.headers.pop(i)">Remove</CButton></CCol>
                                        </CRow>                                        
                                    </div>
                                    <CTextarea v-model="channel.rest_api_configuration.body" label="POST Body"
                                        placeholder="{}" rows="5" />
                                </div>
                            </CTab>
                            <CTab title="3. Review" :disabled="!channel.channel_type">
                                <label>Channel Name:</label>
                                {{ channel.name }}<br>
                                <label>Channel Description:</label>
                                {{ channel.description }}<br>
                                <label>Message Template:</label><br>
                                <pre style="background-color: #f1f1f1; padding:5px; border-radius: 5px; border: 1px solid #cfcfcf">{{get_message_template(channel, channel.channel_type)}}</pre>
                            </CTab>
                        </CTabs>
                    </CCol>
                </CRow>
            </div>
            <template #footer>
                <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
                <CButton v-if="step != 0" @click="previousStep()" color="info">Previous</CButton>
                <CButton v-if="step != final_step" @click="nextStep()"
                    :disabled="(test_failed && step == 2) || !channel.channel_type" color="primary">Next</CButton>
                <CButton v-if="step == final_step && (mode == 'Create' || mode == 'Clone')"
                    @click="createNotificationChannel()" color="primary" :disabled="submitted"><span v-if="submitted">
                        <CSpinner size="sm" />&nbsp;
                    </span>Create</CButton>
                <CButton v-if="step == final_step && mode == 'Edit'" @click="editNotificationChannel()" color="primary"
                    :disabled="submitted"><span v-if="submitted">
                        <CSpinner size="sm" />&nbsp;
                    </span>Save</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>

import { mapState } from "vuex";

export default {
    name: 'NotificationChannelModal',
    props: {
        show: Boolean,
        channel: {
            type: Object,
            default: {
                email_configuration: {
                    mail_to: [],
                    subject: '',
                    mail_from: '',
                    smtp_server: '',
                    smtp_port: '',
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
                rest_api_configuration: {
                    url: '',
                    headers: [],
                    body: ''
                }
            }
        },
        mode: {
            type: String,
            default: 'Create'
        }
    },
    computed: mapState(['settings', 'current_user', 'organizations', 'credential_list']),
    data() {
        return {
            channel_types: [
                { 'label': 'Microsoft Teams', 'value': 'teams_webhook' },
                { 'label': 'Slack', 'value': 'slack_webhook' },
                { 'label': 'Email', 'value': 'email' },
                { 'label': 'PagerDuty', 'value': 'pagerduty_api' },
                { 'label': 'REST API', 'value': 'rest_api' }
                //{'label': 'OpsGenie', 'value': 'opsgenie'},
                //{'label': 'VictorOps', 'value': 'victorops'},
                //{'label': 'Twilio', 'value': 'twilio'},
                //{'label': 'Generic Webhook', 'value': 'generic_webhook'},
                //{'label': 'Sendgrid', 'value': 'sendgrid'}
                //{'label': 'JIRA Issue', 'value': 'jira_issue'}
            ],
            step: 0,
            error: false,
            error_message: '',
            modalStatus: this.show,
            orgs: [],
            test_failed: false,
            final_step: 2,
            submitted: false,
            recipients: [],
            organization: null
        }
    },
    watch: {
        show: function () {
            this.error = false;
            this.error_message = "";
            if (this.mode == "Edit") {
                this.step = 0;
            }
            this.modalStatus = this.show;
        },
        modalStatus: function () {
            if (this.modalStatus) {
                this.test_failed = true;
            }
            this.$emit("update:show", this.modalStatus);
            if (!this.modalStatus) {
                this.dismiss();
            }
        }
    },
    created() {
        if (this.current_user.default_org) {
            this.$store.dispatch("getOrganizations", {}).then((resp) => {
                this.orgs = this.$store.getters.organizations.map((o) => {
                    return { label: o.name, value: o.uuid };
                });
            });
        }
    },
    methods: {
        get_message_template(channel, channel_type) {
            if (channel_type == "email") {
                return channel.email_configuration.message_template;
            } else if (channel_type == "slack_webhook") {
                return channel.slack_configuration.message_template;
            } else if (channel_type == "teams_webhook") {
                return channel.teams_configuration.message_template;
            } else if (channel_type == "pagerduty_api") {
                return channel.pagerduty_configuration.message_template;
            } else if (channel_type == "rest_api") {
                return channel.rest_api_configuration.body;
            }
        },
        reloadMeta() {
            let organization = this.channel.organization
            this.$store.dispatch('getCredentialList', {organization: organization, page_size: 100}).then(resp => {
            })
        },
        validEmail(email) {
             var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
             if(validRegex.test(email)) {
                 return true;
             } else {
                return false;
             }
        },
        addRecipient(email) {
            if(this.validEmail(email)) {
                const t = {
                    name: email,
                    uuid: email.substring(0, 2) + Math.floor((Math.random() * 10000000))
                };
                this.channel.email_configuration.mail_to.push(email);
                this.recipients.push(email);     
            }
        },
        createNotificationChannel() {
            for(let field in ['created_at', 'updated_at', 'uuid', 'created_by', 'updated_by']) {
                delete this.channel[field];
            }
            this.$store.dispatch('createNotificationChannel', {data: this.channel})
                .then(resp => {
                    this.submitted = false;
                    this.dismiss();
                })
                .catch(err => {
                    this.submitted = false;
                    this.error = true;
                    this.error_message = err.message;
                });
        },
        editNotificationChannel() {
            let uuid = this.channel.uuid
            for(let field in ['created_at', 'updated_at', 'uuid', 'created_by', 'updated_by']) {
                delete this.channel[field];
            }
            this.$store.dispatch('editNotificationChannel', {uuid: uuid, data: this.channel})
                .then(resp => {
                    this.submitted = false;
                    this.dismiss();
                })
                .catch(err => {
                    this.submitted = false;
                    this.error = true;
                    this.error_message = err.message;
                });
        },
        nextStep() {
            this.step++;
        },
        previousStep() {
            this.step--;
        },
        dismiss() {
            this.modalStatus = false;
        }
    }
}

</script>