import Lottie from "lottie-react";
import NotFoundAnim from "../assets/animations/Coding.json";

export default function NotFound() {
  return (
    <div className="w-full h-[calc(var(--app-height)-64px)] grid place-items-center">
      <Lottie
        animationData={NotFoundAnim}
        loop
        autoplay
        style={{ width: "800px" }}
      />
    </div>
  );
}
