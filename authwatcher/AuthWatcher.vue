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
import { ref, onMounted, watch } from 'vue';
import { router } from '@inertiajs/vue3';

export default {
  props: {
    sessionLifetime: { type: Number, default: 7200 },
    sessionRefreshEndpoint: { type: String, default: '/refresh-session' },
    logoutEndpoint: { type: String, default: '/logout' },
    afterLogoutUrl: { type: String, default: '/login' },
    countdownAt: { type: Number, default: 60 }
  },
  setup(props, { emit }) {
    const dialogOpen = ref(false);
    const lastRefresh = ref(0);
    const countdownInterval = ref(null);
    const countdownRemaining = ref(0);
    const sessionWatcherInterval = ref(null);
    const renewing = ref(false);
    const _preventSettingLastSeen = ref(false);

    watch(lastRefresh, (newValue, oldValue) => {
      if (!_preventSettingLastSeen.value) {
        localStorage.setItem('last_seen', Date.now());
      }
    });

    const interceptHttpRequestsForSession = () => {
      lastRefresh.value = Date.now();
      axios.interceptors.response.use((response) => {
        const l = document.createElement("a");
        l.href = response.config.url;
        if (document.location.hostname === l.hostname) {
          lastRefresh.value = Date.now();
        }
        return response;
      }, (error) => {
        if (error.response.status !== 401) {
          const l = document.createElement("a");
          l.href = error.response.config.url;
          if (document.location.hostname === l.hostname) {
            lastRefresh.value = Date.now();
          }
        } else {
          logout();
        }
        return Promise.reject(error);
      });
    };

    const startSessionWatcher = () => {
      window.clearInterval(countdownInterval.value);
      window.clearInterval(sessionWatcherInterval.value);
      sessionWatcherInterval.value = window.setInterval(async () => {
        const secs = (Date.now() - lastRefresh.value) / 1000;
        if (secs > (props.sessionLifetime - props.countdownAt)) {
          let showDialog = await checkIfLogoutDialogShouldShow();
          if (!showDialog) {
            startSessionWatcher();
          } else {
            window.clearInterval(sessionWatcherInterval.value);
            startExpiryCountdown();
          }
        }
      }, 5000);
    };

    const startExpiryCountdown = () => {
      countdownRemaining.value = props.countdownAt;
      dialogOpen.value = true;
      countdownInterval.value = window.setInterval(() => {
        countdownRemaining.value--;
        if (countdownRemaining.value < 1) {
          window.clearInterval(countdownInterval.value);
          logout();
        }
      }, 1000);
    };

    const logout = () => {
      axios.post(props.logoutEndpoint).then((resp) => {
        clearIntervals();
        router.visit(props.afterLogoutUrl);
      }, (err) => {
        clearIntervals();
        router.visit(props.afterLogoutUrl);
      });
    };

    const renewSession = () => {
      renewing.value = true;
      axios.post(props.sessionRefreshEndpoint).then((resp) => {
        startSessionWatcher();
        dialogOpen.value = false;
        renewing.value = false;
      }, (err) => {
        clearIntervals();
        router.visit(props.afterLogoutUrl);
        renewing.value = false;
      });
    };

    const registerInertiaEventListeners = () => {
      const refreshSession = () => {
        lastRefresh.value = Date.now();
        startSessionWatcher();
        dialogOpen.value = false;
      };

      router.on('success', refreshSession);
      router.on('error', refreshSession);
    };

    const checkIfLogoutDialogShouldShow = async () => {
      _preventSettingLastSeen.value = true;
      let showDialog = await axios.post(this.$route('check.session.validity'), {
        last_seen: localStorage.getItem('last_seen'),
        sessionLifeTime: props.sessionLifetime,
        countDownTimer: props.countdownAt
      }).then((resp) => {
        if (resp && resp.data) {
          if (!resp.data.authenticated) {
            clearIntervals();
          }
          return resp.data.showDialog;
        }
        return true;
      });

      return showDialog;
    };

    const clearIntervals = () => {
      window.clearInterval(countdownInterval.value);
      window.clearInterval(sessionWatcherInterval.value);
    };

    onMounted(() => {
      interceptHttpRequestsForSession();
      startSessionWatcher();
      registerInertiaEventListeners();
    });

    return {
      dialogOpen,
      lastRefresh,
      countdownRemaining,
      renewing,
      renewSession,
      logout
    };
  }
}
</script>

<style scoped>
/* Style remains the same */
</style>
