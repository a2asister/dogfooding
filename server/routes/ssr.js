const Router = require('@koa/router');
const router = new Router();
const fs = require('fs');
const path = require('path');

// 尝试导入服务端渲染模块（生产环境）
let renderToStringWithRouter;
let generateFullHtml;

try {
  // 尝试从构建后的文件导入
  const ssrModulePath = path.join(__dirname, '../../dist/server-ssr.js');
  if (fs.existsSync(ssrModulePath)) {
    const ssrModule = require(ssrModulePath);
    renderToStringWithRouter = ssrModule.renderToStringWithRouter;
    generateFullHtml = ssrModule.generateFullHtml;
    console.log('成功加载 SSR 模块');
  }
} catch (err) {
  console.log('未找到构建后的 SSR 模块，将使用简单模板:', err.message);
}

// 读取 HTML 模板
const templatePath = path.join(__dirname, '../../dist/client/index.html');
let template = '';

try {
  if (fs.existsSync(templatePath)) {
    template = fs.readFileSync(templatePath, 'utf-8');
  }
} catch (err) {
  console.error('读取模板文件失败:', err);
}

// 处理所有页面请求的 SSR 路由
// 使用正则表达式匹配所有 GET 请求（排除 API 路由，因为它们已经被处理）
router.get('/(.*)', async (ctx) => {
  try {
    // 检查是否有服务端渲染模块可用
    if (renderToStringWithRouter && generateFullHtml && template) {
      // 使用服务端渲染
      const { html, context } = renderToStringWithRouter(ctx);
      
      // 检查是否需要重定向
      if (context.url) {
        ctx.redirect(context.url);
        return;
      }
      
      // 生成完整的 HTML 页面
      const fullHtml = generateFullHtml(html, {});
      ctx.body = fullHtml;
      return;
    }

    // 如果没有 SSR 模块，使用简单的模板
    if (process.env.NODE_ENV === 'development' || !template) {
      // 开发环境下返回简单的 HTML 结构
      ctx.body = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="游戏官方公测预约页面 - 预约获取公测资格，抢先体验精彩游戏内容">
          <meta name="keywords" content="游戏,公测,预约,官网">
          <title>游戏官方公测预约</title>
        </head>
        <body>
          <div id="root"></div>
          <script src="/main.js"></script>
        </body>
        </html>
      `;
      return;
    }

    // 生产环境下使用构建好的模板（无 SSR）
    ctx.body = template;
  } catch (err) {
    console.error('SSR 渲染失败:', err);
    ctx.status = 500;
    ctx.body = '服务器内部错误';
  }
});

module.exports = router;
