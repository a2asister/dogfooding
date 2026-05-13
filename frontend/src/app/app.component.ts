import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ProductService } from './services/product.service';
import { Product, Category, Favorite } from './models/product';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="container">
      <header class="header">
        <div class="logo">🎪 二手集市</div>
        <div class="nav-buttons">
          <button class="btn btn-primary" (click)="showStackView = !showStackView">
            {{ showStackView ? '📋 列表视图' : '🎴 堆叠浏览' }}
          </button>
          <button class="btn btn-secondary" (click)="openPublishModal()">➕ 发布商品</button>
          <button class="btn btn-secondary" (click)="showMyProducts()">👤 我的商品</button>
          <button class="btn btn-secondary" (click)="showFavorites()">❤️ 我的收藏</button>
        </div>
      </header>

      <div class="tabs" *ngIf="!showStackView">
        <button
          class="tab"
          [class.active]="activeTab === 'all'"
          (click)="activeTab = 'all'; loadProducts()"
        >
          全部商品
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'my'"
          (click)="showMyProducts()"
        >
          我的商品
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'favorites'"
          (click)="showFavorites()"
        >
          我的收藏
        </button>
      </div>

      <div class="categories-filter" *ngIf="!showStackView && categories.length">
        <button
          class="category-tag"
          [class.active]="selectedCategoryId === null"
          (click)="selectedCategoryId = null; loadProducts()"
        >
          全部
        </button>
        <button
          *ngFor="let cat of categories"
          class="category-tag"
          [class.active]="selectedCategoryId === cat.id"
          (click)="selectedCategoryId = cat.id; loadProducts()"
        >
          {{ cat.name }}
        </button>
      </div>

      <div *ngIf="showStackView" class="card-stack-container">
        <div
          *ngFor="let product of stackProducts; let i = index"
          class="stack-card"
          [class.swiped-left]="swipeDirection[i] === 'left'"
          [class.swiped-right]="swipeDirection[i] === 'right'"
          (mousedown)="startSwipe($event, i)"
          (touchstart)="startSwipe($event, i)"
        >
          <img [src]="product.images[0]" class="stack-card-image" alt="{{ product.title }}" />
          <div class="stack-card-content">
            <div class="stack-card-title">{{ product.title }}</div>
            <div class="stack-card-price">¥{{ product.price }}</div>
          </div>
        </div>
      </div>
      <div *ngIf="showStackView" class="stack-hint">
        ← 左滑跳过 | 右滑收藏 → | 点击查看详情
      </div>

      <div *ngIf="!showStackView && products.length" class="products-grid">
        <div
          *ngFor="let product of products; let i = index"
          class="product-card"
          [style.animation-delay]="i * 0.1 + 's'"
          (click)="openDetailModal(product)"
        >
          <div class="product-image-container">
            <img [src]="product.images[0]" class="product-image" alt="{{ product.title }}" />
          </div>
          <div class="product-info">
            <span class="product-category">{{ product.category.name }}</span>
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-price">¥{{ product.price }}</div>
          </div>
        </div>
      </div>

      <div *ngIf="!showStackView && !products.length" class="empty-state">
        <div class="empty-icon">📦</div>
        <div class="empty-text">暂无商品，快来发布第一个吧！</div>
      </div>
    </div>

    <div *ngIf="showDetailModal" class="modal-overlay" (click)="closeDetailModal($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header" *ngIf="selectedProduct">
          <h2 class="modal-title">{{ selectedProduct.title }}</h2>
          <button class="close-btn" (click)="showDetailModal = false">×</button>
        </div>
        <div class="modal-body" *ngIf="selectedProduct">
          <div class="detail-image-container">
            <img
              [src]="selectedProduct.images[currentImageIndex]"
              class="detail-image"
              alt="{{ selectedProduct.title }}"
            />
          </div>
          <div class="image-thumbs">
            <img
              *ngFor="let img of selectedProduct.images; let i = index"
              [src]="img"
              class="thumb"
              [class.active]="currentImageIndex === i"
              (click)="currentImageIndex = i"
              alt="缩略图"
            />
          </div>
          <div class="detail-price">¥{{ selectedProduct.price }}</div>
          <p class="detail-description">{{ selectedProduct.description }}</p>
          <div class="seller-info">
            <div class="seller-avatar">
              {{ selectedProduct.seller.username.charAt(0) }}
            </div>
            <div>
              <div class="seller-name">{{ selectedProduct.seller.username }}</div>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-favorite" (click)="toggleFavorite(selectedProduct)">
              ❤️ {{ isFavorite(selectedProduct) ? '已收藏' : '收藏' }}
            </button>
            <button
              *ngIf="selectedProduct.seller.id === currentUserId"
              class="btn btn-delete"
              (click)="deleteProduct(selectedProduct.id)"
            >
              🗑️ 删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="showPublishModal" class="modal-overlay" (click)="closePublishModal($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">发布新商品</h2>
          <button class="close-btn" (click)="showPublishModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">商品标题</label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="newProduct.title"
              placeholder="请输入商品标题"
            />
          </div>
          <div class="form-group">
            <label class="form-label">商品描述</label>
            <textarea
              class="form-textarea"
              [(ngModel)]="newProduct.description"
              placeholder="请输入商品描述"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">价格</label>
            <input
              type="number"
              class="form-input"
              [(ngModel)]="newProduct.price"
              placeholder="请输入价格"
            />
          </div>
          <div class="form-group">
            <label class="form-label">分类</label>
            <select class="form-select" [(ngModel)]="newProduct.categoryId">
              <option *ngFor="let cat of categories" [ngValue]="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">图片链接</label>
            <div class="images-input">
              <div *ngFor="let img of newProduct.images; let i = index" class="image-input-item">
                <img [src]="img" class="image-input-img" alt="商品图" />
                <button class="image-input-remove" (click)="removeImage(i)">×</button>
              </div>
              <button class="add-image-btn" (click)="addImage()">+</button>
            </div>
            <input
              type="text"
              class="form-input"
              style="margin-top: 10px"
              [(ngModel)]="tempImageUrl"
              placeholder="输入图片URL后点击+添加"
              (keyup.enter)="addImage()"
            />
          </div>
          <button
            class="btn btn-primary"
            style="width: 100%"
            (click)="publishProduct()"
          >
            🚀 发布商品
          </button>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee">
            <h3 style="margin-bottom: 15px; color: #333">添加新分类</h3>
            <div class="form-group">
              <label class="form-label">分类名称</label>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="newCategory.name"
                placeholder="请输入分类名称"
              />
            </div>
            <button
              class="btn btn-secondary"
              style="width: 100%"
              (click)="createCategory()"
            >
              ➕ 添加分类
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  favorites: Favorite[] = [];
  selectedProduct: Product | null = null;
  showDetailModal = false;
  showPublishModal = false;
  showStackView = false;
  selectedCategoryId: number | null = null;
  currentImageIndex = 0;
  currentUserId = 1;
  activeTab = 'all';
  stackProducts: Product[] = [];
  swipeDirection: { [key: number]: string } = {};
  tempImageUrl = '';

  newProduct = {
    title: '',
    description: '',
    price: 0,
    categoryId: 1,
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2',
    ],
  };

  newCategory = {
    name: '',
    description: '',
  };

  private startX = 0;
  private isDragging = false;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.productService.createUser('小明').subscribe({
      next: () => {},
      error: () => {},
    });

    this.productService.createCategory({ name: '电子产品', description: '手机、电脑、配件等' }).subscribe({
      next: () => {},
      error: () => {},
    });
    this.productService.createCategory({ name: '图书', description: '各类书籍' }).subscribe({
      next: () => {},
      error: () => {},
    });
    this.productService.createCategory({ name: '服装', description: '衣服鞋帽' }).subscribe({
      next: () => {},
      error: () => {},
    });
    this.productService.createCategory({ name: '家居', description: '家居用品' }).subscribe({
      next: () => {},
      error: () => {},
    });

    this.loadProducts();
    this.loadCategories();
    this.loadFavorites();
  }

  loadProducts() {
    if (this.activeTab === 'my') {
      this.productService.getProductsBySeller(this.currentUserId).subscribe({
        next: (data) => {
          this.products = this.selectedCategoryId
            ? data.filter((p) => p.category.id === this.selectedCategoryId)
            : data;
        },
        error: () => (this.products = []),
      });
    } else if (this.activeTab === 'favorites') {
      this.productService.getFavorites(this.currentUserId).subscribe({
        next: (data) => {
          const products = data.map((f) => f.product);
          this.products = this.selectedCategoryId
            ? products.filter((p) => p.category.id === this.selectedCategoryId)
            : products;
        },
        error: () => (this.products = []),
      });
    } else {
      this.productService.getProducts(this.selectedCategoryId ?? undefined).subscribe({
        next: (data) => {
          this.products = data;
          this.stackProducts = [...data].slice(0, 5);
        },
        error: () => {
          const mockProducts = this.getMockProducts();
          this.products = this.selectedCategoryId
            ? mockProducts.filter((p) => p.category.id === this.selectedCategoryId)
            : mockProducts;
          this.stackProducts = [...this.products].slice(0, 5);
        },
      });
    }
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: () => {
        this.categories = [
          { id: 1, name: '电子产品' },
          { id: 2, name: '图书' },
          { id: 3, name: '服装' },
          { id: 4, name: '家居' },
        ];
      },
    });
  }

  loadFavorites() {
    this.productService.getFavorites(this.currentUserId).subscribe({
      next: (data) => (this.favorites = data),
      error: () => (this.favorites = []),
    });
  }

  showMyProducts() {
    this.activeTab = 'my';
    this.showStackView = false;
    this.loadProducts();
  }

  showFavorites() {
    this.activeTab = 'favorites';
    this.showStackView = false;
    this.loadProducts();
  }

  openDetailModal(product: Product) {
    this.selectedProduct = product;
    this.currentImageIndex = 0;
    this.showDetailModal = true;
  }

  closeDetailModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showDetailModal = false;
    }
  }

  openPublishModal() {
    this.showPublishModal = true;
  }

  closePublishModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showPublishModal = false;
    }
  }

  publishProduct() {
    const productData = {
      ...this.newProduct,
      categoryId: Number(this.newProduct.categoryId),
      price: Number(this.newProduct.price),
      sellerId: this.currentUserId,
    };

    this.productService.createProduct(productData).subscribe({
      next: () => {
        this.showPublishModal = false;
        this.loadProducts();
        this.newProduct = {
          title: '',
          description: '',
          price: 0,
          categoryId: 1,
          images: [
            'https://picsum.photos/400/300?random=' + Date.now(),
            'https://picsum.photos/400/300?random=' + (Date.now() + 1),
          ],
        };
      },
      error: () => {
        const newProduct: Product = {
          id: Date.now(),
          title: this.newProduct.title,
          description: this.newProduct.description,
          price: this.newProduct.price,
          images: this.newProduct.images,
          category:
            this.categories.find((c) => c.id === this.newProduct.categoryId) ||
            this.categories[0],
          seller: { id: this.currentUserId, username: '小明' },
          createdAt: new Date().toISOString(),
        };
        this.products.unshift(newProduct);
        this.showPublishModal = false;
        this.newProduct = {
          title: '',
          description: '',
          price: 0,
          categoryId: 1,
          images: [
            'https://picsum.photos/400/300?random=' + Date.now(),
            'https://picsum.photos/400/300?random=' + (Date.now() + 1),
          ],
        };
      },
    });
  }

  createCategory() {
    if (!this.newCategory.name) return;

    this.productService.createCategory(this.newCategory).subscribe({
      next: (cat) => {
        this.categories.push(cat);
        this.newCategory = { name: '', description: '' };
      },
      error: () => {
        this.categories.push({
          id: this.categories.length + 1,
          name: this.newCategory.name,
        });
        this.newCategory = { name: '', description: '' };
      },
    });
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== id);
        this.showDetailModal = false;
      },
      error: () => {
        this.products = this.products.filter((p) => p.id !== id);
        this.showDetailModal = false;
      },
    });
  }

  isFavorite(product: Product): boolean {
    return this.favorites.some((f) => f.product.id === product.id);
  }

  toggleFavorite(product: Product) {
    const existing = this.favorites.find((f) => f.product.id === product.id);
    if (existing) {
      this.productService.removeFavorite(existing.id).subscribe({
        next: () => {
          this.favorites = this.favorites.filter((f) => f.id !== existing.id);
        },
        error: () => {
          this.favorites = this.favorites.filter((f) => f.id !== existing.id);
        },
      });
    } else {
      this.productService.addFavorite(this.currentUserId, product.id).subscribe({
        next: (fav) => {
          this.favorites.push(fav);
        },
        error: () => {
          this.favorites.push({
            id: Date.now(),
            product,
            createdAt: new Date().toISOString(),
          });
        },
      });
    }
  }

  addImage() {
    if (this.tempImageUrl) {
      this.newProduct.images.push(this.tempImageUrl);
      this.tempImageUrl = '';
    }
  }

  removeImage(index: number) {
    this.newProduct.images.splice(index, 1);
  }

  startSwipe(event: MouseEvent | TouchEvent, index: number) {
    if (index !== 0) return;
    this.isDragging = true;
    this.startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  }

  @HostListener('document:mouseup', ['$event'])
  @HostListener('document:touchend', ['$event'])
  endSwipe(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;

    const endX = 'changedTouches' in event ? event.changedTouches[0].clientX : event.clientX;
    const diff = endX - this.startX;

    if (Math.abs(diff) > 100) {
      const direction = diff > 0 ? 'right' : 'left';
      this.swipeDirection[0] = direction;

      if (direction === 'right' && this.stackProducts[0]) {
        this.toggleFavorite(this.stackProducts[0]);
      }

      setTimeout(() => {
        this.stackProducts.shift();
        delete this.swipeDirection[0];
      }, 400);
    }
  }

  private getMockProducts(): Product[] {
    return [
      {
        id: 1,
        title: 'iPhone 13 Pro 256G',
        description: '成色95新，无磕碰，功能完好，电池健康92%，配件齐全。',
        price: 5200,
        images: [
          'https://picsum.photos/400/300?random=10',
          'https://picsum.photos/400/300?random=11',
        ],
        category: { id: 1, name: '电子产品' },
        seller: { id: 1, username: '小明' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: '《三体》全集典藏版',
        description: '刘慈欣科幻巨著，精装版，几乎全新，未翻阅。',
        price: 128,
        images: [
          'https://picsum.photos/400/300?random=20',
          'https://picsum.photos/400/300?random=21',
        ],
        category: { id: 2, name: '图书' },
        seller: { id: 1, username: '小明' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Nike Air Max 运动鞋',
        description: '42码，仅穿过2次，几乎全新，正品保证。',
        price: 450,
        images: [
          'https://picsum.photos/400/300?random=30',
          'https://picsum.photos/400/300?random=31',
        ],
        category: { id: 3, name: '服装' },
        seller: { id: 1, username: '小明' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 4,
        title: '北欧风格台灯',
        description: '简约现代设计，可调光，护眼效果好，99新。',
        price: 180,
        images: [
          'https://picsum.photos/400/300?random=40',
          'https://picsum.photos/400/300?random=41',
        ],
        category: { id: 4, name: '家居' },
        seller: { id: 1, username: '小明' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 5,
        title: 'MacBook Pro 16寸 M1',
        description: '2021款，16G+512G，无拆无修，带原装充电器。',
        price: 12800,
        images: [
          'https://picsum.photos/400/300?random=50',
          'https://picsum.photos/400/300?random=51',
        ],
        category: { id: 1, name: '电子产品' },
        seller: { id: 1, username: '小明' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 6,
        title: '索尼WH-1000XM4 降噪耳机',
        description: '顶级降噪，音质出色，使用半年，成色好。',
        price: 1600,
        images: [
          'https://picsum.photos/400/300?random=60',
          'https://picsum.photos/400/300?random=61',
        ],
        category: { id: 1, name: '电子产品' },
        seller: { id: 1, username: '小明' },
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
