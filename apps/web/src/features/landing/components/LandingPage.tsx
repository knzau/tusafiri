import Image from 'next/image';
import Link from 'next/link';

import { ROUTES } from '@/shared/config/routes';

import { daySummary, howItWorks, ideaPins, landingContent, numberedPins } from '../landing.content';
import { LandingLinkButton } from './LandingLinkButton';

const pinClass = {
  1: 'absolute grid size-8 place-items-center rounded-full border-[3px] border-pin bg-day1 text-sm leading-4 font-bold text-on-day shadow-day1',
  2: 'absolute grid size-8 place-items-center rounded-full border-[3px] border-pin bg-day2 text-sm leading-4 font-bold text-on-day shadow-day2',
  3: 'absolute grid size-8 place-items-center rounded-full border-[3px] border-pin bg-day3 text-sm leading-4 font-bold text-on-day shadow-day3',
} as const;

export function LandingPage() {
  return (
    <div className="@container w-full min-h-dvh bg-canvas">
      <div className="h-[calc(100cqi*0.625)] w-full overflow-hidden">
        <div className="landing-frame flex flex-col bg-canvas text-ink">
          <header className="flex h-[76px] items-center px-12">
            <Link
              className="flex items-center gap-2.5 text-inherit no-underline"
              href={ROUTES.home}
            >
              <span className="grid size-7 place-items-center rounded-md bg-accent">
                <span className="grid size-4 place-items-center">
                  <Image src="/landing/pin.svg" alt="" width={11.3333} height={14} />
                </span>
              </span>
              <p className="text-xl leading-[26px] font-bold tracking-[-0.005em]">
                {landingContent.productName}
              </p>
            </Link>
            <div className="flex-1" />
            <LandingLinkButton
              href={ROUTES.signIn}
              variant="default"
              leftSection={
                <span className="grid size-[18px] place-items-center">
                  <Image src="/landing/account.svg" alt="" width={14} height={14.75} />
                </span>
              }
            >
              {landingContent.signIn}
            </LandingLinkButton>
          </header>
          <main className="flex min-h-0 flex-1 items-center gap-14 px-12 pb-14">
            <section className="flex w-[540px] shrink-0 flex-col gap-6">
              <p className="font-mono text-[11px] leading-[15px] font-medium tracking-[0.06em] text-link uppercase">
                {landingContent.introLabel}
              </p>
              <h1 className="text-[64px] leading-[66px] font-bold tracking-[-0.03em]">
                {landingContent.headline}
              </h1>
              <p className="w-[460px] text-lg leading-7 text-muted">{landingContent.description}</p>
              <div className="flex items-center gap-4">
                <LandingLinkButton
                  href={ROUTES.demo}
                  variant="filled"
                  leftSection={
                    <span className="grid size-[18px] place-items-center">
                      <Image src="/landing/map-icon.svg" alt="" width={15.5} height={14} />
                    </span>
                  }
                >
                  {landingContent.demoAction}
                </LandingLinkButton>
                <p className="font-mono text-[11px] leading-[15px] font-medium tracking-[0.06em] text-faint uppercase">
                  {landingContent.demoNote}
                </p>
              </div>
              <ol className="m-0 flex list-none flex-col gap-3 border-t border-line p-0 pt-5">
                {howItWorks.map((step) => (
                  <li className="flex items-center gap-3.5" key={step.number}>
                    <p className="font-mono text-xs leading-[17px] font-medium text-faint">
                      {step.number}
                    </p>
                    <p className="text-[15px] leading-[22px] font-medium">{step.label}</p>
                  </li>
                ))}
              </ol>
            </section>
            <article className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
              <div className="relative h-[470px] overflow-hidden bg-map">
                <div className="absolute inset-0 h-[470px] w-[748px]">
                  <Image
                    className="absolute -top-[150px] -left-8"
                    src="/landing/map-base.svg"
                    alt="Illustrated map of the Lisbon demo trip"
                    width={800}
                    height={668.8}
                    priority
                  />
                  <Image
                    className="absolute top-0 left-0"
                    src="/landing/route-north.svg"
                    alt=""
                    width={748}
                    height={470}
                  />
                  <Image
                    className="absolute top-0 left-0"
                    src="/landing/route-south.svg"
                    alt=""
                    width={748}
                    height={470}
                  />
                  {ideaPins.map((pin) => (
                    <Image
                      key={pin.id}
                      className="absolute"
                      src="/landing/pin-idea.svg"
                      alt=""
                      width={14}
                      height={14}
                      style={{ left: pin.left, top: pin.top }}
                    />
                  ))}
                  {numberedPins.map((pin) => (
                    <span
                      key={pin.id}
                      className={pinClass[pin.day]}
                      style={{ left: pin.left, top: pin.top }}
                    >
                      {pin.label}
                    </span>
                  ))}
                  <p className="absolute top-4 left-4 flex h-7 items-center rounded-md border border-callout-line bg-callout px-2.5 font-mono text-[11px] leading-[15px] font-medium tracking-[0.06em] text-callout-text uppercase">
                    {landingContent.demoTag}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 border-t border-line p-5">
                <div>
                  <h2 className="text-xl leading-[26px] font-bold tracking-[-0.005em]">
                    {landingContent.tripName}
                  </h2>
                  <p className="mt-1 font-mono text-xs leading-[17px] font-medium text-muted">
                    {landingContent.tripMeta}
                  </p>
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-3.5">
                  {daySummary.map((day) => (
                    <div className="flex items-center gap-1.5" key={day.day}>
                      <Image src={day.dot} alt="" width={8} height={8} />
                      <p className="font-mono text-xs leading-[17px] font-medium text-muted">
                        {day.label}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  className="ml-auto flex items-center gap-1 text-sm leading-5 font-medium text-link no-underline"
                  href={ROUTES.demo}
                >
                  {landingContent.tripLink}
                  <span className="grid size-4 place-items-center">
                    <Image src="/landing/chevron.svg" alt="" width={6} height={10} />
                  </span>
                </Link>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
