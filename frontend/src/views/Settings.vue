<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">系统设置</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">路由器设置</h2>
        <form @submit.prevent="saveRouterSettings" class="space-y-4">
          <div>
            <label class="label">SSID (网络名称)</label>
            <input v-model="routerSettings.ssid" type="text" class="input" />
          </div>
          <div>
            <label class="label">密码</label>
            <input v-model="routerSettings.password" type="password" class="input" placeholder="••••••••" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">信道</label>
              <select v-model="routerSettings.channel" class="input">
                <option :value="i" v-for="i in 13" :key="i">{{ i }}</option>
              </select>
            </div>
            <div>
              <label class="label">频段模式</label>
              <select v-model="routerSettings.mode" class="input">
                <option value="2.4G">2.4G</option>
                <option value="5G">5G</option>
                <option value="mixed">混合模式</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">路由器IP</label>
              <input v-model="routerSettings.ip" type="text" class="input" />
            </div>
            <div>
              <label class="label">子网掩码</label>
              <input v-model="routerSettings.subnetMask" type="text" class="input" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-full">保存路由器设置</button>
        </form>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-4">DHCP设置</h2>
        <form @submit.prevent="saveDHCPSettings" class="space-y-4">
          <div class="flex items-center">
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="dhcpSettings.enabled" 
                type="checkbox" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span class="ml-3">启用DHCP服务器</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">起始IP</label>
              <input 
                v-model="dhcpSettings.startIp" 
                type="text" 
                class="input" 
                :disabled="!dhcpSettings.enabled"
              />
            </div>
            <div>
              <label class="label">结束IP</label>
              <input 
                v-model="dhcpSettings.endIp" 
                type="text" 
                class="input" 
                :disabled="!dhcpSettings.enabled"
              />
            </div>
          </div>
          <div>
            <label class="label">租约时间 (秒)</label>
            <input 
              v-model.number="dhcpSettings.leaseTime" 
              type="number" 
              class="input" 
              min="60"
              :disabled="!dhcpSettings.enabled"
            />
          </div>
          <button type="submit" class="btn btn-primary w-full">保存DHCP设置</button>
        </form>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">防火墙设置</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span>启用防火墙</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="firewallSettings.enabled" 
                type="checkbox" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div class="flex justify-between items-center">
            <span>启用日志记录</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="firewallSettings.logEnabled" 
                type="checkbox" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <button @click="saveFirewallSettings" class="btn btn-primary w-full">保存防火墙设置</button>
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-4">告警设置</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span>启用告警通知</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="alertSettings.enabled" 
                type="checkbox" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div>
            <label class="label">通知邮箱</label>
            <input 
              v-model="alertSettings.email" 
              type="email" 
              class="input" 
              placeholder="email@example.com"
            />
          </div>
          <div class="flex justify-between items-center">
            <span>新设备接入提醒</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="alertSettings.newDeviceAlert" 
                type="checkbox" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div class="flex justify-between items-center">
            <span>异常行为告警</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="alertSettings.anomalyAlert" 
                type="checkbox" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <button @click="saveAlertSettings" class="btn btn-primary w-full">保存告警设置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const routerSettings = ref({
  ssid: 'HomeNetwork',
  password: '',
  channel: 6,
  mode: '2.4G',
  ip: '192.168.1.1',
  subnetMask: '255.255.255.0'
})

const dhcpSettings = ref({
  enabled: true,
  startIp: '192.168.1.100',
  endIp: '192.168.1.200',
  leaseTime: 86400
})

const firewallSettings = ref({
  enabled: true,
  logEnabled: true
})

const alertSettings = ref({
  enabled: true,
  email: '',
  newDeviceAlert: true,
  anomalyAlert: true
})

const fetchSettings = async () => {
  try {
    const response = await axios.get('/api/settings')
    if (response.data.success) {
      const data = response.data.data
      if (data.router) {
        routerSettings.value = { ...routerSettings.value, ...data.router }
      }
      if (data.dhcp) {
        dhcpSettings.value = { ...dhcpSettings.value, ...data.dhcp }
      }
      if (data.firewall) {
        firewallSettings.value = { ...firewallSettings.value, ...data.firewall }
      }
      if (data.alerts) {
        alertSettings.value = { ...alertSettings.value, ...data.alerts }
      }
    }
  } catch (error) {
    console.error('获取设置失败:', error)
  }
}

const saveRouterSettings = async () => {
  try {
    await axios.put('/api/settings/router', routerSettings.value)
    alert('路由器设置已保存')
  } catch (error) {
    console.error('保存路由器设置失败:', error)
    alert('保存失败')
  }
}

const saveDHCPSettings = async () => {
  try {
    await axios.put('/api/settings/dhcp', dhcpSettings.value)
    alert('DHCP设置已保存')
  } catch (error) {
    console.error('保存DHCP设置失败:', error)
    alert('保存失败')
  }
}

const saveFirewallSettings = async () => {
  try {
    await axios.put('/api/settings', { firewall: firewallSettings.value })
    alert('防火墙设置已保存')
  } catch (error) {
    console.error('保存防火墙设置失败:', error)
    alert('保存失败')
  }
}

const saveAlertSettings = async () => {
  try {
    await axios.put('/api/settings', { alerts: alertSettings.value })
    alert('告警设置已保存')
  } catch (error) {
    console.error('保存告警设置失败:', error)
    alert('保存失败')
  }
}

onMounted(() => {
  fetchSettings()
})
</script>
