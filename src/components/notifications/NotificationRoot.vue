<template>
  <div class="
      vm-fixed
      vm-inset-0
      vm-z-[5050]
      vm-flex flex-col
      vm-items-end
      vm-justify-start
      vm-w-full
      vm-px-4
      vm-py-6
      vm-pointer-events-none
      vm-sm:p-6
    " style="flex-direction: column;">
    <transition-group enter-active-class="vm-transition vm-duration-300 vm-ease-out"
      enter-from-class="vm-translate-y-2 vm-opacity-0 vm-sm:translate-y-0 vm-sm:translate-x-2"
      enter-to-class="vm-translate-y-0 vm-opacity-100 vm-sm:translate-x-0" leave-active-class="vm-transition vm-duration-100 vm-ease-in"
      leave-from-class="vm-opacity-100" leave-to-class="vm-opacity-0">
      <NotificationItem v-for="notification in notifications" :key="notification.id" :notification="notification" />
    </transition-group>
  </div>
</template>

<script >
import NotificationItem from './NotificationItem.vue'
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
export default {
  components: {
    NotificationItem,
  },
  setup() {
    const notificationStore = useNotificationStore()

    const notifications = computed(() => {
      return notificationStore.notifications
    })

    return {
      notifications,
    }
  },
}
</script>
