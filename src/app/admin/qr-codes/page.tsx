
'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQRCode } from 'next-qrcode';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Utensils, ShoppingBag, Printer, Download, Image as ImageIcon } from 'lucide-react';
import { CheeziousLogo } from '@/components/icons/CheeziousLogo';
import type { Table, Floor } from '@/lib/types';
import jsPDF from "jspdf";
import { renderToStaticMarkup } from 'react-dom/server';

interface QRCodeDisplayProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  url: string;
  companyName: string;
  branchName: string;
  qrId: string;
}


function QRCodeDisplay({ title, subtitle, icon: Icon, url, companyName, branchName, qrId }: QRCodeDisplayProps) {
  const { Canvas } = useQRCode();
  const qrCardRef = useRef<HTMLDivElement>(null);

  const downloadAsPng = useCallback(() => {
    if (qrCardRef.current) {
        const canvas = qrCardRef.current.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `${title.toLowerCase().replace(/\s/g, '-')}-${subtitle?.toLowerCase().replace(/\s/g, '-') || 'qr'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }
  }, [title, subtitle]);

  const downloadAsPdf = useCallback(() => {
     if (qrCardRef.current) {
        const canvas = qrCardRef.current.querySelector('canvas');
        if (canvas) {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [300, 450] 
            });
            const imgData = canvas.toDataURL('image/png');
            
            // This is a simplified version. For complex layouts, html2canvas is better.
            pdf.setFontSize(20);
            pdf.text(companyName, 150, 40, { align: 'center'});
            pdf.setFontSize(12);
            pdf.text(branchName, 150, 60, { align: 'center'});
            pdf.addImage(imgData, 'PNG', 75, 80, 150, 150);
            pdf.setFontSize(16);
            pdf.text(title, 150, 260, { align: 'center'});
            if(subtitle) pdf.text(subtitle, 150, 280, { align: 'center'});

            pdf.save(`${title.toLowerCase().replace(/\s/g, '-')}-${subtitle?.toLowerCase().replace(/\s/g, '-') || 'qr'}.pdf`);
        }
    }
  }, [companyName, branchName, title, subtitle]);

  return (
    <div className="flex flex-col items-center justify-between p-6 border-2 border-dashed rounded-xl break-inside-avoid h-full">
      <div ref={qrCardRef} className="text-center w-full">
        <CheeziousLogo className="h-16 w-16 mx-auto text-primary" />
        <h3 className="mt-4 text-2xl font-bold font-headline text-center">{companyName}</h3>
        <p className="text-muted-foreground text-center">{branchName}</p>
        
        <div className="my-6 flex justify-center">
          <Canvas
            text={url}
            options={{
              type: 'image/png',
              quality: 1,
              errorCorrectionLevel: 'M',
              margin: 3,
              scale: 4,
              width: 200,
              color: { dark: '#000000FF', light: '#FFFFFFFF' },
            }}
          />
        </div>

        <div className="text-center">
          <Icon className="mx-auto h-10 w-10 text-primary" />
          <h4 className="mt-2 text-xl font-semibold">{title}</h4>
          {subtitle && <p className="text-lg font-bold">{subtitle}</p>}
          <p className="text-muted-foreground">Scan this code to begin your order.</p>
        </div>
      </div>
       <div className="flex gap-2 mt-4 print-hidden w-full">
            <Button variant="outline" className="w-full" onClick={downloadAsPng}>
                <ImageIcon className="mr-2 h-4 w-4" /> PNG
            </Button>
             <Button variant="outline" className="w-full" onClick={downloadAsPdf}>
                <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
        </div>
    </div>
  );
}


export default function QRCodesPage() {
  const { settings, isLoading } = useSettings();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      if (settings.branches.length > 0) {
        setSelectedBranchId(settings.branches[0].id);
      }
    }
  }, [settings.branches]);
  
  const handlePrint = () => {
    window.print();
  };

  const { selectedBranch, tablesByFloor } = useMemo(() => {
    const branch = settings.branches.find(b => b.id === selectedBranchId);
    if (!branch) return { selectedBranch: null, tablesByFloor: new Map() };

    const tablesForBranch = settings.tables;
    const floorsForBranch = settings.floors;

    const floorMap = new Map<string, Floor>(floorsForBranch.map(f => [f.id, f]));
    const groupedTables = new Map<Floor, Table[]>();

    tablesForBranch.forEach(table => {
        const floor = floorMap.get(table.floorId);
        if(floor){
            if (!groupedTables.has(floor)) {
                groupedTables.set(floor, []);
            }
            groupedTables.get(floor)!.push(table);
        }
    });

    return { selectedBranch: branch, tablesByFloor: groupedTables };
  }, [selectedBranchId, settings]);


  if (isLoading || !origin) {
    return <div>Loading...</div>;
  }

  const takeAwayUrl = `${origin}/branch/${selectedBranchId}?mode=Take-Away`;

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center print-hidden">
        <div>
          <h1 className="font-headline text-4xl font-bold">Printable QR Codes</h1>
          <p className="text-muted-foreground">
            Generate and print QR codes for each table and for Take Away orders.
          </p>
        </div>
        <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print All Codes for Branch
        </Button>
      </header>

      <Card className="print-hidden">
        <CardContent className="pt-6">
          <Label htmlFor="branch-select">Select Branch</Label>
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger id="branch-select" className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a branch" />
            </SelectTrigger>
            <SelectContent>
              {settings.branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {selectedBranch && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 printable-grid">
            <QRCodeDisplay
                title="Take Away"
                icon={ShoppingBag}
                url={takeAwayUrl}
                companyName={settings.companyName}
                branchName={selectedBranch.name}
                qrId="take-away"
            />
            {Array.from(tablesByFloor.entries()).map(([floor, tables]) => (
                tables.map(table => (
                    <QRCodeDisplay
                        key={table.id}
                        title="Dine-In"
                        subtitle={`${floor.name} - ${table.name}`}
                        icon={Utensils}
                        url={`${origin}/branch/${selectedBranchId}?mode=Dine-In&tableId=${table.id}&floorId=${floor.id}`}
                        companyName={settings.companyName}
                        branchName={selectedBranch.name}
                        qrId={`table-${table.id}`}
                    />
                ))
            ))}
          </div>
      )}
    </div>
  );
}
