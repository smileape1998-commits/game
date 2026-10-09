import { CharacterRole } from './characters.js';

export type ActionType =
  | 'income'
  | 'foreign_aid'
  | 'coup'
  | 'tax'
  | 'assassinate'
  | 'steal'
  | 'exchange'
  | 'inquisitor_inspect'
  | 'inquisitor_exchange'
  | 'convert_self'
  | 'convert_other';

export interface ActionDefinition {
  type: ActionType;
  nameTh: string;
  nameEn: string;
  claimedRole?: CharacterRole;
  cost: number;
  gain: number;
  isTargeted: boolean;
  canBeChallenged: boolean;
  canBeBlocked: boolean;
  blockingRoles: CharacterRole[];
  descriptionTh: string;
  descriptionEn: string;
}

export const ACTION_DEFINITIONS: Record<ActionType, ActionDefinition> = {
  income: {
    type: 'income',
    nameTh: 'รับเงินสงเคราะห์ (Income)',
    nameEn: 'Income',
    cost: 0,
    gain: 1,
    isTargeted: false,
    canBeChallenged: false,
    canBeBlocked: false,
    blockingRoles: [],
    descriptionTh: 'รับ 1 ลูกโอ๊กทองคำจากคลังกลาง ไม่สามารถถูกขัดขวางหรือท้าทายได้',
    descriptionEn: 'Take 1 Golden Acorn from the treasury. Cannot be blocked or challenged.'
  },
  foreign_aid: {
    type: 'foreign_aid',
    nameTh: 'ขอความช่วยเหลือต่างแดน (Foreign Aid)',
    nameEn: 'Foreign Aid',
    cost: 0,
    gain: 2,
    isTargeted: false,
    canBeChallenged: false,
    canBeBlocked: true,
    blockingRoles: ['duke'],
    descriptionTh: 'รับ 2 ลูกโอ๊กทองคำจากคลังกลาง สามารถถูกขัดขวางโดยเจ้าพระยา (The Duke)',
    descriptionEn: 'Take 2 Golden Acorns from the treasury. Can be blocked by anyone claiming The Duke.'
  },
  coup: {
    type: 'coup',
    nameTh: 'รัฐประหาร (Coup)',
    nameEn: 'Coup',
    cost: 7,
    gain: 0,
    isTargeted: true,
    canBeChallenged: false,
    canBeBlocked: false,
    blockingRoles: [],
    descriptionTh: 'จ่าย 7 ลูกโอ๊กทองคำ บังคับผู้เล่น 1 คนให้สูญเสีย 1 อิทธิพลทันที ไม่สามารถขัดขวางหรือท้าทายได้',
    descriptionEn: 'Pay 7 Golden Acorns. Target player immediately loses 1 influence. Cannot be blocked or challenged.'
  },
  tax: {
    type: 'tax',
    nameTh: 'เก็บภาษี (Tax - เจ้าพระยา)',
    nameEn: 'Tax (The Duke)',
    claimedRole: 'duke',
    cost: 0,
    gain: 3,
    isTargeted: false,
    canBeChallenged: true,
    canBeBlocked: false,
    blockingRoles: [],
    descriptionTh: 'อ้างว่าเป็นเจ้าพระยา รับ 3 ลูกโอ๊กทองคำ สามารถถูกท้าทายได้',
    descriptionEn: 'Claim The Duke to take 3 Golden Acorns from the treasury. Can be challenged.'
  },
  assassinate: {
    type: 'assassinate',
    nameTh: 'ลอบสังหาร (Assassinate - มือสังหาร)',
    nameEn: 'Assassinate (The Assassin)',
    claimedRole: 'assassin',
    cost: 3,
    gain: 0,
    isTargeted: true,
    canBeChallenged: true,
    canBeBlocked: true,
    blockingRoles: ['contessa'],
    descriptionTh: 'อ้างว่าเป็นมือสังหาร จ่าย 3 ลูกโอ๊ก บังคับเป้าหมายสูญเสีย 1 อิทธิพล (ถูกกันได้โดยรัชทายาท)',
    descriptionEn: 'Claim The Assassin. Pay 3 Acorns to force a target to lose 1 influence. Can be blocked by The Contessa.'
  },
  steal: {
    type: 'steal',
    nameTh: 'ปล้นสะดม (Steal - ขุนโจร)',
    nameEn: 'Steal (The Captain)',
    claimedRole: 'captain',
    cost: 0,
    gain: 2, // up to 2
    isTargeted: true,
    canBeChallenged: true,
    canBeBlocked: true,
    blockingRoles: ['captain', 'ambassador'], // Inquisitor can also be enabled via rules
    descriptionTh: 'อ้างว่าเป็นขุนโจร ขโมย 2 ลูกโอ๊กทองคำจากผู้เล่นเป้าหมาย (ถูกกันได้โดยขุนโจรหรือราชทูต)',
    descriptionEn: 'Claim The Captain. Steal up to 2 Golden Acorns from target. Can be blocked by Captain or Ambassador.'
  },
  exchange: {
    type: 'exchange',
    nameTh: 'แลกเปลี่ยนไพ่ (Exchange - ราชทูต)',
    nameEn: 'Exchange (The Ambassador)',
    claimedRole: 'ambassador',
    cost: 0,
    gain: 0,
    isTargeted: false,
    canBeChallenged: true,
    canBeBlocked: false,
    blockingRoles: [],
    descriptionTh: 'อ้างว่าเป็นราชทูต จั่วไพ่ 2 ใบจากกอง เลือกเปลี่ยนกับไพ่ในมือแล้วคืนส่วนที่เหลือเข้ากอง',
    descriptionEn: 'Claim The Ambassador. Draw 2 cards from deck, choose which to keep, and return 2 cards.'
  },
  inquisitor_inspect: {
    type: 'inquisitor_inspect',
    nameTh: 'สืบสวนไพ่ (Inspect - ผู้ตรวจการ)',
    nameEn: 'Inspect (The Inquisitor)',
    claimedRole: 'inquisitor',
    cost: 0,
    gain: 0,
    isTargeted: true,
    canBeChallenged: true,
    canBeBlocked: false,
    blockingRoles: [],
    descriptionTh: 'อ้างว่าเป็นผู้ตรวจการ แอบดูไพ่ลับ 1 ใบของเป้าหมาย และตัดสินใจว่าจะบังคับให้เปลี่ยนไพ่หรือไม่',
    descriptionEn: 'Claim The Inquisitor. Privately inspect 1 card of target; decide whether target must exchange it.'
  },
  inquisitor_exchange: {
    type: 'inquisitor_exchange',
    nameTh: 'แลกเปลี่ยนเดี่ยว (Exchange - ผู้ตรวจการ)',
    nameEn: 'Exchange (The Inquisitor)',
    claimedRole: 'inquisitor',
    cost: 0,
    gain: 0,
    isTargeted: false,
    canBeChallenged: true,
    canBeBlocked: false,
    blockingRoles: [],
    descriptionTh: 'อ้างว่าเป็นผู้ตรวจการ จั่วไพ่ 1 ใบจากกอง สลับกับไพ่ในมือตนเอง 1 ใบ',
    descriptionEn: 'Claim The Inquisitor. Draw 1 card from deck, exchange with 1 card in hand, return 1 to deck.'
  },
  convert_self: {
    type: 'convert_self',
    nameTh: 'เปลี่ยนฝ่ายตนเอง (Change Faction)',
    nameEn: 'Change Faction (Self)',
    cost: 1, // configurable, default 1
    gain: 0,
    isTargeted: false,
    canBeChallenged: false,
    canBeBlocked: false,
    blockingRoles: [],
    descriptionTh: 'จ่ายลูกโอ๊กเข้ากองกลางเพื่อเปลี่ยนสีฝ่ายของตนเอง (แดง <-> น้ำเงิน)',
    descriptionEn: 'Pay acorns to switch your faction allegiance between Red and Blue.'
  },
  convert_other: {
    type: 'convert_other',
    nameTh: 'เปลี่ยนฝ่ายผู้อื่น (Change Faction - Target)',
    nameEn: 'Change Faction (Other)',
    cost: 2, // configurable, default 2
    gain: 0,
    isTargeted: true,
    canBeChallenged: false,
    canBeBlocked: false,
    blockingRoles: [],
    descriptionTh: 'จ่ายลูกโอ๊กเข้ากองกลางเพื่อเปลี่ยนสีฝ่ายของผู้เล่นอื่น',
    descriptionEn: 'Pay acorns to switch another player’s faction allegiance.'
  }
};
