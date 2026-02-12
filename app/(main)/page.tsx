import { Suspense } from "react";
import CommonsApp from "@/components/commons-app";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-slate-600">Loading...</div>}>
      <CommonsApp />
    </Suspense>
  );
}
