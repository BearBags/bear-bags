import Link from 'next/link';

interface Props {
  /** Query parameter this table's page is stored in, e.g. "ordersPage". */
  param: string;
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  /** The current query string, so paging one table keeps the other's page. */
  searchParams: Record<string, string | undefined>;
}

// Previous / page numbers / Next for a server-rendered admin table. Plain
// links, so it works without client JavaScript.
export default function Pagination({ param, page, totalPages, totalItems, pageSize, searchParams }: Props) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter((entry): entry is [string, string] => entry[1] !== undefined),
    );
    params.set(param, String(target));
    return `?${params.toString()}`;
  };

  // First, last, and up to two pages either side of the current one.
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2,
  );

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);
  const linkClass = 'min-w-9 rounded-full border px-3 py-1.5 text-center text-xs font-medium transition';

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#dbe7d2] px-5 py-3 sm:flex-row">
      <span className="text-xs text-[#888]">
        Showing {first}–{last} of {totalItems}
      </span>
      {/* Not a <nav>: globals.css styles every <nav> as the sticky site header. */}
      <div role="navigation" aria-label="Pagination" className="flex flex-wrap items-center gap-1.5">
        {page > 1 ? (
          <Link href={href(page - 1)} scroll={false} className={`${linkClass} border-[#d1ddcf] text-[#134632] hover:bg-[#f0f0e8]`}>
            Previous
          </Link>
        ) : (
          <span className={`${linkClass} border-[#eee] text-[#bbb]`}>Previous</span>
        )}
        {pages.map((n, i) => (
          <span key={n} className="flex items-center gap-1.5">
            {i > 0 && n - pages[i - 1] > 1 && <span className="text-xs text-[#bbb]">…</span>}
            <Link
              href={href(n)}
              scroll={false}
              aria-current={n === page ? 'page' : undefined}
              className={`${linkClass} ${n === page ? 'border-[#134632] bg-[#134632] text-white' : 'border-[#d1ddcf] text-[#134632] hover:bg-[#f0f0e8]'}`}
            >
              {n}
            </Link>
          </span>
        ))}
        {page < totalPages ? (
          <Link href={href(page + 1)} scroll={false} className={`${linkClass} border-[#d1ddcf] text-[#134632] hover:bg-[#f0f0e8]`}>
            Next
          </Link>
        ) : (
          <span className={`${linkClass} border-[#eee] text-[#bbb]`}>Next</span>
        )}
      </div>
    </div>
  );
}
