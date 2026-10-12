import { describe, expect, it } from 'vitest';
import { PortraitMotion } from '../src/animation/portraitMotion';

describe('presentation-only portrait movement', () => {
  it('visits consecutive waypoints in order and stops exactly at the destination', () => {
    const motion = new PortraitMotion();
    motion.move([{ x: 100, y: 0 }, { x: 100, y: 100 }, { x: -100, y: 100 }]);
    motion.advance(0.25);
    expect(motion.pose.x).toBeCloseTo(50);
    expect(motion.pose.y).toBe(0);
    motion.advance(0.25);
    expect(motion.pose).toMatchObject({ x: 100, y: 0 });
    motion.advance(0.25);
    expect(motion.pose.x).toBe(100);
    expect(motion.pose.y).toBeCloseTo(50);
    motion.advance(1.25);
    expect(motion.pose).toMatchObject({ x: -100, y: 100 });
    expect(motion.phase).toBe('settling');
    motion.advance(0.22);
    expect(motion.phase).toBe('idle');
    expect(motion.pose).toMatchObject({ x: -100, y: 100, yaw: 0, tilt: 0, scaleY: 1 });
  });

  it('gives the same pose at 30, 60 and 144 fps, including a multi-segment frame', () => {
    const poses = [30, 60, 144].map(fps => {
      const motion = new PortraitMotion();
      motion.move([{ x: 60, y: -30 }, { x: -40, y: 50 }]);
      for (let frame = 0; frame < fps; frame++) motion.advance(1 / fps);
      return motion.pose;
    });
    const singleFrame = new PortraitMotion();
    singleFrame.move([{ x: 60, y: -30 }, { x: -40, y: 50 }]);
    singleFrame.advance(1);
    for (const pose of poses) {
      for (const key of Object.keys(pose) as Array<keyof typeof pose>) {
        expect(pose[key]).toBeCloseTo(singleFrame.pose[key], 8);
      }
    }
  });

  it.each([
    [100, 0, 'yaw', 1], [-100, 0, 'yaw', -1],
    [0, 100, 'tilt', 1], [0, -100, 'tilt', -1]
  ] as const)('turns gradually toward (%s, %s)', (x, y, axis, sign) => {
    const motion = new PortraitMotion();
    motion.move([{ x, y }]);
    expect(motion.pose[axis]).toBe(0);
    motion.advance(0.03);
    const early = motion.pose[axis];
    motion.advance(0.09);
    expect(Math.sign(early)).toBe(sign);
    expect(Math.abs(motion.pose[axis])).toBeGreaterThan(Math.abs(early));
  });

  it('retargets rapid requests from the visible pose without concurrent paths or teleporting', () => {
    const motion = new PortraitMotion();
    motion.move([{ x: 200, y: 0 }]);
    motion.advance(0.25);
    for (let i = 0; i < 20; i++) {
      const before = { ...motion.pose };
      motion.move([{ x: i % 2 ? -80 : 80, y: i }]);
      expect(motion.pose).toEqual(before);
      motion.advance(0.01);
    }
    motion.advance(10);
    expect(motion.pose).toMatchObject({ x: -80, y: 19 });
    expect(motion.phase).toBe('idle');
  });

  it('ignores an invalid destination or delta without corrupting the valid path', () => {
    const motion = new PortraitMotion();
    motion.move([{ x: 50, y: 20 }]);
    motion.advance(0.05);
    const before = { ...motion.pose };
    expect(motion.move([{ x: 0, y: Infinity }])).toBe(false);
    expect(motion.move([{ x: NaN, y: 0 }])).toBe(false);
    for (const delta of [NaN, Infinity, -1, 0]) motion.advance(delta);
    expect(motion.pose).toEqual(before);
    motion.advance(5);
    expect(motion.pose).toMatchObject({ x: 50, y: 20 });
  });

  it('cancels at the current position, settles and resumes idle without drifting', () => {
    const motion = new PortraitMotion();
    motion.move([{ x: 100, y: 0 }]);
    motion.advance(0.18);
    const before = { ...motion.pose };
    motion.cancel();
    expect(motion.pose).toEqual(before);
    motion.advance(0.22);
    expect(motion.phase).toBe('idle');
    motion.advance(1.4);
    expect(motion.pose.x).toBe(before.x);
    expect(motion.pose.y).toBe(before.y);
    expect(motion.pose.yaw).toBe(0);
    expect(motion.pose.bob).toBeCloseTo(-0.9);
    motion.advance(1.4);
    expect(motion.pose.bob).toBeCloseTo(0);
  });

  it('supports duplicate points, distance-based timing and reduced-motion reset', () => {
    const short = new PortraitMotion();
    const long = new PortraitMotion();
    short.move([{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 0 }]);
    long.move([{ x: 400, y: 0 }]);
    short.advance(0.5);
    long.advance(0.5);
    expect(short.phase).toBe('idle');
    expect(long.phase).toBe('walking');
    long.reset({ x: 0, y: 0 });
    long.advance(10);
    expect(long.pose).toMatchObject({ x: 0, y: 0, yaw: 0, tilt: 0 });
    expect(long.phase).toBe('idle');
  });
});
