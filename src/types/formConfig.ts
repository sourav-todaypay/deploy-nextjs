import { planSchema } from './schemas/planSchema';
import { redemptionMethodSchema } from './schemas/redemptionMethodSchema';
import { feeRateSchema } from './schemas/feeRateSchema';
import {
  transactionKind,
  transactionSubType,
  transactionStatus,
} from './workflow';
import { giftCardModes } from './giftCardModes';
import { workFlowSchema } from './schemas/workFlowSchema';
import { inviteCodeSchema } from './schemas/inviteCodeSchema';
import { paymentPlanSchema } from './schemas/paymentPlanSchema';
import { states } from './state';
import { handleResponse } from '@/utils/handleResponse';
import { ApiInstance } from '@/hooks/useApiInstance';
import { rulesSchema } from './schemas/rulesSchema';
import { promptsSchema } from './schemas/promptsSchema';
import { merchantD2cSchema } from './schemas/merchantD2cSchema';
import { llmProviderSchema } from './schemas/llmProviderSchema';
import { invoiceSettlementSchema } from './schemas/invoiceSettlementSchema';
import { giftCardSchema } from './schemas/giftCardSchema';
import { providerSchema } from './schemas/providerSchema';
import { merchantSchema } from './schemas/merchantSchema';
import { merchantSettingsSchema } from './schemas/merchantSettingsSchema';
import { assignPlanSchema } from './schemas/assignplanSchema';
import { assignWorkFlowSchema } from './schemas/assignWorkFlowSchema';
import { assignFeeRateSchema } from './schemas/assignFeeRateSchema';
import { cancleDisbursementSchema } from './schemas/cancleDisbursementSchema';
import { FeeRate } from '@/app/(protected)/feerates/type';
import { GetAllPromptsResponse } from '@/app/(protected)/llm_providers/prompts/type';
import { Brands, Product } from '@/app/(protected)/gift_cards/brands/type';
import { GetProvider } from '@/app/(protected)/gift_cards/providers/type';
import { GetAllRules } from '@/app/(protected)/gift_cards/rules/[provider_brand_name]/[id]/type';
import { Plan } from '@/app/(protected)/plans/type';
import { WorkFlow } from '@/app/(protected)/workflows/type';
import { SelectOption } from '@/components/DynamicForm';
import { setRefundLimitSchema } from './schemas/setRefundLimitSchema';
import { systemUserSchema } from './schemas/systemUserSchema';

export const planFormConfig = {
  fields: [
    {
      name: 'plan_name',
      label: 'Plan Name',
      type: 'text',
      required: true,
      colSpan: 2,
    },
    {
      name: 'type',
      label: 'Mode',
      type: 'select',
      required: true,
      colSpan: 2,
      options: [
        { label: 'Invoice', value: 'INVOICING' },
        { label: 'PrePaid', value: 'PREPAID' },
      ] as SelectOption[],
    },
    {
      name: 'settlement_cycle_in_days',
      label: 'Settlement Cycle in Days',
      type: 'number',
      required: true,
      helperText: 'e.g., 10',
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 3,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
      },
      colSpan: 2,
    },
    {
      name: 'credit_in_cents',
      label: 'Credit',
      type: 'number',
      required: true,
      leftIcon: true,
      helperText: 'e.g., $100',
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
      colSpan: 2,
    },
    {
      name: 'minimum_balance_in_cents',
      label: 'Minimum Balance',
      type: 'number',
      helperText: `-ve for invoice (-20),\n +ve for prepaid (20)`,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
      },
      colSpan: 2,
    },
  ],
  schema: planSchema,
};

