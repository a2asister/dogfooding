import gsap from 'gsap';
import { Point } from '../types';

export function animatePointMovement(
  element: HTMLElement,
  targetX: number,
  targetY: number,
  duration: number = 0.3
): gsap.core.Tween {
  return gsap.to(element, {
    x: targetX,
    y: targetY,
    duration,
    ease: 'power2.out',
  });
}

export function animatePathMorph(
  svgPath: SVGPathElement,
  newPathData: string,
  duration: number = 0.5
): gsap.core.Tween {
  return gsap.to(svgPath, {
    attr: { d: newPathData },
    duration,
    ease: 'power2.inOut',
  });
}

export function animatePointEntry(
  elements: HTMLElement[],
  stagger: number = 0.1
): gsap.core.Timeline {
  const tl = gsap.timeline();
  
  elements.forEach((el, i) => {
    tl.fromTo(
      el,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3 },
      i * stagger
    );
  });

  return tl;
}

export function animatePointExit(
  elements: HTMLElement[],
  stagger: number = 0.1
): gsap.core.Timeline {
  const tl = gsap.timeline();
  
  elements.forEach((el, i) => {
    tl.to(
      el,
      { scale: 0, opacity: 0, duration: 0.3 },
      i * stagger
    );
  });

  return tl;
}

export function animateFlowEffect(
  svgPath: SVGPathElement,
  speed: number = 1
): gsap.core.Tween {
  const length = svgPath.getTotalLength();
  return gsap.fromTo(
    svgPath,
    { strokeDashoffset: length },
    {
      strokeDashoffset: 0,
      duration: length / (100 * speed),
      ease: 'none',
      repeat: -1,
    }
  );
}

export function applyMagneticSnap(
  point: Point,
  snapPoint: Point,
  element: HTMLElement
): void {
  gsap.to(element, {
    x: snapPoint.x,
    y: snapPoint.y,
    duration: 0.15,
    ease: 'back.out(1.7)',
  });
}