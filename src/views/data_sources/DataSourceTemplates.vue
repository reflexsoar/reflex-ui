<template>
    <div>
        <CRow class="page-heading page-heading-row page-heading-no-nav">
      <CCol>
        <h1>Data Source Templates<button
          type="button"
          class="kb"
          onclick="window.open('https://docs.reflexsoar.com/en/latest/data_source_templates')"
        >
          <CIcon name="cil-book" size="lg" />
        </button>
      </h1>
      </CCol>
    </CRow>
    <CRow>
        <CCol>
            <DataSourceTemplateList></DataSourceTemplateList>
        </CCol>
    </CRow>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import DataSourceTemplateList from '@/views/data_sources/TemplateList.vue';
import SelectInput from '../components/SelectInput.vue'

export default {
    name: 'DataSourceTemplates',
    components: {
        DataSourceTemplateList,
        SelectInput
    },
    data() {
        return {
            test: '',
            options: [
                {
                    label: 'test',
                    value: 'a'
                },
                {
                    label: 'test2',
                    value: 'b'
                },
                {
                    label: 'test3',
                    value: 'c'
                },{
                    label: 'test',
                    value: 'd'
                },
                {
                    label: 'test2',
                    value: 'e'
                },
                {
                    label: 'test3',
                    value: 'f'
                },{
                    label: 'test',
                    value: 'g'
                },
                {
                    label: 'test2',
                    value: 'h'
                },
                {
                    label: 'test3',
                    value: 'i'
                },
                {
                    label: 'Default Organization',
                    value: 'foo'
                }
            ]
        }
    },
    methods: {
    },
    mounted() {
    }
}
</script>