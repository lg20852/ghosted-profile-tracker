
import React, { useState } from "react";
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
import { CalendarIcon, ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";

const step1Schema = z.object({
  ghostName: z.string().min(2, "Ghost's name is required"),
  ghostPhotoURL: z.string().url("Valid URL is required"),
  dateGhosted: z.date({
    required_error: "Date is required",
  }),
  evidenceURL: z.string().url("Valid URL is required"),
  venmoHandle: z.string().optional(),
});

const step2Schema = z.object({
  reporterName: z.string().min(2, "Name is required"),
  reporterEmail: z.string().email("Valid email is required"),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;
type FormValues = Step1Values & Step2Values;

const ReportForm = () => {
  const { addReport } = useGhost();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null);
  
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      ghostName: "",
      ghostPhotoURL: "",
      evidenceURL: "",
      venmoHandle: "",
    },
  });

  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      reporterName: "",
      reporterEmail: "",
    },
  });

  const onStep1Submit = (data: Step1Values) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2Submit = (data: Step2Values) => {
    if (!step1Data) return;

    const reportData = {
      ...step1Data,
      ...data,
    };
    
    addReport(reportData);
    
    step1Form.reset();
    step2Form.reset();
    setStep(1);
    
    toast({
      title: "Thanks for your report",
      description: "This ghost has been added to the registry."
    });
  };

  const goBack = () => {
    setStep(1);
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      {step === 1 ? (
        <>
          <DialogHeader>
            <DialogTitle>Report a Ghost - What Happened</DialogTitle>
            <DialogDescription>
              Share details about a recruiter or company that ghosted you during the hiring process.
            </DialogDescription>
          </DialogHeader>

          <Form {...step1Form}>
            <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
              <FormField
                control={step1Form.control}
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
                control={step1Form.control}
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
                control={step1Form.control}
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
                control={step1Form.control}
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
                control={step1Form.control}
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
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>About You (Support Only)</DialogTitle>
            <DialogDescription>
              We never share your info. It's only for dispute support.
            </DialogDescription>
          </DialogHeader>

          <Form {...step2Form}>
            <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
              <FormField
                control={step2Form.control}
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
                control={step2Form.control}
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

              <DialogFooter className="flex flex-col sm:flex-row-reverse gap-2">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-black text-white hover:bg-gray-800"
                >
                  Submit Report
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={goBack}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </>
      )}
    </DialogContent>
  );
};

export default ReportForm;
