import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/marketing/Brand";
import type { ReactNode } from "react";
export function CommerceHeader({ demo = false, account }: { demo?: boolean; account?: ReactNode }) {
  return (
    <header className="commerce-header">
      <a href="/" aria-label="Querix home">
        <Brand light />
      </a>
      <span className="commerce-header-divider" />
      <a className="commerce-header-label" href="/use-cases/conversational-commerce">
        Interactive commerce
      </a>
      <a
        className="commerce-header-link"
        href={demo ? "/use-cases/conversational-commerce" : "/demo/commerce"}
      >
        {demo ? (
          <>
            <ArrowLeft size={14} /> About this demo
          </>
        ) : (
          <>
            Try the demo <ArrowUpRight size={15} />
          </>
        )}
      </a>
      {account && (
        <details
          className="commerce-account-menu"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}
        >
          <summary>Account</summary>
          <div>{account}</div>
        </details>
      )}
    </header>
  );
}
