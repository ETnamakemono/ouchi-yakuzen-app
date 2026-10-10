// レシピ追加分 C：クコの実を使うレシピ（形式は recipes.js と同じ）
export const RECIPES_C = [
  {
    id: 'chicken-goji-soup', core: ['chicken_breast', 'goji'], name: '鶏むねとクコの実の薬膳スープ', cat: 'soup', minutes: 15, tools: [],
    items: [
      ['chicken_breast', 100, '100g', '薄くそぎ切り'],
      ['goji', 8, '大さじ1弱（約15粒）'],
      ['negi', 60, '1/2本', '斜め薄切り'],
      ['ginger', 8, '1かけ', 'せん切り'],
      ['katakuriko', 3, '小さじ1', '鶏肉にまぶす'],
      ['torigara', 4, '小さじ2'],
      ['salt', 1, '少々'],
      ['dried_shiitake', 4, '2枚', '水で戻して薄切り', 'opt'],
    ],
    steps: [
      '鶏むね肉は薄くそぎ切りにし、片栗粉をまぶす。',
      '鍋に水{400}ml、鶏がらスープの素、生姜、クコの実（あれば干ししいたけも）を入れて火にかける。',
      '沸いたら鶏肉を1枚ずつ入れ、弱めの中火で3〜4分煮る。',
      'ねぎを加えてひと煮立ちさせ、塩で味を調える。',
    ],
    points: [
      'クコの実は水から煮ると、ふっくら戻って甘みがスープに溶け出します。',
      '片栗粉をまぶした鶏むね肉は、煮てもしっとりやわらか。',
    ],
    targets: ['kekkyo', 'kikyo', 'gesho', 'yokyo'], seasons: ['autumn', 'winter', 'all'],
    nature: '温', temp: 'hot', lightness: 2,
    explain: 'クコの実は「肝」と「腎」を補い、血を養って目を潤す、薬膳の定番食材。爪の弱さや目の疲れ、腰から下の冷えが気になるときに。鶏むね肉で気を補い、ねぎと生姜で体を温めて巡らせます。赤い実が入るだけで、いつものスープが薬膳らしい一杯に。',
    illust: { vessel: 'bowl', liquid: '#f3e6c4', items: [['#fbf1e2', 'slice', 6], ['#e8f0d8', 'ring', 7], ['#c8372d', 'dot', 10]], steam: true },
  },
  {
    id: 'carrot-goji-rapee', name: 'にんじんとクコの実のラペ', cat: 'side', minutes: 8, tools: ['microwave'],
    items: [
      ['carrot', 150, '1本（150g）', 'せん切り'],
      ['goji', 8, '大さじ1弱（約15粒）'],
      ['vinegar', 15, '大さじ1'],
      ['honey', 7, '小さじ1'],
      ['salt', 1, '少々'],
      ['white_sesame', 2, '少々', '', 'opt'],
    ],
    steps: [
      'にんじんはせん切りにして耐熱容器に入れ、クコの実をのせてふんわりラップをし、電子レンジ（600W）で1分加熱する。',
      '熱いうちに酢・はちみつ・塩を加えて和える。',
      '10分ほどおいて味をなじませ、好みで白ごまをふる。',
    ],
    points: [
      '軽く加熱すると、にんじんがしんなりして味がよくなじみます。',
      '油を使わないので低脂質。冷蔵で3〜4日もつので作り置きに。',
    ],
    targets: ['kekkyo', 'gesho', 'oketsu'], seasons: ['all'],
    nature: '平', temp: 'room', lightness: 2,
    explain: 'にんじんとクコの実は、どちらも血を補い目を養う「赤い食材」。五行色体表では「目」と「爪」は肝のグループで、肝が蓄える血を補うことが養生になります。酢は血の巡りを助け、はちみつで潤いをプラス。目の疲れや二枚爪が気になるときの常備菜に。',
    illust: { vessel: 'small', liquid: null, items: [['#ec8a3a', 'strip', 18], ['#c8372d', 'dot', 10]], steam: false },
  },
  {
    id: 'goji-ginger-tea', name: 'クコの実と生姜のお茶', cat: 'drink', minutes: 5, tools: [],
    items: [
      ['goji', 10, '大さじ1（約20粒）'],
      ['ginger', 6, '薄切り4枚'],
      ['honey', 10, '小さじ1と1/2', '', 'opt'],
    ],
    steps: [
      'カップ2つにクコの実と生姜を分け入れる。',
      '熱湯（各{150}ml）を注ぎ、ふたや小皿をのせて5分蒸らす。',
      '好みではちみつを加える。ふっくら戻った実も一緒に食べる。',
    ],
    points: [
      '実も食べると、栄養をまるごととれます。',
      '紅茶やほうじ茶に入れてもおいしく飲めます。',
    ],
    targets: ['kekkyo', 'gesho', 'yokyo'], seasons: ['autumn', 'winter', 'all'],
    nature: '温', temp: 'hot', lightness: 2,
    explain: 'クコの実は肝と腎を補い、血を養って目を潤します。平性で穏やかな食材ですが、生姜を合わせることで体を温める一杯に。目を使いすぎた日、爪や髪の弱さ、腰から下の冷えが気になるときの習慣にしやすいお茶です。',
    illust: { vessel: 'mug', liquid: '#e9b98c', items: [['#c8372d', 'dot', 8]], steam: true },
  },
];
