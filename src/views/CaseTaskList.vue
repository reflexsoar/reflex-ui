<template>
    <div>
    <CListGroup flush v-if="this.tasks.length > 0">
        <CListGroupItem v-for="task in tasks" :key="task.title">
        <CRow>
            <CCol col="6">
            <b>{{task.title}}</b>
            <br />
            {{task.description}}
            </CCol>
            <CCol col="2"><b>Assigned To:</b><br> <span v-if="task.owner.username">{{task.owner.username}}</span><span v-else>Unassigned</span>
            </CCol>
            <CCol col="2"><CButton color="primary" size="sm" disabled>{{task.status | statusIcon}}</CButton></CCol>
            <CCol col="1" class="text-right">
            <CDropdown toggler-text="Actions" color="secondary" size="sm">
                <CDropdownItem>Assign to Me</CDropdownItem>
                <CDropdownItem @click="show_details[task.uuid] = true">View Notes</CDropdownItem>
                <CDropdownItem @click="task.show = false">Hide Notes</CDropdownItem>
                <CDropdownDivider />
                <CDropdownItem>Complete</CDropdownItem>
                <CDropdownItem @click="deleteEventModal = !deleteEventModal">Delete</CDropdownItem>
            </CDropdown>
            </CCol>
        </CRow>
        <CCollapse :show.sync="show_details[task.uuid]">
            <CRow>
            <CCol>
                <br />
                <b>Description:</b>
                <br />
                {{task.description}}
                <br />
                <br />
                <CCard>
                <CCardBody>NOTES HERE</CCardBody>
                </CCard>
            </CCol>
            </CRow>
        </CCollapse>
        </CListGroupItem>
    </CListGroup>
    <CCardBody v-else>No tasks</CCardBody>
    </div>
</template>

<script>
import { vSelect } from "vue-select";
export default {
  name: "CaseTaskList",
  props: {
    tasks: Array,
  },
  data() {
      return {
          show_details: []
      }
  },
  filters: {
      statusIcon(status) {
          switch(status) {
              case 0: return 'Open';
              case 1: return 'In Progress';
              case 2: return 'Closed';
          }
      }
  }
};
</script>
