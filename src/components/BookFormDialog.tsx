import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createBook, updateBook } from '@/services/libroBookService';
import { Book } from '@/types/book';

const newBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  authors: z.array(z.string()).min(1, 'At least one author is required'),
  description: z.string().min(1, 'Description is required'),
  publishedDate: z.string()
    .min(1, 'Published date is required')
    .refine(date => new Date(date) <= new Date(), {
      message: 'Published date cannot be in the future'
    }),
  publisher: z.string().min(1, 'Publisher is required'),
  pageCount: z.number().min(1, 'Page count must be greater than 0'),
  language: z.string().min(1, 'Language is required'),
  isbn10: z.string().length(10, 'ISBN-10 must be 10 characters'),
  isbn13: z.string().length(13, 'ISBN-13 must be 13 characters'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  coverImage: z.instanceof(File).optional(),
});

const editBookSchema = z.object({
  title: z.string().optional(),
  authors: z.array(z.string()).optional(),
  description: z.string().optional(),
  publishedDate: z.string()
    .optional()
    .refine(date => !date || new Date(date) <= new Date(), {
      message: 'Published date cannot be in the future'
    }),
  publisher: z.string().optional(),
  pageCount: z.coerce.number().optional(),
  language: z.string().optional(),
  categories: z.array(z.string()).optional(),
  coverImage: z.instanceof(File).optional(),
});

type NewBookData = z.infer<typeof newBookSchema>;
type EditBookData = z.infer<typeof editBookSchema>;
type FormData = NewBookData & EditBookData;

const getValidationSchema = (isEditing: boolean) => 
  isEditing ? editBookSchema : newBookSchema;

interface BookFormDialogProps {
  open: boolean;
  onClose: () => void;
  book?: Book;
  onSuccess?: () => void;
}

export function BookFormDialog({ open, onClose, book, onSuccess }: BookFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tempAuthor, setTempAuthor] = useState('');
  const [tempCategory, setTempCategory] = useState('');
  
  const form = useForm<FormData>({
    resolver: zodResolver(getValidationSchema(!!book)),
    defaultValues: {
      title: '',
      authors: [],
      description: '',
      publishedDate: '',
      publisher: '',
      pageCount: 0,
      language: '',
      isbn10: '',
      isbn13: '',
      categories: [],
    },
  });

  useEffect(() => {
    if (book) {
      form.reset({
        title: book.title || '',
        authors: book.authors || [],
        description: book.description || '',
        publishedDate: book.publishedDate || '',
        publisher: book.publisher || '',
        pageCount: book.pageCount || 0,
        language: book.language || '',
        isbn10: book.isbn10 || '',
        isbn13: book.isbn13 || '',
        categories: book.categories || [],
      });
    }
  }, [book, form]);

  const onSubmit = async ({
    title,
    authors,
    description,
    publishedDate,
    publisher,
    pageCount,
    language,
    isbn10,
    isbn13,
    categories,
    coverImage
  }: FormData) => {
    setLoading(true);
    try {
      if (book) {
        await updateBook({
          id: book.id,
          title,
          authors,
          description,
          publishedDate,
          publisher,
          pageCount,
          language,
          categories,
          coverImage,
        });
        toast({
          title: 'Success',
          description: 'Book updated successfully.',
        });
      } else {
        await createBook({
          title,
          authors,
          description,
          publishedDate,
          publisher,
          pageCount,
          language,
          isbn10,
          isbn13,
          categories,
          coverImage,
        });
        toast({
          title: 'Success',
          description: 'Book created successfully.',
        });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save book',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorAdd = () => {
    if (tempAuthor.trim()) {
      const currentAuthors = form.getValues('authors');
      form.setValue('authors', [...currentAuthors, tempAuthor.trim()]);
      setTempAuthor('');
    }
  };

  const handleAuthorRemove = (index: number) => {
    const currentAuthors = form.getValues('authors');
    form.setValue('authors', currentAuthors.filter((_, i) => i !== index));
  };

  const handleCategoryAdd = () => {
    if (tempCategory.trim()) {
      const currentCategories = form.getValues('categories');
      form.setValue('categories', [...currentCategories, tempCategory.trim()]);
      setTempCategory('');
    }
  };

  const handleCategoryRemove = (index: number) => {
    const currentCategories = form.getValues('categories');
    form.setValue('categories', currentCategories.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          <DialogDescription>
            {book ? 'Update the book details below.' : 'Fill in the book details below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authors"
              render={() => (
                <FormItem>
                  <FormLabel>Authors</FormLabel>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tempAuthor}
                      onChange={(e) => setTempAuthor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAuthorAdd();
                        }
                      }}
                      placeholder="Type and press Enter"
                    />
                    <Button type="button" onClick={handleAuthorAdd}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.getValues('authors').map((author, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1"
                      >
                        <span className="text-sm">{author}</span>
                        <button
                          type="button"
                          onClick={() => handleAuthorRemove(index)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="publishedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Published Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publisher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isbn10"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISBN-10</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isbn13"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISBN-13</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
              name="pageCount"
              render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Page Count</FormLabel>
                    <FormControl>
                      <Input 
                      type="number"
                      {...field}
                      onChange={(e) => onChange(Number(e.target.value))}
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="en" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categories"
              render={() => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tempCategory}
                      onChange={(e) => setTempCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCategoryAdd();
                        }
                      }}
                      placeholder="Type and press Enter"
                    />
                    <Button type="button" onClick={handleCategoryAdd}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.getValues('categories').map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1"
                      >
                        <span className="text-sm">{category}</span>
                        <button
                          type="button"
                          onClick={() => handleCategoryRemove(index)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImage"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files?.[0])}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : book ? 'Save Changes' : 'Create Book'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
