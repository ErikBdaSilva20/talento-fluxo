export function Skeleton({ width, height = 16, radius = 6 }: { width?: number | string; height?: number; radius?: number }) {
  return <span className="tm-skeleton" style={{ display: "block", width: width ?? "100%", height, borderRadius: radius }} />;
}
