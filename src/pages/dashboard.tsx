import { useGetStats } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, NotebookPen, Target, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export function Dashboard() {
  const { data: stats, isLoading, isError } = useGetStats();

  return (
    <Layout>
      <div className="p-6 md:p-10 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-light text-foreground mb-2 tracking-tight">Thank and praise God.</h1>
          <p className="text-muted-foreground">This is a record of your tarbiyah, but it's only what you give to your Lord that actually matters.</p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border shadow-sm bg-card/50">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded bg-muted animate-pulse mb-4" />
                  <div className="h-6 w-16 bg-muted animate-pulse mb-2 rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError || !stats ? (
          <div className="text-center p-8 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">Unable to load your stats at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Contacts — teal */}
            <StatCard
              title="Contacts"
              value={stats.totalContacts}
              icon={Users}
              href="/contacts"
              iconBg="bg-[#c5e4e2]"
              iconText="text-[#1a5250]"
            />
            {/* Courses — olive/tan */}
            <StatCard
              title="Courses in Progress"
              value={stats.coursesInProgress}
              icon={Target}
              href="/courses"
              iconBg="bg-[#dce5b5]"
              iconText="text-[#2d3d10]"
              subtext={`${stats.coursesCompleted} completed of ${stats.totalCourses} total`}
            />
            {/* Notes — teal */}
            <StatCard
              title="Personal Notes"
              value={stats.totalNotes}
              icon={NotebookPen}
              href="/notes"
              iconBg="bg-[#c5e4e2]"
              iconText="text-[#1a5250]"
            />
          </div>
        )}

        {/* Lobby link */}
        <div className="mt-12 pt-8 border-t border-border">
          <a
            href="https://abdullahreed.github.io/islamiceatingscience/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium uppercase tracking-widest text-white transition-colors"
            style={{ backgroundColor: "#176F87" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1E96B3")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#176F87")}
          >
            LOBBY
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  iconBg,
  iconText,
  subtext,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  href: string;
  iconBg: string;
  iconText: string;
  subtext?: string;
}) {
  return (
    <Link href={href}>
      <Card className="border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer group h-full">
        <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
          <div>
            <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${iconBg} ${iconText}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-4xl font-light text-foreground mb-2 group-hover:text-primary transition-colors">{value}</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{title}</div>
          </div>
          {subtext && (
            <div className="mt-4 text-sm text-muted-foreground/80 pt-4 border-t border-border">
              {subtext}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
