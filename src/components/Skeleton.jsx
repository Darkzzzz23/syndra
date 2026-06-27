function Skeleton({ width, height, borderRadius }) {
  return (
    <div
      style={{
        width: width || "100%",
        height: height || "20px",
        borderRadius: borderRadius || "8px",
        background: "rgba(255,255,255,0.04)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export default Skeleton;