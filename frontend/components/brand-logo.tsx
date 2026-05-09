export function BrandLogo({
  className = "",
  imageClassName = "",
}: {
  className?: string;
  imageClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center justify-center overflow-hidden ${className}`}>
      <img
        src="/brand/trilogy-garage-logo.png"
        alt="Trilogy Garage"
        className={`h-full w-full object-cover object-center ${imageClassName}`}
      />
    </span>
  );
}
