<template>
  <div class="app-container">
    <div class="app-header">
      <h1>配置管理工具</h1>
    </div>
    <div class="app-content">
      <div class="section">
        <h3>已保存的配置</h3>
        <div v-if="savedConfigs.length === 0" class="empty-state">
          暂无保存的配置
        </div>
        <div v-else class="config-list">
          <div
            v-for="config in savedConfigs"
            :key="config.id"
            class="config-item"
            @click="loadConfig(config)"
          >
            <div class="config-name">{{ config.name }}</div>
            <div class="config-meta">
              <span>{{ config.group }}</span>
              <span>{{ config.enabled ? '已启用' : '已禁用' }}</span>
            </div>
            <button class="delete-btn" @click.stop="deleteConfig(config.id)">
              删除
            </button>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <h3>新建/编辑配置</h3>
        <div class="type-selector">
          <button
            v-for="type in configTypes"
            :key="type.value"
            :class="['type-btn', { active: currentType === type.value }]"
            @click="changeType(type.value)"
          >
            {{ type.label }}
          </button>
        </div>

        <div class="form-container">
          <div
            v-for="(field, index) in visibleFields"
            :key="field.name"
            :class="[
              'form-field',
              { collapsing: field.collapsing, expanding: field.expanding }
            ]"
            :style="{ transitionDelay: `${index * 50}ms` }"
          >
            <label class="field-label">{{ field.label }}</label>
            <component :is="field.component" v-bind="field.props" v-model="field.value" />
          </div>
        </div>

        <div class="accordion-container">
          <div
            v-for="group in accordionGroups"
            :key="group.name"
            :class="['accordion-group', { expanded: group.expanded }]"
          >
            <div class="accordion-header" @click="toggleAccordion(group)">
              <span class="accordion-title">{{ group.label }}</span>
              <svg class="accordion-icon" :class="{ rotated: group.expanded }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div :class="['accordion-content', { open: group.expanded }]">
              <div v-for="field in group.fields" :key="field.name" class="form-field">
                <label class="field-label">{{ field.label }}</label>
                <component :is="field.component" v-bind="field.props" v-model="field.value" />
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button
            :class="['save-btn', { valid: isFormValid, saving: isSaving, saved: isSaved }]"
            @click="saveConfig"
            :disabled="!isFormValid || isSaving"
          >
            <div class="fill-progress"></div>
            <span class="btn-text">{{ isSaved ? '已保存' : (editingConfig ? '更新配置' : '保存配置') }}</span>
            <div :class="['checkmark', { show: isSaved }]">
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </button>
          <button v-if="editingConfig" class="secondary-btn" @click="resetForm">
            取消编辑
          </button>
          <button class="secondary-btn" @click="exportConfig">导出配置</button>
          <button class="secondary-btn" @click="importConfig">导入配置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import gql from 'graphql-tag';
import FormInput from './components/FormInput.vue';
import FormTextarea from './components/FormTextarea.vue';
import FormToggle from './components/FormToggle.vue';
import FormSlider from './components/FormSlider.vue';

interface FieldConfig {
  name: string;
  label: string;
  component: string;
  value: any;
  collapsing: boolean;
  expanding: boolean;
  props?: any;
}

interface AccordionGroup {
  name: string;
  label: string;
  expanded: boolean;
  fields: FieldConfig[];
}

interface SavedConfig {
  id: string;
  name: string;
  type: string;
  description: string;
  value: string;
  enabled: boolean;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  components: { FormInput, FormTextarea, FormToggle, FormSlider },
})
export default class App extends Vue {
  currentType = 'basic';
  isSaving = false;
  isSaved = false;
  visibleFields: FieldConfig[] = [];
  savedConfigs: SavedConfig[] = [];
  editingConfig: SavedConfig | null = null;

  configTypes = [
    { label: '基础配置', value: 'basic' },
    { label: '高级配置', value: 'advanced' },
    { label: '网络配置', value: 'network' },
    { label: '安全配置', value: 'security' },
  ];

