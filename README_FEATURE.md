# Segment 7: Optimization & PWA Setup

## Overview
This segment implements performance optimizations and prepares the app for PWA capabilities.

## Key Features Implemented
1.  **Mobile Experience**:
    *   **Manifest**: `public/manifest.json` configured for "Add to Home Screen".
    *   **Icons**: Placeholders set up in `public/icons`.
2.  **Performance**:
    *   **Skeleton Screens**: `loading.tsx` provides instant visual feedback.
    *   **Image Optimization**: Configured `remotePatterns` for Google Auth images.

## Technical Note
*   **PWA Service Workers**: Currently disabled in `next.config.mjs` due to compatibility issues with the latest Next.js 16 Turbopack build. The app is installable via Manifest but will not have offline caching active by default. To enable PWA later, uncomment the PWA config in `next.config.mjs` when upstream compatibility is resolved.

## How to Test
1.  **Installability**:
    *   Chrome on Android should still prompt "Add to Home Screen" based on the manifest.
2.  **Performance**:
    *   Verify Skeleton loaders appear when navigating between pages.
