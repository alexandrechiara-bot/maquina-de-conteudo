-- Bucket de Storage para logos do Brand Kit
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Cada usuário só pode gerenciar arquivos dentro da própria pasta (logos/<user_id>/...)
create policy "Usuários podem ver os próprios logos"
  on storage.objects for select
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Usuários podem enviar os próprios logos"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Usuários podem atualizar os próprios logos"
  on storage.objects for update
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Usuários podem apagar os próprios logos"
  on storage.objects for delete
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
