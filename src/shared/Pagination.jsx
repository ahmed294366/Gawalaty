import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"


export function PaginationComponent({ pages, page, category, sort }) {
  let link = "";
  if (category) link += `&category=${category}`;
  if (sort) link += `&sort=${sort}`;

  page = +page;
  pages = +pages;

  if (pages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            className="text-xl" 
            href={`/?page=${Math.max(1, page - 1)}${link}`} 
          />
        </PaginationItem>

        <PaginationLinks link={link} pages={pages} page={page} />

        <PaginationItem>
          <PaginationNext 
            className="text-xl" 
            href={`/?page=${Math.min(pages, page + 1)}${link}`} 
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function PaginationLinks({ pages, page, link }) {
  if (pages <= 7) {
    return [...Array.from({ length: pages })].map((_, i) => (
      <PaginationItem key={`page-${i + 1}`}>
        <PaginationLink
          className={`${i + 1 === page ? "bg-neutral-200" : "bg-neutral-50"}`}
          href={`/?page=${i + 1}${link}`}
          isActive={i + 1 === page}
        >
          {i + 1}
        </PaginationLink>
      </PaginationItem>
    ));
  } 
  
  if (page <= 5) {
    return (
      <>
        {[...Array.from({ length: 6 })].map((_, i) => (
          <PaginationItem key={`page-${i + 1}`}>
            <PaginationLink
              className={`${i + 1 === page ? "bg-neutral-200" : "bg-neutral-50"}`}
              href={`/?page=${i + 1}${link}`}
              isActive={i + 1 === page}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem><PaginationEllipsis /></PaginationItem>

        <PaginationItem key="last">
          <PaginationLink
            className={`${pages === page ? "bg-neutral-200" : "bg-neutral-50"}`}
            href={`/?page=${pages}${link}`}
            isActive={pages === page}
          >
            {pages}
          </PaginationLink>
        </PaginationItem>
      </>
    );
  } 
  
  if (page >= pages - 4) {
    return (
      <>
        <PaginationItem>
          <PaginationLink
            className={`${page === 1 ? "bg-neutral-200" : "bg-neutral-50"}`}
            href={`/?page=1${link}`}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>

        <PaginationItem><PaginationEllipsis /></PaginationItem>

        {[...Array.from({ length: 6 })].map((_, i) => {
          const PAGE = pages - 5 + i;
          return (
            <PaginationItem key={`page-${PAGE}`}>
              <PaginationLink
                className={`${PAGE === page ? "bg-neutral-200" : "bg-neutral-50"}`}
                href={`/?page=${PAGE}${link}`}
                isActive={PAGE === page}
              >
                {PAGE}
              </PaginationLink>
            </PaginationItem>
          );
        })}
      </>
    );
  }

  return (
    <>
      <PaginationItem key="first">
        <PaginationLink
          className={`${page === 1 ? "bg-neutral-200" : "bg-neutral-50"}`}
          href={`/?page=1${link}`}
          isActive={page === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>

      <PaginationItem><PaginationEllipsis /></PaginationItem>

      <PaginationItem>
        <PaginationLink href={`/?page=${page - 1}${link}`}>{page - 1}</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink 
          className="bg-neutral-200" 
          href={`/?page=${page}${link}`} 
          isActive={true}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href={`/?page=${page + 1}${link}`}>{page + 1}</PaginationLink>
      </PaginationItem>

      <PaginationItem><PaginationEllipsis /></PaginationItem>

      <PaginationItem key="last">
        <PaginationLink 
          href={`/?page=${pages}${link}`} 
          isActive={pages === page}
        >
          {pages}
        </PaginationLink>
      </PaginationItem>
    </>
  );
}
