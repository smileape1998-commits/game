export type CharacterRole =
  | 'duke'
  | 'assassin'
  | 'captain'
  | 'ambassador'
  | 'contessa'
  | 'inquisitor';

export interface CharacterDef {
  id: CharacterRole;
  nameTh: string;
  nameEn: string;
  titleTh: string;
  titleEn: string;
  color: string;
  colorSecondary: string;
  bgColor: string;
  theme: string;
  image: string;
  descriptionTh: string;
  descriptionEn: string;
  actionsTh: string[];
  actionsEn: string[];
  blocksTh: string[];
  blocksEn: string[];
}

export const CHARACTERS: Record<CharacterRole, CharacterDef> = {
  duke: {
    id: 'duke',
    nameTh: 'เจ้าพระยา',
    nameEn: 'The Duke',
    titleTh: 'ผู้ครองคลังหลวง',
    titleEn: 'Royal Golden Hamster',
    color: '#EAB308', // Gold
    colorSecondary: '#B45309',
    bgColor: '#78350F',
    theme: 'Royal golden hamster',
    image: '/cards/duke.jpg',
    descriptionTh: 'หนูแฮมสเตอร์ขนทองอร่าม สวมมงกุฎและผ้าคลุมกำมะหยี่สีแดง ควบคุมคลังหลวงลูกโอ๊กทองคำ',
    descriptionEn: 'The royal golden hamster draped in velvet and jewels, presiding over the royal treasury.',
    actionsTh: ['เก็บภาษี (Tax): รับ 3 ลูกโอ๊กทองคำจากคลังกลาง'],
    actionsEn: ['Tax: Collect 3 Golden Acorns from the treasury'],
    blocksTh: ['ขัดขวางความช่วยเหลือจากต่างแดน (Block Foreign Aid)'],
    blocksEn: ['Blocks Foreign Aid (prevents taking 2 Acorns)']
  },
  assassin: {
    id: 'assassin',
    nameTh: 'มือสังหาร',
    nameEn: 'The Assassin',
    titleTh: 'เงาลอบสังหาร',
    titleEn: 'Hooded Shadow Assassin',
    color: '#3B82F6', // Navy Blue
    colorSecondary: '#1D4ED8',
    bgColor: '#1E293B',
    theme: 'Hooded hamster assassin',
    image: '/cards/assassin.jpg',
    descriptionTh: 'หนูแฮมสเตอร์ชุดคลุมสีน้ำเงินกรมท่า ซุ่มอยู่ในเงามืดพร้อมกริชโอ๊กพิษ',
    descriptionEn: 'A cloaked hamster assassin lurking in castle rafters, striking with silent precision.',
    actionsTh: ['ลอบสังหาร (Assassinate): จ่าย 3 ลูกโอ๊กทองคำ บังคับให้เป้าหมายสูญเสีย 1 อิทธิพล'],
    actionsEn: ['Assassinate: Pay 3 Golden Acorns to force target to lose 1 influence'],
    blocksTh: [],
    blocksEn: []
  },
  captain: {
    id: 'captain',
    nameTh: 'ขุนโจร',
    nameEn: 'The Captain',
    titleTh: 'จอมโจรโจรสลัด',
    titleEn: 'Pirate Captain Hamster',
    color: '#06B6D4', // Teal/Cyan
    colorSecondary: '#0E7490',
    bgColor: '#164E63',
    theme: 'Mischievous hamster pirate or bandit',
    image: '/cards/captain.jpg',
    descriptionTh: 'หนูแฮมสเตอร์โจรสลัดคาดตาข้างเดียว ขนปุยสีฟ้าอมเขียว พร้อมดาบสั้นและถุงปล้นลูกโอ๊ก',
    descriptionEn: 'A swashbuckling pirate hamster with an eye patch, plundering acorns across the high seas.',
    actionsTh: ['ปล้นสะดม (Steal): ขโมย 2 ลูกโอ๊กทองคำจากผู้เล่นอื่น'],
    actionsEn: ['Steal: Take up to 2 Golden Acorns from another player'],
    blocksTh: ['ขัดขวางการปล้นสะดม (Blocks Steal)'],
    blocksEn: ['Blocks Stealing from other Captains']
  },
  ambassador: {
    id: 'ambassador',
    nameTh: 'ราชทูต',
    nameEn: 'The Ambassador',
    titleTh: 'ทูตสันถวไมตรี',
    titleEn: 'Aristocratic Diplomat Hamster',
    color: '#10B981', // Emerald / Green
    colorSecondary: '#047857',
    bgColor: '#064E3B',
    theme: 'Aristocratic hamster diplomat',
    image: '/cards/ambassador.jpg',
    descriptionTh: 'หนูแฮมสเตอร์ขุนนางชั้นสูง ถือสารตราสัญลักษณ์ นำความลับและไพ่ใหม่มาสับเปลี่ยน',
    descriptionEn: 'An aristocratic court diplomat carrying official decrees, exchanging cards from court archives.',
    actionsTh: ['แลกเปลี่ยน (Exchange): จั่วไพ่ 2 ใบจากกองไพ่ เลือกเก็บและคืนไพ่เข้ากอง'],
    actionsEn: ['Exchange: Draw 2 cards from deck, choose which cards to keep, return the rest'],
    blocksTh: ['ขัดขวางการปล้นสะดม (Blocks Steal)'],
    blocksEn: ['Blocks Stealing from other Captains']
  },
  contessa: {
    id: 'contessa',
    nameTh: 'รัชทายาท',
    nameEn: 'The Contessa',
    titleTh: 'องค์หญิงผู้สูงศักดิ์',
    titleEn: 'Royal Hamster Heiress',
    color: '#EC4899', // Pink / Magenta
    colorSecondary: '#BE185D',
    bgColor: '#831843',
    theme: 'Elegant hamster royal heir',
    image: '/cards/contessa.jpg',
    descriptionTh: 'หนูแฮมสเตอร์หญิงผู้สูงศักดิ์ สวมมงกุฎดอกไม้และชุดคลุมสีชมพูบานเย็น ทรงพลังคุ้มกันการลอบสังหาร',
    descriptionEn: 'An elegant princess hamster whose royal guard repels any assassin’s strike.',
    actionsTh: [],
    actionsEn: [],
    blocksTh: ['ขัดขวางการลอบสังหาร (Blocks Assassination)'],
    blocksEn: ['Blocks Assassination attempts against herself']
  },
  inquisitor: {
    id: 'inquisitor',
    nameTh: 'ผู้ตรวจการ',
    nameEn: 'The Inquisitor',
    titleTh: 'ตุลาการผู้ทรงภูมิ',
    titleEn: 'Scholarly Grey Hamster Inquisitor',
    color: '#A855F7', // Purple
    colorSecondary: '#7E22CE',
    bgColor: '#581C87',
    theme: 'Scholarly grey hamster investigator',
    image: '/cards/inquisitor.jpg',
    descriptionTh: 'หนูแฮมสเตอร์สีเทา สวมแว่นขยายและชุดปราชญ์ สืบสวนความจริงและตรวจสอบไพ่ลับของผู้เล่นอื่น',
    descriptionEn: 'A wise grey hamster scholar holding a magnifying glass, probing opponents’ secrets.',
    actionsTh: [
      'ตรวจค้นไพ่ (Inspect): แอบดูไพ่ลับ 1 ใบของคู่แข่ง และเลือกว่าจะบังคับให้สับเปลี่ยนหรือไม่',
      'แลกเปลี่ยนส่วนตัว (Exchange): จั่วไพ่ 1 ใบจากกอง สลับกับไพ่ตนเอง 1 ใบ'
    ],
    actionsEn: [
      'Inspect: Privately look at one opponent influence card; decide whether to force them to return and redraw it',
      'Exchange: Draw 1 card from deck, exchange with 1 card in hand, return 1 to deck'
    ],
    blocksTh: ['ขัดขวางการปล้นสะดม (Blocks Steal)'],
    blocksEn: ['Blocks Stealing from Captains (optional rule)']
  }
};
