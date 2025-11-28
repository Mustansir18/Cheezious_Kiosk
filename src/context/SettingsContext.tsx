
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Floor, Table, PaymentMethod } from '@/lib/types';
import { branches as initialBranches } from '@/lib/data';

interface BranchSetting {
    id: string;
    name: string;
    location: string;
    dineInEnabled: boolean;
    takeAwayEnabled: boolean;
}

interface Settings {
    floors: Floor[];
    tables: Table[];
    paymentMethods: PaymentMethod[];
    autoPrintReceipts: boolean;
    branches: BranchSetting[];
    businessDayStart: string;
    businessDayEnd: string;
}

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  addFloor: (name: string) => void;
  deleteFloor: (id: string) => void;
  addTable: (name: string, floorId: string) => void;
  deleteTable: (id: string) => void;
  addPaymentMethod: (name: string) => void;
  deletePaymentMethod: (id: string) => void;
  toggleAutoPrint: (enabled: boolean) => void;
  updateBranch: (branchId: string, newName: string) => void;
  toggleService: (branchId: string, service: 'dineInEnabled' | 'takeAwayEnabled', enabled: boolean) => void;
  updateBusinessDayHours: (start: string, end: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'cheeziousSettings';

const defaultPaymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Cash' },
    { id: 'card', name: 'Credit/Debit Card' }
];

const defaultFloors: Floor[] = [
    { id: 'ground-floor', name: 'Ground' }
];

const defaultTables: Table[] = Array.from({ length: 10 }, (_, i) => ({
    id: `g${i + 1}`,
    name: `G${i + 1}`,
    floorId: 'ground-floor'
}));

const enhancedInitialBranches: BranchSetting[] = initialBranches.map(branch => ({
    ...branch,
    dineInEnabled: true,
    takeAwayEnabled: true,
}));

const initialSettings: Settings = {
    floors: defaultFloors,
    tables: defaultTables,
    paymentMethods: defaultPaymentMethods,
    autoPrintReceipts: false,
    branches: enhancedInitialBranches,
    businessDayStart: '11:00',
    businessDayEnd: '04:00',
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        
        // Ensure default payment methods are always present
        const customMethods = parsed.paymentMethods?.filter((pm: PaymentMethod) => !defaultPaymentMethods.some(dpm => dpm.id === pm.id)) || [];
        
        const branches = parsed.branches?.map((b: any) => ({
            ...b,
            dineInEnabled: b.dineInEnabled !== false, // default to true if not set
            takeAwayEnabled: b.takeAwayEnabled !== false, // default to true if not set
        })) || enhancedInitialBranches;
        
        setSettings({
            floors: parsed.floors && parsed.floors.length > 0 ? parsed.floors : defaultFloors,
            tables: parsed.tables && parsed.tables.length > 0 ? parsed.tables : defaultTables,
            paymentMethods: [...defaultPaymentMethods, ...customMethods],
            autoPrintReceipts: parsed.autoPrintReceipts || false,
            branches: branches,
            businessDayStart: parsed.businessDayStart || initialSettings.businessDayStart,
            businessDayEnd: parsed.businessDayEnd || initialSettings.businessDayEnd,
        });
      } else {
        setSettings(initialSettings);
      }
    } catch (error) {
      console.error("Could not load settings from local storage", error);
      setSettings(initialSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
        if (!isLoading) {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        }
    } catch (error) {
      console.error("Could not save settings to local storage", error);
    }
  }, [settings, isLoading]);

  const addFloor = useCallback((name: string) => {
    const newFloor: Floor = { id: crypto.randomUUID(), name };
    setSettings(s => ({ ...s, floors: [...s.floors, newFloor] }));
  }, []);

  const deleteFloor = useCallback((id: string) => {
    setSettings(s => ({ 
        ...s, 
        floors: s.floors.filter(f => f.id !== id),
        tables: s.tables.filter(t => t.floorId !== id), // Also remove tables on that floor
    }));
  }, []);

  const addTable = useCallback((name: string, floorId: string) => {
    const newTable: Table = { id: crypto.randomUUID(), name, floorId };
    setSettings(s => ({ ...s, tables: [...s.tables, newTable] }));
  }, []);

  const deleteTable = useCallback((id: string) => {
    setSettings(s => ({ ...s, tables: s.tables.filter(t => t.id !== id) }));
  }, []);

  const addPaymentMethod = useCallback((name: string) => {
    const newMethod: PaymentMethod = { id: crypto.randomUUID(), name };
    setSettings(s => ({ ...s, paymentMethods: [...s.paymentMethods, newMethod] }));
  }, []);

  const deletePaymentMethod = useCallback((id: string) => {
    if (defaultPaymentMethods.some(pm => pm.id === id)) {
        console.warn("Cannot delete a default payment method.");
        return;
    }
    setSettings(s => ({ ...s, paymentMethods: s.paymentMethods.filter(pm => pm.id !== id) }));
  }, []);

  const toggleAutoPrint = useCallback((enabled: boolean) => {
    setSettings(s => ({...s, autoPrintReceipts: enabled }));
  }, []);
  
  const updateBranch = useCallback((branchId: string, newName: string) => {
    setSettings(s => ({
        ...s,
        branches: s.branches.map(b => b.id === branchId ? { ...b, name: newName } : b)
    }));
  }, []);

  const toggleService = useCallback((branchId: string, service: 'dineInEnabled' | 'takeAwayEnabled', enabled: boolean) => {
    setSettings(s => ({
        ...s,
        branches: s.branches.map(b => b.id === branchId ? { ...b, [service]: enabled } : b)
    }));
  }, []);

  const updateBusinessDayHours = useCallback((start: string, end: string) => {
    setSettings(s => ({...s, businessDayStart: start, businessDayEnd: end }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        addFloor,
        deleteFloor,
        addTable,
        deleteTable,
        addPaymentMethod,
        deletePaymentMethod,
        toggleAutoPrint,
        updateBranch,
        toggleService,
        updateBusinessDayHours,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

    