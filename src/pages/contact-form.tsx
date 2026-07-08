import { Layout } from "@/components/layout";
import { useGetContact, useCreateContact, useUpdateContact, getListContactsQueryKey, getGetContactQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactForm() {
  const params = useParams();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const isNew = !params.id || params.id === "new";
  const contactId = isNew ? null : Number(params.id);

  const { data: contact, isLoading: isContactLoading } = useGetContact(contactId!, {
    query: {
      enabled: !isNew && !!contactId,
      queryKey: getGetContactQueryKey(contactId!),
    }
  });

  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (contact) {
      form.reset({
        name: contact.name,
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        notes: contact.notes || "",
      });
    }
  }, [contact, form]);

  const onSubmit = (values: FormValues) => {
    const data = {
      ...values,
      email: values.email || undefined,
      phone: values.phone || undefined,
      company: values.company || undefined,
      notes: values.notes || undefined,
    };

    if (isNew) {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast.success("Contact created");
          queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
          setLocation("/contacts");
        },
        onError: () => {
          toast.error("Failed to create contact");
        }
      });
    } else {
      updateMutation.mutate({ id: contactId!, data }, {
        onSuccess: () => {
          toast.success("Contact updated");
          queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetContactQueryKey(contactId!) });
          setLocation("/contacts");
        },
        onError: () => {
          toast.error("Failed to update contact");
        }
      });
    }
  };

  if (!isNew && isContactLoading) {
    return (
      <Layout>
        <div className="p-6 md:p-10 animate-pulse space-y-6">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded max-w-md"></div>
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
        <Link href="/contacts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to contacts
        </Link>
        
        <header className="mb-8">
          <h1 className="text-3xl font-light text-foreground mb-2 tracking-tight">
            {isNew ? "New Contact" : "Edit Contact"}
          </h1>
          <p className="text-muted-foreground">
            {isNew ? "Add a new connection to your hub." : "Update details for this connection."}
          </p>
        </header>

        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jane@example.com" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Met at the design conference..." 
                        className="min-h-[120px] bg-background resize-y" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setLocation("/contacts")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : isNew ? "Save Contact" : "Update Contact"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
