<template>
  <div
    class="vm-flex vm-items-center vm-justify-between vm-px-4 vm-py-1 sm:vm-rounded-lg"
  >
    <!-- <div class="vm-flex vm-items-center">
      <span class="vm-text-sm vm-text-gray-700">Rows per page:</span>
      <select v-model="rowsPerPageX" @change="changeRowsPerPage" class="vm-ml-2 vm-block vm-px-3 vm-mt-1 vm-text-base vm-text-gray-700 vm-bg-white vm-border vm-border-gray-300 vm-rounded-md vm-shadow-sm vm-focus:outline-none vm-focus:ring-2 vm-focus:ring-indigo-500 vm-focus:border-indigo-500 sm:vm-text-sm">
        <option v-for="(option,i) in rowsPerPageOptions" :key="i" :value="option">{{ option }}</option>
      </select>
    </div> -->
    <div class="vm-text-sm vm-text-gray-700">
      {{ global.meta?.from }} - {{ global.meta?.to }} of {{ global.meta.total }}
      <Button
        rounded="sm"
        outlined
        :disabled="global.links?.prev == null"
        @click="changePage(global.links?.prev)"
        size="small"
        class="!vm-rounded-md !vm-h-[30px] !vm-w-[30px] !vm-border-gray-400 vm-me-2"
      >
        <template #icon>
          <PhCaretLeft />
        </template>
      </Button>

      <Button
        rounded="sm"
        outlined
        :disabled="global.links?.next == null"
        @click="changePage(global.links?.next)"
        size="small"
        class="!vm-rounded-md !vm-h-[30px] !vm-w-[30px] !vm-border-gray-400 vm-p-0"
      >
      <template #icon>
          <PhCaretRight />
        </template>
      </Button>
    </div>
  </div>
</template>

<script>
import { useGlobalsStore } from "@/stores/globals";
import { PhCaretLeft, PhCaretRight } from "@phosphor-icons/vue";
import Button from "primevue/button";

export default {
  components: {
    Button,
    PhCaretRight,
    PhCaretLeft,
  },
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    rowsPerPage: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    rowsPerPageOptions: {
      type: Array,
      default: () => [10, 25, 50, 100],
    },
    meta: {
      type: Object,
      default: {},
    },
    links: {
      type: Object,
      default: {},
    },
  },
  computed: {
    startRow() {
      return (this.currentPage - 1) * this.rowsPerPage + 1;
    },
    endRow() {
      return Math.min(this.currentPage * this.rowsPerPage, this.totalItems);
    },
  },
  data() {
    return {
      global: useGlobalsStore(),
      rowsPerPageX: 10,
    };
  },
  created() {
    this.rowsPerPageX = this.rowsPerPage;
  },
  methods: {
    changePage(path) {
      this.global.fetchMemos(path, this.global.filters, true);
    },
    changeRowsPerPage(event) {
      //this.globals.filters.paginate = parseInt(event.target.value)
      this.$emit("rows-per-page-change", parseInt(event.target.value));
    },
  },
};
</script>

<style scoped>
/* Scoped styles if needed */
</style>
