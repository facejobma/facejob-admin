import Image from "next/image";

export function Logo() {
  return (
    <Image src={"/facejobLogo.png"} width={126} height={62} alt={"face job logo"} />
  );
}