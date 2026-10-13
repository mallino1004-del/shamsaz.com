ALTER TABLE tumor_boards ADD CONSTRAINT boards_creator_organization
 FOREIGN KEY(created_by,organization_id) REFERENCES users(id,organization_id);

CREATE FUNCTION validate_board_case_organization() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE board_org TEXT; case_org TEXT;
BEGIN
 SELECT organization_id INTO board_org FROM tumor_boards WHERE id=NEW.board_id FOR SHARE;
 SELECT organization_id INTO case_org FROM registry_cases WHERE id=NEW.registry_case_id FOR SHARE;
 IF board_org IS NULL OR case_org IS NULL OR board_org <> case_org THEN
  RAISE EXCEPTION 'Tumor board and registry case must belong to the same organization' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER board_case_organization BEFORE INSERT OR UPDATE ON tumor_board_cases
 FOR EACH ROW EXECUTE FUNCTION validate_board_case_organization();

CREATE FUNCTION validate_board_participant_organization() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE board_org TEXT; user_org TEXT; user_role TEXT;
BEGIN
 SELECT organization_id INTO board_org FROM tumor_boards WHERE id=NEW.board_id FOR SHARE;
 SELECT organization_id,role INTO user_org,user_role FROM users WHERE id=NEW.user_id FOR SHARE;
 IF board_org IS NULL OR user_org IS NULL OR board_org <> user_org OR user_role <> 'doctor' THEN
  RAISE EXCEPTION 'Tumor board participants must be doctors from the same organization' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER board_participant_organization BEFORE INSERT OR UPDATE ON tumor_board_participants
 FOR EACH ROW EXECUTE FUNCTION validate_board_participant_organization();

CREATE FUNCTION protect_board_organization() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.organization_id IS DISTINCT FROM OLD.organization_id AND
   (EXISTS(SELECT 1 FROM tumor_board_cases WHERE board_id=OLD.id) OR
    EXISTS(SELECT 1 FROM tumor_board_participants WHERE board_id=OLD.id)) THEN
  RAISE EXCEPTION 'A populated tumor board cannot change organization' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER board_organization_immutable BEFORE UPDATE OF organization_id ON tumor_boards
 FOR EACH ROW EXECUTE FUNCTION protect_board_organization();

CREATE FUNCTION protect_registry_board_organization() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.organization_id IS DISTINCT FROM OLD.organization_id AND
   EXISTS(SELECT 1 FROM tumor_board_cases WHERE registry_case_id=OLD.id) THEN
  RAISE EXCEPTION 'A registry case linked to a board cannot change organization' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER registry_board_organization_immutable BEFORE UPDATE OF organization_id ON registry_cases
 FOR EACH ROW EXECUTE FUNCTION protect_registry_board_organization();
