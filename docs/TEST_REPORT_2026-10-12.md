# รายงานทดสอบ Hamster Coup: Golden Acorns

วันที่ทดสอบ: 12 ตุลาคม 2026 (Asia/Bangkok)

## สรุปผล

ชุดทดสอบเดิมผ่านครบ 27 เทส และ production build สำเร็จ แต่พบข้อผิดพลาดที่ชุดทดสอบเดิมยังไม่ครอบคลุม โดยเฉพาะเกมค้างระหว่างการตอบโต้และการตรวจสอบผู้เล่นที่มีสิทธิ์ดำเนินการ จึงยังสรุปไม่ได้ว่าทุกโหมดพร้อมใช้งานจริง

ทดสอบจาก working tree ปัจจุบัน ไม่มีการแก้ไข application source การเปลี่ยนแปลงที่ส่งมอบคือรายงานนี้

## ผลตรวจพื้นฐาน

| รายการ | ผล | รายละเอียด |
| --- | --- | --- |
| Runtime | ตรวจแล้ว | Node.js v24.15.0, npm 11.12.1 |
| `npm test` | ผ่าน | 4 test files, 27 tests |
| Game engine tests | ผ่าน | 16 tests |
| AI tests | ผ่าน | 4 tests |
| Server integration test | ผ่าน | 1 test: สร้างห้อง, เข้าห้อง, ready, เริ่มเกม และแยกไพ่ของแต่ละ client |
| Gameplay scenario tests | ผ่าน | 6 tests ที่เรียก engine โดยตรง |
| `npm run build` | ผ่านพร้อมคำเตือน | TypeScript checks และ Vite build สำเร็จ; 2,023 modules transformed |
| ขนาดไฟล์ JavaScript หลัก | คำเตือน | 614.09 kB ก่อน gzip, 169.10 kB หลัง gzip; เกินเกณฑ์เตือน 500 kB ของ Vite |
| `npm start` | ผ่าน | เซิร์ฟเวอร์เริ่มทำงานที่ port 3001 |
| `GET /health` | ผ่าน | HTTP 200, `status: "ok"` |
| คลิกทดสอบใน browser | ยังไม่ได้ยืนยัน | เครื่องมือ browser ปฏิเสธสิทธิ์เข้า localhost |

การรัน test/build ใน sandbox ครั้งแรกติด `EPERM` จากการอ่านไฟล์ ส่วนการเรียก localhost ถูกจำกัดสิทธิ์ socket เมื่อรันซ้ำนอก sandbox แล้ว test/build และ health check ผ่าน จึงไม่นับความล้มเหลวครั้งแรกเป็นบั๊กของโปรเจกต์

## ข้อผิดพลาดที่ยืนยันด้วย diagnostic tests

Diagnostic tests เป็นการทดสอบชั่วคราวเพื่อยืนยันพฤติกรรมที่ผิด ไม่ใช่ส่วนหนึ่งของผล 27/27 ข้างต้น หลังตรวจแล้วนำไฟล์ชั่วคราวออก

### P1 — เกมค้างเมื่อเป้าหมายลอบสังหารตายจากการท้าทาย

ตำแหน่ง: `packages/game-engine/src/engine.ts:758`, `packages/game-engine/src/engine.ts:455`, `apps/server/src/roomManager.ts:466`

วิธีทำซ้ำ:

1. มีผู้เล่น 3 คน; p1 ถือ Assassin และมี 3 ลูกโอ๊ก; p2 เหลือไพ่ที่ยังไม่เปิด 1 ใบ
2. p1 เลือกลอบสังหาร p2
3. p2 ท้าทาย; p1 พิสูจน์ว่ามี Assassin จริง
4. p2 เสียไพ่ใบสุดท้ายและถูกกำจัด

ผลที่พบ: เกมเข้า `BLOCK_WINDOW` และรอ p2 ทั้งที่ p2 ถูกกำจัดแล้ว

```json
{"phase":"BLOCK_WINDOW","alive":false,"eligible":["p2"],"turn":"p1"}
```

การให้ p2 ตอบ pass ถูกปฏิเสธด้วย `Invalid or eliminated responder` และ AI scheduler ไม่ประมวลผลผู้เล่นที่ถูกกำจัด ทำให้ไม่มีผู้ตอบที่สามารถเดินเกมต่อได้

ผลที่ควรได้: จบแอ็กชันที่เป้าหมายถูกกำจัดแล้ว และเดินไปยังตาถัดไปหรือจบเกม

