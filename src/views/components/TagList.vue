<template>
  <div>
    <CIcon name="cilTags" />&nbsp;
    <li style="display: inline; margin-right: 2px" v-for="tag, i in tags" :key="i">
      <CBadge color="dark" class="tag tag-list" size="sm">
        {{ label === null ? tag : tag[label] }}</CBadge>
    </li>
  </div>
</template>

<script>
export default {
  name: "TagList",
  props: {
    tags: Array,
    tagIcon: {
        type: Boolean,
        default: true
    },
    label: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      show_details: false,
    };
  },
  methods: {
    toggleDetails() {
      this.show_details = !this.show_details;
    },
  },
};
</script>
