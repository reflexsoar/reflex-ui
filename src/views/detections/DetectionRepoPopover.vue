<template>
  <div>
    <CCard class="bucket" @click="toggleDetails()">
      <CIcon name="cilStorage" style="margin-top:-1px; width: 14px; height: 14px;"/> {{ repositories.length }}
      <CCard class="info" v-if="show_details" size="sm">
        <CCardHeader class="small-header"><b>Repositories</b></CCardHeader>
        <CCardBody style="padding: 5px;">
          <TagList :tags="repos" :tagIcon="false"/>
        </CCardBody>
    </CCard>
    </CCard>
    
  </div>
</template>

<style scoped>
.bucket {
  position: relative;
  width: 200px;
  padding-left: 8px;
  padding-right: 8px;
  padding-bottom: 1px;
  display: inline;
  cursor: pointer;
  text-align: center;
}

.info {
  position: absolute;
  text-align: left;
  margin-top: 5px;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);
  border: 1px solid #cfcfcf;
  border-radius: 3px;
  z-index: 1002;
}

.small-header {
  padding-top:5px;
  padding-left: 5px;
  padding-bottom: 5px;
}
</style>

<script>

import { mapState } from 'vuex';

import TagList from "../components/TagList.vue";

export default {
  name: "DetectionRepoPopover",
  props: {
    repositories: Array,
  },
  components: {
    TagList,
  },
  data() {
    return {
      show_details: false,
    };
  },
  computed: {
    ...mapState(['detection_repositories']),
    repos() {
      return this.detection_repositories.filter(repo => this.repositories.includes(repo.uuid)).map(repo => repo.name)
    }
  },
  methods: {
    outsideClickHandler(e) {
      if(!this.$el.contains(e.target)) {
        this.show_details = false;
        document.removeEventListener('click', this.outsideClickHandler);
      }
    },
    toggleDetails() {
      this.show_details = !this.show_details;
      if(this.show_details) {
        document.addEventListener('click', this.outsideClickHandler);
      }
    }
  }
};
</script>
