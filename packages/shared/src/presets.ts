import { GameSettings } from './models.js';

export const PRESET_CLASSIC: GameSettings = {
  minPlayers: 2,
  maxPlayers: 6,
  startingAcorns: 2,
  mandatoryCoupThreshold: 10,
  coupCost: 7,
  assassinCost: 3,
  captainStealAmount: 2,
  copiesPerRole: 3,
  enabledRoles: {
    duke: true,
    assassin: true,
    captain: true,
    ambassador: true,
    contessa: true,
    inquisitor: false
  },
  refundAssassinOnChallengeFail: false,
  inquisitorCanBlockSteal: false,
  reformationEnabled: false,
  reformationFriendlyFireBlocked: true,
  convertSelfCost: 1,
  convertOtherCost: 2,
  responseTimeoutSeconds: 15,
  preset: 'classic'
};

export const PRESET_STANDARD: GameSettings = {
  minPlayers: 2,
  maxPlayers: 6,
  startingAcorns: 2,
  mandatoryCoupThreshold: 10,
  coupCost: 7,
  assassinCost: 3,
  captainStealAmount: 2,
  copiesPerRole: 3,
  enabledRoles: {
    duke: true,
    assassin: true,
    captain: true,
    ambassador: true,
    contessa: true,
    inquisitor: true
  },
  refundAssassinOnChallengeFail: false,
  inquisitorCanBlockSteal: true,
  reformationEnabled: false,
  reformationFriendlyFireBlocked: true,
  convertSelfCost: 1,
  convertOtherCost: 2,
  responseTimeoutSeconds: 15,
  preset: 'standard'
};

export const PRESET_REFORMATION: GameSettings = {
  minPlayers: 2,
  maxPlayers: 6,
  startingAcorns: 2,
  mandatoryCoupThreshold: 10,
  coupCost: 7,
  assassinCost: 3,
  captainStealAmount: 2,
  copiesPerRole: 3,
  enabledRoles: {
    duke: true,
    assassin: true,
    captain: true,
    ambassador: true,
    contessa: true,
    inquisitor: true
  },
  refundAssassinOnChallengeFail: false,
  inquisitorCanBlockSteal: true,
  reformationEnabled: true,
  reformationFriendlyFireBlocked: true,
  convertSelfCost: 1,
  convertOtherCost: 2,
  responseTimeoutSeconds: 15,
  preset: 'reformation'
};

export const DEFAULT_SETTINGS: GameSettings = PRESET_STANDARD;
