import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Star, LogIn, BookCopy, Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { getInitials } from '@/lib/utils/user';
import { signOut } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookFormDialog } from './BookFormDialog';
import { ThemeToggle } from './ThemeToggle';

const TopBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addBookOpen, setAddBookOpen] = useState(false);
  const navigate = useNavigate();
  const { session } = useUser();
  const { toast } = useToast();

const isISBN = (str: string): boolean => {
  // Remove hyphens and spaces
  const cleaned = str.replace(/[-\s]/g, '');
  
  // ISBN-10: 10 digits (can end with X)
  const isbn10Regex = /^(?:\d{9}[\dX])$/;
  // ISBN-13: 13 digits (typically starts with 978 or 979)
  const isbn13Regex = /^(?:978|979)\d{10}$/;
  
  return isbn10Regex.test(cleaned) || isbn13Regex.test(cleaned);
};

const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  const query = searchQuery.trim();
  if (query) {
    const isIsbnSearch = isISBN(query);
    const searchType = isIsbnSearch ? 'isbn' : 'general';
    navigate(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
  }
};

  return (
    <>
      <div className="sticky top-0 z-10 w-full bg-background/90 backdrop-blur-sm border-b border-border py-3">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl font-semibold text-book-DEFAULT">Libro</span>
            </a>
          </div>
          
          <div className="flex flex-1 max-w-xl mx-4 items-center gap-2">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for books, authors, or topics..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:border-book-DEFAULT focus:ring-book-DEFAULT"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-book-DEFAULT"
                >
                  Search
                </Button>
              </div>
            </form>
            {session && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap"
                onClick={() => setAddBookOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-10 h-10 p-0 hover:bg-transparent rounded-full focus-visible:ring-offset-0"
                >
                  {session ? (
                    <div className="w-full h-full rounded-full bg-book flex items-center justify-center transition-colors hover:bg-book-dark">
                      <span className="text-sm text-white font-semibold tracking-wider">
                        {getInitials(session.user.email)}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full border border-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600 transition-colors hover:text-book" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!session ? (
                  <DropdownMenuItem onClick={() => navigate('/login')}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/library')}>
                      <BookCopy className="h-4 w-4 mr-2" />
                      My Library
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/reviews')}>
                      <Star className="h-4 w-4 mr-2" />
                      My Reviews
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={async () => {
                        try {
                          await signOut();
                          toast({
                            title: "Success",
                            description: "You have been logged out successfully.",
                          });
                          navigate('/');
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to logout",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {session && (
        <BookFormDialog 
          open={addBookOpen}
          onClose={() => setAddBookOpen(false)}
          onSuccess={() => {
            toast({
              title: "Success",
              description: "Book added successfully.",
            });
          }}
        />
      )}
    </>
  );
};

export default TopBar;
