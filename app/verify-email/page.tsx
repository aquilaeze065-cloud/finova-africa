"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div>
      <h1>Verify Email</h1>
      {token ? (
        <p>Verifying with token: {token}</p>
      ) : (
        <p>No verification token found.</p>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
