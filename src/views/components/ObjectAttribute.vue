<template>
    <CRow style="margin-bottom: 16px">
        <CCol>
            <label><slot name="label">{{ label }}</slot></label><br>
            <slot name="value">{{ value }}</slot>
        </CCol>
    </CRow>
</template>

<script>
export default {
    name: "ObjectAttribute",
    props: {
        label: String,
        value: [Number, String]
    }
}
</script>