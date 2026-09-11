<template>
  <GiPageLayout margin bg-transparent>
    <div class="home-page">
      <a-card>
        <a-space direction="vertical" size="large" fill>
          <div>
            <h1>{{ greeting }}，{{ userStore.name }}</h1>
            <p>当前登录租户：{{ userStore.userInfo.tenantId }} · {{ userStore.userInfo.departmentName || '未分配部门' }}</p>
          </div>
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="登录账号">{{ userStore.userInfo.username }}</a-descriptions-item>
            <a-descriptions-item label="所属角色">{{ userStore.roles.join('、') || '无' }}</a-descriptions-item>
            <a-descriptions-item label="权限数量">{{ userStore.permissions.length }}</a-descriptions-item>
          </a-descriptions>
          <a-button v-if="userStore.roles.includes('admin')" type="primary" @click="router.push('/system/user')">
            进入系统管理
          </a-button>
        </a-space>
      </a-card>
    </div>
  </GiPageLayout>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores'
import { goodTimeText } from '@/utils'

defineOptions({ name: 'HomeIndex' })
const router = useRouter()
const userStore = useUserStore()
const greeting = computed(() => goodTimeText())
</script>

<style lang="scss" scoped>
.home-page {
  width: min(720px, 100%);
}

.home-page h1 {
  margin: 0 0 8px;
  font-size: 24px;
}

.home-page p {
  margin: 0;
  color: var(--color-text-3);
}
</style>
