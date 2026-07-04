import { useEffect, useRef, useCallback } from 'react';

/*
  Tunnel ring effect — single indigo dash ring with warp-speed animation.
  Mouse interaction: closer to the center → slower speed.
*/

const TUNNEL_RINGS = [
  { r: 170, dash: [25, 40], speed: 1.8,   color: 'rgb(129 140 248)', opacity: 0.65, viewBox: 360, width: 0.5 }, // indigo-400
];

// Perspective depth for each ring transform
const RING_TRANSFORMS = [
  'rotateX(68deg) rotateZ(30deg)',
];

const styles = `
.warp-tunnel {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  perspective: 1200px;
}
.tunnel-ring {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
`;

export default function CometHero() {
  const ringRefs = useRef([]);

  const animate = useCallback(() => {
    const speedFactor = window.__tunnelSpeedFactor ?? 0.3;

    // Animate dash offsets for the ring
    ringRefs.current.forEach((entry, i) => {
      if (!entry || !entry.el) return;
      const cfg = TUNNEL_RINGS[i];
      const totalDash = cfg.dash[0] + cfg.dash[1];
      const step = cfg.speed * speedFactor;
      entry.offset = (entry.offset + step) % totalDash;
      entry.el.setAttribute('stroke-dashoffset', entry.offset);
    });

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      // Closer to center → slower (down to near stop)
      // At edge → full speed
      const raw = dist / maxDist;
      const eased = raw * raw * 0.3;
      window.__tunnelSpeedFactor = eased; // 0 at center, 0.3 at edge
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.__tunnelSpeedFactor = 0.3; // no mouse: edge speed

    const frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      delete window.__tunnelSpeedFactor;
    };
  }, [animate]);

  const renderRing = (ring, i) => {
    const vb = ring.viewBox;
    const cx = vb / 2;

    return (
      <div
        key={i}
        className="tunnel-ring"
        style={{ transform: RING_TRANSFORMS[i] }}
      >
        <svg
          viewBox={`0 0 ${vb} ${vb}`}
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
        >
          <circle
            ref={(el) => {
              ringRefs.current[i] = { el, offset: 0 };
            }}
            cx={cx}
            cy={cx}
            r={ring.r}
            fill="none"
            stroke={ring.color}
            strokeOpacity={ring.opacity}
            strokeWidth={ring.width ?? 0.8}
            strokeDasharray={`${ring.dash[0]} ${ring.dash[1]}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="warp-tunnel">
        {TUNNEL_RINGS.map((ring, i) => renderRing(ring, i))}
      </div>
    </>
  );
}
