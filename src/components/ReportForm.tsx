
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
import { toast } from "@/components/ui/use-toast";
import { ReporterSection } from "./report/ReporterSection";
import { GhostSection } from "./report/GhostSection";

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
    // Create a report object with all required fields explicitly defined
    const reportData = {
      reporterName: data.reporterName,
      reporterEmail: data.reporterEmail,
      ghostName: data.ghostName,
      ghostPhotoURL: data.ghostPhotoURL,
      dateGhosted: data.dateGhosted,
      evidenceURL: data.evidenceURL,
      venmoHandle: data.venmoHandle,
    };
    
    addReport(reportData);
    
    form.reset();
    
    toast({
      title: "Thanks for your report",
      description: "This ghost has been added to the registry."
    });
  };

  return (
    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Report a Ghost</DialogTitle>
        <DialogDescription>
          Report recruiters or companies that have ghosted you during the hiring process.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
          <GhostSection form={form} />
          <ReporterSection />
          
          <DialogFooter className="pt-4">
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
