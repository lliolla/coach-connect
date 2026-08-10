create or replace function public.duplicate_session(
    p_session_id uuid,
    p_new_title text
)
returns uuid
language plpgsql
security definer
as $$
declare
    v_new_session_id uuid;
    v_objectif_id integer;
    v_session_count integer;
    v_new_session_number integer;
begin
    -- 1. Récupérer les informations de la session originale
    select
        objectif_id
    into
        v_objectif_id
    from public.sessions
    where id = p_session_id;

    -- 2. Calculer le nouveau session_number si la session fait partie d'un objectif
    if v_objectif_id is not null then
        select count(*) + 1
        into v_session_count
        from public.sessions
        where objectif_id = v_objectif_id;

        v_new_session_number := v_session_count;
    else
        v_new_session_number := null;
    end if;

    -- 3. Créer la nouvelle session dans une transaction
    insert into public.sessions (
        id,
        athlete_id,
        title,
        description,
        date,
        status,
        is_template,
        main_rounds,
        duration,
        objectif_id,
        session_number,
        realisation,
        created_at
    )
    select
        gen_random_uuid(),
        athlete_id,
        p_new_title,
        description,
        date,
        status,
        is_template,
        main_rounds,
        duration,
        objectif_id,
        case when v_objectif_id is not null then v_new_session_number else null end,
        realisation,
        now()
    from public.sessions
    where id = p_session_id
    returning id into v_new_session_id;

    -- 4. Copier tous les exercices associés
    insert into public.session_exercises (
        id,
        session_id,
        exercise_id,
        sets,
        reps,
        weight,
        rest_time,
        order_index,
        notes,
        intensity,
        section,
        rounds,
        created_at
    )
    select
        gen_random_uuid(),
        v_new_session_id,
        exercise_id,
        sets,
        reps,
        weight,
        rest_time,
        order_index,
        notes,
        intensity,
        section,
        rounds,
        now()
    from public.session_exercises
    where session_id = p_session_id;

    -- 5. Retourner l'ID de la nouvelle session
    return v_new_session_id;
exception
    when others then
        raise;
end;
$$;
