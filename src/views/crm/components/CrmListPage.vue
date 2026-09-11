<template>
  <main class="g-page crm-list-page">
    <header class="crm-list-page__header">
      <div>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <a-button v-if="createFields.length" type="primary" @click="openCreate">新建{{ title }}</a-button>
    </header>

    <a-card class="crm-list-page__card">
      <div class="crm-list-page__toolbar">
        <a-input-search v-model="keyword" placeholder="搜索当前页" allow-clear @search="filterRows" @clear="filterRows" />
        <a-button @click="load">刷新</a-button>
      </div>
      <a-table :data="displayRows" :pagination="false" :bordered="false" :loading="loading" row-key="id">
        <a-table-column v-for="column in columns" :key="column.dataIndex" :title="column.title" :data-index="column.dataIndex">
          <template #cell="{ record }">
            <a-space v-if="column.dataIndex === 'operations'" size="mini">
              <a-button type="text" size="small" @click="openDetail(record)">详情</a-button>
              <a-button v-for="action in availableActions(record)" :key="action.label" type="text" size="small" @click="startAction(action, record)">
                {{ action.label }}
              </a-button>
            </a-space>
            <a-tag v-else-if="column.dataIndex === 'status'" size="small">{{ record.status || '-' }}</a-tag>
            <span v-else>{{ formatValue(record[column.dataIndex]) }}</span>
          </template>
        </a-table-column>
      </a-table>
      <footer class="crm-list-page__footer">
        <span>共 {{ total }} 条</span>
        <a-pagination v-model:current="page" v-model:page-size="size" :total="total" show-page-size :page-size-options="[10, 20, 50]" @change="load" @page-size-change="load" />
      </footer>
    </a-card>

    <a-drawer v-model:visible="detailVisible" :width="drawerWidth" :title="`${title}详情`" unmount-on-close>
      <a-descriptions v-if="detail" :column="1" bordered size="small">
        <a-descriptions-item v-for="field in detailFields" :key="field" :label="labels[field] || field">
          {{ formatValue(detail[field]) }}
        </a-descriptions-item>
      </a-descriptions>
      <a-empty v-else />
      <template #footer>
        <a-button @click="detailVisible = false">关闭</a-button>
      </template>
    </a-drawer>

    <a-drawer v-model:visible="createVisible" :width="drawerWidth" :title="`新建${title}`" unmount-on-close>
      <a-form :model="createModel" layout="vertical" @submit="submitCreate">
        <a-form-item v-for="field in createFields" :key="field.key" :field="field.key" :label="field.label" :rules="field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined">
          <a-textarea v-if="field.type === 'textarea'" v-model="createModel[field.key]" :placeholder="`请输入${field.label}`" />
          <a-input-number v-else-if="field.type === 'number'" v-model="createModel[field.key]" :min="0" :precision="field.precision" class="w-full" />
          <a-date-picker v-else-if="field.type === 'date'" v-model="createModel[field.key]" value-format="YYYY-MM-DD" class="w-full" />
          <a-select v-else-if="field.options" v-model="createModel[field.key]" :options="field.options" allow-clear />
          <a-input v-else v-model="createModel[field.key]" :placeholder="`请输入${field.label}`" allow-clear />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="createVisible = false">取消</a-button>
          <a-button type="primary" :loading="submitting" @click="submitCreate">创建</a-button>
        </a-space>
      </template>
    </a-drawer>

    <a-modal v-model:visible="actionVisible" :title="pendingAction?.label" :ok-loading="submitting" @ok="sendAction">
      <a-form v-if="pendingAction" :model="actionModel" layout="vertical">
        <a-form-item v-if="pendingAction.needsReason" field="reason" label="原因" :rules="[{ required: true, message: '请输入原因' }]">
          <a-textarea v-model="actionModel.reason" placeholder="请说明本次操作原因" />
        </a-form-item>
        <p v-else>该操作会立即更新 CRM 内部状态。</p>
      </a-form>
    </a-modal>
  </main>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import http from '@/utils/http'

export interface CrmColumn { title: string, dataIndex: string }
export interface CrmField {
  key: string
  label: string
  required?: boolean
  type?: 'number' | 'date' | 'textarea'
  precision?: number
  options?: Array<{ label: string, value: string }>
}
export interface CrmAction {
  label: string
  path: (row: Record<string, any>) => string
  needsReason?: boolean
  idempotent?: boolean
  visible?: (row: Record<string, any>) => boolean
  payload?: (row: Record<string, any>, reason: string) => Record<string, unknown>
}

