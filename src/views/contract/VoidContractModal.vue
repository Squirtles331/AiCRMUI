<template>
  <a-modal v-model:visible="visible" title="作废合同" :width="520" :on-before-ok="submit" @close="form.reason = ''">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { ContractItem } from '@/apis/business/contract'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { voidContract } from '@/apis/business/contract'
import GiForm from '@/components/GiForm/GiForm.vue'

const emit = defineEmits<{ success: [] }>()
const visible = ref(false)
const record = ref<ContractItem>()
const form = reactive({ reason: '' })
const formRef = ref<{ formRef?: FormInstance }>()
const columns: FormColumnItem[] = [{ field: 'reason', label: '作废原因', type: 'textarea', required: true }]
const open = (item: ContractItem) => {
  record.value = item
  form.reason = ''
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors || !record.value) return false
  await voidContract(record.value, form.reason.trim())
  Message.success('合同已作废')
  emit('success')
  return true
}

defineExpose({ open })
</script>
