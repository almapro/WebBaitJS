defmodule Rtc.Repo do
  use Ecto.Repo,
    otp_app: :rtc,
    adapter: Ecto.Adapters.MyXQL
end
