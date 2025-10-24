import Lottie from "lottie-react";
import NotFoundAnim from "../assets/animations/404.json";

export default function NotFound() {
  return (
    <div className="w-full h-full grid place-items-center">
      <Lottie animationData={NotFoundAnim} loop autoplay />
    </div>
  );
}
