import { BuildChatMock } from "@/components/marketing/build-chat-mock";

export function BuildShowcase() {
  return (
    <section aria-labelledby="build-heading" className="py-20 sm:py-24 lg:py-28">
      <div className="container-page">
        <h2
          id="build-heading"
          className="max-w-3xl text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-4xl lg:text-5xl"
        >
          <span className="block">From idea to published app</span>
          <span className="block text-muted-foreground">in minutes</span>
        </h2>

        <div className="mt-12 grid items-center gap-10 sm:mt-14 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-md">
            <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">Build by chatting</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Describe what you want. Hercules builds it in real time.
            </p>
          </div>
          <BuildChatMock />
        </div>
      </div>
    </section>
  );
}
