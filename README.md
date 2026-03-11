# ivaikin.com

Personal brand landing page for Timothy Ivaikin.

## Setup

### GitHub Pages
Deployed automatically from `main` branch.

### DNS Configuration
Add these DNS records to your domain registrar for `ivaikin.com`:

```
Type  Name  Value
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
```

**Important:** Do NOT add a wildcard CNAME record — this would break existing subdomains like `cv.ivaikin.com` and `board.ivaikin.com`. Only configure the apex domain (`@`) to point to GitHub Pages.

### Google Analytics
Replace `G-XXXXXXXXXX` in `index.html` with your GA4 measurement ID.

### Form Backend
Replace `FORM_ID` and `FORM_ID_2` in `index.html` with your Formspree form IDs:
1. Create two forms at [formspree.io](https://formspree.io)
2. Replace the action URLs in the apply form and community form

### Photos
Add your portrait photo to `images/` and update the `.photo-placeholder` in `index.html`:
```html
<div class="photo-placeholder">
    <img src="images/portrait.jpg" alt="Timothy Ivaikin">
</div>
```

## Analytics Funnel
See `docs/analysis.md` for the full funnel design and value cluster analysis.

## Languages
EN, RU, ES, ZH — client-side switching via `?lang=` parameter.
