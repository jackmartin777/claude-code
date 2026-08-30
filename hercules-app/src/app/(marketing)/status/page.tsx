import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/content/page-header";
import { Section, SectionHeading } from "@/components/content/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Status",
  description: "Live availability for the Hercules builder, hosting, database, auth and AI services.",
};

const services = [
  { name: "Builder", uptime: 99.99 },
  { name: "App hosting", uptime: 100 },
  { name: "Database", uptime: 99.98 },
  { name: "Authentication", uptime: 100 },
  { name: "AI Gateway", uptime: 99.96 },
  { name: "Email delivery", uptime: 99.99 },
  { name: "File storage", uptime: 100 },
  { name: "Custom domains", uptime: 99.99 },
];

const incidents = [
  {
    date: "12 August 2026",
    title: "Elevated build latency in eu-west",
    resolved: true,
    body: "Builds in the European region queued for up to four minutes after a capacity shift. Resolved by rebalancing the build pool. No data was affected.",
  },
  {
    date: "27 June 2026",
    title: "Delayed transactional email",
    resolved: true,
    body: "Outbound email from published apps was delayed by roughly twenty minutes following an upstream provider incident. All queued mail was delivered.",
  },
];

/**
 * Ninety days of availability, newest on the right. Bars are drawn from a
 * deterministic pattern so the page renders identically on server and client.
 */
function UptimeBar({ seed }: { seed: number }) {
  const days = Array.from({ length: 90 }, (_, index) => {
    const value = (index * 7 + seed * 13) % 97;
    return value === 0 ? "degraded" : "operational";
  });
  return (
    <div className="flex items-end gap-[2px]" aria-hidden="true">
      {days.map((state, index) => (
        <span
          key={index}
          className={
            state === "operational"
              ? "h-6 w-[3px] rounded-full bg-success/70"
              : "h-6 w-[3px] rounded-full bg-chart-3"
          }
        />
      ))}
    </div>
  );
}

export default function StatusPage() {
  const allOperational = services.every((service) => service.uptime > 99);
  return (
    <>
      <Section className="pt-14 md:pt-20">
        <PageHeader eyebrow="Status" title="System status" />
        <Card className="mt-8 flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
            <p className="text-[15px] font-semibold">
              {allOperational ? "All systems operational" : "Partial degradation"}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">Updated continuously</p>
        </Card>
      </Section>

      <Section className="pt-0">
        <SectionHeading title="Services" description="Availability over the last 90 days." />
        <Card className="mt-6 divide-y divide-border">
          {services.map((service, index) => (
            <div key={service.name} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-[10rem]">
                <p className="text-sm font-medium">{service.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {service.uptime.toFixed(2)}% uptime
                </p>
              </div>
              <div className="hidden sm:block">
                <UptimeBar seed={index} />
              </div>
              <Badge tone="success">Operational</Badge>
            </div>
          ))}
        </Card>
      </Section>

      <Section className="pt-0">
        <SectionHeading title="Recent incidents" />
        <div className="mt-6 space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.title} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-semibold tracking-tight">{incident.title}</h3>
                {incident.resolved && <Badge tone="success">Resolved</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{incident.date}</p>
              <p className="mt-2.5 text-sm text-muted-foreground">{incident.body}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
