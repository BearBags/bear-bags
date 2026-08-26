import Link from 'next/link';

export interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}

const LegalPage = ({ title, intro, lastUpdated, sections }: LegalPageProps) => {
  return (
    <main className="bg-[#f4f4ec] min-h-screen py-10 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-8">
        <header className="space-y-3">
          <span className="inline-block rounded-full bg-[#23473f] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
            Legal
          </span>
          <h1 className="font-['Playfair_Display'] text-[30px] font-bold leading-tight tracking-tight text-[#134632] sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="text-sm leading-7 text-[#555]">{intro}</p>
          <p className="text-xs text-[#8a9a8a]">Last updated: {lastUpdated}</p>
        </header>

        <div className="mt-8 space-y-4 sm:mt-10 sm:space-y-5">
          {sections.map(({ heading, body }, index) => (
            <section
              key={heading}
              className="rounded-[24px] border border-[#dbe7d2] bg-white p-5 shadow-sm sm:rounded-[30px] sm:p-7"
            >
              <h2 className="text-base font-semibold text-[#134632] sm:text-lg">
                <span className="mr-2 text-[#9ab99a]">{String(index + 1).padStart(2, '0')}</span>
                {heading}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[#555] [&_a]:font-medium [&_a]:text-[#23473f] [&_a]:underline [&_a]:underline-offset-4 [&_li]:flex [&_li]:gap-3 [&_ul]:space-y-2.5">
                {body}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-[24px] border border-[#d3e5c9] bg-[#eef6ea] p-5 sm:rounded-[30px] sm:p-7">
          <h2 className="text-base font-semibold text-[#134632] sm:text-lg">Questions?</h2>
          <p className="mt-2 text-sm leading-7 text-[#555]">
            Write to us at <a href="mailto:hello@bearbags.in" className="font-medium text-[#23473f] underline underline-offset-4">hello@bearbags.in</a> or
            call <a href="tel:+919131783440" className="font-medium text-[#23473f] underline underline-offset-4">+91 91317 83440</a>. We usually reply within 2 working days.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#23473f] px-6 text-sm font-semibold text-white transition hover:bg-[#1a352f]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default LegalPage;
