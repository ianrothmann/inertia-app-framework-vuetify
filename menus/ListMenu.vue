<template>
  <v-list v-model:opened="openGroups" nav  :lines="false">
    <slot name="top"></slot>
    <template v-for="(menuItem, itemIndex) in items" :key="itemIndex">
      <template v-if="!menuItem.items || menuItem.items.length === 0">
        <v-list-item
            :prepend-icon="menuItem.icon"
            link
            :value="getKey(menuItem)"
            :active="currentRoute() === getKey(menuItem)"
            color="primary"
            @click.stop="navigate(menuItem)"
        >
          <v-list-item-title v-text="menuItem.label"></v-list-item-title>
          <template v-if="menuItem.options&&menuItem.options.badge" v-slot:append>
            <v-badge :content="menuItem.options.badge" color="red" inline bordered></v-badge>
          </template>
        </v-list-item>
      </template>

      <v-list-group v-else color="primary" :value="getKey(menuItem)">
        <template v-slot:activator="{ props }">
          <v-list-item
              v-bind="props"
              :prepend-icon="menuItem.icon"
              :title="menuItem.label"
          ></v-list-item>
        </template>
        <v-list-item
            class="sub-item"
            v-for="(subItem, subIndex) in menuItem.items"
            :key="subIndex"
            :title="subItem.label"
            :prepend-icon="subItem.icon"
            :value="getKey(subItem)"
            @click.stop="navigate(subItem)"
            :active="currentRoute() === getKey(subItem)"
            color="primary"
            link
        >
          <template v-if="subItem.options&&subItem.options.badge" v-slot:append>
            <v-badge :content="subItem.options.badge" color="red" overlap inline bordered></v-badge>
          </template>
        </v-list-item>
      </v-list-group>
    </template>

    <slot></slot>
  </v-list>
</template>

<script>
import MenuComponentMixin from './MenuComponentMixin';
import menu from "./Menu.vue";

export default {
  mixins: [MenuComponentMixin],
  props: {
    state: String,
  },
  data() {
    return {
      menu: menu,
    };
  },
  mounted() {
    this.setOpenGroups();
  },
}
</script>

<style scoped>
.sub-item {
  padding-inline-start: 20px !important;
}
</style>
