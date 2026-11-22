import { Suspense, lazy } from "react";

/* three.js আলাদা চাঙ্কে: লজিক পেজের যে অংশে 3D ঘনক লাগে শুধু সেখানেই লোড হয়। */
const BitCubes = lazy(() => import("./BitCubes"));

export default function Bits3D({ bits, height = 128, className = "" }) {
  return (
    <Suspense fallback={<div className={className} style={{ height }} aria-hidden />}>
      <BitCubes bits={bits} height={height} className={className} />
    </Suspense>
  );
}
