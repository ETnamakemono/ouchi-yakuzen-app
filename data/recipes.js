// レシピマスタ
// items: [食材ID, 重量g(2人分・栄養計算用), 表示用分量, 下ごしらえ, オプション]
//   オプション: 'opt' = あれば（なくても作れる）
// tools: 必要な器具（stove=コンロ は常にあるものとする） microwave / toaster / ricecooker
// targets: 主に合う証 / seasons: spring summer tsuyu longsummer autumn winter / 'all'
// nature: 料理全体の性 / temp: hot 熱々 warm 温かい room 常温 cold 冷たい / lightness: 0こってり〜2さっぱり
// illust: { vessel, liquid, items:[[色, 形, 数]], steam }

import { RECIPES_A } from './recipes_a.js';
import { RECIPES_B } from './recipes_b.js';
import { RECIPES_C } from './recipes_c.js';

export const CATS = {
  main: { name: '主菜', icon: '🍖', desc: 'メインのおかず' },
  side: { name: '副菜', icon: '🥗', desc: '野菜の小さなおかず' },
  soup: { name: '汁物', icon: '🍲', desc: 'スープ・みそ汁' },
  staple: { name: '主食', icon: '🍚', desc: 'ごはん・麺・おかゆ' },
  drink: { name: '飲み物・甘味', icon: '🍵', desc: 'ほっと一杯・おやつ' },
};

