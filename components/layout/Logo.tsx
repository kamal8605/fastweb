import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 72 }: LogoProps) {
  return (
    <Link href="/" className="shrink-0 no-underline" aria-label="Central Smoke Distro home">
      <Image
        src="/central-smoke-distro-logo.gif"
        alt="Central Smoke Distro"
        width={size}
        height={size}
        className="block object-contain"
        unoptimized
        priority
      />
    </Link>
  );
}