  allFields: Record<string, FieldConfig[]> = {
    basic: [
      { name: 'name', label: '配置名称', component: 'FormInput', value: '', collapsing: false, expanding: false },
      { name: 'description', label: '配置描述', component: 'FormTextarea', value: '', collapsing: false, expanding: false },
      { name: 'enabled', label: '启用配置', component: 'FormToggle', value: false, collapsing: false, expanding: false },
    ],
    advanced: [
      { name: 'name', label: '配置名称', component: 'FormInput', value: '', collapsing: false, expanding: false },
      { name: 'timeout', label: '超时时间(秒)', component: 'FormSlider', value: 30, collapsing: false, expanding: false, props: { min: 0, max: 120 } },
      { name: 'retry', label: '重试次数', component: 'FormSlider', value: 3, collapsing: false, expanding: false, props: { min: 0, max: 10 } },
      { name: 'debug', label: '调试模式', component: 'FormToggle', value: false, collapsing: false, expanding: false },
    ],
    network: [
      { name: 'name', label: '配置名称', component: 'FormInput', value: '', collapsing: false, expanding: false },
      { name: 'host', label: '主机地址', component: 'FormInput', value: '', collapsing: false, expanding: false },
      { name: 'port', label: '端口', component: 'FormSlider', value: 8080, collapsing: false, expanding: false, props: { min: 1, max: 65535 } },
      { name: 'protocol', label: '协议', component: 'FormInput', value: 'http', collapsing: false, expanding: false },
    ],
    security: [
      { name: 'name', label: '配置名称', component: 'FormInput', value: '', collapsing: false, expanding: false },
      { name: 'encrypt', label: '启用加密', component: 'FormToggle', value: true, collapsing: false, expanding: false },
      { name: 'auth', label: '启用认证', component: 'FormToggle', value: false, collapsing: false, expanding: false },
      { name: 'tokenExpire', label: 'Token过期(小时)', component: 'FormSlider', value: 24, collapsing: false, expanding: false, props: { min: 1, max: 720 } },
    ],
  };

  accordionGroups: AccordionGroup[] = [
    {
      name: 'group1',
      label: '通用设置',
      expanded: false,
      fields: [
        { name: 'g1_setting1', label: '通用设置 1', component: 'FormInput', value: '', collapsing: false, expanding: false },
        { name: 'g1_setting2', label: '通用设置 2', component: 'FormToggle', value: true, collapsing: false, expanding: false },
      ],
    },
    {
      name: 'group2',
      label: '性能优化',
      expanded: false,
      fields: [
        { name: 'g2_cache', label: '缓存大小(MB)', component: 'FormSlider', value: 128, collapsing: false, expanding: false, props: { min: 16, max: 1024 } },
        { name: 'g2_threads', label: '线程数', component: 'FormSlider', value: 8, collapsing: false, expanding: false, props: { min: 1, max: 64 } },
      ],
    },
  ];

  async mounted() {
    this.visibleFields = JSON.parse(JSON.stringify(this.allFields.basic)) as FieldConfig[];
    await this.loadConfigs();
  }

  async loadConfigs() {
    try {
      const result = await this.$apollo.query<{ configs: SavedConfig[] }>({
        query: gql`
          query {
            configs {
              id
              name
              type
              description
              value
              enabled
              group
              createdAt
              updatedAt
            }
          }
        `,
        fetchPolicy: 'network-only',
      });
      this.savedConfigs = [...result.data.configs];
    } catch (error) {
      console.error('Load configs failed:', error);
    }
  }

  loadConfig(config: SavedConfig) {
    this.editingConfig = config;
    this.currentType = config.type;
    this.visibleFields = JSON.parse(JSON.stringify(this.allFields[config.type])) as FieldConfig[];
    
    const fieldValues = JSON.parse(config.value);
    this.visibleFields.forEach((field: FieldConfig) => {
      if (fieldValues[field.name] !== undefined) {
        field.value = fieldValues[field.name];
      }
    });
  }

