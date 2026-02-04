-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a new INSERT policy that works during signup
-- The user is authenticated at signup time, so auth.uid() should work
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);