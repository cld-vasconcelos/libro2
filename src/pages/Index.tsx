
import React from 'react';
import TopBar from '@/components/TopBar';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 container mx-auto px-4 py-8 animate-fade-up flex items-center justify-center">
        <section>
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 leading-tight">
              Discover Your Next <span className="text-book-DEFAULT">Favorite Book</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated collection of books and find your next literary adventure. 
              Search by title, author, or genre to begin your journey.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
