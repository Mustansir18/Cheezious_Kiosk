

"use client";

import { useOrders } from "@/context/OrderContext";
import { useMemo, useState, useEffect } from "react";
import type { Order } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIcon, ShoppingCart, DollarSign, Utensils, Loader, Printer, CreditCard, ShoppingBag, FileDown, Clock } from "lucide-react";
import { HourlySalesReport } from "@/components/reporting/HourlySalesReport";
import { TopSellingItems } from "@/components/reporting/TopSellingItems";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format as formatDate, addDays, set } from "date-fns";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import { useSettings } from "@/context/SettingsContext";

export interface ItemSale {
  name: string;
  quantity: number;
  totalRevenue: number;
}

export interface HourlySale {
  hour: string;
  sales: number;
}

function ReportCardActions({ 
    reportId, 
    onPrint, 
    onDownload 
}: { 
    reportId: string; 
    onPrint: (id: string) => void;
    onDownload: (id: string, format: 'pdf' | 'excel') => void;
}) {
    return (
        <div className="flex items-center gap-2 print-hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <FileDown className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDownload(reportId, 'pdf')}>Save as PDF</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(reportId, 'excel')}>Save as Excel</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={() => onPrint(reportId)}>
                <Printer className="h-4 w-4"/>
            </Button>
        </div>
    );
}


