<template>
    <div>
        <v-text-field
                transition="slide-x-transition"
                v-if="searchActive"
                v-model="searchText"
                flat
                solo-inverted
                hide-details
                prepend-inner-icon="search"
                label="Search"
                class="hidden-sm-and-down"
        ></v-text-field>
        <v-btn v-else icon @click="searchActive=!searchActive" :input-value="searchActive"><v-icon>search</v-icon></v-btn>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                searchActive : false,
                searchText : ''
            }
        },
        methods: {

        },
        mounted() {

        }
    }
</script>

<style scoped>

</style>