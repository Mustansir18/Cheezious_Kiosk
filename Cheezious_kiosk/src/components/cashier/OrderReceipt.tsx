

"use client";

import { Order } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";
import { CheeziousLogo } from "../icons/CheeziousLogo";

interface OrderReceiptProps {
    order: Order;
    qrCodeUrl?: string; // This is now optional
}

export function OrderReceipt({ order, qrCodeUrl }: OrderReceiptProps) {
    const { settings } = useSettings();
    const branch = settings.branches.find(b => b.id === order.branchId);
    const table = settings.tables.find(t => t.id === order.tableId);

    return (
        <div className="p-4 bg-white text-black font-mono text-xs w-[300px]">
            <div className="text-center mb-4">
                <CheeziousLogo className="h-16 w-16 mx-auto text-black" />
                <h2 className="font-bold text-sm mt-2">{settings.companyName}</h2>
                {branch && <p>{branch.name}</p>}
                <p>--- Customer Receipt ---</p>
            </div>
            
            <div className="mb-2">
                <p><strong>Order ID (internal):</strong> {order.id}</p>
                <p><strong>Order #:</strong> {order.orderNumber}</p>
                <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Type:</strong> {order.orderType}</p>
                {table && <p><strong>Table:</strong> {table.name}</p>}
                {order.acceptedByName && <p><strong>Cashier:</strong> {order.acceptedByName}</p>}
            </div>
            
            <hr className="border-dashed border-black my-2" />
            
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="text-left">QTY</th>
                        <th className="text-left">ITEM</th>
                        <th className="text-right">PRICE</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map(item => (
                        <tr key={item.id}>
                            <td className="align-top">{item.quantity}</td>
                            <td className="align-top">{item.name}</td>
                            <td className="text-right align-top">{(item.itemPrice * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <hr className="border-dashed border-black my-2" />
            
            <table className="w-full">
                <tbody>
                    <tr>
                        <td>Subtotal:</td>
                        <td className="text-right">{order.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Tax ({(order.taxRate * 100).toFixed(0)}%):</td>
                        <td className="text-right">{order.taxAmount.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <hr className="border-dashed border-black my-2" />
            
            <div className="font-bold text-base flex justify-between">
                <span>TOTAL:</span>
                <span>RS {order.totalAmount.toFixed(2)}</span>
            </div>
            
            <hr className="border-dashed border-black my-2" />

            {order.paymentMethod && (
                 <p className="text-center">Paid via: {order.paymentMethod}</p>
            )}

            <div className="text-center my-2 text-[10px]">
                {order.acceptedByName && <p>Accepted by: {order.acceptedByName}</p>}
                {order.completedByName && <p>Completed by: {order.completedByName}</p>}
            </div>
            
            <p className="text-center mt-4">Thank you for your visit!</p>
            <p className="text-center">Have a {settings.companyName} Day!</p>
        </div>
    );
}
