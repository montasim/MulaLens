import { createFileRoute } from '@tanstack/react-router'

import { SiteHeader, releaseUrl } from '#/components/site-header'
import { Button } from '#/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'

export const Route = createFileRoute('/')({ component: Home })

const facts = [
  ['No account', 'Install and research immediately'],
  ['One-site focus', 'Runs only on deshimula.com'],
  ['Sources stay visible', 'Open the evidence behind a result'],
]

const steps = [
  ['Install', 'Add it to Chrome', 'The extension needs no account and keeps its interface out of your way.'],
  ['Open', 'Visit Deshi Mula', 'Choose a company entry and open its research panel beside the page.'],
  ['Research', 'Follow the evidence', 'Compare themes, pay, roles, and stories. Open the source when context matters.'],
]

const faqs = [
  {
    question: 'Does it work outside Deshi Mula?',
    answer:
      'No. It runs only on deshimula.com and adds research beside company entries found there.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No. There is no account, setup screen, or API key to configure.',
  },
  {
    question: 'Is every workplace claim verified?',
    answer:
      'No. Workplace stories are community-submitted. Verify important claims independently before making an employment decision.',
  },
  {
    question: 'What does the extension store?',
    answer:
      'Locally, it stores only whether you accepted the disclosure shown before your first Ask request.',
  },
]

