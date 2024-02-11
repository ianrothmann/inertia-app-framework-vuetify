<template>
    <div class="app-framework">
        <v-snackbar
            :timeout="snackbar.duration"
            :top="snackbar.vertical === 'top'"
            :bottom="snackbar.vertical === 'bottom'"
            :right="snackbar.horizontal === 'right'"
            :left="snackbar.horizontal === 'left'"
            v-model="showSnackbar"
            :multi-line="true"

        >
            <div v-html="snackbar.message"></div>
            <template v-slot:action="{ attrs }">
                <v-btn
                    :class="[snackbar.messageType+'--text']"
                    text
                    v-bind="attrs"
                    @click.native="showSnackbar = false"
                >
                    OK
                </v-btn>
            </template>
        </v-snackbar>
        <v-progress-linear
            :active="showActivity && !showLoader"
            :indeterminate="activityIndeterminate"
            absolute
            top
            color="info"
            v-model="activityLoaderProgress"
        ></v-progress-linear>
        <v-dialog
            v-model="showLoader"
            persistent
            width="300"
        >
            <v-card
            >
                <v-card-text class="pt-3">
                    <span class="grey--text--darken-3" v-html="loaderText" v-if="loaderText != ''"></span>
                    <v-progress-linear
                        indeterminate
                        color="primary"
                        class="mb-0 mt-2"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="showDialog"
            :width="dialogOptions.width"
            :hide-overlay="dialogOptions.hideOverlay"
            :persistent="dialogOptions.persistent"
        >
            <v-card>
                <v-card-title
                    class="headline grey lighten-2"
                    primary-title
                    v-html="dialogOptions.title.toTitleCase()"
                >
                </v-card-title>
                <v-card-text v-html="dialogOptions.content" class="pt-3"></v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        v-for="(btn, buttonKey) in dialogOptions.buttons"
                        :key="buttonKey"
                        :class="[objProp(btn, 'color', 'primary') + '--text']"
                        :text="coalesce(btn.text, true)"
                        @click.native.stop="dialogButtonClicked(buttonKey)"
                        v-html="isObject(btn) ? btn.label : btn"
                    ></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
<!--        <v-dialog-->
<!--            v-model="showFormDialog"-->
<!--            :width="formDialogOptions.width"-->
<!--            :hide-overlay="formDialogOptions.hideOverlay"-->
<!--            :persistent="formDialogOptions.persistent"-->
<!--        >-->
<!--            <v-card>-->
<!--                <v-card-title-->
<!--                    class="headline grey lighten-2"-->
<!--                    primary-title-->
<!--                    v-html="formDialogOptions.title.toTitleCase()"-->
<!--                >-->
<!--                </v-card-title>-->
<!--                <v-card-text>-->
<!--                    <span v-html="formDialogOptions.content"></span>-->
<!--                    &lt;!&ndash;                    :id="formDialogOptions.id"&ndash;&gt;-->
<!--                    <rocket-form-renderer-->
<!--                        :definition="formDialogOptions.definition"-->
<!--                    ></rocket-form-renderer>-->
<!--                </v-card-text>-->
<!--                <v-divider></v-divider>-->
<!--                <v-card-actions>-->
<!--                    <v-spacer></v-spacer>-->
<!--                    <v-btn-->
<!--                        v-for="(btn, buttonKey) in formDialogOptions.buttons"-->
<!--                        :key="buttonKey"-->
<!--                        :class="[objProp(btn, 'color', 'primary') + '&#45;&#45;text']"-->
<!--                        :text="coalesce(btn.text, true)"-->
<!--                        @click.native.stop="dialogButtonClicked(buttonKey)"-->
<!--                        v-html="isObject(btn) ? btn.label : btn"-->
<!--                    ></v-btn>-->
<!--                </v-card-actions>-->
<!--            </v-card>-->
<!--        </v-dialog>-->
    </div>
</template>

