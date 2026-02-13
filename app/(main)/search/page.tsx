import { Suspense } from "react";
import { CommonsAppInner } from "@/components/commons-app";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-slate-600">Loading...</div>}>
      <CommonsAppInner initialTab="search" />
    </Suspense>
  );
}
