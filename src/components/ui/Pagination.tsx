import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize = 5,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  function getVisiblePages() {
    const pages: number[] = [];

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 2) {
      end = Math.min(totalPages, 5);
    }

    if (currentPage >= totalPages - 1) {
      start = Math.max(1, totalPages - 4);
    }

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  }

  const buttonBase =
    "flex h-9 min-w-9 items-center justify-center rounded-lg border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Exibindo{" "}
        <strong style={{ color: "var(--color-text)" }}>
          {firstItem}–{lastItem}
        </strong>{" "}
        de <strong style={{ color: "var(--color-text)" }}>{totalItems}</strong>{" "}
        registros
      </p>

      <nav
        aria-label="Navegação de páginas"
        className="flex items-center gap-1.5"
      >
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className={buttonBase}
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <ChevronLeft size={17} />
        </button>

        {getVisiblePages().map((page) => {
          const isActive = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Página ${page}`}
              aria-current={isActive ? "page" : undefined}
              className={buttonBase}
              style={
                isActive
                  ? {
                      backgroundColor: "var(--color-primary)",
                      borderColor: "var(--color-primary)",
                      color: "#ffffff",
                      boxShadow: "0 2px 8px rgba(4, 120, 87, 0.2)",
                    }
                  : {
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                    }
              }
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
          className={buttonBase}
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <ChevronRight size={17} />
        </button>
      </nav>
    </div>
  );
}
