import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const mockItems = [
  { sku: "123456", description: "Product A", price: 10 },
  { sku: "234567", description: "Product B", price: 20 },
  { sku: "345678", description: "Product C", price: 30 },
  { sku: "456789", description: "Product D", price: 40 },
];

export default function GVWSQuoteBuilder() {
  const [items] = useState(mockItems);
  const [quoteItems, setQuoteItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToQuote = (item) => {
    const existing = quoteItems.find((i) => i.sku === item.sku);
    if (existing) {
      setQuoteItems(
        quoteItems.map((i) =>
          i.sku === item.sku ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setQuoteItems([...quoteItems, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (sku, qty) => {
    setQuoteItems(
      quoteItems.map((i) => (i.sku === sku ? { ...i, qty } : i))
    );
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("GVWS Sales Quote", 14, 22);
    doc.setFontSize(12);
    doc.text(`Customer: ${customerName || "N/A"}`, 14, 32);

    const rows = quoteItems.map((item) => [
      item.sku,
      item.description,
      item.qty,
      `$${item.price.toFixed(2)}`,
      `$${(item.qty * item.price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 40,
      head: [["SKU", "Description", "Qty", "Unit Price", "Total"]],
      body: rows,
    });

    doc.text(`Total: $${total.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save("gvws-quote.pdf");
  };

  const sendEmail = () => {
    if (!customerEmail) return alert("Please enter an email address.");
    alert(`Pretend email sent to ${customerEmail} with quote PDF attached.`);
  };

  const total = quoteItems.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-800 flex flex-col">
      <header className="bg-white shadow p-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-700">GVWS Quote Builder</h1>
        <div className="space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Upload Items</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Upload Customers</button>
        </div>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row p-4 gap-6">
        {/* Items Panel */}
        <section className="flex-1 bg-white p-4 rounded-2xl shadow-md border border-gray-100 max-h-screen overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Available Items</h2>
          <input
            type="text"
            placeholder="Search by SKU or Description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 w-full px-4 py-2 border rounded-md shadow-sm"
          />
          <div className="overflow-y-auto max-h-[75vh]">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="text-left p-2">SKU</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.sku}
                    className="hover:bg-green-50 cursor-pointer"
                    onClick={() => addToQuote(item)}
                  >
                    <td className="p-2 font-mono">{item.sku}</td>
                    <td className="p-2">{item.description}</td>
                    <td className="p-2">${item.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quote Builder Panel */}
        <section className="w-full lg:w-[450px] flex-shrink-0 bg-white p-6 rounded-2xl shadow-md border flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Quote Summary</h2>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="email"
              placeholder="Customer Email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Item</th>
                    <th className="text-left p-2">Qty</th>
                    <th className="text-left p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteItems.map((item) => (
                    <tr key={item.sku}>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateQty(item.sku, parseInt(e.target.value) || 1)}
                          className="w-16 border px-2 py-1 rounded"
                        />
                      </td>
                      <td className="p-2">${(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right text-lg font-bold">
              Total: ${total.toFixed(2)}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={generatePDF}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg"
            >
              Download Quote PDF
            </button>
            <button
              onClick={sendEmail}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-lg"
            >
              Email Quote PDF
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
