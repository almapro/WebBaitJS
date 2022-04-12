defmodule RtcWeb.PageControllerTest do
  use RtcWeb.ConnCase

  test "GET /web", %{conn: conn} do
    conn = get(conn, "/web")
    assert html_response(conn, 200) =~ "Welcome to Phoenix!"
  end
end
