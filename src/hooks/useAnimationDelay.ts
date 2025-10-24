import { useState } from "react";

export const useAnimationDelay = (animationDuration = 200) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const open = () => {
    setIsVisible(true);
    setIsAnimating(true);
  };

  const close = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, animationDuration);
  };

  const toggle = () => {
    if (isVisible) {
      close();
    } else {
      open();
    }
  };

  return {
    isVisible, //Hiện component
    isAnimating, //Đang hành động
    open, //Hành động hiện component
    close, //Hành động đóng component
    toggle, //Hành động chuyển component
    animationDuration, //Time chuyểns
  };
};
