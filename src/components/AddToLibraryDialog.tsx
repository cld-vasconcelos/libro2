import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { addBookToCollection, OwnershipStatus, ReadingStatus } from '@/services/userBookService';
import { BookSource } from '@/types/book';

interface AddToLibraryDialogProps {
  open: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  source: BookSource;
}

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

export function AddToLibraryDialog({ open, onClose, bookId, bookTitle, source }: AddToLibraryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [ownershipStatus, setOwnershipStatus] = useState<OwnershipStatus>('Owned');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>('Not Started');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addBookToCollection({
        bookId,
        source,
        ownershipStatus,
        readingStatus,
      });
      await queryClient.invalidateQueries({ queryKey: ['bookInCollection', bookId] });
      await queryClient.invalidateQueries({ queryKey: ['userBooks'] });
      toast({
        title: 'Success',
        description: 'Book added to your library.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add book to library',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Library</DialogTitle>
          <DialogDescription>
            Add "{bookTitle}" to your library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ownership Status</Label>
            <Select
              value={ownershipStatus}
              onValueChange={(value) => setOwnershipStatus(value as OwnershipStatus)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ownershipStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reading Status</Label>
            <Select
              value={readingStatus}
              onValueChange={(value) => setReadingStatus(value as ReadingStatus)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {readingStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add to Library'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