### P1 — การเสียอิทธิพลไม่ตรวจว่าผู้ส่งเป็นผู้เล่นที่ต้องเสียไพ่

ตำแหน่ง: `packages/game-engine/src/engine.ts:691`, `apps/server/src/roomManager.ts:361`

วิธีทำซ้ำ: p1 รัฐประหาร p2 ระหว่างที่เกมรอ p2 เลือกไพ่ ให้ p3 เรียก `resolveInfluenceLoss` ด้วยไพ่ของ p3

ผลที่พบ: engine ยอมให้ p3 เสียไพ่แทน และเดินตาถัดไป ทั้งที่ p2 ยังเหลือไพ่ครบ

```json
{"phase":"ACTION_SELECTION","p2Influence":2,"p3Influence":1}
```

ผลที่ควรได้: ปฏิเสธคำขอเมื่อ phase ไม่ถูกต้อง หรือ playerId ไม่ตรงกับ `pendingInfluenceLoss.playerId` เซิร์ฟเวอร์เรียกฟังก์ชันนี้โดยตรง จึงควรมี regression test ทั้งระดับ engine และ Socket.IO

### P2 — แอ็กชันตัวละครยอมรับคำอ้างบทบาทที่ขาดหรือไม่ตรง

ตำแหน่ง: `packages/game-engine/src/engine.ts:366`, `packages/game-engine/src/engine.ts:391`

วิธีทำซ้ำ: เรียก `applyAction(state, { type: 'tax', actorId: 'p1' })` โดยไม่ส่ง `claimedRole`

ผลที่พบ: เข้าช่วงท้าทาย แต่การท้าทายเกิด error `No valid action claim to challenge` หากผู้เล่นอื่น pass ทั้งหมด p1 ได้รับ 3 ลูกโอ๊กตามปกติ

```json
{"phase":"ACTION_SELECTION","acorns":5}
```

ผลที่ควรได้: ตรวจความสอดคล้องของแอ็กชันกับบทบาท หรือกำหนดบทบาทที่ถูกต้องจากชนิดแอ็กชันก่อนเปิดช่วงท้าทาย

### P2 — ผู้เล่นนอกเป้าหมายบล็อกแอ็กชันที่ไม่ได้มุ่งมาที่ตนได้

ตำแหน่ง: `packages/game-engine/src/engine.ts:475`, `apps/server/src/roomManager.ts:348`

วิธีทำซ้ำ: p1 ขโมยจาก p2 เมื่อผ่านช่วงท้าทายแล้ว engine ระบุ eligible responders เป็น `["p2"]` แต่ให้ p3 ส่ง block

ผลที่พบ: engine รับ block ของ p3 และเปลี่ยนไปเป็น `BLOCK_CHALLENGE_WINDOW`

```json
{"phase":"BLOCK_CHALLENGE_WINDOW","blocker":"p3"}
```

ผลที่ควรได้: ตรวจว่าผู้ตอบอยู่ใน `getEligibleResponders(state)` ของ phase ปัจจุบันก่อนรับคำตอบ

## ขอบเขตและข้อจำกัด

- ชุดที่อยู่ใน `tests/e2e/` เรียก engine โดยตรง ไม่ได้เปิด browser หรือคลิก UI จริง จึงไม่ยืนยันการส่งต่ออุปกรณ์ การแสดง modal หรือความต่อเนื่องของทุก flow
- Server integration test เดิมสร้าง test server ของตนเองและครอบคลุม lobby/start/private cards ยังไม่ครอบคลุมการเล่นครบเกม การหลุดและต่อใหม่ และทุก event handler ใน `apps/server/src/index.ts`
- ยังไม่ได้ทดสอบ responsive layout, browser หลายชนิด, เสียง, Docker/Linux deployment, concurrency/load หรือ production hosting
- ไม่พบ hidden-card leak ใน serializer จากการตรวจและเทสที่ทำ แต่ผลนี้ไม่ใช่การรับรองความปลอดภัยทั้งระบบ
- README ระบุ 19 tests แต่จำนวนที่รันจริงปัจจุบันคือ 27 tests

ควรแก้กรณี P1 ก่อน และเพิ่ม regression tests ที่ตรวจผลที่ถูกต้องของแต่ละกรณี เพื่อป้องกันชุดทดสอบผ่านทั้งที่เกมยังค้างหรือรับคำสั่งจากผู้เล่นผิดคน
