<template>
  <div>
    <CIcon name="cilTags" />&nbsp;
    <li style="display: inline; margin-right: 2px" v-for="tag in tags" :key="tag">
      <CBadge color="dark" class="tag tag-list" size="sm">{{ tag }}</CBadge>
    </li>
  </div>
</template>

<script>
export default {
  name: "TagList",
  props: {
    tags: Object,
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
