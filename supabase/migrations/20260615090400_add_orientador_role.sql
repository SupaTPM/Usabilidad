-- Paso 1/2: Agregar el valor al enum en su propia transacción.
-- PostgreSQL no permite usar un enum value nuevo en la misma
-- transacción que lo crea — por eso esto va en un archivo separado.
alter type public.user_role add value if not exists 'orientador';
