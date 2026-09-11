<template>
  <GiPageLayout margin>
    <a-row justify="end" class="g-row-tool">
      <a-space wrap>
        <a-select v-model="queryParams.status" :options="statusOptions" placeholder="角色状态" allow-clear style="width: 130px" />
        <a-input-search v-model="queryParams.keyword" placeholder="角色编码或名称" allow-clear style="width: 240px" @search="search" />
        <GiButton type="search" @click="search" />
        <GiButton type="reset" @click="reset" />
      </a-space>
    </a-row>
    <GiTable title="角色列表" row-key="id" :data="roleList" :columns="tableColumns" :loading="loading"
      :pagination="pagination" :scroll="{ x: '100%', y: '100%', minWidth: 900 }" @refresh="refresh" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import { Tag } from '@arco-design/web-vue'
import { getRoleList } from '@/apis/system/role'
import { useTable } from '@/hooks'

defineOptions({ name: 'SystemRole' })
const statusOptions = [{ label: '正常', value: 1 }, { label: '停用', value: 0 }]
const scopeNames: Record<string, string> = { SELF: '仅本人', DEPARTMENT: '本部门', DEPARTMENT_AND_SUB: '本部门及下级', ALL: '全部数据' }
const queryParams = reactive<{ keyword: string, status?: number }>({ keyword: '', status: undefined })
const { loading, tableData: roleList, pagination, search, refresh } = useTable({
  listAPI: (page) => getRoleList({ ...page, keyword: queryParams.keyword.trim() || undefined, status: queryParams.status })
})
const reset = () => {
  queryParams.keyword = ''
  queryParams.status = undefined
  search()
}
const tableColumns: TableColumnData[] = [
  { title: '角色名称', dataIndex: 'name', width: 180 },
  { title: '角色编码', dataIndex: 'code', width: 180 },
  { title: '数据范围', width: 160, render: ({ record }) => <span>{scopeNames[record.dataScope] || record.dataScope}</span> },
  { title: '用户数', dataIndex: 'userCount', width: 100, align: 'center' },
  { title: '权限数', dataIndex: 'permissionCount', width: 100, align: 'center' },
  { title: '状态', width: 90, align: 'center', render: ({ record }) => <Tag color={record.status === 1 ? 'green' : 'red'}>{record.status === 1 ? '正常' : '停用'}</Tag> },
  { title: '创建时间', dataIndex: 'createdAt', width: 190 }
]
</script>
