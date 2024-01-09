<template>
    <div style='margin-bottom: 10px;'>
        <label class="switch">
            <input type="checkbox" :checked.sync="checked" v-on:change="$emit('update:checked', $event.target.checked)"/>
            <span class="slider round">
                <!--<span class="label-on" id="labelOn">{{ labelOn }}</span>-->
                <!--<span class="label-off" id="labelOff">{{ labelOff }}</span>-->
            </span>
        </label>
        <label class="switch-details">
            <span class="switch-label">{{ label }}</span><br>
            
        </label><br>
        <small class="text-muted">{{ description }}</small>
    </div>
</template>

<style scoped>
.switch {
    margin-top: 5px;
    position: absolute;
    display: inline-block;
    width: 50px;
    height: 26px;
}

input[type="checkbox"] {
    display: none;
}

.switch-details {
    margin-left: 60px;
    padding-top: 7px;
    font-weight: normal !important;
}

.switch-label {
    font-weight: bold;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f1f1f1;
    border: 1px solid #d8dbe0;
    -webkit-transition: .4s;
    transition: .4s;

}

.slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    border: 1px solid #d8dbe0;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked + .slider:after {
    position: absolute;
    line-height: 24px;
    margin-left: 5px;
    font-size: .8em;
    font-weight: normal;
    content: "On";
    color: #fff;
}

input:checked + .slider:before {
    border: 1px solid #248f48;
}

input:checked + .slider {
    background-color: #2eb85c;
    border-color: #248f48;
}

input:checked + .slider:before {
    -webkit-transform: translateX(24px);
    -ms-transform: translateX(24px);
    transform: translateX(24px);
}

.slider.round {
    border-radius: 5px;
}

.slider.round:before {
    border-radius: 2px;
}

</style>

<script>
export default {
    name: "RSwitch",
    props: {
        label: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        checked: {
            type: Boolean,
            default: false,
        },
        labelOn: {
            type: String,
            default: "On",
        },
        labelOff: {
            type: String,
            default: "Off",
        },
    }
};
</script>