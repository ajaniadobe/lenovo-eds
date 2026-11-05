
## campaign (us-en-ai-pcs) — site header variant
- Non-home templates render `nav.commonHeader` BEFORE `<main class="main_content">` at 216px (1440): utility 38 + masthead 67 + nav 55 + a 56px gray tier-2 row (`.second_view`, section links e.g. "Hybrid AI Solutions …"), then the 68px promo strip, then main; footer after main. Home stays 160px + promo inside `<main>`.
- Added as scoped modifier `.commonHeader--site` in canon.css (active top-nav item bold via `.sup_nav_active`, `.second_view` row). Home markup does not carry the class → home rendering unchanged.
- Segment-nav order differs on this template (Gaming | Business | Student | Creator) — content, kept per page.
- body.tpl-site (canon.css): non-home chrome is Lato 400 / footer line-height normal, Lato footer headings, underlined Privacy Statement link. Home body has no class → unchanged.
