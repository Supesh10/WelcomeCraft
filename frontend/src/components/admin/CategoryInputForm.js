import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link } from "react-router-dom"
import { FolderPlus, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import ApiService from "../../services/apiService"

// Mirrors MATERIAL_TYPES in backend/src/Config/productTypes.js
const MATERIAL_TYPES = [
  { value: "silver", label: "Silver", hint: "Stock or custom pieces, priced on the live silver rate." },
  { value: "gold", label: "Gold", hint: "Oxidized, color, half gold or full gold (electroplated / fire gold plated)." },
  { value: "copper", label: "Copper", hint: "Copper sculptures and statues with a fixed price." },
  { value: "bronze", label: "Bronze", hint: "Bronze sculptures and statues with a fixed price." },
]

const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  materialType: z.string().min(1, "Material is required"),
  description: z.string().optional(),
  imageUrl: z.union([z.literal(""), z.string().trim().url("Enter a valid URL")]),
})

const EMPTY = { name: "", materialType: "", description: "", imageUrl: "" }

export default function CategoryInputForm() {
  const [submitError, setSubmitError] = useState("")
  const [created, setCreated] = useState(null)

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: EMPTY,
  })
  const materialType = form.watch("materialType")
  const hint = MATERIAL_TYPES.find((m) => m.value === materialType)?.hint

  async function onSubmit(values) {
    setSubmitError("")
    setCreated(null)
    try {
      const result = await ApiService.createCategory({
        name: values.name.trim(),
        materialType: values.materialType,
        description: values.description?.trim() || undefined,
        imageUrl: values.imageUrl?.trim() || undefined,
      })
      setCreated(result.category)
      form.reset(EMPTY)
    } catch (err) {
      setSubmitError(err.message || "Failed to create category")
    }
  }

  const { control } = form

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FolderPlus className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Category</h1>
          <p className="text-gray-600">The material decides which fields its products have.</p>
        </div>

        {created && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-sm text-green-800">
              Category <strong>{created.name}</strong> was created.{" "}
              <Link to="/admin/products/new" className="underline">Add a product to it</Link>.
            </p>
          </div>
        )}

        {submitError && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Silver Statues" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="materialType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a material" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MATERIAL_TYPES.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hint && <FormDescription>{hint}</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating category..." : "Add category"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
