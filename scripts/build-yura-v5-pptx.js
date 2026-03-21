const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OTHRE SERVICE';
pptx.title = 'YURA Apparel Research 2026 - Comprehensive Report v5';

const slides = [
  'yura-01-title',
  'yura-02-concept',
  'yura-03-market',
  'yura-04-blueocean',
  'yura-05-reversible',
  'yura-06-digital',
  'yura-07-target',
  'yura-08-business',
  'yura-09-cost',
  'yura-10-risk',
  'yura-11-roadmap',
  'yura-12-closing',
];

for (const slideName of slides) {
  const imgPath = path.join(__dirname, '..', 'outputs', 'slides', `${slideName}.png`);
  const imgData = fs.readFileSync(imgPath).toString('base64');
  const slide = pptx.addSlide();
  slide.addImage({
    data: 'image/png;base64,' + imgData,
    x: 0,
    y: 0,
    w: '100%',
    h: '100%',
  });
}

const outPath = path.join(__dirname, '..', 'outputs', 'slides', 'yura-apparel-research-2026-v5.pptx');
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log(`PPTX saved: ${outPath}`);
}).catch(err => {
  console.error('Error:', err);
});
