import { reactive, readonly } from 'vue';

const state = reactive({
    events: {}
});

const EventBus = {
    $on(eventName, callback) {
        if (!state.events[eventName]) {
            state.events[eventName] = [];
        }
        state.events[eventName].push(callback);
    },

    $emit(eventName, ...args) {
        if (state.events[eventName]) {
            state.events[eventName].forEach(callback => callback(...args));
        }
    },

    $off(eventName, callback) {
        if (state.events[eventName]) {
            const index = state.events[eventName].indexOf(callback);
            if (index > -1) {
                state.events[eventName].splice(index, 1);
            }
        }
    }
};

export default readonly(EventBus);
