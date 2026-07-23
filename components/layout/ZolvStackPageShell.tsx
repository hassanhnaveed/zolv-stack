"use client";

import { ZolvStackFooter } from "@/components/layout/ZolvStackFooter";
import { ZolvStackNavbar } from "@/components/layout/ZolvStackNavbar";

type ZolvStackPageShellProps = {
  children: React.ReactNode;
  mainPaddingTop?: number;
};

export function ZolvStackPageShell({
  children,
  mainPaddingTop = 60,
}: ZolvStackPageShellProps) {
  return (
    <>
      <ZolvStackNavbar />
      <main style={{ paddingTop: mainPaddingTop }}>{children}</main>
      <ZolvStackFooter />
    </>
  );
}
