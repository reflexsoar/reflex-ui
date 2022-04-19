<template>
  <div>
    <link
      rel="stylesheet"
      href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css"
    />
    <CModal
      title="Edit Case Template"
      :centered="false"
      size="xl"
      :show.sync="modalStatus"
      :close-on-backdrop="false"
    >
      <CTabs
        :fade="false"
        variant="pills"
        :activeTab.sync="step"
        :vertical="{ navs: 'col-md-2', content: 'col-md-10' }"
      >
        <CTab title="1. Template Details">
            {{template}}
          <CForm @submit.prevent="createCase">
            <CInput
              placeholder="Case Template Title"
              required
              v-model="template.title"
              label="Case Title"
            >
            </CInput>
            <CTextarea
              placeholder="Enter a description for the case template.  The more detail the better."
              required
              v-model="template.description"
              label="Description"
              rows="5"
            >
            </CTextarea>
            <CRow>
              <CCol col="12" lg="6">
                <CSelect
                  label="TLP"
                  :options="tlps"
                  :value.sync="template.tlp"
                  placeholder="Select a TLP"
                >
                </CSelect>
              </CCol>
              <CCol col="12" lg="6">
                <CSelect
                  label="Severity"
                  :options="severities"
                  :value.sync="template.severity"
                  placeholder="Select a Severity"
                >
                </CSelect>
              </CCol>
            </CRow>
            <div role="group" class="form-group">
              <label class="typo__label">Tags</label>
              <multiselect
                v-model="template.tags"
                placeholder="Select tags to apply to this input"
                :taggable="true"
                tag-placeholder="Add new tag"
                track-by="name"
                label="name"
                :options="tag_list"
                :multiple="true"
                @tag="addTag"
                :close-on-select="false"
              >
              </multiselect>
            </div>
          </CForm>
        </CTab>
        <CTab title="2. Tasks">
          <h5>Tasks <CButton color="success" size="sm" handle=".handle" @click="addTask()"
            >+</CButton
          ></h5>
          <p>
            Adding tasks to a case template allows users to apply this template
            and immediately hit the ground running! Start by adding a few.
          </p>
          <CAlert :show.sync="taskError" color="danger" closeButton>
            {{ taskError }}
          </CAlert>
          <br /><br />
          <CListGroup>
            <draggable
              v-model="tasks"
              group="tasks"
              @start="drag = true"
              @end="drag = false"
            >
              <CListGroupItem v-for="task in tasks" :key="task.order">
                <div v-if="!task.saved">
                    {{task}}
                  <CRow>
                    <CCol col="1">
                      <CIcon style="margin-top: 10px" name="cil-menu" />
                    </CCol>
                    <CCol col="3">
                      <CInput placeholder="Title" v-model="task.title"></CInput
                      ><br />
                    </CCol>
                    <CCol>
                      <CInput
                        placeholder="Description"
                        v-model="task.description"
                      ></CInput>
                    </CCol>
                    <CCol col="2">
                      <CButton
                        @click="toggleEdit(tasks.indexOf(task))"
                        color="success"
                        size="sm"
                        >Save</CButton
                      >&nbsp;
                      <CButton
                        @click="removeTask(tasks.indexOf(task))"
                        color="danger"
                        size="sm"
                        >Remove</CButton
                      >
                    </CCol>
                  </CRow>
                </div>
                <div v-if="task.saved">
                  <CRow>
                    <CCol col="1">
                      <CIcon name="cil-menu" />
                    </CCol>
                    <CCol>
                      <b>{{ task.title }}</b
                      ><br />
                      {{ task.description }}
                    </CCol>
                    <CCol col="2">
                      <CButton
                        @click="toggleEdit(tasks.indexOf(task))"
                        color="info"
                        size="sm"
                        >Edit</CButton
                      >&nbsp;
                      <CButton
                        @click="removeTask(tasks.indexOf(task))"
                        color="danger"
                        size="sm"
                        >Remove</CButton
                      >
                    </CCol>
                  </CRow>
                </div>
              </CListGroupItem>
            </draggable>
          </CListGroup>
        </CTab>
        <CTab title="3. Review">
          <h5>Review</h5>
          <b>Title:</b> {{ template.title }}<br />
          <b>Description:</b><br /><br />{{ template.description }}<br />

          <br /><b>Tasks</b><br /><br />
          <CListGroup>
            <CListGroupItem v-for="task in tasks" :key="task.id">
              <b>{{tasks.indexOf(task)+1}}. {{ task.title }}</b><br>{{ task.description }}
            </CListGroupItem>
          </CListGroup>
          <br /><br />
          <b>Default Tags</b><br />
          <li
            style="display: inline; margin-right: 2px"
            v-for="tag in template.tags"
            :key="tag.name"
          >
            <CBadge
              color="info"
              size="sm"
              style="padding: 5px; margin-top: 10px; margin-right: 3px"
              >{{ tag.name }}</CBadge
            >
          </li>
        </CTab>
      </CTabs>
      <template #footer>
        <CButton @click="dismiss()" color="secondary">Cancel</CButton>
        <CButton v-if="step != 0" @click="previousStep()" color="info"
          >Previous</CButton
        >
        <CButton v-if="step != final_step" @click="nextStep()" color="primary"
          >Next</CButton
        >
        <CButton
          v-if="step == final_step"
          @click="updateCaseTemplate()"
          color="primary"
          >Update</CButton
        >
      </template>
    </CModal>
  </div>
