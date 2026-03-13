-- Add service_role write policies for memorial tables
-- Allows admin operations via Supabase Dashboard and service-role key

create policy "service_write_timeline_events" on disaster_timeline_events
  for all to service_role using (true) with check (true);

create policy "service_write_lessons" on lessons
  for all to service_role using (true) with check (true);

create policy "service_write_initiatives" on recovery_initiatives
  for all to service_role using (true) with check (true);

create policy "service_write_gallery" on photo_gallery_items
  for all to service_role using (true) with check (true);

create policy "service_write_statistics" on statistics
  for all to service_role using (true) with check (true);

-- Add scan_type constraint on scan_events
alter table scan_events add constraint scan_events_scan_type_check
  check (scan_type in ('qr', 'nfc'));
