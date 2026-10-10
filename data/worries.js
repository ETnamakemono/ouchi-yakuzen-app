// 悩みマスタ（36項目）
// patterns: 関連する証と重み / peak: 出やすい季節（spring, tsuyu, summer, longsummer, autumn, winter）
// redflag: 受診目安（表示用）

export const WORRY_CATS = [
  '冷え・めぐり', '元気・疲れ', '頭・天気', 'おなか', '鼻・のど・かぜ',
  '肌・髪・目・口', 'こころ・睡眠', '女性の体調', 'その他',
];

export const WORRIES = [
  // 冷え・めぐり
  { id: 'cold_limbs', name: '手足の冷え', cat: '冷え・めぐり', patterns: { yokyo: 3, kekkyo: 1, kitai: 1 }, peak: ['autumn', 'winter'] },
  { id: 'cold_belly', name: '下半身（腰・お尻・脚）・お腹の冷え', note: 'おへそより下の冷えは、体を温める力の源「腎」の陽気が弱った「下焦の虚」のサインとされます。冬に強まりやすく、黒い食材・にら・えび・くるみ・シナモンなど腎を温める食材と、じっくり煮込んだ温かい料理が向いています。', cat: '冷え・めぐり', patterns: { gesho: 3, yokyo: 2 }, peak: ['winter'] },
  { id: 'swelling', name: 'むくみ', cat: '冷え・めぐり', patterns: { suidoku: 3, kikyo: 1, tanshitsu: 1 }, peak: ['tsuyu', 'longsummer'], redflag: '片足だけ・急に強くむくむ、息苦しさを伴う場合は早めに受診してください。' },
  { id: 'stiff_shoulder', name: '肩こり', cat: '冷え・めぐり', patterns: { oketsu: 3, kitai: 1, fukan: 0.5 }, peak: ['winter'] },
  { id: 'lower_back', name: '腰が重い・だるい', cat: '冷え・めぐり', patterns: { gesho: 3, oketsu: 1, suidoku: 1 }, peak: ['winter', 'tsuyu'], redflag: '強い痛み・しびれ・発熱を伴う場合は受診してください。' },
  { id: 'leg_cramp', name: '足がつる', cat: '冷え・めぐり', patterns: { kekkyo: 2, gesho: 2, yokyo: 1 }, peak: ['winter', 'summer'] },

  // 元気・疲れ
  { id: 'fatigue', name: '疲れやすい・だるい', cat: '元気・疲れ', patterns: { kikyo: 3, tanshitsu: 1, kekkyo: 1 }, peak: ['longsummer', 'spring'], redflag: '休んでも回復しない強いだるさが2週間以上続く場合は受診してください。' },
  { id: 'hard_morning', name: '朝起きられない', cat: '元気・疲れ', patterns: { kikyo: 2, yokyo: 1, tanshitsu: 1 }, peak: ['spring', 'winter'] },
  { id: 'sleepy_after_meal', name: '食後に眠くなる', cat: '元気・疲れ', patterns: { kikyo: 2, tanshitsu: 2 }, peak: ['spring', 'longsummer'] },
  { id: 'sweaty', name: '汗をかきやすい・かぜをひきやすい', cat: '元気・疲れ', patterns: { kikyo: 3 }, peak: ['autumn', 'winter'] },
  { id: 'summer_fatigue', name: '夏バテ', cat: '元気・疲れ', patterns: { kikyo: 2, boshin: 2, shitsunetsu: 1 }, peak: ['summer', 'longsummer'] },

  // 頭・天気
  { id: 'heavy_head', name: '頭が重い', cat: '頭・天気', patterns: { suidoku: 2, tanshitsu: 2, kitai: 1 }, peak: ['tsuyu'] },
  { id: 'headache', name: '頭痛（ズキズキ）', cat: '頭・天気', patterns: { kigyaku: 2, oketsu: 2, kitai: 1 }, peak: ['spring'], redflag: '突然の激しい頭痛、手足のしびれ・ろれつが回らない等を伴う場合はすぐに受診してください。' },
  { id: 'dizzy', name: 'めまい・ふわふわ', cat: '頭・天気', patterns: { suidoku: 3, kekkyo: 1 }, peak: ['tsuyu', 'spring'], redflag: '激しい回転性のめまい、吐き気・しびれを伴う場合は受診してください。' },
  { id: 'weather', name: '天気や気圧で調子をくずす', cat: '頭・天気', patterns: { suidoku: 3, kitai: 1 }, peak: ['tsuyu', 'autumn'] },

  // おなか
  { id: 'poor_appetite', name: '食欲がない・胃が弱っている', cat: 'おなか', patterns: { kikyo: 3, tanshitsu: 1 }, peak: ['longsummer', 'summer'] },
  { id: 'overeating', name: '食べすぎ・胃もたれ', cat: 'おなか', patterns: { shokuseki: 3, tanshitsu: 1, kikyo: 0.5 }, peak: ['winter'],
    note: '食べすぎて胃腸に食べ物が停滞した状態を、中医学では「食積（しょくせき）」といいます。消化を助ける大根・かぶ・キャベツなどで胃腸を軽くし、次の食事は控えめに。' },
  { id: 'gas_bloating', name: 'お腹にガスがたまる・張る', cat: 'おなか', patterns: { kitai: 3, shokuseki: 1, kikyo: 1 }, peak: ['spring'],
    note: 'お腹の張りやガスは、気の巡りが滞った「気滞」のサインとされます。ストレスや早食いでも起こりやすく、香りのよい食材（しそ・みょうが・柑橘の皮・三つ葉）で気を巡らせます。' },
  { id: 'stomach_tight', name: '胃がキリキリ痛む', cat: 'おなか', patterns: { kitai: 3, shokuseki: 1 }, peak: ['spring'], redflag: '強い痛み、黒い便・吐血がある場合はすぐに受診してください。' },
  { id: 'constipation', name: '便秘', cat: 'おなか', patterns: { boshin: 3, kitai: 1, kikyo: 1 }, peak: ['autumn'], redflag: '血便、急な便通の変化、強い腹痛がある場合は受診してください。' },
  { id: 'loose_stool', name: 'お腹がゆるい', cat: 'おなか', patterns: { kikyo: 2, yokyo: 2, suidoku: 1 }, peak: ['tsuyu', 'longsummer'], redflag: '発熱・血便・脱水を伴う下痢は受診してください。' },
  { id: 'hangover', name: '二日酔い・飲みすぎ', cat: 'おなか', patterns: { shitsunetsu: 3, shokuseki: 1, suidoku: 1 }, peak: ['winter'],
    note: 'お酒は体に「湿（余分な水分）」と「熱」をこもらせるとされ、二日酔いは食べすぎ（食積）とは別の「湿熱」の状態として考えます。しじみ・大根・柿・梅干しなど、熱を冷まし余分な水を出す食材を。水分補給も忘れずに。', redflag: '意識がもうろうとする、嘔吐が止まらない場合はすぐに受診してください。' },

  // 鼻・のど・かぜ
  { id: 'runny_nose', name: '水っぽい鼻水・くしゃみ（寒暖差・花粉）', cat: '鼻・のど・かぜ', patterns: { fukan: 2, kikyo: 2, yokyo: 2, suidoku: 1 }, peak: ['spring', 'autumn', 'winter'],
    note: '透明で水のような鼻水は、体を守る「肺」の気（衛気）が弱って冷えや寒暖差に負けやすく、さらに体を温める力（陽気）が不足して余分な水が鼻から出てくる「寒」のサインと考えます。生姜・ねぎ・しそなど温めて発散させる食材と、鶏肉・米・山芋など肺と胃腸の気を補う食材の組み合わせが基本です。' },
  { id: 'stuffy_nose', name: '鼻づまり・黄色い鼻水', cat: '鼻・のど・かぜ', patterns: { funetsu: 3, shitsunetsu: 1 }, peak: ['spring', 'winter'] },
  { id: 'dry_throat', name: 'のどの乾燥・イガイガ', cat: '鼻・のど・かぜ', patterns: { haiso: 3, inkyo: 1, funetsu: 0.5 }, peak: ['autumn', 'winter'] },
  { id: 'cough', name: '咳・痰', cat: '鼻・のど・かぜ', patterns: { haiso: 2, tanshitsu: 1, funetsu: 1 }, peak: ['autumn', 'winter'], redflag: '咳が2週間以上続く、息苦しい、高熱がある場合は受診してください。' },
  { id: 'chill_cold', name: 'かぜのひきはじめ（ゾクゾク）', cat: '鼻・のど・かぜ', patterns: { fukan: 3, kikyo: 0.5 }, peak: ['autumn', 'winter'], redflag: '38℃以上の発熱、強いのどの痛み、息苦しさがある場合は受診してください。' },

  // 肌・髪・目・口
  { id: 'dry_skin', name: '肌の乾燥・かゆみ', cat: '肌・髪・目・口', patterns: { haiso: 2, kekkyo: 2, inkyo: 1 }, peak: ['autumn', 'winter'] },
  { id: 'acne', name: '肌荒れ・吹き出物', cat: '肌・髪・目・口', patterns: { shitsunetsu: 3, oketsu: 1 }, peak: ['summer', 'spring'] },
  { id: 'hair', name: '髪のパサつき・抜け毛', cat: '肌・髪・目・口', patterns: { kekkyo: 3, gesho: 1 }, peak: ['autumn'] },
  { id: 'eye_strain', name: '目の疲れ・かすみ', cat: '肌・髪・目・口', patterns: { kekkyo: 3, inkyo: 1 }, peak: ['spring'] },
  { id: 'dry_mouth', name: '口の渇き', cat: '肌・髪・目・口', patterns: { boshin: 2, inkyo: 2, haiso: 1 }, peak: ['autumn', 'summer'], redflag: '強い口の渇きが続き、多尿・体重減少を伴う場合は受診してください。' },
  { id: 'mouth_ulcer', name: '口内炎', cat: '肌・髪・目・口', patterns: { shitsunetsu: 2, inkyo: 1, kikyo: 1 }, peak: ['summer'] },
  { id: 'nails', name: '爪が割れやすい・二枚爪', cat: '肌・髪・目・口', patterns: { kekkyo: 3, inkyo: 0.5 }, peak: ['autumn', 'winter'],
    note: '中医学では「爪は筋の余り」といい、「肝」が蓄える血の状態が爪に表れるとされます。二枚爪や割れやすさは「血虚（血の不足）」のサイン。にんじん・ほうれん草・小松菜・黒ごま・レバー・鮭などで血を補い、夜更かしを避けて肝を休ませましょう。' },

  // こころ・睡眠
  { id: 'insomnia', name: '寝つきが悪い・眠りが浅い', cat: 'こころ・睡眠', patterns: { kekkyo: 2, kitai: 1, inkyo: 1 }, peak: ['summer', 'spring'] },
  { id: 'irritable', name: 'イライラ・ストレス', cat: 'こころ・睡眠', patterns: { kitai: 3, kigyaku: 2 }, peak: ['spring'] },
  { id: 'clench', name: '食いしばり・歯ぎしり', cat: 'こころ・睡眠', patterns: { kitai: 3, kekkyo: 1.5, kigyaku: 1 }, peak: ['spring'],
    note: '食いしばりは、ストレスで「肝」の気が張りつめた「気滞」のサインとされます。肝は筋（筋肉）をつかさどるので、血が不足して筋がこわばると、あごにも力が入りやすくなると考えます。香りの食材で気を巡らせ、血を補う食材で筋をゆるめましょう。寝る前に深呼吸や首肩を温めるのも◎。', redflag: 'あごの痛みが強い、口が開けにくい、歯が欠ける場合は歯科・口腔外科に相談してください。' },
  { id: 'low_mood', name: '気分が沈む・やる気が出ない', cat: 'こころ・睡眠', patterns: { kitai: 2, kikyo: 2 }, peak: ['autumn', 'tsuyu'], redflag: '気分の落ち込みが2週間以上続く、眠れない日が続く場合は、心療内科などへの相談も考えてみてください。' },
  { id: 'anxious', name: '不安・ドキドキ', cat: 'こころ・睡眠', patterns: { kekkyo: 2, kigyaku: 1, inkyo: 1 }, peak: ['summer'], redflag: '動悸が頻繁、胸の痛み・息苦しさを伴う場合は受診してください。' },

  // 女性の体調
  { id: 'period_pain', name: '生理痛', cat: '女性の体調', patterns: { oketsu: 3, yokyo: 1, kitai: 1 }, peak: [], redflag: '鎮痛薬が効かないほどの痛みや、量が非常に多い場合は婦人科を受診してください。' },
  { id: 'pms', name: '生理前の不調（PMS）', cat: '女性の体調', patterns: { kitai: 3, oketsu: 1, suidoku: 1 }, peak: [] },
  { id: 'anemia', name: '立ちくらみ・貧血っぽい', cat: '女性の体調', patterns: { kekkyo: 3, kikyo: 1 }, peak: [], redflag: '失神しそうになる、息切れが強い場合は受診してください。' },
  { id: 'hot_flash', name: 'のぼせ・ほてり・ゆらぎ世代の不調', cat: '女性の体調', patterns: { inkyo: 3, kigyaku: 2 }, peak: ['summer'] },

  // その他
  { id: 'frequent_urine', name: 'トイレが近い', cat: 'その他', patterns: { gesho: 3, yokyo: 1 }, peak: ['winter'], redflag: '排尿時の痛み・血尿・発熱がある場合は受診してください。' },
  { id: 'sweet_craving', name: '甘いもの・食べすぎがやめられない', cat: 'その他', patterns: { tanshitsu: 2, kikyo: 1, kitai: 1 }, peak: ['longsummer', 'winter'] },
];

export const WORRY_MAP = Object.fromEntries(WORRIES.map(w => [w.id, w]));

// 「特に不調なし（季節の養生）」の擬似ID
export const NO_WORRY = 'none';
