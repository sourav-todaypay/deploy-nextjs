'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DynamicForm from '@/components/DynamicForm';
import toast from 'react-hot-toast';
import { MerchantsFormConfig } from '@/types/formConfig';
import Modal from './Modal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { MerchantFormValues } from '@/types/schemas/merchantSchema';
import { isFailureResponse } from '@/utils/isFailureResponse';

interface MerchantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MerchantsModal({
  isOpen,
  onClose,
  onSuccess,
}: MerchantsModalProps) {
  const api = useApiInstance();
  const methods = useForm<MerchantFormValues>({
    resolver: zodResolver(MerchantsFormConfig.schema),
    mode: 'onTouched',
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: null,
      email: '',
      website: '',
      corporate_name: '',
      doing_business_as: '',
      employer_identification_number: null,
      line_1: '',
      line_2: '',
      city: '',
      state: '',
      zipcode: null,
      should_notify: false,
    },
  });

  const { handleSubmit, reset, formState } = methods;

  const onSubmit = async (data: MerchantFormValues) => {
    try {
      const formattedData = {
        user: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: String(data.phone_number),
          email: data.email,
        },
        merchant: {
          corporate_name: data.corporate_name,
          doing_business_as: data.doing_business_as,
          employer_identification_number: String(
            data.employer_identification_number,
          ),
        },
        address: {
          line_1: data.line_1,
          line_2: data.line_2,
          city: data.city,
          country: 'US',
          state: data.state,
          zipcode: String(data.zipcode),
          is_primary: true,
          is_resedential: true,
        },
        website: data.website,
        should_notify: data.should_notify,
      };

      const response = await handleResponse(
        api.authenticatedPost('/internal/merchants/onboard', formattedData),
      );

      if (response) {
        toast.success('Action Successful');
      }

      onSuccess();
      onClose();
      reset();
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Action Failed');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        methods.clearErrors();
        onClose();
      }}
      title={'Create Merchant'}
      onConfirm={handleSubmit(onSubmit)}
      isLoading={formState.isSubmitting}
      disableButtons={!formState.isValid}
      width="w-[27rem]"
      height="h-[39.7rem]"
    >
      <FormProvider {...methods}>
        <div className="overflow-y-auto">
          <DynamicForm fields={MerchantsFormConfig.fields} />
        </div>
      </FormProvider>
    </Modal>
  );
}
