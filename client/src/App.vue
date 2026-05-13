<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { gql } from '@apollo/client/core';
import Food3D from './components/Food3D.vue';
import PlateProgress from './components/PlateProgress.vue';
import NutritionRing from './components/NutritionRing.vue';

interface Food {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  unit: string;
  image: string;
}

interface MealRecord {
  id: number;
  food: Food;
  quantity: number;
  mealType: string;
  date: string;
}

const GET_FOODS = gql`
  query GetFoods {
    foods {
      id
      name
      category
      calories
      protein
      fat
      carbs
      unit
      image
    }
  }
`;

const GET_MEAL_RECORDS = gql`
  query GetMealRecords($date: String!) {
    mealRecordsByDate(date: $date) {
      id
      food {
        id
        name
        calories
        protein
        fat
        carbs
      }
      quantity
      mealType
      date
    }
  }
`;

const CREATE_MEAL_RECORD = gql`
  mutation CreateMealRecord($createMealRecordInput: CreateMealRecordInput!) {
    createMealRecord(createMealRecordInput: $createMealRecordInput) {
      id
      food {
        id
        name
      }
      quantity
      mealType
      date
    }
  }
`;

const CREATE_FOOD = gql`
  mutation CreateFood($createFoodInput: CreateFoodInput!) {
    createFood(createFoodInput: $createFoodInput) {
      id
      name
      calories
    }
  }
`;

const DELETE_MEAL_RECORD = gql`
  mutation DeleteMealRecord($id: Int!) {
    deleteMealRecord(id: $id)
  }
`;

const GET_MEAL_RECORDS_RANGE = gql`
  query GetMealRecordsRange($startDate: String!, $endDate: String!) {
    mealRecordsByDateRange(startDate: $startDate, endDate: $endDate) {
      id
      food {
        id
        name
        calories
        protein
        fat
        carbs
      }
      quantity
      mealType
      date
    }
  }
`;

const foods = ref<Food[]>([]);
const mealRecords = ref<MealRecord[]>([]);
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const dailyGoal = ref(2000);
const showAddFoodModal = ref(false);
const activeTab = ref('dashboard');

const newFood = ref({
  name: '',
  category: '主食',
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
});

const { result: foodsResult, refetch: refetchFoods } = useQuery(GET_FOODS);

watch(foodsResult, (data) => {
  if (data?.foods) {
    foods.value = data.foods;
  }
});

const { result: recordsResult, refetch: refetchRecords } = useQuery(GET_MEAL_RECORDS, {
  variables: computed(() => ({ date: selectedDate.value })),
});

watch(recordsResult, (data) => {
  if (data?.mealRecordsByDate) {
    mealRecords.value = data.mealRecordsByDate;
  }
});

watch(selectedDate, () => {
  refetchRecords();
});

const { mutate: createMealRecordMutate } = useMutation(CREATE_MEAL_RECORD, {
  refetchQueries: computed(() => [
    { query: GET_MEAL_RECORDS, variables: { date: selectedDate.value } },
  ]),
});

const { mutate: createFoodMutate } = useMutation(CREATE_FOOD, {
  refetchQueries: [{ query: GET_FOODS }],
});

const { mutate: deleteMealRecordMutate } = useMutation(DELETE_MEAL_RECORD, {
  refetchQueries: computed(() => [
    { query: GET_MEAL_RECORDS, variables: { date: selectedDate.value } },
  ]),
});

const mealsForPlate = computed(() => {
  return mealRecords.value.map((record) => ({
    name: record.food.name,
    calories: record.food.calories,
    quantity: record.quantity,
  }));
});

const nutritionSummary = computed(() => {
  return mealRecords.value.reduce(
    (acc, record) => ({
      protein: acc.protein + record.food.protein * record.quantity,
      fat: acc.fat + record.food.fat * record.quantity,
      carbs: acc.carbs + record.food.carbs * record.quantity,
    }),
    { protein: 0, fat: 0, carbs: 0 }
  );
});

const todayCalories = computed(() => {
  return mealRecords.value.reduce((sum, record) => sum + record.food.calories * record.quantity, 0);
});

const handleFoodSelect = (food: Food): void => {
  createMealRecordMutate({
    createMealRecordInput: {
      foodId: food.id,
      quantity: 1,
      mealType: 'breakfast',
      date: selectedDate.value,
    },
  });
};

const handleDeleteMeal = (id: number): void => {
  deleteMealRecordMutate({ id });
};

