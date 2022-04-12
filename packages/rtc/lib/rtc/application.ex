defmodule Rtc.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Rtc.Repo,
      # Start the Telemetry supervisor
      RtcWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Rtc.PubSub},
      # Start the Endpoint (http/https)
      RtcWeb.Endpoint
      # Start a worker by calling: Rtc.Worker.start_link(arg)
      # {Rtc.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_all, name: Rtc.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    RtcWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
