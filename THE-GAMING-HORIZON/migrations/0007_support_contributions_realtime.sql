-- Enables Supabase Realtime change notifications on support_contributions,
-- so the Horizon Pay checkout screen (components/horizon-pay-checkout.tsx)
-- can subscribe to a single row and flip to "Payment successful" the
-- instant an admin verifies it, without a page refresh.
--
-- This does NOT change what triggers a verification — that is still an
-- admin clicking Verify in support-admin-panel.tsx after checking the UTR
-- against the project's own bank/UPI statement by hand (see
-- 0006_support_contributions.sql). This migration only makes that
-- database change reach the browser instantly instead of on next fetch.
--
-- Row-level security still applies to Realtime: a signed-in payer only
-- receives change events for rows their own "Users can read their own
-- contributions" policy already lets them SELECT.
--
-- Guarded because Supabase projects usually already have a
-- `supabase_realtime` publication — re-adding a table that's already a
-- member throws, so this checks first.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'support_contributions'
  ) then
    alter publication supabase_realtime add table public.support_contributions;
  end if;
end
$$;
