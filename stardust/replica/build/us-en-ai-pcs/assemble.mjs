// One-shot assembler: canon chrome (from the gated home prototype) + hand-authored main.
// Verbatim copy (SEO block, FAQ answers, CTA hrefs) comes from extract.json (capture of the live page).
import fs from 'node:fs';
const root = new URL('../../../', import.meta.url).pathname;
const idx = fs.readFileSync(root + 'prototypes/index-proposed.html', 'utf8').split('\n');
const ex = JSON.parse(fs.readFileSync(new URL('./extract.json', import.meta.url), 'utf8'));
let header = idx.slice(20, 129).join('\n');
header = header.replace(/<p><strong>Join<\/strong>&nbsp; Lenovo Pro Business Store<\/p>/, '<p><strong>Lenovo Pro</strong>&nbsp;Business Store</p>').replace('<nav class="commonHeader"', '<nav class="commonHeader commonHeader--site"')
  .replace('<li class="nav_item"><a href="https://www.lenovo.com/us/en/ai/">', '<li class="nav_item sup_nav_active"><a href="https://www.lenovo.com/us/en/ai/" aria-current="true">');
const seg = [...header.matchAll(/ {10}<li class="nav_item segmentItem">.*<\/li>\n/g)].map(m => m[0]);
const order = ['Gaming', 'Business', 'Student', 'Creator'].map(n => seg.find(s => s.includes(`<span>${n}</span>`)));

const tier2 = [['https://www.lenovo.com/us/en/servers-storage/lenovo-hybrid-ai-advantage/', 'Hybrid AI Solutions'], ['https://www.lenovo.com/us/en/servers-storage/solutions/enterprise-ai/', 'AI Servers &amp; Storage'], ['https://www.lenovo.com/us/en/ai-pcs/', 'AI Laptops &amp; Workstations'], ['https://www.lenovo.com/us/en/ai/hybrid-ai-services/', 'Hybrid AI Services']]
  .map(([h, t]) => `        <li class="second_list_item"><a href="${h}"><span class="text">${t}</span></a><button class="iconfont-arrowDown tierThreeArrowIcon" type="button" aria-label="${t}"></button></li>`).join('\n');
header = header.replace('\n  </nav>', `\n    <div class="second_view" aria-label="Artificial Intelligence navigation">\n      <ul class="second_list_ul">\n${tier2}\n      </ul>\n    </div>\n  </nav>`);
const footer = idx.slice(737, 882).join('\n');
const img = (u) => 'https:' + u;
const feat = (o) => `<section class="container9999 ai-feature ai-feature--${o.tone}">
  <div class="horizontal-default-pc${o.rev ? ' is-reverse' : ''}">
    <div class="horizontal-default-image"><img src="${img(o.src)}" alt="${o.alt}" width="640" height="360" loading="lazy"></div>
    <div class="horizontal-default-content">
      <h3 class="horizontal-default-content__title">${o.h}</h3>
      ${o.sub ? `<p class="horizontal-default-content__subtitle">${o.sub}</p>` : ''}
      <div class="horizontal-default-content__content">${o.body}</div>${o.cta || ''}
    </div>
  </div>
</section>`;
const card = (o) => `<article class="vertical-default-pc">
      <div class="vertical-default-image"><img src="${img(o.src)}" alt="${o.alt}" width="672" height="378" loading="lazy"></div>
      <div class="vertical-default-content">
        <h3>${o.h}</h3>
        <p class="description">${o.d}</p>
        <div class="ctaButton_content">
          <div><a class="ctaButton_link${o.flush ? ' is-flush' : ''}" href="${o.l1[0]}">${o.l1[1]}</a></div>
          <div><a class="ctaButton_link" href="${o.l2}">Shop Now &gt;</a></div>
          <div class="sr-only">${o.h}</div>
        </div>
      </div>
    </article>`;
const C = ex.ctas;
const faq = ex.acc.map((a, i) => `      <article class="x-cms-ai-ofp-fe-2c-accordion__item">
        <button class="x-cms-ai-ofp-fe-2c-accordion__tab-label" type="button" aria-expanded="false" aria-controls="faq-${i + 1}"><span class="x-cms-ai-ofp-fe-2c-accordion__label-text">${a.q}</span><span class="x-cms-ai-ofp-fe-2c-accordion__icon" aria-hidden="true"></span></button>
        <div class="x-cms-ai-ofp-fe-2c-accordion__content" id="faq-${i + 1}" hidden>${a.a.startsWith('<p') ? a.a : `<p>${a.a}</p>`}</div>
        <div class="x-cms-ai-ofp-fe-2c-accordion__separator"></div>
      </article>`).join('\n');
