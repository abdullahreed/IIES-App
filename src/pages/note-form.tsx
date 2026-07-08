import { Layout } from "@/components/layout";
import { useGetNote, useCreateNote, useUpdateNote, getListNotesQueryKey, getGetNoteQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NoteForm() {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const isNew = !params.id || params.id === "new";
  const noteId = isNew ? null : Number(params.id);

  const { data: note, isLoading: isNoteLoading } = useGetNote(noteId!, {
    query: {
      enabled: !isNew && !!noteId,
      queryKey: getGetNoteQueryKey(noteId!),
    }
  });

  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  const initRef = useRef<number | null>(null);

  useEffect(() => {
    if (note && initRef.current !== noteId) {
      initRef.current = noteId;
      form.reset({
        title: note.title,
        content: note.content,
        tags: note.tags || "",
      });
    }
  }, [note, form, noteId]);

  const onSubmit = (values: FormValues) => {
    const data = {
      ...values,
      tags: values.tags || undefined,
    };

    if (isNew) {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast.success("Note saved");
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          setLocation("/notes");
        },
        onError: () => {
          toast.error("Failed to save note");
        }
      });
    } else {
      updateMutation.mutate({ id: noteId!, data }, {
        onSuccess: (updatedNote) => {
          toast.success("Note updated");
          // Local cache update to prevent flicker
          queryClient.setQueryData(getGetNoteQueryKey(noteId!), updatedNote);
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          setLocation("/notes");
        },
        onError: () => {
          toast.error("Failed to update note");
        }
      });
    }
  };

  if (!isNew && isNoteLoading) {
    return (
      <Layout>
        <div className="p-6 md:p-10 animate-pulse space-y-6">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded max-w-full"></div>
          <div className="h-64 bg-muted rounded max-w-full"></div>
        </div>
      </Layout>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Layout>
      <div className="p-6 md:p-10 lg:p-12 max-w-3xl h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link href="/notes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors self-start">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to notes
        </Link>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-6">
            
            <div className="flex justify-between items-start gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input 
                        placeholder="Note Title" 
                        {...field} 
                        className="bg-transparent border-none text-3xl font-light px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 shadow-none rounded-none tracking-tight" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isPending} className="shrink-0 gap-2">
                <Save className="w-4 h-4" />
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Add tags, separated by commas (e.g. design, ideas, todo)" 
                      {...field} 
                      className="bg-muted/30 border-dashed text-sm" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col">
                  <FormControl className="flex-1">
                    <Textarea 
                      placeholder="Start writing..." 
                      className="flex-1 min-h-[400px] bg-transparent border-none focus-visible:ring-0 p-0 text-base leading-relaxed resize-none shadow-none rounded-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </Layout>
  );
}