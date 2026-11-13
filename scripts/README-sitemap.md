# Sitemap Generation

This directory contains scripts for generating sitemaps and robots.txt files for multiple domains.

## Usage

### Generate sitemaps for all domains in an environment
```bash
node scripts/generate-sitemap.js --environment=prod
node scripts/generate-sitemap.js --environment=dev
node scripts/generate-sitemap.js --environment=stage
node scripts/generate-sitemap.js --environment=pre-prod
```

### Generate sitemaps for all domains across all environments
```bash
node scripts/generate-sitemap.js --all
```

### Generate sitemap for a single domain
```bash
node scripts/generate-sitemap.js --domain=example.com
```

### Default behavior (no arguments)
```bash
node scripts/generate-sitemap.js
```
**Note**: When no arguments are provided, the script generates sitemaps for all domains since all domains point to the same server.

## Generated Files

### For multiple domains (environment mode):
- `sitemap.xml` - Sitemap index pointing to all domain-specific sitemaps
- `sitemap.xml.gz` - Gzipped version of the index
- `sitemap-{domain}.xml` - Individual sitemap for each domain
- `sitemap-{domain}.xml.gz` - Gzipped version of each domain sitemap
- `robots-{domain}.txt` - Robots.txt file for each domain

### For single domain:
- `sitemap.xml` - Single sitemap file
- `sitemap.xml.gz` - Gzipped version
- `robots.txt` - Single robots.txt file

## Domain Configuration

Domains are configured in `scripts/domains-config.js` with the following structure:

```javascript
{
  domain: 'gigsberg.com',
  environment: 'prod',
  protocol: 'https',
  isProduction: true,
}
```

## Dynamic Serving

The website automatically serves the correct sitemap and robots.txt files based on the domain being accessed:

- **Domain-specific files**: When a user visits `gigsberg.com/sitemap.xml`, the system serves `sitemap-gigsberg.com.xml`
- **Fallback behavior**: If no domain-specific file exists, it falls back to the main sitemap index
- **Automatic detection**: The system uses the `Host` header to determine which domain-specific file to serve

### How it works:
1. User visits `https://gigsberg.com/sitemap.xml`
2. System detects hostname `gigsberg.com`
3. Looks for `sitemap-gigsberg.com.xml` in the public directory
4. Serves the domain-specific sitemap with proper XML headers
5. Same process applies to `robots.txt`

## CI/CD Integration

The CI/CD pipeline automatically generates sitemaps for all domains during the build process. Since all domains point to the same server, sitemaps are generated for all domains regardless of the deployment environment.

**Note**: All domains (gigsberg.com, gigsberg.co.uk, tickets.marca.gigsberg.com) point to the same server, so sitemaps are generated for all domains on every deployment.

## Supported Domains

### Production (prod)
- gigsberg.co.uk
- gigsberg.com
- tickets.marca.gigsberg.com

### Pre-production (pre-prod)
- pre-prod.gigsberg.co.uk
- pre-prod.gigsberg.com
- tickets.marca.pre-prod.gigsberg.com

### Stage (stage)
- stage.gigsberg.co.uk
- stage.gigsberg.com
- tickets.marca.stage.gigsberg.com

### Development (dev)
- stage.gigsberg.co.uk
- stage.gigsberg.com
- tickets.marca.stage.gigsberg.com
