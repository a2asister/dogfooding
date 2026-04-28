// 服务端渲染钩子，用于处理 CSS 等资源文件的导入
// 在 Node.js 环境中，无法直接处理 CSS 导入，所以需要使用这个钩子

// 忽略 CSS、图片等资源文件的导入
const extensions = ['.css', '.scss', '.less', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];

extensions.forEach(ext => {
  require.extensions[ext] = () => {};
});

// 也可以使用 css-modules-require-hook 等库进行更复杂的处理
// 这里使用最简单的方式：直接忽略这些文件的导入
