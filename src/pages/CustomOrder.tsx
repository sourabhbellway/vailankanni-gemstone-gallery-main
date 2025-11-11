import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { createCustomOrder } from "@/lib/api/customOrderController";
import { getPublicCategories } from "@/lib/api/publicController";
import { ArrowLeft, Upload, X, Sparkles, Loader2, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "@/config";

const CustomOrder = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useUserAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    category_id: "",
    metal: "",
    purity: "",
    size: "",
    weight: "",
    description: "",
    note: "",
  });

  const [designImages, setDesignImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const metalOptions = ["Gold", "Silver", "Platinum", "Diamond"];
  const purityOptions = ["24k", "22k", "18k", "14k", "925", "999"];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await getPublicCategories();
        if (response.data.success) {
          setCategories(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, navigate, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = designImages.length + newFiles.length;

    if (totalFiles > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images",
        variant: "destructive",
      });
      return;
    }

    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setDesignImages((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setDesignImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      navigate("/signin");
      return;
    }

    // Validation
    if (!formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!formData.metal) {
      toast({
        title: "Validation Error",
        description: "Please select a metal type",
        variant: "destructive",
      });
      return;
    }

    if (!formData.purity) {
      toast({
        title: "Validation Error",
        description: "Please select purity",
        variant: "destructive",
      });
      return;
    }

    if (!formData.size || !formData.weight || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (designImages.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please upload at least one design image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await createCustomOrder(token, {
        ...formData,
        design_images: designImages,
      });

      if (response.status) {
        toast({
          title: "Success!",
          description: response.message || "Custom order created successfully",
        });
        // Reset form
        setFormData({
          category_id: "",
          metal: "",
          purity: "",
          size: "",
          weight: "",
          description: "",
          note: "",
        });
        setDesignImages([]);
        setImagePreviews([]);
        // Navigate to profile or orders page
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error creating custom order:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create custom order";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen font-serif bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto px-4 py-10 w-full">
          {/* Header Section */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 text-[#084526] hover:text-[#0a5a2e]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-[#084526] to-[#0a5a2e] rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#084526] tracking-tight">
                  Custom Order
                </h1>
                <p className="text-gray-600 text-sm">
                  Create your unique jewelry piece with our expert craftsmen
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Row: Category, Metal, Purity, Size - 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category_id" className="text-[#084526] font-semibold">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleSelectChange("category_id", value)}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select Category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metal" className="text-[#084526] font-semibold">
                    Metal <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.metal}
                    onValueChange={(value) => handleSelectChange("metal", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Metal" />
                    </SelectTrigger>
                    <SelectContent>
                      {metalOptions.map((metal) => (
                        <SelectItem key={metal} value={metal}>
                          {metal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purity" className="text-[#084526] font-semibold">
                    Purity <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.purity}
                    onValueChange={(value) => handleSelectChange("purity", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Purity" />
                    </SelectTrigger>
                    <SelectContent>
                      {purityOptions.map((purity) => (
                        <SelectItem key={purity} value={purity}>
                          {purity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size" className="text-[#084526] font-semibold">
                    Size <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="size"
                    name="size"
                    type="text"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., 8, 9, 10"
                    className="h-11"
                    required
                  />
                </div>
              </div>

              {/* Second Row: Weight - spans 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="weight" className="text-[#084526] font-semibold">
                    Weight (grams) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="e.g., 5.5"
                    className="h-11"
                    required
                  />
                </div>
              </div>

              {/* Description - spans 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2 lg:col-span-4">
                  <Label htmlFor="description" className="text-[#084526] font-semibold">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your custom jewelry piece in detail..."
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>
              </div>

              {/* Note - spans 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2 lg:col-span-4">
                  <Label htmlFor="note" className="text-[#084526] font-semibold">
                    Special Instructions (Optional)
                  </Label>
                  <Textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Any special requirements or notes for the craftsman..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Design Images - spans 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2 lg:col-span-4">
                <Label className="text-[#084526] font-semibold">
                  Design Images <span className="text-red-500">*</span>
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Max 5 images, 5MB each)
                  </span>
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#084526] transition-colors">
                  <input
                    type="file"
                    id="design_images"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="design_images"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="p-4 bg-amber-100 rounded-full mb-4">
                      <Upload className="w-8 h-8 text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
                      >
                        <img
                          src={preview}
                          alt={`Design ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                          Image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 bg-[#084526] hover:bg-[#0a5a2e] text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Submit Custom Order
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-amber-200 rounded-lg">
                <ImageIcon className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-[#084526] mb-2">
                  How it works
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Fill in all the required details about your custom jewelry</li>
                  <li>• Upload design images or reference photos</li>
                  <li>• Our expert craftsmen will review your request</li>
                  <li>• You'll receive a quote and timeline via email</li>
                  <li>• Once approved, we'll start crafting your unique piece</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomOrder;

