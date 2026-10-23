import Image from 'next/image';

// Owner-supplied leaves, resized to a small WebP while preserving transparency and original colors.
export function CornerLeaves() {
  return (
    <Image
      className="corner-leaves"
      aria-hidden="true"
      src="/brand/corner-leaves.webp"
      width={288}
      height={367}
      alt=""
      loading="eager"
      draggable={false}
      unoptimized
    />
  );
}
