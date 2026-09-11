<template>
  <a-drawer v-model:visible="visible" :width="760" title="客户详情" unmount-on-close>
    <a-descriptions v-if="customer" :column="2" bordered size="small" class="customer-summary">
      <a-descriptions-item label="客户编号">{{ customer.customerNo }}</a-descriptions-item>
      <a-descriptions-item label="客户名称">{{ customer.name }}</a-descriptions-item>
      <a-descriptions-item label="行业">{{ customer.industry || '-' }}</a-descriptions-item>
      <a-descriptions-item label="区域">{{ customer.region || '-' }}</a-descriptions-item>
    </a-descriptions>
    <GiTable title="联系人" row-key="id" :data="contacts" :columns="columns" :loading="loading" :pagination="false" @refresh="loadContacts">
      <template #custom-extra>
        <GiButton type="add" size="small" @click="customer && contactModalRef?.open(customer.id)" />
      </template>
    </GiTable>
    <AddContactModal ref="contactModalRef" @success="loadContacts" />
  </a-drawer>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import type { ContactItem, CustomerItem } from '@/apis/business/customer'
import { Tag } from '@arco-design/web-vue'
import { getContacts } from '@/apis/business/customer'
import AddContactModal from './AddContactModal.vue'

const visible = ref(false)
const loading = ref(false)
const customer = ref<CustomerItem>()
const contacts = ref<ContactItem[]>([])
const contactModalRef = ref<InstanceType<typeof AddContactModal>>()
const loadContacts = async () => {
  if (!customer.value) return
  try {
    loading.value = true
    contacts.value = (await getContacts(customer.value.id)).data
  } finally {
    loading.value = false
  }
}
const open = (record: CustomerItem) => {
  customer.value = record
  visible.value = true
  loadContacts()
}
const columns: TableColumnData[] = [
  { title: '姓名', dataIndex: 'name', width: 120 },
  { title: '部门', dataIndex: 'department', width: 130 },
  { title: '职位', dataIndex: 'title', width: 130 },
  { title: '手机号', dataIndex: 'mobile', width: 140 },
  { title: '邮箱', dataIndex: 'email', width: 190 },
  { title: '决策人', width: 90, align: 'center', render: ({ record }) => <Tag color={record.decisionMaker ? 'green' : 'gray'}>{record.decisionMaker ? '是' : '否'}</Tag> }
]

defineExpose({ open })
</script>

<style scoped>
.customer-summary {
  margin-bottom: var(--margin);
}
</style>
