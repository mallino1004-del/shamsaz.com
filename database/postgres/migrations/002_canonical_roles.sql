ALTER TABLE users DROP CONSTRAINT users_role_check;
UPDATE users SET role = CASE role WHEN 'registry' THEN 'registry_clerk' WHEN 'admin' THEN 'clinic_admin' WHEN 'supervisor' THEN 'national_supervisor' ELSE role END;
UPDATE organization_memberships SET role = CASE role WHEN 'registry' THEN 'registry_clerk' WHEN 'admin' THEN 'clinic_admin' WHEN 'supervisor' THEN 'national_supervisor' ELSE role END;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK(role IN ('patient','doctor','registry_clerk','clinic_admin','national_supervisor'));
