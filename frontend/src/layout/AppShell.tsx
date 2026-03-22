import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell() {
  return (
    <div className="min-h-dvh bg-[var(--sbpa-bg)]">
      <div className="mx-auto grid min-h-dvh max-w-[1400px] grid-cols-[260px_1fr] gap-6 px-4 py-5 print:block print:max-w-none print:p-0">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <div className="flex min-w-0 flex-col gap-4 print:gap-0">
          <div className="print:hidden">
            <Topbar />
          </div>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