export const redemptionMethodsFormConfig = (
  api: ApiInstance,
  redemptionType: string,
) => ({
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      colSpan: 2,
    },
    {
      name: 'settlement_time',
      label: 'Settlement Time',
      type: 'text',
      required: true,
      colSpan: 2,
    },
    {
      name: 'fee_rate_id',
      label: 'Select Fee Rate',
      type: 'select',
      colSpan: 2,
      valueAsNumber: true,
      asyncOptions: async () => {
        if (!redemptionType) {
          return [];
        }

        const filter = {
          type: [redemptionType],
        };

        const res = await handleResponse(
          api.authenticatedGet(
            `/internal/instant-gratification-fee?page=1&limit=-1&filter=${encodeURIComponent(
              JSON.stringify(filter),
            )}`,
          ),
        );

        return res.data.map((feerate: FeeRate) => ({
          label: feerate.name,
          value: feerate.id,
        }));
      },
    },
  ],
  schema: redemptionMethodSchema,
});

export const feeRateFormConfig = (typeOptions: SelectOption[]) => ({
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      colSpan: 2,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: true,
      colSpan: 2,
    },
    {
      name: 'flat_rate_in_cents',
      label: 'Fee Flat Rate',
      type: 'number',
      helperText: 'eg: $10',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'percentage_rate',
      label: 'Percentage',
      type: 'number',
      helperText: 'eg: $10',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'entity',
      label: 'Entity',
      type: 'select',
      colSpan: 2,
      options: [
        { label: 'Customer', value: 'CUSTOMER' },
        { label: 'Merchant', value: 'MERCHANT' },
      ],
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: typeOptions,
      colSpan: 2,
    },
  ],
  schema: feeRateSchema,
});

export const workFlowFormConfig = {
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      colSpan: 2,
    },
    {
      name: 'transaction_kind',
      label: 'Transaction Kind',
      type: 'select',
      options: transactionKind,
      colSpan: 2,
    },
    {
      name: 'sub_type',
      label: 'Transaction SubType',
      type: 'select',
      options: transactionSubType,
      colSpan: 2,
    },
    {
      name: 'on_status_code',
      label: 'Transaction Status',
      type: 'select',
      valueAsNumber: true,
      options: transactionStatus,
      colSpan: 2,
    },
    {
      name: 'data',
      label: 'Data',
      type: 'textarea',
      helperText: 'valid JSON',
      colSpan: 2,
    },
    {
      name: 'is_default',
      label: 'Make It As Default Workflow',
      type: 'radio',
      options: [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ],
      colSpan: 2,
    },
  ],
  schema: workFlowSchema,
};

export const inviteCodeFormConfig = (isEditing: boolean) => ({
  fields: [
    {
      name: 'code',
      label: isEditing ? 'Code' : 'Custom Code (max 12 char)',
      type: 'text',
      helperText: isEditing ? undefined : 'e.g., WELCOME',
      colSpan: 2,
      disabled: isEditing,
    },
    {
      name: 'maximum_use_limit',
      label: 'Max Use Limit',
      type: 'number',
      helperText: 'e.g., 100',
      colSpan: 2,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: true,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'expires_at',
      label: 'Expires At',
      type: 'date',
      placeholder: 'MM/DD/YYYY',
      colSpan: 2,
    },
  ],
  schema: inviteCodeSchema(isEditing),
});

export const paymentPlanFormConfig = {
  fields: [
    {
      name: 'name',
      label: 'Plan Name',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'internal_name',
      label: 'Internal Name',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'plan_validity_in_days',
      label: 'Plan validity in Days',
      type: 'number',
      colSpan: 2,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'number_of_installments',
      label: 'Number of Installments',
      type: 'number',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'frequency_in_days',
      label: 'Frequency in Days',
      type: 'number',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'percentage_per_installment',
      label: 'Percentage Per Installment',
      type: 'number',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 3,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'fees_in_cents',
      label: 'Fee Flat Rate',
      type: 'number',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'minimum_transaction_amount_in_cents',
      label: 'Min Txn Amount',
      type: 'number',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'maximum_transaction_amount_in_cents',
      label: 'Max Txn Amount',
      type: 'number',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'is_active',
      label: 'Activate',
      type: 'radio',
      colSpan: 2,
      options: [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ],
    },
  ],
  schema: paymentPlanSchema,
};