const main = `<main class="main_content">
<section class="container9999 ai-hero">
  <article class="heroTypeOne">
    <img class="heroBgImage" src="https://p3-ofp.static.pub//fes/cms/2024/09/25/ag988e76rsen3zbnqsvrqcnull78af393408.png" alt="A woman using a Lenovo laptop" width="1440" height="600">
    <nav class="heroBreadcrumbs" aria-label="Breadcrumb"><p><a href="https://www.lenovo.com">Home </a> <span>&gt;</span> <span>Explore AI PCs</span></p></nav>
    <div class="heroContent">
      <div class="heroTextContent">
        <h1>Work Smarter with Lenovo AI PCs</h1>
        <p class="heroDesc">Learn how our innovative AI propels you further.</p>
      </div>
    </div>
  </article>
</section>
<section class="container9999 ai-intro">
  <div class="layout-title">
    <h2>Smarter AI for You</h2>
    <p>Lenovo AI PCs streamline and enhance your everyday tasks, making them simpler, quicker, and more enjoyable. That’s because we’ve created personalized solutions designed for you. Now it’s possible to have reliability, your security respected, and your potential to be limitless from a single partner. &nbsp;The smartest way forward is together.</p>
  </div>
  <div class="vertical-default-pc">
    <div class="vertical-default-image"><img src="https://p1-ofp.static.pub//fes/cms/2024/08/19/j2yqqynpvfm53ju3nuz0fyfqw38429425650.png" alt="A Lenovo laptop displaying a glowing jellyfish in image editing software" width="1200" height="375"></div>
    <div class="vertical-default-content"></div>
  </div>
</section>
${feat({ tone: 'blue', rev: true, src: '//p4-ofp.static.pub//fes/cms/2024/08/23/ea1a13g9xprce18ugv3ojtfx7gf2t7130456.png', alt: ' A person using a Lenovo laptop with a cityscape background with Copilot + PC logo', h: 'Greater personalization', sub: 'Harness AI capabilities to streamline workflows, optimize performance, and enhance your user experience – all customized to be just the way you like it.&nbsp;', body: '<p>Experience the fastest, most intelligent Windows PC. With Copilot+PC you’re entering a new era of AI that gives you the power to unlock any idea, pursue any dream, and complete any task in ways that are more natural and intuitive than ever before.</p>' })}
${feat({ tone: 'blue', src: '//p2-ofp.static.pub//fes/cms/2024/08/19/iq8ldrizrqsyj8diciv19zq9ksxlc6288269.png', alt: 'A Lenovo laptop using Lenovo Creator Zone to transform a sketch into digital art', h: 'Enhanced productivity', sub: 'Knock out more tasks throughout the workday with Al-driven content creation, predictive experiences, and intelligent decisioning.', body: '<p>Breathe new life into your ideas. Lenovo’s AI-powered creative assistants ensure you’re never staring at a blank page. With Lenovo’s Yogas, just express your ideas in words or drawings and let Lenovo Creator Zone produce a jumping off point to work from. No matter what your imagination is bringing to life, you’ll always enjoy the power of choice with our independent software vendors like Adobe Photoshop.&nbsp;</p>' })}
${feat({ tone: 'blue', rev: true, src: '//p3-ofp.static.pub//fes/cms/2024/08/20/gvsztiyf6phvcf3u2jv7fsj2w04clg100616.png', alt: 'ALT3', h: 'Bolstered protection', sub: 'Be in command of your data. Mount a digital defense with predictive and proactive security, fraud detection, and cyber-resiliency.&nbsp;', body: '<p>Your data security isn’t just important, it’s everything. Lenovo AI PCs put a digital fortress around your digital life. Cutting-edge data protection from Lenovo ThinkShield security solutions plus Lenovo\'s Trusted AI Controller onboard the AI Core that’s integrated at the hardware level ensure your data remains invisible to unauthorized eyes. It’s your private data — keep it that way.</p>' })}
${feat({ tone: 'pink', src: '//p4-ofp.static.pub//fes/cms/2024/08/08/qi6pgll4frvt0fekkfm905boqtzwaa165174.jpg', alt: 'ALT4', h: 'From a partner you know', sub: '<span>Your AI journey is just that&nbsp;</span><span>—</span><span>&nbsp;yours. As your digital partner, we’re committed to empowering you to embrace new possibilities.&nbsp;</span>', body: '<p>We’ve spent years investing in AI consulting, design, devices, and a transparent supply chain to give you more choice and control. It’s a new computing era with AI, let’s explore it together.</p><p>Smarter AI brings AI to your data where you need it most, so you have convenient solutions from the pocket to the cloud. With Lenovo, you\'re not just adopting AI; you\'re benefiting from a partnership built on reliability, customer-centric design, and the freedom to tailor your digital journey.</p>' })}
<section class="container9999 ai-explore">
  <div class="commonTextOne">
    <h2>Explore how Lenovo AI PCs can help you</h2>
    <p class="textDesc">Whether you’re a professional, creator, gamer, or student, there’s an AI PC that’s specially built to support everything you want to do.&nbsp;</p>
  </div>
</section>
<section class="ai-cards" aria-label="AI PCs by audience">
  <div class="layouts_special_content">
    ${card({ src: '//p2-ofp.static.pub//fes/cms/2024/08/08/2hb1pl46fo3ol3crgyc51n4j7fx5wf512681.jpg', alt: 'Multiple people gathered around a table and working on their laptops', h: 'AI PCs for business', d: 'With the most comprehensive AI portfolio in the industry, Lenovo can power your seamless business transformation. Our powerful AI PCs offer the personalized experiences users want, plus the IT controls you need to safeguard your data security and privacy. Empower your employees to be their most productive and creative and unleash their full potential today.&nbsp;', l1: [C[0], 'Empower people with Lenovo’s AI PCs &gt;'], l2: C[1] })}
    ${card({ src: '//p3-ofp.static.pub//fes/cms/2024/08/12/e4mugx39o60qs3p41l1a7e4wu5ydmf003825.jpg', alt: 'A woman sitting on a plush rug on her bedroom floor using a Yoga laptop', h: 'AI PCs for creators', d: 'Inspired by you and designed to maximize the creative process, Lenovo Yoga electrifies your capabilities with inventive form factors and intuitive ecosystems. Leap into a realm where limitations are a myth and speed through creative tasks with groundbreaking AI acceleration. The Yoga series combines unmatched efficiency and power to slash the time it takes to bring your vision to life.', l1: [C[2], 'Innovate with Lenovo Yoga AI PCs &gt;'], l2: C[3], flush: true })}
  </div>
  <div class="layouts_special_content">
    ${card({ src: '//p1-ofp.static.pub//fes/cms/2024/08/12/ak8vbsysk0nj9csa7pos3qf5769wfn495626.jpg', alt: 'ALT7', h: 'AI-powered PCs for gamers', d: 'Embrace the dawn of a new computing era with Lenovo Legion\'s Extreme AI Engineering at its core. The latest Lenovo Legion laptop and desktop lineup is fueled by AI-accelerated CPUs and GPUs from Intel®, AMD, and NVIDIA engineered to deliver lightning-fast gaming, gaming content creation, STEM applications, and streamlined workflows. Push beyond conventional limits in gaming and creativity, and reach your impossible.', l1: [C[4], 'Lead your squad to victory &gt;'], l2: C[5] })}
    ${card({ src: '//p1-ofp.static.pub//fes/cms/2024/08/12/1x9706mrm5936c2u4clvo0k8x1nkqi291538.jpg', alt: 'A student in her dorm room having a video chat on her laptop with friends', h: 'AI PCs for students', d: 'Lenovo enables students with Smarter AI to pursue their passions and build a future we will all share. Our products are designed to deliver the performance, versatility, and support they need to keep pace with a changing world. From Smarter AI that enhances productivity to security built on environmentally friendly devices, we’re committed to accelerating learning that helps students build a brighter future.', l1: [C[6], 'Experience next-level learning &gt;'], l2: C[7] })}
  </div>
</section>
${feat({ tone: 'copilot', src: '//p3-ofp.static.pub//fes/cms/2024/08/20/mvm6m1qf397hymaft5xq09flidxxkk156523.png', alt: 'A ThinkPad laptop', h: 'Discover the power of AI with Copilot+ PC in Windows', body: '<p>Kickstart your Windows 11 experience with an AI-powered intelligent assistant that helps you stay focused while it performs the tasks you need to get done. Copilot+ PC in Windows equips your computer with the latest AI-powered features designed to help you be more efficient, productive, and creative. And with Copilot+ PCs like the Lenovo Thinkpad T14s and Yoga Slim 7x, a new AI era begins. The fastest, most intelligent Windows PCs ever.</p>', cta: `\n      <div class="ctaButton_content"><div><a class="ctaButton_btn" href="${C[8].trim()}">Discover Copilot+ PCs</a></div></div>` }).replace('ai-feature ai-feature--copilot', 'ai-copilot')}
<section class="container9999 pilar_blade" aria-label="Premier Support Plus for Devices">
  <div class="background_image"><img class="background_img" src="https://p4-ofp.static.pub//fes/cms/2026/02/13/4nb321le9uon7ctmqmdnpbuhrxk5vf036004.jpg" alt="" width="1440" height="442" loading="lazy"></div>
  <div class="overlay_card">
    <div class="overlay_pre_headline"></div>
    <p class="overlay_headline">Transformational support with Premier Support Plus for Devices</p>
    <div class="overlay_description">
      <p><strong>Support designed to join you on your AI journey whenever you need us 24/7/365</strong></p>
      <p><br></p>
      <p>By combining direct access to Lenovo’s accredited experts with proactive monitoring, predictive diagnostics, and preventative maintenance, issues are identified and addressed before they disrupt productivity, while layers of protection help safeguard your device investments.&nbsp;</p>
      <p><br></p>
      <p>The result: your AI PC performs optimally, making you and your business unstoppable.</p>
    </div>
    <div class="ctaBtns"><button class="full" type="button">Learn More</button></div>
  </div>
</section>
<section class="container9999 ai-seo">
  <div class="infoList">
    <h2 class="title">Lenovo AI PCs: Smarter Computing Across Everyday Workflows</h2>
    <div class="less" id="ai-seo-copy">
      <div class="wpc-seo-bottom-content">${ex.seo}</p></div>
    </div>
    <button class="readMore" type="button" aria-expanded="false" aria-controls="ai-seo-copy"><span class="readTab">Read More</span><img class="down" src="https://p1-ofp.static.pub/fes/cms/2021/03/19/db8ae24fd8vxvza6qi6q99its2m2c7856560.png" alt=""></button>
  </div>
</section>
<section class="x-cms-ai-ofp-fe-2c-accordion" aria-label="Frequently asked questions">
  <div class="x-cms-ai-ofp-fe-2c-accordion__container">
    <div class="x-cms-ai-ofp-fe-2c-accordion__mobile-separator"></div>
    <div class="x-cms-ai-ofp-fe-2c-accordion__list">
${faq}
    </div>
  </div>
</section>
</main>`;
// full alts for the truncated ones come from the page record
const rec = JSON.parse(fs.readFileSync(root + 'current/pages/us-en-ai-pcs.json', 'utf8'));
const altOf = (frag) => (rec.media.imgs.find(i => (i.src || i.currentSrc || '').includes(frag)) || {}).alt;
let out = main.replace('ALT3', altOf('gvsztiyf6phvcf3u2jv7fsj2w04clg100616')).replace('ALT4', altOf('qi6pgll4frvt0fekkfm905boqtzwaa165174')).replace('ALT7', altOf('ak8vbsysk0nj9csa7pos3qf5769wfn495626'))
  .replace(' A person using a Lenovo laptop with a cityscape background with Copilot + PC logo', altOf('ea1a13g9xprce18ugv3ojtfx7gf2t7130456'));
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${rec.title}</title>
<meta name="description" content="${rec.description.replace(/"/g, '&quot;')}">
<link rel="canonical" href="https://www.lenovo.com/us/en/ai-pcs/">
<link rel="icon" href="assets/favicon.ico">
<link rel="preload" href="assets/fonts/NotoSans-Latin-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/NotoSans-Latin-Bold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="canon.css">
<link rel="stylesheet" href="us-en-ai-pcs.css">
</head>
<body class="tpl-site">
${header}

${out}

${footer}
<script src="canon.js" defer></script>
<script src="us-en-ai-pcs.js" defer></script>
</body>
</html>
`;
fs.writeFileSync(root + 'prototypes/us-en-ai-pcs-proposed.html', html);
console.log('ok', html.length, 'undefined?', /undefined|ALT\d/.test(html));
