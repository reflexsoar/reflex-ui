<template>
    <div class="value-popover" v-if="show">
        <!-- We are going to create a popover that will show the value of the field and
        appear directly above the field value. -->
        I AM A POPOVER
    </div>
</template>

<style scoped>
.value-popover {
    /* Allow this item to be position relative to the window */
    position: absolute;
    
    background-color: white;
    border: 1px solid #888;
    padding: 5px;
    border-radius: 5px;
    z-index: 1003;
    margin-top: 10px;
}

.value-popover::before {
    /* Create a little triangle that points to the field value on the 
    top of the popover*/
    content: "";
    position: absolute;
    top: -10px;
    left: 5%;
    margin-left: -5px;
    border-width: 0 5px 10px;
    border-style: solid;
    border-color: #888 transparent;
    
}
</style>

<script>
export default {
    name: "ValuePopover",
    props: {
        value: {
            type: String,
            default: "",
        },
        field: {
            type: String,
            default: "",
        },
        show: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        copyValue(value, i, field) {
        }
    }
}
</script>
