<template>
  <div>
    <CCard class="bucket" @click="toggleDetails()">
      <CIcon :name="iconName" style="margin-top:-1px; width: 14px; height: 14px;"/><template v-if="!noCount">&nbsp;{{ tags ? tags.length : 0 }}</template>
      
        <CCard class="tag-list" v-if="show_details">
          <CCardHeader class="small-header"><b>{{label}}</b></CCardHeader>
          <template v-if="!noCount">
          <CCardBody style="padding: 5px;">
          
            <template v-if="countOnly">
              {{ tags ? tags.length : 0 }}
            </template>
            <TagList v-if="!countOnly" :tags="tags" :tagIcon="false" :iconName="iconName" :tagColor="tagColor"/>
          
          </CCardBody>
          </template>
          
        </CCard>
      
    </CCard>
    
  </div>
</template>

<style scoped>
.bucket {
  padding-left: 8px;
  padding-right: 8px;
  padding-bottom: 1px;
  display: inline;
  cursor: pointer;
  text-align: center;
}

.tag-list {
  position: absolute;
  width: 250px;
  text-align: left;
  margin-top: 5px;
  display: block;
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
import TagList from "./TagList.vue";

export default {
  name: "TagBucket",
  components: {
    TagList,
  },
  props: {
    tags: Array,
    tagIcon: {
        type: Boolean,
        default: true
    },
    label: {
      type: String,
      default: "Tags",
    },
    iconName: {
      type: String,
      default: "cilTags"
    },
    tagColor: {
      type: String,
      default: "dark"
    },
    countOnly: {
      type: Boolean,
      default: false
    },
    noCount: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show_details: false,
    };
  },
  methods: {
    outsideClickHandler(e) {
      if(!this.$el.contains(e.target)) {
        this.show_details = false;
        document.removeEventListener('click', this.outsideClickHandler);
      }
    },
    toggleDetails() {
      if(!this.countOnly) {
        this.show_details = !this.show_details;
        if(this.show_details) {
          document.addEventListener('click', this.outsideClickHandler);
        }
      }
    }
  }
};
</script>