  changeType(type: string) {
    const newFields = JSON.parse(JSON.stringify(this.allFields[type])) as FieldConfig[];
    const oldFields = this.visibleFields;

    oldFields.forEach((field: FieldConfig) => {
      field.collapsing = true;
    });

    setTimeout(() => {
      this.visibleFields = newFields;
      newFields.forEach((field: FieldConfig) => {
        field.expanding = true;
      });
      setTimeout(() => {
        newFields.forEach((field: FieldConfig) => {
          field.expanding = false;
        });
      }, 500);
    }, 500);

    this.currentType = type;
    this.isSaved = false;
    this.editingConfig = null;
  }

  toggleAccordion(group: AccordionGroup) {
    group.expanded = !group.expanded;
  }

  get isFormValid(): boolean {
    const nameField = this.visibleFields.find((f: FieldConfig) => f.name === 'name');
    return !!nameField?.value?.trim();
  }

  async saveConfig() {
    if (!this.isFormValid || this.isSaving) return;

    this.isSaving = true;

    try {
      const config = {
        name: this.visibleFields.find((f: FieldConfig) => f.name === 'name')?.value || '',
        type: this.currentType,
        description: this.visibleFields.find((f: FieldConfig) => f.name === 'description')?.value || '',
        value: JSON.stringify(this.visibleFields.reduce((acc: Record<string, any>, f: FieldConfig) => ({ ...acc, [f.name]: f.value }), {})),
        enabled: this.visibleFields.find((f: FieldConfig) => f.name === 'enabled')?.value || false,
        group: this.currentType,
      };

      if (this.editingConfig) {
        const result = await this.$apollo.mutate<{ updateConfig: SavedConfig }>({
          mutation: gql`
            mutation UpdateConfig($input: UpdateConfigInput!) {
              updateConfig(input: $input) {
                id
                name
                type
                description
                value
                enabled
                group
                createdAt
                updatedAt
              }
            }
          `,
          variables: { input: { id: this.editingConfig.id, ...config } },
        });
        
        const index = this.savedConfigs.findIndex(c => c.id === this.editingConfig?.id);
        if (index !== -1 && result.data?.updateConfig) {
          this.savedConfigs.splice(index, 1, result.data.updateConfig);
          this.savedConfigs = [...this.savedConfigs];
        }
      } else {
        const result = await this.$apollo.mutate<{ createConfig: SavedConfig }>({
          mutation: gql`
            mutation CreateConfig($input: CreateConfigInput!) {
              createConfig(input: $input) {
                id
                name
                type
                description
                value
                enabled
                group
                createdAt
                updatedAt
              }
            }
          `,
          variables: { input: config },
        });
        
        if (result.data?.createConfig) {
          this.savedConfigs = [...this.savedConfigs, result.data.createConfig];
        }
      }

      setTimeout(() => {
        this.isSaving = false;
        this.isSaved = true;
        setTimeout(() => {
          this.isSaved = false;
        }, 2000);
      }, 1000);
    } catch (error) {
      this.isSaving = false;
      console.error('Save failed:', error);
    }
  }

  async deleteConfig(id: string) {
    if (!confirm('确定要删除这个配置吗？')) return;

    try {
      await this.$apollo.mutate<{ deleteConfig: boolean }>({
        mutation: gql`
          mutation DeleteConfig($id: ID!) {
            deleteConfig(id: $id)
          }
        `,
        variables: { id },
      });
      
      this.savedConfigs = this.savedConfigs.filter(c => c.id !== id);
      
      if (this.editingConfig?.id === id) {
        this.resetForm();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }

  resetForm() {
    this.editingConfig = null;
    this.visibleFields = JSON.parse(JSON.stringify(this.allFields[this.currentType])) as FieldConfig[];
  }

  async exportConfig() {
    try {
      const result = await this.$apollo.query<{ exportConfigs: string }>({
        query: gql`
          query {
            exportConfigs
          }
        `,
      });

      const data = result.data.exportConfigs;
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'config-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        try {
          await this.$apollo.mutate<{ importConfigs: SavedConfig[] }>({
            mutation: gql`
              mutation ImportConfigs($jsonString: String!) {
                importConfigs(jsonString: $jsonString) {
                  id
                  name
                }
              }
            `,
            variables: { jsonString: content },
          });
          await this.loadConfigs();
          alert('导入成功！');
        } catch (error) {
          console.error('Import failed:', error);
          alert('导入失败！');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
}
</script>
