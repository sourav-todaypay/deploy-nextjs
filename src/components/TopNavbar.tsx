'use client';

import { Menu, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import SideNavbar from '@/components/SideNavbar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useRouter } from 'next/navigation';

export default function TopNavbar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSlim, setIsSlim] = useState<boolean>(false);
  const [isCore, setIsCore] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem('isCore') || 'true'),
  );

  useEffect(() => {
    localStorage.setItem('isCore', JSON.stringify(isCore));
  }, [isCore]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <SideNavbar isSlim={isSlim} isCore={isCore} />
      <div className="flex flex-col flex-grow">
        <nav className="w-full h-[64px] flex justify-between items-center px-6 py-3 shadow-md dark:shadow-[inset_1px_0_6px_rgba(255,255,255,0.2)] bg-white dark:!bg-gray-900">
          <button
            onClick={() => setIsSlim(!isSlim)}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Menu size={24} className="text-gray-900 dark:text-gray-100" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className="w-20 h-8 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer transition-all relative"
              onClick={() => setIsCore(!isCore)}
            >
              <span
                className={`absolute text-sm font-bold transition-all ${
                  isCore
                    ? 'left-9 opacity-100 text-purple-700 dark:text-purple-400'
                    : 'opacity-0'
                }`}
              >
                Core
              </span>

              <div
                className={`w-7 h-7 rounded-full shadow-md transform transition-all bg-white dark:bg-gray-400 ${
                  isCore ? 'translate-x-1' : 'translate-x-12'
                }`}
              ></div>

              <span
                className={`absolute  text-sm font-bold transition-all ${
                  isCore
                    ? 'opacity-0'
                    : 'right-9 opacity-100 text-purple-700 dark:text-purple-400'
                }`}
              >
                D2C
              </span>
            </div>

            <ThemeSwitcher />
            <button
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => {
                router.push('/profile');
              }}
            >
              <User size={24} className="text-gray-900 dark:text-gray-100" />
            </button>
          </div>
        </nav>

        <div className="flex-grow pt-[64px] p-2 overflow-y-auto bg-gray-100 dark:bg-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
}
