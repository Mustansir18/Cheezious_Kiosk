
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, User } from 'lucide-react';
import type { User as UserType } from '@/lib/types';

function UserForm({
  onSave,
}: {
  onSave: (user: Omit<UserType, 'id' | 'role'>) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onSave({ username, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Cashier</Button>
      </DialogFooter>
    </form>
  );
}


export default function UserManagementPage() {
    const { users, addUser, deleteUser } = useAuth();
    const [isDialogOpen, setDialogOpen] = useState(false);

    const handleSaveUser = (user: Omit<UserType, 'id' | 'role'>) => {
        addUser(user.username, user.password, 'cashier');
        setDialogOpen(false);
    };

    const cashierUsers = users.filter(u => u.role === 'cashier');

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-8">
             <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle className="font-headline text-4xl font-bold">User Management</CardTitle>
                        <CardDescription>Create and manage cashier accounts.</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Cashier
                            </Button>
                            </DialogTrigger>
                            <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Cashier</DialogTitle>
                            </DialogHeader>
                            <UserForm onSave={handleSaveUser} />
                            </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right w-[120px]">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {cashierUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium flex items-center">
                                    <User className="mr-2 h-4 w-4 text-muted-foreground"/>
                                    {user.username}
                                </TableCell>
                                <TableCell className="capitalize">{user.role}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => deleteUser(user.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    {cashierUsers.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No cashier users found.</p>
                            <p className="text-sm text-muted-foreground">Click "Add Cashier" to create one.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
