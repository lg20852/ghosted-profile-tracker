
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGhost } from "@/contexts/GhostContext";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { ReporterSection } from "./report/ReporterSection";
import { GhostSection } from "./report/GhostSection";

const formSchema = z.object({
  reporterName: z.string().min(2, "Name is required"),
  reporterEmail: z.string().email("Valid email is required"),
  ghostName: z.string().min(2, "Recruiter name is required"),
  companyName: z.string().min(2, "Company name is required"),
  ghostPhotoURL: z.string().url("Valid URL is required"),
  dateGhosted: z.date({
    required_error: "Date is required"
  }),
  evidenceURL: z.string().url("Valid URL is required"),
  venmoHandle: z.string().optional(),
  location: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const ReportForm = () => {
  const { addReport } = useGhost();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reporterName: "",
      reporterEmail: "",
      ghostName: "",
      companyName: "",
      ghostPhotoURL: "",
      evidenceURL: "",
      venmoHandle: "",
      location: ""
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create a report object with all required fields explicitly defined
      const reportData = {
        reporterName: data.reporterName,
        reporterEmail: data.reporterEmail,
        ghostName: data.ghostName,
        companyName: data.companyName,
        ghostPhotoURL: data.ghostPhotoURL,
        dateGhosted: data.dateGhosted,
        evidenceURL: data.evidenceURL,
        venmoHandle: data.venmoHandle,
        location: data.location
      };
      
      await addReport(reportData);
      form.reset();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Report a Ghosting</DialogTitle>
        <DialogDescription>
          Report recruiters or companies that have ghosted you during the hiring process.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <div className="space-y-4">
            <FormField control={form.control} name="ghostName" render={({
            field
          }) => <FormItem>
                  <FormLabel>Recruiter Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="companyName" render={({
            field
          }) => <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="ghostPhotoURL" render={({
            field
          }) => <FormItem>
                  <FormLabel>Recruiter (Linkedin)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.linkedin.com/in/username" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="dateGhosted" render={({
            field
          }) => <FormItem className="flex flex-col">
                  <FormLabel>Date Ghosted</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        fromYear={2010}
                        toDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="location" render={({
            field
          }) => <FormItem>
                  <FormLabel>Location (City)</FormLabel>
                  <FormControl>
                    <Input placeholder="New York" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="evidenceURL" render={({
            field
          }) => <FormItem>
                  <FormLabel>Evidence (Google Drive)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://drive.google.com/file/d/..." {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <ReporterSection />

            <FormField control={form.control} name="venmoHandle" render={({
            field
          }) => <FormItem>
                  <FormLabel>Your Venmo Handle (for compensation)</FormLabel>
                  <FormControl>
                    <Input placeholder="@username" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-black text-white hover:bg-gray-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default ReportForm;
