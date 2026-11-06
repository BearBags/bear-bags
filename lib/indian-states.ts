// Delivery states for checkout, with the code Zoho Books expects as the GST
// place of supply. Shared by the checkout form and the server, so this file must
// not import the database.
//
// The place of supply decides the tax: CGST + SGST inside Madhya Pradesh (where
// Eye of Arjuna is registered), IGST everywhere else.
//
// Not yet checked against a live Zoho organisation: the codes for Chhattisgarh,
// Odisha, Telangana, Uttarakhand and Dadra & Nagar Haveli and Daman & Diu have
// more than one form in use. A wrong code makes Zoho reject the invoice with
// its own error message, which the admin shows next to the order.
export const INDIAN_STATES = [
  { name: 'Andaman and Nicobar Islands', code: 'AN' },
  { name: 'Andhra Pradesh', code: 'AP' },
  { name: 'Arunachal Pradesh', code: 'AR' },
  { name: 'Assam', code: 'AS' },
  { name: 'Bihar', code: 'BR' },
  { name: 'Chandigarh', code: 'CH' },
  { name: 'Chhattisgarh', code: 'CG' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN' },
  { name: 'Delhi', code: 'DL' },
  { name: 'Goa', code: 'GA' },
  { name: 'Gujarat', code: 'GJ' },
  { name: 'Haryana', code: 'HR' },
  { name: 'Himachal Pradesh', code: 'HP' },
  { name: 'Jammu and Kashmir', code: 'JK' },
  { name: 'Jharkhand', code: 'JH' },
  { name: 'Karnataka', code: 'KA' },
  { name: 'Kerala', code: 'KL' },
  { name: 'Ladakh', code: 'LA' },
  { name: 'Lakshadweep', code: 'LD' },
  { name: 'Madhya Pradesh', code: 'MP' },
  { name: 'Maharashtra', code: 'MH' },
  { name: 'Manipur', code: 'MN' },
  { name: 'Meghalaya', code: 'ML' },
  { name: 'Mizoram', code: 'MZ' },
  { name: 'Nagaland', code: 'NL' },
  { name: 'Odisha', code: 'OR' },
  { name: 'Puducherry', code: 'PY' },
  { name: 'Punjab', code: 'PB' },
  { name: 'Rajasthan', code: 'RJ' },
  { name: 'Sikkim', code: 'SK' },
  { name: 'Tamil Nadu', code: 'TN' },
  { name: 'Telangana', code: 'TS' },
  { name: 'Tripura', code: 'TR' },
  { name: 'Uttar Pradesh', code: 'UP' },
  { name: 'Uttarakhand', code: 'UK' },
  { name: 'West Bengal', code: 'WB' },
] as const;

export const isIndianState = (name: string) => INDIAN_STATES.some((s) => s.name === name);

export const stateCode = (name: string | null | undefined) => INDIAN_STATES.find((s) => s.name === name)?.code ?? null;
