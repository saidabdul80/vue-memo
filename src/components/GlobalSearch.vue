<template>
   <IconField class="vm-h-[38px] vm-text-center md:vm-w-[40%] vm-mx-auto">
        <PhMagnifyingGlass class="vm-absolute vm-top-[30%] vm-left-3" />
        <InputText v-model="global.filters.search" class="vm-h-[38px] vm-text-center md:vm-w-full vm-mx-auto" placeholder="Search" />
    </IconField>
</template>

<script>
import { useGlobalsStore } from '@/stores/globals';
import { PhMagnifyingGlass } from '@phosphor-icons/vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';

    export default {
        components: {
            IconField,
            InputIcon,
            InputText,
            PhMagnifyingGlass,
        },
        data() {
            return {
                global: useGlobalsStore()
            }
        },
    }
</script>

<style lang="scss" scoped>

</style>