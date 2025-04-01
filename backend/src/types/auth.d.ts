export type userBuyer = {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  subscriptionStatus: string;
};

export type userSeller = {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isApproved: boolean;
};
