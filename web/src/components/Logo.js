import Image from "next/image";

export default function Logo({
  className = "",
  width = 80,
  height = 32,
  variant = "full", // "full" or "icon"
}) {
  if (variant === "full" && width / height !== 2.5) width = height * 2.5;

  if (variant === "icon") {
    return (
      <Image
        src="/images/icons/icon0.svg"
        alt="Templify"
        className={`${className} h-8 w-8`}
        priority
      />
    );
  }

  return (
    <Image
      src="/images/logo.svg"
      alt="Templify"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
