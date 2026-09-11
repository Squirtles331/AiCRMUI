<template>
  <a-modal v-model:visible="visible" title="新增价目表" :width="600" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { createPriceList } from '@/apis/config/catalog'
import GiForm from '@/components/GiForm/GiForm.vue'

const emit = defineEmits<{ success: [] }>()
const getInitForm = () => ({ code: '', name: '', currency: 'CNY', effectiveRange: [] as string[] })
const visible = ref(false)
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns: FormColumnItem[] = [
  { field: 'code', label: '价目表编码', type: 'input', required: true },
  { field: 'name', label: '价目表名称', type: 'input', required: true },
  { field: 'currency', label: '币种', type: 'select', required: true, props: { options: [{ label: '人民币 CNY', value: 'CNY' }, { label: '美元 USD', value: 'USD' }, { label: '欧元 EUR', value: 'EUR' }] } },
  { field: 'effectiveRange', label: '有效期', type: 'range-picker', props: { showTime: true, valueFormat: 'YYYY-MM-DD HH:mm:ss' } }
]
const reset = () => Object.assign(form, getInitForm())
const open = () => {
  reset()
  visible.value = true
}
const toInstant = (value?: string) => value ? new Date(value.replace(' ', 'T')).toISOString() : undefined
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors) return false
  await createPriceList({
    code: form.code.trim(),
    name: form.name.trim(),
    currency: form.currency,
    effectiveFrom: toInstant(form.effectiveRange[0]),
    effectiveTo: toInstant(form.effectiveRange[1])
  })
  Message.success('价目表创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
