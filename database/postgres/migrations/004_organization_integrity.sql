ALTER TABLE users ADD CONSTRAINT users_identity_organization UNIQUE(id,organization_id);
ALTER TABLE registry_cases ADD CONSTRAINT registry_patient_organization FOREIGN KEY(patient_id,organization_id) REFERENCES users(id,organization_id);
ALTER TABLE registry_cases ADD CONSTRAINT registry_author_organization FOREIGN KEY(created_by,organization_id) REFERENCES users(id,organization_id);
ALTER TABLE appointments ADD CONSTRAINT appointments_doctor_organization FOREIGN KEY(doctor_id,organization_id) REFERENCES users(id,organization_id);
ALTER TABLE appointment_slots ADD CONSTRAINT slots_doctor_organization FOREIGN KEY(doctor_id,organization_id) REFERENCES users(id,organization_id);
