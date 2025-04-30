
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGhost } from "@/contexts/GhostContext";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  reporterName: z.string().min(2, "Name is required"),
  reporterEmail: z.string().email("Valid email is required"),
  ghostName: z.string().min(2, "Ghost's name is required"),
  ghostPhotoURL: z.string().url("Valid URL is required"),
  dateGhosted: z.date({
    required_error: "Date is required",
  }),
  evidenceURL: z.string().url("Valid URL is required"),
  venmoHandle: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ReportForm = () => {
  const { addReport } = useGhost();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reporterName: "",
      reporterEmail: "",
      ghostName: "",
      ghostPhotoURL: "",
      evidenceURL: "",
      venmoHandle: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    addReport(data);
    form.reset();
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Report a Ghost</DialogTitle>
        <DialogDescription>
          Share details about a recruiter or company that ghosted you during the hiring process.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="reporterName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reporterEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Email</FormLabel>
                <FormControl>
                  <Input placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ghostName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company or Recruiter Name</FormLabel>
                <FormControl>
                  <Input placeholder="TechGiant Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ghostPhotoURL"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Logo or Recruiter Photo URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/logo.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dateGhosted"
            render={({ field }) => (
              <FormItem className="flex flex-col">
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
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="evidenceURL"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evidence URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://drive.google.com/file/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="venmoHandle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Venmo Handle (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="@your-venmo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default ReportForm;
