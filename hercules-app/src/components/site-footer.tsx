import Link from "next/link";
import { Linkedin } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { footerNav, site } from "@/data/site";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="text-[15px] font-semibold tracking-tight">{site.name}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{site.footerTagline}</p>
          </div>

          {footerNav.map((group) => (
            <div key={group.heading}>
              <h3 className="text-[13px] font-semibold text-foreground">{group.heading}</h3>
              <ul className="mt-3.5 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-[13px] text-muted-foreground">
            © {site.year} {site.legalName} All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="mr-2 text-[13px] text-muted-foreground">Connect</span>
            <a
              href="https://x.com/usehercules"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Hercules on X"
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </a>
            <a
              href="https://www.linkedin.com/company/usehercules"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Hercules on LinkedIn"
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Linkedin className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
