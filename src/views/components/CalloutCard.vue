<template>
  <CCard class="callout-card">
    <CCallout :color="color">
        <slot name="label">
            <label>{{ label }}</label>
            <br>
        </slot>
      <slot name="value"><strong class="h1"> {{ value }} </strong></slot>
    </CCallout>
  </CCard>
</template>

<style scoped>
.callout-card .c-callout {
    margin-top: 0px;
    margin-bottom: 0px;
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>

<script>
export default {
    name: "CalloutCard",
    props: {
        label: String,
        value: [String, Number],
        color: String
    }
}
</script>