</template>
<style scoped>
.handle {
  float: left;
  padding-left: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.list-group-item .form-group {
  margin-bottom: 0px !important;
}

.list-group-item .btn {
  margin-top: 2px;
}
</style>

<script>
import { vSelect } from "vue-select";
import draggable from "vuedraggable";
export default {
  name: "EditCaseTemplateModal",
  props: {
    show: Boolean,
    template: Array(),
  },
  components: {
    draggable,
  },
  data() {
    return {
      step: 0,
      task_id: 0,
      final_step: 2,
      title: "",
      description: "",
      selected_tags: Array(),
      use_case_template: false,
      case_template: "",
      tlp: 2,
      severity: 2,
      tasks: [],
      taskError: null,
      modalStatus: this.show,
      task_fields: ["title", "description", "save"],
      severities: [
        { label: "Low", value: 1 },
        { label: "Medium", value: 2 },
        { label: "High", value: 3 },
        { label: "Critical", value: 4 },
      ],
      tlps: [
        { label: "WHITE", value: 1 },
        { label: "GREEN", value: 2 },
        { label: "AMBER", value: 3 },
        { label: "RED", value: 4 },
      ],
      tag_list: [],
      tags: Array,
    };
  },
  watch: {
    show: function () {
      this.modalStatus = this.show;
    },
    modalStatus: function () {
      if (this.modalStatus) {
          Object.assign(this.tasks, this.template.tasks)
          for(let t in this.tasks) {
              this.tasks[t].saved = true
          }
        this.loadTags();
      }
      if (this.modalStatus == false) {
        this.reset();
      }
      this.$emit("update:show", this.modalStatus);
    },
  },
  created() {
    //this.loadTags()
    this.reset();
  },
  methods: {
    nextStep() {
      let error = false;
      this.taskError = null;
      if (this.step == 2) {
        for (let task in this.tasks) {
          if (this.tasks[task].saved == false) {
            error = true;
          }
        }

        if (error) {
          this.taskError = "Please save all tasks before proceeding.";
          return;
        }
      }

      this.step += 1;
    },
    previousStep() {
      this.step -= 1;
    },
    addTask() {
      this.tasks.push({
        title: "",
        description: "",
        group_uuid: null,
        owner_uuid: null,
        saved: false,
        id: this.task_id++,
      });
    },
    removeTask(id) {
        this.tasks.splice(id, 1)
    },
    toggleEdit(index) {
        let task = this.tasks[index]
        task.saved = !task.saved
        this.$set(this.tasks, index, task)
    },
    updateCaseTemplate() {
      let data = {
        title: this.template.title,
        organization: this.organization,
        description: this.template.description,
        tasks: [],
        severity: this.template.severity,
        tlp: this.tlp,
        tags: Array(),
      };

      // Make sure all the tasks are formatted in the format
      // that the API expects
      this.template.tasks = this.tasks
      for (let task in this.template.tasks) {
        delete this.template.tasks[task]["saved"];
        delete this.template.tasks[task]["id"];

        // Remove the group_uuid field if it is empty
        if (this.template.tasks[task]["group_uuid"]) {
          delete this.template.tasks[task]["group_uuid"];
        }

        // Remove the group_uuid field if it is empty
        if (this.template.tasks[task]["owner_uuid"]) {
          delete this.template.tasks[task]["owner_uuid"];
        }

        this.template.tasks[task]["order"] = task;
        data.tasks.push(this.template.tasks[task]);
      }

      // Format the tags the way that the API expects
      for (let tag in this.template.tags) {
        data.tags.push(this.template.tags[tag].name);
      }

      this.$store
        .dispatch("updateCaseTemplate", {
          uuid: this.template.uuid,
          data: data,
        })
        .then((resp) => {
          if (resp.status == 200) {
            this.modalStatus = false;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    loadTags: function () {
      this.tag_list = Array();
      this.$store.dispatch("getTags").then((resp) => {
        for (let i in resp.data) {
          this.tag_list.push({
            name: resp.data[i].name,
            uuid: resp.data[i].uuid,
          });
        }
      });
    },
    reset() {
      this.tasks = [];
      this.title = "";
      this.description = "";
      this.step = 0;
      this.selected_tags = Array();
      this.taskError = null;
    },
    dismiss() {
      this.modalStatus = false;
      this.reset();
    },
    addTag(newTag) {
      const t = {
        name: newTag,
        uuid: "",
      };
      this.tag_list.push(t);
      this.selected_tags.push(t);
    },
  },
};
</script>