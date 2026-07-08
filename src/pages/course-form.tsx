import { Layout } from "@/components/layout";
import { useGetCourse, useCreateCourse, useUpdateCourse, getListCoursesQueryKey, getGetCourseQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseInputStatus } from "@workspace/api-client-react/src/generated/api.schemas";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  provider: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  progressPercent: z.coerce.number().min(0).max(100).optional(),
  completedLessons: z.coerce.number().min(0).optional(),
  totalLessons: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CourseForm() {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const isNew = !params.id || params.id === "new";
  const courseId = isNew ? null : Number(params.id);

  const { data: course, isLoading: isCourseLoading } = useGetCourse(courseId!, {
    query: {
      enabled: !isNew && !!courseId,
      queryKey: getGetCourseQueryKey(courseId!),
    }
  });

  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      provider: "",
      description: "",
      status: "not_started",
      progressPercent: 0,
      completedLessons: 0,
      totalLessons: 0,
    },
  });

  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        provider: course.provider || "",
        description: course.description || "",
        status: course.status,
        progressPercent: course.progressPercent,
        completedLessons: course.completedLessons || 0,
        totalLessons: course.totalLessons || 0,
      });
    }
  }, [course, form]);

  const onSubmit = (values: FormValues) => {
    const data = {
      ...values,
      provider: values.provider || undefined,
      description: values.description || undefined,
      status: values.status as CourseInputStatus,
      progressPercent: values.progressPercent || 0,
      completedLessons: values.completedLessons || undefined,
      totalLessons: values.totalLessons || undefined,
    };

    // Auto-adjust progress percent if we have lesson counts and user didn't manually set 100 on completion
    if (data.status === "completed") {
      data.progressPercent = 100;
    } else if (data.completedLessons !== undefined && data.totalLessons && data.totalLessons > 0) {
      data.progressPercent = Math.round((data.completedLessons / data.totalLessons) * 100);
    }

    if (isNew) {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast.success("Course added");
          queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          setLocation("/courses");
        },
        onError: () => {
          toast.error("Failed to add course");
        }
      });
    } else {
      updateMutation.mutate({ id: courseId!, data }, {
        onSuccess: () => {
          toast.success("Course updated");
          queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetCourseQueryKey(courseId!) });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          setLocation("/courses");
        },
        onError: () => {
          toast.error("Failed to update course");
        }
      });
    }
  };

  if (!isNew && isCourseLoading) {
    return (
      <Layout>
        <div className="p-6 md:p-10 animate-pulse space-y-6">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded max-w-md"></div>
          <div className="h-32 bg-muted rounded max-w-md"></div>
        </div>
      </Layout>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Layout>
      <div className="p-6 md:p-10 lg:p-12 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link href="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to learning
        </Link>
        
        <header className="mb-8">
          <h1 className="text-3xl font-light text-foreground mb-2 tracking-tight">
            {isNew ? "Track New Learning" : "Edit Course"}
          </h1>
          <p className="text-muted-foreground">
            {isNew ? "Add a new course, book, or tutorial to track." : "Update your progress."}
          </p>
        </header>

        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduction to Typography" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider / Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Coursera, O'Reilly..." {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_started">Not Started</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="progressPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Progress (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="completedLessons"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completed</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="e.g. 5" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="totalLessons"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Lessons</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" placeholder="e.g. 20" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Motivation</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Why are you taking this? What do you hope to learn?" 
                        className="min-h-[100px] bg-background resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setLocation("/courses")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : isNew ? "Track Course" : "Update Course"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}