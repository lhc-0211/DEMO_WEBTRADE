import { useState } from "react";

const useDropdownAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsAnimatingOut(false);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsHovered(false);
      setIsAnimatingOut(false);
    }, 200);
  };

  return {
    isHovered, //Check hover
    isAnimatingOut, //Check animation khi un hover
    handleMouseEnter, //Handle hover mouse
    handleMouseLeave, //Handle un hover moust
    setIsHovered, //Đóng dropdown
  };
};

export default useDropdownAnimation;
