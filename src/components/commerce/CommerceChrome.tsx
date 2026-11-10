import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { QuerixLogo } from "@/components/QuerixLogo";
export function CommerceHeader({ demo = false }: { demo?: boolean }) {
  return (
    <header className="commerce-header">
      <a href="/" aria-label="Querix home">
        <QuerixLogo size={36} className="h-8 w-auto" />
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
    </header>
  );
}
