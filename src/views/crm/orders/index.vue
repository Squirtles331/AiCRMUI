<template><CrmListPage title="销售订单" description="CRM 内销售订单台账，确认、取消与关闭均不依赖外部履约事实" endpoint="/orders" :columns="columns" :create-fields="fields" create-endpoint="/orders" :create-payload="createPayload" :actions="actions" /></template>
<script setup lang="ts">
import type { CrmAction, CrmColumn, CrmField } from '../components/CrmListPage.vue'
import CrmListPage from '../components/CrmListPage.vue'
const columns: CrmColumn[] = [{ title: '订单编号', dataIndex: 'orderNo' }, { title: '合同 ID', dataIndex: 'contractId' }, { title: '客户 ID', dataIndex: 'customerId' }, { title: '订单金额', dataIndex: 'totalAmount' }, { title: '状态', dataIndex: 'status' }, { title: '确认时间', dataIndex: 'confirmedAt' }, { title: '操作', dataIndex: 'operations' }]
const fields: CrmField[] = [{ key: 'contractId', label: '已签合同 ID', required: true }]
function createPayload(model: Record<string, any>) { return { contractId: model.contractId } }
const actions: CrmAction[] = [{ label: '确认', path: row => `/orders/${row.id}/actions/confirm`, visible: row => row.status === 'DRAFT' }, { label: '申请取消', path: row => `/orders/${row.id}/actions/request-cancel`, needsReason: true, idempotent: true, visible: row => row.status === 'CONFIRMED' }, { label: '内部关闭', path: row => `/orders/${row.id}/actions/close`, needsReason: true, visible: row => row.status === 'CONFIRMED' }]
</script>
