<template>
    <component v-if="menu" :is="menuComponent" :items="menu.items || []" :icon="menu.icon" :label="menu.label" :state="state">
        <template v-slot:top>
            <slot name="top"></slot>
        </template>
        <slot></slot>
    </component>
</template>

<script>
    import MainMenu from './ListMenu.vue'
    import DropMenu from './DropMenu.vue'

    export default {
        props : {
            id : {type:String},
            type : {type:String, default:'list'},
            state: {type: String},
        },
        components: {
            'app-list-menu': MainMenu,
            'app-drop-menu': DropMenu,
        },
        watch:{

        },
        computed : {
            menu(){
                if(!this.$page.props.$menus){
                    return null;
                }

                const menu=this.$page.props.$menus[this.id];
                if(!menu){
                    return null;
                }
                return menu;
            },
            menuComponent(){
                if(this.type === 'list'){
                    return 'app-list-menu';
                }else if(this.type==='drop'){
                    return 'app-drop-menu';
                }
            }
        },
        mounted(){

        },
        methods:{

        }
    }
</script>

<style scoped>

</style>
