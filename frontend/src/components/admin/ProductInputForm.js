import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
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
  SelectValue
} from "../ui/select"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { CloudUpload, Paperclip, Package } from "lucide-react"
import { Label } from "../ui/label"
import { useNavigate } from "react-router-dom"


// Inline cn function
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export default function ProductInputForm() {
  const [files, setFiles] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]); // store categories
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const formSchema = z.object({
    category: z.string().min(1, "Category is required"),
    title: z.string().min(1, "Product Name is required"), 
    description: z.string().optional(),
    length: z.coerce.number().optional(),
    width: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
    makingCost: z.coerce.number().optional(),
    weightInTola: z.coerce.number().optional(),
    customizable: z.boolean().default(false),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customizable: false
    }
  });

  const category = form.watch("category");

    // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://localhost:8081/api/category");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();

        // ✅ Correctly set the categories array
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Map form values to backend expected fields
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('category', values.category); // Backend expects category name
      formData.append('length', values.length || '');
      formData.append('width', values.width || '');
      formData.append('height', values.height || '');
      formData.append('makingCost', values.makingCost || '');
      formData.append('weightInTola', values.weightInTola || '');
      formData.append('customizable', values.customizable.toString());
      
      // Append files with correct field name 'images' (as expected by multer)
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('images', file);
        });
      }

      // Log form data for debugging
      console.log('Submitting form with data:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      console.log("Category being sent:", values.category);


      const response = await fetch('http://localhost:8081/api/products', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it for FormData
      });

      const result = await response.json();

      if (response.ok) {
        alert("Product created successfully!");
        console.log('Success:', result);
        form.reset();
        setFiles(null);
        navigate('/admin/dashboard'); // Uncomment if you want to redirect
      } else {
        console.error('Error response:', result);
        alert(`Failed to create product: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Failed to submit the form. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
          <p className="text-gray-600">Fill in the details to add a new product to your inventory</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
             <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">

                {/* Category select field */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const cat = categories.find(c => c._id === value);
                          setSelectedCategory(cat || null);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.length > 0 ? (
                            categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="loading">
                              Loading categories...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>Select the product category.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter product name"
                        type="text"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>This is the product display name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Describe your product details.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <Label className="text-sm font-medium">Select Images</Label>
                <div className="mt-2 relative bg-background rounded-lg p-2">
                  <div className="outline-dashed outline-1 outline-slate-500 rounded-lg">
                    <div className="flex items-center justify-center flex-col p-8 w-full">
                      <CloudUpload className='text-gray-500 w-10 h-10' />
                      <p className="mb-1 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>
                        &nbsp; or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG or GIF
                      </p>
                    </div>
                    <Input
                      type="file"
                      multiple
                      accept=".svg,.png,.jpg,.gif,.jpeg"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || [])
                        setFiles(selectedFiles)
                      }}
                    />
                  </div>
                  {files && files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center space-x-2 p-2 border rounded">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Select files to upload.</p>
              </div>
              
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (cm)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter length"
                            type="number"
                            disabled={selectedCategory?.type === "silver"}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>Product length in centimeters.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (cm)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter width"
                            type="number"
                            disabled={selectedCategory?.type === "silver"}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>Product width in centimeters.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter height"
                        type="number"
                        disabled={selectedCategory?.type === "silver"}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Product height in centimeters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="makingCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Making Cost (Rs)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter cost"
                            type="number"
                            disabled={selectedCategory?.type === "gold"}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>Manufacturing cost in rupees.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="weightInTola"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (tola)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter weight"
                            type="number"
                            disabled={selectedCategory?.type === "gold"}
                            className={cn("transition-opacity", category === "gold" && "opacity-50 cursor-not-allowed")}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>Product weight in tola.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-12">
                  <FormField
                    control={form.control}
                    name="customizable"
                    render={({ field }) => (
                      <FormItem>
                        <div
                          className={cn(
                            "border-input relative flex w-full items-start gap-3 rounded-md border p-4 shadow-xs outline-none",
                            field.value && "border-primary/50"
                          )}
                        >
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="order-1 h-4 w-6 shrink-0 mt-1 after:absolute after:inset-0 [&_span]:size-3 
                                data-[state=checked]:[&_span]:translate-x-2 
                                data-[state=checked]:[&_span]:rtl:-translate-x-2"
                            />
                          </FormControl>
                          <div className="grid grow gap-1">
                            <Label className="font-medium">
                              Can be customized{" "}
                              <span className="text-muted-foreground text-xs font-normal">
                                (Optional)
                              </span>
                            </Label>
                            <p className="text-muted-foreground text-xs">
                              Enable this if the product can be customized by customers.
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Product...' : 'Add Product'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}