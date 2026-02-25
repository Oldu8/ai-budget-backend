export type AuthenticatedUser = {
  id: number;
  supabaseId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};