<script>
    import AppFrameworkEventBus from './plugins/event-hub';
    import typeHelpers from './mixins/TypeHelpersMixin';
   // import RocketFormRenderer from './RocketFormRenderer';

    export default {
        mixins: [typeHelpers],//TODO: Possibly mixin globally?
        props: {},
       // components: {RocketFormRenderer},
        computed: {
            showActivity() {
                //Added '&& this.activityLoaderProgress < 100' to avoid this.$activityProgress(null);
                return this.currentActivity.length > 0 || (!this.activityIndeterminate && this.activityLoaderProgress < 100);
            },
            activityIndeterminate() {
                return this.activityLoaderProgress === null;
            }
        },
        data() {
            return {
                activityLoaderProgress: null,
                currentActivity: [],
                snackbar: {
                    vertical: 'top',
                    horizontal: 'right',
                    duration: 4000,
                    message: '',
                    messageType: 'error'
                },
                showSnackbar: false,
                showLoader: false,
                loaderText: '',
                showDialog: false,
                dialogOptions: {
                    title: '',
                    content: '',
                    buttons: {},
                    width: '',
                    persistent: true,
                    hideOverlay: false,
                    promiseHandler: null,
                },
                showFormDialog: false,
                formDialogOptions : {
                    title : '',
                    content : ' ',
                    definition : [],
                    data : {},
                    buttons : {},
                    width: '',
                    hideOverlay : false,
                    promiseHandler : null,
                },
            }
        },
        methods: {
            // closeSnackbar() {
            //     this.snackbar.message = '';
            // }
            dialogButtonClicked(btn) {
                // this.dialogOptions.title = '';??
                // this.dialogOptions.content = ' ';??
                this.showDialog = false;
                setTimeout(() => {
                    //Finish animation before resolving
                    this.dialogOptions.promiseHandler.resolve(btn);
                }, 200);
            },
            handleSessionFlash(flash){
                if(!flash) return;

                if(flash.message){
                    this.$snackbar(flash.message);
                }else if(flash.error){
                    this.$snackbar(flash.error,'error');
                }else if(flash.success){
                    this.$snackbar(flash.success,'success');
                }
            }
        },
        mounted() {
            this.$watch('$page.props.$flash',()=>{
                this.handleSessionFlash(this.$page.props.$flash);
            });

            AppFrameworkEventBus.$on('snackbar', (opt) => {
                this.snackbar.message = opt.message;
                this.snackbar.vertical = this.objProp(opt, 'vertical', 'top');
                this.snackbar.horizontal = this.objProp(opt, 'horizontal', 'right');
                this.snackbar.duration = this.objProp(opt, 'duration', 4000);
                this.snackbar.messageType = this.objProp(opt, 'messageType', 'info');
                this.snackbar.message = opt.message;
                this.showSnackbar = true;
            });

            AppFrameworkEventBus.$on('show_loader', (message) => {
                this.loaderText = this.coalesce(message, '');
                this.showLoader = true;
            });
            AppFrameworkEventBus.$on('hide_loader', () => {
                this.loaderText = '';
                this.showLoader = false;
            });
            AppFrameworkEventBus.$on('loader_status', (message) => {
                this.loaderText = this.coalesce(message, '');
            });

            AppFrameworkEventBus.$on('add_activity', (id) => {
                this.currentActivity.push(id);
            });
            AppFrameworkEventBus.$on('remove_activity', (id) => {
                this.arrayRemoveItem(this.currentActivity, id);
            });
            AppFrameworkEventBus.$on('activityProgress', (progress) => {
                this.activityLoaderProgress = progress;
            });

            AppFrameworkEventBus.$on('dialog', (opt) => {
                this.dialogOptions.title = opt.title;
                this.dialogOptions.content = opt.content;
                this.dialogOptions.buttons = opt.buttons;
                this.dialogOptions.width = opt.width;
                this.dialogOptions.persistent = opt.persistent;
                this.dialogOptions.hideOverlay = !opt.overlay;
                this.dialogOptions.promiseHandler = opt.promise;
                this.showDialog = true;
            });

            AppFrameworkEventBus.$on('formDialog', (opt) => {
                this.formDialogOptions.title = opt.title;
                this.formDialogOptions.content = opt.content;
                this.formDialogOptions.definition = opt.definition;
                this.formDialogOptions.buttons = opt.buttons;
                this.formDialogOptions.width = opt.width;
                this.formDialogOptions.hideOverlay = !opt.overlay;
                this.formDialogOptions.persistent = opt.persistent;
                this.formDialogOptions.promiseHandler = opt.promise;
                this.formDialogOptions.id = AppFrameworkEventBus.getUniqueID('rocket-framework-dialog-form');
                this.showFormDialog = true;
            });
        },
    }
</script>

<style scoped lang="scss">
    .app-framework {
        .v-progress-linear {
            z-index: 100000;
        }
    }
</style>
