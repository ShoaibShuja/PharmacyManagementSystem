"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Package,
  ReceiptText,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { ListSearchInput } from "@/components/shared/list-controls";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppRole } from "@/lib/auth/types";
import { getGlobalSearchData } from "@/lib/search/api";
import type { GlobalSearchResult } from "@/lib/search/types";

const resultIcons = {
  medicine: Package,
  sale: ShoppingCart,
  supplier: Truck,
  purchase: ReceiptText,
};

const resultLabels = {
  medicine: "Medicine",
  sale: "Sale",
  supplier: "Supplier",
  purchase: "Purchase order",
};

export function GlobalSearch({ role }: { role: AppRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const searchQuery = useQuery({
    queryKey: ["global-search", role],
    queryFn: () => getGlobalSearchData(role),
    enabled: open,
    staleTime: 60_000,
  });

  const results = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    if (term.length < 2) return [];
    return (searchQuery.data ?? [])
      .filter(
        (result) =>
          result.title.toLowerCase().includes(term) ||
          result.description.toLowerCase().includes(term) ||
          result.keywords.includes(term),
      )
      .slice(0, 20);
  }, [deferredSearch, searchQuery.data]);

  function openResult(result: GlobalSearchResult) {
    setOpen(false);
    setSearch("");
    const destination = `${result.href}?search=${encodeURIComponent(result.title)}`;
    if (pathname === result.href) {
      window.location.assign(destination);
      return;
    }
    router.push(destination);
  }

  return (
    <>
      <Button
        variant="outline"
        className="h-9 w-9 px-0 sm:w-64 sm:justify-start sm:px-3 sm:text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label="Search pharmacy records"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search medicines, sales, and more</span>
      </Button>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setSearch("");
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b p-5 pb-4">
            <DialogTitle>Search pharmacy records</DialogTitle>
            <DialogDescription>
              Find medicines and sales
              {role === "cashier" ? "." : ", suppliers, and purchase orders."}
            </DialogDescription>
          </DialogHeader>
          <div className="px-5 pt-4">
            <ListSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Type at least 2 characters"
              label="Global search"
            />
          </div>
          <div className="min-h-64 overflow-y-auto p-5 pt-4">
            {searchQuery.isError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Search records could not be loaded. Try again.
              </p>
            ) : deferredSearch.trim().length < 2 ? (
              <SearchHint role={role} />
            ) : searchQuery.isLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Searching records...
              </p>
            ) : results.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No matching records found. Try a name, number, barcode, or phone.
              </p>
            ) : (
              <div className="space-y-1">
                {results.map((result) => {
                  const Icon = resultIcons[result.type];
                  return (
                    <button
                      type="button"
                      key={`${result.type}-${result.id}`}
                      className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-muted"
                      onClick={() => openResult(result)}
                    >
                      <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-medium">{result.title}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {resultLabels[result.type]}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchHint({ role }: { role: AppRole }) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center">
      <Search className="mx-auto size-7 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">Start typing to search</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Use a medicine name, barcode, sale number
        {role === "cashier" ? "." : ", supplier, phone, or order number."}
      </p>
    </div>
  );
}
