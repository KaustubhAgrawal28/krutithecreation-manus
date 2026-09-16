import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  LogIn,
  LogOut,
  Package,
  UserRound,
} from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/catalogue";

type HistoryItem = { name: string; quantity: number; lineTotal: number };

function formatOrderItems(items: string) {
  try {
    return JSON.parse(items) as HistoryItem[];
  } catch {
    return [];
  }
}

export default function Account() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const historyQuery = trpc.orders.history.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f3ed] text-[#2c2b28]">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ed] px-5 text-[#2c2b28]">
        <section className="w-full max-w-[520px] rounded-[2rem] bg-[#ebe2d7] p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d8c7b2] text-[#a45e42]">
            <UserRound size={23} />
          </div>
          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a45e42]">
            Your private corner
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-[-0.06em]">
            Sign in to see your orders.
          </h1>
          <p className="mx-auto mt-4 max-w-[360px] text-sm leading-6 text-[#756d64]">
            Use secure sign-in to keep your order history connected to you. We
            never store a password in this shop.
          </p>
          <Button
            type="button"
            onClick={() => startLogin()}
            className="mt-8 h-12 rounded-full bg-[#2c2b28] px-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f7f3ed] hover:bg-[#a45e42]"
          >
            <LogIn size={15} className="mr-2" /> Sign in securely
          </Button>
          <Link
            href="/"
            className="mt-6 inline-flex items-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#675f56] hover:text-[#a45e42]"
          >
            <ArrowLeft size={14} className="mr-2" /> Back to the collection
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ed] text-[#2c2b28]">
      <header className="border-b border-[#2c2b28]/10 bg-[#f7f3ed]/95 px-5 py-5 backdrop-blur-sm lg:px-10">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-[#2c2b28] hover:text-[#a45e42]"
          >
            <ArrowLeft size={17} />
            <span className="font-serif text-2xl tracking-[-0.05em]">
              कृति The Creation
            </span>
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex items-center gap-2 rounded-full border border-[#2c2b28]/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#675f56] transition-colors hover:border-[#a45e42] hover:text-[#a45e42]"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-[1100px] px-5 py-12 lg:px-10 lg:py-20">
        <div className="flex flex-col justify-between gap-6 border-b border-[#2c2b28]/12 pb-9 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a45e42]">
              Your account
            </p>
            <h1 className="mt-2 font-serif text-[clamp(3rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.08em]">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
            </h1>
          </div>
          <p className="max-w-[260px] text-sm leading-6 text-[#756d64]">
            A private record of the pieces you’ve chosen and the stories they
            carry.
          </p>
        </div>
        <section className="pt-10" aria-labelledby="order-history-title">
          <div className="flex items-center gap-3">
            <Package size={18} className="text-[#a45e42]" />
            <h2
              id="order-history-title"
              className="font-serif text-3xl tracking-[-0.05em]"
            >
              Order history
            </h2>
          </div>
          {historyQuery.isLoading ? (
            <div className="flex items-center gap-3 py-14 text-sm text-[#756d64]">
              <Loader2 className="animate-spin" size={18} /> Loading your
              orders…
            </div>
          ) : historyQuery.isError ? (
            <div className="mt-8 rounded-2xl bg-[#f1e3d7] p-6 text-sm leading-6 text-[#7d4a3b]">
              We couldn’t load your orders right now. Please refresh and try
              again.
            </div>
          ) : historyQuery.data?.length ? (
            <div className="mt-7 space-y-4">
              {historyQuery.data.map(order => {
                const items = formatOrderItems(order.items);
                return (
                  <article
                    key={order.id}
                    className="rounded-[1.5rem] border border-[#2c2b28]/10 bg-[#ebe2d7]/55 p-5 sm:p-7"
                  >
                    <div className="flex flex-col justify-between gap-4 border-b border-[#2c2b28]/10 pb-5 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a45e42]">
                          {order.orderNumber}
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-xs text-[#756d64]">
                          <CalendarDays size={14} />{" "}
                          {new Date(order.createdAt).toLocaleDateString(
                            undefined,
                            { dateStyle: "medium" }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[#d8e0d2] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5f775c]">
                          {order.status}
                        </span>
                        <strong className="font-serif text-2xl">
                          {formatPrice(order.total)}
                        </strong>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {items.map(item => (
                        <div
                          key={`${order.id}-${item.name}`}
                          className="flex justify-between gap-4 text-sm"
                        >
                          <span className="text-[#655d54]">
                            {item.name}{" "}
                            <span className="text-[#998e82]">
                              × {item.quantity}
                            </span>
                          </span>
                          <span className="font-semibold text-[#a45e42]">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] bg-[#ebe2d7] p-8 sm:p-10">
              <h3 className="font-serif text-3xl tracking-[-0.05em]">
                Nothing here yet.
              </h3>
              <p className="mt-3 max-w-[400px] text-sm leading-6 text-[#756d64]">
                Your first handmade piece will appear here after you place an
                order while signed in.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex h-11 items-center rounded-full bg-[#2c2b28] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f7f3ed] hover:bg-[#a45e42]"
              >
                Explore the collection
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
