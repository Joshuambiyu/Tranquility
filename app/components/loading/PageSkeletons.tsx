import { SectionBlock } from "@/app/components/ui";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`th-shimmer rounded-xl ${className}`} />;
}

function SkeletonParagraph() {
  return (
    <div className="grid gap-2">
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-[92%]" />
      <SkeletonBlock className="h-4 w-[78%]" />
    </div>
  );
}

function SkeletonSectionHeader() {
  return (
    <div className="grid gap-3">
      <SkeletonBlock className="h-10 w-3/4 sm:w-1/2" />
      <SkeletonBlock className="h-4 w-full sm:w-4/5" />
      <SkeletonBlock className="h-4 w-11/12 sm:w-2/3" />
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">{children}</main>
    </div>
  );
}

function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`skeleton-card-${index}`} className="grid gap-3 rounded-xl bg-[var(--surface)] p-5 ring-1 ring-[var(--border-muted)]">
          <SkeletonBlock className="h-3 w-1/3" />
          <SkeletonBlock className="h-7 w-4/5" />
          <SkeletonParagraph />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <PageShell>
      <SectionBlock className="relative overflow-hidden">
        <SkeletonBlock className="absolute inset-0 rounded-xl" />
        <div className="relative grid gap-5 lg:max-w-[58%]">
          <SkeletonSectionHeader />
          <SkeletonBlock className="h-11 w-44 rounded-full" />
        </div>
      </SectionBlock>
      <SectionBlock>
        <SkeletonSectionHeader />
      </SectionBlock>
      <SectionBlock>
        <SkeletonSectionHeader />
        <CardGridSkeleton count={3} />
      </SectionBlock>
      <SectionBlock className="relative overflow-hidden">
        <SkeletonBlock className="absolute inset-0 rounded-xl" />
        <div className="relative grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="grid gap-3">
            <SkeletonBlock className="h-9 w-3/4" />
            <SkeletonParagraph />
            <SkeletonBlock className="h-4 w-40" />
          </div>
          <div className="hidden h-52 md:block" aria-hidden="true" />
        </div>
      </SectionBlock>
    </PageShell>
  );
}

export function BlogListPageSkeleton() {
  return (
    <PageShell>
      <SectionBlock className="gap-4">
        <SkeletonSectionHeader />
        <SkeletonBlock className="h-12 w-full" />
      </SectionBlock>
      <SectionBlock className="relative overflow-hidden" bgVariant="default">
        <SkeletonBlock className="absolute inset-0 rounded-xl" />
        <div className="relative grid gap-4">
          <SkeletonBlock className="h-10 w-60" />
          <div className="grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div className="grid gap-3">
              <SkeletonBlock className="h-4 w-1/2" />
              <SkeletonBlock className="h-8 w-4/5" />
              <SkeletonParagraph />
            </div>
            <div className="hidden h-52 md:block" aria-hidden="true" />
          </div>
        </div>
      </SectionBlock>
      <SectionBlock>
        <SkeletonBlock className="h-9 w-56" />
        <CardGridSkeleton count={6} />
      </SectionBlock>
    </PageShell>
  );
}

export function JournalsPageSkeleton() {
  return (
    <PageShell>
      <SectionBlock className="relative min-h-[19rem] overflow-hidden" bgVariant="light">
        <SkeletonBlock className="absolute inset-0 rounded-xl" />
        <div className="relative grid gap-4 lg:max-w-[58%]">
          <SkeletonSectionHeader />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>
      </SectionBlock>
      <SectionBlock>
        <SkeletonSectionHeader />
        <div className="grid gap-4">
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-11 w-full sm:w-60" />
        </div>
      </SectionBlock>
      <SectionBlock>
        <SkeletonBlock className="h-9 w-52" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`journal-skeleton-${index}`} className="grid gap-3 rounded-xl bg-[var(--surface)] p-5 ring-1 ring-[var(--border-muted)]">
              <SkeletonBlock className="h-3 w-1/2" />
              <SkeletonParagraph />
            </div>
          ))}
        </div>
      </SectionBlock>
    </PageShell>
  );
}

export function VoicesPageSkeleton() {
  return (
    <PageShell>
      <SectionBlock className="gap-4">
        <SkeletonSectionHeader />
      </SectionBlock>
      <SectionBlock>
        <SkeletonBlock className="h-9 w-56" />
        <div className="grid gap-3 rounded-xl bg-[var(--surface)] p-6 ring-1 ring-[var(--border-muted)]">
          <SkeletonBlock className="h-8 w-3/5" />
          <SkeletonParagraph />
        </div>
      </SectionBlock>
      <SectionBlock>
        <SkeletonSectionHeader />
        <CardGridSkeleton count={4} />
      </SectionBlock>
      <SectionBlock>
        <SkeletonBlock className="h-9 w-52" />
        <div className="grid gap-4">
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-11 w-full sm:w-56" />
        </div>
      </SectionBlock>
    </PageShell>
  );
}

export function SearchPageSkeleton() {
  return (
    <PageShell>
      <SectionBlock className="gap-4">
        <SkeletonSectionHeader />
        <SkeletonBlock className="h-12 w-full" />
      </SectionBlock>
      <SectionBlock>
        <SkeletonBlock className="h-16 w-full" />
      </SectionBlock>
      <SectionBlock>
        <SkeletonBlock className="h-9 w-44" />
        <CardGridSkeleton count={6} />
      </SectionBlock>
    </PageShell>
  );
}

export function FormPageSkeleton() {
  return (
    <PageShell>
      <SectionBlock>
        <SkeletonSectionHeader />
      </SectionBlock>
      <SectionBlock>
        <SkeletonBlock className="h-9 w-48" />
        <div className="grid gap-4">
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-32 w-full" />
          <SkeletonBlock className="h-11 w-full sm:w-48" />
        </div>
      </SectionBlock>
    </PageShell>
  );
}

export function RichContentPageSkeleton() {
  return (
    <PageShell>
      <SectionBlock>
        <SkeletonSectionHeader />
      </SectionBlock>
      <SectionBlock>
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock key={`paragraph-skeleton-${index}`} className="h-5 w-full" />
          ))}
        </div>
      </SectionBlock>
      <SectionBlock>
        <SkeletonBlock className="h-9 w-56" />
        <CardGridSkeleton count={4} />
      </SectionBlock>
    </PageShell>
  );
}

export function AdminPageSkeleton() {
  return (
    <PageShell>
      <SectionBlock>
        <SkeletonSectionHeader />
      </SectionBlock>
      <SectionBlock>
        <div className="grid gap-3">
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-11 w-full" />
        </div>
      </SectionBlock>
    </PageShell>
  );
}

export function ArticlesGridLoading({ count = 6 }: { count?: number }) {
  return <CardGridSkeleton count={count} />;
}

export function JournalEntriesLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`journal-inline-skeleton-${index}`} className="grid gap-3 rounded-xl bg-[var(--surface)] p-5 ring-1 ring-[var(--border-muted)]">
          <SkeletonBlock className="h-3 w-1/2" />
          <SkeletonParagraph />
        </div>
      ))}
    </div>
  );
}

export function SearchResultsLoading() {
  return <CardGridSkeleton count={6} />;
}

export function VoicesFeedLoading() {
  return <CardGridSkeleton count={4} />;
}