export const llmProviderFormConfig = (api: ApiInstance) => ({
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      colSpan: 2,
    },
    {
      name: 'key',
      label: 'Key',
      type: 'text',
      required: true,
      colSpan: 2,
    },
    {
      name: 'weight',
      label: 'Weight',
      type: 'number',
      colSpan: 2,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 5,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'prompt_id',
      label: 'Select Prompt',
      type: 'select',
      colSpan: 2,
      valueAsNumber: true,
      asyncOptions: async () => {
        const res = await handleResponse(
          api.authenticatedGet(`/internal/llm/prompts?page=1&limit=-1`),
        );
        return res.data.map((prompt: GetAllPromptsResponse) => ({
          label: prompt.name,
          value: prompt.id,
        }));
      },
    },
  ],
  schema: llmProviderSchema,
});

export const PromptsFormConfig = {
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      colSpan: 2,
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea',
      placeholder: 'add the prompt here ...',
      height: '250px',
      colSpan: 2,
    },
  ],
  schema: promptsSchema,
};

export const MerchantsD2cFormConfig = (api: ApiInstance) => ({
  fields: [
    {
      name: 'name',
      label: 'Merchant Name',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'logo_path',
      label: 'Logo Path',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'return_url',
      label: 'Return URL',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'order_number_regex',
      label: 'Order Number Regex',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'refund_processing_days',
      label: 'Refund Processing Days',
      type: 'number',
      colSpan: 2,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 3,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'additional_data',
      label: 'Additional Data',
      type: 'textarea',
      helperText: 'valid JSON',
      colSpan: 2,
    },
    {
      label: 'Action State',
      type: 'textarea',
      name: 'action_state',
      helperText: 'valid JSON',
      colSpan: 2,
    },
    {
      name: 'brand_id',
      label: 'Brands',
      type: 'select',
      colSpan: 2,
      valueAsNumber: true,
      asyncOptions: async () => {
        const res = await handleResponse(
          api.authenticatedGet(`/brands?limit=-1&category=other`),
        );
        return res.brand_collection.data.map((brands: Brands) => ({
          label: brands.provider_brand_key,
          value: brands.id,
        }));
      },
    },
    {
      name: 'return_policy_link',
      label: 'Return Policy Link',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'is_featured',
      checkboxLabel: 'Feature the Brand',
      type: 'checkbox',
      colSpan: 2,
    },
  ],
  schema: merchantD2cSchema,
});

export const GiftCardsFormConfig = (api: ApiInstance) => ({
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      helperText: 'Name of the offer',
      colSpan: 2,
    },
    {
      name: 'mode',
      label: 'Mode',
      type: 'select',
      options: giftCardModes,
      colSpan: 2,
    },
    {
      name: 'percent',
      label: 'Percent',
      type: 'number',
      helperText: 'eg:5',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 3,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'maximum_offer_amount_in_cents',
      label: 'Max Offer Amount',
      type: 'number',
      helperText: 'eg: $100',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 5,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'minimum_transaction_amount_in_cents',
      label: 'Min Txn Amount',
      helperText: 'Offer starts from eg: $10',
      type: 'number',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'maximum_transaction_amount_in_cents',
      label: 'Max Txn Amount',
      helperText: 'Offer upto eg: $10',
      type: 'number',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'brand_id',
      label: 'Brands',
      type: 'multi-select',
      colSpan: 2,
      asyncOptions: async () => {
        const res = await handleResponse(
          api.authenticatedGet(`/brands?limit=-1&category=other`),
        );
        return res.brand_collection.data.map((brands: Brands) => ({
          label: brands.name,
          value: String(brands.id),
        }));
      },
    },
    {
      name: 'product_id',
      label: 'Products',
      type: 'multi-select',
      colSpan: 2,
      asyncOptions: async () => {
        const res = await handleResponse(
          api.authenticatedGet(`/internal/products?limit=-1`),
        );
        return res.data.map((product: Product) => ({
          label: product.name,
          value: String(product.id),
        }));
      },
    },
    {
      name: 'start_date',
      label: 'Start Date',
      type: 'datetime-local',
      placeholder: 'select date',
      colSpan: 2,
    },
    {
      name: 'end_date',
      label: 'End Date',
      type: 'datetime-local',
      placeholder: 'select date',
      colSpan: 2,
    },
  ],
  schema: giftCardSchema,
});

