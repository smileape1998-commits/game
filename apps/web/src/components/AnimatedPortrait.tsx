import React, { useEffect, useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion';
import { PortraitMotion } from '../animation/portraitMotion';

/** Only the artwork breathes; labels, card hit areas and hidden cards remain still. */
export const IdlePortrait: React.FC<{
  children: React.ReactNode;
  active: boolean;
  className?: string;
}> = ({ children, active, className = '' }) => (
  <div className={`portrait-idle ${className}`} data-active={active}>
    {children}
  </div>
);

const ENTRANCE = { x: 64, y: 12 };
// Local cut-in waypoints, not board spaces or new logical player positions.
const ARRIVAL_PATH = [{ x: 30, y: 0 }, { x: 0, y: 0 }];

export const WalkingPortrait: React.FC<{
  requestId: string;
  children: React.ReactNode;
  className?: string;
}> = ({ requestId, children, className }) => {
  const reducedMotion = useReducedMotion();
  const controller = useRef(new PortraitMotion(reducedMotion ? ARRIVAL_PATH[1] : ENTRANCE));
  const x = useMotionValue(controller.current.pose.x);
  const y = useMotionValue(controller.current.pose.y);
  const yaw = useMotionValue(0);
  const tilt = useMotionValue(0);
  const scaleY = useMotionValue(1);

  const paint = () => {
    const pose = controller.current.pose;
    x.set(pose.x);
    y.set(pose.y + pose.bob);
    yaw.set(pose.yaw);
    tilt.set(pose.tilt);
    scaleY.set(pose.scaleY);
  };

  useEffect(() => {
    if (reducedMotion) controller.current.reset(ARRIVAL_PATH[1]);
    else controller.current.move(ARRIVAL_PATH);
    paint();
    return () => controller.current.cancel();
  }, [requestId, reducedMotion]);

  useAnimationFrame((_time, delta) => {
    if (reducedMotion) return;
    controller.current.advance(delta / 1000);
    paint();
  });

  return (
    <motion.div
      className={className}
      data-portrait-motion="walking"
      style={{ x, y, rotateY: yaw, rotateZ: tilt, scaleY, transformPerspective: 600, transformOrigin: '50% 90%' }}
    >
      {children}
    </motion.div>
  );
};
