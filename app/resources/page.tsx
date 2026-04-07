import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import {
  mindfulnessIntro,
  mindfulnessPractices,
  recommendedBooks,
  resourcesIntro,
} from "@/app/data/homepageData";
import { getCurrentResourceOfMonth } from "@/lib/resources";
import { JournalingPromptsSection } from "@/app/resources/JournalingPromptsSection";

export default async function ResourcesPage() {
  const dbResource = await getCurrentResourceOfMonth();

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle title="Resources for Reflection and Growth" description={resourcesIntro} />
        </SectionBlock>

        <JournalingPromptsSection />

        <SectionBlock>
          <SectionTitle title="Mindfulness Practices" description={mindfulnessIntro} />
          <div className="grid gap-4 md:grid-cols-3">
            {mindfulnessPractices.map((practice) => (
              <Card key={practice.id} className="gap-2">
                <h3 className="text-lg font-semibold text-[var(--text-strong)]">{practice.title}</h3>
                <p className="text-[var(--text-muted)]">{practice.description}</p>
              </Card>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Recommended Books" />
          <div className="grid gap-4 md:grid-cols-3">
            {recommendedBooks.map((book) => (
              <Card key={book.id} className="gap-2">
                <h3 className="text-lg font-semibold text-[var(--text-strong)]">{book.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">By {book.author}</p>
                <p className="text-[var(--text-muted)]">{book.reason}</p>
              </Card>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock>
          {dbResource ? (
            <>
              <SectionTitle title={dbResource.title} />
              <Card className="gap-3">
                <p className="text-[var(--text-muted)]">{dbResource.description}</p>
                {dbResource.linkUrl && dbResource.linkLabel ? (
                  <a
                    href={dbResource.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    {dbResource.linkLabel}
                  </a>
                ) : null}
              </Card>
            </>
          ) : (
            <>
              <SectionTitle title="Resource of the Month" />
              <Card>
                <p className="text-[var(--text-muted)]">No resource has been selected for this month yet. Check back soon.</p>
              </Card>
            </>
          )}
        </SectionBlock>
      </main>
    </div>
  );
}
