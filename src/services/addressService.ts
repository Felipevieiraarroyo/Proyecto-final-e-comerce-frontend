import api from "./api";

export interface Address {
  id: number;
  customerId: number;
  street: string;
  number: string;
  complement: string | null;
  city: string;
  reference: string | null;
}

export interface CreateAddressData {
  street: string;
  number: string;
  complement?: string;
  city: string;
  reference?: string;
}

export async function getMyAddresses(): Promise<Address[]> {
  const response = await api.get<Address[]>("/addresses/me");
  return response.data;
}

export async function createMyAddress(
  data: CreateAddressData,
): Promise<Address> {
  const response = await api.post<Address>("/addresses/me", data);
  return response.data;
}
