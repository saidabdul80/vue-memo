<template>
  <div
    :class="{
      'vm-bg-white': success,
      'vm-bg-blue-50': info,
      'vm-bg-amber-50': warning,
      'vm-bg-red-50': error,
    }"
    class="
      vm-max-w-sm
      vm-mb-3
      vm-rounded-lg
      vm-shadow-lg
      vm-cursor-pointer
      vm-pointer-events-auto
      vm-w-full
      vm-md:vm-w-96
    "
    @click.stop="hideNotificationAction"
    @mouseenter="clearNotificationTimeOut"
    @mouseleave="setNotificationTimeOut"
  >
    <div class="vm-overflow-hidden vm-rounded-lg vm-shadow-xs">
      <div class="vm-p-4">
        <div class="vm-flex vm-items-start">
          <div class="vm-shrink-0">
            <svg
              v-if="success"
              class="vm-w-6 vm-h-6 vm-text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-if="info"
              class="vm-w-6 vm-h-6 vm-text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <svg
              v-if="warning"
              class="vm-w-6 vm-h-6 vm-text-amber-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-if="error"
              class="vm-w-6 vm-h-6 vm-text-red-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="vm-flex-1 vm-w-0 vm-ml-3 vm-text-left">
            <p
              :class="`vm-text-sm  vm-font-bold vm-my-0 ${
                success ? 'vm-text-gray-900' : info ? 'vm-text-sky-900 ' : warning ? 'vm-text-amber-950' : 'vm-text-red-800'
              }`"
            >
              {{
                notification.title
                  ? notification.title
                  : success
                  ? 'Success!'
                  : info
                  ? 'Info'
                  : warning
                  ? 'Warning'
                  : 'Error'
              }}
            </p>
            <p
              :class="`vm-mt-1 vm-text-sm vm-leading-5 ${
                success ? 'vm-text-gray-500' : info ? 'vm-text-sky-800 vm-mb-0' : warning ? 'vm-text-amber-500' : 'vm-text-red-700'
              }`"
            >
              {{
                notification.message
                  ? notification.message
                  : success
                  ? 'Successful'
                  : info
                  ? 'Informational message'
                  : warning
                  ? 'This is a warning'
                  : 'Something went wrong'
              }}
            </p>
          </div>
          <div class="vm-flex vm-shrink-0">
            <button
              :class="
                success ? 'vm-text-gray-400 vm-focus:vm-text-gray-500' :
                info ? 'vm-text-blue-400 vm-focus:vm-text-blue-500' :
                warning ? 'vm-text-amber-400 vm-focus:vm-text-amber-500' :
                'vm-text-red-400 vm-focus:vm-text-red-500'
              "
              class="
                vm-inline-flex
                vm-w-5
                vm-h-5
                vm-transition
                vm-duration-150
                vm-ease-in-out
                vm-focus:vm-outline-none
              "
              @click="hideNotificationAction"
            >
              <svg
                class="vm-w-6 vm-h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps({
  notification: {
    type: Object,
    default: null,
  },
})

const notificationStore = useNotificationStore()

let notiTimeOut = ref('')

const success = computed(() => {
  return props.notification.type == 'success'
})

const error = computed(() => {
  return props.notification.type == 'error'
})

const info = computed(() => {
  return props.notification.type == 'info'
})

const warning = computed(() => {
  return props.notification.type == 'warning'
})

function hideNotificationAction() {
  notificationStore.hideNotification(props.notification)
}

function clearNotificationTimeOut() {
  clearTimeout(notiTimeOut)
}

function setNotificationTimeOut() {
  notiTimeOut = setTimeout(() => {
    notificationStore.hideNotification(props.notification)
  }, props.notification.time || 5000)
}

onMounted(() => {
  setNotificationTimeOut()
})
</script>
