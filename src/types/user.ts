export type SignUpBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type SignInBody = {
  email: string;
  password: string;
};

export type UpdateUserBody = {
  firstName?: string;
  lastName?: string;
};

export type UserResponse = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailConfirmed: boolean;
  paymentCustomerId: string | null;
  createdAt: string;
};
