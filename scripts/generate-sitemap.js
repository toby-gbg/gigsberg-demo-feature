//UPDATED: Nextjs support it by default

// #!/usr/bin/env node

// /**
//  * This script generates a sitemap.xml file based on the customer's domain
//  * It can be run with: node scripts/generate-sitemap.js --domain=example.com
//  */

// const fs = require('fs');
// const path = require('path');
// const { execSync } = require('child_process');

// // Parse command line arguments
// const args = process.argv.slice(2);
// let domain = null;

// // Extract domain from arguments
// args.forEach(arg => {
//   if (arg.startsWith('--domain=')) {
//     domain = arg.split('=')[1];
//   }
// });

// // If no domain provided, try to get from environment variables
// if (!domain) {
//   domain = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
// }

// // If still no domain, use default
// if (!domain) {
//   domain = 'gigsberg.co.uk';
//   console.warn('No domain specified, using default:', domain);
// }

// // Remove any protocol if included
// domain = domain.replace(/^https?:\/\//, '');

// // Create sitemap content
// const generateSitemap = (domain) => {
//   const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
//   const baseUrl = `${protocol}://${domain}`;
//   const today = new Date().toISOString().split('T')[0];

//   // You can expand this list or fetch it from your database/CMS
//   const routes = [
//     { url: '/', changefreq: 'daily', priority: 1.0 },
//     { url: '/about', changefreq: 'monthly', priority: 0.8 },
//     { url: '/contact', changefreq: 'monthly', priority: 0.8 },
//     // Add more routes as needed
//   ];

//   let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
//   sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

//   routes.forEach(route => {
//     sitemap += '  <url>\n';
//     sitemap += `    <loc>${baseUrl}${route.url}</loc>\n`;
//     sitemap += `    <lastmod>${today}</lastmod>\n`;
//     sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
//     sitemap += `    <priority>${route.priority}</priority>\n`;
//     sitemap += '  </url>\n';
//   });

//   sitemap += '</urlset>';
//   return sitemap;
// };

// // Generate robots.txt content
// const generateRobotsTxt = (domain) => {
//   const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
//   const baseUrl = `${protocol}://${domain}`;

//   return `User-agent: *
// Allow: /

// # Block access to admin paths
// Disallow: /admin/
// Disallow: /api/

// Crawl-delay: 10

// User-agent: Googlebot
// Crawl-delay: 5

// User-agent: Bingbot
// Crawl-delay: 5

// User-agent: MJ12bot
// Crawl-delay: 10

// # Sitemap location
// Sitemap: ${baseUrl}/sitemap.xml
// Sitemap: ${baseUrl}/sitemap.xml.gz
// `;
// };

// // Write sitemap to file
// const publicDir = path.resolve(__dirname, '../public');
// const sitemapContent = generateSitemap(domain);
// const robotsContent = generateRobotsTxt(domain);

// fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
// fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent);

// console.log(`✅ Generated sitemap.xml and robots.txt for domain: ${domain}`);

// // Also create a gzipped version of the sitemap
// try {
//   const gzipPath = path.join(publicDir, 'sitemap.xml.gz');
//   fs.writeFileSync(path.join(publicDir, 'sitemap.xml.tmp'), sitemapContent);
//   execSync(`gzip -c "${path.join(publicDir, 'sitemap.xml.tmp')}" > "${gzipPath}"`);
//   fs.unlinkSync(path.join(publicDir, 'sitemap.xml.tmp'));
//   console.log('✅ Generated sitemap.xml.gz');
// } catch (error) {
//   console.error('Error creating gzipped sitemap:', error.message);
// }
