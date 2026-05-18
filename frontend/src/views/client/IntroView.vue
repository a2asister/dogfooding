<template>
  <div class="intro-page">
    <Header />

    <section class="hero-section">
      <div class="container">
        <h1>游戏介绍</h1>
        <p>探索星际幻想的宇宙世界，开启你的冒险之旅</p>
      </div>
    </section>

    <section class="section world-section">
      <div class="container">
        <h2 class="section-title">世界观</h2>
        <div class="world-content">
          <img src="https://picsum.photos/800/500?random=10" alt="世界观">
          <div class="world-text">
            <h3>星际纪元 3024年</h3>
            <p>在遥远的未来，人类已经掌握了星际旅行技术，开始探索银河系的各个角落。然而，随着资源的争夺和未知力量的觉醒，银河系陷入了前所未有的动荡。</p>
            <p>你将扮演一位勇敢的冒险者，在这个充满机遇与挑战的宇宙中，建立自己的势力，探索未知星域，揭开古老文明的秘密。</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section characters-section">
      <div class="container">
        <h2 class="section-title">核心角色</h2>
        <div class="characters-grid">
          <div v-for="(char, index) in characters" :key="index" class="character-card card">
            <img :src="char.image" :alt="char.name">
            <div class="character-info">
              <h3>{{ char.name }}</h3>
              <span class="character-role">{{ char.role }}</span>
              <p>{{ char.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section gameplay-section">
      <div class="container">
        <h2 class="section-title">基础玩法</h2>
        <div class="gameplay-grid">
          <div v-for="(item, index) in gameplayItems" :key="index" class="gameplay-card card">
            <div class="gameplay-icon">{{ item.icon }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section features-section">
      <div class="container">
        <h2 class="section-title">游戏特色</h2>
        <div class="features-list">
          <div v-for="(feature, index) in features" :key="index" class="feature-item">
            <div class="feature-icon">{{ feature.icon }}</div>
            <div class="feature-content">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'

const characters = ref([
  {
    name: '艾琳娜·星辰',
    role: '星际探险家',
    image: 'https://picsum.photos/400/500?random=11',
    description: '来自古老探索家族的后裔，拥有无与伦比的宇宙导航能力，立志探索银河系的每一个角落。'
  },
  {
    name: '凯恩·铁血',
    role: '军团指挥官',
    image: 'https://picsum.photos/400/500?random=12',
    description: '前帝国舰队上将，因不满腐败的统治而自立门户，建立了银河系最强大的雇佣军团。'
  },
  {
    name: '琳娜·启明',
    role: '灵能学者',
    image: 'https://picsum.photos/400/500?random=13',
    description: '古老文明的最后传人，掌握着失传已久的灵能技术，致力于揭开宇宙的终极奥秘。'
  }
])

const gameplayItems = ref([
  { icon: '🎯', title: '任务系统', description: '丰富的主线和支线任务，带你深入了解这个宇宙的故事' },
  { icon: '⚔️', title: '战斗系统', description: '实时动作战斗，多样化的技能组合，爽快的打击感' },
  { icon: '🏠', title: '基地建设', description: '建造和升级你的星际基地，发展科技，训练部队' },
  { icon: '👥', title: '社交互动', description: '加入公会，组队探险，结识来自各个星域的朋友' },
  { icon: '📦', title: '装备系统', description: '海量装备掉落，自由打造和强化，打造最强配置' },
  { icon: '🏆', title: '竞技对战', description: '公平的PVP竞技场，跨服联赛，展现你的实力' }
])

const features = ref([
  { icon: '🌌', title: '超大开放世界', description: '超过100个可探索星球，无缝连接的宇宙地图' },
  { icon: '🎨', title: '次世代画面', description: '4K超清画质，真实光影效果，极致的视觉享受' },
  { icon: '🎭', title: '自由职业系统', description: '无固定职业限制，自由搭配技能，创造你的专属玩法' },
  { icon: '🚀', title: '星际舰队', description: '组建你的星际舰队，开启星际战争，征服整个银河系' }
])
</script>

<style scoped lang="scss">
.intro-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-purple));
  padding: 80px 0;
  text-align: center;

  h1 {
    font-size: 48px;
    color: white;
    margin-bottom: 16px;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 20px;
  }
}

.section {
  padding: 80px 0;
}

.world-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;

  img {
    width: 100%;
    border-radius: 12px;
  }

  h3 {
    font-size: 28px;
    margin-bottom: 20px;
    background: linear-gradient(135deg, var(--secondary-color), var(--accent-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    color: var(--text-secondary);
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 16px;
  }
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.character-card {
  overflow: hidden;
  padding: 0;

  img {
    width: 100%;
    height: 350px;
    object-fit: cover;
  }

  .character-info {
    padding: 24px;

    h3 {
      font-size: 20px;
      margin-bottom: 8px;
      color: var(--text-primary);
    }

    .character-role {
      display: inline-block;
      background: var(--accent-purple);
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 12px;
    }

    p {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.gameplay-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.gameplay-card {
  text-align: center;
  padding: 32px 24px;

  .gameplay-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0;
    line-height: 1.6;
  }
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 32px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;

  .feature-icon {
    font-size: 48px;
    flex-shrink: 0;
  }

  .feature-content {
    h3 {
      font-size: 22px;
      margin-bottom: 12px;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.6;
      margin: 0;
    }
  }
}
</style>
