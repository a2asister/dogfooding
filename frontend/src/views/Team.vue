<template>
  <div class="team-page">
    <nav class="navbar">
      <h2>团队展示</h2>
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </nav>
    <TeamShowcase :members="members" :current-user-id="currentUserId" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import TeamShowcase from '@/components/TeamShowcase.vue'
import { TeamMember } from '@/types'
import gql from 'graphql-tag'

@Component({
  components: { TeamShowcase }
})
export default class Team extends Vue {
  members: TeamMember[] = []
  currentUserId = ''
  heartbeatInterval: number | null = null

  async mounted() {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      this.$router.push('/')
      return
    }

    const user = JSON.parse(userStr)
    this.currentUserId = user.id

    await this.fetchMembers()
    
    this.heartbeatInterval = window.setInterval(async () => {
      try {
        await (this as any).$apollo.mutate({
          mutation: gql`
            mutation Heartbeat($userId: String!) {
              heartbeat(userId: $userId) {
                id
                isOnline
              }
            }
          `,
          variables: { userId: this.currentUserId }
        })
        await this.fetchMembers()
      } catch (error) {
        console.error('心跳失败:', error)
      }
    }, 30000)
  }

  beforeDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
  }

  async fetchMembers() {
    try {
      const response = await (this as any).$apollo.query({
        query: gql`
          query GetMembers {
            members {
              id
              name
              email
              avatar
              role
              bio
              isOnline
              lastSeen
            }
          }
        `,
        fetchPolicy: 'network-only'
      })
      this.members = response.data.members
    } catch (error) {
      console.error('获取成员失败:', error)
    }
  }

  async handleLogout() {
    try {
      await (this as any).$apollo.mutate({
        mutation: gql`
          mutation Logout($userId: String!) {
            logout(userId: $userId)
          }
        `,
        variables: { userId: this.currentUserId }
      })
    } catch (error) {
      console.error('登出失败:', error)
    }
    
    localStorage.removeItem('user')
    ;(this as any).$router.push('/')
  }
}
</script>

<style lang="scss" scoped>
.team-page {
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  h2 {
    color: white;
    font-size: 20px;
  }
}

.logout-btn {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
