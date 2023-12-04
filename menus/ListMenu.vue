<template>
    <v-list
        dense
        nav
    >
        <slot name="top"></slot>
        <v-list-item-group :value="currentRoute()">
            <template  v-for="(menuItem, menuItemIndex) in items">
                <v-list-item
                    v-if="!menuItem.items"
                    :value="getKey(menuItem)"
                    link
                    @click="navigate(menuItem)"
                >
                    <v-list-item-icon v-if="menuItem.icon">
                        <v-badge
                            class="ma-0"
                            dot
                            offset-y="4"
                            offset-x="-2"
                            :value="state === 'closed' && showBadge(menuItem)"
                            v-bind="Object.assign({}, defaultBadgeOptions, (menuItem.options || {}).badge)"
                        >
                            <v-icon>
                                {{menuItem.icon}}
                            </v-icon>
                        </v-badge>
                    </v-list-item-icon>

                    <v-list-item-content style="overflow: visible;">
                        <v-list-item-title style="overflow: visible;">
                            <v-badge
                                class="ma-0"
                                v-bind="Object.assign({}, defaultBadgeOptions, (menuItem.options || {}).badge)" :value="state === 'open' && showBadge(menuItem)">
                                {{menuItem.label}}
                            </v-badge>
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-group
                    v-if="menuItem.items && menuItem.items.length > 0"
                    :value="hasChildSelected(menuItem)"
                    @click="$set(openGroups, menuItemIndex, !openGroups[menuItemIndex])"
                >
                    <template v-slot:prependIcon>
                        <v-badge
                            class="ma-0"
                            dot
                            :color="detectGroupColor(menuItem)"
                            offset-y="4"
                            offset-x="-2"
                            :value="hasItemWithBadge(menuItem) && !openGroups[menuItemIndex]">
                            <v-icon>
                                {{menuItem.icon}}
                            </v-icon>
                        </v-badge>
                    </template>
                    <template v-slot:activator>
                        <v-list-item-content>
                            <v-list-item-title>
                                {{menuItem.label}}
                            </v-list-item-title>
                        </v-list-item-content>
                    </template>
                    <v-list-item
                        v-for="(subMenuItem,idx) in menuItem.items"
                        :key="idx"
                        :value="getKey(subMenuItem)"
                        link
                        @click.stop="navigate(subMenuItem);"
                        :style="state === 'closed' ? {overflow: 'visible'} : {}"
                    >
                        <v-list-item-icon v-if="subMenuItem.icon" style="transition: padding-left 0.2s" :class="{'pl-4':state=='open', 'pl-0':state=='closed'}">
                            <v-badge
                                class="ma-0"
                                dot
                                offset-y="4"
                                offset-x="-2"
                                :value="state === 'closed' && showBadge(subMenuItem)"
                                v-bind="Object.assign({}, defaultBadgeOptions, (subMenuItem.options || {}).badge)"
                            >
                                <v-icon>
                                    {{subMenuItem.icon}}
                                </v-icon>
                            </v-badge>
                        </v-list-item-icon>

                        <v-list-item-content style="overflow: visible;">
                            <v-list-item-title style="overflow: visible;">
                                <v-badge
                                    class="ma-0"
                                    v-bind="Object.assign({}, defaultBadgeOptions, (subMenuItem.options || {}).badge)"
                                    :value="showBadge(subMenuItem)"
                                >
                                    {{subMenuItem.label}}
                                </v-badge>
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-group>
            </template>
        </v-list-item-group>
        <slot></slot>
    </v-list>

</template>

<script>
    import MenuComponentMixin from './MenuComponentMixin';

    export default {
        mixins : [MenuComponentMixin],
        props : {
            state: {
                type: String,
            },
        },
        data(){
            return {
                defaultBadgeOptions: {
                    offsetY: 8,
                    offsetX: -2,
                    color: 'red'
                },
            }
        },
        methods: {
            hasItemWithBadge(menuItem) {
                return !!menuItem.items.find(item => this.showBadge(item));
            },
            showBadge(menuItem) {
                const options = menuItem.options || {};
                return options.badge !== undefined && !!options.badge.content;
            },
            detectGroupColor(menuItem) {
                let color, options;
                const counts = menuItem.items.reduce((counts, item) => {
                    options = item.options || {};
                    color = (options.badge && options.badge.color) ? options.badge.color : null;
                    if(color) {
                        if(counts[color] !== undefined) {
                            counts[color]++;
                        }
                        else{
                            counts[color] = 1;
                        }
                    }
                    return counts;
                }, {});
                const max = Math.max(...Object.values(counts));
                return Object.keys(counts).find(color => counts[color] === max);
            }
        },
        mounted(){
            this.setOpenGroups();
        }
    }
</script>

<style scoped>

</style>
