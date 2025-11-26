import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination";

import { Button } from "@/components/ui/button";


export function AlertDelete({ setRemove, remove, HandleDelete, object, loadingRemove }) {
    return (
        <div
            onClick={() => {if(!loadingRemove)setRemove([false, ""])}}
            className="fixed z-50 top-0 left-0 w-full h-screen bg-black/40 flex items-center justify-center">
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white p-4 w-xl space-y-4 rounded-md">

                <h2 className="font-bold text-xl">
                    Are you absolutely sure?
                </h2>
                <span className="text-red-500 text-xl font-semibold">
                    {`This action cannot be undone. This will permanently remove this
                        ${object}.`}
                </span>
                <div className="w-full flex flex-col gap-2 mt-4 sm:flex-row justify-end">
                    <Button
                    disabled={loadingRemove}
                        variant={"outline"}
                        onClick={() => setRemove([false, ""])}
                    >
                        Cancel
                    </Button>
                    <Button
                    disabled={loadingRemove}
                        onClick={() => { HandleDelete(remove[1]) }}>
                            {loadingRemove?
                            <span className="w-4 h-4 animate-spin rounded-full border-2
                            border-white border-t-transparent"></span>
                            :"Continue"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function Empty({ text, Icon }) {
    return (
        <div className='text-center py-12 text-gray-500'>
            <p className='text-xl font-semibold text-gray-400'>{text}</p>
            {Icon && <Icon className='h-12 w-12 mx-auto mt-4 text-gray-400' />}
        </div>
    )
}

export function DashboardPagination({ setPageAndType, type, page, pages }) {
    return (
        <Pagination className={"cursor-pointer select-none"}>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => {
                            if (page > 1) {
                                setPageAndType([type, page - 1])
                            }
                        }}
                        className="text-xl"

                    >
                        previos
                    </PaginationPrevious>
                </PaginationItem>

                <PaginationLinks pages={pages} type={type} page={page} setPageAndType={setPageAndType} />

                <PaginationItem>
                    <PaginationNext
                        onClick={() => {
                            if (page < pages) {
                                setPageAndType([type, page + 1])
                            }
                        }}
                        className="text-xl"

                    >
                        Next
                    </PaginationNext>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}

function PaginationLinks({ pages, page, setPageAndType, type }) {
    if (pages <= 7) {

        return (
            [...Array.from({ length: pages })].map((_, i) => (
                <PaginationItem key={`page-${i + 1}`}>
                    <PaginationLink
                        onClick={() => {
                            // if (page !== i + 1) {
                            setPageAndType([type, i + 1])
                            // }
                        }}
                        className={`${i + 1 === page ? "bg-neutral-200" : "bg-neutral-50"}`}
                        isActive={i + 1 === page}
                    >
                        {i + 1}
                    </PaginationLink>
                </PaginationItem>
            ))
        );
    }

    if (page <= 5) {
        return (
            <>
                {[...Array.from({ length: 6 })].map((_, i) => (
                    <PaginationItem key={`page-${i + 1}`}>
                        <PaginationLink
                            className={`${i + 1 === page ? "bg-neutral-200" : "bg-neutral-50"}`}
                            onClick={() => {
                                if (page !== i + 1) {
                                    setPageAndType([type, i + 1])
                                }
                            }}
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
                        onClick={() => {
                            if (page !== pages) {
                                setPageAndType([type, pages])
                            }
                        }}
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
                        onClick={() => {
                            if (page !== 1) {
                                setPageAndType([type, 1])
                            }
                        }}
                        className={`${page === 1 ? "bg-neutral-200" : "bg-neutral-50"}`}
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
                                onClick={() => {
                                    if (page !== PAGE) {
                                        setPageAndType([type, PAGE])
                                    }
                                }}
                                className={`${PAGE === page ? "bg-neutral-200" : "bg-neutral-50"}`}
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
                    onClick={() => {
                        if (page !== 1) {
                            setPageAndType([type, 1])
                        }
                    }}
                    isActive={page === 1}
                >
                    1
                </PaginationLink>
            </PaginationItem>

            <PaginationItem><PaginationEllipsis /></PaginationItem>

            <PaginationItem>
                <PaginationLink
                    onClick={() => {
                        setPageAndType([type, page - 1])
                    }}
                >{page - 1}</PaginationLink>
            </PaginationItem>

            <PaginationItem>
                <PaginationLink
                    className="bg-neutral-200"
                    isActive={true}
                >
                    {page}
                </PaginationLink>
            </PaginationItem>

            <PaginationItem>
                <PaginationLink
                    onClick={() => {
                        setPageAndType([type, page + 1])
                    }}
                >

                    {page + 1}
                </PaginationLink>
            </PaginationItem>

            <PaginationItem><PaginationEllipsis /></PaginationItem>

            <PaginationItem key="last">
                <PaginationLink
                    onClick={() => {
                        if (page !== pages) {
                            setPageAndType([type, pages])
                        }
                    }}
                    isActive={pages === page}
                >
                    {pages}
                </PaginationLink>
            </PaginationItem>
        </>
    );
}




