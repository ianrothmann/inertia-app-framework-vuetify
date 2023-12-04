import AppFrameworkEventBus from './plugins/event-hub';
import {createPromiseHandler} from './common/promiseHandler';
import './common/prototypes';

export const AppFramework = {};

AppFramework.install = function (Vue, options) {
    Vue.component("app-framework", require('./AppFramework.vue').default);
    Vue.component("app-framework-auth-watcher", require('./authwatcher/AuthWatcher.vue').default);
    Vue.component("app-framework-menu", require('./menus/Menu.vue').default);
    Vue.component("app-framework-breadcrumbs", require('./breadcrumbs/Breadcrumbs.vue').default);
    Vue.component("app-framework-search-bar", require('./searchbar/SearchBar.vue').default);

    Vue.prototype.$snackbar = function (message, messageType, vertical, horizontal, duration) {
        let opt = {};
        opt.message = message;
        opt.messageType = messageType;
        opt.vertical = vertical;
        opt.horizontal = horizontal;
        opt.duration = duration;
        AppFrameworkEventBus.$emit('snackbar', opt);
    };

    Vue.prototype.$showLoader = function (message) {
        AppFrameworkEventBus.$emit('show_loader', message);
    };
    Vue.prototype.$hideLoader = function () {
        AppFrameworkEventBus.$emit('hide_loader');
    };
    Vue.prototype.$loaderStatus = function (message) {
        AppFrameworkEventBus.$emit('loader_status', message);
    };

    Vue.prototype.$addActivity = function (id) {
        AppFrameworkEventBus.$emit('add_activity', id);
    };
    Vue.prototype.$removeActivity = function (id) {
        AppFrameworkEventBus.$emit('remove_activity', id);
    };
    Vue.prototype.$activityProgress = function (progress) {
        AppFrameworkEventBus.$emit('activityProgress', progress);
    };

    Vue.prototype.$navigateRoute = function (route, params) {
        this.$inertia.visit(Vue.prototype.$route(route,params));
    };

    Vue.prototype.$navigate = function (href, target) {
        const l = document.createElement("a");
        l.href = href;

        if(window.location.hostname === l.hostname){
            this.$inertia.visit(href);
        }else{
            //Normal routing

            if (target) {
                setTimeout(() => {
                    window.open(href, target);
                }, 0);
            } else {
                setTimeout(() => {
                    location.href = href;
                }, 0);
                AppFrameworkEventBus.$emit('add_activity', 'loading');
                setTimeout(() => {
                    AppFrameworkEventBus.$emit('remove_activity', 'loading');
                }, 8000);
            }
        }
    };

    Vue.prototype.$getParam = function(name){
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    };

    Vue.prototype.$getCookie = function getCookieValue(a) {
        const b = document.cookie.match('(^|[^;]+)\\s*' + a + '\\s*=\\s*([^;]+)');
        return b ? b.pop() : '';
    };

    Vue.prototype.$formPost = function post(path, params, method='post') {

        const csrf_token=Vue.prototype.$getCookie('XSRF-TOKEN');

        const form = document.createElement('form');
        form.method = method;
        if(path)
            form.action = path;

        if(csrf_token){
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

    Vue.prototype.$dialog = function ({title, content, buttons = {ok: 'Ok'}, width = '40%', persistent = true, overlay = true}) {
        if (!title) {
            throw new Error('$dialog: The title parameter is required.')
        } else if (!content) {
            throw new Error('$dialog: The content parameter is required.')
        } else {
            let promise = createPromiseHandler(),
                opt = {title, content, buttons, width, persistent, overlay};
            opt.promise = promise;
            AppFrameworkEventBus.$emit('dialog', opt);
            return promise;
        }
    };

    Vue.prototype.$formDialog = function ({
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
                                          }) {
        if (!title) {
            throw new Error('$formDialog: The title parameter is required.')
        } else if (!content) {
            throw new Error('$formDialog: The content parameter is required.')
        } else if (!definition) {
            throw new Error('$formDialog: The definition parameter is required.')
        } else {
            let promise = createPromiseHandler(),
                opt = {title, content, definition, data, width, overlay, buttons};
            opt.promise = promise;
            // opt.persistent = true;
            AppFrameworkEventBus.$emit('formDialog', opt);
            return promise;
        }
    };
};


//Should this move to a typeHelpers.js file?
export const typeHelpers = {
    methods: {
        isObject(val) {
            return val instanceof Object;
        },
        isNullOrUndefined(val) {
            return val === null || typeof val === 'undefined';
        },
        coalesce(val, defaultvalue) {
            return this.isNullOrUndefined(val) ? defaultvalue : val;
        },
        hasProp(obj, key) {
            return this.isObject(obj) && obj.hasOwnProperty(key);
        },
        objProp(obj, key, defaultvalue) {
            return this.hasProp(obj, key) ? this.coalesce(obj[key], defaultvalue) : defaultvalue;
        },
        arrayRemoveItem(array, item) {
            let index = array.indexOf(item);
            if (index > -1) {
                array.splice(index, 1);
            }
        },
    }
};
