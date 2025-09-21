import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Briefcase, MapPin, DollarSign, Search, Filter } from "lucide-react";

const jobs = [
  {
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    salary: "$120k - $160k",
    type: "Full-time",
    posted: "2 days ago",
    description: "Join our team to build cutting-edge web applications using React and TypeScript.",
  },
  {
    title: "Product Manager",
    company: "InnovateLabs",
    location: "Remote",
    salary: "$90k - $130k",
    type: "Full-time",
    posted: "1 week ago",
    description: "Lead product strategy and work with cross-functional teams to deliver amazing user experiences.",
  },
  {
    title: "UX Designer",
    company: "DesignStudio",
    location: "New York, NY",
    salary: "$80k - $110k",
    type: "Contract",
    posted: "3 days ago",
    description: "Create beautiful and intuitive user interfaces for our digital products.",
  },
];

export const JobsModule = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Briefcase className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Find and apply for jobs that match your skills and interests.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search jobs by title, company, or keyword..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {jobs.map((job, index) => (
          <Card key={index} className="card-hover-lift">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="text-base font-medium text-foreground">
                    {job.company}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{job.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{job.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {job.salary}
                </div>
                <div>{job.posted}</div>
              </div>
              
              <div className="flex gap-3">
                <Button className="flex-1 sm:flex-none">
                  Apply Now
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  Save Job
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Jobs
        </Button>
      </div>
    </div>
  );
};