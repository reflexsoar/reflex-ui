<template>
  <CDataTable
    :hover="hover"
    :items="observables"
    :fields="observable_fields"
    :items-per-page="small ? 25 : 10"
    bordered
    striped
    pagination
  >
    <template #value="{item}">
      <td style="min-width:200px; max-width:300px;">
        <span
          v-c-tooltip="{content: `${item.value}`, placement:'bottom', appendToBody:'true'}"
        >{{item.value | defang | truncate}}</span><br>
        <li style="display: inline; margin-right: 2px;" v-for="tag in item.tags" :key="tag.name">
          <CBadge color="info" size="sm" style="padding: 5px; margin-top:10px; margin-right:3px;">{{ tag.name }}</CBadge>
        </li>
        
      </td>
    </template>
    <template #type="{item}">
      <td>{{item.dataType.name}}</td>
    </template>
    <template #ioc="{item}">
      <td>
        <CSwitch
          style="padding-top:3px"
          color="danger"
          label-on="Yes"
          label-off="No"
          :checked.sync="item.ioc"
          v-bind:disabled="item.safe"
        />
      </td>
    </template>
    <template #spotted="{item}">
      <td>
        <CSwitch
          style="padding-top:3px"
          color="danger"
          label-on="Yes"
          label-off="No"
          :checked.sync="item.spotted"
        />
      </td>
    </template>
    <template #safe="{item}">
      <td>
        <CSwitch
          style="padding-top:3px"
          color="success"
          label-on="Yes"
          label-off="No"
          :checked.sync="item.safe"
          v-bind:disabled="item.ioc"
        />
      </td>
    </template>
    <template #count="{item}">
      <td v-if="observableStats(item.value) > 1">{{observableStats(item.value)}}</td>
      <td v-else>1</td>
    </template>
    <template #actions="{item}">
      <td>
        <CDropdown toggler-text="Actions" color="secondary" size="sm">
          <CDropdownItem @click="runPlaybookModal = !runPlaybookModal">Execute Action</CDropdownItem>
          <CDropdownDivider />
          <CDropdownItem @click="deleteObservableModal = !deleteObservableModal">Delete</CDropdownItem>
        </CDropdown>
      </td>
    </template>
  </CDataTable>
</template>

<script>
export default {
  name: "ObservableList",
  props: {
    observables: Array,
    events: Array,
    observable_fields: {
        type: Array,
        default () {
            return ['value', 'ioc', 'spotted', 'safe', 'count', 'type', 'actions']
        }
    }
  },
  data() {
    return {
      runPlaybookModal: false,
      deleteObservableModal: false,
      hover: true,
      small: true
    };
  },
  methods: {
    observableStats(uuid) {
        let observables = Array()
        for(let evt in this.events) {
            for(let obs in this.events[evt].observables) {
                let observable = this.events[evt].observables[obs]
                if(observable.value in observables) {
                    observables[observable.value] += 1
                } else {
                    observables[observable.value] = 1
                }
            }
        }
        return observables[uuid]
    },
    uncheckSafe(item) {
        console.log('TEST')
        if(item.ioc) {
            item.safe = false
        }
    }
  },
  filters: {
      truncate: function (value) {
        let maxLength = 50
        if (!value) return ''
        value = value.toString()
        if (value.length > maxLength) {
            return value.substring(0,maxLength) + "..."
        } else {
            return value.substring(0,maxLength)
        }
        
    },
    defang: function(value) {
        return value.replace(':','[:]').replace('http','hxxp').replace('.','[.]')
    }
  }
};
</script>