<!-- stardust:provenance
writtenBy: stardust:extract
writtenAt: 2026-11-02T21:59:41.219Z
readArtifacts: [stardust/current/pages/*.json, stardust/current/_computed-styles.json, stardust/current/_brand-extraction.json]
synthesizedInputs: []
stardustVersion: 0.36.0
-->
---
name: Lenovo US
description: Lenovo's US brand and store site — captured current state (descriptive)
colors:
  white: "#ffffff"
  black: "#000000"
  text-secondary: "#3a3a3a"
  surface-dark: "#171717"
  surface-muted: "#e6e2e4"
  surface-slate: "#333f48"
  surface-tint: "#eaeef5"
  link-blue: "#294e95"
  brand-red: "#e1251b"
  accent-cyan: "#00ffff"
  border-grey: "#cccccc"
typography:
  display:
    fontFamily: "Lato, 'Noto Sans', sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.2
  heading:
    fontFamily: "Lato, 'Noto Sans', sans-serif"
    fontSize: "36px"
    fontWeight: 700
  title:
    fontFamily: "Lato, 'Noto Sans', sans-serif"
    fontSize: "28px"
    fontWeight: 700
  campaign-display:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "45px"
    fontWeight: 800
  body:
    fontFamily: "Lato, 'Noto Sans', sans-serif"
    fontSize: "16px"
    fontWeight: 400
  small:
    fontFamily: "Lato, 'Noto Sans', sans-serif"
    fontSize: "14px"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "12px"
  pill: "50%"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
components:
  button-primary:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
  link:
    textColor: "{colors.link-blue}"
---

## Overview

Descriptive snapshot of lenovo.com/us/en as captured 2026-11-02. White commerce surfaces with black type, dark (#171717 / black) campaign bands, Lenovo red reserved for the logo, cyan accent on gaming (Legion) surfaces. Values come from `_computed-styles.json` (10 pages × 1440/360).

## Colors

White (#ffffff) and black (#000000) dominate by area; #3a3a3a secondary text; #171717 and #333f48 dark bands; #e6e2e4 and #eaeef5 light tints; #294e95 link blue; #e1251b logo red; #00ffff focus/gaming accent.

## Typography

Primary family "Lato" — actually Noto Sans files served under the Lato family name (global-mt-fontface.css) — at 400/700. Montserrat (variable) on campaign headings and buttons. Ad-hoc size ramp (12–72px); h1 48/700, h2 36–45, body 16/400, small 14.

## Layout

Fluid full-bleed bands with centred content containers; breakpoints and caps per DESIGN.json extensions.breakpoints (cap-probe).

## Elevation & Depth

Card shadow rgba(0,0,0,.16) 0 8px 10px; tile shadow rgba(0,0,0,.3) 3px 3px 3px.

## Shapes

Radius mode 4px (controls), 12px by area (cards/tiles), 50% for round icons.

## Components

Global header (utility bar, logo, search, account/cart, mega-menu row, promo strip), five-column footer, hero carousels, card grids, product tiles with price + CTA, product detail gallery + model list.
