import { useState } from "react";

const useDropdownAnimationMulti = () => {
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [animatingOutId, setAnimatingOutId] = useState<number | null>(null);

  const handleMouseEnter = (id: number) => {
    setHoverId(id);
    setAnimatingOutId(null);
  };

  const handleMouseLeave = (id: number) => {
    setAnimatingOutId(id);

    setTimeout(() => {
      setHoverId((current) => (current === id ? null : current));
      setAnimatingOutId((current) => (current === id ? null : current));
    }, 200);
  };

  const closeDropdown = (id: number) => {
    if (hoverId === id) {
      setHoverId(null);
      setAnimatingOutId(null);
    }
  };

  return {
    hoverId,
    animatingOutId,
    handleMouseEnter,
    handleMouseLeave,
    closeDropdown,
  };
};

export default useDropdownAnimationMulti;
