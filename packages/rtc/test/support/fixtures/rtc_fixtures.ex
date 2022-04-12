defmodule Rtc.RTCFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Rtc.RTC` context.
  """

  @doc """
  Generate a room.
  """
  def room_fixture(attrs \\ %{}) do
    {:ok, room} =
      attrs
      |> Enum.into(%{
        slug: "some-slug",
        title: "some title"
      })
      |> Rtc.RTC.create_room()

    room
  end
end
