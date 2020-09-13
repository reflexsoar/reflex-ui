<template>
<div><link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
    <CModal title="Create Observables" :centered="true" size="lg" :show.sync="modalStatus">
      <div>
        CREATE THE OBSERVABLES
      </div>
      <template #footer>
          <CButton @click="dismiss()" color="secondary">Dismiss</CButton>
        <CButton @click="createObservables()" color="primary">Create</CButton>
      </template>
    </CModal>
</div>
</template>

<script>
import {vSelect} from "vue-select";
export default {
    name: 'AddObservableModal',
    props: {
        show: false
    },
    data(){
        return {
            value: "",
            dataType: "",
            selected_tags: Array(),
            case_template: "",
            ioc: false,
            spotted: false,
            modalStatus: this.show,
            tag_list: [],
            tags: Array
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
        }
    },
    created() {
        this.loadTags()
    },
    methods: {
        createObservables() {
            console.log('create observables')
        },
        loadTags: function() {
            this.tag_list = Array()
            this.$store.dispatch('getTags').then(resp => {
                for(let i in resp.data) {
                    this.tag_list.push({'name': resp.data[i].name, 'uuid': resp.data[i].uuid})
                }
            })},
        dismiss() {
            this.use_case_template = false
            this.modalStatus = false
            this.selected_tags = Array()
        },
        addTag(newTag) {
            const t = {
                name: newTag,
                uuid: ''
            }
            this.tag_list.push(t)
            this.selected_tags.push(t)
            console.log(this.selected_tags)
        }
    }
}
</script>