
"use client";

import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export default function AdminSettingsPage() {
    const { settings, addFloor, deleteFloor, addTable, deleteTable, addPaymentMethod, deletePaymentMethod, toggleAutoPrint, updateBranch, toggleService } = useSettings();
    const { user } = useAuth();

    const [newFloorName, setNewFloorName] = useState("");
    const [newTableName, setNewTableName] = useState("");
    const [selectedFloorForNewTable, setSelectedFloorForNewTable] = useState("");
    const [newPaymentMethodName, setNewPaymentMethodName] = useState("");
    const [editingBranch, setEditingBranch] = useState<typeof settings.branches[0] | null>(null);
    const [editingBranchName, setEditingBranchName] = useState("");
    
    const handleAddFloor = () => {
        if (newFloorName.trim()) {
            addFloor(newFloorName.trim());
            setNewFloorName("");
        }
    };

    const handleAddTable = () => {
        if (newTableName.trim() && selectedFloorForNewTable) {
            addTable(newTableName.trim(), selectedFloorForNewTable);
            setNewTableName("");
        }
    };

    const handleAddPaymentMethod = () => {
        if (newPaymentMethodName.trim()) {
            addPaymentMethod(newPaymentMethodName.trim());
            setNewPaymentMethodName("");
        }
    };
    
    const handleUpdateBranch = () => {
        if (editingBranch && editingBranchName.trim()) {
            updateBranch(editingBranch.id, editingBranchName.trim());
            setEditingBranch(null);
            setEditingBranchName("");
        }
    };

    const defaultPaymentMethodIds = ['cash', 'card'];

    // If user is a branch admin, filter to only show their branch
    const visibleBranches = user?.role === 'admin'
        ? settings.branches.filter(b => b.id === user.branchId)
        : settings.branches;

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-8">
            <header>
                <h1 className="font-headline text-4xl font-bold">Admin Settings</h1>
                <p className="text-muted-foreground">Manage restaurant layout, payments, and branch settings.</p>
            </header>

            {/* Branch Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Branch Management</CardTitle>
                    <CardDescription>Configure settings for each restaurant branch.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Branch Name</TableHead>
                                <TableHead>Dine-In</TableHead>
                                <TableHead>Take Away</TableHead>
                                <TableHead className="text-right w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleBranches.map(branch => (
                                <TableRow key={branch.id}>
                                    <TableCell className="font-medium">{branch.name}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={branch.dineInEnabled}
                                            onCheckedChange={(checked) => toggleService(branch.id, 'dineInEnabled', checked)}
                                            aria-label="Toggle Dine-In"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={branch.takeAwayEnabled}
                                            onCheckedChange={(checked) => toggleService(branch.id, 'takeAwayEnabled', checked)}
                                            aria-label="Toggle Take Away"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingBranch(branch); setEditingBranchName(branch.name); }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Printer Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Printer Settings</CardTitle>
                    <CardDescription>Configure automatic printing options.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="auto-print-switch" className="text-base">Auto-Print Receipts</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically open the print dialog when an order is placed.
                                Set your desired receipt printer (e.g., EPSON) as the system default for seamless printing.
                            </p>
                        </div>
                        <Switch
                            id="auto-print-switch"
                            checked={settings.autoPrintReceipts}
                            onCheckedChange={toggleAutoPrint}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Floors Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Manage Floors</CardTitle>
                    <CardDescription>Add or remove floors for your restaurant.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Input
                            placeholder="New floor name (e.g., Ground Floor)"
                            value={newFloorName}
                            onChange={(e) => setNewFloorName(e.target.value)}
                        />
                        <Button onClick={handleAddFloor}>Add Floor</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Floor Name</TableHead>
                                <TableHead className="text-right w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {settings.floors.map(floor => (
                                <TableRow key={floor.id}>
                                    <TableCell>{floor.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => deleteFloor(floor.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Separator />

            {/* Tables Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Manage Tables</CardTitle>
                    <CardDescription>Add tables and assign them to a floor.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-2 mb-4">
                        <Input
                            placeholder="New table name (e.g., T1)"
                            value={newTableName}
                            onChange={(e) => setNewTableName(e.target.value)}
                        />
                        <Select value={selectedFloorForNewTable} onValueChange={setSelectedFloorForNewTable}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a floor" />
                            </SelectTrigger>
                            <SelectContent>
                                {settings.floors.map(floor => (
                                    <SelectItem key={floor.id} value={floor.id}>{floor.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAddTable}>Add Table</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Table Name</TableHead>
                                <TableHead>Floor</TableHead>
                                <TableHead className="text-right w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {settings.tables.map(table => (
                                <TableRow key={table.id}>
                                    <TableCell>{table.name}</TableCell>
                                    <TableCell>{settings.floors.find(f => f.id === table.floorId)?.name || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => deleteTable(table.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Separator />
            
            {/* Payment Methods Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Manage Payment Methods</CardTitle>
                    <CardDescription>Add or remove accepted payment methods.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Input
                            placeholder="New payment method (e.g., QR Pay)"
                            value={newPaymentMethodName}
                            onChange={(e) => setNewPaymentMethodName(e.g.target.value)}
                        />
                        <Button onClick={handleAddPaymentMethod}>Add Method</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Method Name</TableHead>
                                <TableHead className="text-right w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {settings.paymentMethods.map(method => (
                                <TableRow key={method.id}>
                                    <TableCell>{method.name}</TableCell>
                                    <TableCell className="text-right">
                                        {!defaultPaymentMethodIds.includes(method.id) && (
                                            <Button variant="ghost" size="icon" onClick={() => deletePaymentMethod(method.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Branch Dialog */}
            <Dialog open={!!editingBranch} onOpenChange={(isOpen) => !isOpen && setEditingBranch(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Branch Name</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="branch-name">Branch Name</Label>
                        <Input
                            id="branch-name"
                            value={editingBranchName}
                            onChange={(e) => setEditingBranchName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleUpdateBranch}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
