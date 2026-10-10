// 合わせる料理マスタ（すでに作った・買った／これから作る・買う予定の料理）
// temp: cold 冷たい・生 / warm 温かい   nature: 料理全体の性の目安
// oily: 0 さっぱり〜2 こってり   salty: 0 薄味〜2 濃い味   main: 主な食材（重複チェック用。食材マスタIDまたは分類）

export const COMPANION_GROUPS = ['肉のおかず', '魚のおかず', '卵・豆腐・野菜', 'ごはん・麺・パン', 'その他'];

export const COMPANIONS = [
  { id: 'karaage', name: '唐揚げ・揚げ物', group: '肉のおかず', temp: 'warm', nature: '温', oily: 2, salty: 2, main: ['chicken'] },
  { id: 'shogayaki', name: '生姜焼き', group: '肉のおかず', temp: 'warm', nature: '温', oily: 1, salty: 2, main: ['pork', 'ginger', 'onion'] },
  { id: 'hamburg', name: 'ハンバーグ', group: '肉のおかず', temp: 'warm', nature: '温', oily: 2, salty: 1, main: ['beef', 'pork', 'onion'] },
  { id: 'yakitori', name: '焼き鳥・チキンソテー', group: '肉のおかず', temp: 'warm', nature: '温', oily: 1, salty: 2, main: ['chicken'] },
  { id: 'nikujaga', name: '肉じゃが・煮物', group: '肉のおかず', temp: 'warm', nature: '平', oily: 1, salty: 1, main: ['potato', 'carrot', 'onion', 'pork'] },
  { id: 'curry', name: 'カレー', group: '肉のおかず', temp: 'warm', nature: '熱', oily: 2, salty: 2, main: ['potato', 'carrot', 'onion'] },
  { id: 'gyoza', name: '餃子', group: '肉のおかず', temp: 'warm', nature: '温', oily: 2, salty: 1, main: ['pork', 'cabbage', 'nira'] },
  { id: 'nabe', name: '鍋もの', group: '肉のおかず', temp: 'warm', nature: '平', oily: 0, salty: 1, main: ['hakusai', 'negi', 'tofu'] },
  { id: 'stirfry', name: '肉野菜炒め', group: '肉のおかず', temp: 'warm', nature: '温', oily: 1, salty: 1, main: ['pork', 'cabbage', 'moyashi'] },

  { id: 'yakizakana', name: '焼き魚', group: '魚のおかず', temp: 'warm', nature: '平', oily: 1, salty: 1, main: ['fish'] },
  { id: 'nizakana', name: '煮魚', group: '魚のおかず', temp: 'warm', nature: '平', oily: 1, salty: 2, main: ['fish'] },
  { id: 'sashimi', name: 'お刺身・お寿司', group: '魚のおかず', temp: 'cold', nature: '涼', oily: 0, salty: 1, main: ['fish'] },
  { id: 'friedfish', name: '魚・えびのフライ', group: '魚のおかず', temp: 'warm', nature: '温', oily: 2, salty: 1, main: ['fish', 'shrimp'] },

  { id: 'salad', name: '生野菜サラダ', group: '卵・豆腐・野菜', temp: 'cold', nature: '涼', oily: 1, salty: 0, main: ['lettuce', 'tomato', 'cucumber'] },
  { id: 'hiyayakko', name: '冷奴', group: '卵・豆腐・野菜', temp: 'cold', nature: '涼', oily: 0, salty: 1, main: ['tofu'] },
  { id: 'tamagoyaki', name: '卵焼き・目玉焼き', group: '卵・豆腐・野菜', temp: 'warm', nature: '平', oily: 1, salty: 1, main: ['egg'] },
  { id: 'natto', name: '納豆', group: '卵・豆腐・野菜', temp: 'cold', nature: '温', oily: 0, salty: 1, main: ['natto'] },
  { id: 'ohitashi', name: 'おひたし・和え物', group: '卵・豆腐・野菜', temp: 'cold', nature: '平', oily: 0, salty: 1, main: ['spinach', 'komatsuna'] },
  { id: 'misosoup', name: 'みそ汁', group: '卵・豆腐・野菜', temp: 'warm', nature: '温', oily: 0, salty: 1, main: ['tofu', 'wakame'] },
  { id: 'potesala', name: 'ポテトサラダ', group: '卵・豆腐・野菜', temp: 'cold', nature: '平', oily: 2, salty: 1, main: ['potato', 'cucumber'] },

  { id: 'mugi_rice', name: 'もち麦ごはん・雑穀米', group: 'ごはん・麺・パン', temp: 'warm', nature: '平', oily: 0, salty: 0, main: ['rice', 'oshimugi'] },
  { id: 'rice', name: '白ごはん', group: 'ごはん・麺・パン', temp: 'warm', nature: '平', oily: 0, salty: 0, main: ['rice'] },
  { id: 'onigiri', name: 'おにぎり', group: 'ごはん・麺・パン', temp: 'cold', nature: '平', oily: 0, salty: 1, main: ['rice'] },
  { id: 'friedrice', name: 'チャーハン・丼もの', group: 'ごはん・麺・パン', temp: 'warm', nature: '温', oily: 2, salty: 2, main: ['rice', 'egg'] },
  { id: 'pasta', name: 'パスタ', group: 'ごはん・麺・パン', temp: 'warm', nature: '平', oily: 2, salty: 1, main: ['flour'] },
  { id: 'ramen', name: 'ラーメン', group: 'ごはん・麺・パン', temp: 'warm', nature: '温', oily: 2, salty: 2, main: ['flour', 'pork'] },
  { id: 'udon_soba', name: 'うどん・そば（温）', group: 'ごはん・麺・パン', temp: 'warm', nature: '平', oily: 0, salty: 1, main: ['udon', 'soba'] },
  { id: 'cold_noodle', name: '冷たい麺（ざる・冷やし）', group: 'ごはん・麺・パン', temp: 'cold', nature: '涼', oily: 0, salty: 1, main: ['soba', 'udon'] },
  { id: 'bread', name: 'パン・サンドイッチ', group: 'ごはん・麺・パン', temp: 'cold', nature: '平', oily: 1, salty: 1, main: ['flour'] },

  { id: 'deli_fried', name: 'お惣菜（揚げ物系）', group: 'その他', temp: 'cold', nature: '温', oily: 2, salty: 2, main: [] },
  { id: 'deli_light', name: 'お惣菜（煮物・和え物系）', group: 'その他', temp: 'cold', nature: '平', oily: 0, salty: 1, main: [] },
  { id: 'beer', name: 'お酒（ビール・チューハイ等）', group: 'その他', temp: 'cold', nature: '涼', oily: 0, salty: 0, main: [] },
  { id: 'fruit', name: '果物', group: 'その他', temp: 'cold', nature: '涼', oily: 0, salty: 0, main: ['fruit'] },
  { id: 'yogurt', name: 'ヨーグルト', group: 'その他', temp: 'cold', nature: '涼', oily: 0, salty: 0, main: ['yogurt'] },
  { id: 'sweets', name: '甘いもの・デザート', group: 'その他', temp: 'cold', nature: '平', oily: 1, salty: 0, main: [] },
];

export const COMPANION_MAP = Object.fromEntries(COMPANIONS.map(c => [c.id, c]));

// 食材IDを「分類」へ寄せる（重複チェック用）
export const ING_FAMILY = {
  chicken_breast: 'chicken', sasami: 'chicken', chicken_mince: 'chicken', chicken_liver: 'chicken',
  pork_koma: 'pork', beef_lean: 'beef',
  salmon: 'fish', cod: 'fish', saba_can: 'fish', tuna_can: 'fish', shirasu: 'fish',
  shrimp: 'shrimp', asari: 'shellfish', shijimi: 'shellfish', scallop: 'shellfish',
  cooked_rice: 'rice', rice: 'rice', konegi: 'negi',
  apple: 'fruit', pear: 'fruit', banana: 'fruit', mikan: 'fruit', kaki: 'fruit', hoshigaki: 'fruit',
};
