# HAMSTER COUP: GOLDEN ACORNS 🐹👑
### แฮมสเตอร์ ชิงบัลลังก์ลูกโอ๊กทองคำ

A complete, production-grade, responsive browser-based multiplayer bluffing card game inspired by the strategic mechanics of **Coup** and the faction mechanics of **Coup: Reformation**. Built with original hamster-themed fantasy artwork, Golden Acorns as currency, Thai character names, and a customizable rules engine.

---

## 🌟 Key Features

1. **Pure Server-Authoritative Rules Engine (`@hamster-coup/game-engine`)**
   - Deterministic state machine supporting all action lifecycles: Action selection, Challenge windows, Block windows, Block Challenge windows, Card replacement, and Invariant validation.
   - Zero tolerance for negative balances or hidden information leaks.

2. **Three Complete Gameplay Modes**
   - **Mode A — Play Against AI**: 1 human and 1–5 configurable AI opponents (2–6 players total). 5 distinct personalities (*Cautious, Aggressive, Deceptive, Defensive, Strategic*) and 3 difficulty levels (*Easy, Normal, Hard*). AI counts known cards without ever reading opponent secrets.
   - **Mode B — Local Multiplayer (Pass & Play)**: 2–6 players sharing a single screen or mobile device. Features a `PassDeviceModal` handoff curtain between turns to conceal hidden cards.
   - **Mode C — Online Multiplayer**: Real-time Socket.IO communication with 4-letter private room codes, host lobby management, ready states, add-AI support, live rematch, and state synchronization.

3. **Rich Fantasy Hamster Aesthetic**
   - Custom vector illustrations for all 6 characters and the 3D Golden Acorn currency token.
   - Dark textured royal felt table, ornate gold borders, Thai typography (`Prompt` & `Cinzel` fonts), and Web Audio API procedural sound synthesizer (coin drops, card flips, challenge horns, victory fanfares).

4. **Reformation Team Mode**
   - Red & Blue team factions, friendly-fire attack protection, allegiance conversion (แปรพักตร์), and faction victory conditions.

5. **Configurable Rules & Presets Editor**
   - Presets: *Classic-inspired (5 roles)*, *Hamster Standard (6 roles including Inquisitor)*, *Reformation (Factions)*, and *Custom*.
   - Adjust starting acorns, mandatory Coup thresholds, character toggles, and costs.

---

## 🐹 Character Roster (ตัวละครทั้ง 6)

| Character (บทบาท) | Thai Title | Theme & Color | Primary Ability / Block |
| :--- | :--- | :--- | :--- |
| **เจ้าพระยา (The Duke)** | ผู้ครองคลังหลวง | Royal Gold / Red (`#EAB308`) | **Tax**: รับ 3 ลูกโอ๊ก / กันความช่วยเหลือต่างแดน |
| **มือสังหาร (The Assassin)** | เงาลอบสังหาร | Navy Cowl (`#3B82F6`) | **Assassinate**: จ่าย 3 ลูกโอ๊ก บังคับเสีย 1 อิทธิพล |
| **ขุนโจร (The Captain)** | จอมโจรโจรสลัด | Teal Pirate (`#06B6D4`) | **Steal**: ปล้น 2 ลูกโอ๊ก / กันการปล้น |
| **ราชทูต (The Ambassador)** | ทูตสันถวไมตรี | Emerald Diplomat (`#10B981`) | **Exchange**: จั่ว 2 ใบเลือกเปลี่ยน / กันการปล้น |
| **รัชทายาท (The Contessa)** | องค์หญิงผู้สูงศักดิ์ | Magenta Princess (`#EC4899`) | **Block Assassination**: กันการลอบสังหาร |
| **ผู้ตรวจการ (The Inquisitor)** | ตุลาการผู้ทรงภูมิ | Purple Scholar (`#A855F7`) | **Inspect**: แอบดูไพ่ลับ 1 ใบ / สลับไพ่เดี่ยว / กันการปล้น |

---

## 📁 Monorepo Structure

```
├── packages/
│   ├── shared/         # Shared schemas (Zod), models, action definitions, socket protocols
│   ├── game-engine/    # Pure game rules, deterministic RNG, invariants, public serializer
│   └── game-ai/        # AI decision-making (5 personalities, 3 difficulties, card counting)
├── apps/
│   ├── server/         # Express + Socket.IO real-time multiplayer server & room manager
│   │   └── src/db/     # PostgreSQL schema migrations and seed scripts
│   └── web/            # React + Vite + Tailwind CSS + Framer Motion browser client
├── tests/
│   └── e2e/            # End-to-end gameplay scenarios (Scenarios A through E)
└── docs/
    ├── RULES.md        # Official Thai/English rulebook
    ├── DEPLOYMENT.md   # Docker & production hosting instructions
    └── ACCEPTANCE_CRITERIA_REPORT.md # Systematic verification report (AC-01 to AC-12)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ / 22+ / 24+
- npm 10+

### Installation & Run

```bash
# 1. Install all dependencies across workspaces
npm install

# 2. Run automated test suite (19 tests)
npm run test

# 3. Build production packages
npm run build

# 4. Start backend server (port 3001)
npm run dev:server

# 5. In another terminal, start web dev server (port 3000)
npm run dev:web
```

Visit `http://localhost:3000` to play!

---

## 🧪 Testing Suite

Run the complete test suite:

```bash
npx vitest run
```

Test coverage includes:
- **`packages/game-engine/test/engine.test.ts`**: Deck setup, Income, Foreign Aid, Duke Tax, Assassinate, Steal, Ambassador Exchange, Mandatory Coup, Reformation teams, and state masking.
- **`packages/game-ai/test/ai.test.ts`**: Legal action validation, card counting, zero hidden info leaks, and deterministic seeded RNG.
- **`apps/server/test/server.test.ts`**: Socket.IO room lifecycle, player joining, turn progression, and private state isolation.
- **`tests/e2e/gameplayScenarios.test.ts`**: Complete simulations for Scenario A (Free-for-all), Scenario B (Bluffing), Scenario C (Local pass-and-play), Scenario D (Online dual-client state), and Scenario E (Reformation faction victory).
