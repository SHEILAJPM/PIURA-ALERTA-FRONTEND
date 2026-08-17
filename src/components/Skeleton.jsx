import React from "react";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ backgroundColor: "var(--color-surface-alt)" }}
    />
  );
}

export default Skeleton;
