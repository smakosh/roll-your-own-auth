import * as React from "react";

import { cn } from "@/lib/utils";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/components/form";
import Spinner from "@/lib/icons/Spinner";
import { API_URL, APP_URL } from "@/lib/env";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const res = await fetch(`${APP_URL}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const user = await res.json();

    if (user?.message) {
      form.setError("password", {
        message: user.message,
      });
    }

    if (user.id || user.access_token) {
      navigate({
        to: "/dashboard",
      });
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mb-3">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@doe.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mb-3">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="mb-6"
          >
            {form.formState.isSubmitting && (
              <Spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Signin
          </Button>
        </form>
      </Form>
    </div>
  );
}
