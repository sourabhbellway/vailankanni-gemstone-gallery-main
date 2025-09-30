import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Edit, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  bulkUpdateProductPrices,
  bulkUpdateProductStatus,
} from "@/lib/api/productController";
import {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory as deleteCategoryApi,
} from "@/lib/api/categoriesController";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config";
const ProductManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState<any[]>([]);
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [purity, setPurity] = useState("");
  const [weight, setWeight] = useState("");
  const [makingCharges, setMakingCharges] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Edit product state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editPurity, setEditPurity] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editMakingCharges, setEditMakingCharges] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editStatusActive, setEditStatusActive] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState<string>("");

  // Bulk price update state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<
    (number | string)[]
  >([]);
  const [bulkPrices, setBulkPrices] = useState<Record<string, string>>({});
  const [bulkApplyAll, setBulkApplyAll] = useState<string>("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Bulk status update state
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkStatuses, setBulkStatuses] = useState<Record<string, string>>({});
  const [bulkStatusApplyAll, setBulkStatusApplyAll] = useState<string>("");
  const [bulkStatusSubmitting, setBulkStatusSubmitting] = useState(false);

  // Category CRUD state
  const [categoryCreateOpen, setCategoryCreateOpen] = useState(false);
  const [categoryEditOpen, setCategoryEditOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryEditId, setCategoryEditId] = useState<number | null>(null);
  const [categoryEditName, setCategoryEditName] = useState("");

  // Edit modal shows only editable fields; no image state for edit
  const normalizePurity = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const raw = String(value).trim();
    const lower = raw.toLowerCase();
    if (["24k", "22k", "18k", "925"].includes(lower)) return lower;
    if (lower.includes("925")) return "925";
    const match = lower.match(/(\d{2,3})/);
    if (match) {
      const num = match[1];
      if (num === "24") return "24k";
      if (num === "22") return "22k";
      if (num === "18") return "18k";
      if (num === "925") return "925";
    }
    return "";
  };

  useEffect(() => {
    if (!token) return;
    getProducts(token)
      .then((response) => {
        const data = (response?.data?.data ?? []) as any[];
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]));

    getCategories(token)
      .then((response) => {
        setCategories(response.data.data);
      })

      .catch((error) => console.log(error));
  }, [token]);

  const refreshCategories = async () => {
    if (!token) return;
    const response = await getCategories(token);
    setCategories(response.data.data ?? []);
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    const jsonPayload = {
      name,
      category_id: categoryId,
      purity,
      weight: weight ? Number(weight) : undefined,
      making_charges: makingCharges ? Number(makingCharges) : undefined,
      price: price ? Number(price) : undefined,
      stock: stock ? Number(stock) : undefined,
    };
    try {
      let payload: Record<string, unknown> | FormData = jsonPayload;
      if (images.length > 0) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("category_id", categoryId);
        if (purity) formData.append("purity", purity.toUpperCase());
        if (weight) formData.append("weight", String(Number(weight)));
        if (makingCharges)
          formData.append("making_charges", String(Number(makingCharges)));
        if (price) formData.append("price", String(Number(price)));
        if (stock) formData.append("stock", String(Number(stock)));

        if (images[0]) {
          formData.append("image", images[0], images[0].name);
        }
        payload = formData;
      }
      await createProduct(token, payload);
      toast({
        title: "Success",
        description: "Product added successfully",
        variant: "success",
      });
      const refreshed = await getProducts(token);
      const data = (refreshed?.data?.data ?? []) as any[];
      setProducts(Array.isArray(data) ? data : []);
      // reset form
      setName("");
      setCategoryId("");
      setPurity("");
      setWeight("");
      setMakingCharges("");
      setPrice("");
      setStock("");

      setImages([]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const openEditDialogForProduct = async (product: any) => {
    try {
      if (!token) return;
      const id = product?.id;
      if (!id) return;
      const response = await getProductById(token, id);
      const details = response?.data?.data ?? {};
      const categoryIdFromProduct =
        details?.category_id ?? details?.category?.id ?? "";
      setEditingProductId(details?.id ?? id);
      setEditName(details?.name ?? "");
      setEditCategoryId(
        categoryIdFromProduct ? String(categoryIdFromProduct) : ""
      );
      const normalizedPurity = normalizePurity(
        details?.purity ?? details?.karat ?? ""
      );
      setEditPurity(normalizedPurity);
      setEditWeight(
        details?.weight !== undefined && details?.weight !== null
          ? String(details.weight)
          : ""
      );
      setEditMakingCharges(
        details?.making_charges !== undefined &&
          details?.making_charges !== null
          ? String(details.making_charges)
          : ""
      );
      setEditPrice(
        details?.price !== undefined && details?.price !== null
          ? String(details.price)
          : ""
      );
      setEditStock(
        details?.stock !== undefined && details?.stock !== null
          ? String(details.stock)
          : ""
      );
      const statusVal = details?.status;
      setEditStatusActive(
        statusVal === 1 || statusVal === "1" || statusVal === true
      );
      const imgRaw =
        (details && (details.image_url ?? details.image)) ??
        (details &&
          details.images &&
          (details.images[0]?.url ?? details.images[0])) ??
        "";
      setEditImageUrl(String(imgRaw || ""));
      setEditDialogOpen(true);
    } catch (err) {
      // fallback to opening with whatever we have
      const categoryIdFromProduct =
        product?.category_id ?? product?.category?.id ?? "";
      setEditingProductId(product?.id ?? null);
      setEditName(product?.name ?? "");
      setEditCategoryId(
        categoryIdFromProduct ? String(categoryIdFromProduct) : ""
      );
      const normalizedPurity = normalizePurity(
        product?.purity ?? product?.karat ?? ""
      );
      setEditPurity(normalizedPurity);
      setEditWeight(
        product?.weight !== undefined && product?.weight !== null
          ? String(product.weight)
          : ""
      );
      setEditMakingCharges(
        product?.making_charges !== undefined &&
          product?.making_charges !== null
          ? String(product.making_charges)
          : ""
      );
      setEditPrice(
        product?.price !== undefined && product?.price !== null
          ? String(product.price)
          : ""
      );
      setEditStock(
        product?.stock !== undefined && product?.stock !== null
          ? String(product.stock)
          : ""
      );
      const statusVal = product?.status;
      setEditStatusActive(
        statusVal === 1 || statusVal === "1" || statusVal === true
      );
      const imgRaw =
        product?.image_url ??
        product?.image ??
        (product?.images && (product.images[0]?.url ?? product.images[0])) ??
        "";
      setEditImageUrl(String(imgRaw || ""));
      setEditDialogOpen(true);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !editingProductId) return;
    const jsonPayload = {
      name: editName,
      category_id: editCategoryId ? Number(editCategoryId) : undefined,
      purity: editPurity ? editPurity.toUpperCase() : undefined,
      weight: editWeight ? Number(editWeight) : undefined,
      making_charges: editMakingCharges ? Number(editMakingCharges) : undefined,
      price: editPrice ? Number(editPrice) : undefined,
      stock: editStock ? Number(editStock) : undefined,
      status: editStatusActive ? 1 : 0,
    };
    try {
      await updateProduct(token, editingProductId, jsonPayload);
      toast({
        title: "Success",
        description: "Product updated successfully",
        variant: "success",
      });
      const refreshed = await getProducts(token);
      const data = (refreshed?.data?.data ?? []) as any[];
      setProducts(Array.isArray(data) ? data : []);
      setEditDialogOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!token) return;
    await deleteProduct(token, id);
    toast({
      title: "Success",
      description: "Product deleted successfully",
      variant: "success",
    });
    const refreshed = await getProducts(token);
    const data = (refreshed?.data?.data ?? []) as any[];
    setProducts(Array.isArray(data) ? data : []);
  };

  // Category handlers
  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    try {
      const name = newCategoryName.trim();
      if (!name) return;
      await createCategory(token, { name });
      toast({
        title: "Success",
        description: "Category created successfully",
        variant: "success",
      });
      await refreshCategories();
      setCategoryCreateOpen(false);
      setNewCategoryName("");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const openEditCategory = async (id: number) => {
    if (!token) return;
    setCategoryEditId(id);
    try {
      const response = await getCategoryById(token, id);
      const data = response?.data?.data;
      setCategoryEditName(data?.name ?? "");
    } catch (error) {
      const fallback = (categories as any[]).find((c) => c?.id === id);
      setCategoryEditName(fallback?.name ?? "");
    }
    setCategoryEditOpen(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !categoryEditId) return;
    try {
      const name = categoryEditName.trim();
      if (!name) return;
      await updateCategory(token, categoryEditId, { name });
      toast({
        title: "Success",
        description: "Category updated successfully",
        variant: "success",
      });
      await refreshCategories();
      setCategoryEditOpen(false);
      setCategoryEditId(null);
      setCategoryEditName("");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!token) return;
    try {
      await deleteCategoryApi(token, id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
        variant: "success",
      });
      await refreshCategories();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 ">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your jewelry inventory</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new jewelry item to your inventory
              </DialogDescription>
            </DialogHeader>
            <form action="" method="post" onSubmit={handleAddProduct}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="Enter product name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="purity">Purity</Label>
                    <Select value={purity} onValueChange={setPurity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24k">24K</SelectItem>
                        <SelectItem value="22k">22K</SelectItem>
                        <SelectItem value="18k">18K</SelectItem>
                        <SelectItem value="925">925 Silver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Weight (grams)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Enter weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="makingCharges">Making Charges (₹)</Label>
                    <Input
                      id="makingCharges"
                      type="number"
                      placeholder="Enter making charges"
                      value={makingCharges}
                      onChange={(e) => setMakingCharges(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="Enter stock"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Product Images</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? "border-primary"
                        : "border-muted-foreground/25"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const dropped = Array.from(
                        e.dataTransfer.files || []
                      ).filter((f) => f.type.startsWith("image/"));
                      if (dropped.length > 0) {
                        setImages((prev) => [...prev, ...dropped]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to upload or drag and drop images
                    </p>
                    <input
                      ref={fileInputRef}
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const selected = Array.from(e.target.files ?? []);
                        if (selected.length > 0) {
                          setImages((prev) => [...prev, ...selected]);
                        }
                      }}
                    />
                  </div>
                  {images.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {images.length} file(s) selected
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button type="submit">Add Product</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update the product details</DialogDescription>
            </DialogHeader>
            <form action="" method="post" onSubmit={handleUpdateProduct}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editProductName">Product Name</Label>
                  <Input
                    id="editProductName"
                    placeholder="Enter product name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                {editImageUrl && (
                  <div className="grid gap-2">
                    <Label>Current Image</Label>
                    <img
                      src={`${API_BASE_URL}/${editImageUrl}`}
                      alt={editName || "Product image"}
                      className="w-full h-48 object-cover rounded-md border"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editCategory">Category</Label>
                    <Select
                      value={editCategoryId}
                      onValueChange={setEditCategoryId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="editPurity">Purity</Label>
                    <Select value={editPurity} onValueChange={setEditPurity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24k">24K</SelectItem>
                        <SelectItem value="22k">22K</SelectItem>
                        <SelectItem value="18k">18K</SelectItem>
                        <SelectItem value="925">925 Silver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editWeight">Weight (grams)</Label>
                    <Input
                      id="editWeight"
                      type="number"
                      placeholder="Enter weight"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="editMakingCharges">
                      Making Charges (₹)
                    </Label>
                    <Input
                      id="editMakingCharges"
                      type="number"
                      placeholder="Enter making charges"
                      value={editMakingCharges}
                      onChange={(e) => setEditMakingCharges(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editPrice">Price (₹)</Label>
                    <Input
                      id="editPrice"
                      type="number"
                      placeholder="Enter price"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="editStock">Stock</Label>
                    <Input
                      id="editStock"
                      type="number"
                      placeholder="Enter stock"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="editStatus">Active</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="editStatus"
                      checked={editStatusActive}
                      onCheckedChange={(checked) =>
                        setEditStatusActive(Boolean(checked))
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      Toggle to set status 1 (active) or 0 (inactive)
                    </span>
                  </div>
                </div>
                {/* Image editing not included; showing preview above if available */}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Product</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">All Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.name.toLowerCase()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
              <CardDescription>Manage your jewelry inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={
                          selectedProductIds.length > 0 &&
                          selectedProductIds.length === products.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProductIds(products.map((p) => p.id));
                          } else {
                            setSelectedProductIds([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Purity</TableHead>
                    <TableHead>Making Charges</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const categoryName =
                      (product?.category && typeof product.category === "object"
                        ? product.category?.name
                        : product?.category) ||
                      product?.category_name ||
                      "-";
                    const makingCharges =
                      product?.makingCharges ?? product?.making_charges ?? "-";
                    const statusText = (() => {
                      const val = product?.status;
                      if (typeof val === "string") return val;
                      if (typeof val === "number")
                        return val === 1 ? "Active" : "Inactive";
                      if (typeof val === "boolean")
                        return val ? "Active" : "Inactive";
                      return "Inactive";
                    })();
                    const statusVariant =
                      statusText === "Active" ? "default" : "destructive";
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedProductIds.includes(product.id)}
                            onCheckedChange={(checked) => {
                              setSelectedProductIds((prev) =>
                                checked
                                  ? Array.from(new Set([...prev, product.id]))
                                  : prev.filter((id) => id !== product.id)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.id}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{categoryName}</TableCell>
                        <TableCell>{product.weight ?? "-"}</TableCell>
                        <TableCell>
                          {product.purity ?? product.karat ?? "-"}
                        </TableCell>
                        <TableCell>{makingCharges}</TableCell>
                        <TableCell className="font-medium">
                          {product.price ?? "-"}
                        </TableCell>
                        <TableCell>{product.stock ?? "-"}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant}>{statusText}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialogForProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete product?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete "{product.name}" (ID:{" "}
                                    {product.id}).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Category Management</CardTitle>
                  <CardDescription>Manage product categories</CardDescription>
                </div>
                <Dialog
                  open={categoryCreateOpen}
                  onOpenChange={setCategoryCreateOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Category</DialogTitle>
                      <DialogDescription>Add a new category</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCategory}>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="newCategoryName">Name</Label>
                          <Input
                            id="newCategoryName"
                            placeholder="e.g. Gold"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCategoryCreateOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Create</Button>
                        </div>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Dialog
                open={categoryEditOpen}
                onOpenChange={setCategoryEditOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                      Update the category name
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateCategory}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="editCategoryName">Name</Label>
                        <Input
                          id="editCategoryName"
                          placeholder="Category name"
                          value={categoryEditName}
                          onChange={(e) => setCategoryEditName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCategoryEditOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Update</Button>
                      </div>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(categories as any[]).map((category) => (
                  <Card key={category.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{category.name}</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditCategory(category.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete category?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete "{category.name}" (ID:{" "}
                                  {category.id}).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>
                Perform bulk actions on products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Products (CSV)
                </Button>
                <Button variant="outline">Export Products (CSV)</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Initialize price map for selected rows
                    const map: Record<string, string> = {};
                    selectedProductIds.forEach((id) => {
                      const p = products.find((pp) => pp.id === id);
                      if (p) map[String(id)] = p.price ? String(p.price) : "";
                    });
                    setBulkPrices(map);
                    setBulkApplyAll("");
                    setBulkDialogOpen(true);
                  }}
                >
                  Bulk Price Update
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const map: Record<string, string> = {};
                    selectedProductIds.forEach((id) => {
                      const p = products.find((pp) => pp.id === id);
                      if (p) {
                        const val = p.status;
                        const isActive =
                          val === 1 ||
                          val === "1" ||
                          val === true ||
                          val === "active";
                        map[String(id)] = isActive ? "1" : "0";
                      }
                    });
                    setBulkStatuses(map);
                    setBulkStatusApplyAll("");
                    setBulkStatusDialogOpen(true);
                  }}
                >
                  Bulk Status Update
                </Button>
              </div>
            </CardContent>
          </Card>

          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Price Update</DialogTitle>
                <DialogDescription>
                  Update prices for selected products. Provide new price per row
                  or apply one value to all.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label htmlFor="applyAll">Apply one price to all</Label>
                    <Input
                      id="applyAll"
                      type="number"
                      placeholder="e.g. 1500"
                      value={bulkApplyAll}
                      onChange={(e) => setBulkApplyAll(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      const next: Record<string, string> = { ...bulkPrices };
                      selectedProductIds.forEach((id) => {
                        next[String(id)] = bulkApplyAll;
                      });
                      setBulkPrices(next);
                    }}
                  >
                    Apply to all
                  </Button>
                </div>

                {selectedProductIds.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No products selected. Go to the Products tab and select rows
                    with the checkbox.
                  </div>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">
                            Product ID
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[160px]">
                            New Price (₹)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProductIds.map((id) => {
                          const p = products.find((pp) => pp.id === id);
                          if (!p) return null;
                          return (
                            <TableRow key={String(id)}>
                              <TableCell className="font-mono">{id}</TableCell>
                              <TableCell className="truncate max-w-xs">
                                {p.name}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  placeholder="e.g. 1500"
                                  value={bulkPrices[String(id)] ?? ""}
                                  onChange={(e) =>
                                    setBulkPrices((prev) => ({
                                      ...prev,
                                      [String(id)]: e.target.value,
                                    }))
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setBulkDialogOpen(false)}
                    disabled={bulkSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (selectedProductIds.length === 0) {
                        toast({
                          title: "Warning",
                          description: "Select at least one product",
                          variant: "warning",
                        });
                        return;
                      }
                      const items = selectedProductIds
                        .map((id) => ({
                          id,
                          price: Number(bulkPrices[String(id)]),
                        }))
                        .filter((x) => !Number.isNaN(x.price) && x.price > 0);
                      if (items.length === 0) {
                        toast({
                          title: "Warning",
                          description: "Provide valid prices",
                          variant: "warning",
                        });
                        return;
                      }
                      try {
                        setBulkSubmitting(true);
                        try {
                          await bulkUpdateProductPrices(token as string, {
                            products: items as any,
                          });
                        } catch (err) {
                          for (const it of items) {
                            await updateProduct(token as string, it.id, {
                              price: it.price,
                            });
                          }
                        }
                        toast({
                          title: "Success",
                          description: "Prices updated successfully",
                          variant: "success",
                        });
                        setBulkDialogOpen(false);
                        const res = await getProducts(token as string);
                        setProducts(res.data?.data ?? res.data ?? []);
                      } catch (e) {
                        toast({
                          title: "Error",
                          description: "Failed to update prices",
                          variant: "destructive",
                        });
                      } finally {
                        setBulkSubmitting(false);
                      }
                    }}
                    disabled={bulkSubmitting}
                  >
                    {bulkSubmitting ? "Updating..." : "Update Prices"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={bulkStatusDialogOpen}
            onOpenChange={setBulkStatusDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Status Update</DialogTitle>
                <DialogDescription>
                  Activate or deactivate selected products. Choose per row or
                  apply one value to all.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label htmlFor="applyAllStatus">
                      Apply one status to all
                    </Label>
                    <Select
                      value={bulkStatusApplyAll}
                      onValueChange={setBulkStatusApplyAll}
                    >
                      <SelectTrigger id="applyAllStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Active</SelectItem>
                        <SelectItem value="0">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      const next: Record<string, string> = { ...bulkStatuses };
                      selectedProductIds.forEach((id) => {
                        if (bulkStatusApplyAll !== "") {
                          next[String(id)] = bulkStatusApplyAll;
                        }
                      });
                      setBulkStatuses(next);
                    }}
                  >
                    Apply to all
                  </Button>
                </div>

                {selectedProductIds.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No products selected. Go to the Products tab and select rows
                    with the checkbox.
                  </div>
                ) : (
                  <div className="max-h-[50vh] overflow-y-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">
                            Product ID
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[200px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProductIds.map((id) => {
                          const p = products.find((pp) => pp.id === id);
                          if (!p) return null;
                          return (
                            <TableRow key={String(id)}>
                              <TableCell className="font-mono">{id}</TableCell>
                              <TableCell className="truncate max-w-xs">
                                {p.name}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={bulkStatuses[String(id)] ?? ""}
                                  onValueChange={(val) =>
                                    setBulkStatuses((prev) => ({
                                      ...prev,
                                      [String(id)]: val,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setBulkStatusDialogOpen(false)}
                    disabled={bulkStatusSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (selectedProductIds.length === 0) {
                        toast({
                          title: "Warning",
                          description: "Select at least one product",
                          variant: "warning",
                        });
                        return;
                      }
                      const items = selectedProductIds
                        .map((id) => ({
                          id,
                          status: Number(bulkStatuses[String(id)]),
                        }))
                        .filter((x) => x.status === 0 || x.status === 1);
                      if (items.length === 0) {
                        toast({
                          title: "Warning",
                          description: "Provide valid statuses",
                          variant: "warning",
                        });
                        return;
                      }
                      try {
                        setBulkStatusSubmitting(true);
                        try {
                          const uniqueStatuses = Array.from(
                            new Set(items.map((i) => i.status))
                          );
                          if (uniqueStatuses.length === 1) {
                            await bulkUpdateProductStatus(token as string, {
                              ids: items.map((i) => i.id) as any,
                              status: uniqueStatuses[0],
                            });
                          } else {
                            await bulkUpdateProductStatus(token as string, {
                              products: items as any,
                            });
                          }
                        } catch (err) {
                          for (const it of items) {
                            await updateProduct(token as string, it.id, {
                              status: it.status,
                            });
                          }
                        }
                        toast({
                          title: "Success",
                          description: "Statuses updated successfully",
                          variant: "success",
                        });
                        setBulkStatusDialogOpen(false);
                        const res = await getProducts(token as string);
                        setProducts(res.data?.data ?? res.data ?? []);
                      } catch (e) {
                        toast({
                          title: "Error",
                          description: "Failed to update statuses",
                          variant: "destructive",
                        });
                      } finally {
                        setBulkStatusSubmitting(false);
                      }
                    }}
                    disabled={bulkStatusSubmitting}
                  >
                    {bulkStatusSubmitting ? "Updating..." : "Update Statuses"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductManagement;
