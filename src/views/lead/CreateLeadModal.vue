<template>
  <a-modal v-model:visible="visible" title="新增线索" :width="620" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { AcquisitionChannelItem } from '@/apis/config/acquisition-channel'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { createLead } from '@/apis/business/lead'
import GiForm from '@/components/GiForm/GiForm.vue'

const props = defineProps<{ channels: AcquisitionChannelItem[] }>()
const emit = defineEmits<{ success: [] }>()
const getInitForm = () => ({ name: '', mobile: '', email: '', companyName: '', sourceType: '', sourceRef: '', intent: '', acquisitionChannelId: undefined as string | undefined })
const visible = ref(false)
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => [
  { field: 'name', label: '线索名称', type: 'input', required: true },
  { field: 'companyName', label: '公司名称', type: 'input' },
  { field: 'mobile', label: '手机号', type: 'input' },
  { field: 'email', label: '邮箱', type: 'input' },
  { field: 'sourceType', label: '来源类型', type: 'input', required: true },
  { field: 'acquisitionChannelId', label: '获客渠道', type: 'select', props: { options: props.channels.filter((item) => item.status === 'ACTIVE').map((item) => ({ label: `${item.code} - ${item.name}`, value: item.id })) } },
  { field: 'sourceRef', label: '来源标识', type: 'input' },
  { field: 'intent', label: '需求意向', type: 'textarea', span: 24 }
])
watch(() => form.acquisitionChannelId, (id) => {
  const channel = props.channels.find((item) => item.id === id)
  if (channel) form.sourceType = channel.sourceType
})
const reset = () => Object.assign(form, getInitForm())
const open = () => {
  reset()
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors) return false
  await createLead({
    name: form.name.trim(),
    mobile: form.mobile.trim() || undefined,
    email: form.email.trim() || undefined,
    companyName: form.companyName.trim() || undefined,
    sourceType: form.sourceType.trim().toUpperCase(),
    sourceRef: form.sourceRef.trim() || undefined,
    intent: form.intent.trim() || undefined,
    acquisitionChannelId: form.acquisitionChannelId
  })
  Message.success('线索创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
