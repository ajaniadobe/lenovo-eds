/**
 * ai-explore — centred section head (live commonTextOne): title + description.
 * Template-slotted. Schema: stardust/eds-schema/us-en-ai-pcs.json section 6.
 *
 * Authoring: <h2> title, <p> description(s); a paragraph that is only a link renders as a
 * CTA under the description.
 */

function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .common-text-one')) return;
  const heading = block.querySelector('h1, h2, h3, h4');
  const flows = [...block.querySelectorAll('p, ul, ol')].filter((el) => !el.closest('li'));
  const box = document.createElement('div');
  box.className = 'common-text-one';
  if (heading) box.append(wrapNode(heading, 'headline'));
  if (flows.length) {
    const d = document.createElement('div');
    d.className = 'text-desc';
    d.append(...flows);
    box.append(d);
  }
  block.replaceChildren(box);
}
