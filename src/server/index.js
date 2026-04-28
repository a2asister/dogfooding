import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '../client/App';

// 服务端渲染函数
export function renderToStringWithRouter(ctx) {
  const context = {};
  const html = renderToString(
    <StaticRouter location={ctx.url} context={context}>
      <App />
    </StaticRouter>
  );

  return {
    html,
    context
  };
}

// 生成完整的 HTML 页面
export function generateFullHtml(html, initialState = {}) {
  // 读取模板文件
  const templatePath = require('path').join(__dirname, '../../dist/client/index.html');
  let template = '';
  
  try {
    if (require('fs').existsSync(templatePath)) {
      template = require('fs').readFileSync(templatePath, 'utf-8');
    }
  } catch (err) {
    console.error('读取模板文件失败:', err);
  }

  // 如果没有模板，使用默认模板
  if (!template) {
    template = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="游戏官方公测预约页面 - 预约获取公测资格，抢先体验精彩游戏内容">
        <meta name="keywords" content="游戏,公测,预约,官网">
        <title>游戏官方公测预约</title>
        <link rel="stylesheet" href="/css/main.css">
      </head>
      <body>
        <div id="root"></div>
        <script src="/js/main.js"></script>
      </body>
      </html>
    `;
  }

  // 替换占位符
  const initialStateScript = `<script>window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}</script>`;
  
  let fullHtml = template
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    .replace('</head>', `${initialStateScript}</head>`);

  return fullHtml;
}
