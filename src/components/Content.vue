<template>
  <div v-show="global.content_to_show == 'viewer'">
    <Panel class="vm-border-0">
      <span
        :style="[`color:${global.config.colors?.primary}`]"
        class="vm-hidden md:vm-block vm-text-lg vm-uppercase vm-font-bold"
        >#{{ global.memo?.type }}</span
      >
      <p class="vm-text-sm vm-capitalize">
        <b>From:</b> {{ global.memo?.owner?.full_name || "Jamiyu Yusuf" }}
      </p>
      <p class="vm-text-sm vm-capitalize vm-mb-2">
        <b>Department:</b> {{ global.memo?.department }}
      </p>
    </Panel>
    <Panel>
      <template #header>
        <span class="vm-text-lg vm-uppercase vm-font-bold">{{
          global.memo?.title
        }}</span>
      </template>
      <div v-html="global.memo?.content"></div>
    </Panel>
  </div>
  <div v-show="global.content_to_show == 'editor'">
    <Panel class="vm-border-0">
      <InputText
        v-model="global.memo.title"
        class="vm-h-[38px] vm-w-full vm-mb-3"
        placeholder="Title"
      />
      <Select
        placeholder="Send to"
        option-label="name"
        v-model="global.memo.department_id"
        :options="global.config.departments"
        class="vm-text-sm tw-h-[38px] vm-w-full  vm-mb-3"
      >
      </Select>
      <MultiSelect
        v-model="global.memo.approvers"
        display="chip"
        :options="global.config.members"
        optionLabel="full_name"
        placeholder="Select Approvers"
        :maxSelectedLabels="3"
        class="vm-w-full vm-mb-3"
      >
        <template #header>
          <div class="vm-flex vm-justify-center vm-p-3">
            <InputText
              placeholder="Search for name"
              label=""
              class="tw-w-full tw-mt-2"
              size="small"
              @input="asyncFind"
              v-model="searchInput"
            />
          </div>
        </template>
      </MultiSelect>
    </Panel>
    <Card class="vm-border vm-border-gray-200 vm-shadow-none">
      <template #content>
        <Editor
          v-model="value"
          editorStyle="height: 320px;border-color:#fff;font-size:16px; "
          :pt="{ toolbar: { class: 'vm-border-0 vm-border-b-2' } }">
          <template v-slot:toolbar>
            <span class="ql-formats">
              <button v-tooltip.bottom="'align'" class="ql-align"></button>
              <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
              <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
              <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
              <button v-tooltip.bottom="'link'" class="ql-link"></button>
              <button v-tooltip.bottom="'image'" class="ql-image"></button>
              <button v-tooltip.bottom="'video'" class="ql-video"></button>
            </span>
          </template>
        </Editor>
      </template>
    </Card>
  </div>
</template>

<script>
import { useClient } from "@/stores/client";
import { useGlobalsStore } from "@/stores/globals";
import Card from "primevue/card";

import Editor from "primevue/editor";
import InputText from "primevue/inputtext";

import Panel from "primevue/panel";
import Select from "primevue/select";

import MultiSelect from "primevue/multiselect";

export default {
  components: {
    Panel,
    Editor,
    Card,
    InputText,
    Select,
    MultiSelect,
  },
  data() {
    return {
      global: useGlobalsStore(),
      searchInput: "",
      isLoading: false,
    };
  },
  methods: {
    async asyncFind(event) {
      clearTimeout(this.typingTimer);
      if (this.searchInput === "") return;

      this.typingTimer = setTimeout(async () => {
        this.isLoading = true;
        try {
          const response = await useClient().http({
            method: "get",
            path: this.global.config.getMembersRoute,
            data: { search: this.searchInput },
          });
          this.options = response ? response.data : [];
        } finally {
          this.isLoading = false;
        }
      }, 500);
    },
  },
};
</script>

<style lang="scss" scoped></style>
