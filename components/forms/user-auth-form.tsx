"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";


const formSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {


  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: UserFormValue) => {

    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          toast({
            title: "Success!",
            variant: "default",
            description: "You have successfully logged in"
          });
          // redirect to dashboard
          router.push("/dashboard");
        } else throw new Error(data.message);
      })
      .catch((error) => {
        return toast({
          title: "Whoops!",
          variant: "destructive",
          description: error.message
        });

      });

  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ formState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email..."
                    disabled={formState.isLoading}
                    {...form.register("email")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ formState }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password..."
                    disabled={formState.isLoading}
                    {...form.register("password")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={form.formState.isLoading} className="ml-auto w-full" type="submit">
            {
              form.formState.isLoading ? "Loading..." : "Login"
            }
          </Button>
        </form>
      </Form>
    </>
  );
}
