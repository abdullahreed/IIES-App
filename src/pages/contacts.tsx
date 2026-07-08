import { Layout } from "@/components/layout";
import { useListContacts, useDeleteContact, getListContactsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Search, Building2, Phone, Mail, Trash2, Edit, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

export function Contacts() {
  const { data: contacts, isLoading } = useListContacts();
  const [search, setSearch] = useState("");
  const deleteMutation = useDeleteContact();
  const queryClient = useQueryClient();

  const filteredContacts = contacts?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Contact deleted");
        queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
      },
      onError: () => {
        toast.error("Failed to delete contact");
      }
    });
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 lg:p-12 min-h-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2 tracking-tight">Contacts</h1>
            <p className="text-muted-foreground font-light">Manage your personal and professional network.</p>
          </div>
          <Link href="/contacts/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-light text-primary-foreground shadow hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Contact
          </Link>
        </header>

        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-10 max-w-md bg-card font-light"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-card rounded-lg border border-border animate-pulse" />
            ))}
          </div>
        ) : filteredContacts?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-[#9dd0cc] rounded-lg">
            <div className="w-16 h-16 bg-[#d8f0ee] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#2a7070]" />
            </div>
            <h3 className="text-lg font-normal text-foreground mb-1">No contacts found</h3>
            <p className="text-muted-foreground font-light mb-6">
              {search ? "Try a different search term" : "Add your first contact to get started."}
            </p>
            {!search && (
              <Link href="/contacts/new">
                <Button variant="outline" className="border-[#7dc0bc] text-primary hover:bg-[#d8f0ee]">Add Contact</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredContacts?.map((contact, i) => (
              <div
                key={contact.id}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all shadow-sm hover:shadow group animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 50}ms`, fillMode: 'both' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12 border border-[#b8dedd]">
                      <AvatarFallback className="bg-[#d0eeec] text-[#1a5250] font-medium text-base">
                        {contact.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-normal text-foreground text-lg leading-tight">{contact.name}</h3>
                      {contact.company && (
                        <div className="flex items-center text-sm font-light text-muted-foreground mt-1">
                          <Building2 className="w-3.5 h-3.5 mr-1.5" />
                          {contact.company}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Link href={`/contacts/${contact.id}`}>
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
                          <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {contact.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(contact.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  {contact.email && (
                    <div className="flex items-center text-sm font-light text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 mr-2" />
                      {contact.email}
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center text-sm font-light text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 mr-2" />
                      {contact.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
