import Link from "next/link";
import type { ReactNode } from "react";

/** Page chrome: grey chapter label top-left, brand + step top-right. */
export function Frame({ chapter, step, children }: { chapter: string; step: string; children: ReactNode }) {
  return (
    <main className="frame">
      <div className="top">
        <span>// {chapter}</span>
        <span className="brand">
          <Link href="/" style={{ textDecoration: "none" }}>FINALSTUDIO</Link> · {step}
        </span>
      </div>
      {children}
    </main>
  );
}
