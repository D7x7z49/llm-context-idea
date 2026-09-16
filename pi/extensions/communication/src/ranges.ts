// src/ranges.ts
// exemption sets for the communication counter.
//
// each set lists the code point ranges of one script written with word
// spacing, so a word usually spans several code points. a run inside one set
// costs a single unit. scripts without word spacing (Han, kana, Thai, Lao,
// Tibetan, Myanmar, Khmer) are not listed; their code points fall to the
// per-code-point default, which can only overcount, never undercount.
//
// data: unicode 17.0.0, Scripts.txt dated 2025-07-24, block names from
// Blocks.txt. each range comment names the containing block and shows the
// first and last character, for example "basic latin: A-Z". the table is
// generated from those two files, not edited by hand.

import type { ExemptionSet } from "./schema.js";

export const EXEMPTION_SETS: readonly ExemptionSet[] = [
  {
    id: "latin",
    ranges: [
      [0x41, 0x5a], // basic latin: A-Z
      [0x61, 0x7a], // basic latin: a-z
      [0xaa, 0xaa], // latin-1 supplement: ª
      [0xba, 0xba], // latin-1 supplement: º
      [0xc0, 0xd6], // latin-1 supplement: À-Ö
      [0xd8, 0xf6], // latin-1 supplement: Ø-ö
      [0xf8, 0x2b8], // latin-1 supplement…spacing modifier letters: ø-ʸ
      [0x2e0, 0x2e4], // spacing modifier letters: ˠ-ˤ
      [0x1d00, 0x1d25], // phonetic extensions: ᴀ-ᴥ
      [0x1d2c, 0x1d5c], // phonetic extensions: ᴬ-ᵜ
      [0x1d62, 0x1d65], // phonetic extensions: ᵢ-ᵥ
      [0x1d6b, 0x1d77], // phonetic extensions: ᵫ-ᵷ
      [0x1d79, 0x1dbe], // phonetic extensions + phonetic extensions supplement: ᵹ-ᶾ
      [0x1e00, 0x1eff], // latin extended additional: Ḁ-ỿ
      [0x2071, 0x2071], // superscripts and subscripts: ⁱ
      [0x207f, 0x207f], // superscripts and subscripts: ⁿ
      [0x2090, 0x209c], // superscripts and subscripts: ₐ-ₜ
      [0x212a, 0x212b], // letterlike symbols: K-Å
      [0x2132, 0x2132], // letterlike symbols: Ⅎ
      [0x214e, 0x214e], // letterlike symbols: ⅎ
      [0x2160, 0x2188], // number forms: Ⅰ-ↈ
      [0x2c60, 0x2c7f], // latin extended-c: Ⱡ-Ɀ
      [0xa722, 0xa787], // latin extended-d: Ꜣ-ꞇ
      [0xa78b, 0xa7dc], // latin extended-d: Ꞌ-Ƛ
      [0xa7f1, 0xa7ff], // latin extended-d: ꟱-ꟿ
      [0xab30, 0xab5a], // latin extended-e: ꬰ-ꭚ
      [0xab5c, 0xab64], // latin extended-e: ꭜ-ꭤ
      [0xab66, 0xab69], // latin extended-e: ꭦ-ꭩ
      [0xfb00, 0xfb06], // alphabetic presentation forms: ﬀ-ﬆ
      [0xff21, 0xff3a], // halfwidth and fullwidth forms: Ａ-Ｚ
      [0xff41, 0xff5a], // halfwidth and fullwidth forms: ａ-ｚ
      [0x10780, 0x10785], // latin extended-f: 𐞀-𐞅
      [0x10787, 0x107b0], // latin extended-f: 𐞇-𐞰
      [0x107b2, 0x107ba], // latin extended-f: 𐞲-𐞺
      [0x1df00, 0x1df1e], // latin extended-g: 𝼀-𝼞
      [0x1df25, 0x1df2a], // latin extended-g: 𝼥-𝼪
    ],
  },
  {
    id: "cyrillic",
    ranges: [
      [0x400, 0x484], // cyrillic: Ѐ-҄
      [0x487, 0x52f], // cyrillic + cyrillic supplement: ҇-ԯ
      [0x1c80, 0x1c8a], // cyrillic extended-c: ᲀ-ᲊ
      [0x1d2b, 0x1d2b], // phonetic extensions: ᴫ
      [0x1d78, 0x1d78], // phonetic extensions: ᵸ
      [0x2de0, 0x2dff], // cyrillic extended-a: ⷠ-ⷿ
      [0xa640, 0xa69f], // cyrillic extended-b: Ꙁ-ꚟ
      [0xfe2e, 0xfe2f], // combining half marks: ︮-︯
      [0x1e030, 0x1e06d], // cyrillic extended-d: 𞀰-𞁭
      [0x1e08f, 0x1e08f], // cyrillic extended-d: 𞂏
    ],
  },
  {
    id: "greek",
    ranges: [
      [0x370, 0x373], // greek and coptic: Ͱ-ͳ
      [0x375, 0x377], // greek and coptic: ͵-ͷ
      [0x37a, 0x37d], // greek and coptic: ͺ-ͽ
      [0x37f, 0x37f], // greek and coptic: Ϳ
      [0x384, 0x384], // greek and coptic: ΄
      [0x386, 0x386], // greek and coptic: Ά
      [0x388, 0x38a], // greek and coptic: Έ-Ί
      [0x38c, 0x38c], // greek and coptic: Ό
      [0x38e, 0x3a1], // greek and coptic: Ύ-Ρ
      [0x3a3, 0x3e1], // greek and coptic: Σ-ϡ
      [0x3f0, 0x3ff], // greek and coptic: ϰ-Ͽ
      [0x1d26, 0x1d2a], // phonetic extensions: ᴦ-ᴪ
      [0x1d5d, 0x1d61], // phonetic extensions: ᵝ-ᵡ
      [0x1d66, 0x1d6a], // phonetic extensions: ᵦ-ᵪ
      [0x1dbf, 0x1dbf], // phonetic extensions supplement: ᶿ
      [0x1f00, 0x1f15], // greek extended: ἀ-ἕ
      [0x1f18, 0x1f1d], // greek extended: Ἐ-Ἕ
      [0x1f20, 0x1f45], // greek extended: ἠ-ὅ
      [0x1f48, 0x1f4d], // greek extended: Ὀ-Ὅ
      [0x1f50, 0x1f57], // greek extended: ὐ-ὗ
      [0x1f59, 0x1f59], // greek extended: Ὑ
      [0x1f5b, 0x1f5b], // greek extended: Ὓ
      [0x1f5d, 0x1f5d], // greek extended: Ὕ
      [0x1f5f, 0x1f7d], // greek extended: Ὗ-ώ
      [0x1f80, 0x1fb4], // greek extended: ᾀ-ᾴ
      [0x1fb6, 0x1fc4], // greek extended: ᾶ-ῄ
      [0x1fc6, 0x1fd3], // greek extended: ῆ-ΐ
      [0x1fd6, 0x1fdb], // greek extended: ῖ-Ί
      [0x1fdd, 0x1fef], // greek extended: ῝-`
      [0x1ff2, 0x1ff4], // greek extended: ῲ-ῴ
      [0x1ff6, 0x1ffe], // greek extended: ῶ-῾
      [0x2126, 0x2126], // letterlike symbols: Ω
      [0xab65, 0xab65], // latin extended-e: ꭥ
      [0x10140, 0x1018e], // ancient greek numbers: 𐅀-𐆎
      [0x101a0, 0x101a0], // ancient symbols: 𐆠
      [0x1d200, 0x1d245], // ancient greek musical notation: 𝈀-𝉅
    ],
  },
  {
    id: "armenian",
    ranges: [
      [0x531, 0x556], // armenian: Ա-Ֆ
      [0x559, 0x58a], // armenian: ՙ-֊
      [0x58d, 0x58f], // armenian: ֍-֏
      [0xfb13, 0xfb17], // alphabetic presentation forms: ﬓ-ﬗ
    ],
  },
  {
    id: "georgian",
    ranges: [
      [0x10a0, 0x10c5], // georgian: Ⴀ-Ⴥ
      [0x10c7, 0x10c7], // georgian: Ⴧ
      [0x10cd, 0x10cd], // georgian: Ⴭ
      [0x10d0, 0x10fa], // georgian: ა-ჺ
      [0x10fc, 0x10ff], // georgian: ჼ-ჿ
      [0x1c90, 0x1cba], // georgian extended: Ა-Ჺ
      [0x1cbd, 0x1cbf], // georgian extended: Ჽ-Ჿ
      [0x2d00, 0x2d25], // georgian supplement: ⴀ-ⴥ
      [0x2d27, 0x2d27], // georgian supplement: ⴧ
      [0x2d2d, 0x2d2d], // georgian supplement: ⴭ
    ],
  },
  {
    id: "hebrew",
    ranges: [
      [0x591, 0x5c7], // hebrew: ֑-ׇ
      [0x5d0, 0x5ea], // hebrew: א-ת
      [0x5ef, 0x5f4], // hebrew: ׯ-״
      [0xfb1d, 0xfb36], // alphabetic presentation forms: יִ-זּ
      [0xfb38, 0xfb3c], // alphabetic presentation forms: טּ-לּ
      [0xfb3e, 0xfb3e], // alphabetic presentation forms: מּ
      [0xfb40, 0xfb41], // alphabetic presentation forms: נּ-סּ
      [0xfb43, 0xfb44], // alphabetic presentation forms: ףּ-פּ
      [0xfb46, 0xfb4f], // alphabetic presentation forms: צּ-ﭏ
    ],
  },
  {
    id: "arabic",
    ranges: [
      [0x600, 0x604], // arabic: ؀-؄
      [0x606, 0x60b], // arabic: ؆-؋
      [0x60d, 0x61a], // arabic: ؍-ؚ
      [0x61c, 0x61e], // arabic: ؜-؞
      [0x620, 0x63f], // arabic: ؠ-ؿ
      [0x641, 0x64a], // arabic: ف-ي
      [0x656, 0x66f], // arabic: ٖ-ٯ
      [0x671, 0x6dc], // arabic: ٱ-ۜ
      [0x6de, 0x6ff], // arabic: ۞-ۿ
      [0x750, 0x77f], // arabic supplement: ݐ-ݿ
      [0x870, 0x891], // arabic extended-b: ࡰ-࢑
      [0x897, 0x8e1], // arabic extended-b + arabic extended-a: ࢗ-࣡
      [0x8e3, 0x8ff], // arabic extended-a: ࣣ-ࣿ
      [0xfb50, 0xfd3d], // arabic presentation forms-a: ﭐ-ﴽ
      [0xfd40, 0xfdcf], // arabic presentation forms-a: ﵀-﷏
      [0xfdf0, 0xfdff], // arabic presentation forms-a: ﷰ-﷿
      [0xfe70, 0xfe74], // arabic presentation forms-b: ﹰ-ﹴ
      [0xfe76, 0xfefc], // arabic presentation forms-b: ﹶ-ﻼ
      [0x10e60, 0x10e7e], // rumi numeral symbols: 𐹠-𐹾
      [0x10ec2, 0x10ec7], // arabic extended-c: 𐻂-𐻇
      [0x10ed0, 0x10ed8], // arabic extended-c: 𐻐-𐻘
      [0x10efa, 0x10eff], // arabic extended-c: 𐻺-𐻿
      [0x1ee00, 0x1ee03], // arabic mathematical alphabetic symbols: 𞸀-𞸃
      [0x1ee05, 0x1ee1f], // arabic mathematical alphabetic symbols: 𞸅-𞸟
      [0x1ee21, 0x1ee22], // arabic mathematical alphabetic symbols: 𞸡-𞸢
      [0x1ee24, 0x1ee24], // arabic mathematical alphabetic symbols: 𞸤
      [0x1ee27, 0x1ee27], // arabic mathematical alphabetic symbols: 𞸧
      [0x1ee29, 0x1ee32], // arabic mathematical alphabetic symbols: 𞸩-𞸲
      [0x1ee34, 0x1ee37], // arabic mathematical alphabetic symbols: 𞸴-𞸷
      [0x1ee39, 0x1ee39], // arabic mathematical alphabetic symbols: 𞸹
      [0x1ee3b, 0x1ee3b], // arabic mathematical alphabetic symbols: 𞸻
      [0x1ee42, 0x1ee42], // arabic mathematical alphabetic symbols: 𞹂
      [0x1ee47, 0x1ee47], // arabic mathematical alphabetic symbols: 𞹇
      [0x1ee49, 0x1ee49], // arabic mathematical alphabetic symbols: 𞹉
      [0x1ee4b, 0x1ee4b], // arabic mathematical alphabetic symbols: 𞹋
      [0x1ee4d, 0x1ee4f], // arabic mathematical alphabetic symbols: 𞹍-𞹏
      [0x1ee51, 0x1ee52], // arabic mathematical alphabetic symbols: 𞹑-𞹒
      [0x1ee54, 0x1ee54], // arabic mathematical alphabetic symbols: 𞹔
      [0x1ee57, 0x1ee57], // arabic mathematical alphabetic symbols: 𞹗
      [0x1ee59, 0x1ee59], // arabic mathematical alphabetic symbols: 𞹙
      [0x1ee5b, 0x1ee5b], // arabic mathematical alphabetic symbols: 𞹛
      [0x1ee5d, 0x1ee5d], // arabic mathematical alphabetic symbols: 𞹝
      [0x1ee5f, 0x1ee5f], // arabic mathematical alphabetic symbols: 𞹟
      [0x1ee61, 0x1ee62], // arabic mathematical alphabetic symbols: 𞹡-𞹢
      [0x1ee64, 0x1ee64], // arabic mathematical alphabetic symbols: 𞹤
      [0x1ee67, 0x1ee6a], // arabic mathematical alphabetic symbols: 𞹧-𞹪
      [0x1ee6c, 0x1ee72], // arabic mathematical alphabetic symbols: 𞹬-𞹲
      [0x1ee74, 0x1ee77], // arabic mathematical alphabetic symbols: 𞹴-𞹷
      [0x1ee79, 0x1ee7c], // arabic mathematical alphabetic symbols: 𞹹-𞹼
      [0x1ee7e, 0x1ee7e], // arabic mathematical alphabetic symbols: 𞹾
      [0x1ee80, 0x1ee89], // arabic mathematical alphabetic symbols: 𞺀-𞺉
      [0x1ee8b, 0x1ee9b], // arabic mathematical alphabetic symbols: 𞺋-𞺛
      [0x1eea1, 0x1eea3], // arabic mathematical alphabetic symbols: 𞺡-𞺣
      [0x1eea5, 0x1eea9], // arabic mathematical alphabetic symbols: 𞺥-𞺩
      [0x1eeab, 0x1eebb], // arabic mathematical alphabetic symbols: 𞺫-𞺻
      [0x1eef0, 0x1eef1], // arabic mathematical alphabetic symbols: 𞻰-𞻱
    ],
  },
  {
    id: "syriac",
    ranges: [
      [0x700, 0x70d], // syriac: ܀-܍
      [0x70f, 0x74a], // syriac: ܏-݊
      [0x74d, 0x74f], // syriac: ݍ-ݏ
      [0x860, 0x86a], // syriac supplement: ࡠ-ࡪ
    ],
  },
  {
    id: "thaana",
    ranges: [
      [0x780, 0x7b1], // thaana: ހ-ޱ
    ],
  },
  {
    id: "devanagari",
    ranges: [
      [0x900, 0x950], // devanagari: ऀ-ॐ
      [0x955, 0x963], // devanagari: ॕ-ॣ
      [0x966, 0x97f], // devanagari: ०-ॿ
      [0xa8e0, 0xa8ff], // devanagari extended: ꣠-ꣿ
      [0x11b00, 0x11b09], // devanagari extended-a: 𑬀-𑬉
    ],
  },
  {
    id: "bengali",
    ranges: [
      [0x980, 0x983], // bengali: ঀ-ঃ
      [0x985, 0x98c], // bengali: অ-ঌ
      [0x98f, 0x990], // bengali: এ-ঐ
      [0x993, 0x9a8], // bengali: ও-ন
      [0x9aa, 0x9b0], // bengali: প-র
      [0x9b2, 0x9b2], // bengali: ল
      [0x9b6, 0x9b9], // bengali: শ-হ
      [0x9bc, 0x9c4], // bengali: ়-ৄ
      [0x9c7, 0x9c8], // bengali: ে-ৈ
      [0x9cb, 0x9ce], // bengali: ো-ৎ
      [0x9d7, 0x9d7], // bengali: ৗ
      [0x9dc, 0x9dd], // bengali: ড়-ঢ়
      [0x9df, 0x9e3], // bengali: য়-ৣ
      [0x9e6, 0x9fe], // bengali: ০-৾
    ],
  },
  {
    id: "gurmukhi",
    ranges: [
      [0xa01, 0xa03], // gurmukhi: ਁ-ਃ
      [0xa05, 0xa0a], // gurmukhi: ਅ-ਊ
      [0xa0f, 0xa10], // gurmukhi: ਏ-ਐ
      [0xa13, 0xa28], // gurmukhi: ਓ-ਨ
      [0xa2a, 0xa30], // gurmukhi: ਪ-ਰ
      [0xa32, 0xa33], // gurmukhi: ਲ-ਲ਼
      [0xa35, 0xa36], // gurmukhi: ਵ-ਸ਼
      [0xa38, 0xa39], // gurmukhi: ਸ-ਹ
      [0xa3c, 0xa3c], // gurmukhi: ਼
      [0xa3e, 0xa42], // gurmukhi: ਾ-ੂ
      [0xa47, 0xa48], // gurmukhi: ੇ-ੈ
      [0xa4b, 0xa4d], // gurmukhi: ੋ-੍
      [0xa51, 0xa51], // gurmukhi: ੑ
      [0xa59, 0xa5c], // gurmukhi: ਖ਼-ੜ
      [0xa5e, 0xa5e], // gurmukhi: ਫ਼
      [0xa66, 0xa76], // gurmukhi: ੦-੶
    ],
  },
  {
    id: "gujarati",
    ranges: [
      [0xa81, 0xa83], // gujarati: ઁ-ઃ
      [0xa85, 0xa8d], // gujarati: અ-ઍ
      [0xa8f, 0xa91], // gujarati: એ-ઑ
      [0xa93, 0xaa8], // gujarati: ઓ-ન
      [0xaaa, 0xab0], // gujarati: પ-ર
      [0xab2, 0xab3], // gujarati: લ-ળ
      [0xab5, 0xab9], // gujarati: વ-હ
      [0xabc, 0xac5], // gujarati: ઼-ૅ
      [0xac7, 0xac9], // gujarati: ે-ૉ
      [0xacb, 0xacd], // gujarati: ો-્
      [0xad0, 0xad0], // gujarati: ૐ
      [0xae0, 0xae3], // gujarati: ૠ-ૣ
      [0xae6, 0xaf1], // gujarati: ૦-૱
      [0xaf9, 0xaff], // gujarati: ૹ-૿
    ],
  },
  {
    id: "oriya",
    ranges: [
      [0xb01, 0xb03], // oriya: ଁ-ଃ
      [0xb05, 0xb0c], // oriya: ଅ-ଌ
      [0xb0f, 0xb10], // oriya: ଏ-ଐ
      [0xb13, 0xb28], // oriya: ଓ-ନ
      [0xb2a, 0xb30], // oriya: ପ-ର
      [0xb32, 0xb33], // oriya: ଲ-ଳ
      [0xb35, 0xb39], // oriya: ଵ-ହ
      [0xb3c, 0xb44], // oriya: ଼-ୄ
      [0xb47, 0xb48], // oriya: େ-ୈ
      [0xb4b, 0xb4d], // oriya: ୋ-୍
      [0xb55, 0xb57], // oriya: ୕-ୗ
      [0xb5c, 0xb5d], // oriya: ଡ଼-ଢ଼
      [0xb5f, 0xb63], // oriya: ୟ-ୣ
      [0xb66, 0xb77], // oriya: ୦-୷
    ],
  },
  {
    id: "tamil",
    ranges: [
      [0xb82, 0xb83], // tamil: ஂ-ஃ
      [0xb85, 0xb8a], // tamil: அ-ஊ
      [0xb8e, 0xb90], // tamil: எ-ஐ
      [0xb92, 0xb95], // tamil: ஒ-க
      [0xb99, 0xb9a], // tamil: ங-ச
      [0xb9c, 0xb9c], // tamil: ஜ
      [0xb9e, 0xb9f], // tamil: ஞ-ட
      [0xba3, 0xba4], // tamil: ண-த
      [0xba8, 0xbaa], // tamil: ந-ப
      [0xbae, 0xbb9], // tamil: ம-ஹ
      [0xbbe, 0xbc2], // tamil: ா-ூ
      [0xbc6, 0xbc8], // tamil: ெ-ை
      [0xbca, 0xbcd], // tamil: ொ-்
      [0xbd0, 0xbd0], // tamil: ௐ
      [0xbd7, 0xbd7], // tamil: ௗ
      [0xbe6, 0xbfa], // tamil: ௦-௺
      [0x11fc0, 0x11ff1], // tamil supplement: 𑿀-𑿱
      [0x11fff, 0x11fff], // tamil supplement: 𑿿
    ],
  },
  {
    id: "telugu",
    ranges: [
      [0xc00, 0xc0c], // telugu: ఀ-ఌ
      [0xc0e, 0xc10], // telugu: ఎ-ఐ
      [0xc12, 0xc28], // telugu: ఒ-న
      [0xc2a, 0xc39], // telugu: ప-హ
      [0xc3c, 0xc44], // telugu: ఼-ౄ
      [0xc46, 0xc48], // telugu: ె-ై
      [0xc4a, 0xc4d], // telugu: ొ-్
      [0xc55, 0xc56], // telugu: ౕ-ౖ
      [0xc58, 0xc5a], // telugu: ౘ-ౚ
      [0xc5c, 0xc5d], // telugu: ౜-ౝ
      [0xc60, 0xc63], // telugu: ౠ-ౣ
      [0xc66, 0xc6f], // telugu: ౦-౯
      [0xc77, 0xc7f], // telugu: ౷-౿
    ],
  },
  {
    id: "kannada",
    ranges: [
      [0xc80, 0xc8c], // kannada: ಀ-ಌ
      [0xc8e, 0xc90], // kannada: ಎ-ಐ
      [0xc92, 0xca8], // kannada: ಒ-ನ
      [0xcaa, 0xcb3], // kannada: ಪ-ಳ
      [0xcb5, 0xcb9], // kannada: ವ-ಹ
      [0xcbc, 0xcc4], // kannada: ಼-ೄ
      [0xcc6, 0xcc8], // kannada: ೆ-ೈ
      [0xcca, 0xccd], // kannada: ೊ-್
      [0xcd5, 0xcd6], // kannada: ೕ-ೖ
      [0xcdc, 0xcde], // kannada: ೜-ೞ
      [0xce0, 0xce3], // kannada: ೠ-ೣ
      [0xce6, 0xcef], // kannada: ೦-೯
      [0xcf1, 0xcf3], // kannada: ೱ-ೳ
    ],
  },
  {
    id: "malayalam",
    ranges: [
      [0xd00, 0xd0c], // malayalam: ഀ-ഌ
      [0xd0e, 0xd10], // malayalam: എ-ഐ
      [0xd12, 0xd44], // malayalam: ഒ-ൄ
      [0xd46, 0xd48], // malayalam: െ-ൈ
      [0xd4a, 0xd4f], // malayalam: ൊ-൏
      [0xd54, 0xd63], // malayalam: ൔ-ൣ
      [0xd66, 0xd7f], // malayalam: ൦-ൿ
    ],
  },
  {
    id: "sinhala",
    ranges: [
      [0xd81, 0xd83], // sinhala: ඁ-ඃ
      [0xd85, 0xd96], // sinhala: අ-ඖ
      [0xd9a, 0xdb1], // sinhala: ක-න
      [0xdb3, 0xdbb], // sinhala: ඳ-ර
      [0xdbd, 0xdbd], // sinhala: ල
      [0xdc0, 0xdc6], // sinhala: ව-ෆ
      [0xdca, 0xdca], // sinhala: ්
      [0xdcf, 0xdd4], // sinhala: ා-ු
      [0xdd6, 0xdd6], // sinhala: ූ
      [0xdd8, 0xddf], // sinhala: ෘ-ෟ
      [0xde6, 0xdef], // sinhala: ෦-෯
      [0xdf2, 0xdf4], // sinhala: ෲ-෴
      [0x111e1, 0x111f4], // sinhala archaic numbers: 𑇡-𑇴
    ],
  },
  {
    id: "ethiopic",
    ranges: [
      [0x1200, 0x1248], // ethiopic: ሀ-ቈ
      [0x124a, 0x124d], // ethiopic: ቊ-ቍ
      [0x1250, 0x1256], // ethiopic: ቐ-ቖ
      [0x1258, 0x1258], // ethiopic: ቘ
      [0x125a, 0x125d], // ethiopic: ቚ-ቝ
      [0x1260, 0x1288], // ethiopic: በ-ኈ
      [0x128a, 0x128d], // ethiopic: ኊ-ኍ
      [0x1290, 0x12b0], // ethiopic: ነ-ኰ
      [0x12b2, 0x12b5], // ethiopic: ኲ-ኵ
      [0x12b8, 0x12be], // ethiopic: ኸ-ኾ
      [0x12c0, 0x12c0], // ethiopic: ዀ
      [0x12c2, 0x12c5], // ethiopic: ዂ-ዅ
      [0x12c8, 0x12d6], // ethiopic: ወ-ዖ
      [0x12d8, 0x1310], // ethiopic: ዘ-ጐ
      [0x1312, 0x1315], // ethiopic: ጒ-ጕ
      [0x1318, 0x135a], // ethiopic: ጘ-ፚ
      [0x135d, 0x137c], // ethiopic: ፝-፼
      [0x1380, 0x1399], // ethiopic supplement: ᎀ-᎙
      [0x2d80, 0x2d96], // ethiopic extended: ⶀ-ⶖ
      [0x2da0, 0x2da6], // ethiopic extended: ⶠ-ⶦ
      [0x2da8, 0x2dae], // ethiopic extended: ⶨ-ⶮ
      [0x2db0, 0x2db6], // ethiopic extended: ⶰ-ⶶ
      [0x2db8, 0x2dbe], // ethiopic extended: ⶸ-ⶾ
      [0x2dc0, 0x2dc6], // ethiopic extended: ⷀ-ⷆ
      [0x2dc8, 0x2dce], // ethiopic extended: ⷈ-ⷎ
      [0x2dd0, 0x2dd6], // ethiopic extended: ⷐ-ⷖ
      [0x2dd8, 0x2dde], // ethiopic extended: ⷘ-ⷞ
      [0xab01, 0xab06], // ethiopic extended-a: ꬁ-ꬆ
      [0xab09, 0xab0e], // ethiopic extended-a: ꬉ-ꬎ
      [0xab11, 0xab16], // ethiopic extended-a: ꬑ-ꬖ
      [0xab20, 0xab26], // ethiopic extended-a: ꬠ-ꬦ
      [0xab28, 0xab2e], // ethiopic extended-a: ꬨ-ꬮ
      [0x1e7e0, 0x1e7e6], // ethiopic extended-b: 𞟠-𞟦
      [0x1e7e8, 0x1e7eb], // ethiopic extended-b: 𞟨-𞟫
      [0x1e7ed, 0x1e7ee], // ethiopic extended-b: 𞟭-𞟮
      [0x1e7f0, 0x1e7fe], // ethiopic extended-b: 𞟰-𞟾
    ],
  },
  {
    id: "cherokee",
    ranges: [
      [0x13a0, 0x13f5], // cherokee: Ꭰ-Ᏽ
      [0x13f8, 0x13fd], // cherokee: ᏸ-ᏽ
      [0xab70, 0xabbf], // cherokee supplement: ꭰ-ꮿ
    ],
  },
  {
    id: "hangul",
    ranges: [
      [0x1100, 0x11ff], // hangul jamo: ᄀ-ᇿ
      [0x302e, 0x302f], // cjk symbols and punctuation: 〮-〯
      [0x3131, 0x318e], // hangul compatibility jamo: ㄱ-ㆎ
      [0x3200, 0x321e], // enclosed cjk letters and months: ㈀-㈞
      [0x3260, 0x327e], // enclosed cjk letters and months: ㉠-㉾
      [0xa960, 0xa97c], // hangul jamo extended-a: ꥠ-ꥼ
      [0xac00, 0xd7a3], // hangul syllables: 가-힣
      [0xd7b0, 0xd7c6], // hangul jamo extended-b: ힰ-ퟆ
      [0xd7cb, 0xd7fb], // hangul jamo extended-b: ퟋ-ퟻ
      [0xffa0, 0xffbe], // halfwidth and fullwidth forms: ﾠ-ﾾ
      [0xffc2, 0xffc7], // halfwidth and fullwidth forms: ￂ-ￇ
      [0xffca, 0xffcf], // halfwidth and fullwidth forms: ￊ-ￏ
      [0xffd2, 0xffd7], // halfwidth and fullwidth forms: ￒ-ￗ
      [0xffda, 0xffdc], // halfwidth and fullwidth forms: ￚ-ￜ
    ],
  },
];
