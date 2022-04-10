import React, { SFC, useRef, createContext, useMemo } from "react";

import { DialogOverlay, DialogContent } from "@reach/dialog";
import { useTransition, animated, config, useSpring } from "react-spring";

import { useHeight } from "../util/animationHelpers";

export const StandardModalHeader: SFC<{ onHide: any; caption: any }> = props => {
  let { onHide, caption } = props;
  return (
    <>
      <div className="standard-reach-header">
        <h4 className="modal-title">{caption}</h4>
        <a style={{ marginLeft: "auto" }} className="close" onClick={onHide}>
          <span>&times;</span>
        </a>
      </div>
      <hr />
    </>
  );
};

const AnimatedDialogOverlay = animated(DialogOverlay);
const AnimatedDialogContent = animated(DialogContent);

export const ModalSizingContext = createContext(null);

type ModalTypes = { isOpen: boolean; style?: any; onHide: any; headerCaption?: any; className?: string; focusRef?: any };
const Modal: SFC<ModalTypes> = props => {
  let { isOpen, onHide, headerCaption, focusRef = null, style = { maxWidth: "600px" }, children } = props;

  const modalTransition = useTransition(!!isOpen, {
    config: isOpen ? { ...config.stiff } : { duration: 150 },
    from: { opacity: 0, transform: `translate3d(0px, -10px, 0px)` },
    enter: { opacity: 1, transform: `translate3d(0px, 0px, 0px)` },
    leave: { opacity: 0, transform: `translate3d(0px, 10px, 0px)` }
  });

  const animatModalSizing = useRef(true);
  const modalSizingPacket = useMemo(() => {
    return {
      disable() {
        animatModalSizing.current = false;
      },
      enable() {
        animatModalSizing.current = true;
      }
    };
  }, []);

  return (
    <ModalSizingContext.Provider value={modalSizingPacket}>
      {modalTransition(
        (styles, isOpen) =>
          isOpen && (
            <AnimatedDialogOverlay
              allowPinchZoom={true}
              initialFocusRef={focusRef}
              onDismiss={onHide}
              isOpen={isOpen}
              style={{ opacity: styles.opacity }}
            >
              <AnimatedDialogContent
                style={{
                  transform: styles.transform,
                  border: "4px solid hsla(0, 0%, 0%, 0.5)",
                  borderRadius: 10,
                  ...style
                }}
              >
                <ModalContents content={children} {...{ animatModalSizing, headerCaption, onHide }} />
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </ModalSizingContext.Provider>
  );
};

const ModalContents = ({ animatModalSizing, headerCaption, content, onHide }) => {
  const uiReady = useRef(false);
  const [sizingRef, contentHeight] = useHeight();

  const heightStyles =
    useSpring({
      immediate: !uiReady.current || !animatModalSizing.current,
      config: { ...config.stiff },
      to: { height: contentHeight },
      onRest: () => (uiReady.current = true)
    }) || {};

  return (
    <animated.div style={{ overflow: "hidden", ...heightStyles }}>
      <div style={{ padding: "10px" }} ref={sizingRef}>
        {headerCaption ? <StandardModalHeader caption={headerCaption} onHide={onHide} /> : null}
        {content}
      </div>
    </animated.div>
  );
};

export default Modal;
