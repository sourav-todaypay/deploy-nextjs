import { z } from 'zod';

export const merchantSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, 'First Name must have at least 2 characters')
    .max(50, 'First Name can have at most 50 characters')
    .regex(
      /^[A-Za-z]+$/,
      'First name must only contain alphabets without spaces',
    ),

  last_name: z
    .string()
    .trim()
    .min(1, 'Last Name must have at least 1 character')
    .max(50, 'Last Name can have at most 50 characters')
    .regex(
      /^[A-Za-z]+$/,
      'Last name must only contain alphabets without spaces',
    ),

  phone_number: z.preprocess(
    val => (val === null ? null : val),
    z.number().min(10, 'Phone number required').nullable(),
  ),

  email: z.string().trim().email('Invalid email'),

  website: z
    .string()
    .trim()
    .regex(
      /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g,
      'Invalid website',
    ),

  corporate_name: z
    .string()
    .trim()
    .max(50, 'Entity legal name can have at most 50 characters'),

  doing_business_as: z
    .string()
    .trim()
    .max(50, 'Entity legal name can have at most 50 characters'),

  employer_identification_number: z.preprocess(
    val => (val === null ? null : val),
    z.number().min(9, 'EIN must be exactly 9 digits').nullable(),
  ),

  line_1: z
    .string()
    .trim()
    .min(1, 'Street Address 1 is required')
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      'Street Address 1 must only contain alphanumeric characters with spaces',
    ),

  line_2: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      'Street Address 2 must only contain alphanumeric characters with spaces',
    )
    .optional(),

  city: z
    .string()
    .trim()
    .max(50, 'City name can have at most 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'City must only contain alphabets with spaces'),

  state: z.string().trim().min(1, 'State is required'),

  zipcode: z.preprocess(
    val => (val === null ? null : val),
    z.number().min(5, 'Zip Code must be exactly 5 digits').nullable(),
  ),

  should_notify: z.boolean(),
});

export type MerchantFormValues = z.infer<typeof merchantSchema>;
