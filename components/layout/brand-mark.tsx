import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/darman-logo.png"
      alt=""
      width={48}
      height={48}
      priority={priority}
      className={cn("size-10 shrink-0 object-contain", className)}
    />
  );
}
