ALTER TABLE public_practitioners ALTER COLUMN source_url DROP NOT NULL;
INSERT INTO practitioner_categories(id,label,sort_order) VALUES('registered-clinicians','پزشکان عضو شمساز',-1) ON CONFLICT(id) DO NOTHING;

CREATE FUNCTION sync_registered_practitioner(doctor_id TEXT) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO public_practitioners(id,display_name,specialty,category_id,city,address,phone,source_url,source_checked_at,account_id)
 SELECT 'registered-'||u.id,u.display_name,d.specialty,'registered-clinicians',o.city,o.address,COALESCE(o.phone,u.phone,''),NULL,CURRENT_TIMESTAMP,u.id
 FROM users u JOIN doctor_profiles d ON d.user_id=u.id JOIN organizations o ON o.id=u.organization_id
 WHERE u.id=doctor_id AND u.role='doctor' AND u.status='active' AND o.status='active'
 AND NOT EXISTS(SELECT 1 FROM public_practitioners existing WHERE existing.account_id=u.id AND existing.id<>'registered-'||u.id)
 ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name,specialty=excluded.specialty,city=excluded.city,address=excluded.address,phone=excluded.phone,source_checked_at=CURRENT_TIMESTAMP
 WHERE public_practitioners.source_url IS NULL AND public_practitioners.account_id=excluded.account_id;
END;
$$;
CREATE FUNCTION refresh_registered_doctor_profile() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM sync_registered_practitioner(NEW.user_id);
 RETURN NEW;
END;
$$;
CREATE TRIGGER registered_doctor_profile_sync AFTER INSERT OR UPDATE OF specialty ON doctor_profiles FOR EACH ROW EXECUTE FUNCTION refresh_registered_doctor_profile();
CREATE FUNCTION refresh_registered_user_profile() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM sync_registered_practitioner(NEW.id);
 RETURN NEW;
END;
$$;
CREATE TRIGGER registered_user_profile_sync AFTER UPDATE OF display_name,phone,organization_id,status,role ON users FOR EACH ROW EXECUTE FUNCTION refresh_registered_user_profile();
CREATE FUNCTION refresh_registered_organization_profiles() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE doctor RECORD;
BEGIN
 FOR doctor IN SELECT id FROM users WHERE organization_id=NEW.id AND role='doctor' LOOP
  PERFORM sync_registered_practitioner(doctor.id);
 END LOOP;
 RETURN NEW;
END;
$$;
CREATE TRIGGER registered_organization_profile_sync AFTER UPDATE OF city,address,phone,status ON organizations FOR EACH ROW EXECUTE FUNCTION refresh_registered_organization_profiles();
DO $$ DECLARE doctor RECORD; BEGIN
 FOR doctor IN SELECT id FROM users WHERE role='doctor' AND status='active' LOOP
  PERFORM sync_registered_practitioner(doctor.id);
 END LOOP;
END $$;
