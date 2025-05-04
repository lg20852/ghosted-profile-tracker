
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const ReporterSection = () => {
  const form = useFormContext();

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <h3 className="text-sm font-medium">Your Information</h3>
      <p className="text-xs text-gray-500">We never share your info. It's only for verification.</p>
      
      <FormField
        control={form.control}
        name="reporterName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} autoComplete="off" />
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
              <Input placeholder="john@example.com" {...field} autoComplete="off" />
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
              <Input placeholder="@your-venmo" {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ReporterSection;
