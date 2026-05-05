import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_BASE_PATH = path.join(__dirname, '../../../public');

class StaticRenderer {
  constructor() {}

  async renderAndPublish(site, contents, siteId) {
    const sitePublicPath = path.join(PUBLIC_BASE_PATH, site.domain);
    await fs.ensureDir(sitePublicPath);
    
    const routes = await db.findAll('routes', siteId);
    const activeRoutes = routes.filter(r => r.status === 'active').sort((a, b) => b.priority - a.priority);
    
    const results = {
      pages: [],
      staticFiles: [],
      errors: []
    };
    
    await this.generateSiteIndex(site, sitePublicPath, siteId);
    
    for (const content of contents) {
      try {
        const result = await this.renderContent(content, site, activeRoutes, sitePublicPath, siteId);
        if (result) {
          results.pages.push(result);
        }
      } catch (error) {
        results.errors.push({
          contentId: content.id,
          slug: content.slug,
          error: error.message
        });
      }
    }
    
    await this.generateSitemap(site, contents, sitePublicPath);
    await this.generateRobotsTxt(site, sitePublicPath);
    
    return results;
  }

  async generateSiteIndex(site, sitePublicPath, siteId) {
    const indexPath = path.join(sitePublicPath, 'index.html');
    
    const html = this.generateHTML({
      title: site.settings?.seo?.title || site.name,
      description: site.settings?.seo?.description || site.description || '',
      keywords: site.settings?.seo?.keywords?.join(', ') || '',
      body: `
        <div class="container">
          <header>
            <h1>${site.name}</h1>
            <p>${site.description || ''}</p>
          </header>
          <main>
            <div id="content"></div>
          </main>
        </div>
      `,
      site: site
    });
    
    await fs.writeFile(indexPath, html, 'utf-8');
  }

  async renderContent(content, site, routes, sitePublicPath, siteId) {
    const matchingRoute = this.findMatchingRoute(content, routes);
    
    if (!matchingRoute) {
      return null;
    }
    
    const urlPath = this.generateUrlPath(content, matchingRoute);
    const outputPath = path.join(sitePublicPath, urlPath, 'index.html');
    
    await fs.ensureDir(path.dirname(outputPath));
    
    const html = this.generateContentHTML(content, site, matchingRoute);
    
    await fs.writeFile(outputPath, html, 'utf-8');
    
    return {
      contentId: content.id,
      slug: content.slug,
      urlPath: `/${urlPath}`,
      outputPath
    };
  }

  findMatchingRoute(content, routes) {
    for (const route of routes) {
      if (route.type === 'model' && route.targetModel === content.modelSlug) {
        return route;
      }
      if (route.type === 'single' && route.pattern === `/${content.slug}`) {
        return route;
      }
    }
    return null;
  }

  generateUrlPath(content, route) {
    if (route.type === 'model') {
      const pattern = route.pattern;
      return pattern
        .replace(':modelSlug', content.modelSlug)
        .replace(':slug', content.slug)
        .replace(/^\//, '');
    }
    return content.slug;
  }

  generateContentHTML(content, site, route) {
    const title = content.seo?.title || content.data?.title || content.data?.name || site.name;
    const description = content.seo?.description || content.data?.excerpt || content.data?.description || '';
    
    let bodyContent = '';
    
    if (content.data) {
      bodyContent = `
        <article class="article">
          <header class="article-header">
            <h1 class="article-title">${this.escapeHtml(content.data.title || content.data.name || '')}</h1>
            ${content.data.excerpt ? `<p class="article-excerpt">${this.escapeHtml(content.data.excerpt)}</p>` : ''}
          </header>
          <div class="article-content">
            ${content.data.content || ''}
          </div>
        </article>
      `;
    }
    
    return this.generateHTML({
      title,
      description,
      keywords: content.seo?.keywords?.join(', ') || '',
      body: `
        <div class="container">
          <header class="site-header">
            <div class="header-inner">
              <a href="/" class="site-logo">${this.escapeHtml(site.name)}</a>
              <nav class="site-nav">
                <a href="/">首页</a>
              </nav>
            </div>
          </header>
          <main class="main-content">
            ${bodyContent}
          </main>
          <footer class="site-footer">
            <p>&copy; ${new Date().getFullYear()} ${this.escapeHtml(site.name)}. All rights reserved.</p>
          </footer>
        </div>
      `,
      site,
      article: content
    });
  }

  generateHTML({ title, description, keywords, body, site, article }) {
    const $ = cheerio.load('<!DOCTYPE html><html><head></head><body></body></html>', { decodeEntities: false });
    
    $('head').append(`<meta charset="UTF-8">`);
    $('head').append(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
    $('head').append(`<title>${this.escapeHtml(title)}</title>`);
    
    if (description) {
      $('head').append(`<meta name="description" content="${this.escapeHtml(description)}">`);
    }
    
    if (keywords) {
      $('head').append(`<meta name="keywords" content="${this.escapeHtml(keywords)}">`);
    }
    
    $('head').append(`
      <meta property="og:type" content="website">
      <meta property="og:title" content="${this.escapeHtml(title)}">
      <meta property="og:description" content="${this.escapeHtml(description)}">
      <meta property="og:site_name" content="${this.escapeHtml(site?.name || '')}">
    `);
    
    if (article?.data?.featuredImage) {
      $('head').append(`<meta property="og:image" content="${this.escapeHtml(article.data.featuredImage)}">`);
    }
    
    $('head').append(`
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9fafb;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .site-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .site-logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
        }
        .site-nav a {
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          margin-left: 1.5rem;
          transition: color 0.3s;
        }
        .site-nav a:hover {
          color: white;
        }
        .main-content {
          padding: 2rem 0;
          min-height: calc(100vh - 200px);
        }
        .article {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .article-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .article-title {
          font-size: 2rem;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        .article-excerpt {
          color: #6b7280;
          font-size: 1.1rem;
        }
        .article-content {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #374151;
        }
        .article-content h1, .article-content h2, .article-content h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #1f2937;
        }
        .article-content p {
          margin-bottom: 1rem;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1rem 0;
        }
        .article-content ul, .article-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .article-content blockquote {
          border-left: 4px solid #667eea;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
          font-style: italic;
        }
        .site-footer {
          background: #1f2937;
          color: #9ca3af;
          padding: 1.5rem 0;
          text-align: center;
        }
        @media (max-width: 768px) {
          .article-title {
            font-size: 1.5rem;
          }
          .article {
            padding: 1rem;
          }
        }
      </style>
    `);
    
    $('body').append(body);
    
    return $.html();
  }

  async generateSitemap(site, contents, sitePublicPath) {
    const sitemapPath = path.join(sitePublicPath, 'sitemap.xml');
    
    let urls = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${site.domain}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;
    
    for (const content of contents) {
      if (content.status === 'published') {
        const lastmod = content.publishedAt ? content.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0];
        urls += `
  <url>
    <loc>https://${site.domain}/${content.modelSlug}/${content.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }
    
    urls += '</urlset>';
    
    await fs.writeFile(sitemapPath, urls, 'utf-8');
  }

  async generateRobotsTxt(site, sitePublicPath) {
    const robotsPath = path.join(sitePublicPath, 'robots.txt');
    
    const content = `User-agent: *
Allow: /
Sitemap: https://${site.domain}/sitemap.xml
`;
    
    await fs.writeFile(robotsPath, content, 'utf-8');
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }
}

export const staticRenderer = new StaticRenderer();
export default staticRenderer;
