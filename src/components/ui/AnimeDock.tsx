import Image from "next/image";
import animeDock from "../../../assets/anime-dock.png";

export default function AnimeDock() {
  return (
    <div
      className="anime-dock fixed inset-x-0 bottom-0 z-30 flex justify-center px-3"
      aria-hidden="true"
    >
      <Image
        src={animeDock}
        alt=""
        sizes="(max-width: 640px) 86vw, (max-width: 1024px) 62vw, 576px"
        className="select-none drop-shadow-[0_18px_34px_rgba(34,51,38,0.18)]"
      />
    </div>
  );
}
