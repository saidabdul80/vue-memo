<template>
   <IconField class="vm-h-[38px] vm-text-center md:vm-w-[40%] vm-mx-auto">
        <PhMagnifyingGlass class="vm-absolute vm-top-[30%] vm-left-3" />
        <InputText v-model="global.filters.search" class="vm-h-[38px] vm-text-center md:vm-w-full vm-mx-auto" placeholder="Search" />
        <PhXCircle v-if="global.filters.search" @click="global.filters.search = ''" class="vm-absolute vm-top-[30%] vm-right-3 vm-cursor-pointer" />
    </IconField>
</template>

<script>
import { useGlobalsStore } from '@/stores/globals';
import { PhMagnifyingGlass, PhXCircle } from '@phosphor-icons/vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';

    export default {
        components: {
            IconField,
            InputIcon,
            InputText,
            PhMagnifyingGlass,
            PhXCircle
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
