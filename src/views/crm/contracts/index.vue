<template><CrmListPage title="合同" description="从已审批报价创建合同并管理签署状态" endpoint="/contracts" :columns="columns" :create-fields="fields" create-endpoint="/contracts" :actions="actions" /></template>
<script setup lang="ts">
import type { CrmAction, CrmColumn, CrmField } from '../components/CrmListPage.vue'
import CrmListPage from '../components/CrmListPage.vue'
const columns: CrmColumn[] = [{ title: '合同编号', dataIndex: 'contractNo' }, { title: '合同名称', dataIndex: 'name' }, { title: '报价 ID', dataIndex: 'quoteId' }, { title: '金额', dataIndex: 'totalAmount' }, { title: '状态', dataIndex: 'status' }, { title: '有效期至', dataIndex: 'effectiveTo' }, { title: '操作', dataIndex: 'operations' }]
const fields: CrmField[] = [{ key: 'quoteId', label: '报价 ID', required: true }, { key: 'name', label: '合同名称', required: true }, { key: 'effectiveFrom', label: '生效日期', required: true, type: 'date' }, { key: 'effectiveTo', label: '到期日期', required: true, type: 'date' }]
const actions: CrmAction[] = [{ label: '提交签署', path: row => `/contracts/${row.id}/actions/submit-signature`, visible: row => row.status === 'DRAFT' }, { label: '确认签署', path: row => `/contracts/${row.id}/actions/sign`, visible: row => row.status === 'PENDING_SIGNATURE' }, { label: '撤回签署', path: row => `/contracts/${row.id}/actions/withdraw-signature`, visible: row => row.status === 'PENDING_SIGNATURE' }, { label: '作废', path: row => `/contracts/${row.id}/actions/void`, needsReason: true, visible: row => ['DRAFT', 'PENDING_SIGNATURE', 'SIGNED'].includes(row.status) }]
</script>
