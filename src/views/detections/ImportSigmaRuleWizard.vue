<template>
    <div><CModal title="Import Sigma Rule" size="xl" :show.sync="modalStatus">
        <template #header>
            <h5 style="text-transform: capitalize">Import Sigma Rule</h5>
            <span class="text-right">
                    <button type="button" aria-label="Close" class="close" @click="dismiss()">
                        ×
                    </button>
                    <button type="button" class="kb" aria-label="Documentation"
                        onclick="window.open('https://docs.reflexsoar.com/en/latest/detections')">
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
                    <CTabs
              :fade="false"
              variant="pills"
              :activeTab.sync="step"
              :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
            >
                        <CTab title="Sigma Rule">
                            <h4>Sigma Rule</h4>
                            <prism-editor
                  rows="10"
                  class="my-editor"
                  v-model="sigma_rule"
                  :highlight="highlighter"
                  line-numbers
                  aria-label="Sigma Rule"
                ></prism-editor>
                        </CTab>
                        <CTab title="Sigma Config">
                            <CSelect :value.sync="backend" :options="['opensearch','elasticsearch']" placeholder="Select a backend" label="Backend"></CSelect>
                            <CSelect :value.sync="pipeline" :options="['ecs_windows']" placeholder="Select a pipeline" label="Pipeline"></CSelect>
                            <CButton color="primary" @click="importRule()">Test</CButton>
                        </CTab>
                        <CTab title="Review">
                            <pre>{{this.rule}}</pre>
                        </CTab>
                    </CTabs>
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    
                </CCol>
            </CRow>
            <CRow>
                <CCol>
                    
                </CCol>
            </CRow>
        </div>
    </CModal>
</div>
</template>

<style>
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  /*background: #fdfdfd;*/
  background: #fdfdfd !important;
  color: #ccc;
  border: 1px solid rgb(216, 219, 224);
  border-radius: 0.25rem;
  box-shadow: inset 0 1px 1px rgb(0 0 21 / 8%);

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  height:400px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>

<script>
import { mapState } from "vuex";
import MonacoEditor from 'monaco-editor-vue';
import { PrismEditor } from 'vue-prism-editor'
import { highlight, languages } from 'prismjs/components/prism-core';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles

export default {
    name: 'ImportSigmaRuleWizard',
    components: {
        MonacoEditor,
        PrismEditor
    },
    props: {
        show: Boolean,
        rule: {
            Object,
            default: {}
        }
    },
    watch: {
        show: function () {
            this.error = false;
            this.error_message = "";
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
    computed: mapState(['settings', 'current_user']),
    data() {
        return {
            error: false,
            error_message: '',
            modalStatus: this.show,
            submitted: false,
            sigma_rule: '',
            backend: null,
            pipeline: null,
            step: 0
        }
    },
    methods: {
        onFileChange(x) {
            console.log(x)
        },
        dismiss() {
            this.error = false
            this.error_message = ""
            this.modalStatus = false
        },
        highlighter(code) {
            return highlight(code, languages.yaml, 'yaml');
        },
        importRule() {
            let data = {
                'sigma_rule': encodeURIComponent(this.sigma_rule),
                'backend': this.backend,
                'pipeline': this.pipeline
            }
            this.$store.dispatch('importSigmaRule', data).then((response) => {
                this.rule = response.data
                this.step = 2
            }).catch((error) => {
                this.error = true
                this.error_message = error
            })
        }
    }
}

</script>