/** Presentation coordinates only. Never writes to the game engine or player state. */
export interface PortraitPoint { x: number; y: number }
export interface PortraitPose extends PortraitPoint {
  yaw: number;
  tilt: number;
  bob: number;
  scaleY: number;
}
type Phase = 'idle' | 'walking' | 'settling';
const finitePoint = (point: PortraitPoint) => Number.isFinite(point.x) && Number.isFinite(point.y);
const ease = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const resting = ({ x, y }: PortraitPoint): PortraitPose => ({ x, y, yaw: 0, tilt: 0, bob: 0, scaleY: 1 });

/** One path per portrait; retargeting always starts at the currently displayed pose. */
export class PortraitMotion {
  pose: PortraitPose;
  phase: Phase = 'idle';
  private path: PortraitPoint[] = [];
  private start: PortraitPose;
  private elapsed = 0;
  private duration = 0;

  constructor(origin: PortraitPoint = { x: 0, y: 0 }) {
    this.pose = resting(finitePoint(origin) ? origin : { x: 0, y: 0 });
    this.start = { ...this.pose };
  }

  /** Invalid requests leave the valid in-flight path intact. Empty paths cancel. */
  move(points: readonly PortraitPoint[]): boolean {
    if (!points.every(finitePoint)) return false;
    this.path = points.map(point => ({ ...point }));
    this.beginSegment();
    return true;
  }

  cancel(): void {
    this.path = [];
    this.beginSegment();
  }

  /** Accessibility/state reset, not normal travel. */
  reset(point: PortraitPoint): void {
    if (!finitePoint(point)) return;
    this.path = [];
    this.pose = resting(point);
    this.start = { ...this.pose };
    this.phase = 'idle';
    this.elapsed = 0;
  }

  private beginSegment(): void {
    while (this.path.length && Math.hypot(this.path[0].x - this.pose.x, this.path[0].y - this.pose.y) < 0.001) {
      this.path.shift();
    }
    this.start = { ...this.pose };
    this.elapsed = 0;
    this.phase = this.path.length ? 'walking' : 'settling';
    this.duration = this.path.length
      ? Math.max(0.12, Math.hypot(this.path[0].x - this.pose.x, this.path[0].y - this.pose.y) / 200)
      : 0.22;
  }

  /** Seconds, not frames. Carries excess time through every intermediate waypoint. */
  advance(deltaSeconds: number): PortraitPose {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return this.pose;
    let remaining = deltaSeconds;
    while (remaining > 0) {
      if (this.phase === 'idle') {
        this.elapsed = (this.elapsed + remaining) % 2.8;
        const breath = Math.sin(this.elapsed / 2.8 * Math.PI) ** 2;
        this.pose = { ...this.pose, bob: -0.9 * breath, scaleY: 1 + 0.009 * breath };
        break;
      }
      const step = Math.min(remaining, this.duration - this.elapsed);
      this.elapsed += step;
      remaining -= step;
      const t = Math.min(1, this.elapsed / this.duration);
      const progress = ease(t);
      if (this.phase === 'walking') {
        const end = this.path[0];
        const dx = end.x - this.start.x;
        const dy = end.y - this.start.y;
        const length = Math.hypot(dx, dy);
        const turn = ease(Math.min(1, this.elapsed / 0.12));
        this.pose = {
          x: mix(this.start.x, end.x, progress),
          y: mix(this.start.y, end.y, progress),
          yaw: mix(this.start.yaw, dx / length * 18, turn),
          tilt: mix(this.start.tilt, (dx + dy) / length * 3, turn),
          bob: this.start.bob * (1 - progress) - Math.sin(t * Math.PI) * Math.abs(Math.sin(this.elapsed * Math.PI * 7)) * 3,
          scaleY: mix(this.start.scaleY, 1, progress)
        };
      } else {
        this.pose = {
          ...this.start,
          yaw: mix(this.start.yaw, 0, progress),
          tilt: mix(this.start.tilt, 0, progress),
          bob: mix(this.start.bob, 0, progress) + Math.sin(t * Math.PI) * (1 - t) * 1.5,
          scaleY: mix(this.start.scaleY, 1, progress) - Math.sin(t * Math.PI) * 0.025
        };
      }
      if (t === 1) {
        if (this.phase === 'walking') {
          this.path.shift();
          this.beginSegment();
        } else {
          this.pose = resting(this.pose);
          this.phase = 'idle';
          this.elapsed = 0;
        }
      }
    }
    return this.pose;
  }
}
