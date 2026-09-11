<template>
  <a-modal v-model:visible="visible" :title="title" :width="540" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { LeadItem } from '@/apis/business/lead'
import type { PublicPoolItem } from '@/apis/directory'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { convertLead, invalidateLead, releaseLead } from '@/apis/business/lead'
import GiForm from '@/components/GiForm/GiForm.vue'

type Action = 'convert' | 'invalidate' | 'release'
const props = defineProps<{ pools: PublicPoolItem[] }>()
const emit = defineEmits<{ success: [] }>()
const visible = ref(false)
const action = ref<Action>('convert')
const record = ref<LeadItem>()
const getInitForm = () => ({ customerName: '', industry: '', region: '', reason: '', publicPoolId: '' })
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const title = computed(() => ({ convert: '线索转客户', invalidate: '标记无效', release: '释放至公海' }[action.value]))
const columns = computed<FormColumnItem[]>(() => action.value === 'convert'
  ? [
      { field: 'customerName', label: '客户名称', type: 'input', required: true },
      { field: 'industry', label: '所属行业', type: 'input' },
      { field: 'region', label: '所属区域', type: 'input' }
    ]
  : action.value === 'release'
    ? [
        { field: 'publicPoolId', label: '目标公海', type: 'select', required: true, props: { options: props.pools.filter((item) => item.releaseEnabled).map((item) => ({ label: item.name, value: item.id })) } },
        { field: 'reason', label: '释放原因', type: 'textarea' }
      ]
    : [{ field: 'reason', label: '无效原因', type: 'textarea', required: true }])
const reset = () => Object.assign(form, getInitForm())
const open = (nextAction: Action, item: LeadItem) => {
  reset()
  action.value = nextAction
  record.value = item
  form.customerName = item.companyName || item.name
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors || !record.value) return false
  if (action.value === 'convert') await convertLead(record.value, { customerName: form.customerName.trim(), industry: form.industry.trim() || undefined, region: form.region.trim() || undefined })
  if (action.value === 'invalidate') await invalidateLead(record.value, form.reason.trim())
  if (action.value === 'release') await releaseLead(record.value, form.publicPoolId, form.reason.trim() || undefined)
  Message.success(`${title.value}成功`)
  emit('success')
  return true
}

defineExpose({ open })
</script>
