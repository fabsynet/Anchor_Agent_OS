-- Grant authenticated users access to the users table via PostgREST
GRANT SELECT ON public.users TO authenticated;

-- Enable Row Level Security so users can only read their own row
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
