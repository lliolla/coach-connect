create or replace function remove_session_from_objectif_and_renumber(
  p_session_id uuid,
  p_old_objectif_id uuid
)
returns void
language plpgsql
as $$
begin
  -- 1. Mettre objectif_id et session_number à null pour la séance spécifiée
  update sessions
  set objectif_id = null, session_number = null
  where id = p_session_id;

  -- 2. Renuméroter les séances restantes de l'ancien objectif
  update sessions s
  set session_number = new_numbers.new_number
  from (
    select
      id,
      row_number() over (order by session_number) as new_number
    from sessions
    where objectif_id = p_old_objectif_id
  ) new_numbers
  where s.id = new_numbers.id;
end;
$$;
