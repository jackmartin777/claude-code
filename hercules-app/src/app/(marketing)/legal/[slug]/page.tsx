import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/content/page-header";
import { Prose } from "@/components/content/prose";
import { site } from "@/data/site";
import { cn, slugify } from "@/lib/utils";

type LegalSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

type LegalDoc = {
  slug: string;
  title: string;
  description: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

const contact = "legal@hercules.app";

const legalDocs: LegalDoc[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    description:
      "The agreement between your business and Zeus AI Labs covering the use of Hercules, the apps you build with it, and the responsibilities on both sides.",
    updated: "2026-07-14",
    intro:
      "These terms govern your use of Hercules and any related services provided by Zeus AI Labs, Inc. By creating an account or using the service you agree to them on behalf of yourself and any organisation you represent. This page is a plain-language summary written for a demonstration site and is not legal advice.",
    sections: [
      {
        heading: "The service",
        paragraphs: [
          "Hercules lets you describe software in plain language and produces a working application, together with the hosting, database and supporting infrastructure that application needs to run.",
          "We may add, change or remove features over time. Where a change materially reduces functionality you are paying for, we will give reasonable notice before it takes effect.",
        ],
      },
      {
        heading: "Your account",
        paragraphs: [
          "You are responsible for the accuracy of the information on your account, for keeping your credentials secure, and for everything done through your account by the people you invite to it.",
          "You must be old enough to enter a binding contract in your jurisdiction, and if you accept these terms for an organisation you confirm you are authorised to do so.",
        ],
      },
      {
        heading: "Your content and your apps",
        paragraphs: [
          "You keep ownership of everything you put into the service and everything the service builds for you: your prompts, your data, your files and the applications generated from them.",
          "You grant us the limited licence we need to host, process, back up and display that content for the purpose of operating the service and supporting you. We do not use your business data to train foundation models.",
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: [
          "You may not use Hercules to build or operate anything unlawful, deceptive or harmful. The abuse policy sets out the specifics and forms part of these terms.",
        ],
        list: [
          "No unlawful, fraudulent or deliberately deceptive applications.",
          "No infringement of another party's intellectual property or privacy.",
          "No attempts to breach, overload or reverse engineer the platform.",
          "No resale of the service except through an agreement signed with us.",
        ],
      },
      {
        heading: "Plans, credits and payment",
        paragraphs: [
          "Paid plans are billed in advance on the interval you choose. Monthly credit allowances refresh at the start of each billing cycle and are not carried forward. Purchased top-up credits do not expire.",
          "You can change plan at any time; changes are reflected in your next billing cycle. Fees are exclusive of tax unless stated otherwise, and you are responsible for any tax that applies where you are established.",
        ],
      },
      {
        heading: "Availability and support",
        paragraphs: [
          "We work hard to keep the service running and publish incidents on our status page. Except where an enterprise agreement sets a specific service level, the service is provided without a guaranteed level of availability.",
          "Support channels and response targets are described on the support page and vary by plan.",
        ],
      },
      {
        heading: "Suspension and termination",
        paragraphs: [
          "You may close your account at any time. We may suspend or close an account that materially breaches these terms, that fails to pay, or that puts the platform or other customers at risk — with notice where circumstances allow.",
          "After termination you have thirty days to export your data, after which we may delete it in line with our retention schedule.",
        ],
      },
      {
        heading: "Warranties and liability",
        paragraphs: [
          "The service is provided as-is to the fullest extent permitted by law, and we disclaim implied warranties of merchantability and fitness for a particular purpose.",
          "Neither party is liable for indirect or consequential loss. Our aggregate liability is limited to the fees you paid in the twelve months before the event giving rise to the claim. Nothing here limits liability that cannot be limited by law.",
        ],
      },
      {
        heading: "Changes to these terms",
        paragraphs: [
          "We may update these terms as the service evolves. Material changes are announced by email and take effect thirty days after notice. Continuing to use the service after that means you accept the updated terms.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Questions about these terms can be sent to our legal team at the address at the foot of this page.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description:
      "What personal information Hercules collects, why we collect it, how long we keep it, and the choices you have over it.",
    updated: "2026-07-14",
    intro:
      "This policy explains how Zeus AI Labs, Inc. handles personal information when you visit this site, use Hercules, or interact with an application somebody else has built on it. It is written for a demonstration site and is deliberately general.",
    sections: [
      {
        heading: "Information we collect",
        paragraphs: [
          "We collect what we need to run the service and no more. That falls into three groups.",
        ],
        list: [
          "Account information — your name, work email, organisation and billing details.",
          "Content you provide — prompts, uploaded files and the data inside the apps you build.",
          "Usage and technical data — pages viewed, features used, device and browser type, and approximate location derived from IP address.",
        ],
      },
      {
        heading: "How we use it",
        paragraphs: [
          "We use personal information to provide the service, to authenticate you, to bill you, to answer support requests, to keep the platform secure, and to understand which parts of the product are working.",
          "We do not sell personal information, and we do not use the business data inside your apps to train foundation models.",
        ],
      },
      {
        heading: "Legal bases",
        paragraphs: [
          "Where data protection law requires a legal basis, we rely on the performance of our contract with you, our legitimate interest in operating and improving a secure service, your consent where we ask for it, and compliance with our legal obligations.",
        ],
      },
      {
        heading: "Processors and sub-processors",
        paragraphs: [
          "We use a small number of vendors to host infrastructure, process payments, send transactional email and provide model inference. Each is bound by a written agreement, may use the data only on our instructions, and appears on our published sub-processor list.",
        ],
      },
      {
        heading: "Data you control",
        paragraphs: [
          "When you build an app, you decide what personal information it collects from your own users. For that data you are the controller and we are your processor: we hold it, secure it and act on your instructions, and you are responsible for having a lawful basis to collect it.",
        ],
      },
      {
        heading: "International transfers",
        paragraphs: [
          "We operate in more than one region and may transfer personal information across borders. Where we do, we rely on recognised transfer mechanisms such as standard contractual clauses. Enterprise customers can pin their data to a specific region.",
        ],
      },
      {
        heading: "Retention",
        paragraphs: [
          "We keep account information for as long as your account is open and for a limited period afterwards to meet legal, tax and audit obligations. Content in a deleted project is removed from live systems promptly and from backups within thirty days.",
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "Data is encrypted in transit and at rest. Access to production systems is limited to staff who need it, requires multi-factor authentication, and is logged. We run regular reviews and penetration tests and will notify affected customers promptly if a breach occurs.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Depending on where you live you may have the right to access, correct, export, restrict or delete your personal information, and to object to some processing. Write to us and we will respond within the time the law allows.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We use cookies that are necessary to sign you in and keep your session secure, plus a small number of analytics cookies that help us understand how the product is used. You can control non-essential cookies from the banner or your browser settings.",
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "Hercules is a business product and is not directed at children. We do not knowingly collect personal information from anyone under sixteen.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Privacy questions and rights requests can be sent to the address at the foot of this page.",
        ],
      },
    ],
  },
  {
    slug: "abuse",
    title: "Abuse Policy",
    description:
      "What is not allowed on Hercules, how to report an application that breaks the rules, and what happens after a report.",
    updated: "2026-07-14",
    intro:
      "Hercules is used to build software that real businesses depend on. This policy sets out what may not be built or hosted on the platform and how to tell us when something is wrong. It applies to everyone using the service and forms part of the terms of service.",
    sections: [
      {
        heading: "Prohibited content and behaviour",
        paragraphs: [
          "The following are not permitted on Hercules, whether in a published app, a project preview or a message to our team.",
        ],
        list: [
          "Phishing, credential harvesting or any site impersonating another organisation.",
          "Malware, spyware, or software designed to damage or gain unauthorised access to systems.",
          "Fraudulent stores, fake reviews, fabricated records or deceptive financial schemes.",
          "Content that sexualises minors, or any material that exploits or endangers children.",
          "Harassment, threats, doxxing, or content inciting violence against people or groups.",
          "Unlawful sale of regulated goods, or infringement of intellectual property rights.",
          "Bulk unsolicited messaging, or use of the platform to relay spam.",
        ],
      },
      {
        heading: "Platform integrity",
        paragraphs: [
          "Do not attempt to circumvent the limits, isolation boundaries or safety systems of the platform. That includes probing other tenants, evading rate limits or spend caps, mining cryptocurrency, and using generated apps as proxies to disguise the origin of traffic.",
        ],
      },
      {
        heading: "Responsible AI use",
        paragraphs: [
          "Applications built on Hercules may use the AI features we provide. They may not be used to generate content that impersonates a real person without consent, to fabricate evidence or records, or to make automated decisions about credit, employment, housing or immigration without meaningful human review.",
        ],
      },
      {
        heading: "Reporting abuse",
        paragraphs: [
          "Anyone can report an application, whether or not they hold an account. Send us the URL and enough detail for us to understand the problem — a screenshot, the message you received, or the record you believe was misused. Include how to reach you if we need to follow up.",
          "Reports of an active phishing campaign or of content endangering a child are prioritised and reviewed around the clock.",
        ],
      },
      {
        heading: "How we respond",
        paragraphs: [
          "We review every report. Depending on severity we may ask the owner for an explanation, restrict a feature, disable the published app while it is investigated, suspend the account, or refer the matter to law enforcement.",
          "Where we act, we tell the account owner what was removed and why, unless a legal obligation prevents us from doing so.",
        ],
      },
      {
        heading: "Appeals",
        paragraphs: [
          "If you believe an enforcement decision was wrong, reply to the notice you received within thirty days with the context you think we missed. A different reviewer will look at the case and reply with a final decision.",
        ],
      },
      {
        heading: "Intellectual property complaints",
        paragraphs: [
          "Rights holders can submit a takedown notice identifying the work, the material they believe infringes it, their contact details, and a statement made in good faith. Owners may submit a counter-notice, and repeat infringers lose access to the service.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Abuse reports and takedown notices can be sent to the address at the foot of this page.",
        ],
      },
    ],
  },
];

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return legalDocs.map((doc) => ({ slug: doc.slug }));
}

function findDoc(slug: string) {
  return legalDocs.find((doc) => doc.slug === slug);
}

function formatUpdated(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = findDoc(slug);

  if (!doc) {
    return { title: "Page not found" };
  }

  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/legal/${doc.slug}` },
    openGraph: {
      title: `${doc.title} | Hercules`,
      description: doc.description,
      url: `/legal/${doc.slug}`,
      type: "article",
    },
  };
}

export default async function LegalPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = findDoc(slug);

  if (!doc) notFound();

  return (
    <>
      <PageHeader eyebrow="Legal" title={doc.title} description={doc.description}>
        <p className="text-[13px] text-muted-foreground">
          Last updated{" "}
          <time dateTime={doc.updated} className="font-medium text-foreground">
            {formatUpdated(doc.updated)}
          </time>
        </p>
      </PageHeader>

      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <aside>
            <div className="lg:sticky lg:top-20">
              <nav aria-label="On this page" className="text-sm">
                <h2 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Contents
                </h2>
                <ol className="mt-3 space-y-2 border-l border-border">
                  {doc.sections.map((section) => (
                    <li key={section.heading}>
                      <a
                        href={`#${slugify(section.heading)}`}
                        className={cn(
                          "-ml-px block border-l border-transparent pl-3 text-muted-foreground outline-none",
                          "transition-colors hover:border-ring hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        )}
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="mt-8 border-t border-border pt-6">
                <h2 className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Other policies
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {legalDocs
                    .filter((other) => other.slug !== doc.slug)
                    .map((other) => (
                      <li key={other.slug}>
                        <Link
                          href={`/legal/${other.slug}`}
                          className="rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          {other.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </aside>

          <article className="min-w-0">
            <Prose>
              <p className="text-pretty">{doc.intro}</p>

              {doc.sections.map((section) => (
                <section key={section.heading} aria-labelledby={slugify(section.heading)}>
                  <h2 id={slugify(section.heading)}>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.list ? (
                    <ul>
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </Prose>

            <div className="mt-12 rounded-xl border border-border bg-muted/40 p-6 text-sm leading-6 text-muted-foreground">
              <p>
                {site.legalName} · Written questions about this policy can be sent to{" "}
                <a
                  href={`mailto:${contact}`}
                  className="rounded font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {contact}
                </a>
                .
              </p>
              <p className="mt-2">
                This page is placeholder copy written for a demonstration of the Hercules
                marketing site. It is not legal advice and creates no obligations.
              </p>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
