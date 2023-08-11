<template>
    <span>
        <span v-if="date">
            <span v-if="format">
                {{ date | moment(format) }}
            </span>
            <span v-else>
                {{ date | moment('from', 'now')}}
            </span>
        </span>
        <span v-else>
            Never
        </span>
    </span>
</template>

<script>

export default {
    name: 'RMoment',
    props: {
        date: {
            type: String,
            default: null,
        },
        format: {
            type: String,
            default: null,
        },
        missing_date_text: {
            type: String,
            default: "Never",
        }
    },
};
</script>