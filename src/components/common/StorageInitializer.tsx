'use client';
import { useEffect } from 'react';
import { initStorage } from '@/lib/storage';

export default function StorageInitializer() {
  useEffect(() => {
    initStorage();
  }, []);

  return null;
}
