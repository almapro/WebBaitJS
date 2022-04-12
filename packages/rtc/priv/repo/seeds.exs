# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
    # Rtc.Repo.insert!(%Rtc.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
Rtc.Repo.insert!(%Rtc.RTC.Room{ title: "Room 1", slug: "room-1" })
Rtc.Repo.insert!(%Rtc.RTC.Room{ title: "Room 2", slug: "room-2" })
Rtc.Repo.insert!(%Rtc.RTC.Room{ title: "Room 3", slug: "room-3" })
