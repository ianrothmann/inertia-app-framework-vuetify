<template>
    <div>
        <v-breadcrumbs :items="items" v-if="items.length > 0">
            <template v-slot:item="props">
                <v-breadcrumbs-item
                        @click.stop="navigate(props.item)"
                        :class="itemClasses(props.item)"

                >
                    {{ props.item.title }}
                </v-breadcrumbs-item>
            </template>
        </v-breadcrumbs>
    </div>
</template>

<script>
    export default {
        computed : {
            items(){
                return this.$page.props.$breadcrumbs || [];
            }
        },
        methods : {
            currentRoute(){
                return window.location.pathname;
            },
            navigate(item){
                this.$inertia.visit(this.getRoute(item));
            },
            getRoute(item){
                let url = item.url;
                const l = document.createElement("a");
                l.href = url;
                return l.pathname;
            },
            itemClasses(item){
                if(this.getRoute(item)!==this.currentRoute()){
                    return ['breadcrumb-item','primary--text'];
                }

                return [];
            }
        }
    }
</script>

<style scoped>
    .breadcrumb-item{
        cursor : pointer;
    }
</style>
