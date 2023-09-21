<template>
    <div>
        <CRow>
            <CCol>
                <h2 class="page-sub-header">Templates</h2>
            </CCol>
            <CCol class="text-right">
                <CButton color="primary" @click="newTemplate()">New Template</CButton>
            </CCol>
        </CRow>
        <CRow>
            <CCol>
                <CCard>
                <CDataTable
                    :items="data_source_templates"
                    :fields="[{key: 'name', label:'Name', _style:'width: 60%'},'sources', {key: 'actions', label:''}]"
                    :loading="loading"
                    >
                    <template #name="{item}">
                        <td>
                            <b>{{item.name}}</b><br>
                            {{ item.description }}
                        </td>
                    </template>
                    <template #sources="{item}">
                        <td>
                            <span v-for="source, i in item.sources" :key="i">
                                <CBadge class="tag" size="sm" color="info">{{source.name}}</CBadge>
                            </span>
                        </td>
                    </template>
                    <template #active="{item}">
                        <td>
                            <CBadge class="tag" size="sm" v-if="item.active" color="success">Active</CBadge>
                            <CBadge class="tag" size="sm" v-else color="danger">Inactive</CBadge>
                        </td>
                    </template>
                    <template #actions="{item}">
                        <td class="text-right">
                            <CButton color="primary" size="sm" @click="editTemplate(item.uuid)"><CIcon name="cilPencil"/></CButton>&nbsp;
                            <CButton color="danger" size="sm" @click="deleteTemplate(item.uuid)"><CIcon name="cilTrash"/></i></CButton>
                        </td>
                    </template>
                </CDataTable>
                </CCard>
            </CCol>
        </CRow>
        <DataSourceTemplateWizard :show.sync="show_wizard" :mode="wizard_mode" :source_template="template"></DataSourceTemplateWizard>
        <CModal :show.sync="show_delete_confirmation" title="Confirm Delete" color="danger">
            <p>Are you sure you want to delete the template <b>{{ target_template.name }}</b>? If yes, enter the template name in the field below.</p>
            <CInput v-model="delete_confirm" placeholder="Enter the template name"></CInput>
            <template #footer>
                <CButton color="danger" @click="confirmDelete(template.uuid)" v-bind:disabled="delete_confirm != target_template.name">Delete</CButton>
                <CButton color="secondary" @click="cancelDelete()">Cancel</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import DataSourceTemplateWizard from './DataSourceTemplateWizard.vue'

export default {
    name: 'DataSourceTemplateList',
    components: {
        DataSourceTemplateWizard
    },
    computed: {
        ...mapState(['data_source_templates', 'current_user'])
    },
    data() {
        return {
            templates: [],
            template: {},
            show_wizard: false,
            wizard_mode: 'create',
            loading: false,
            target_template: {},
            delete_confirm: "",
            show_delete_confirmation: false
        }
    },
    methods: {
        getTemplates: function() {
            this.loading = true;
            this.$store.dispatch('getDataSourceTemplates').then(resp => {
                this.loading = false
            })
        },
        newTemplate() {
            this.wizard_mode = 'create';
            this.template = {
                name: '',
                description: '',
                sources: [],
                organization: "",
                is_global: false
            }
            this.show_wizard = true;
        },
        editTemplate(uuid) {
            this.wizard_mode = 'edit';
            this.template = this.data_source_templates.find(function(template) {
                return template.uuid == uuid
            })
            this.show_wizard = true;
        },
        deleteTemplate(uuid) {
            this.target_template = this.data_source_templates.find(function(template) {
                return template.uuid == uuid
            })
            this.delete_confirm = ""
            this.show_delete_confirmation = true
        },
        confirmDelete() {
            if(this.delete_confirm == this.target_template.name) {
                this.loading = true;
                this.$store.dispatch('deleteDataSourceTemplate', this.target_template.uuid).then(resp => {
                    this.loading = false;
                    this.cancelDelete();
                })
            }
        },
        cancelDelete() {
            this.show_delete_confirmation = false
            this.target_template = {}
        }
    },
    mounted() {
        this.getTemplates()
    }
}
</script>