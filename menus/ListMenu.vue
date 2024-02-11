<template>
  <v-list v-model:opened="openGroups" nav density="compact">
    <slot name="top"></slot>

    <template v-for="(menuItem, itemIndex) in items">

      <template v-if="!menuItem.items || menuItem.items.length ===0">
        <v-list-item :prepend-icon="menuItem.icon" :title="menuItem.label" link :value="getKey(menuItem)"
                     :active="currentRoute() === getKey(menuItem)"
                     color="primary"
                     @click.stop="navigate(menuItem)">
        </v-list-item>
      </template>

      <v-list-group v-if="menuItem.items && menuItem.items.length > 0" color="primary" :value="getKey(menuItem)">
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
            :title="subItem.label"
            :prepend-icon="subItem.icon"
            :value="getKey(subItem)"
            @click.stop="navigate(subItem)"
            :active="currentRoute() === getKey(subItem)"
            color="primary"
            link
        ></v-list-item>
      </v-list-group>
    </template>
    <slot></slot>
  </v-list>
</template>

<script>
import MenuComponentMixin from './MenuComponentMixin';
import menu from "./Menu.vue";

export default {
  computed: {
    menu() {
      return menu
    }
  },
  props: {
    state: {
      type: String,
    },
  },
  mixins: [MenuComponentMixin],
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
