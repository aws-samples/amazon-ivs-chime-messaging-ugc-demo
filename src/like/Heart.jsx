import React, { useEffect, useRef, useState } from 'react';

const Heart = (props) => {
    const { color, removeHeart } = props;

    const [done, setDone] = useState(false);

    const animationReqId = useRef();
    const innerRef = useRef(null);
    const outerRef = useRef(null);

    useEffect(() => {
      let x = parseFloat(12);
      let y = parseFloat(12);

      let phase = Math.random() * 360;
      let radius = Math.random() * 1;
      let speed = 1 + Math.random() * 2;
      let scale = 0.2 + Math.random() * 0.8;
      let grow = 0.01;
      let alpha = 1;

      const draw = () => {
        outerRef.current.style.transform = `translateX(${x}px) translateY(${y}px) translateZ(0) scale(${grow})`;
        outerRef.current.style.opacity = alpha;
      };

      const update = () => {
        if (alpha > 0) {
          alpha -= 0.009;
        }

        if (alpha < 0) {
          alpha = 0;
        }

        x += Math.cos(phase / 20) * radius;
        y -= speed;

        grow += (scale - grow) / 10;
        phase += 1;

        const isDone = y < -500 || alpha <= 0;

        setDone(isDone);
      };

      const loop = () => {
        animationReqId.current = requestAnimationFrame(loop);

        update();
        draw();
      };

      loop();

      return () => {
        if (animationReqId.current) {
          cancelAnimationFrame(animationReqId.current);
        }
      };
    }, []);

    useEffect(() => {
      if (!done) return;

      if (animationReqId.current) {
        cancelAnimationFrame(animationReqId.current);
      }

      removeHeart();
    }, [done, removeHeart]);

    return (
      <div className="heart-outer" ref={outerRef}>
        <div
          className="heart-inner"
          ref={innerRef}
          style={{ backgroundColor: color }}
        ></div>
      </div>
    );
  };

  export default Heart;