import Image from "next/image";

export function BrandLogo({
  className = "",
  imageClassName = "",
}: {
  className?: string;
  imageClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center justify-center overflow-hidden ${className}`}>
      <Image
        src="/images/logos/trilogy-garage-logo.webp"
        alt="Trilogy Garage"
        width={1200}
        height={800}
        sizes="160px"
        className={`h-full w-full object-cover object-center ${imageClassName}`}
      />
    </span>
  );
}
