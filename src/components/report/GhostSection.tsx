
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface GhostSectionProps {
  form: UseFormReturn<any>;
}

export const GhostSection = ({ form }: GhostSectionProps) => {
  // Add state to control the open/close state of the date picker popover
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">About the Recruiter/Company</h3>
      
      <FormField
        control={form.control}
        name="ghostName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recruiter or Company Name</FormLabel>
            <FormControl>
              <Input placeholder="TechGiant Corp" {...field} autoComplete="off" />
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
            <FormLabel>Recruiter (Linkedin)</FormLabel>
            <FormControl>
              <Input placeholder="https://www.linkedin.com/in/username" {...field} autoComplete="off" />
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
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
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
                  onSelect={(date) => {
                    field.onChange(date);
                    // Close the popover when a date is selected
                    setDatePickerOpen(false);
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  fromYear={2010}
                  toDate={new Date()}
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
            <FormLabel>Evidence (Google Drive)</FormLabel>
            <FormControl>
              <Input placeholder="https://drive.google.com/file/d/..." {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default GhostSection;
