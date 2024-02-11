<template>
    <v-menu offset-y>
        <template v-slot:activator="{ props }">
            <v-btn
                    v-bind="props"
                    text
                    :icon="!!icon"
            >
                <v-icon v-if="icon">{{icon}}</v-icon>
                <span v-else>{{label}}</span>
            </v-btn>
        </template>
        <app-list-menu :items="items">
            <template v-slot:top>
                <slot name="top"></slot>
            </template>
            <slot></slot>
        </app-list-menu>
    </v-menu>

</template>

<script>
    import MenuComponentMixin from './MenuComponentMixin';
    import ListMenu from './ListMenu.vue'
    export default {
        mixins : [MenuComponentMixin],
        props : {
            label : {type:String},
            icon : {type:String},
        },
        components : {
            'app-list-menu': ListMenu,
        },
        mounted(){

        }
    }
</script>

<style scoped>

</style>