const handleAddFood = (): void => {
  if (!newFood.value.name) return;
  createFoodMutate({
    createFoodInput: newFood.value,
  });
  newFood.value = {
    name: '',
    category: '主食',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };
  showAddFoodModal.value = false;
};

const getWeeklyStats = computed(() => {
  const today = new Date(selectedDate.value);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  const startDate = weekStart.toISOString().split('T')[0];
  
  const dailyStats: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dailyStats[date.toISOString().split('T')[0]] = 0;
  }
  
  mealRecords.value.forEach((record) => {
    if (dailyStats[record.date] !== undefined) {
      dailyStats[record.date] += record.food.calories * record.quantity;
    }
  });
  
  return Object.entries(dailyStats).map(([date, calories]) => ({
    date,
    calories,
    dayName: new Date(date).toLocaleDateString('zh-CN', { weekday: 'short' }),
  }));
});

const getFoodCategories = computed(() => {
  const categories: Record<string, number> = {};
  mealRecords.value.forEach((record) => {
    const cat = record.food.category;
    categories[cat] = (categories[cat] || 0) + record.food.calories * record.quantity;
  });
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
});

onMounted(() => {
  refetchFoods();
  refetchRecords();
});
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🥗 智能饮食热量可视化管理平台</h1>
      <p>健康饮食，从记录每一餐开始</p>
      <div class="date-selector">
        <input type="date" v-model="selectedDate" />
      </div>
    </header>

    <nav class="app-nav">
      <button
        v-for="tab in [
          { id: 'dashboard', label: '📊 仪表盘' },
          { id: 'foods', label: '🍎 食物库' },
          { id: 'records', label: '📝 饮食日志' },
          { id: 'stats', label: '📈 数据统计' },
        ]"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <main class="main-content">
      <div v-if="activeTab === 'dashboard'" class="dashboard">
        <div class="row">
          <Food3D :foods="foods" @select="handleFoodSelect" />
        </div>

        <div class="row two-column">
          <PlateProgress :meals="mealsForPlate" :daily-goal="dailyGoal" />
          <NutritionRing :nutrition="nutritionSummary" />
        </div>
      </div>

      <div v-if="activeTab === 'foods'" class="foods-page">
        <div class="page-header">
          <h2>🍎 食物热量数据库</h2>
          <button class="btn-primary" @click="showAddFoodModal = true">
            + 添加食物
          </button>
        </div>

        <div class="foods-grid">
          <div v-for="food in foods" :key="food.id" class="food-card">
            <div class="food-icon">🥗</div>
            <h3>{{ food.name }}</h3>
            <div class="food-category">{{ food.category }}</div>
            <div class="food-nutrition">
              <span class="nutrition-item">🔥 {{ food.calories }} kcal</span>
              <span class="nutrition-item">💪 {{ food.protein }}g 蛋白</span>
              <span class="nutrition-item">🥑 {{ food.fat }}g 脂肪</span>
              <span class="nutrition-item">🍞 {{ food.carbs }}g 碳水</span>
            </div>
            <button class="btn-add" @click="handleFoodSelect(food)">
              添加到今日饮食
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'records'" class="records-page">
        <div class="page-header">
          <h2>📝 今日饮食记录</h2>
          <div class="total-calories">
            总计: <strong>{{ todayCalories }}</strong> / {{ dailyGoal }} kcal
          </div>
        </div>

        <div class="records-list">
          <div v-if="mealRecords.length === 0" class="empty-state">
            暂无饮食记录，点击食物卡片添加吧！
          </div>
          <div v-for="record in mealRecords" :key="record.id" class="record-item">
            <div class="record-food">
              <span class="record-name">{{ record.food.name }}</span>
              <span class="record-quantity">x{{ record.quantity }}</span>
            </div>
            <div class="record-calories">
              {{ record.food.calories * record.quantity }} kcal
            </div>
            <button class="btn-delete" @click="handleDeleteMeal(record.id)">
              ✕
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'stats'" class="stats-page">
        <h2>📈 饮食数据统计</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <h3>本周摄入趋势</h3>
            <div class="weekly-chart">
              <div v-for="stat in weeklyStats" :key="stat.date" class="chart-bar">
                <div
                  class="bar-fill"
                  :style="{ height: `${Math.min((stat.calories / dailyGoal) * 100, 100)}%` }"
                ></div>
                <span class="bar-label">{{ stat.dayName }}</span>
                <span class="bar-value">{{ stat.calories }}</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <h3>今日营养分布</h3>
            <div class="nutrition-stats">
              <div class="stat-item">
                <span class="stat-label">蛋白质</span>
                <span class="stat-value">{{ nutritionSummary.protein.toFixed(1) }}g</span>
                <div class="stat-bar protein" :style="{ width: `${Math.min(nutritionSummary.protein * 2, 100)}%` }"></div>
              </div>
              <div class="stat-item">
                <span class="stat-label">脂肪</span>
                <span class="stat-value">{{ nutritionSummary.fat.toFixed(1) }}g</span>
                <div class="stat-bar fat" :style="{ width: `${Math.min(nutritionSummary.fat * 2, 100)}%` }"></div>
              </div>
              <div class="stat-item">
                <span class="stat-label">碳水化合物</span>
                <span class="stat-value">{{ nutritionSummary.carbs.toFixed(1) }}g</span>
                <div class="stat-bar carbs" :style="{ width: `${Math.min(nutritionSummary.carbs * 0.5, 100)}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showAddFoodModal" class="modal-overlay" @click="showAddFoodModal = false">
      <div class="modal" @click.stop>
        <h3>添加新食物</h3>
        <div class="form-group">
          <label>食物名称</label>
          <input type="text" v-model="newFood.name" placeholder="例如：米饭" />
        </div>
        <div class="form-group">
          <label>分类</label>
          <select v-model="newFood.category">
            <option value="主食">主食</option>
            <option value="肉类">肉类</option>
            <option value="蔬菜">蔬菜</option>
            <option value="水果">水果</option>
            <option value="蛋类">蛋类</option>
            <option value="饮品">饮品</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>热量 (kcal)</label>
            <input type="number" v-model.number="newFood.calories" min="0" />
          </div>
          <div class="form-group">
            <label>蛋白质 (g)</label>
            <input type="number" v-model.number="newFood.protein" min="0" step="0.1" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>脂肪 (g)</label>
            <input type="number" v-model.number="newFood.fat" min="0" step="0.1" />
          </div>
          <div class="form-group">
            <label>碳水化合物 (g)</label>
            <input type="number" v-model.number="newFood.carbs" min="0" step="0.1" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showAddFoodModal = false">取消</button>
          <button class="btn-primary" @click="handleAddFood">添加</button>
        </div>
      </div>
    </div>

    <footer class="app-footer">
      <p>© 2024 智能饮食管理平台 | 让健康触手可及</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  padding: 20px;
}

