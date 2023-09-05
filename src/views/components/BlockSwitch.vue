<template>
    <div style='margin-bottom: 10px;'>
        <label class="switch" >
            <input type="checkbox" id="switch" :checked.sync="checked" v-on:change="$emit('update:checked', $event.target.checked); $emit('change', $event)"/>
            <span for="switch" class="slider round" data-on="Enabled" data-off="Disabled">
                <span class="label-off" id="labelOff"><slot name="labelOff">{{ labelOff }}</slot></span>
                <span class="label-on" id="labelOn"><slot name="labelOn">{{ labelOn }}</slot></span>
            </span>
        </label>
        <label class="switch-details">
            <span class="switch-label">{{ label }}</span><br>
            {{ description }}
        </label>
    </div>
</template>

<style scoped>
.switch {
    margin-top: 5px;
    position: relative;
    display: block;
    max-height: 42px !important;
    height: 42px;
}

.switch-details {
    margin-left: 60px;
    font-weight: normal !important;
    display: none;
}

.switch-label {
    font-weight: bold;
}

.label-on {
    display: inline-block;
    position: absolute;
    width: 50%;
    text-align: center;
    padding-top: 8px;
    font-weight: normal;
    transform: translateX(calc(100% - 4px));
}

.label-off {
    display: inline-block;
    position: absolute;
    width: 50%;
    text-align: center;
    padding-top: 8px;
    transform: translateX(0px);
}

input:checked + .slider .label-off {
    font-weight: normal !important;
}

input:checked + .slider .label-on {
    font-weight: inherit;
    /*color: white;*/
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
    -webkit-transition: 0.4s;
    transition: 0.4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 90%;
    width: 50%;
    left: 2px;
    bottom: 2px;
    border: 1px solid #d8dbe0;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
}

input[type="checkbox"] + .slider:after {
    margin-top: 8px;
    position: absolute;
    font-weight: normal;
}

/*
input:checked + .slider:before {    
    border: 1px solid #248f48; 
    background-color: #2eb85c;
}*/

input:checked + .slider:before {
    -webkit-transform: translateX(24px);
    -ms-transform: translateX(24px);
    transform: translateX(calc(100% - 4px));
}

.slider.round {
    border-radius: 5px;;
}

.slider.round:before {
    border-radius: 2px;
}

</style>

<script>
export default {
    name: 'RBlockSwitch',
    props: {
        checked: Boolean,
        label: String,
        description: String,
        labelOn: {
            type: String,
            default: 'On'
        },
        labelOff: {
            type: String,
            default: 'Off'
        }
    }
}
</script>