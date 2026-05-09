import { Suspense } from "react";

import { InquiryPageContent } from "@/components/inquiry-page-content";
import { LoadingState } from "@/components/loading-state";

export default function InquiryPage() {
  return (
    <Suspense fallback={<LoadingState message="Preparing private inquiry..." />}>
      <InquiryPageContent />
    </Suspense>
  );
}
