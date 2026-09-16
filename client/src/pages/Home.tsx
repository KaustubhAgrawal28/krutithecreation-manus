import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Heart,
  Instagram,
  Leaf,
  Mail,
  Menu,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";
import { trpc } from "@/lib/trpc";
import {
  catalogue as fallbackCatalogue,
  categoryLabels,
  formatPrice,
  type CatalogueProduct,
  type ProductCategory,
} from "@shared/catalogue";
import { formatShipping, getShippingQuote } from "@shared/shipping";

type CartItem = { productId: string; quantity: number };
type PaymentMethod = "upi" | "whatsapp";

type CheckoutForm = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  pinCode: string;
  notes: string;
  paymentMethod: PaymentMethod;
};

const emptyForm: CheckoutForm = {
  customerName: "",
  email: "",
  phone: "",
  address: "",
  pinCode: "",
  notes: "",
  paymentMethod: "upi",
};

const categories: Array<"all" | ProductCategory> = [
  "all",
  "wall-art",
  "plant-life",
  "little-things",
];

export default function Home() {
  const { data: remoteCatalogue } = trpc.catalogue.useQuery();
  const products = remoteCatalogue?.length
    ? remoteCatalogue
    : fallbackCatalogue;
  const { user, isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<"all" | ProductCategory>(
    "all"
  );
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("kriti-the-creation-cart") || "[]"
      ) as CartItem[];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    orderNumber: string;
    total: number;
    paymentMethod: PaymentMethod;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm(current => ({
      ...current,
      customerName: current.customerName || user.name || "",
      email: current.email || user.email || "",
    }));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("kriti-the-creation-cart", JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter(product => product.category === activeCategory),
    [activeCategory, products]
  );
  const cartLines = useMemo(
    () =>
      cart
        .map(item => ({
          ...item,
          product: products.find(product => product.id === item.productId),
        }))
        .filter((item): item is CartItem & { product: CatalogueProduct } =>
          Boolean(item.product)
        ),
    [cart, products]
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartLines.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingQuote = getShippingQuote(form.pinCode, cartTotal);
  const createOrder = trpc.orders.create.useMutation({
    onSuccess: result => {
      setConfirmation(result);
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      toast.success("Your order is on its way to the studio.");
    },
    onError: error =>
      toast.error(
        error.message || "We couldn't place your order. Please try again."
      ),
  });

  const scrollToCatalogue = () => {
    document
      .getElementById("catalogue")
      ?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const addToCart = (productId: string) => {
    setCart(current => {
      const existing = current.find(item => item.productId === productId);
      if (existing)
        return current.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      return [...current, { productId, quantity: 1 }];
    });
    setCartOpen(true);
    const product = products.find(item => item.id === productId);
    if (product) toast.success(`${product.shortName} added to your cart`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(current =>
      current.flatMap(item => {
        if (item.productId !== productId) return [item];
        const quantity = item.quantity + delta;
        return quantity > 0 ? [{ ...item, quantity }] : [];
      })
    );
  };

  const submitOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartLines.length) {
      toast.error("Your cart is waiting for a little something special.");
      return;
    }
    if (!termsAccepted) {
      toast.error(
        "Please read and accept the order terms before placing your order."
      );
      return;
    }
    createOrder.mutate({
      ...form,
      termsAccepted: true,
      items: cartLines.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed] text-[#2c2b28] selection:bg-[#d4a373] selection:text-[#2c2b28]">
      <div className="border-b border-[#2c2b28]/10 bg-[#ded0bd] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4a443d]">
        Complimentary delivery on orders over ₹2,500 · Every piece is made to
        order
      </div>

      <header className="relative z-30 border-b border-[#2c2b28]/10 bg-[#f7f3ed]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-5 lg:px-10">
          <a
            href="#top"
            className="group flex items-center gap-3"
            aria-label="कृति The Creation home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2c2b28]/20 bg-[#e8d8c4] text-[#9b5c3f] transition-transform duration-200 group-hover:rotate-6">
              <Leaf size={19} strokeWidth={1.7} />
            </span>
            <span className="leading-none">
              <span className="block font-serif text-[21px] tracking-[-0.04em]">
                कृति The Creation
              </span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.3em] text-[#7c756d]">
                Macramé studio
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-9 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#625d57] lg:flex">
            <button
              type="button"
              onClick={scrollToCatalogue}
              className="transition-colors hover:text-[#a45e42]"
            >
              SHOP PIECES
            </button>
            <a href="#story" className="transition-colors hover:text-[#a45e42]">
              Our story
            </a>
            <a href="#care" className="transition-colors hover:text-[#a45e42]">
              Care guide
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="hidden items-center gap-2 rounded-full p-3 text-[#4d4841] transition-colors hover:bg-[#eadfd2] sm:flex"
              aria-label={
                isAuthenticated
                  ? "Open your account"
                  : "Sign in to your account"
              }
            >
              <UserRound size={18} strokeWidth={1.7} />
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] lg:inline">
                {isAuthenticated ? "Account" : "Sign in"}
              </span>
            </Link>
            <button
              type="button"
              className="hidden rounded-full p-3 text-[#4d4841] transition-colors hover:bg-[#eadfd2] sm:block"
              aria-label="Wishlist"
            >
              <Heart size={19} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="group relative flex items-center gap-2 rounded-full border border-[#2c2b28]/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-200 hover:border-[#a45e42] hover:bg-[#eadfd2] active:scale-[0.97]"
              aria-label={`Open cart with ${cartCount} items`}
            >
              <ShoppingBag size={17} strokeWidth={1.7} />
              <span className="hidden sm:inline">Bag</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2c2b28] px-1.5 text-[10px] text-[#f7f3ed]">
                {cartCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(open => !open)}
              className="rounded-full p-3 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="border-t border-[#2c2b28]/10 bg-[#f7f3ed] px-5 py-5 lg:hidden">
            <div className="flex flex-col gap-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#625d57]">
              <button
                type="button"
                onClick={scrollToCatalogue}
                className="text-left"
              >
                SHOP PIECES
              </button>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left"
              >
                {isAuthenticated ? "MY ACCOUNT" : "SIGN IN"}
              </Link>
              <a href="#story" onClick={() => setMobileMenuOpen(false)}>
                Our story
              </a>
              <a href="#care" onClick={() => setMobileMenuOpen(false)}>
                Care guide
              </a>
            </div>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-[1320px] gap-8 px-5 pb-16 pt-7 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:px-10 lg:pb-24 lg:pt-10">
          <div className="flex flex-col justify-center py-8 lg:py-16">
            <div className="mb-8 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a45e42]">
              <span className="h-px w-8 bg-[#a45e42]" />
              Slow-made, soul-filled
            </div>
            <h1 className="max-w-[580px] font-serif text-[clamp(3.75rem,7vw,7.15rem)] leading-[0.84] tracking-[-0.075em] text-[#302d2a]">
              Make room
              <br />
              <em className="font-serif text-[#a45e42]">for texture.</em>
            </h1>
            <p className="mt-9 max-w-[410px] text-[15px] leading-7 text-[#6e6860]">
              Handmade macramé for the corners you come home to. Thoughtfully
              knotted in small batches, designed to soften a space and stay with
              you.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button
                onClick={scrollToCatalogue}
                className="h-12 rounded-full bg-[#2c2b28] px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f7f3ed] shadow-none transition-all hover:bg-[#a45e42] active:scale-[0.97]"
              >
                Explore the edit <ArrowDownRight size={16} className="ml-2" />
              </Button>
              <a
                href="#story"
                className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#625d57]"
              >
                The knot behind it{" "}
                <ArrowUpRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>
            </div>
            <div className="mt-16 flex items-center gap-8 border-t border-[#2c2b28]/15 pt-6 text-[#6e6860]">
              <div>
                <span className="block font-serif text-2xl text-[#2c2b28]">
                  04
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.17em]">
                  Signature pieces
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl text-[#2c2b28]">
                  01
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.17em]">
                  Made by hand
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl text-[#2c2b28]">
                  04
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.17em]">
                  Small collection
                </span>
              </div>
            </div>
          </div>

          <div className="relative min-h-[470px] overflow-hidden rounded-[2rem] bg-[#c7aa8c] lg:min-h-[665px] lg:rounded-[2.6rem]">
            <img
              src="/manus-storage/knot-and-nest-hero_bdf0b4fc.jpg"
              alt="Sunlit room with a handmade macramé wall hanging"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c2b28]/30 via-transparent to-transparent" />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-[#f7f3ed]/90 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5d554c] backdrop-blur-sm lg:left-7 lg:top-7">
              <Sparkles size={13} className="text-[#a45e42]" /> New season,
              softly woven
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-[#f7f3ed] lg:bottom-7 lg:left-7 lg:right-7">
              <div>
                <p className="font-serif text-2xl tracking-[-0.04em]">
                  The Sunbeam edit
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#f7f3ed]/75">
                  A little light for your wall
                </p>
              </div>
              <button
                type="button"
                onClick={() => addToCart("sunbeam-wall-hanging")}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f3ed] text-[#2c2b28] transition-transform hover:rotate-12 active:scale-[0.95]"
                aria-label="Add Sunbeam Wall Hanging to cart"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </section>

        <section
          id="catalogue"
          className="scroll-mt-24 border-y border-[#2c2b28]/10 bg-[#ebe2d7]"
        >
          <div className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-24">
            <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <div className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a45e42]">
                  <span className="h-px w-8 bg-[#a45e42]" /> Made for your
                  everyday
                </div>
                <h2 className="font-serif text-[clamp(2.6rem,5vw,5rem)] leading-none tracking-[-0.07em]">
                  The little collection
                </h2>
              </div>
              <p className="max-w-[270px] text-sm leading-6 text-[#756d64]">
                Pieces that make a room feel more like yours. Start small, layer
                slowly.
              </p>
            </div>
            <div className="mb-10 flex flex-wrap items-center gap-2 border-b border-[#2c2b28]/15 pb-5">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all ${activeCategory === category ? "bg-[#2c2b28] text-[#f7f3ed]" : "text-[#71695f] hover:bg-[#f7f3ed]"}`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
              <span className="ml-auto hidden text-[10px] font-semibold uppercase tracking-[0.15em] text-[#625a50] sm:block">
                {filteredProducts.length} pieces
              </span>
            </div>
            <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <Reveal key={product.id} delay={index * 45}>
                  <article
                    className="group motion-card"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="relative aspect-[0.94] overflow-hidden rounded-[1.5rem] bg-[#d4c0aa]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                      />
                      {product.badge && (
                        <span className="absolute left-4 top-4 rounded-full bg-[#f7f3ed]/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#665e55] backdrop-blur-sm">
                          {product.badge}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-[#2c2b28] text-[#f7f3ed] opacity-0 shadow-lg transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#a45e42] active:scale-[0.95]"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <Plus size={19} />
                      </button>
                    </div>
                    <div className="flex items-start justify-between gap-3 pt-4">
                      <div>
                        <h3 className="font-serif text-[22px] tracking-[-0.04em]">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-[12px] leading-5 text-[#625a50]">
                          {product.description}
                        </p>
                      </div>
                      <span className="shrink-0 pt-1 text-[12px] font-semibold text-[#a45e42]">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="story"
          className="scroll-mt-24 mx-auto grid max-w-[1320px] gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-10 lg:py-28"
        >
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#d7b9a1] lg:min-h-[560px]">
            <img
              src="/manus-storage/knot-and-nest-rainbow_2baf4ad7.jpg"
              alt="Handmade rainbow macramé keepsake"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-full bg-[#f7f3ed]/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#615950] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#a45e42]" /> Crafted in
              small batches
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a45e42]">
              The knot behind it
            </div>
            <h2 className="max-w-[580px] font-serif text-[clamp(2.75rem,5vw,5rem)] leading-[0.92] tracking-[-0.07em]">
              Objects with a little more{" "}
              <em className="text-[#a45e42]">meaning.</em>
            </h2>
            <p className="mt-8 max-w-[500px] text-[15px] leading-7 text-[#706960]">
              कृति The Creation began at a dining table, with a coil of cotton
              cord and a belief that the things we live with should feel good to
              hold, look good to keep and take their time to make.
            </p>
            <p className="mt-5 max-w-[500px] text-[15px] leading-7 text-[#706960]">
              Each piece is knotted by hand, one at a time, so small variations
              are part of its story — not a flaw to hide.
            </p>
            <div className="mt-10 grid max-w-[480px] grid-cols-2 gap-8 border-t border-[#2c2b28]/15 pt-6">
              <div>
                <p className="font-serif text-3xl tracking-[-0.05em]">01</p>
                <p className="mt-2 text-[10px] font-semibold uppercase leading-4 tracking-[0.15em] text-[#80776c]">
                  Hands behind every knot
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl tracking-[-0.05em]">02</p>
                <p className="mt-2 text-[10px] font-semibold uppercase leading-4 tracking-[0.15em] text-[#80776c]">
                  Materials chosen with care
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="care" className="scroll-mt-24 bg-[#2c2b28] text-[#f7f3ed]">
          <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:px-10 lg:py-20">
            <div>
              <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d4a373]">
                Soft things, well kept
              </div>
              <h2 className="max-w-[430px] font-serif text-[clamp(2.7rem,4vw,4.5rem)] leading-[0.9] tracking-[-0.07em]">
                A little care goes a long way.
              </h2>
              <p className="mt-7 max-w-[370px] text-sm leading-6 text-[#cbc0b3]">
                Keep your piece out of direct moisture, fluff the fringe with
                your fingers and let the knots do the talking.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-[#f7f3ed]/15 bg-[#f7f3ed]/15 sm:grid-cols-3">
              {[
                {
                  icon: PackageCheck,
                  title: "Packed with care",
                  text: "Prepared carefully for its journey to you.",
                },
                {
                  icon: Leaf,
                  title: "Natural materials",
                  text: "Cotton cord, beechwood and brass appear across the collection.",
                },
                {
                  icon: MessageCircle,
                  title: "Here to help",
                  text: "Questions? Email us before or after your order.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-[#363330] p-6">
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    className="mb-9 text-[#d4a373]"
                    aria-hidden="true"
                  />
                  <h3 className="font-serif text-xl tracking-[-0.04em]">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#b9aea1]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-[#e7d8c6] px-5 py-12 lg:px-10">
          <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-9 sm:flex-row sm:items-end">
            <div>
              <div className="font-serif text-[25px] tracking-[-0.05em]">
                कृति The Creation
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-[0.17em] text-[#625a50]">
                Handmade macramé for soft spaces
              </p>
              <p className="mt-3 max-w-[340px] text-xs leading-5 text-[#675d52]">
                Business contact:{" "}
                <a
                  href="mailto:krutithecreation1@gmail.com"
                  className="underline underline-offset-2"
                >
                  krutithecreation1@gmail.com
                </a>
                . Legal seller and grievance details will be published before
                launch.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <a
                href="mailto:krutithecreation1@gmail.com"
                className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.08em] text-[#675d52] transition-colors hover:text-[#a45e42]"
                aria-label="Email कृति The Creation"
              >
                <Mail size={14} aria-hidden="true" />
                Email us
              </a>
              <a
                href="#top"
                className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#675d52]"
              >
                Back to top
              </a>
              <a
                href="/privacy"
                className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#675d52]"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#675d52]"
              >
                Terms
              </a>
              <a
                href="/cookies"
                className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#675d52]"
              >
                Cookies
              </a>
              <a
                href="/refunds"
                className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#675d52]"
              >
                Refunds
              </a>
              <a
                href="https://www.instagram.com/krutithecreation/"
                target="_blank"
                rel="noreferrer"
                aria-label="Open कृति The Creation on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2c2b28]/20 text-[#675d52] transition-colors hover:bg-[#f7f3ed]"
              >
                <Instagram size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </footer>
      </main>

      {cartOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#2c2b28]/35 backdrop-blur-[2px]"
          onClick={() => setCartOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed bottom-0 right-0 top-0 z-[60] flex w-full max-w-[460px] flex-col bg-[#f7f3ed] shadow-2xl transition-transform duration-300 ease-out ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Shopping cart"
        aria-hidden={!cartOpen}
      >
        <div className="flex items-center justify-between border-b border-[#2c2b28]/10 px-6 py-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a45e42]">
              Your selection
            </p>
            <h2 className="mt-1 font-serif text-3xl tracking-[-0.05em]">
              The bag <span className="text-[#a45e42]">({cartCount})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="rounded-full p-2 transition-colors hover:bg-[#eadfd2]"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!cartLines.length ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#eadfd2] text-[#a45e42]">
                <ShoppingBag size={28} strokeWidth={1.4} />
              </div>
              <h3 className="font-serif text-2xl">A little space to fill.</h3>
              <p className="mt-2 max-w-[245px] text-sm leading-6 text-[#7d746a]">
                Your future favourite might be waiting in the collection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  scrollToCatalogue();
                }}
                className="mt-7 rounded-full bg-[#2c2b28] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#f7f3ed]"
              >
                Browse pieces
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {cartLines.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 border-b border-[#2c2b28]/10 pb-5"
                >
                  <img
                    src={product.image}
                    alt=""
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-lg leading-tight">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#877d71]">
                          {formatPrice(product.price)} each
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#a45e42]">
                        {formatPrice(product.price * quantity)}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center gap-3 rounded-full border border-[#2c2b28]/15 px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="p-1"
                          aria-label={`Decrease ${product.name} quantity`}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="min-w-4 text-center text-xs">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          className="p-1"
                          aria-label={`Increase ${product.name} quantity`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCart(current =>
                            current.filter(
                              item => item.productId !== product.id
                            )
                          )
                        }
                        className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b9187] transition-colors hover:text-[#a45e42]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cartLines.length > 0 && (
          <div className="border-t border-[#2c2b28]/10 bg-[#eee5db] px-6 py-6">
            <div className="flex justify-between text-sm text-[#71695f]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#2c2b28]">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[#8c8176]">
              Delivery is calculated after we confirm your pin code. Free over
              ₹2,500.
            </p>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                setCheckoutOpen(true);
              }}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[#2c2b28] text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f7f3ed] transition-all hover:bg-[#a45e42] active:scale-[0.98]"
            >
              Continue to order <ArrowUpRight size={16} className="ml-2" />
            </button>
          </div>
        )}
      </aside>

      {checkoutOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#2c2b28]/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
        >
          <div className="max-h-[94vh] w-full max-w-[700px] overflow-y-auto rounded-t-[2rem] bg-[#f7f3ed] shadow-2xl sm:rounded-[2rem]">
            <div className="flex items-start justify-between border-b border-[#2c2b28]/10 px-6 py-6 sm:px-9">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a45e42]">
                  Almost yours
                </p>
                <h2
                  id="checkout-title"
                  className="mt-1 font-serif text-3xl tracking-[-0.05em]"
                >
                  Place your order
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="rounded-full p-2 hover:bg-[#eadfd2]"
                aria-label="Close checkout"
              >
                <X size={22} />
              </button>
            </div>
            <form
              onSubmit={submitOrder}
              className="space-y-6 px-6 py-6 sm:px-9 sm:py-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#756c62]">
                  Your name
                  <input
                    required
                    autoComplete="name"
                    value={form.customerName}
                    onChange={event =>
                      setForm({ ...form, customerName: event.target.value })
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#2c2b28]/15 bg-transparent px-4 text-sm font-normal normal-case tracking-normal outline-none transition-colors focus:border-[#a45e42]"
                    placeholder="Aarav Sharma"
                  />
                </label>
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#756c62]">
                  Email address
                  <input
                    required
                    autoComplete="email"
                    type="email"
                    value={form.email}
                    onChange={event =>
                      setForm({ ...form, email: event.target.value })
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#2c2b28]/15 bg-transparent px-4 text-sm font-normal normal-case tracking-normal outline-none transition-colors focus:border-[#a45e42]"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#756c62]">
                  Phone / WhatsApp
                  <input
                    required
                    autoComplete="tel"
                    type="tel"
                    value={form.phone}
                    onChange={event =>
                      setForm({ ...form, phone: event.target.value })
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#2c2b28]/15 bg-transparent px-4 text-sm font-normal normal-case tracking-normal outline-none transition-colors focus:border-[#a45e42]"
                    placeholder="+91 98765 43210"
                  />
                </label>
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#756c62]">
                  6-digit pin code
                  <input
                    required
                    autoComplete="postal-code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    value={form.pinCode}
                    onChange={event =>
                      setForm({
                        ...form,
                        pinCode: event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      })
                    }
                    className="mt-2 h-12 w-full rounded-xl border border-[#2c2b28]/15 bg-transparent px-4 text-sm font-normal normal-case tracking-normal outline-none transition-colors focus:border-[#a45e42]"
                    placeholder="560001"
                  />
                </label>
              </div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#756c62]">
                Delivery address
                <textarea
                  required
                  autoComplete="street-address"
                  value={form.address}
                  onChange={event =>
                    setForm({ ...form, address: event.target.value })
                  }
                  className="mt-2 min-h-20 w-full resize-y rounded-xl border border-[#2c2b28]/15 bg-transparent px-4 py-3 text-sm font-normal normal-case tracking-normal outline-none transition-colors focus:border-[#a45e42]"
                  placeholder="Flat, street, city"
                />
              </label>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#756c62]">
                A note for the studio{" "}
                <span className="font-normal normal-case tracking-normal text-[#a39a8f]">
                  (optional)
                </span>
                <textarea
                  value={form.notes}
                  onChange={event =>
                    setForm({ ...form, notes: event.target.value })
                  }
                  className="mt-2 min-h-24 w-full resize-y rounded-xl border border-[#2c2b28]/15 bg-transparent px-4 py-3 text-sm font-normal normal-case tracking-normal outline-none transition-colors focus:border-[#a45e42]"
                  placeholder="Gift note, colour preference, anything we should know..."
                />
              </label>
              <fieldset>
                <legend className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#756c62]">
                  How would you like to pay?
                </legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${form.paymentMethod === "upi" ? "border-[#a45e42] bg-[#f1e5d9]" : "border-[#2c2b28]/15"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={form.paymentMethod === "upi"}
                      onChange={() =>
                        setForm({ ...form, paymentMethod: "upi" })
                      }
                      className="mt-1 accent-[#a45e42]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        UPI / QR
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#847a70]">
                        We’ll share payment details after confirming your order.
                      </span>
                    </span>
                  </label>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${form.paymentMethod === "whatsapp" ? "border-[#a45e42] bg-[#f1e5d9]" : "border-[#2c2b28]/15"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="whatsapp"
                      checked={form.paymentMethod === "whatsapp"}
                      onChange={() =>
                        setForm({ ...form, paymentMethod: "whatsapp" })
                      }
                      className="mt-1 accent-[#a45e42]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        WhatsApp handoff
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#847a70]">
                        Place your order, then we’ll coordinate payment there.
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>
              <div className="border-t border-[#2c2b28]/10 pt-5">
                <label className="flex items-start gap-3 text-sm leading-6 text-[#5f584f]">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={event => setTermsAccepted(event.target.checked)}
                    className="mt-1.5 h-4 w-4 shrink-0 accent-[#8d4f38]"
                  />
                  <span>
                    I have read and accept the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#8d4f38] underline underline-offset-2"
                    >
                      Terms
                    </a>
                    ,{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#8d4f38] underline underline-offset-2"
                    >
                      Privacy policy
                    </a>
                    , and{" "}
                    <a
                      href="/refunds"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#8d4f38] underline underline-offset-2"
                    >
                      Refund policy
                    </a>
                    . I understand my details are used to process this order.
                  </span>
                </label>
                <div className="mb-4 mt-5 space-y-2 text-sm">
                  <div className="flex justify-between text-[#81776c]">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#81776c]">
                    <span>Delivery</span>
                    <span>
                      {form.pinCode.length === 6
                        ? formatShipping(shippingQuote.shipping)
                        : "Enter pin code"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 text-base font-semibold text-[#2c2b28]">
                    <span>Order total</span>
                    <span className="font-serif text-2xl">
                      {formatPrice(
                        form.pinCode.length === 6
                          ? shippingQuote.total
                          : cartTotal
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={createOrder.isPending}
                    className="flex min-h-12 items-center justify-center rounded-full bg-[#2c2b28] px-6 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#f7f3ed] transition-all hover:bg-[#8d4f38] disabled:cursor-wait disabled:opacity-60 active:scale-[0.98]"
                  >
                    {createOrder.isPending ? "Sending order" : "Place order"}
                    <ArrowUpRight
                      size={16}
                      className="ml-2"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmation && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2c2b28]/50 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <div className="w-full max-w-[520px] rounded-[2rem] bg-[#f7f3ed] p-7 text-center shadow-2xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d8e0d2] text-[#5f775c]">
              <Check size={29} />
            </div>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a45e42]">
              Order received
            </p>
            <h2
              id="success-title"
              className="mt-2 font-serif text-4xl tracking-[-0.06em]"
            >
              Thank you, {form.customerName || "friend"}.
            </h2>
            <p className="mx-auto mt-4 max-w-[370px] text-sm leading-6 text-[#756c62]">
              Your order{" "}
              <strong className="text-[#2c2b28]">
                {confirmation.orderNumber}
              </strong>{" "}
              has landed safely. We’ll confirm the details and payment steps
              shortly.
            </p>
            <div className="mt-7 rounded-2xl bg-[#eee5db] p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-[#81776c]">Total</span>
                <strong>{formatPrice(confirmation.total)}</strong>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-[#81776c]">Payment</span>
                <strong>
                  {confirmation.paymentMethod === "upi"
                    ? "UPI / QR"
                    : "WhatsApp"}
                </strong>
              </div>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hello कृति The Creation, I just placed order ${confirmation.orderNumber} for ${formatPrice(confirmation.total)}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 flex-1 items-center justify-center rounded-full border border-[#2c2b28]/20 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-[#eadfd2]"
              >
                <MessageCircle size={16} className="mr-2" /> Open WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="h-11 flex-1 rounded-full bg-[#2c2b28] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f7f3ed] transition-colors hover:bg-[#a45e42]"
              >
                Keep browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
