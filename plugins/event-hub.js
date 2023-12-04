import Vue from 'vue';

export default new Vue({
    data: {
        currentID: 0
    },
    methods: {
        getUniqueID(prefix) {
            this.currentID++;
            return 'app_' + prefix + this.currentID;
        }
    }
});
