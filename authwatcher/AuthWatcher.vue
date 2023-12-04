<template>
    <v-dialog v-model="dialogOpen" persistent max-width="290">
        <v-card>
            <v-card-title class="headline" v-if="countdownRemaining > 0">Session expiry</v-card-title>
            <v-card-text v-if="countdownRemaining > 0">
                Your session will expire in {{ countdownRemaining }} seconds. Do you want to remain logged in?
            </v-card-text>
            <v-card-text class="pt-4" v-else>
                <div class="d-flex justify-center align-center flex-column">
                    <v-progress-circular class="mb-3" color="primary" :size="30" indeterminate></v-progress-circular>
                    <div>Logging Out...</div>
                </div>
            </v-card-text>
            <v-card-actions v-if="countdownRemaining > 0">
                <v-spacer></v-spacer>
                <v-btn color="success" :loading="renewing" text @click="renewSession()">Remain</v-btn>
                <v-btn color="error" text @click="logout()">Logout</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import Vue from 'vue';
    import {Inertia} from '@inertiajs/inertia'
    import moment from "moment/moment";

    export default {
        props: {
            sessionLifetime: {type: Number, default: 7200},
            sessionRefreshEndpoint: {type: String, default: '/refresh-session'},
            logoutEndpoint: {type: String, default: '/logout'},
            afterLogoutUrl: {type: String, default: '/login'},
            countdownAt: {type: Number, default: 60}
        },
        data() {
            return {
                dialogOpen: false,
                lastRefresh: 0,
                countdownInterval: null,
                countdownRemaining: 0,
                sessionWatcherInterval: null,
                isVaild: null,
                renewing: false
            }
        },
        watch: {
            lastRefresh() {
                if (this._preventSettingLastSeen) {
                    this._preventSettingLastSeen = false;
                    return;
                }
                localStorage.setItem('last_seen', Date.now());
            }
        },
        methods: {
            interceptHttpRequestsForSession() {
                this.lastRefresh = Date.now();
                Vue.prototype.$http.interceptors.response.use((response) => {
                    const l = document.createElement("a");
                    l.href = response.config.url;
                    if (document.location.hostname === l.hostname) {
                        this.lastRefresh = Date.now();
                    }
                    return response;
                }, (error) => {
                    if (error.response.status !== 401) {
                        const l = document.createElement("a");
                        l.href = error.response.config.url;
                        if (document.location.hostname === l.hostname) {
                            this.lastRefresh = Date.now();
                        }
                    } else {
                        this.logout();
                    }
                    return Promise.reject(error)
                });
            },
            startSessionWatcher() {
                window.clearInterval(this.countdownInterval);
                window.clearInterval(this.sessionWatcherInterval);
                this.sessionWatcherInterval = window.setInterval(async () => {
                    const secs = (Date.now() - this.lastRefresh) / 1000;
                    if (secs > (this.sessionLifetime - this.countdownAt)) {
                        let showDialog = await this.checkIfLogoutDialogShouldShow();
                        if (!showDialog) {
                            this.startSessionWatcher()
                        } else {
                            window.clearInterval(this.sessionWatcherInterval);
                            this.startExpiryCountdown();
                        }
                    }
                }, 5000);
            },
            startExpiryCountdown() {
                this.countdownRemaining = this.countdownAt;
                this.dialogOpen = true;
                this.countdownInterval = window.setInterval(() => {
                    this.countdownRemaining--;
                    if (this.countdownRemaining < 1) {
                        window.clearInterval(this.countdownInterval);
                        this.logout();
                    }
                }, 1000);
            },
            logout() {
                this.$http.post(this.logoutEndpoint).then((resp) => {
                    window.clearInterval(this.countdownInterval);
                    window.clearInterval(this.sessionWatcherInterval);
                    this.$navigate(this.afterLogoutUrl);
                }, (err) => {
                    window.clearInterval(this.countdownInterval);
                    window.clearInterval(this.sessionWatcherInterval);
                    this.$navigate(this.afterLogoutUrl);
                });
            },
            renewSession() {
                this.renewing = true;
                this.$http.post(this.sessionRefreshEndpoint).then((resp) => {
                    this.startSessionWatcher();
                    this.dialogOpen = false;
                    this.renewing = false;
                }, (err) => {
                    window.clearInterval(this.countdownInterval);
                    this.$navigate(this.afterLogoutUrl);
                    this.renewing = false;
                });
            },
            registerInertiaEventListeners() {
                const refreshSession = () => {
                    this.lastRefresh = Date.now();
                    this.startSessionWatcher();
                    this.dialogOpen = false;
                };

                //Do not refresh on the 'finish' and 'exception' events. These events are fired on network interruptions (offline),
                //which means the request most likely didn't reach the server and the session wasn't renewed.
                //We also do not need to refresh on the 'navigate' event because it fires when navigating through history (session is not refreshed on server)
                //and the 'success' event will fire after the 'navigate' event anyway.
                //Only refresh on the 'success' and 'error' events as both will only fire on successful inertia calls
                //that refreshed the session on the server.
                Inertia.on('success', refreshSession);
                Inertia.on('error', refreshSession);
            },
            checkIfLogoutDialogShouldShow() {
                this._preventSettingLastSeen = true;
                let showDialog = this.$http.post(this.$route('check.session.validity'),
                    {
                        last_seen: localStorage.getItem('last_seen'),
                        sessionLifeTime: this.sessionLifetime,
                        countDownTimer: this.countdownAt
                    }
                ).then((resp) => {
                    if (resp && resp.data) {
                        if (!resp.data.authenticated) {
                            window.clearInterval(this.countdownInterval);
                            window.clearInterval(this.sessionWatcherInterval);
                        }
                        return resp.data.showDialog;
                    }
                    return true;
                });

                return showDialog;
            },
        },
        mounted() {
            this.interceptHttpRequestsForSession();
            this.startSessionWatcher();
            this.registerInertiaEventListeners();
        },
    }
</script>

<style scoped>

</style>
