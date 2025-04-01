import { Form, FormControl, FormField, FormItem, FormLabel, Input } from '@extension/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  checkInterval: z.number().min(1, {
    message: 'Username must be at least 1',
  }),
});

export const GeneralConfig = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkInterval: 5,
    },
  });

  return (
    <div className="w-1/2">
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="checkInterval"
            render={() => (
              <FormItem>
                <FormLabel>${'runtimeCheckInterval'}</FormLabel>
                <FormControl>
                  <Input value={5} min={1} type="number" />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