export const RECIPES = [
  // ───────── 汁物 ─────────
  {
    id: 'chicken-ginger-negi-soup', name: '鶏むねと生姜のねぎスープ', cat: 'soup', minutes: 15, tools: [],
    items: [
      ['chicken_breast', 100, '100g', '薄くそぎ切り'],
      ['negi', 60, '1/2本', '斜め薄切り'],
      ['ginger', 10, '1かけ', '皮ごとせん切り'],
      ['katakuriko', 3, '小さじ1', '鶏肉にまぶす'],
      ['torigara', 4, '小さじ2'],
      ['salt', 1, '少々'],
      ['pepper', 0.2, '少々'],
      ['sesame_oil', 2, '小さじ1/2'],
    ],
    steps: [
      '鶏むね肉は薄くそぎ切りにし、片栗粉をまぶす。',
      '鍋に水{400}ml、鶏がらスープの素、生姜を入れて火にかける。',
      '沸いたら鶏肉を1枚ずつ入れ、弱めの中火で3〜4分煮る。',
      'ねぎを加えてひと煮立ちさせ、塩・こしょうで味を調え、ごま油をたらす。',
    ],
    points: [
      '片栗粉をまぶすと、脂の少ない鶏むね肉もぷるんとやわらかく、スープにほどよいとろみがつきます。',
      '生姜は皮ごと使うと香りがよく立ちます。',
      'かぜのひきはじめは熱々を飲み、首元を温めて早めに休みましょう。',
    ],
    targets: ['fukan', 'yokyo', 'kikyo'], seasons: ['autumn', 'winter'],
    nature: '温', temp: 'hot', lightness: 2,
    explain: '「ねぎ」と「生姜」はどちらも温性・辛味で、体を温めて発散させる組み合わせ。ゾクゾクと寒気がする、かぜのひきはじめ（風寒）に昔から使われてきました。鶏むね肉は温性で気を補い、胃腸を元気にするので、体力が落ちたときにも。秋冬の冷え込み対策の一杯です。',
    illust: { vessel: 'bowl', liquid: '#f3e6c4', items: [['#fbf1e2', 'slice', 6], ['#e8f0d8', 'ring', 8], ['#e9c46a', 'strip', 8]], steam: true },
  },
  {
    id: 'renkon-soymilk-soup', name: 'れんこんと豆乳のとろみスープ', cat: 'soup', minutes: 15, tools: [],
    items: [
      ['renkon', 120, '小1節（120g）', '半分はすりおろし、半分は薄いいちょう切り'],
      ['soy_milk', 300, '300ml'],
      ['onion', 50, '1/4個', '薄切り'],
      ['consomme', 3, '小さじ1'],
      ['salt', 1, '少々'],
      ['pepper', 0.2, '少々'],
      ['konegi', 5, '少々', '小口切り', 'opt'],
    ],
    steps: [
      'れんこんは皮をむき、半分をすりおろし、残りを薄いいちょう切りにする。玉ねぎは薄切りにする。',
      '鍋に水{150}ml、玉ねぎ、いちょう切りのれんこん、コンソメを入れ、ふたをして弱めの中火で5分煮る。',
      '豆乳とすりおろしたれんこんを加え、混ぜながら弱火で2〜3分温める（とろみがついたらOK）。',
      '塩・こしょうで味を調え、あれば小ねぎを散らす。',
    ],
    points: [
      'すりおろしたれんこんで自然なとろみがつき、冷めにくく、のどにやさしい口当たりに。',
      '豆乳は沸騰させると分離しやすいので、弱火で温めます。',
    ],
    targets: ['haiso', 'boshin', 'inkyo'], seasons: ['autumn', 'winter'],
    nature: '平', temp: 'hot', lightness: 2,
    explain: 'れんこんは「肺」を潤して咳を鎮める秋の代表食材。豆乳も肺を潤す白い食材で、乾燥でイガイガするのどや、かさつく肌に。五行では「秋＝肺＝白」。白い食材を重ねて、乾燥に弱い肺をやさしく守ります。玉ねぎで気の巡りも少し助けます。',
    illust: { vessel: 'bowl', liquid: '#f5efe0', items: [['#e9dcc0', 'lotus', 4], ['#5f9e4a', 'dot', 10]], steam: true },
  },
  {
    id: 'wakame-corn-soup', name: 'わかめとコーンの生姜スープ', cat: 'soup', minutes: 10, tools: [],
    items: [
      ['wakame', 4, '大さじ1強（乾燥4g）'],
      ['corn', 60, '大さじ4'],
      ['onion', 50, '1/4個', '薄切り'],
      ['ginger', 3, '少々（チューブ1cm）', 'すりおろし'],
      ['torigara', 4, '小さじ2'],
      ['salt', 1, '少々'],
      ['pepper', 0.2, '少々'],
      ['sesame_oil', 2, '小さじ1/2'],
    ],
    steps: [
      '鍋に水{400}ml、鶏がらスープの素、玉ねぎを入れて火にかけ、2〜3分煮る。',
      'コーンと乾燥わかめを加えてひと煮立ちさせる。',
      '生姜を加え、塩・こしょうで味を調え、ごま油をたらす。',
    ],
    points: [
      '乾燥わかめは戻さずそのまま入れてOK。すぐに増えるので入れすぎに注意。',
      '寒性のわかめに温性の玉ねぎ・生姜を合わせて、冷やしすぎないようにしています。',
    ],
    targets: ['suidoku', 'tanshitsu', 'kikyo'], seasons: ['tsuyu', 'longsummer', 'summer', 'spring'],
    nature: '平', temp: 'hot', lightness: 2,
    explain: 'とうもろこしは胃腸を元気にしながら余分な水を出す、むくみ対策の定番食材。わかめも水を出し、痰（余分なもの）を除く働きがあります。わかめは寒性なので、温性の玉ねぎと生姜を合わせてバランスを。湿気の多い時期のむくみや頭の重さに。',
    illust: { vessel: 'bowl', liquid: '#f1e4c2', items: [['#f5d14a', 'dot', 16], ['#3e6b3a', 'leaf', 5], ['#f3e3b8', 'strip', 5]], steam: true },
  },

  // ───────── 副菜 ─────────
  {
    id: 'spinach-blacksesame-namul', core: ['spinach'], name: 'ほうれん草と黒ごまのナムル', cat: 'side', minutes: 8, tools: ['microwave'],
    items: [
      ['spinach', 200, '1束（200g）'],
      ['carrot', 30, '1/5本', 'せん切り'],
      ['black_sesame', 6, '小さじ2'],
      ['soy_sauce', 6, '小さじ1'],
      ['sesame_oil', 2, '小さじ1/2'],
      ['garlic', 1, '少々（チューブ5mm）'],
    ],
    steps: [
      'ほうれん草は洗って水けがついたまま、にんじんと一緒にラップで包み、電子レンジ（600W）で2分加熱する。',
      '冷水にとって水けをしっかりしぼり、4cm長さに切る。',
      '黒すりごま、醤油、ごま油、にんにくで和える。',
    ],
    points: [
      'ごま油は少量でも香りが立つので、低脂質でも満足感があります。',
      '黒ごまは「すりごま」を使うと栄養を吸収しやすくなります。',
    ],
    targets: ['kekkyo', 'boshin', 'gesho'], seasons: ['winter', 'autumn', 'spring'],
    nature: '平', temp: 'room', lightness: 2,
    explain: 'ほうれん草・にんじん・黒ごまは「血」を補う代表選手。赤・黒・濃い緑の食材は血を養うとされます。黒ごまは腎も補い、腸も潤すので、目の疲れ・肌や髪の乾燥・便秘に。ほうれん草は涼性なので、温性のにんにくを少し合わせてバランスをとっています。',
    illust: { vessel: 'small', liquid: null, items: [['#3f7d3a', 'leaf', 12], ['#ec8a3a', 'strip', 6], ['#2a2622', 'dot', 14]], steam: false },
  },
  {
    id: 'nagaimo-ume-okaka', name: '長芋の梅おかか和え', cat: 'side', minutes: 5, tools: [],
    items: [
      ['nagaimo', 150, '6cm（150g）', '皮をむいて粗くたたく'],
      ['umeboshi', 10, '1個', '種を除いてたたく'],
      ['katsuobushi', 2, '1袋（2g）'],
      ['soy_sauce', 2, '少々'],
      ['shiso', 2, '2枚', 'せん切り', 'opt'],
    ],
    steps: [
      '長芋は皮をむいてポリ袋に入れ、めん棒などで粗くたたく（拍子木切りでもOK）。',
      'たたいた梅干し、かつお節、醤油を加えて和える。',
      '器に盛り、あれば大葉をのせる。',
    ],
    points: [
      '火を使わず5分。たたくと味がからみやすく、食感も楽しくなります。',
      '梅干しの塩分があるので、醤油は味をみて控えめに。',
    ],
    targets: ['kikyo', 'haiso', 'boshin'], seasons: ['all'],
    nature: '平', temp: 'cold', lightness: 2,
    explain: '長芋は薬膳で「山薬（さんやく）」と呼ばれ、脾（胃腸）・肺・腎をまとめて補う名脇役。気を補いながら潤いも与えるので、疲れやすさや乾燥に。梅干しの酸味は潤いを生み、消化を助けます。生で食べられる手軽さも魅力です。',
    caution: '長芋の皮をむくと手がかゆくなりやすい方は、ポリ袋や手袋を使ってください。',
    illust: { vessel: 'small', liquid: null, items: [['#f6f1e2', 'cube', 9], ['#c43d3d', 'dot', 5], ['#d9a86c', 'flake', 8], ['#3f8a3c', 'strip', 4]], steam: false },
  },
  {
    id: 'mushroom-ginger-ponzu', name: 'きのこの生姜ポン酢レンジ蒸し', cat: 'side', minutes: 8, tools: ['microwave'],
    items: [
      ['shimeji', 100, '1パック'],
      ['maitake', 100, '1パック'],
      ['ginger', 5, '1/2かけ', 'せん切り'],
      ['sake', 5, '小さじ1'],
      ['ponzu', 15, '大さじ1'],
      ['konegi', 5, '少々', '小口切り', 'opt'],
    ],
    steps: [
      'きのこは石づきを取ってほぐす。',
      '耐熱容器にきのこと生姜を入れ、酒をふってふんわりラップをし、電子レンジ（600W）で3分加熱する。',
      '出た蒸し汁ごとポン酢で和え、あれば小ねぎを散らす。',
    ],
    points: [
      'きのこのうま味が出た蒸し汁も一緒にいただきます。',
      '温かくても冷やしてもおいしく、冷蔵で2〜3日もちます。',
    ],
    targets: ['kikyo', 'tanshitsu', 'suidoku'], seasons: ['autumn', 'all'],
    nature: '平', temp: 'warm', lightness: 2,
    explain: 'きのこは気を補い、胃腸を元気にしてくれる低カロリー食材。まいたけには余分な水を出す働きもあります。生姜で温めながら巡らせ、ポン酢のさっぱり感で、こってりした主菜とも好相性。秋の旬のうちにたっぷりと。',
    illust: { vessel: 'small', liquid: '#e8d9b8', items: [['#d8c3a5', 'mushroom', 8], ['#7d6550', 'leaf', 5], ['#5f9e4a', 'dot', 8]], steam: true },
  },

  // ───────── 主菜 ─────────
  {
    id: 'pork-cabbage-ginger-steam', name: '豚こまとキャベツの生姜蒸し', cat: 'main', minutes: 15, tools: [],
    items: [
      ['pork_koma', 140, '140g', '脂身は取り除く'],
      ['cabbage', 250, '1/4個', 'ざく切り'],
      ['ginger', 10, '1かけ', 'せん切り'],
      ['sake', 15, '大さじ1'],
      ['salt', 1, '少々'],
      ['pepper', 0.2, '少々'],
      ['ponzu', 30, '大さじ2'],
    ],
    steps: [
      'フライパンにキャベツを広げ、その上に豚こま肉を広げてのせ、塩・こしょうをふって生姜を散らす。',
      '酒と水大さじ{2}をふってふたをし、中火で6〜7分蒸し焼きにする。',
      '豚肉に火が通ったら器に盛り、ポン酢をかける。',
    ],
    points: [
      '油を使わない蒸し焼きで低脂質に。豚こまの脂身を先に取り除くとさらにヘルシーです。',
      'キャベツの甘みが引き出され、ポン酢だけで十分おいしく仕上がります。',
    ],
    targets: ['kikyo', 'boshin', 'yokyo'], seasons: ['all'],
    nature: '平', temp: 'hot', lightness: 1,
    explain: '豚肉は体を潤し、気と血を補う平性の食材。キャベツは胃腸を元気にして胃の痛みをやわらげる「胃の味方」です。生姜で温めながら消化を助けます。疲れて胃腸が弱っているときも、油を使わない蒸し料理なら負担が少なめです。',
    illust: { vessel: 'plate', liquid: null, items: [['#c7e0a3', 'leaf', 10], ['#e8b7a6', 'slice', 7], ['#e9c46a', 'strip', 6]], steam: true },
  },
  {
    id: 'salmon-mushroom-foil', name: '鮭ときのこの味噌ホイル焼き', cat: 'main', minutes: 20, tools: ['toaster'],
    items: [
      ['salmon', 160, '2切れ'],
      ['shimeji', 100, '1パック', 'ほぐす'],
      ['onion', 50, '1/4個', '薄切り'],
      ['miso', 12, '小さじ2'],
      ['mirin', 6, '小さじ1'],
      ['sake', 5, '小さじ1'],
      ['konegi', 5, '少々', '小口切り', 'opt'],
    ],
    steps: [
      '味噌・みりん・酒を混ぜておく。',
      'アルミホイルを2枚広げ、玉ねぎ、鮭、しめじの順にのせて、合わせ味噌をぬる。',
      'ホイルをしっかり閉じ、オーブントースターで15分焼く（フライパンなら、並べて水{50}mlを入れ、ふたをして中火で12分）。',
      '開けて、あれば小ねぎを散らす。',
    ],
    points: [
      'バターなしでも味噌のコクで満足感があります。',
      'ホイルの中で蒸し焼きになるので、魚がふっくらしっとり仕上がります。',
    ],
    targets: ['kikyo', 'kekkyo', 'oketsu', 'yokyo'], seasons: ['autumn', 'winter'],
    nature: '温', temp: 'hot', lightness: 2,
    explain: '鮭は温性で気と血を補い、胃腸を温める秋の魚。血の巡りも助けるので、冷えや肩こり、疲れに。きのこで気を補い、玉ねぎで巡りをよくする組み合わせです。味噌も温性で胃腸を元気にします。',
    illust: { vessel: 'plate', liquid: null, items: [['#f0937a', 'fillet', 1], ['#d8c3a5', 'mushroom', 6], ['#f3e3b8', 'strip', 5], ['#5f9e4a', 'dot', 8]], steam: true, foil: true },
  },
  {
    id: 'chicken-negishio-microwave', name: '鶏むねのねぎ塩レンジ蒸し', cat: 'main', minutes: 15, tools: ['microwave'],
    items: [
      ['chicken_breast', 250, '1枚（250g）'],
      ['sake', 15, '大さじ1'],
      ['salt', 2, '小さじ1/3'],
      ['negi', 60, '1/2本', 'みじん切り'],
      ['sesame_oil', 4, '小さじ1'],
      ['torigara', 2, '小さじ1'],
      ['lemon_juice', 5, '小さじ1'],
      ['ginger', 3, '少々（チューブ1cm）'],
      ['pepper', 0.2, '少々'],
    ],
    steps: [
      '鶏むね肉は厚い部分に切り込みを入れて厚みをそろえ、フォークで数か所刺して、酒と塩をもみ込む。',
      '耐熱皿にのせてふんわりラップをし、電子レンジ（600W）で3分→裏返して2分加熱し、そのまま5分おいて余熱で火を通す。',
      'ねぎ、ごま油、鶏がらスープの素、レモン汁、生姜、こしょうを混ぜ、蒸し汁を大さじ1加えてねぎ塩だれを作る。',
      '鶏肉をそぎ切りにして器に盛り、たれをかける。',
    ],
    points: [
      '余熱でゆっくり火を通すと、パサつかずしっとり仕上がります。',
      '中心が赤い場合は、30秒ずつ追加で加熱してください。',
    ],
    targets: ['kikyo', 'fukan', 'yokyo'], seasons: ['all'],
    nature: '温', temp: 'warm', lightness: 2,
    explain: '鶏むね肉は温性で気を補い、胃腸を元気にする疲労回復の味方。ねぎと生姜を効かせたたれで体を温めて巡らせます。高たんぱく・低脂質で、ダイエット中の主菜にぴったりです。',
    illust: { vessel: 'plate', liquid: null, items: [['#f5e6d3', 'slice', 6], ['#e8f0d8', 'dot', 18], ['#5f9e4a', 'dot', 6]], steam: true },
  },

  // ───────── 主食 ─────────
  {
    id: 'ginger-negi-egg-zosui', name: '生姜とねぎの卵雑炊', cat: 'staple', minutes: 10, tools: [],
    items: [
      ['cooked_rice', 200, '茶碗1杯強（200g）'],
      ['egg', 50, '1個', '溶きほぐす'],
      ['negi', 40, '1/3本', '小口切り'],
      ['ginger', 8, '1かけ', 'すりおろし'],
      ['dashi', 4, '小さじ1と1/3'],
      ['soy_sauce', 6, '小さじ1'],
      ['salt', 1, '少々'],
    ],
    steps: [
      'ごはんはざるに入れてさっと洗う（さらっと仕上がります）。',
      '鍋に水{500}ml、和風だし、ごはんを入れて中火にかけ、煮立ったら弱火で3〜4分煮る。',
      'ねぎと生姜を加え、醤油・塩で味を調える。',
      '溶き卵を回し入れて火を止め、ふたをして1分蒸らす。',
    ],
    points: [
      '卵は火を止める直前に入れると、ふんわり仕上がります。',
      '食欲がないときは、ごはんの量を減らして汁多めに。',
    ],
    targets: ['fukan', 'kikyo', 'yokyo'], seasons: ['autumn', 'winter'],
    nature: '温', temp: 'hot', lightness: 2,
    explain: '米は気を補い胃腸を元気にする基本の食材。やわらかく煮た雑炊は、弱った胃腸にもやさしい一品です。生姜とねぎで体を温めて発散させ、かぜのひきはじめや冷え込んだ夜に。卵は潤いと血を補い、心を落ち着かせます。',
    illust: { vessel: 'deep', liquid: '#f7ecd0', items: [['#fffdf6', 'grain', 30], ['#f4c84a', 'swirl', 4], ['#5f9e4a', 'ring', 8]], steam: true },
  },

  // ───────── 飲み物・甘味 ─────────
  {
    id: 'pear-honey-ginger-compote', name: '梨のはちみつ生姜コンポート', cat: 'drink', minutes: 10, tools: ['microwave'],
    items: [
      ['pear', 250, '1個', '皮をむき8等分のくし形'],
      ['honey', 15, '大さじ1弱'],
      ['ginger', 3, '薄切り2枚'],
      ['lemon_juice', 5, '小さじ1'],
      ['goji', 5, '小さじ2（約10粒）', '', 'opt'],
    ],
    steps: [
      '梨は皮をむいて8等分のくし形に切り、芯を取る。',
      '耐熱容器に梨、生姜、はちみつ、レモン汁、水大さじ{2}を入れ、ふんわりラップをして電子レンジ（600W）で4分加熱する。',
      '上下を返してさらに2分加熱し、そのまま冷まして味をなじませる（温かいままでもOK）。',
    ],
    points: [
      '梨がない時期は、りんごでも同じように作れます。',
      '加熱すると梨の冷やす性質がやわらぎ、冷えやすい人にもやさしくなります。',
    ],
    targets: ['haiso', 'boshin', 'funetsu', 'inkyo'], seasons: ['autumn'],
    nature: '平', temp: 'warm', lightness: 2,
    explain: '梨は肺を潤して咳を鎮める、秋の乾燥対策の代表選手。はちみつも肺と腸を潤します。梨は涼性なので、加熱して生姜を少し加えることで、冷えやすい人にもやさしいおやつに。のどのイガイガや乾いた咳、便秘ぎみのときに。',
    illust: { vessel: 'small', liquid: '#f3e2a9', items: [['#efe3b0', 'wedge', 5], ['#e9c46a', 'slice', 2]], steam: false },
  },
  {
    id: 'brownsugar-ginger-soymilk', core: ['soy_milk', 'brown_sugar'], name: '黒糖しょうが豆乳', cat: 'drink', minutes: 5, tools: ['microwave'],
    items: [
      ['soy_milk', 300, '300ml'],
      ['brown_sugar', 12, '小さじ4'],
      ['ginger', 6, '小さじ1', 'すりおろし'],
      ['cinnamon', 0.3, '少々', '', 'opt'],
    ],
    steps: [
      '耐熱マグ2つに豆乳と黒糖を分け入れ、1杯ずつ電子レンジ（600W）で1分30秒〜2分温める（ふきこぼれに注意）。',
      '生姜を入れてよく混ぜ、好みでシナモンをふる。',
    ],
    points: [
      '豆乳は温めすぎると膜が張りやすいので、様子を見ながら加熱を。',
      'ほてりやすい人はシナモンを省いてください。',
    ],
    targets: ['yokyo', 'oketsu', 'kekkyo'], seasons: ['autumn', 'winter'],
    nature: '温', temp: 'hot', lightness: 2,
    explain: '黒糖は温性で血を補いながら巡らせ、生姜は体を温めます。生理痛や冷えのある日に。豆乳は体を潤すので、乾燥する季節の寝る前のほっと一杯にも。シナモンは体の芯から温めますが、ほてりやすい人は控えめに。',
    illust: { vessel: 'mug', liquid: '#d9b48a', items: [['#9b5a2e', 'dot', 6]], steam: true },
  },
];

RECIPES.push(...RECIPES_A, ...RECIPES_B, ...RECIPES_C);

export const RECIPE_MAP = Object.fromEntries(RECIPES.map(r => [r.id, r]));
