# Photo Processor WASM Module

老照片修复WASM模块，包含图像去噪、纹理修复、色彩映射功能。

## 编译要求

- Rust 1.70+
- wasm-pack

## 安装依赖

```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

## 编译

```bash
cd wasm
wasm-pack build --target web --out-dir pkg
```

编译后将在 `pkg` 目录生成:
- `photo_processor_bg.wasm` - WASM二进制文件
- `photo_processor.js` - JavaScript绑定
- `photo_processor.d.ts` - TypeScript类型定义

## 可用函数

- `alloc(size: number) -> pointer` - 分配内存
- `dealloc(pointer, size)` - 释放内存
- `denoise(input, output, width, height, strength)` - 图像去噪
- `texture_restore(input, output, width, height, enhance)` - 纹理修复
- `colorize(input, output, width, height, intensity)` - 色彩映射
