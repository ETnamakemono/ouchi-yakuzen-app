// 記録の出力（CSV・PNG）。共有シートが使えれば共有、なければダウンロード。
import { WORRY_MAP } from '../data/worries.js';
import { COMPANION_MAP } from '../data/companions.js';
import { RECIPE_MAP, CATS } from '../data/recipes.js';
import { illustSVG } from './illust.js';

async function deliver(blob, filename) {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return 'shared'; }
    catch (e) { if (e.name === 'AbortError') return 'cancel'; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}

const worryNames = r => (r.worries || []).map(w => WORRY_MAP[w]?.name || '季節の養生').join('・');

export async function exportCSV(records) {
  const head = ['日付', '時刻', '二十四節気', '季節', '誰の分', '人数', '悩み', '合わせた料理', '料理名', '種類', '使った食材', 'ひとことメモ'];
  const rows = [...records].reverse().map(r => {
    const d = new Date(r.at);
    return [
      `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`, `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`,
      r.term, r.season, r.who === 'self' ? '自分' : '夫と2人', r.serves,
      worryNames(r), (r.companions || []).map(c => COMPANION_MAP[c]?.name).join('・'),
      r.recipeName, CATS[r.cat]?.name || '', (r.ingredients || []).join('・'), r.memo || '',
    ];
  });
  const csv = [head, ...rows].map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const t = new Date();
  return deliver(blob, `薬膳きろく_${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, '0')}${String(t.getDate()).padStart(2, '0')}.csv`);
}

function loadSVG(svg) {
  return new Promise(res => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg.replace('var(--wash, #efe6d3)', '#efe6d3')], { type: 'image/svg+xml' }));
    img.onload = () => { res(img); URL.revokeObjectURL(url); };
    img.onerror = () => { res(null); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

function wrap(ctx, text, maxW) {
  const lines = []; let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxW) { lines.push(line); line = ch; } else line += ch;
  }
  if (line) lines.push(line);
  return lines;
}

export async function exportMonthPNG(records, year, month) {
  const W = 1080, P = 64, ROW = 190;
  const list = [...records].reverse();
  const H = 330 + Math.max(list.length, 1) * ROW + 260;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const serif = '"Noto Serif JP","Noto Serif CJK JP","Yu Mincho",serif';
  const sans = 'system-ui,"Noto Sans JP","Noto Sans CJK JP","Yu Gothic UI",sans-serif';
  x.fillStyle = '#f7f3ea'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#7a9a5a'; x.fillRect(0, 0, W, 14);
  x.fillStyle = '#3d3a33'; x.font = `600 64px ${serif}`;
  x.fillText(`${year}年${month}月の薬膳きろく`, P, 130);
  x.font = `30px ${sans}`; x.fillStyle = '#6b655a';
  x.fillText(`作った料理 ${list.length}品`, P, 190);

  let y = 250;
  for (const r of list) {
    x.fillStyle = '#fffdf8'; x.strokeStyle = '#e6dccb'; x.lineWidth = 2;
    x.beginPath(); x.roundRect(P, y, W - P * 2, ROW - 20, 22); x.fill(); x.stroke();
    const recipe = RECIPE_MAP[r.recipeId];
    if (recipe) { const img = await loadSVG(illustSVG(recipe)); if (img) x.drawImage(img, P + 14, y + 14, 180, 144); }
    const tx = P + 214, maxW = W - P * 2 - 234;
    const d = new Date(r.at);
    x.fillStyle = '#9a9285'; x.font = `26px ${sans}`;
    x.fillText(`${d.getMonth() + 1}/${d.getDate()}（${'日月火水木金土'[d.getDay()]}）・${r.term}`, tx, y + 44);
    x.fillStyle = '#3d3a33'; x.font = `600 36px ${serif}`;
    x.fillText(wrap(x, r.recipeName, maxW)[0], tx, y + 92);
    x.fillStyle = '#5d7d42'; x.font = `26px ${sans}`;
    x.fillText(wrap(x, worryNames(r), maxW)[0] || '', tx, y + 132);
    if (r.memo) { x.fillStyle = '#b0631a'; x.fillText(wrap(x, '「' + r.memo + '」', maxW)[0], tx, y + 164); }
    y += ROW;
  }
  if (!list.length) { x.fillStyle = '#9a9285'; x.font = `30px ${sans}`; x.fillText('この月の記録はありません', P, y + 60); y += ROW; }

  // 集計
  const count = {};
  list.forEach(r => (r.worries || []).forEach(w => { const n = WORRY_MAP[w]?.name || '季節の養生'; count[n] = (count[n] || 0) + 1; }));
  const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 3);
  x.fillStyle = '#3d3a33'; x.font = `600 34px ${serif}`;
  x.fillText('よく相談した悩み', P, y + 50);
  x.font = `28px ${sans}`; x.fillStyle = '#6b655a';
  x.fillText(top.length ? top.map(([n, k]) => `${n}（${k}）`).join('　') : '—', P, y + 100);
  x.fillStyle = '#9a9285'; x.font = `24px ${sans}`;
  x.fillText('おうち薬膳', W - P - 130, H - 40);

  const blob = await new Promise(res => c.toBlob(res, 'image/png'));
  return deliver(blob, `薬膳きろく_${year}${String(month).padStart(2, '0')}.png`);
}
