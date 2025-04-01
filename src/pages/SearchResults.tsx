import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import TopBar from '@/components/TopBar';
import BookGrid from '@/components/BookGrid';
import { searchBooks } from '@/services/bookService';
import Spinner from '@/components/ui/spinner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const searchType = searchParams.get('type') as 'general' | 'isbn' || 'general';
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE;

  const { data, isLoading } = useQuery({
    queryKey: ['searchBooks', query, searchType, page, pageSize],
    queryFn: () => searchBooks(query, page, pageSize, searchType),
    enabled: !!query,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 0;

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('page', newPage.toString());
      return params;
    });
  };

  const handlePageSizeChange = (value: string) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('pageSize', value);
      params.set('page', '1'); // Reset to first page when changing page size
      return params;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <main className="flex-1 container mx-auto px-4 py-8 animate-fade-up">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">
              Search Results for <span className="text-book">"{query}"</span>
            </h1>
            <p className="text-gray-600">
              {isLoading ? 'Searching...' : 
                !query ? 'Enter a search term to find books' :
                !data?.books.length ? 'No books found' : 
                `Found ${data?.total} books`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Results per page:</span>
            <Select defaultValue={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <BookGrid books={data?.books || []} />

            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page - 1);
                        }}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <PaginationItem>
                            <span className="px-4">...</span>
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={page === p}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(p);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    ))}

                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page + 1);
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
