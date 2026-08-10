-- 1. Ajouter la contrainte UNIQUE pour objectif_id + session_number
ALTER TABLE sessions ADD CONSTRAINT unique_objectif_session_number UNIQUE (objectif_id, session_number);

-- 2. Créer la fonction pour décrémenter les numéros de séance
create or replace function decrement_session_numbers(
  objectif_id bigint,
  start_number bigint,
  end_number bigint default null
) returns void as $$
begin
  if end_number is null then
    update sessions
    set session_number = session_number - 1
    where objectif_id = decrement_session_numbers.objectif_id
      and session_number >= decrement_session_numbers.start_number;
  else
    update sessions
    set session_number = session_number - 1
    where objectif_id = decrement_session_numbers.objectif_id
      and session_number between decrement_session_numbers.start_number and decrement_session_numbers.end_number;
  end if;
end;
$$ language plpgsql;

-- 3. Créer la fonction pour incrémenter les numéros de séance
create or replace function increment_session_numbers(
  objectif_id bigint,
  start_number bigint,
  end_number bigint
) returns void as $$
begin
  update sessions
  set session_number = session_number + 1
  where objectif_id = increment_session_numbers.objectif_id
    and session_number between increment_session_numbers.start_number and increment_session_numbers.end_number;
end;
$$ language plpgsql;
