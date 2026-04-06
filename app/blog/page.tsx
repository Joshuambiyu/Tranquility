"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import { blogPageIntro, blogPosts, featuredBlogPost } from "@/app/data/homepageData";

export default function BlogPage() {
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return blogPosts;
    }

    return blogPosts.filter((post) => {
      return (
        post.title.toLowerCase().includes(trimmed) ||
        post.excerpt.toLowerCase().includes(trimmed) ||
        post.author.toLowerCase().includes(trimmed)
      );
    });
  }, [query]);

  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle title="Reflection" description={blogPageIntro} />
          <label className="grid gap-2 text-sm font-medium text-[var(--text-muted)]">
            Search reflections
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, author, or topic"
              className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-4 py-3 text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
            />
          </label>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Featured Reflection" />
          <article className="grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div className="grid gap-3">
              <p className="text-sm font-medium text-emerald-700">
                By {featuredBlogPost.author} • {featuredBlogPost.publishedOn}
              </p>
              <h3 className="text-2xl font-semibold text-[var(--text-strong)]">{featuredBlogPost.title}</h3>
              <p className="text-[var(--text-muted)]">{featuredBlogPost.excerpt}</p>
              <p className="rounded-xl bg-[var(--card-in-section-bg)] px-4 py-3 text-sm text-[var(--text-muted)] ring-1 ring-[var(--border-muted)]">
                Reflection moment: {featuredBlogPost.reflectionMoment}
              </p>
              <Link href={featuredBlogPost.href} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Read full reflection
              </Link>
            </div>
            <div className="relative h-52 overflow-hidden rounded-2xl ring-1 ring-[var(--border-muted)] sm:h-64">
              <Image
                src={featuredBlogPost.imageSrc}
                alt={featuredBlogPost.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </article>
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Latest Posts" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post, index) => {
              const relatedA = filteredPosts[(index + 1) % filteredPosts.length];
              const relatedB = filteredPosts[(index + 2) % filteredPosts.length];
              return (
                <Card key={post.id} className="gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {post.author} • {post.publishedOn}
                  </p>
                  <h3 className="text-xl font-semibold text-[var(--text-strong)]">{post.title}</h3>
                  <p className="text-[var(--text-muted)]">{post.excerpt}</p>
                  <p className="rounded-xl bg-[var(--card-in-section-bg)] px-3 py-2 text-sm text-[var(--text-muted)] ring-1 ring-[var(--border-muted)]">
                    Reflection moment: {post.reflectionMoment}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Related: {relatedA.title} • {relatedB.title}
                  </p>
                  <Link href={post.href} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                    Read article
                  </Link>
                </Card>
              );
            })}
          </div>
          {filteredPosts.length === 0 ? (
            <Card>
              <p className="text-[var(--text-muted)]">No reflections matched your search yet. Try another keyword.</p>
            </Card>
          ) : null}
        </SectionBlock>
      </main>
    </div>
  );
}
