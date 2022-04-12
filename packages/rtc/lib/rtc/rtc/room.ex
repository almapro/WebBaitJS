defmodule Rtc.RTC.Room do
  use Ecto.Schema
  import Ecto.Changeset

  schema "rooms" do
    field :slug, :string
    field :title, :string

    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:title, :slug])
    |> validate_required([:title, :slug])
    |> validate_format(:slug, ~r/^(?!-).*$/)
    |> validate_format(:slug, ~r/^[a-z0-9-]+$/)
    |> validate_format(:slug, ~r/^.*(?!-)$/)
    |> unique_constraint(:rooms_slug_unique, name: :rooms_slug_unique)
  end

end
