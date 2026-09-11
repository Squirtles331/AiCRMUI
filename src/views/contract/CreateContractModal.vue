<template>
  <a-modal v-model:visible="visible" title="新增合同" :width="600" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { QuotationItem } from '@/apis/business/quotation'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { createContract } from '@/apis/business/contract'
import GiForm from '@/components/GiForm/GiForm.vue'

const props = defineProps<{ quotations: QuotationItem[] }>()
const emit = defineEmits<{ success: [] }>()
const getInitForm = () => ({ quoteId: '', name: '', effectiveRange: [] as string[] })
const visible = ref(false)
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => [
  { field: 'quoteId', label: '已批准报价', type: 'select', required: true, props: { options: props.quotations.filter((item) => item.status === 'APPROVED').map((item) => ({ label: item.quoteNo, value: item.id })), allowSearch: true } },
  { field: 'name', label: '合同名称', type: 'input', required: true },
  { field: 'effectiveRange', label: '合同有效期', type: 'range-picker', props: { valueFormat: 'YYYY-MM-DD' } }
])
const reset = () => Object.assign(form, getInitForm())
const open = () => {
  reset()
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors) return false
  await createContract({ quoteId: form.quoteId, name: form.name.trim(), effectiveFrom: form.effectiveRange[0], effectiveTo: form.effectiveRange[1] })
  Message.success('合同创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
