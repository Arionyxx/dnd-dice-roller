# Isaac Compendium - Deployment Guide

## Quick Start

The Isaac Compendium is a complete, production-ready static website. Everything is ready to deploy!

### Local Testing

1. Navigate to the project directory
2. Start any static file server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (npx)
npx serve

# PHP
php -S localhost:8000
```

3. Open http://localhost:8000 in your browser

### Deployment to GitHub Pages

1. Create a new repository on GitHub
2. Initialize git and push:

```bash
cd isaac-compendium
git init
git add .
git commit -m "Initial commit - Complete Isaac Compendium"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/isaac-compendium.git
git push -u origin main
```

3. Go to repository Settings > Pages
4. Source: Deploy from a branch
5. Branch: main, folder: / (root)
6. Save

Site will be live at: `https://YOUR-USERNAME.github.io/isaac-compendium/`

The included `.github/workflows/pages.yml` will automate future deployments.

### Deployment to Netlify

1. Sign up at netlify.com
2. Click "Add new site" > "Import an existing project"
3. Connect to Git provider or drag-and-drop folder
4. Configure:
   - Build command: (leave empty)
   - Publish directory: /
5. Click "Deploy"

The included `netlify.toml` configures everything automatically.

Site will be live at: `https://RANDOM-NAME.netlify.app`

### Deployment to Vercel

1. Sign up at vercel.com
2. Click "Add New Project"
3. Import Git repository or upload
4. Framework Preset: Other
5. Build Command: (leave empty)
6. Output Directory: ./
7. Click "Deploy"

Site will be live at: `https://isaac-compendium.vercel.app`

### Custom Domain Setup

#### GitHub Pages
1. Add your domain to CNAME file (already created)
2. Go to Settings > Pages > Custom domain
3. Enter your domain
4. Configure DNS:
   - Add CNAME record pointing to USERNAME.github.io
   - Or A records to GitHub IPs

#### Netlify
1. Go to Domain settings
2. Add custom domain
3. Follow DNS configuration instructions
4. Netlify provides free SSL automatically

#### Vercel
1. Go to Project Settings > Domains
2. Add domain
3. Configure DNS as instructed
4. Free SSL included

## Important Notes

### Before Deploying

1. **Update Domain References**
   - Replace `isaac-compendium.example.com` in:
     - All HTML meta tags
     - sitemap.xml
     - robots.txt
     - manifest.webmanifest
     - CNAME file
     - security.txt

2. **Customize Branding**
   - Replace placeholder colors if desired
   - Create actual PNG images for favicons
   - Design social media card

3. **Content Expansion**
   - Add more items to data/items.json
   - Expand characters, bosses, synergies
   - Add more guides

### After Deploying

1. Test all pages load correctly
2. Verify PWA installation works
3. Check service worker is active
4. Test offline functionality
5. Validate on mobile devices
6. Test dark/light theme switching
7. Verify search functionality
8. Test all filters on items page

## Performance Optimization

The site is already optimized, but you can:

1. **Minify Files** (optional)
   ```bash
   # Install minifiers if needed
   npm install -g html-minifier clean-css-cli uglify-js
   
   # Minify HTML
   html-minifier --collapse-whitespace --remove-comments input.html -o output.html
   
   # Minify CSS
   cleancss -o style.min.css style.css
   
   # Minify JS
   uglifyjs input.js -o output.min.js
   ```

2. **Optimize Images**
   - Convert SVGs to PNGs with proper sizes
   - Use tools like ImageOptim, TinyPNG
   - Serve WebP format with PNG fallback

3. **Enable Compression**
   - Most hosts enable gzip/brotli automatically
   - Netlify and Vercel handle this
   - For custom servers, enable in server config

## SEO Optimization

1. **Submit Sitemap**
   - Google Search Console: https://search.google.com/search-console
   - Bing Webmaster Tools: https://www.bing.com/webmasters
   - Submit sitemap.xml

2. **Verify Robots.txt**
   - Visit yourdomain.com/robots.txt
   - Ensure it's accessible

3. **Test Social Cards**
   - Use Facebook Sharing Debugger
   - Use Twitter Card Validator
   - Ensure meta tags are correct

## Monitoring

### Basic Analytics (Included)
- Built-in localStorage analytics tracks page views
- No external services, privacy-friendly
- View with: `console.log(getAnalytics())`

### Add Google Analytics (Optional)
Add before `</head>` in all HTML files:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Troubleshooting

### Service Worker Issues
- Clear browser cache
- Unregister service worker in DevTools
- Check console for errors
- Verify HTTPS is enabled

### Theme Not Switching
- Check localStorage is enabled
- Verify theme-toggle.js is loaded
- Check browser console for errors

### Search Not Working
- Verify JSON files are accessible
- Check network tab for 404 errors
- Ensure CORS headers allow requests

### Images Not Loading
- Check file paths are correct
- Verify SVG files are valid
- Check browser console for errors

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files uploaded correctly
3. Test in different browsers
4. Check service worker status in DevTools

## License

MIT License - Free to use, modify, and distribute.

## Congratulations!

Your Isaac Compendium is ready to go live! 

Built with: HTML5, CSS3, Vanilla JavaScript
No frameworks, no dependencies, no build tools needed.
Just deploy and enjoy!