export const ProvidersFormConfig = {
  fields: [
    {
      name: 'name',
      label: 'Provider Name',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'config',
      label: 'Config',
      helperText: 'ex: {}',
      type: 'textarea',
      colSpan: 2,
    },
    {
      name: 'weight',
      label: 'Weight',
      type: 'number',
      colSpan: 2,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 5,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
  ],
  schema: providerSchema,
};

export const RulesFormConfig = (api: ApiInstance) => ({
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'provider_id',
      label: 'Provider',
      type: 'select',
      colSpan: 2,
      valueAsNumber: true,
      asyncOptions: async () => {
        const res = await handleResponse(
          api.authenticatedGet(`/internal/giftcards/service-providers`),
        );
        return res.data.map((provider: GetProvider) => ({
          label: provider.name,
          value: String(provider.id),
        }));
      },
    },
    {
      name: 'rule',
      label: 'Rule',
      type: 'select',
      colSpan: 2,
      asyncOptions: async () => {
        const res = await handleResponse(
          api.authenticatedGet(`/internal/giftcards/brands/rules`),
        );
        if (!res.rules || !Array.isArray(res.rules)) {
          return [];
        }
        return res.rules.map((rule: GetAllRules) => ({
          label: rule,
          value: String(rule),
        }));
      },
    },
    {
      name: 'amount_in_cents',
      label: 'Amount',
      type: 'number',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'weight',
      label: 'Weight',
      type: 'number',
      helperText: 'Set weight (numeric)',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 5,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
  ],
  schema: rulesSchema,
});

export const MerchantsFormConfig = {
  fields: [
    {
      name: 'first_name',
      label: 'First Name',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'last_name',
      label: 'Last Name',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'phone_number',
      label: 'Phone Number',
      type: 'number',
      colSpan: 2,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 10,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'website',
      label: 'Website Link',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'doing_business_as',
      label: 'Doing Business As',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'employer_identification_number',
      label: 'Employer Identification Number',
      type: 'number',
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 9,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
      colSpan: 2,
    },
    {
      name: 'corporate_name',
      label: 'Corporate Name',
      type: 'text',
      colSpan: 2,
    },
    {
      label: 'Line 1',
      type: 'text',
      required: true,
      placeholder: '',
      name: 'line_1',
      colSpan: 2,
    },
    {
      name: 'line_2',
      label: 'Line 2',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'state',
      label: 'State',
      type: 'select',
      options: states,
      colSpan: 2,
    },
    {
      name: 'zipcode',
      label: 'Zip Code',
      type: 'number',
      colSpan: 2,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 5,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'should_notify',
      checkboxLabel: 'Should Notify',
      type: 'checkbox',
      colSpan: 2,
    },
  ],
  schema: merchantSchema,
};

export const manualInvoiceSettlementFormConfig = {
  fields: [
    {
      name: 'utr_number',
      label: 'Unique Transaction Reference Number',
      type: 'text',
      colSpan: 2,
    },
    {
      name: 'invoice_number',
      label: 'Invoice Number',
      type: 'text',
      disabled: true,
      colSpan: 2,
    },
  ],
  schema: invoiceSettlementSchema,
};

export const merchantSettingsFormConfig = {
  fields: [
    {
      name: 'merchant_name',
      label: 'Merchant Name',
      type: 'text',
      required: true,
      disabled: true,
      colSpan: 2,
    },
    {
      name: 'delayed_by',
      label: 'Disbursement Batch Delayed by (in min)',
      helperText: 'eg: 10',
      type: 'number',
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
      colSpan: 2,
    },
    {
      name: 'minimum_refund_amount_in_cents',
      label: 'Min Refund Amount',
      type: 'number',
      helperText: 'eg: $10',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralIntegerScale: 5,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
        numeralDecimalScale: 0,
      },
    },
    {
      name: 'maximum_refund_amount_in_cents',
      label: 'Max Refund Amount',
      helperText: 'eg: $100',
      type: 'number',
      colSpan: 1,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 7,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'sftp_value',
      checkboxLabel: 'Enable SFTP',
      type: 'checkbox',
      colSpan: 2,
    },
    {
      name: 'notification_value',
      checkboxLabel: 'Enable Disbursement Notification',
      type: 'checkbox',
      colSpan: 2,
    },
  ],
  schema: merchantSettingsSchema,
};

