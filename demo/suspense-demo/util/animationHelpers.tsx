import React, { createElement } from "react";
import { useRef, useEffect, useState, useLayoutEffect } from "react";

import { useSpring, config, animated } from "react-spring";

declare var ResizeObserver;

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => void (ref.current = value), [value]);
  return ref.current;
}

export function useHeight({ on = true /* no value means on */ } = {} as any) {
  const ref = useRef<any>();
  const [height, set] = useState(0);
  const heightRef = useRef(height);
  const [ro] = useState(
    () =>
      new ResizeObserver(packet => {
        if (ref.current && heightRef.current != ref.current.offsetHeight) {
          heightRef.current = ref.current.offsetHeight;
          set(ref.current.offsetHeight);
        }
      })
  );
  useLayoutEffect(() => {
    if (on && ref.current) {
      set(ref.current.offsetHeight);
      ro.observe(ref.current, {});
    }
    return () => ro.disconnect();
  }, [on, ref.current]);

  return [ref, height as any];
}

export const SlideInContents = ({
  in: inProp = void 0,
  immediateChanges = null,
  opacity = false,
  clamp = null,
  component = "div",
  style = {} as any,
  children,
  ...rest
}) => {
  const [ref, currentHeight] = useHeight({ inProp });
  const initialHeight = useRef(inProp ? "auto" : 0);
  const initialOpacity = useRef(inProp ? 1 : 0);
  const snapIntoPlace = useRef(false);

  const additionalFrom = {} as any;
  const additionalTo = {} as any;

  if (opacity) {
    additionalFrom.opacity = initialOpacity.current;
    additionalTo.opacity = inProp ? 1 : 0;
  }

  const animatingStyles =
    useSpring({
      config: { ...config.stiff, clamp: clamp != null ? clamp : !inProp },
      immediate: snapIntoPlace.current,
      from: { height: initialHeight, ...additionalFrom },
      to: { height: inProp ? currentHeight : 0, ...additionalTo },
      onRest: () => {
        snapIntoPlace.current = inProp && immediateChanges;
      }
    }) || {};

  const componentType = animated[component];
  return createElement(componentType, { style: { overflow: "hidden", ...style, ...animatingStyles }, ...rest }, <div ref={ref}>{children}</div>);
};
