<template>
  <a-modal v-model:visible="visible" title="新增获客渠道" :width="540" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { createAcquisitionChannel } from '@/apis/config/acquisition-channel'
import GiForm from '@/components/GiForm/GiForm.vue'

const emit = defineEmits<{ success: [] }>()
const getInitForm = () => ({ code: '', name: '', sourceType: '' })
const visible = ref(false)
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns: FormColumnItem[] = [
  { field: 'code', label: '渠道编码', type: 'input', required: true },
  { field: 'name', label: '渠道名称', type: 'input', required: true },
  { field: 'sourceType', label: '来源类型', type: 'input', required: true, props: { placeholder: '例如 WEBSITE、REFERRAL' } }
]
const reset = () => Object.assign(form, getInitForm())
const open = () => {
  reset()
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors) return false
  await createAcquisitionChannel({ code: form.code.trim(), name: form.name.trim(), sourceType: form.sourceType.trim().toUpperCase() })
  Message.success('获客渠道创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