export const assignPlanFormConfig = (api: ApiInstance) => ({
  fields: [
    {
      name: 'merchant_name',
      label: 'Merchant Name',
      type: 'text',
      required: true,
      disabled: true,
      colSpan: 2,
    },
    {
      name: 'plan_uuid',
      label: 'Plan',
      type: 'select',
      colSpan: 2,
      asyncOptions: async () => {
        const res = await handleResponse(
          api.authenticatedGet('/internal/plans?page=1&limit=-1'),
        );
        return res.data.map((plan: Plan) => ({
          label: plan.plan_name,
          value: plan.uuid,
        }));
      },
    },
    {
      name: 'activate_plan_immediately',
      checkboxLabel: 'Activate plan immediately',
      type: 'checkbox',
      colSpan: 2,
    },
  ],
  schema: assignPlanSchema,
});

export const assignWorkFlowFormConfig = (api: ApiInstance) => ({
  fields: [
    {
      name: 'merchant_name',
      label: 'Merchant Name',
      type: 'text',
      required: true,
      disabled: true,
      colSpan: 2,
    },
    {
      name: 'name',
      label: 'WorkFlow Name',
      type: 'select',
      colSpan: 2,
      asyncOptions: async () => {
        const res = await handleResponse(
          api.authenticatedGet('/internal/workflows?page=1&limit=-1'),
        );
        return res.data.map((workflow: WorkFlow) => ({
          label: workflow.name,
          value: workflow.name,
        }));
      },
    },
  ],
  schema: assignWorkFlowSchema,
});

export const assignFeeRateFormConfig = (api: ApiInstance) => ({
  fields: [
    {
      name: 'merchant_name',
      label: 'Merchant Name',
      type: 'text',
      required: true,
      disabled: true,
      colSpan: 2,
    },
    {
      name: 'fee_rate_id',
      label: 'WorkFlow Name',
      type: 'select',
      colSpan: 2,
      asyncOptions: async () => {
        const res = await handleResponse(
          api.authenticatedGet('/internal/instant-gratification-fee', {
            page: 1,
            limit: -1,
            filter: JSON.stringify({ type: ['MERCHANT_REFUND'] }),
          }),
        );

        return res.data
          .filter((feerate: FeeRate) => feerate.name?.trim())
          .map((feerate: FeeRate) => ({
            label: feerate.name,
            value: feerate.id,
          }));
      },
    },
  ],
  schema: assignFeeRateSchema,
});

export const cancleDisbursementFormConfig = {
  fields: [
    {
      name: 'note',
      label: 'Note',
      type: 'textarea',
      colSpan: 2,
    },
  ],
  schema: cancleDisbursementSchema,
};

export const setRefundLimitFormConfig = {
  fields: [
    {
      name: 'amount_in_cents',
      label: 'Refund limit per day',
      helperText: 'eg: $100',
      type: 'number',
      colSpan: 2,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 6,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
  ],
  schema: setRefundLimitSchema,
};

export const systemUserFormConfig = {
  fields: [
    {
      name: 'refund_amount_limit_in_cents',
      label: 'Refund amount limit in a day',
      helperText: 'By default refund amount for a day is $100',
      type: 'number',
      colSpan: 2,
      maskOptions: {
        numeral: true,
        numeralDecimalScale: 2,
        numeralIntegerScale: 6,
        numeralThousandsGroupStyle: 'none',
        stripLeadingZeroes: false,
        numeralPositiveOnly: true,
      },
    },
    {
      name: 'share_link',
      checkboxLabel: 'Generate with a shareable link',
      type: 'checkbox',
      colSpan: 2,
    },
  ],
  schema: systemUserSchema,
};
