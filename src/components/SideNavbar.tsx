/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  Settings,
  LogOut,
  Store,
  Package,
  Code,
  UserPlus,
  Clock,
  Users,
  Gift,
  Wallet,
  Layers,
  CreditCard,
  Repeat,
} from 'lucide-react';
import { AppRoute } from '@/constants/routes';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import Image from 'next/image';
import { useEffect } from 'react';

export default function SideNavbar({
  isSlim,
  isCore,
}: {
  isSlim: boolean;
  isCore: boolean;
}) {
  const t = useTranslations('sideNav');
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const coreRoutes = [
    {
      path: AppRoute.Merchants,
      label: t('merchants'),
      icon: <Store size={20} />,
    },
    {
      path: AppRoute.Customers,
      label: t('customers'),
      icon: <Users size={20} />,
    },
    { path: AppRoute.Offers, label: t('giftCards'), icon: <Gift size={20} /> },
    { path: AppRoute.Wallets, label: t('wallets'), icon: <Wallet size={20} /> },
    { path: AppRoute.Plans, label: t('plans'), icon: <Layers size={20} /> },
    {
      path: AppRoute.Modes,
      label: t('payoutModes'),
      icon: <Repeat size={20} />,
    },
    {
      path: AppRoute.FeeRate,
      label: t('feeRateHeading'),
      icon: <CreditCard size={20} />,
    },
    {
      path: AppRoute.Workflows,
      label: t('workflowsHeading'),
      icon: <Settings size={20} />,
    },
  ];

  const d2cRoutes = [
    {
      path: AppRoute.DirectToCustomer,
      label: t('merchants'),
      icon: <Store size={20} />,
    },
    {
      path: AppRoute.Customers,
      label: t('customers'),
      icon: <Users size={20} />,
    },
    { path: AppRoute.Offers, label: t('giftCards'), icon: <Gift size={20} /> },
    {
      path: AppRoute.InviteCodes,
      label: t('inviteCodesHeading'),
      icon: <UserPlus size={20} />,
    },
    {
      path: AppRoute.WaitList,
      label: t('waitListHeading'),
      icon: <Clock size={20} />,
    },
    {
      path: AppRoute.D2CListOrders,
      label: t('orders'),
      icon: <Package size={20} />,
    },
    {
      path: AppRoute.PaymentPlans,
      label: t('paymentPlans'),
      icon: <Wallet size={20} />,
    },
    { path: AppRoute.LLMProviders, label: t('llm'), icon: <Code size={20} /> },
  ];

  const activeRoutes = isCore ? coreRoutes : d2cRoutes;

  useEffect(() => {
    router.push(activeRoutes[0]?.path);
  }, [isCore]);

  const isRouteActive = (path: string) => pathname.startsWith(path);

  return (
    <motion.div
      initial={{ width: 250 }}
      animate={{ width: isSlim ? 80 : 250 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen p-4 shadow-lg flex flex-col transition-all bg-white text-black dark:!bg-gray-900 dark:!text-white dark:!shadow-[0px_4px_6px_rgba(255,255,255,0.2)] select-none"
    >
      <div className="flex mb-4">
        {isSlim ? (
          <Image
            src="/todaypay.svg"
            alt="Todaypay logo"
            width={40}
            height={40}
          />
        ) : (
          <div className="w-full">
            <div className="logo w-100 block dark:hidden"></div>
            <Image
              src="/todaypaylight.svg"
              alt="Todaypay logo"
              width={210}
              height={32}
              className="hidden dark:block"
            />
          </div>
        )}
      </div>

      <ul className="mt-6 space-y-2 pl-0">
        {activeRoutes.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
              delay: isSlim ? 0 : 0.2,
            }}
            className={`flex items-center p-2 rounded cursor-pointer select-none ${
              isRouteActive(item.path)
                ? 'bg-purple-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-800'
            } ${isSlim ? 'justify-center' : 'gap-3'}`}
            onClick={e => {
              if (isRouteActive(item.path)) {
                e.preventDefault();
                return;
              }
              router.push(item.path);
            }}
          >
            {item.icon}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isSlim ? 0 : 1 }}
              transition={{ duration: 0.3, delay: isSlim ? 0 : 0.3 }}
              className={`${isSlim ? 'hidden' : 'block'}`}
            >
              {item.label}
            </motion.span>
          </motion.li>
        ))}

        <motion.li
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex items-center p-2 rounded cursor-pointer text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800 select-none"
          onClick={logout}
        >
          <LogOut size={20} />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: isSlim ? 0 : 1 }}
            transition={{ duration: 0.3, delay: isSlim ? 0 : 0.3 }}
            className={`${isSlim ? 'hidden' : 'block'}`}
          >
            {t('logout')}
          </motion.span>
        </motion.li>
      </ul>
    </motion.div>
  );
}
