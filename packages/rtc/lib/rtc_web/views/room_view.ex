defmodule RtcWeb.RoomView do
  use RtcWeb, :view
  alias RtcWeb.RoomView

  def render("index.json", %{rooms: rooms}) do
    %{data: render_many(rooms, RoomView, "room.json")}
  end

  def render("show.json", %{room: room}) do
    %{data: render_one(room, RoomView, "room.json")}
  end

  def render("room.json", %{room: room}) do
    %{
      id: room.id,
      title: room.title,
      slug: room.slug
    }
  end

  def render("errors.json", %{"errors" => errors}) do
    %{errors: Enum.map(errors, fn error -> error end)}
  end

  def render("errors.json", %{errors: errors}) do
    %{errors: errors}
  end
end