function Home() {
  return (
    <>
      <a
        href="#main"
        className="fixed top-4 left-4 z-50 -translate-y-24 bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        <section id="top" className="page-grid overflow-hidden border-b border-border">
          <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-[1400px] items-center gap-10 px-5 py-12 md:grid-cols-[0.82fr_1.18fr] lg:gap-16 lg:px-10 lg:py-16">
            <div className="hero-enter relative z-10 max-w-xl">
              <p className="mb-5 font-mono text-[11px] font-semibold tracking-[0.18em] text-brand-soft uppercase">
                Built for Deshi Mula
              </p>
              <h1 className="max-w-[13ch] text-5xl leading-[0.95] font-bold tracking-[-0.04em] text-balance sm:text-6xl lg:text-[4.1rem]">
                Research before you join.
              </h1>
              <p className="mt-6 max-w-[34rem] text-lg leading-7 text-muted-foreground">
                Research company culture, reported pay, open roles, and workplace stories without leaving Deshi Mula.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="brand" size="lg" className="shadow-brand hover:-translate-y-0.5">
                  <a href={releaseUrl} target="_blank" rel="noreferrer">
                    Get extension
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#how">See how it works</a>
                </Button>
              </div>
            </div>

            <div className="hero-enter-late relative mx-auto w-full max-w-[760px]">
              <div className="absolute -inset-6 -z-10 rotate-2 bg-brand/14" />
              <figure className="overflow-hidden border border-border bg-accent shadow-product">
                <div className="flex h-10 items-center gap-2 border-b border-border bg-card px-4" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-muted-foreground/70" />
                  <span className="size-2.5 rounded-full bg-[#a88b4b]" />
                  <span className="size-2.5 rounded-full bg-brand" />
                  <span className="ml-3 h-5 w-2/5 rounded-sm bg-foreground/6" />
                </div>
                <img
                  src="/product/extension-screenshot.png"
                  alt="Deshi Mula website with the MulaLens company research panel open"
                  className="aspect-[16/10] w-full object-cover object-center"
                  width="1280"
                  height="800"
                  fetchPriority="high"
                />
              </figure>
            </div>
          </div>
        </section>

        <section aria-label="Product facts" className="border-b border-border">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 px-5 sm:grid-cols-3 lg:px-10">
            {facts.map(([title, copy], index) => (
              <div
                key={title}
                className={`py-6 ${index > 0 ? 'border-t sm:border-t-0 sm:pl-8' : ''} ${index < facts.length - 1 ? 'sm:border-r sm:pr-8' : ''}`}
              >
                <strong className="block text-lg font-semibold tracking-[-0.03em]">{title}</strong>
                <span className="text-sm text-muted-foreground">{copy}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="inside" className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
          <div className="max-w-3xl">
            <h2 className="text-4xl leading-[1.02] font-bold tracking-[-0.035em] text-balance sm:text-5xl">
              The missing context, beside the story.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-7 text-muted-foreground">
              Turn a company entry into a focused research brief with community evidence and official links.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-12 md:grid-rows-2">
            <article className="bg-foreground p-7 text-background md:col-span-7 md:row-span-2 md:p-10">
              <div className="flex h-full flex-col justify-between gap-14">
                <div>
                  <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-[#62bbae] uppercase">Company brief</p>
                  <h3 className="mt-4 max-w-[14ch] text-3xl leading-tight font-semibold tracking-[-0.035em] sm:text-4xl">
                    See the patterns before you make the move.
                  </h3>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <p className="text-sm leading-6 opacity-70">Scan workplace culture, reported work setup, and pay evidence in one readable view.</p>
                  <p className="text-sm leading-6 opacity-70">Follow citations back to Deshi Mula stories, comments, jobs, and official company pages.</p>
                </div>
              </div>
            </article>

            <article className="border border-border bg-accent p-7 md:col-span-5">
              <span className="font-mono text-xs font-semibold text-brand-soft">ASK</span>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">Ask a specific question.</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Get a generated answer grounded in retrieved story excerpts, with citations attached.</p>
            </article>

            <article className="border border-brand bg-brand p-7 text-white md:col-span-5">
              <span className="font-mono text-xs font-semibold text-white">PAY + ROLES</span>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">Check what is reported.</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-white">Review salary evidence, active hiring signals, and careers links without treating community reports as official policy.</p>
            </article>
          </div>
        </section>

        <section id="how" className="border-y border-border bg-secondary">
          <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
            <h2 className="max-w-2xl text-4xl font-bold tracking-[-0.035em] sm:text-5xl">Three moves. Better questions.</h2>
            <div className="mt-14 grid md:grid-cols-3">
              {steps.map(([label, title, copy], index) => (
                <article
                  key={label}
                  className={`border-t pt-6 ${index === 0 ? 'border-t-2 border-foreground md:pr-10' : 'border-border md:px-10'} ${index === 2 ? 'md:pr-0' : ''}`}
                >
                  <span className="font-mono text-sm font-semibold text-brand-soft">{label}</span>
                  <h3 className="mt-7 text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-20 md:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-28">
          <div className="md:pr-8">
            <p className="text-sm font-semibold text-brand-soft">Designed for careful decisions</p>
            <h2 className="mt-5 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">Evidence first. Verdicts never.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Community stories can reveal patterns, but they are not verified company policy. The interface keeps source type and dates visible.</p>
            <a href="https://github.com/montasim/MulaLens/blob/main/PRIVACY.md" target="_blank" rel="noreferrer" className="mt-7 inline-block border-b-2 border-brand pb-1 text-sm font-semibold hover:text-brand-soft">
              Read the privacy policy
            </a>
          </div>
          <figure className="bg-accent p-5 sm:p-8">
            <img src="/product/promo-tile.png" alt="MulaLens promotional image showing the research panel" className="mx-auto w-full max-w-[660px] shadow-product" width="440" height="280" loading="lazy" />
          </figure>
        </section>

        <section id="faq" className="border-t border-border">
          <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 md:grid-cols-[0.65fr_1.35fr] lg:px-10 lg:py-28">
            <h2 className="text-4xl font-bold tracking-[-0.035em] sm:text-5xl">Questions, answered plainly.</h2>
            <Accordion type="single" defaultValue="outside" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={index === 0 ? 'outside' : `item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="bg-brand text-white">
          <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 px-5 py-16 md:flex-row md:items-end lg:px-10 lg:py-20">
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-white uppercase">Before the next application</p>
              <h2 className="mt-4 text-4xl leading-[1.02] font-bold tracking-[-0.035em] text-white sm:text-5xl">Bring better context to the decision.</h2>
            </div>
            <Button asChild size="lg" className="border-white bg-white text-ink hover:-translate-y-0.5 hover:bg-white/90 hover:text-ink">
              <a href={releaseUrl} target="_blank" rel="noreferrer">Get extension</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-[#101715] text-[#f1eee7]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-12 sm:grid-cols-[1fr_auto] lg:px-10">
          <div>
            <div className="flex items-center gap-3">
              <img src="/brand/logo.png" alt="" className="size-8 rounded-lg" width="32" height="32" loading="lazy" />
              <span className="font-bold tracking-[-0.03em]">MulaLens</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/55">An independent research companion for deshimula.com. Not affiliated with Deshi Mula.</p>
          </div>
          <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold" aria-label="Footer navigation">
            <a href="https://github.com/montasim/MulaLens" target="_blank" rel="noreferrer" className="hover:text-[#62bbae]">GitHub</a>
            <a href="https://github.com/montasim/MulaLens/blob/main/PRIVACY.md" target="_blank" rel="noreferrer" className="hover:text-[#62bbae]">Privacy</a>
            <a href="https://github.com/montasim/MulaLens/issues" target="_blank" rel="noreferrer" className="hover:text-[#62bbae]">Support</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
