'use client';
import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { Spinner } from './Spinner';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  isLoading?: boolean;
  disableButtons?: boolean;
  disableClose?: boolean;
  width?: string;
  height?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  isLoading = false,
  disableButtons = false,
  disableClose = false,
  width = 'w-[70rem]',
  height = 'h-[8rem]',
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={!disableButtons ? onClose : () => {}}
      >
        <TransitionChild
          enter="duration-300 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-200 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="duration-300 ease-out scale-95"
            enterFrom="opacity-0 translate-y-10 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="duration-200 ease-in scale-95"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-10 scale-95"
          >
            <DialogPanel
              className={`${width} ${height} bg-white dark:!bg-gray-900 rounded-lg shadow-lg pt-3 transition-all flex flex-col`}
            >
              <div className="border-b border-gray-300 dark:border-gray-600 pb-2 px-4 flex justify-between items-center">
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </DialogTitle>
                {disableClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-2 py-3 text-gray-900 dark:text-gray-200">
                {children}
              </div>
              {!disableClose && (
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex flex-row-reverse gap-2">
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading || disableButtons}
                    className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-all sm:w-auto min-w-[100px] ${
                      isLoading || disableButtons
                        ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="small" />
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-all sm:w-auto ${
                      disableButtons
                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
