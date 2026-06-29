import Image from "next/image";
import footerPeekers from "../../../assets/footer-peekers.png";

export default function FooterPeekers() {
  return (
    <div
      data-footer-peekers-docked
      className="footer-peekers footer-peekers--docked pointer-events-none absolute inset-x-0 top-0 z-[2] flex justify-center"
      aria-hidden="true"
    >
      <div className="footer-peekers-image relative z-[1] w-[min(48rem,74vw)] drop-shadow-[0_16px_24px_rgba(34,51,38,0.12)] max-[1023px]:w-[min(44rem,86vw)] max-[640px]:w-[104vw]">
        <Image
          src={footerPeekers}
          alt=""
          sizes="(max-width: 640px) 94vw, (max-width: 1024px) 78vw, 760px"
          className="block h-auto w-full select-none"
        />
      </div>
    </div>
  );
}
