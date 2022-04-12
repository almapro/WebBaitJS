defmodule Rtc.Repo.Migrations.CreateRooms do
  use Ecto.Migration

  def change do
    create table(:rooms) do
      add :title, :string
      add :slug, :string

      timestamps()
    end
    create unique_index(:rooms, :slug, name: :rooms_slug_unique)
  end
end
