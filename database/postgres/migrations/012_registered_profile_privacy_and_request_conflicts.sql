CREATE OR REPLACE FUNCTION sync_registered_practitioner(doctor_id TEXT) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO public_practitioners(id,display_name,specialty,category_id,city,address,phone,source_url,source_checked_at,account_id)
 SELECT 'registered-'||u.id,u.display_name,d.specialty,'registered-clinicians',o.city,o.address,COALESCE(o.phone,''),NULL,CURRENT_TIMESTAMP,u.id
 FROM users u JOIN doctor_profiles d ON d.user_id=u.id JOIN organizations o ON o.id=u.organization_id
 WHERE u.id=doctor_id AND u.role='doctor' AND u.status='active' AND o.status='active'
 AND NOT EXISTS(SELECT 1 FROM public_practitioners existing WHERE existing.account_id=u.id AND existing.id<>'registered-'||u.id)
 ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name,specialty=excluded.specialty,city=excluded.city,address=excluded.address,phone=excluded.phone,source_checked_at=CURRENT_TIMESTAMP
 WHERE public_practitioners.source_url IS NULL AND public_practitioners.account_id=excluded.account_id;
END;
$$;
UPDATE public_practitioners p SET phone=COALESCE(o.phone,'') FROM users u JOIN organizations o ON o.id=u.organization_id WHERE p.account_id=u.id AND p.source_url IS NULL;
CREATE UNIQUE INDEX public_visit_confirmed_time ON public_visit_requests(practitioner_id,preferred_at) WHERE status='confirmed';
