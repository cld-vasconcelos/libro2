import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { BookSource } from '@/types/book';
import { useUser } from '@/contexts/UserContext';
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import TopBar from '@/components/TopBar';
import Spinner from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getUserBooks, getAllUserBooks, importCollectionFromCsv, OwnershipStatus, ReadingStatus } from '@/services/userBookService';
import { useToast } from '@/hooks/use-toast';
import LibraryBookCard from '@/components/LibraryBookCard';

const ownershipStatuses: OwnershipStatus[] = [
  'Owned',
  'Wishlist',
  'Borrowed',
  'Lent Out',
  'Digital',
  'Gifted',
];

const readingStatuses: ReadingStatus[] = [
  'Not Started',
  'Reading',
  'Paused',
  'Completed',
  'Abandoned',
  'Re-reading',
];

const Library = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { session, isLoading: isSessionLoading } = useUser();
  const navigate = useNavigate();
  const [selectedOwnership, setSelectedOwnership] = useState<OwnershipStatus | 'all'>('all');
  const [selectedReading, setSelectedReading] = useState<ReadingStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);

  // Handle beforeunload event when import is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (importProgress !== null) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [importProgress]);

  const handlePageChange = (newPage: number) => {
    if (!isNaN(newPage) && newPage > 0) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    if (!isNaN(newSize) && newSize > 0) {
      setPageSize(newSize);
      setPage(1); // Reset to first page when changing page size
    }
  };

  // Reset page when session changes
  useEffect(() => {
    setPage(1);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate('/login');
    }
  }, [session, isSessionLoading, navigate]);

  const { data: booksData, isLoading, error } = useQuery({
    queryKey: ['userBooks', session?.user?.id, page, pageSize],
    queryFn: async () => {
      if (!page || !pageSize || isNaN(page) || isNaN(pageSize)) {
        console.error('Invalid pagination params:', { page, pageSize });
          return getUserBooks(1, DEFAULT_PAGE_SIZE);
      }
      return getUserBooks(page, pageSize);
    },
    enabled: !!session,
  });

  const books = booksData?.books || [];
  const totalBooks = booksData?.total || 0;
  const totalPages = Math.ceil(totalBooks / pageSize);

  const filteredBooks = books.filter((book) => {
    const matchesOwnership = selectedOwnership === 'all' || book.ownership_status === selectedOwnership;
    const matchesReading = selectedReading === 'all' || book.reading_status === selectedReading;
    return matchesOwnership && matchesReading;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      
      <main className="flex-1 container mx-auto px-4 py-8 animate-fade-up">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Library</h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const content = await file.text();
                        // Calculate total rows before starting import
                        const lines = content.split('\n');
                        const totalRows = lines.slice(1).filter(line => line.trim()).length;
                        setImportProgress({ current: 0, total: totalRows }); // Initialize progress with actual total
                        const result = await importCollectionFromCsv(content, (progress) => {
                          setImportProgress(progress);
                        });
                        setImportProgress(null); // Clear progress
                        toast({
                          title: 'Import Complete',
                          description: `Successfully imported ${result.success} books. ${
                            result.failed.length > 0 
                              ? `Failed to import ${result.failed.length} books.`
                              : ''
                          }`,
                          variant: result.failed.length > 0 ? 'default' : 'default',
                        });
                        if (result.failed.length > 0) {
                          console.error('Failed imports:', result.failed);
                        }
                        // Invalidate and refetch books query to show new books
                        await queryClient.invalidateQueries({ queryKey: ['userBooks'] });
                      } catch (error) {
                        setImportProgress(null); // Clear progress on error
                        toast({
                          title: 'Import Failed',
                          description: error instanceof Error ? error.message : 'Failed to import collection',
                          variant: 'destructive',
                        });
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={importProgress !== null}
                />
                <Button variant="outline" disabled={importProgress !== null}>
                  {importProgress ? 'Importing...' : 'Import library'}
                </Button>
              </div>
              <Button
                variant="outline"
                disabled={!books?.length || importProgress !== null}
                onClick={async () => {
                  const allBooks = await getAllUserBooks();
                  const csv = [
                    ['Title', 'Authors', 'Description', 'Published date', 'Publisher', 'Number of pages', 'Language', 'ISBN-10', 'ISBN-13', 'Categories', 'Ownership Status', 'Reading Status'].join(','),
                    ...allBooks.map(book => [
                      book.bookDetails.title,
                      book.bookDetails.authors?.join('; '),
                      book.bookDetails.description || '',
                      book.bookDetails.publishedDate || '',
                      book.bookDetails.publisher || '',
                      book.bookDetails.pageCount?.toString() || '',
                      book.bookDetails.language || '',
                      book.bookDetails.isbn10 || '',
                      book.bookDetails.isbn13 || '',
                      book.bookDetails.categories?.join('; ') || '',
                      book.ownership_status,
                      book.reading_status
                    ].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(','))
                  ].join('\n');

                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.setAttribute('hidden', '');
                  a.setAttribute('href', url);
                  const now = new Date();
                  const timestamp = now.getFullYear().toString() +
                    (now.getMonth() + 1).toString().padStart(2, '0') +
                    now.getDate().toString().padStart(2, '0') +
                    now.getHours().toString().padStart(2, '0') +
                    now.getMinutes().toString().padStart(2, '0');
                  a.setAttribute('download', `libro_library_export_${timestamp}.csv`);
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                Export library
              </Button>
            </div>
          </div>
          {importProgress && (
            <div className="mt-4">
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                <span>Importing books...</span>
                <span>
                  {importProgress.current} / {importProgress.total}
                </span>
              </div>
              <Progress
                value={(importProgress.current / importProgress.total) * 100}
                className="w-full"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <p className="text-gray-600">
              {isLoading ? 'Loading library...' : 
                error ? 'Error loading library' :
                !totalBooks ? 'No books in your library yet' : 
                `${totalBooks} book${totalBooks === 1 ? '' : 's'} in your library`}
            </p>
            {error && (
              <p className="text-red-500 text-sm mt-2">
                {error instanceof Error ? error.message : 'Failed to load books'}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex sm:flex-row items-center gap-8">
              <div className="flex items-center gap-4">
                <Label className="text-gray-600">Ownership Status</Label>
                <Select 
                  value={selectedOwnership} 
                  onValueChange={(value) => setSelectedOwnership(value as OwnershipStatus | 'all')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All ownership types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {ownershipStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-gray-600">Reading Status</Label>
                <Select 
                  value={selectedReading} 
                  onValueChange={(value) => setSelectedReading(value as ReadingStatus | 'all')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All reading status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {readingStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:ml-8">
              <span className="text-sm text-gray-600">Books per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
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
        </div>

        {isLoading || isSessionLoading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : !filteredBooks.length ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-book/10 mb-4">
              <BookOpen className="h-8 w-8 text-book" />
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">Your library is empty</h2>
            <p className="text-gray-500">
              Start adding books to your library by searching for them
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {filteredBooks.map((book) => (
              <LibraryBookCard
                key={book.id}
                book={{
                  id: book.book_id,
                  title: book.bookDetails.title,
                  authors: book.bookDetails.authors,
                  coverImage: book.bookDetails.coverImage,
                  source: book.source as BookSource,
                }}
                ownershipStatus={book.ownership_status}
                readingStatus={book.reading_status}
              />
            ))}
            </div>

            {totalPages > 1 && (
              <Pagination>
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

export default Library;
