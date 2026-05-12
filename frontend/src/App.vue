<template>
  <div class="container">
    <h1 class="title">💊 用药提醒</h1>
    <div class="card-grid">
      <MedicineCard
        v-for="medicine in medicines"
        :key="medicine.id"
        :medicine="medicine"
        :is-reminding="isTimeToRemind(medicine.time)"
        @taken="onMedicineTaken"
      />
    </div>
    <div v-if="medicines.length === 0" class="empty-state">
      <p>暂无药品，请添加药品到数据库</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MedicineCard from './components/MedicineCard.vue';
import axios from 'axios';
import type { Medicine } from './types';

@Component({
  components: { MedicineCard },
})
export default class App extends Vue {
  medicines: Medicine[] = [];

  async mounted() {
    await this.loadMedicines();
    setInterval(() => this.checkReminders(), 10000);
  }

  async loadMedicines() {
    try {
      const response = await axios.get<Medicine[]>('/api/medicines');
      this.medicines = response.data;
    } catch (error) {
      this.medicines = this.getDemoData();
    }
  }

  getDemoData(): Medicine[] {
    return [
      {
        id: 1,
        name: '维生素C',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
        dosage: '每日1片',
        time: this.getCurrentTime(),
        description: '维生素C有助于增强免疫力，促进胶原蛋白合成，保护细胞免受氧化损伤。',
        precautions: '过量服用可能导致腹泻。建议饭后服用，避免空腹。',
        isActive: true,
      },
      {
        id: 2,
        name: '鱼油胶囊',
        image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&h=300&fit=crop',
        dosage: '每日2粒',
        time: this.getCurrentTime(),
        description: '富含Omega-3脂肪酸，有助于心脑血管健康，改善血液循环。',
        precautions: '正在服用抗凝血药物者请遵医嘱。对海鲜过敏者慎用。',
        isActive: true,
      },
      {
        id: 3,
        name: '钙片',
        image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c061?w=300&h=300&fit=crop',
        dosage: '每日1-2片',
        time: this.getCurrentTime(),
        description: '补充钙质，维持骨骼和牙齿健康，预防骨质疏松。',
        precautions: '配合维生素D效果更佳。肾功能不全者请咨询医生。',
        isActive: true,
      },
    ];
  }

  getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  isTimeToRemind(time: string): boolean {
    const currentTime = this.getCurrentTime();
    const [hour1, min1] = currentTime.split(':').map(Number);
    const [hour2, min2] = time.split(':').map(Number);
    const diff = Math.abs((hour1 * 60 + min1) - (hour2 * 60 + min2));
    return diff <= 30;
  }

  checkReminders() {
    this.medicines.forEach((medicine) => {
      if (this.isTimeToRemind(medicine.time)) {
        console.log(`提醒：请服用 ${medicine.name}`);
      }
    });
  }

  async onMedicineTaken(medicine: Medicine) {
    console.log('已服药:', medicine.name);
    try {
      const records = await axios.get('/api/medicines/records/today');
      const record = records.data.find(
        (r: any) => r.medicineId === medicine.id && !r.taken
      );
      if (record) {
        await axios.put(`/api/medicines/records/${record.id}/take`);
      }
    } catch (error) {
      console.log('服药记录已标记（演示模式）');
    }
  }
}
</script>