export default function ReportingPage() {
  const { orders, isLoading: isOrdersLoading } = useOrders();
  const { settings, isLoading: isSettingsLoading } = useSettings();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<string>("");

  const { businessDayStart, businessDayEnd } = useMemo(() => {
    const [startHour, startMinute] = (settings.businessDayStart || "11:00").split(':').map(Number);
    const [endHour, endMinute] = (settings.businessDayEnd || "04:00").split(':').map(Number);

    const from = set(selectedDate, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });
    let to = set(selectedDate, { hours: endHour, minutes: endMinute, seconds: 59, milliseconds: 999 });

    // If end time is on the next day (e.g., 11:00 to 04:00)
    if (endHour < startHour) {
      to = addDays(to, 1);
    }
    
    return { businessDayStart: from, businessDayEnd: to };
  }, [selectedDate, settings.businessDayStart, settings.businessDayEnd]);


  const reportData = useMemo(() => {
    if (!orders) return null;

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= businessDayStart && orderDate <= businessDayEnd;
    });

    const totalOrders = filteredOrders.length;
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalItemsSold = filteredOrders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    const itemSales: { [key: string]: ItemSale } = {};
    const hourlySales: { [key: number]: number } = {};
    const dineInOrders = filteredOrders.filter((o) => o.orderType === "Dine-In");
    const takeAwayOrders = filteredOrders.filter((o) => o.orderType === "Take-Away");
    const paymentMethodCounts: { [key: string]: number } = {};
    const hourlyTopItems: { [hour: number]: { [menuItemId: string]: ItemSale } } = {};
    
    // --- Dine In Metrics ---
    const dineInSales = dineInOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const dineInGrossSales = dineInOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const dineInNetSales = dineInOrders.reduce((sum, order) => sum + order.subtotal, 0);
    const dineInTax = dineInOrders.reduce((sum, order) => sum + order.taxAmount, 0);
    const dineInCashSales = dineInOrders.filter(o => o.paymentMethod === 'Cash').reduce((sum, order) => sum + order.totalAmount, 0);
    const dineInCardSales = dineInOrders.filter(o => o.paymentMethod?.toLowerCase().includes('card')).reduce((sum, order) => sum + order.totalAmount, 0);

    // --- Take Away Metrics ---
    const takeAwaySales = takeAwayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const takeAwayGrossSales = takeAwayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const takeAwayNetSales = takeAwayOrders.reduce((sum, order) => sum + order.subtotal, 0);
    const takeAwayTax = takeAwayOrders.reduce((sum, order) => sum + order.taxAmount, 0);
    const takeAwayCashSales = takeAwayOrders.filter(o => o.paymentMethod === 'Cash').reduce((sum, order) => sum + order.totalAmount, 0);
    const takeAwayCardSales = takeAwayOrders.filter(o => o.paymentMethod?.toLowerCase().includes('card')).reduce((sum, order) => sum + order.totalAmount, 0);


    for (const order of filteredOrders) {
      const hour = new Date(order.orderDate).getHours();
      hourlySales[hour] = (hourlySales[hour] || 0) + order.totalAmount;
      if (!hourlyTopItems[hour]) {
        hourlyTopItems[hour] = {};
      }

      for (const item of order.items) {
        if (!itemSales[item.menuItemId]) {
          itemSales[item.menuItemId] = {
            name: item.name,
            quantity: 0,
            totalRevenue: 0,
          };
        }
        itemSales[item.menuItemId].quantity += item.quantity;
        itemSales[item.menuItemId].totalRevenue += item.quantity * item.itemPrice;

        if (!hourlyTopItems[hour][item.menuItemId]) {
            hourlyTopItems[hour][item.menuItemId] = {
              name: item.name,
              quantity: 0,
              totalRevenue: 0,
            };
          }
          hourlyTopItems[hour][item.menuItemId].quantity += item.quantity;
          hourlyTopItems[hour][item.menuItemId].totalRevenue += item.quantity * item.itemPrice;
      }
      
      if (order.paymentMethod) {
          paymentMethodCounts[order.paymentMethod] = (paymentMethodCounts[order.paymentMethod] || 0) + 1;
      }
    }

    const topSellingItems = Object.values(itemSales).sort(
      (a, b) => b.quantity - a.quantity
    );

    const hourlySalesChartData: HourlySale[] = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return {
            hour: `${hour}:00`,
            sales: hourlySales[i] || 0,
        };
    });

    const hourlyTopItemsData: { [hour: number]: ItemSale[] } = {};
    for (const hour in hourlyTopItems) {
      hourlyTopItemsData[hour] = Object.values(hourlyTopItems[hour]).sort((a, b) => b.quantity - a.quantity);
    }

    return {
      totalOrders,
      totalSales,
      totalItemsSold,
      topSellingItems,
      hourlySalesChartData,
      hourlyTopItems: hourlyTopItemsData,
      dineInCount: dineInOrders.length,
      takeAwayCount: takeAwayOrders.length,
      dineInSales,
      takeAwaySales,
      paymentMethodCounts,
      dineInGrossSales,
      dineInNetSales,
      dineInTax,
      dineInCashSales,
      dineInCardSales,
      takeAwayGrossSales,
      takeAwayNetSales,
      takeAwayTax,
      takeAwayCashSales,
      takeAwayCardSales,
    };
  }, [orders, businessDayStart, businessDayEnd]);

    const handlePrint = (reportId: string) => {
    const reportElement = document.getElementById(reportId);
    if (!reportElement) return;

    // Create a temporary, printable container
    const printableArea = document.createElement('div');
    printableArea.id = 'printable-area';
    
    // Clone the node to avoid moving the original element
    const contentToPrint = reportElement.cloneNode(true) as HTMLElement;
    
    // If printing the main charts area, remove buttons from the cloned headers
    if (reportId === 'hourly-sales-report' || reportId === 'top-items-report' || reportId === 'hourly-items-report') {
        const buttons = contentToPrint.querySelectorAll('.print-hidden');
        buttons.forEach(btn => btn.remove());
    }

    printableArea.appendChild(contentToPrint);
    
    // Append to body, print, then remove
    document.body.appendChild(printableArea);
    document.body.classList.add('printing-active');
    
    window.print();
    
    document.body.removeChild(printableArea);
    document.body.classList.remove('printing-active');
  };

  const handleDownload = (reportId: string, fileFormat: 'pdf' | 'excel') => {
    if (!reportData) return;
    const { topSellingItems, hourlySalesChartData, hourlyTopItems, ...rest } = reportData;
    const doc = new jsPDF();
    const dateStr = `Report for Business Day of ${formatDate(selectedDate, "LLL dd, y")}`;

    const generatePdf = (title: string, head: any[], body: any[]) => {
        doc.text(title, 14, 15);
        doc.text(dateStr, 14, 22);
        autoTable(doc, { head, body, startY: 30 });
        doc.save(`${title.toLowerCase().replace(/ /g, '_')}.pdf`);
    };

    const generateExcel = (data: any[], filename: string, sheetName: string) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    switch (reportId) {
        case 'summary-report': {
            const data = [
                { metric: "Total Sales", value: `RS ${rest.totalSales.toFixed(2)}` },
                { metric: "Total Orders", value: rest.totalOrders },
                { metric: "Total Items Sold", value: rest.totalItemsSold },
            ];
            if (fileFormat === 'pdf') generatePdf('Overall Summary', [['Metric', 'Value']], data.map(Object.values));
            else generateExcel(data, 'overall_summary', 'Summary');
            break;
        }
        case 'ordertype-report': {
            const data = [
                { type: "Dine-In Orders", count: rest.dineInCount, sales: `RS ${rest.dineInSales.toFixed(2)}` },
                { type: "Take Away Orders", count: rest.takeAwayCount, sales: `RS ${rest.takeAwaySales.toFixed(2)}` },
            ];
            if (fileFormat === 'pdf') generatePdf('Order Type Summary', [['Order Type', 'Count', 'Sales']], data.map(Object.values));
            else generateExcel(data, 'order_type_summary', 'Order Types');
            break;
        }
        case 'dine-in-breakdown': {
            const data = [
                { metric: "Gross Sales", value: `RS ${rest.dineInGrossSales.toFixed(2)}` },
                { metric: "Net Sales", value: `RS ${rest.dineInNetSales.toFixed(2)}` },
                { metric: "Total Tax", value: `RS ${rest.dineInTax.toFixed(2)}` },
                { metric: "Cash Sales", value: `RS ${rest.dineInCashSales.toFixed(2)}` },
                { metric: "Card Sales", value: `RS ${rest.dineInCardSales.toFixed(2)}` },
            ];
            if (fileFormat === 'pdf') generatePdf('Dine-In Sales Breakdown', [['Metric', 'Value']], data.map(Object.values));
            else generateExcel(data, 'dine_in_breakdown', 'Dine-In');
            break;
        }
        case 'take-away-breakdown': {
            const data = [
                { metric: "Gross Sales", value: `RS ${rest.takeAwayGrossSales.toFixed(2)}` },
                { metric: "Net Sales", value: `RS ${rest.takeAwayNetSales.toFixed(2)}` },
                { metric: "Total Tax", value: `RS ${rest.takeAwayTax.toFixed(2)}` },
                { metric: "Cash Sales", value: `RS ${rest.takeAwayCashSales.toFixed(2)}` },
                { metric: "Card Sales", value: `RS ${rest.takeAwayCardSales.toFixed(2)}` },
            ];
            if (fileFormat === 'pdf') generatePdf('Take Away Sales Breakdown', [['Metric', 'Value']], data.map(Object.values));
            else generateExcel(data, 'take_away_breakdown', 'Take Away');
            break;
        }
        case 'payment-report': {
            const data = Object.entries(rest.paymentMethodCounts).map(([method, count]) => ({ method, count }));
            if (fileFormat === 'pdf') generatePdf('Payment Method Breakdown', [['Method', 'Count']], data.map(Object.values));
            else generateExcel(data, 'payment_methods', 'Payments');
            break;
        }
        case 'hourly-sales-report': {
            const data = hourlySalesChartData.map(d => ({ Hour: d.hour, Sales: `RS ${d.sales.toFixed(2)}` }));
            if (fileFormat === 'pdf') generatePdf('Hourly Sales', [['Hour', 'Sales']], data.map(Object.values));
            else generateExcel(data, 'hourly_sales', 'Hourly Sales');
            break;
        }
        case 'top-items-report': {
            const data = topSellingItems.map(d => ({ Item: d.name, Quantity: d.quantity, Revenue: `RS ${d.totalRevenue.toFixed(2)}` }));
            if (fileFormat === 'pdf') generatePdf('Top Selling Items', [['Item', 'Quantity', 'Revenue']], data.map(Object.values));
            else generateExcel(data, 'top_selling_items', 'Top Items');
            break;
        }
        case 'hourly-items-report': {
            const hour = parseInt(selectedHour);
            const data = hourlyTopItems[hour]?.map(d => ({ Item: d.name, Quantity: d.quantity, Revenue: `RS ${d.totalRevenue.toFixed(2)}` })) || [];
            const title = `Top Selling Items for Hour ${selectedHour}:00`;
            if (fileFormat === 'pdf') generatePdf(title, [['Item', 'Quantity', 'Revenue']], data.map(Object.values));
            else generateExcel(data, `top_items_hour_${selectedHour}`, 'Top Items by Hour');
            break;
        }
    }
  };


  useEffect(() => {
    const afterPrint = () => {
      document.body.classList.remove('printing-active');
      const printableArea = document.getElementById('printable-area');
      if (printableArea) {
        document.body.removeChild(printableArea);
      }
    };

    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);
  
    useEffect(() => {
        // Set initial selected hour when data is loaded
        if (reportData?.hourlyTopItems) {
            const firstHourWithSales = Object.keys(reportData.hourlyTopItems)[0];
            if (firstHourWithSales) {
                setSelectedHour(firstHourWithSales);
            }
        }
    }, [reportData?.hourlyTopItems]);

  const isLoading = isOrdersLoading || isSettingsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Reports...</p>
      </div>
    );
  }
  
  if (!reportData || orders.length === 0) {
      return (
        <div className="container mx-auto p-4 lg:p-8 text-center">
             <header className="mb-8">
                <h1 className="font-headline text-4xl font-bold">Admin Reports</h1>
                <p className="text-muted-foreground">Sales data from the current session.</p>
            </header>
            <Card className="mt-10">
                <CardContent className="p-12">
                     <h2 className="text-2xl font-semibold">No Order Data</h2>
                     <p className="mt-2 text-muted-foreground">Place some orders to see report data here.</p>
                </CardContent>
            </Card>
        </div>
      )
  }

  const {
    totalOrders,
    totalSales,
    totalItemsSold,
    topSellingItems,
    hourlySalesChartData,
    hourlyTopItems,
    dineInCount,
    takeAwayCount,
    dineInSales,
    takeAwaySales,
    paymentMethodCounts,
    dineInGrossSales,
    dineInNetSales,
    dineInTax,
    dineInCashSales,
    dineInCardSales,
    takeAwayGrossSales,
    takeAwayNetSales,
    takeAwayTax,
    takeAwayCashSales,
    takeAwayCardSales,
  } = reportData;

  const summaryCards = [
    { title: "Total Sales", value: `RS ${totalSales.toFixed(2)}`, icon: DollarSign },
    { title: "Total Orders", value: totalOrders, icon: ShoppingCart },
    { title: "Total Items Sold", value: totalItemsSold, icon: Utensils },
  ];
  
  const orderTypeCards = [
      { title: "Dine-In Orders", value: dineInCount, icon: Utensils, description: `RS ${dineInSales.toFixed(2)} in sales`},
      { title: "Take Away Orders", value: takeAwayCount, icon: ShoppingBag, description: `RS ${takeAwaySales.toFixed(2)} in sales`},
  ]

  const dineInBreakdown = [
      { label: "Gross Sales", value: `RS ${dineInGrossSales.toFixed(2)}` },
      { label: "Net Sales", value: `RS ${dineInNetSales.toFixed(2)}` },
      { label: "Total Tax", value: `RS ${dineInTax.toFixed(2)}` },
      { label: "Cash Sales", value: `RS ${dineInCashSales.toFixed(2)}` },
      { label: "Card Sales", value: `RS ${dineInCardSales.toFixed(2)}` },
  ]
  
  const takeAwayBreakdown = [
      { label: "Gross Sales", value: `RS ${takeAwayGrossSales.toFixed(2)}` },
      { label: "Net Sales", value: `RS ${takeAwayNetSales.toFixed(2)}` },
      { label: "Total Tax", value: `RS ${takeAwayTax.toFixed(2)}` },
      { label: "Cash Sales", value: `RS ${takeAwayCashSales.toFixed(2)}` },
      { label: "Card Sales", value: `RS ${takeAwayCardSales.toFixed(2)}` },
  ]

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="font-headline text-4xl font-bold">Admin Reports</h1>
            <p className="text-muted-foreground">Sales data for the selected business day.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    formatDate(selectedDate, "LLL dd, y")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="single"
                  defaultMonth={selectedDate}
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                />
              </PopoverContent>
            </Popover>
        </div>
      </header>
      
      <div className="space-y-8">
          <div id="summary-report">
             <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <div>
                        <CardTitle className="font-headline flex items-center">Overall Summary</CardTitle>
                        <CardDescription>Top-level metrics for the selected period.</CardDescription>
                    </div>
                    <ReportCardActions reportId="summary-report" onPrint={handlePrint} onDownload={handleDownload} />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {summaryCards.map(card => (
                            <Card key={card.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                    <card.icon className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{card.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
             </Card>
          </div>

        <div id="ordertype-report">
            <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <div>
                        <CardTitle className="font-headline flex items-center">Order Type Summary</CardTitle>
                        <CardDescription>Transaction counts and sales totals by order type.</CardDescription>
                    </div>
                    <ReportCardActions reportId="ordertype-report" onPrint={handlePrint} onDownload={handleDownload} />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {orderTypeCards.map(card => (
                             <Card key={card.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                    <card.icon className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{card.value}</div>
                                    <p className="text-xs text-muted-foreground">{card.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
          
        <div id="dine-in-breakdown">
             <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <div>
                        <CardTitle className="font-headline flex items-center"><Utensils className="mr-2 h-5 w-5 text-primary"/>Dine-In Sales Breakdown</CardTitle>
                        <CardDescription>Detailed sales figures for Dine-In orders for the selected period.</CardDescription>
                    </div>
                     <ReportCardActions reportId="dine-in-breakdown" onPrint={handlePrint} onDownload={handleDownload} />
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {dineInBreakdown.map(item => (
                        <div key={item.label} className="rounded-lg border bg-card text-card-foreground p-4 flex flex-col items-center justify-center text-center">
                             <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                             <p className="text-2xl font-bold">{item.value}</p>
                        </div>
                    ))}
                </CardContent>
             </Card>
        </div>

        <div id="take-away-breakdown">
             <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <div>
                        <CardTitle className="font-headline flex items-center"><ShoppingBag className="mr-2 h-5 w-5 text-primary"/>Take Away Sales Breakdown</CardTitle>
                        <CardDescription>Detailed sales figures for Take Away orders for the selected period.</CardDescription>
                    </div>
                    <ReportCardActions reportId="take-away-breakdown" onPrint={handlePrint} onDownload={handleDownload} />
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {takeAwayBreakdown.map(item => (
                        <div key={item.label} className="rounded-lg border bg-card text-card-foreground p-4 flex flex-col items-center justify-center text-center">
                             <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                             <p className="text-2xl font-bold">{item.value}</p>
                        </div>
                    ))}
                </CardContent>
             </Card>
        </div>


          <div id="payment-report">
            <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <div>
                        <CardTitle className="font-headline flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary"/>Payment Method Breakdown</CardTitle>
                        <CardDescription>Number of orders per payment method for the selected period.</CardDescription>
                    </div>
                    <ReportCardActions reportId="payment-report" onPrint={handlePrint} onDownload={handleDownload} />
                </CardHeader>
                <CardContent>
                    {Object.keys(paymentMethodCounts).length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {Object.entries(paymentMethodCounts).map(([method, count]) => (
                                <Card key={method} className="p-4 flex flex-col items-center justify-center">
                                    <p className="text-2xl font-bold">{count}</p>
                                    <p className="text-sm font-medium text-muted-foreground">{method}</p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No orders with a payment method recorded for this period.</p>
                    )}
                </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3" id="hourly-sales-report">
                  <HourlySalesReport data={hourlySalesChartData} onPrint={() => handlePrint('hourly-sales-report')} onDownload={(fileFormat) => handleDownload('hourly-sales-report', fileFormat)} />
              </div>
              <div className="lg:col-span-2" id="top-items-report">
                  <TopSellingItems data={topSellingItems} onPrint={() => handlePrint('top-items-report')} onDownload={(fileFormat) => handleDownload('top-items-report', fileFormat)} />
              </div>
          </div>
          
          <div id="hourly-items-report">
            <Card>
                <CardHeader className="flex-row justify-between items-center">
                    <div className="flex-1">
                        <CardTitle className="font-headline flex items-center"><Clock className="mr-2 h-5 w-5 text-primary"/>Top Items by Hour</CardTitle>
                        <CardDescription>Find out which items were most popular during a specific hour.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={selectedHour} onValueChange={setSelectedHour}>
                            <SelectTrigger className="w-[180px] print-hidden">
                                <SelectValue placeholder="Select an hour" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(hourlyTopItems).map(hour => (
                                    <SelectItem key={hour} value={hour}>{`${hour.padStart(2, '0')}:00 - ${hour.padStart(2, '0')}:59`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <ReportCardActions reportId="hourly-items-report" onPrint={handlePrint} onDownload={handleDownload} />
                    </div>
                </CardHeader>
                <CardContent>
                     <ScrollArea className="h-[300px]">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {selectedHour && hourlyTopItems[parseInt(selectedHour, 10)]?.length > 0 ? (
                                hourlyTopItems[parseInt(selectedHour, 10)].map((item) => (
                                <TableRow key={item.name}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">
                                    RS {item.totalRevenue.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No sales data for the selected hour, or please select an hour.
                                    </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                     </ScrollArea>
                </CardContent>
            </Card>
          </div>

      </div>
    </div>
  );
}

    

    

    
