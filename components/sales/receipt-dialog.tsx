"use client";

import { Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SaleReceipt } from "@/lib/sales/types";

type ReceiptSettings = {
  pharmacyName: string;
  phone: string | null;
  address: string | null;
  currencyCode: string;
  receiptFooter: string | null;
};

export function ReceiptDialog({
  receipt,
  settings,
  open,
  onOpenChange,
  onStartNextSale,
}: {
  receipt: SaleReceipt | null;
  settings: ReceiptSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartNextSale: () => void;
}) {
  if (!receipt) return null;
  const activeReceipt = receipt;

  async function downloadPdf() {
    try {
      const { jsPDF } = await import("jspdf");
      const document = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 180],
      });
      let y = 10;

      document.setFontSize(15);
      document.text(settings.pharmacyName, 40, y, { align: "center" });
      y += 6;
      document.setFontSize(8);
      if (settings.address) {
        document.text(settings.address, 40, y, {
          align: "center",
          maxWidth: 68,
        });
        y += 5;
      }
      if (settings.phone) {
        document.text(settings.phone, 40, y, { align: "center" });
        y += 5;
      }

      document.line(6, y, 74, y);
      y += 5;
      document.text(`Receipt: ${activeReceipt.sale_number}`, 6, y);
      y += 4;
      document.text(
        `Date: ${new Date(activeReceipt.completed_at).toLocaleString()}`,
        6,
        y,
      );
      y += 4;
      document.text(`Payment: ${activeReceipt.payment_method}`, 6, y);
      y += 5;
      document.line(6, y, 74, y);
      y += 5;

      for (const item of activeReceipt.items) {
        document.setFontSize(8);
        document.text(item.medicine_name, 6, y, { maxWidth: 45 });
        document.text(
          `${settings.currencyCode} ${item.line_total.toFixed(2)}`,
          74,
          y,
          { align: "right" },
        );
        y += 4;
        document.setFontSize(7);
        document.text(
          `${item.quantity} x ${item.unit_price.toFixed(2)} · Batch ${item.batch_number}`,
          8,
          y,
        );
        y += 5;
      }

      document.line(6, y, 74, y);
      y += 5;
      document.setFontSize(8);
      document.text("Subtotal", 40, y);
      document.text(activeReceipt.subtotal.toFixed(2), 74, y, { align: "right" });
      y += 4;
      document.text("Discount", 40, y);
      document.text(activeReceipt.discount_amount.toFixed(2), 74, y, {
        align: "right",
      });
      y += 5;
      document.setFontSize(11);
      document.text("Total", 40, y);
      document.text(
        `${settings.currencyCode} ${activeReceipt.total_amount.toFixed(2)}`,
        74,
        y,
        { align: "right" },
      );
      y += 8;

      if (settings.receiptFooter) {
        document.setFontSize(7);
        document.text(settings.receiptFooter, 40, y, {
          align: "center",
          maxWidth: 68,
        });
      }

      document.save(`${activeReceipt.sale_number}.pdf`);
    } catch {
      toast.error("The PDF receipt could not be generated.");
    }
  }

  function printReceipt() {
    const printWindow = window.open("", "_blank", "width=420,height=720");
    if (!printWindow) {
      toast.error("Allow pop-ups to print the receipt.");
      return;
    }

    printWindow.document.write(buildReceiptHtml(activeReceipt, settings));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sale completed</DialogTitle>
          <DialogDescription>
            Receipt {receipt.sale_number}
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto w-full max-w-sm rounded-lg border bg-white p-5 text-sm text-slate-950 shadow-sm">
          <div className="text-center">
            <p className="text-lg font-bold">{settings.pharmacyName}</p>
            {settings.address ? (
              <p className="mt-1 text-xs text-slate-600">{settings.address}</p>
            ) : null}
            {settings.phone ? (
              <p className="text-xs text-slate-600">{settings.phone}</p>
            ) : null}
          </div>

          <div className="my-4 border-y border-dashed py-3 text-xs">
            <ReceiptRow label="Receipt" value={receipt.sale_number} />
            <ReceiptRow
              label="Date"
              value={new Date(receipt.completed_at).toLocaleString()}
            />
            <ReceiptRow
              label="Payment"
              value={capitalize(receipt.payment_method)}
            />
          </div>

          <div className="space-y-3">
            {receipt.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between gap-4 font-medium">
                  <span>{item.medicine_name}</span>
                  <span>{item.line_total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {item.quantity} × {item.unit_price.toFixed(2)} · Batch{" "}
                  {item.batch_number}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-dashed pt-3">
            <ReceiptRow
              label="Subtotal"
              value={`${settings.currencyCode} ${receipt.subtotal.toFixed(2)}`}
            />
            <ReceiptRow
              label="Discount"
              value={`${settings.currencyCode} ${receipt.discount_amount.toFixed(2)}`}
            />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>
                {settings.currencyCode} {receipt.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {settings.receiptFooter ? (
            <p className="mt-5 text-center text-xs text-slate-500">
              {settings.receiptFooter}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:flex-wrap">
          <div className="flex gap-2">
            <Button variant="outline" onClick={printReceipt}>
              <Printer className="size-4" />
              Print
            </Button>
            <Button variant="outline" onClick={downloadPdf}>
              <Download className="size-4" />
              PDF
            </Button>
          </div>
          <Button onClick={onStartNextSale}>
            <Plus className="size-4" />
            Start next sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

function buildReceiptHtml(
  receipt: SaleReceipt,
  settings: ReceiptSettings,
) {
  const items = receipt.items
    .map(
      (item) => `
        <div class="item">
          <div class="row strong"><span>${escapeHtml(item.medicine_name)}</span><span>${item.line_total.toFixed(2)}</span></div>
          <div class="muted">${item.quantity} x ${item.unit_price.toFixed(2)} | Batch ${escapeHtml(item.batch_number)}</div>
        </div>`,
    )
    .join("");

  return `<!doctype html>
    <html>
      <head>
        <title>${escapeHtml(receipt.sale_number)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 20px; }
          .receipt { max-width: 320px; margin: auto; font-size: 12px; }
          h1 { font-size: 18px; text-align: center; margin: 0 0 4px; }
          .center { text-align: center; }
          .muted { color: #666; font-size: 10px; }
          .divider { border-top: 1px dashed #777; margin: 12px 0; }
          .row { display: flex; justify-content: space-between; gap: 12px; margin: 3px 0; }
          .strong { font-weight: 700; }
          .item { margin: 10px 0; }
          .total { font-size: 16px; font-weight: 700; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <h1>${escapeHtml(settings.pharmacyName)}</h1>
          ${settings.address ? `<div class="center muted">${escapeHtml(settings.address)}</div>` : ""}
          ${settings.phone ? `<div class="center muted">${escapeHtml(settings.phone)}</div>` : ""}
          <div class="divider"></div>
          <div class="row"><span>Receipt</span><span>${escapeHtml(receipt.sale_number)}</span></div>
          <div class="row"><span>Date</span><span>${escapeHtml(new Date(receipt.completed_at).toLocaleString())}</span></div>
          <div class="row"><span>Payment</span><span>${escapeHtml(capitalize(receipt.payment_method))}</span></div>
          <div class="divider"></div>
          ${items}
          <div class="divider"></div>
          <div class="row"><span>Subtotal</span><span>${settings.currencyCode} ${receipt.subtotal.toFixed(2)}</span></div>
          <div class="row"><span>Discount</span><span>${settings.currencyCode} ${receipt.discount_amount.toFixed(2)}</span></div>
          <div class="row total"><span>Total</span><span>${settings.currencyCode} ${receipt.total_amount.toFixed(2)}</span></div>
          ${settings.receiptFooter ? `<div class="divider"></div><div class="center muted">${escapeHtml(settings.receiptFooter)}</div>` : ""}
        </div>
      </body>
    </html>`;
}
