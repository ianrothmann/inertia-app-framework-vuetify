import AppFrameworkEventBus from './plugins/event-hub';
import {createPromiseHandler} from './common/promiseHandler';
import './common/prototypes';
import AppFramework from './AppFramework.vue';
import AuthWatcher from './authwatcher/AuthWatcher.vue';
import Menu from './menus/Menu.vue';
import Breadcrumbs from './breadcrumbs/Breadcrumbs.vue';
import SearchBar from './searchbar/SearchBar.vue';

const AppFrameworkPlugin = {
    install: (app, options) => {
        app.component("app-framework", AppFramework);
        app.component("auth-watcher", AuthWatcher);
        app.component("framework-menu", Menu);
        app.component("app-framework-breadcrumbs", Breadcrumbs);
        app.component("app-framework-search-bar", SearchBar);

        // Replacing Vue.prototype with app.config.globalProperties in Vue 3
        app.config.globalProperties.$snackbar = (message, messageType, vertical, horizontal, duration) => {
            let opt = {message, messageType, vertical, horizontal, duration};
            AppFrameworkEventBus.$emit('snackbar', opt);
        };

        app.config.globalProperties.$showLoader = (message) => {
            AppFrameworkEventBus.$emit('show_loader', message);
        };

        app.config.globalProperties.$hideLoader = () => {
            AppFrameworkEventBus.$emit('hide_loader');
        };

        app.config.globalProperties.$loaderStatus = (message) => {
            AppFrameworkEventBus.$emit('loader_status', message);
        };

        app.config.globalProperties.$addActivity = (id) => {
            AppFrameworkEventBus.$emit('add_activity', id);
        };

        app.config.globalProperties.$removeActivity = (id) => {
            AppFrameworkEventBus.$emit('remove_activity', id);
        };

        app.config.globalProperties.$activityProgress = (progress) => {
            AppFrameworkEventBus.$emit('activity_progress', progress);
        };

        app.config.globalProperties.$navigateRoute = (route, params) => {
            // Adapt to Vue Router 4 API
            app.config.globalProperties.$router.push({name: route, params});
        };

        app.config.globalProperties.$navigate = (href, target) => {
            // Adapted for Vue Router 4 or other routing libraries
        };

        app.config.globalProperties.$getParam = (name) => {
            const url = new URL(window.location.href);
            return url.searchParams.get(name);
        };

        app.config.globalProperties.$getCookie = (name) => {
            const b = document.cookie.match('(^|[^;]+)\\s*' + name + '\\s*=\\s*([^;]+)');
            return b ? b.pop() : '';
        };

        app.config.globalProperties.$formPost = (path, params, method = 'post') => {
            const csrf_token = app.config.globalProperties.$getCookie('XSRF-TOKEN');
            const form = document.createElement('form');
            form.method = method;
            if (path) form.action = path;
            if (csrf_token) {
                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = '_token';
                hiddenField.value = csrf_token;
                form.appendChild(hiddenField);
            }
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    const hiddenField = document.createElement('input');
                    hiddenField.type = 'hidden';
                    hiddenField.name = key;
                    hiddenField.value = params[key];
                    form.appendChild(hiddenField);
                }
            }
            document.body.appendChild(form);
            form.submit();
        };

        app.config.globalProperties.$dialog = ({
                                                   title,
                                                   content,
                                                   buttons = {ok: 'Ok'},
                                                   width = '40%',
                                                   persistent = true,
                                                   overlay = true
                                               }) => {
            let promise = createPromiseHandler(),
                opt = {title, content, buttons, width, persistent, overlay};
            opt.promise = promise;
            AppFrameworkEventBus.$emit('dialog', opt);
            return promise;
        };

        app.config.globalProperties.$formDialog = ({
                                                       title,
                                                       content,
                                                       definition,
                                                       data = {},
                                                       buttons = {
                                                           save: {
                                                               label: 'Save',
                                                               validate: true,
                                                               color: 'primary'
                                                           },
                                                           cancel: {
                                                               label: 'Cancel',
                                                               color: 'secondary'
                                                           }
                                                       },
                                                       width = '50%',
                                                       overlay = true
                                                   }) => {
            let promise = createPromiseHandler(),
                opt = {title, content, definition, data, width, overlay, buttons};
            opt.promise = promise;
            AppFrameworkEventBus.$emit('formDialog', opt);
            return promise;
        };
    }
};

export default AppFrameworkPlugin;

