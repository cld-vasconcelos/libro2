
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import TopBar from '@/components/TopBar';
import BookGrid from '@/components/BookGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuthorByName } from '@/services/bookService';
import { Author } from '@/types/book';

const AuthorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const decodedName = id ? decodeURIComponent(id).trim() : '';

  // Redirect if no name provided
  useEffect(() => {
    if (!decodedName) {
      navigate('/');
    }
  }, [decodedName, navigate]);
  
  const { data: author, isLoading } = useQuery({
    queryKey: ['author', decodedName],
    queryFn: () => getAuthorByName(decodedName),
    enabled: !!decodedName,
  });
  
  const displayAuthor = author;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3]" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!displayAuthor) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-medium text-gray-700 mb-4">Author not found</h2>
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
        
        <div>
          <h1 className="text-3xl font-semibold mb-8">{displayAuthor.name}</h1>
          
          <h2 className="text-2xl font-semibold mb-6">Books by {displayAuthor.name}</h2>
          
          {displayAuthor.books && displayAuthor.books.length > 0 ? (
            <BookGrid books={displayAuthor.books} />
          ) : (
            <p className="text-center text-gray-600 py-8">No books found for this author.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthorDetails;
