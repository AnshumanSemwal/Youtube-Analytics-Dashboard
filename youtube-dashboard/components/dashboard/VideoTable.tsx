"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Video = {
  id:          string;
  videoId:     string;
  title:       string;
  views:       number;
  likes:       number;
  comments:    number;
  publishedAt: string;
};

type SortKey = "views" | "likes" | "comments" | "publishedAt";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export default function VideoTable({
  videos,
  showThumbnails = true,
}: {
  videos:          Video[];
  showThumbnails?: boolean;
}) {
  const router = useRouter();

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortKey,         setSortKey]         = useState<SortKey>("views");
  const [sortDir,         setSortDir]         = useState<SortDir>("desc");
  const [page,            setPage]            = useState(1);

  // Debounce — 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Filter
  const filtered = useMemo(() =>
    videos.filter((v) =>
      v.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    ),
    [videos, debouncedSearch]
  );

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === "publishedAt") {
        const diff =
          new Date(a.publishedAt).getTime() -
          new Date(b.publishedAt).getTime();
        return sortDir === "desc" ? -diff : diff;
      }
      const diff = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === "desc" ? -diff : diff;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  function ColHeader({ label, colKey }: { label: string; colKey: SortKey }) {
    const active = sortKey === colKey;
    return (
      <button
        onClick={() => toggleSort(colKey)}
        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
      >
        {label}
        <span className={active ? "text-foreground" : "text-gray-300 dark:text-gray-700"}>
          {active && sortDir === "asc" ? "↑" : "↓"}
        </span>
      </button>
    );
  }

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-72 px-3 py-2 text-sm border rounded-lg mb-4 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:border-gray-700"
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border dark:border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
            <tr>
              {showThumbnails && <th className="px-4 py-3 w-20" />}
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Title
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ColHeader label="Views" colKey="views" />
                </div>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ColHeader label="Likes" colKey="likes" />
                </div>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ColHeader label="Comments" colKey="comments" />
                </div>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ColHeader label="Published" colKey="publishedAt" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={showThumbnails ? 6 : 5}
                  className="px-4 py-12 text-center text-muted-foreground text-sm"
                >
                  {debouncedSearch
                    ? `No videos match "${debouncedSearch}"`
                    : "No videos found. Click Refresh to sync."}
                </td>
              </tr>
            ) : (
              paginated.map((video, i) => (
                <tr
                  key={video.id}
                  onClick={() =>
                    router.push(`/dashboard/video/${video.videoId}`)
                  }
                  className={`
                    cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors
                    ${i < paginated.length - 1
                      ? "border-b dark:border-gray-800"
                      : ""}
                  `}
                >
                  {/* Thumbnail — only on real dashboard */}
                  {showThumbnails && (
                    <td className="px-4 py-3">
                      <Image
                        src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`}
                        alt={video.title}
                        width={80}
                        height={45}
                        className="rounded object-cover"
                      />
                    </td>
                  )}

                  {/* Title */}
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-foreground line-clamp-2 leading-snug">
                      {video.title}
                    </p>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                    {video.views.toLocaleString("en-US")}
                  </td>

                  {/* Likes */}
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                    {video.likes.toLocaleString("en-US")}
                  </td>

                  {/* Comments */}
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                    {video.comments.toLocaleString("en-US")}
                  </td>

                  {/* Published */}
                  <td className="px-4 py-3 text-right text-muted-foreground whitespace-nowrap">
                    {new Date(video.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day:   "numeric",
                      year:  "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <p className="text-sm text-muted-foreground">
            {filtered.length} video{filtered.length !== 1 ? "s" : ""}
            {debouncedSearch ? ` matching "${debouncedSearch}"` : ""}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors
                  ${page === p
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-foreground"
                  }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}