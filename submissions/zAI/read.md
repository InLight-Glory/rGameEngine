## Spec-Engine (PHP-hostable)

This project now runs from `index.php` (instead of only `index.html`) so you can drop it onto a normal PHP host.

### Run locally (Windows)

From this folder:

```powershell
php -S localhost:8000
```

Then open:

- http://localhost:8000/index.php

### Deploy

Upload the following into your hosting document root:

- `index.php`
- `assets/`

### Notes

- Babylon.js is loaded from the official CDN.
- The original single-file version is in `indexx.html` as a reference.
