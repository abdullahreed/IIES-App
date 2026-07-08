import { Layout } from "@/components/layout";
import { useListCourses, useDeleteCourse, getListCoursesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Clock, CheckCircle2, Trash2, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";

export function Courses() {
  const { data: courses, isLoading } = useListCourses();
  const deleteMutation = useDeleteCourse();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Course deleted");
        queryClient.invalidateQueries({ queryKey: getListCoursesQueryKey() });
      },
      onError: () => {
        toast.error("Failed to delete course");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-[#dce5b5] text-[#2a3a0e] hover:bg-[#dce5b5] border-none font-light">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="bg-[#e6d9b0] text-[#4a3410] hover:bg-[#e6d9b0] border-none font-light">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground font-light">
            <BookOpen className="w-3 h-3 mr-1" /> Not Started
          </Badge>
        );
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 lg:p-12 min-h-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2 tracking-tight">Learning</h1>
            <p className="text-muted-foreground font-light">Track your courses, books, and educational progress.</p>
          </div>
          <Link href="/courses/new" className="inline-flex h-10 items-center justify-center rounded-md bg-[#3d5216] px-4 py-2 text-sm font-light text-[#f0f0e8] shadow hover:bg-[#2d3d10] transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Link>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-card rounded-lg border border-border animate-pulse" />
            ))}
          </div>
        ) : courses?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-[#c8d49a] rounded-lg">
            <div className="w-16 h-16 bg-[#edf2d8] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-[#4a5e20]" />
            </div>
            <h3 className="text-lg font-normal text-foreground mb-1">No courses tracked yet</h3>
            <p className="text-muted-foreground font-light mb-6">
              Start tracking your learning journey by adding a course or book.
            </p>
            <Link href="/courses/new">
              <Button variant="outline" className="border-[#b0c47a] text-[#3d5216] hover:bg-[#edf2d8]">Add Course</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courses?.map((course, i) => (
              <div
                key={course.id}
                className="bg-card border border-border rounded-lg p-5 hover:border-[#8fa840]/40 transition-all shadow-sm group animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 50}ms`, fillMode: 'both' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-normal text-foreground">{course.title}</h3>
                      {getStatusBadge(course.status)}
                    </div>

                    {course.provider && (
                      <div className="text-sm font-light text-[#6b7a40] mb-3">
                        {course.provider}
                      </div>
                    )}

                    {course.description && (
                      <p className="text-sm font-light text-muted-foreground/90 line-clamp-2 mb-4 max-w-2xl">
                        {course.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 max-w-md">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground font-light">Progress</span>
                          <span
                            className="font-medium"
                            style={{ color: course.status === 'completed' ? '#2a3a0e' : '#4a5e20' }}
                          >
                            {course.progressPercent}%
                          </span>
                        </div>
                        <Progress
                          value={course.progressPercent}
                          className="h-2 bg-[#e8efd4]"
                          indicatorClassName={course.status === 'completed' ? 'bg-[#3d5216]' : 'bg-[#6b8a28]'}
                        />
                      </div>

                      {course.totalLessons ? (
                        <div className="text-xs font-light text-muted-foreground whitespace-nowrap min-w-[80px] text-right">
                          {course.completedLessons || 0} / {course.totalLessons} lessons
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex gap-1 self-end sm:self-start">
                    <Link href={`/courses/${course.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#3d5216]">
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
                          <AlertDialogTitle>Delete Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to stop tracking "{course.title}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(course.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
