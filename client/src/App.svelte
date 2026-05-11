<script>
  import LikeButton from './LikeButton.svelte';
</script>

<main>
  <div class="container">
    <h1>点赞交互组件</h1>
    <p class="subtitle">多层心形动画效果</p>
    
    <div class="demo-card">
      <div class="post-content">
        <h2>这是一篇示例文章</h2>
        <p>点击下方的心形按钮体验多层点赞动画效果。连续快速点击可触发连击模式！</p>
      </div>
      
      <div class="interaction-area">
        <LikeButton postId={1} />
      </div>
    </div>
    
    <div class="tips">
      <h3>功能特性：</h3>
      <ul>
        <li>✅ 点击时灰色变红色，弹性缩放动画（Q弹质感）</li>
        <li>✅ 心形分裂成多个小爱心向四周飘散</li>
        <li>✅ 小爱心独立漂浮轨迹和旋转速度</li>
        <li>✅ CSS动画延迟产生错落感</li>
        <li>✅ 连续点赞触发连击模式</li>
        <li>✅ 心形持续跳动 + 显示+1、+2数字弹出</li>
        <li>✅ 数字沿弧线向上飘出后渐隐</li>
        <li>✅ 背景同心圆波纹扩散效果</li>
        <li>✅ 点击已点赞可取消点赞（数量-1）</li>
      </ul>
    </div>
  </div>
</main>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  main {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .container {
    max-width: 600px;
    width: 100%;
  }

  h1 {
    color: white;
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 8px;
    text-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .subtitle {
    color: rgba(255,255,255,0.85);
    text-align: center;
    font-size: 1.1rem;
    margin-bottom: 32px;
  }

  .demo-card {
    background: white;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    margin-bottom: 24px;
  }

  .post-content h2 {
    color: #1a1a2e;
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  .post-content p {
    color: #4a4a6a;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .interaction-area {
    display: flex;
    justify-content: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 16px;
    min-height: 100px;
  }

  .tips {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255,255,255,0.2);
  }

  .tips h3 {
    color: white;
    margin-bottom: 16px;
    font-size: 1.1rem;
  }

  .tips ul {
    list-style: none;
  }

  .tips li {
    color: rgba(255,255,255,0.9);
    padding: 8px 0;
    font-size: 0.95rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .tips li:last-child {
    border-bottom: none;
  }
</style>
