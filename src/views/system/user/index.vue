<template>
  <GiPageLayout margin>
    <a-row justify="end" class="g-row-tool">
      <a-space wrap>
        <a-select v-model="queryParams.status" :options="statusOptions" placeholder="用户状态" allow-clear style="width: 130px" />
        <a-input-search v-model="queryParams.keyword" placeholder="用户名或姓名" allow-clear style="width: 240px" @search="search" />
        <GiButton type="search" @click="search" />
        <GiButton type="reset" @click="reset" />
      </a-space>
    </a-row>
    <GiTable title="用户列表" row-key="id" :data="userList" :columns="tableColumns" :loading="loading"
      :pagination="pagination" :scroll="{ x: '100%', y: '100%', minWidth: 1100 }" @refresh="refresh" />
  </GiPageLayout>
</template>

<script setup lang="tsx">
import type { TableColumnData } from '@arco-design/web-vue'
import { Tag } from '@arco-design/web-vue'
import { getUserList } from '@/apis/system/user'
import { useTable } from '@/hooks'

defineOptions({ name: 'SystemUser' })

const statusOptions = [{ label: '正常', value: 1 }, { label: '停用', value: 0 }]
const queryParams = reactive<{ keyword: string, status?: number }>({ keyword: '', status: undefined })
const { loading, tableData: userList, pagination, search, refresh } = useTable({
  listAPI: (page) => getUserList({ ...page, keyword: queryParams.keyword.trim() || undefined, status: queryParams.status })
})
const reset = () => {
  queryParams.keyword = ''
  queryParams.status = undefined
  search()
}
const tableColumns: TableColumnData[] = [
  { title: '用户名', dataIndex: 'username', width: 150 },
  { title: '姓名', dataIndex: 'name', width: 140 },
  { title: '部门', dataIndex: 'departmentName', width: 180 },
  { title: '角色', dataIndex: 'roleNames', width: 180, ellipsis: true, tooltip: true },
  { title: '手机号', dataIndex: 'mobile', width: 150 },
  { title: '邮箱', dataIndex: 'email', width: 220, ellipsis: true, tooltip: true },
  { title: '状态', width: 90, align: 'center', render: ({ record }) => <Tag color={record.status === 1 ? 'green' : 'red'}>{record.status === 1 ? '正常' : '停用'}</Tag> },
  { title: '创建时间', dataIndex: 'createdAt', width: 190 }
]
</script>
