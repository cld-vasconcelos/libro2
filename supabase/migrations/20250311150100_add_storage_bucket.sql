-- Create bucket with proper configuration
insert into storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
values (
        'book-covers',
        'book-covers',
        true,
        52428800,
        -- 50MB limit
        array ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    ) on conflict (id) do
update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
-- Set up security policies
create policy "Book covers are publicly accessible" on storage.objects for
select using (bucket_id = 'book-covers');
create policy "Authenticated users can upload book covers" on storage.objects for
insert with check (
        bucket_id = 'book-covers'
        and auth.role() = 'authenticated'
    );
create policy "Users can update their own book covers" on storage.objects for
update using (
        bucket_id = 'book-covers'
        and auth.uid() = owner
    );
create policy "Users can delete their own book covers" on storage.objects for delete using (
    bucket_id = 'book-covers'
    and auth.uid() = owner
);
create policy "Set owner on upload" on storage.objects for
insert with check (
        bucket_id = 'book-covers'
        and owner = auth.uid()
    );