const props = withDefaults(defineProps<{
  title: string
  description: string
  endpoint: string
  columns: CrmColumn[]
  labels?: Record<string, string>
  createEndpoint?: string
  createFields?: CrmField[]
  createPayload?: (model: Record<string, any>) => Record<string, unknown>
  actions?: CrmAction[]
}>(), { labels: () => ({}), createEndpoint: '', createFields: () => [], actions: () => [] })

const page = ref(1)
const size = ref(20)
const total = ref(0)
const rows = ref<Record<string, any>[]>([])
const displayRows = ref<Record<string, any>[]>([])
const keyword = ref('')
const loading = ref(false)
const submitting = ref(false)
const detailVisible = ref(false)
const createVisible = ref(false)
const actionVisible = ref(false)
const detail = ref<Record<string, any>>()
const createModel = reactive<Record<string, any>>({})
const actionModel = reactive({ reason: '' })
const pendingAction = ref<CrmAction>()
const actionRow = ref<Record<string, any>>()
const drawerWidth = computed(() => window.innerWidth < 768 ? '100%' : 520)
const labels = computed(() => ({ id: 'ID', ...Object.fromEntries(props.columns.map(item => [item.dataIndex, item.title])), ...props.labels }))
const detailFields = computed(() => detail.value ? Object.keys(detail.value).filter(key => !['beforeSnapshot', 'afterSnapshot', 'requestSnapshot'].includes(key)) : [])

function idempotencyKey() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
function filterRows() {
  const value = keyword.value.trim().toLowerCase()
  displayRows.value = value ? rows.value.filter(row => JSON.stringify(row).toLowerCase().includes(value)) : rows.value
}
async function load() {
  loading.value = true
  try {
    const res = await http.get<{ records: Record<string, any>[], total: number }>(props.endpoint, { page: page.value, size: size.value })
    rows.value = res.data.records || []
    total.value = res.data.total || 0
    filterRows()
  } finally {
    loading.value = false
  }
}
async function openDetail(row: Record<string, any>) {
  detailVisible.value = true
  detail.value = row
  try {
    const res = await http.get<Record<string, any>>(`${props.endpoint.replace(/\/(private|public)$/, '')}/${row.id}`)
    detail.value = res.data
  } catch {
    // 列表数据仍可用于展示，详情权限不足不影响当前列表。
  }
}
function openCreate() {
  Object.keys(createModel).forEach(key => delete createModel[key])
  createVisible.value = true
}
async function submitCreate() {
  if (!props.createEndpoint) return
  const missing = props.createFields.find(field => field.required && !createModel[field.key])
  if (missing) return Message.warning(`请填写${missing.label}`)
  submitting.value = true
  try {
    await http.post(props.createEndpoint, props.createPayload ? props.createPayload(createModel) : createModel, { headers: { 'Idempotency-Key': idempotencyKey() } })
    Message.success('创建成功')
    createVisible.value = false
    page.value = 1
    await load()
  } finally {
    submitting.value = false
  }
}
function availableActions(row: Record<string, any>) { return props.actions.filter(action => !action.visible || action.visible(row)) }
function startAction(action: CrmAction, row: Record<string, any>) {
  pendingAction.value = action
  actionRow.value = row
  actionModel.reason = ''
  actionVisible.value = true
}
async function sendAction() {
  if (!pendingAction.value || !actionRow.value) return
  if (pendingAction.value.needsReason && !actionModel.reason.trim()) return Message.warning('请填写原因')
  submitting.value = true
  try {
    const action = pendingAction.value
    const row = actionRow.value
    const payload = action.payload ? action.payload(row, actionModel.reason) : { version: row.version, ...(action.needsReason ? { reason: actionModel.reason } : {}) }
    await http.post(action.path(row), payload, action.idempotent ? { headers: { 'Idempotency-Key': idempotencyKey() } } : undefined)
    Message.success(`${action.label}成功`)
    actionVisible.value = false
    await load()
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<style lang="scss" scoped>
.crm-list-page { display: grid; gap: 16px; }.crm-list-page__header { display: flex; align-items: end; justify-content: space-between; gap: 16px; }.crm-list-page__header h1 { margin: 0; font-size: 24px; }.crm-list-page__header p { margin: 6px 0 0; color: var(--color-text-3); }.crm-list-page__toolbar { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 16px; }.crm-list-page__toolbar :deep(.arco-input-wrapper) { max-width: 300px; }.crm-list-page__footer { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; color: var(--color-text-3); font-size: 13px; }
@media (width <= 768px) { .crm-list-page__header, .crm-list-page__toolbar, .crm-list-page__footer { align-items: stretch; flex-direction: column; }.crm-list-page__toolbar :deep(.arco-input-wrapper) { max-width: none; } }
</style>
