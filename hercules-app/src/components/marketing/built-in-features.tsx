import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Bell,
  Bot,
  CalendarClock,
  Captions,
  ChartColumn,
  Cloud,
  CreditCard,
  Database,
  GitBranch,
  Globe,
  HardDrive,
  Image as ImageIcon,
  Images,
  KeyRound,
  KeySquare,
  Languages,
  LayoutTemplate,
  Mail,
  MessageCircle,
  Palette,
  Plug,
  Repeat,
  ScrollText,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  Waypoints,
  Zap,
} from "lucide-react";
import { featureGroups } from "@/data/site";

const featureIcons: Record<string, LucideIcon> = {
  Auth: KeyRound,
  Users: Users,
  Database: Database,
  Backend: Server,
  Payments: CreditCard,
  Email: Mail,
  Storage: HardDrive,
  Hosting: Cloud,
  Domains: Globe,
  "Files & media": Images,
  CMS: LayoutTemplate,
  Search: Search,
  Branding: Palette,
  SEO: TrendingUp,
  Mobile: Smartphone,
  Internationalization: Languages,
  Chat: MessageCircle,
  Notifications: Bell,
  "AI text generation": Sparkles,
  "AI image generation": ImageIcon,
  "AI speech generation": AudioLines,
  "AI transcription": Captions,
  Chatbots: Bot,
  "AI Gateway": Waypoints,
  Realtime: Zap,
  "Roles & permissions": UserCog,
  Security: ShieldCheck,
  Secrets: KeySquare,
  Analytics: ChartColumn,
  Audits: ScrollText,
  "Version control": GitBranch,
  "Scheduled events": CalendarClock,
  "Recurring events": Repeat,
};

export function BuiltInFeatures() {
  return (
    <section aria-labelledby="features-heading" className="py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <h2
          id="features-heading"
          className="max-w-3xl text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-4xl lg:text-5xl"
        >
          <span className="block">Everything you need</span>
          <span className="block text-muted-foreground">is built-in</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Auth, hosting, backend, database, payments, email, API integrations, and 100s of other
          features all available instantly.
        </p>

        <div className="mt-12 flex flex-col gap-8 sm:mt-14">
          {featureGroups.map((group) => (
            <div
              key={group.heading}
              className="grid gap-4 border-t border-border pt-8 first:border-t-0 first:pt-0 lg:grid-cols-[13rem_1fr] lg:gap-8"
            >
              <h3 className="text-sm font-medium text-muted-foreground lg:pt-1.5">
                {group.heading}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => {
                  const Icon = featureIcons[item] ?? Sparkles;
                  return (
                    <li
                      key={item}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    >
                      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      {item}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
          <Plug className="size-4" aria-hidden="true" />
          1,000s of API integrations
        </p>
      </div>
    </section>
  );
}
