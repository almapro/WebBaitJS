defmodule RtcWeb.RoomLive.Show do
  use RtcWeb, :live_view

  alias Rtc.RTC

  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  @impl true
  def handle_params(%{"id" => id}, _, socket) do
    case RTC.get_room!(id) do
      %{error: error} ->
        {:noreply,
          socket
          |> put_flash(:error, error)
          |> push_redirect(to: "/web/rooms")}
      room ->
        {:noreply,
         socket
         |> assign(:page_title, page_title(socket.assigns.live_action))
         |> assign(:room, room)}
    end
  end

  defp page_title(:show), do: "Show Room"
  defp page_title(:edit), do: "Edit Room"
end
