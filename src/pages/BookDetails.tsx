import React, { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookSource } from '@/types/book';
import { ArrowLeft, BookOpen, Calendar, Building, Hash, Globe, Tag, Star, Plus, Edit, Trash2, PenSquare } from 'lucide-react';
import TopBar from '@/components/TopBar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { getBookById } from '@/services/bookService';
import { useUser } from '@/contexts/UserContext';
import { isBookInCollection, getBookStatus, removeFromCollection } from '@/services/userBookService';
import ReviewSection from '@/components/ReviewSection';
import { BookFormDialog } from '@/components/BookFormDialog';
import { AddToLibraryDialog } from '@/components/AddToLibraryDialog';
import { EditLibraryDialog } from '@/components/EditLibraryDialog';

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') as BookSource || 'libro';
  const navigate = useNavigate();
  const { session } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editCollectionDialogOpen, setEditCollectionDialogOpen] = useState(false);
  const [editBookDialogOpen, setEditBookDialogOpen] = useState(false);
  
  const { data: book, isLoading: bookLoading } = useQuery({
    queryKey: ['book', id, source],
    queryFn: () => getBookById(id || '', source),
    enabled: !!id,
  });

  const { data: isInCollection, isLoading: collectionCheckLoading } = useQuery({
    queryKey: ['bookInCollection', id],
    queryFn: () => isBookInCollection(id || ''),
    enabled: !!id && !!session,
  });

  const { data: bookStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['bookStatus', id],
    queryFn: () => getBookStatus(id || ''),
    enabled: !!id && !!session && isInCollection,
  });

  const isLoading = bookLoading || collectionCheckLoading || statusLoading;

  const handleRemoveFromCollection = async () => {
    if (!id || !session) return;

    try {
      await removeFromCollection(id);
      await queryClient.invalidateQueries({ queryKey: ['bookInCollection', id] });
      await queryClient.invalidateQueries({ queryKey: ['userBooks'] });
      toast({
        title: 'Success',
        description: 'Book removed from collection.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove book from collection',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <div className="flex-1 flex justify-center items-center">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Book not found</h2>
            <button
              onClick={() => navigate(-1)}
              className="text-book hover:underline"
            >
              Go back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 container mx-auto px-4 py-8 animate-fade-up">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-book"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="aspect-[2/3] bg-book-light rounded-lg overflow-hidden shadow-md border border-gray-100">
              {book.coverImage ? (
                <img 
                  src={book.coverImage} 
                  alt={`${book.title} cover`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-book-light">
                  <BookOpen className="h-16 w-16 text-book opacity-50" />
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-semibold">{book.title}</h1>
                  {session && book.source === 'libro' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setEditBookDialogOpen(true)}
                    >
                      <PenSquare className="h-4 w-4" />
                      Edit Book
                    </Button>
                  )}
                </div>
                {session && (
                  <div className="flex items-center gap-2">
                    {isInCollection ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => setEditCollectionDialogOpen(true)}
                        >
                          <Edit className="h-4 w-4" />
                          Update Status
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={handleRemoveFromCollection}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove from Library
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setAddDialogOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add to Library
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-lg text-gray-700">
                By {book.authors?.map((author, index) => (
                  <React.Fragment key={author}>
                    <Link 
                      to={`/author/${encodeURIComponent(author)}`} 
                      className="text-book hover:underline"
                    >
                      {author}
                    </Link>
                    {index < book.authors.length - 1 && ', '}
                  </React.Fragment>
                ))}
              </p>
            </div>
            
            {book.description && (
              <div className="mb-8">
                <h2 className="text-xl font-medium mb-3">About the Book</h2>
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: book.description }}
                />
              </div>
            )}
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {book.publishedDate && (
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Published</p>
                    <p className="text-gray-700">{book.publishedDate}</p>
                  </div>
                </div>
              )}
              
              {book.publisher && (
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Publisher</p>
                    <p className="text-gray-700">{book.publisher}</p>
                  </div>
                </div>
              )}
              
              {book.pageCount && (
                <div className="flex items-start">
                  <BookOpen className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Pages</p>
                    <p className="text-gray-700">{book.pageCount}</p>
                  </div>
                </div>
              )}
              
              {book.language && (
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Language</p>
                    <p className="text-gray-700">{book.language.toUpperCase()}</p>
                  </div>
                </div>
              )}

              {book.isbn10 && (
                <div className="flex items-start">
                  <Hash className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ISBN-10</p>
                    <p className="text-gray-700">{book.isbn10}</p>
                  </div>
                </div>
              )}

              {book.isbn13 && (
                <div className="flex items-start">
                  <Hash className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ISBN-13</p>
                    <p className="text-gray-700">{book.isbn13}</p>
                  </div>
                </div>
              )}

              {book.categories && book.categories.length > 0 && (
                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Categories</p>
                    <ul className="text-gray-700 list-none space-y-1">
                      {book.categories.map((category, index) => (
                        <li key={index}>{category}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-8" />
        
        <ReviewSection bookId={id || ''} />
      </main>

      {session && (
        <>
            <AddToLibraryDialog
              open={addDialogOpen}
              onClose={() => setAddDialogOpen(false)}
              bookId={id || ''}
              bookTitle={book.title}
              source={book.source}
            />
          {bookStatus && (
            <EditLibraryDialog
              open={editCollectionDialogOpen}
              onClose={() => setEditCollectionDialogOpen(false)}
              bookId={id || ''}
              bookTitle={book.title}
              currentOwnershipStatus={bookStatus.ownershipStatus}
              currentReadingStatus={bookStatus.readingStatus}
            />
          )}
          {book.source === 'libro' && (
            <BookFormDialog
              book={book}
              open={editBookDialogOpen}
              onClose={() => setEditBookDialogOpen(false)}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['book', id] });
                toast({
                  title: 'Success',
                  description: 'Book updated successfully',
                });
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BookDetails;
