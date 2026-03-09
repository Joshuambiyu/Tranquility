"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
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
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_left,_#d9e8f5,_#eaf4ee_40%,_#f7f8f4_75%)] text-slate-800">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock className="gap-4">
          <SectionTitle title="Reflection" description={blogPageIntro} />
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Search reflections
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, author, or topic"
              className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none ring-emerald-300 transition focus:ring"
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
              <h3 className="text-2xl font-semibold text-slate-900">{featuredBlogPost.title}</h3>
              <p className="text-slate-700">{featuredBlogPost.excerpt}</p>
              <p className="rounded-xl bg-cyan-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-cyan-100">
                Reflection moment: {featuredBlogPost.reflectionMoment}
              </p>
              <Link href={featuredBlogPost.href} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Read full reflection
              </Link>
            </div>
            <div className="relative h-52 overflow-hidden rounded-2xl ring-1 ring-emerald-100 sm:h-64">
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
                <article key={post.id} className="grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-emerald-100">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                    {post.author} • {post.publishedOn}
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">{post.title}</h3>
                  <p className="text-slate-700">{post.excerpt}</p>
                  <p className="rounded-xl bg-cyan-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-cyan-100">
                    Reflection moment: {post.reflectionMoment}
                  </p>
                  <p className="text-sm text-slate-600">
                    Related: {relatedA.title} • {relatedB.title}
                  </p>
                  <Link href={post.href} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                    Read article
                  </Link>
                </article>
              );
            })}
          </div>
          {filteredPosts.length === 0 ? (
            <p className="rounded-xl bg-cyan-50 px-4 py-3 text-slate-700 ring-1 ring-cyan-100">
              No reflections matched your search yet. Try another keyword.
            </p>
          ) : null}
        </SectionBlock>
      </main>
    </div>
  );
}