.app-header {
  text-align: center;
  color: white;
  padding: 20px 0;
}

.app-header h1 {
  font-size: 32px;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.app-header p {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 15px;
}

.date-selector input {
  padding: 8px 15px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
}

.app-nav {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.app-nav button {
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.app-nav button:hover,
.app-nav button.active {
  background: white;
  color: #667eea;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

.row {
  margin-bottom: 30px;
}

.row.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  color: white;
}

.page-header h2 {
  font-size: 24px;
}

.total-calories {
  font-size: 18px;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: scale(1.05);
}

.foods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.food-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.food-card:hover {
  transform: translateY(-5px);
}

.food-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.food-card h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 5px;
}

.food-category {
  color: #667eea;
  font-size: 14px;
  margin-bottom: 15px;
}

.food-nutrition {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 20px;
}

.nutrition-item {
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  padding: 5px 10px;
  border-radius: 15px;
}

.btn-add {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-add:hover {
  opacity: 0.9;
}

.records-list {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 16px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 10px;
}

.record-food {
  flex: 1;
}

.record-name {
  font-weight: 600;
  color: #333;
  margin-right: 10px;
}

.record-quantity {
  color: #667eea;
  font-size: 14px;
}

.record-calories {
  font-weight: 600;
  color: #764ba2;
}

.btn-delete {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #ff6b6b;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.stats-page h2 {
  color: white;
  margin-bottom: 25px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.weekly-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  gap: 10px;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 8px 8px 0 0;
  transition: height 0.5s ease;
  min-height: 5px;
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.bar-value {
  font-size: 11px;
  color: #999;
}

.nutrition-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-bar {
  height: 8px;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.stat-bar.protein {
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.stat-bar.fat {
  background: linear-gradient(90deg, #f093fb, #f5576c);
}

.stat-bar.carbs {
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  font-size: 24px;
  margin-bottom: 25px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.modal-actions .btn-primary {
  flex: 1;
}

.app-footer {
  text-align: center;
  color: white;
  padding: 30px 0;
  opacity: 0.8;
}

@media (max-width: 900px) {
  .row.two-column,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
