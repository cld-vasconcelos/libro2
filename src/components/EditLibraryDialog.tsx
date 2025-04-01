import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
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
import { updateBookInCollection, OwnershipStatus, ReadingStatus } from '@/services/userBookService';

interface EditLibraryDialogProps {
  open: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  currentOwnershipStatus: OwnershipStatus;
  currentReadingStatus: ReadingStatus;
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

export function EditLibraryDialog({ 
  open, 
  onClose, 
  bookId, 
  bookTitle,
  currentOwnershipStatus,
  currentReadingStatus 
}: EditLibraryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [ownershipStatus, setOwnershipStatus] = useState<OwnershipStatus>(currentOwnershipStatus);
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(currentReadingStatus);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateBookInCollection({
        bookId,
        ownershipStatus,
        readingStatus,
      });
      toast({
        title: 'Success',
        description: 'Book status updated in your library.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update book status',
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
          <DialogTitle>Update Library Status</DialogTitle>
          <DialogDescription>
            Update status for "{bookTitle}" in your library
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
              <SelectTrigger data-testid="select-trigger-ownership">
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
              <SelectTrigger data-testid="select-trigger-reading">
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
