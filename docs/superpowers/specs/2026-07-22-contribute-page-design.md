# Contribute page + Fileora dual-brand chrome

## Goal

Turn `/careers` into an open-source contribution page (visible title: **Contribute**) and align Fileora footer branding with the navbar DualBrandLockup.

## Decisions

- Keep route `/careers` for existing footer/catalog links; rename visible title and link labels to Contribute.
- Six contribution cards via existing `FeatureCardGrid`.
- CTA banner: primary → GitHub (`https://github.com/hassanhnaveed/zolv-stack`), secondary → `/contact`.
- Fileora footer logo → `DualBrandLockup variant="footer"`.
- No hiring language.

## Out of scope

- Changing the URL from `/careers` to `/contribute`.
- SEO route registry (page is noindex already).
