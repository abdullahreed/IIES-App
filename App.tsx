import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Dashboard } from "@/pages/dashboard";
import { Contacts } from "@/pages/contacts";
import { ContactForm } from "@/pages/contact-form";
import { Courses } from "@/pages/courses";
import { CourseForm } from "@/pages/course-form";
import { Notes } from "@/pages/notes";
import { NoteForm } from "@/pages/note-form";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      
      <Route path="/contacts" component={Contacts} />
      <Route path="/contacts/new" component={ContactForm} />
      <Route path="/contacts/:id" component={ContactForm} />
      
      <Route path="/courses" component={Courses} />
      <Route path="/courses/new" component={CourseForm} />
      <Route path="/courses/:id" component={CourseForm} />
      
      <Route path="/notes" component={Notes} />
      <Route path="/notes/new" component={NoteForm} />
      <Route path="/notes/:id" component={NoteForm} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
