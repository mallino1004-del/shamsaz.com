CREATE FUNCTION protect_board_participant_affiliation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF (NEW.organization_id IS DISTINCT FROM OLD.organization_id OR NEW.role IS DISTINCT FROM OLD.role)
    AND EXISTS(SELECT 1 FROM tumor_board_participants WHERE user_id=OLD.id) THEN
  RAISE EXCEPTION 'A tumor board participant cannot change center or role without an explicit board transfer workflow' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER board_participant_affiliation_immutable BEFORE UPDATE OF organization_id,role ON users
 FOR EACH ROW EXECUTE FUNCTION protect_board_participant_affiliation();
