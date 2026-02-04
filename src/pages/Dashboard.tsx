import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, Plus, Edit2, Trash2, Bell, BellOff, MapPin, Phone, Loader2, Calendar, Gift, Percent } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SHOP_CATEGORIES } from '@/lib/constants';
import { Database } from '@/integrations/supabase/types';
import { StockBadge } from '@/components/inventory/StockBadge';
import { Badge } from '@/components/ui/badge';

type ShopCategory = Database['public']['Enums']['shop_category'];
type StockStatus = Database['public']['Enums']['stock_status'];

interface Shop {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  category: ShopCategory;
  is_active: boolean;
  general_discount_description: string | null;
  has_general_discount: boolean;
  apply_discount_to_all: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  is_on_sale: boolean;
  sale_percentage: number;
  show_sale_alert: boolean;
  image_url: string | null;
  category: string | null;
  stock_status: StockStatus;
  stock_quantity: number | null;
  restock_date: string | null;
  special_offer_description: string | null;
  has_special_offer: boolean;
  use_shop_discount: boolean;
}

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Shop form state
  const [shopForm, setShopForm] = useState({
    name: '',
    owner_name: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    category: 'other' as ShopCategory,
  });

  // Shop discount form state
  const [discountForm, setDiscountForm] = useState({
    general_discount_description: '',
    has_general_discount: false,
    apply_discount_to_all: true,
  });
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    is_on_sale: false,
    sale_percentage: '',
    show_sale_alert: false,
    image_url: '',
    category: '',
    stock_status: 'in_stock' as StockStatus,
    stock_quantity: '',
    restock_date: '',
    special_offer_description: '',
    has_special_offer: false,
    use_shop_discount: true,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [shopDialogOpen, setShopDialogOpen] = useState(false);

  // Redirect if not shopkeeper
  useEffect(() => {
    if (!authLoading && (!user || profile?.user_type !== 'shopkeeper')) {
      navigate('/auth?type=shopkeeper');
    }
  }, [user, profile, authLoading, navigate]);

  // Fetch shop and products
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (shopData) {
        setShop(shopData as Shop);
        setShopForm({
          name: shopData.name,
          owner_name: shopData.owner_name,
          phone: shopData.phone,
          address: shopData.address,
          latitude: String(shopData.latitude),
          longitude: String(shopData.longitude),
          category: shopData.category as ShopCategory,
        });
        setDiscountForm({
          general_discount_description: shopData.general_discount_description || '',
          has_general_discount: shopData.has_general_discount,
          apply_discount_to_all: shopData.apply_discount_to_all,
        });

        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.id)
          .order('created_at', { ascending: false });

        if (productsData) {
          setProducts(productsData as Product[]);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSaveShop = async () => {
    if (!user) return;

    setSaving(true);

    const shopData = {
      owner_id: user.id,
      name: shopForm.name,
      owner_name: shopForm.owner_name,
      phone: shopForm.phone,
      address: shopForm.address,
      latitude: parseFloat(shopForm.latitude),
      longitude: parseFloat(shopForm.longitude),
      category: shopForm.category,
    };

    if (shop) {
      const { error } = await supabase
        .from('shops')
        .update(shopData)
        .eq('id', shop.id);

      if (error) {
        toast({ title: 'Error updating shop', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Shop updated successfully!' });
        setShop({ ...shop, ...shopData });
      }
    } else {
      const { data, error } = await supabase
        .from('shops')
        .insert(shopData)
        .select()
        .single();

      if (error) {
        toast({ title: 'Error creating shop', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Shop created successfully!' });
        setShop(data as Shop);
      }
    }

    setSaving(false);
    setShopDialogOpen(false);
  };

  const handleSaveDiscount = async () => {
    if (!shop) return;

    setSaving(true);

    const { error } = await supabase
      .from('shops')
      .update({
        general_discount_description: discountForm.general_discount_description || null,
        has_general_discount: discountForm.has_general_discount,
        apply_discount_to_all: discountForm.apply_discount_to_all,
      })
      .eq('id', shop.id);

    if (error) {
      toast({ title: 'Error saving discount', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Discount settings saved!' });
      setShop({
        ...shop,
        general_discount_description: discountForm.general_discount_description || null,
        has_general_discount: discountForm.has_general_discount,
        apply_discount_to_all: discountForm.apply_discount_to_all,
      });
    }

    setSaving(false);
    setDiscountDialogOpen(false);
  };

  const handleSaveProduct = async () => {
    if (!shop) return;

    setSaving(true);

    const productData = {
      shop_id: shop.id,
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      is_on_sale: productForm.is_on_sale,
      sale_percentage: productForm.sale_percentage ? parseInt(productForm.sale_percentage) : 0,
      show_sale_alert: productForm.show_sale_alert,
      image_url: productForm.image_url || null,
      category: productForm.category || null,
      stock_status: productForm.stock_status,
      stock_quantity: productForm.stock_quantity ? parseInt(productForm.stock_quantity) : null,
      restock_date: productForm.restock_date || null,
      special_offer_description: productForm.special_offer_description || null,
      has_special_offer: productForm.has_special_offer,
      use_shop_discount: productForm.use_shop_discount,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast({ title: 'Error updating product', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Product updated!' });
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
      }
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        toast({ title: 'Error adding product', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Product added!' });
        setProducts([data as Product, ...products]);
      }
    }

    setSaving(false);
    setProductDialogOpen(false);
    resetProductForm();
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      toast({ title: 'Error deleting product', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Product deleted!' });
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const toggleSaleAlert = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ show_sale_alert: !product.show_sale_alert })
      .eq('id', product.id);

    if (!error) {
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, show_sale_alert: !p.show_sale_alert } : p
      ));
      toast({ 
        title: product.show_sale_alert ? 'Sale alert hidden' : 'Sale alert shown to customers!' 
      });
    }
  };

  const toggleProductShopDiscount = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ use_shop_discount: !product.use_shop_discount })
      .eq('id', product.id);

    if (!error) {
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, use_shop_discount: !p.use_shop_discount } : p
      ));
      toast({ 
        title: product.use_shop_discount ? 'Shop discount disabled for this product' : 'Shop discount enabled for this product!' 
      });
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      original_price: '',
      is_on_sale: false,
      sale_percentage: '',
      show_sale_alert: false,
      image_url: '',
      category: '',
      stock_status: 'in_stock',
      stock_quantity: '',
      restock_date: '',
      special_offer_description: '',
      has_special_offer: false,
      use_shop_discount: true,
    });
    setEditingProduct(null);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      original_price: product.original_price ? String(product.original_price) : '',
      is_on_sale: product.is_on_sale,
      sale_percentage: product.sale_percentage ? String(product.sale_percentage) : '',
      show_sale_alert: product.show_sale_alert,
      image_url: product.image_url || '',
      category: product.category || '',
      stock_status: product.stock_status,
      stock_quantity: product.stock_quantity ? String(product.stock_quantity) : '',
      restock_date: product.restock_date || '',
      special_offer_description: product.special_offer_description || '',
      has_special_offer: product.has_special_offer,
      use_shop_discount: product.use_shop_discount,
    });
    setProductDialogOpen(true);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Shopkeeper Dashboard</h1>

          {/* Shop Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{shop?.name || 'Your Shop'}</CardTitle>
                    <CardDescription>
                      {shop ? 'Manage your shop details' : 'Set up your shop to start adding products'}
                    </CardDescription>
                  </div>
                </div>
                <Dialog open={shopDialogOpen} onOpenChange={setShopDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant={shop ? 'outline' : 'default'} className="gap-2">
                      {shop ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {shop ? 'Edit Shop' : 'Create Shop'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{shop ? 'Edit Shop' : 'Create Your Shop'}</DialogTitle>
                      <DialogDescription>
                        Enter your shop details below
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="shop-name">Shop Name</Label>
                        <Input
                          id="shop-name"
                          value={shopForm.name}
                          onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                          placeholder="My Grocery Store"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner-name">Owner Name</Label>
                        <Input
                          id="owner-name"
                          value={shopForm.owner_name}
                          onChange={(e) => setShopForm({ ...shopForm, owner_name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={shopForm.phone}
                          onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={shopForm.address}
                          onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                          placeholder="123 Main Street, City"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            value={shopForm.latitude}
                            onChange={(e) => setShopForm({ ...shopForm, latitude: e.target.value })}
                            placeholder="28.6139"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            value={shopForm.longitude}
                            onChange={(e) => setShopForm({ ...shopForm, longitude: e.target.value })}
                            placeholder="77.2090"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Shop Category</Label>
                        <Select
                          value={shopForm.category}
                          onValueChange={(value: ShopCategory) => setShopForm({ ...shopForm, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SHOP_CATEGORIES.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSaveShop} className="w-full" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        {shop ? 'Update Shop' : 'Create Shop'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            {shop && (
              <CardContent>
                <div className="grid gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {shop.address}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {shop.phone}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* General Discount Section */}
          {shop && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Percent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        General Discount
                        {shop.has_general_discount && (
                          <Badge variant="default" className="bg-primary">Active</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Set a discount offer that applies to your products
                      </CardDescription>
                    </div>
                  </div>
                  <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Configure
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>General Discount Settings</DialogTitle>
                        <DialogDescription>
                          Create a discount offer for your shop products
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="has-discount">Enable General Discount</Label>
                          <Switch
                            id="has-discount"
                            checked={discountForm.has_general_discount}
                            onCheckedChange={(checked) => setDiscountForm({ ...discountForm, has_general_discount: checked })}
                          />
                        </div>

                        {discountForm.has_general_discount && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="discount-description">Discount Description</Label>
                              <Textarea
                                id="discount-description"
                                value={discountForm.general_discount_description}
                                onChange={(e) => setDiscountForm({ ...discountForm, general_discount_description: e.target.value })}
                                placeholder="e.g., Buy any 2 products and get 10% off! Valid till month end."
                                rows={3}
                              />
                              <p className="text-xs text-muted-foreground">
                                This message will be shown to customers on your products
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="apply-all">Apply to All Products</Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                  When off, you can select specific products
                                </p>
                              </div>
                              <Switch
                                id="apply-all"
                                checked={discountForm.apply_discount_to_all}
                                onCheckedChange={(checked) => setDiscountForm({ ...discountForm, apply_discount_to_all: checked })}
                              />
                            </div>

                            {!discountForm.apply_discount_to_all && (
                              <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                                💡 To apply discount to specific products, toggle the discount icon on each product in the list below.
                              </p>
                            )}
                          </>
                        )}

                        <Button onClick={handleSaveDiscount} className="w-full" disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                          Save Discount Settings
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              {shop.has_general_discount && shop.general_discount_description && (
                <CardContent>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm flex items-center gap-2">
                      <Percent className="h-4 w-4 text-primary" />
                      <span className="font-medium">{shop.general_discount_description}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {shop.apply_discount_to_all 
                        ? 'Applied to all products' 
                        : 'Applied to selected products only'}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Products Section */}
          {shop && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle>Products ({products.length})</CardTitle>
                      <CardDescription>Manage your product listings</CardDescription>
                    </div>
                  </div>
                  <Dialog open={productDialogOpen} onOpenChange={(open) => {
                    setProductDialogOpen(open);
                    if (!open) resetProductForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                        <DialogDescription>
                          Enter product details below
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="product-name">Product Name</Label>
                          <Input
                            id="product-name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="Basmati Rice 5kg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            placeholder="Premium quality basmati rice..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                              placeholder="299"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="original-price">Original Price (₹)</Label>
                            <Input
                              id="original-price"
                              type="number"
                              value={productForm.original_price}
                              onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                              placeholder="399"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="is-on-sale">On Sale</Label>
                          <Switch
                            id="is-on-sale"
                            checked={productForm.is_on_sale}
                            onCheckedChange={(checked) => setProductForm({ ...productForm, is_on_sale: checked })}
                          />
                        </div>
                        {productForm.is_on_sale && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="sale-percentage">Sale Percentage (%)</Label>
                              <Input
                                id="sale-percentage"
                                type="number"
                                value={productForm.sale_percentage}
                                onChange={(e) => setProductForm({ ...productForm, sale_percentage: e.target.value })}
                                placeholder="25"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="show-sale-alert">Show Sale Alert to Customers</Label>
                              <Switch
                                id="show-sale-alert"
                                checked={productForm.show_sale_alert}
                                onCheckedChange={(checked) => setProductForm({ ...productForm, show_sale_alert: checked })}
                              />
                            </div>
                          </>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="image-url">Image URL (Optional)</Label>
                          <Input
                            id="image-url"
                            value={productForm.image_url}
                            onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product-category">Category (Optional)</Label>
                          <Input
                            id="product-category"
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            placeholder="Groceries"
                          />
                        </div>

                        {/* Special Offers Section */}
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium mb-4 flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            Special Offers & Gifts
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="has-special-offer">Enable Special Offer</Label>
                              <Switch
                                id="has-special-offer"
                                checked={productForm.has_special_offer}
                                onCheckedChange={(checked) => setProductForm({ ...productForm, has_special_offer: checked })}
                              />
                            </div>

                            {productForm.has_special_offer && (
                              <div className="space-y-2">
                                <Label htmlFor="special-offer">Offer Description</Label>
                                <Textarea
                                  id="special-offer"
                                  value={productForm.special_offer_description}
                                  onChange={(e) => setProductForm({ ...productForm, special_offer_description: e.target.value })}
                                  placeholder="e.g., 🎁 Scratch to Win! Free charger worth ₹500, Buy 1 Get 1 Free..."
                                  rows={2}
                                />
                                <p className="text-xs text-muted-foreground">
                                  This will be shown as a special alert to customers
                                </p>
                              </div>
                            )}

                            {shop.has_general_discount && !shop.apply_discount_to_all && (
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="use-shop-discount">Use Shop's General Discount</Label>
                                  <p className="text-xs text-muted-foreground">Apply shop discount to this product</p>
                                </div>
                                <Switch
                                  id="use-shop-discount"
                                  checked={productForm.use_shop_discount}
                                  onCheckedChange={(checked) => setProductForm({ ...productForm, use_shop_discount: checked })}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stock Management Section */}
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium mb-4 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Inventory Management
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="stock-status">Stock Status</Label>
                              <Select
                                value={productForm.stock_status}
                                onValueChange={(value: StockStatus) => setProductForm({ ...productForm, stock_status: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select stock status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in_stock">In Stock</SelectItem>
                                  <SelectItem value="limited">Limited Stock</SelectItem>
                                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {productForm.stock_status === 'limited' && (
                              <div className="space-y-2">
                                <Label htmlFor="stock-quantity">Remaining Quantity</Label>
                                <Input
                                  id="stock-quantity"
                                  type="number"
                                  min="1"
                                  value={productForm.stock_quantity}
                                  onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                                  placeholder="e.g., 5"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Customers will see "Only X left" message
                                </p>
                              </div>
                            )}

                            {productForm.stock_status === 'out_of_stock' && (
                              <div className="space-y-2">
                                <Label htmlFor="restock-date" className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Expected Restock Date (Optional)
                                </Label>
                                <Input
                                  id="restock-date"
                                  type="date"
                                  value={productForm.restock_date}
                                  onChange={(e) => setProductForm({ ...productForm, restock_date: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Customers will be notified when restocked
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button onClick={handleSaveProduct} className="w-full" disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                          {editingProduct ? 'Update Product' : 'Add Product'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No products yet. Add your first product!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map(product => (
                      <div 
                        key={product.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium truncate">{product.name}</h3>
                            {product.show_sale_alert && product.is_on_sale && (
                              <span className="sale-badge">-{product.sale_percentage}%</span>
                            )}
                            <StockBadge 
                              status={product.stock_status} 
                              quantity={product.stock_quantity}
                            />
                            {product.has_special_offer && (
                              <Badge variant="outline" className="gap-1 border-accent text-accent">
                                <Gift className="h-3 w-3" />
                                Offer
                              </Badge>
                            )}
                            {shop.has_general_discount && (shop.apply_discount_to_all || product.use_shop_discount) && (
                              <Badge variant="outline" className="gap-1 border-primary text-primary">
                                <Percent className="h-3 w-3" />
                                Discount
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-primary font-semibold">₹{product.price}</span>
                            {product.is_on_sale && product.original_price && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{product.original_price}
                              </span>
                            )}
                          </div>
                          {product.stock_status === 'out_of_stock' && product.restock_date && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expected restock: {new Date(product.restock_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {shop.has_general_discount && !shop.apply_discount_to_all && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleProductShopDiscount(product)}
                              title={product.use_shop_discount ? 'Disable shop discount' : 'Enable shop discount'}
                            >
                              <Percent className={`h-4 w-4 ${product.use_shop_discount ? 'text-primary' : 'text-muted-foreground'}`} />
                            </Button>
                          )}
                          {product.is_on_sale && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSaleAlert(product)}
                              title={product.show_sale_alert ? 'Hide sale alert' : 'Show sale alert'}
                            >
                              {product.show_sale_alert ? (
                                <Bell className="h-4 w-4 text-accent" />
                              ) : (
                                <BellOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditProduct(product)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
