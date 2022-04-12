defmodule RtcWeb.RoomController do
  use RtcWeb, :controller

  alias Rtc.RTC
  alias Rtc.RTC.Room

  action_fallback RtcWeb.FallbackController

  def index(conn, _params) do
    rooms = RTC.list_rooms()
    render(conn, "index.json", rooms: rooms)
  end

  def create(conn, %{"room" => room_params}) do
    with {:ok, %Room{} = room} <- RTC.create_room(room_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.room_show_path(conn, :show, room))
      |> render("show.json", room: room)
    end
  end

  def show(conn, %{"id" => id}) do
    room = RTC.get_room!(id)
    render(conn, "show.json", room: room)
  end

  def update(conn, %{"id" => id, "room" => room_params}) do
    room = RTC.get_room!(id)

    with {:ok, %Room{} = room} <- RTC.update_room(room, room_params) do
      render(conn, "show.json", room: room)
    end
  end

  def delete(conn, %{"id" => id}) do
    room = RTC.get_room!(id)

    with {:ok, %Room{}} <- RTC.delete_room(room) do
      send_resp(conn, :no_content, "")
    end
  end

  def errors(conn, _params) do
    render(conn, "errors.json", %{errors: []})
  end

  def redirectToWeb(conn, _params) do
    redirect(conn, to: "/web")
  end
end
