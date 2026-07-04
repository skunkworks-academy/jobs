# Shared Academy navigation

This repository must use the organisation-wide Skunkworks Academy global navigation shell.

```html
<script defer src="https://skunkworksacademy.com/assets/academy-navigation.js?v=2026.07.04" data-skunkworks-global-nav="v3"></script>
```

## Required behaviour

- The Skunkworks Academy brand/logo appears once at the top of the page.
- Public global links are hidden until the burger menu is clicked.
- The public global menu is limited to Home, Self-paced, Portal, Labs, Plans, and Purchase.
- Repositories must not maintain their own public top-level navbar, duplicate logo switcher, or separate burger-menu implementation.

## Validation

Use the shared validation repository:

```bash
npm run audit:global-nav -- /path/to/this/repo
```
