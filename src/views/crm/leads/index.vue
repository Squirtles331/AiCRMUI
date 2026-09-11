<template><CrmListPage title="线索" description="管理私海线索并推进客户转化" endpoint="/leads/private" :columns="columns" :create-fields="fields" create-endpoint="/leads" :actions="actions" /></template>
<script setup lang="ts">
import type { CrmAction, CrmColumn, CrmField } from '../components/CrmListPage.vue'
import CrmListPage from '../components/CrmListPage.vue'
const columns: CrmColumn[] = [{ title: '线索编号', dataIndex: 'leadNo' }, { title: '姓名', dataIndex: 'name' }, { title: '公司', dataIndex: 'companyName' }, { title: '意向', dataIndex: 'intent' }, { title: '状态', dataIndex: 'status' }, { title: '下次跟进', dataIndex: 'nextFollowUpAt' }, { title: '操作', dataIndex: 'operations' }]
const fields: CrmField[] = [{ key: 'name', label: '姓名', required: true }, { key: 'mobile', label: '手机号' }, { key: 'email', label: '邮箱' }, { key: 'companyName', label: '公司名称' }, { key: 'sourceType', label: '来源类型', required: true }, { key: 'intent', label: '意向说明', type: 'textarea' }]
const actions: CrmAction[] = [{ label: '标记无效', path: row => `/leads/${row.id}/actions/invalidate`, needsReason: true }]
</script>
