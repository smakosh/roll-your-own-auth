"use client";

import Link from "next/link";

const Links = () => (
  <>
    <Link href="/signup" className="mr-4 underline text-blue-500">
      Signup
    </Link>
    <Link href="/login" className="mr-4 underline text-blue-500">
      Login
    </Link>
    <Link href="/dashboard" className="underline text-blue-500">
      Protected Dashboard
    </Link>
  </>
);

export default Links;
