"use client";

import { usePathname } from "next/navigation";

export default function Home() {
  const pathname = usePathname();

  console.log(pathname.length);

  return <div>{pathname}</div>;
}
