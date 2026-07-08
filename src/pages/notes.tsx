import { Layout } from "@/components/layout";
import { useListNotes, useDeleteNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, NotebookPen, Trash2, Edit, Tag as TagIcon, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Notes() {
  const { data: notes, isLoading } = useListNotes();
  const deleteMutation = useDeleteNote();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const filteredNotes = notes?.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.tags?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Note deleted");
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
      },
      onError: () => {
        toast.error("Failed to delete note");
      }
    });
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 lg:p-12 min-h-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2 tracking-tight">Notes</h1>
            <p className="text-muted-foreground font-light">Thoughts, reflections, and personal development.</p>
          </div>
          <Link href="/notes/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-light text-primary-foreground shadow hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Write Note
          </Link>
        </header>

        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes or tags..."
            className="pl-10 max-w-md bg-card font-light"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-card rounded-lg border border-border animate-pulse" />
            ))}
          </div>
        ) : filteredNotes?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-[#9dd0cc] rounded-lg">
            <div className="w-16 h-16 bg-[#d8f0ee] rounded-full flex items-center justify-center mx-auto mb-4">
              <NotebookPen className="w-8 h-8 text-[#2a7070]" />
            </div>
            <h3 className="text-lg font-normal text-foreground mb-1">No notes found</h3>
            <p className="text-muted-foreground font-light mb-6">
              {search ? "No notes match your search." : "Write down your first thought."}
            </p>
            {!search && (
              <Link href="/notes/new">
                <Button variant="outline" className="border-[#7dc0bc] text-primary hover:bg-[#d8f0ee]">Write Note</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {filteredNotes?.map((note, i) => (
              <div
                key={note.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all shadow-sm hover:shadow group animate-in fade-in slide-in-from-bottom-2 flex flex-col h-full"
                style={{ animationDelay: `${i * 50}ms`, fillMode: 'both' }}
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="text-xl font-normal text-foreground leading-tight">
                    {note.title}
                  </h3>

                  <div className="flex gap-1 -mt-2 -mr-2">
                    <Link href={`/notes/${note.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Note</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this note? This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(note.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="text-xs font-light text-muted-foreground mb-4">
                  {format(new Date(note.createdAt), 'MMM d, yyyy')}
                </div>

                <p className="text-sm font-light text-muted-foreground/90 whitespace-pre-wrap line-clamp-4 flex-grow mb-5">
                  {note.content}
                </p>

                {note.tags && (
                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/50">
                    {note.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded bg-[#c8e8e6] text-[#1a5250] text-[10px] font-medium uppercase tracking-wider">
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
