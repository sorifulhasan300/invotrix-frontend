import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InvoiceData } from "@/types/sales.interface";

function getProductName(
  product: string | { _id?: string; name?: string },
): string {
  if (typeof product === "object" && product !== null && product.name) {
    return product.name;
  }
  if (typeof product === "string") {
    return `Product ${product.slice(0, 8)}`;
  }
  return "Unknown Product";
}

export function ReceiptContent({ data }: { data: InvoiceData }) {
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);

  const invoiceItems = data.items || [];
  const invoiceSubtotal = invoiceItems.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0,
  );
  const invoiceTotal =
    data.grandTotal ??
    invoiceSubtotal - (data.discount || 0);

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const receiptHTML = receiptRef.current.innerHTML;
    const printWindow = window.open(
      "",
      "_blank",
      "width=320,height=600",
    );
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 8px; color: #000; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .text-lg { font-size: 16px; }
              .my-1 { margin-top: 4px; margin-bottom: 4px; }
              .my-2 { margin-top: 8px; margin-bottom: 8px; }
              hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
              table { width: 100%; border-collapse: collapse; }
              td, th { padding: 2px 0; vertical-align: top; }
              .col-item { text-align: left; width: 45%; }
              .col-qty { text-align: center; width: 15%; }
              .col-price { text-align: right; width: 20%; }
              .col-total { text-align: right; width: 20%; }
            </style>
          </head>
          <body>${receiptHTML}</body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 200);
    }
  };

  return (
    <DialogContent className="!max-w-[360px] sm:!max-w-[360px]">
      <DialogHeader>
        <DialogTitle>Receipt</DialogTitle>
      </DialogHeader>

      <div
        ref={receiptRef}
        className="font-mono text-xs border rounded-md p-4 bg-white text-black"
      >
        <div className="text-center">
          <h2 className="text-lg font-bold">Invotrix ERP</h2>
          <p className="my-1">Dhaka, Bangladesh</p>
          <p>Tel: +880 1XXX-XXXXXX</p>
          <p className="my-1">
            {data.createdAt
              ? new Date(data.createdAt).toLocaleString()
              : new Date().toLocaleString()}
          </p>
          <p className="font-bold">
            Invoice:{" "}
            {data.invoiceNo || data._id || "N/A"}
          </p>
        </div>

        <hr />

        <div className="my-2">
          <p>Customer: {data.customerName}</p>
          <p>Phone: {data.customerPhone}</p>
        </div>

        <hr />

        <table className="my-2 w-full">
          <thead>
            <tr>
              <th className="col-item text-left">Item</th>
              <th className="col-qty text-center">Qty</th>
              <th className="col-price text-right">Price</th>
              <th className="col-total text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, idx) => (
              <tr key={idx}>
                <td className="col-item">{getProductName(item.product)}</td>
                <td className="col-qty text-center">{item.quantity}</td>
                <td className="col-price text-right">
                  ${item.sellingPrice.toFixed(2)}
                </td>
                <td className="col-total text-right">
                  ${(item.quantity * item.sellingPrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        <div className="my-1 flex justify-between">
          <span>Subtotal</span>
          <span>${invoiceSubtotal.toFixed(2)}</span>
        </div>

        {data.discount ? (
          <div className="my-1 flex justify-between">
            <span>Discount</span>
            <span>-${Number(data.discount).toFixed(2)}</span>
          </div>
        ) : null}

        <div className="my-2 flex justify-between font-bold text-sm">
          <span>Grand Total</span>
          <span>${invoiceTotal.toFixed(2)}</span>
        </div>

        <hr />

        <div className="text-center my-2">
          <p className="font-bold">Thank you for shopping with us!</p>
          <p>Visit again</p>
        </div>
      </div>

      <DialogFooter className="flex gap-2 sm:gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handlePrint}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
        <Button className="flex-1" onClick={() => navigate("..", { relative: "path" })}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function ReceiptPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceData = (location.state as { invoiceData?: InvoiceData } | null)?.invoiceData;

  return (
    <Dialog open={!!invoiceData} onOpenChange={(open) => !open && navigate("..", { relative: "path" })}>
      {invoiceData ? <ReceiptContent data={invoiceData} /> : null}
    </Dialog>
  );
}
