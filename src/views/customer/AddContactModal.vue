<template>
  <a-modal v-model:visible="visible" title="新增联系人" :width="560" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { addContact } from '@/apis/business/customer'
import GiForm from '@/components/GiForm/GiForm.vue'

const emit = defineEmits<{ success: [] }>()
const getInitForm = () => ({ name: '', mobile: '', email: '', department: '', title: '', decisionMaker: false })
const visible = ref(false)
const customerId = ref('')
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns: FormColumnItem[] = [
  { field: 'name', label: '联系人', type: 'input', required: true },
  { field: 'mobile', label: '手机号', type: 'input' },
  { field: 'email', label: '邮箱', type: 'input' },
  { field: 'department', label: '部门', type: 'input' },
  { field: 'title', label: '职位', type: 'input' },
  { field: 'decisionMaker', label: '关键决策人', type: 'switch' }
]
const reset = () => Object.assign(form, getInitForm())
const open = (id: string) => {
  reset()
  customerId.value = id
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors) return false
  await addContact(customerId.value, {
    name: form.name.trim(),
    mobile: form.mobile.trim() || undefined,
    email: form.email.trim() || undefined,
    department: form.department.trim() || undefined,
    title: form.title.trim() || undefined,
    decisionMaker: form.decisionMaker
  })
  Message.success('联系人创建成功')
  emit('success')
  return true
}

defineExpose({ open })
</script>
