import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/marketing/Brand";
export function CommerceHeader({ demo = false }: { demo?: boolean }) {
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
    </header>
  );
}
