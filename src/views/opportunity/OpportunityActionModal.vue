<template>
  <a-modal v-model:visible="visible" :title="mode === 'stage' ? '推进商机阶段' : '商机输单'" :width="520" :on-before-ok="submit" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import type { OpportunityItem } from '@/apis/business/opportunity'
import type { FormColumnItem } from '@/components/GiForm/type'
import { Message } from '@arco-design/web-vue'
import { changeOpportunityStage, loseOpportunity } from '@/apis/business/opportunity'
import GiForm from '@/components/GiForm/GiForm.vue'

type Mode = 'stage' | 'lose'
const emit = defineEmits<{ success: [] }>()
const stages = [
  { label: '需求发现', value: 'DISCOVERY' },
  { label: '资格确认', value: 'QUALIFICATION' },
  { label: '方案沟通', value: 'SOLUTION' },
  { label: '报价', value: 'QUOTATION' },
  { label: '商务谈判', value: 'NEGOTIATION' }
]
const visible = ref(false)
const mode = ref<Mode>('stage')
const record = ref<OpportunityItem>()
const getInitForm = () => ({ stage: 'QUALIFICATION', probability: 20, reason: '' })
const form = reactive(getInitForm())
const formRef = ref<{ formRef?: FormInstance }>()
const columns = computed<FormColumnItem[]>(() => mode.value === 'stage'
  ? [
      { field: 'stage', label: '目标阶段', type: 'select', required: true, props: { options: stages } },
      { field: 'probability', label: '成交概率', type: 'slider', props: { min: 0, max: 100 } }
    ]
  : [{ field: 'reason', label: '输单原因', type: 'textarea', required: true }])
const reset = () => Object.assign(form, getInitForm())
const open = (nextMode: Mode, item: OpportunityItem) => {
  reset()
  mode.value = nextMode
  record.value = item
  form.probability = item.probability
  visible.value = true
}
const submit = async () => {
  const errors = await formRef.value?.formRef?.validate()
  if (errors || !record.value) return false
  if (mode.value === 'stage') await changeOpportunityStage(record.value, form.stage, form.probability)
  else await loseOpportunity(record.value, form.reason.trim())
  Message.success(mode.value === 'stage' ? '商机阶段已更新' : '商机已标记输单')
  emit('success')
  return true
}

defineExpose({ open })
</script>
