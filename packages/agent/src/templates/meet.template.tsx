import { FC } from "react";
import { useFavicon, useTitle } from "react-use";
import { AgentTemplateProps } from "../types";

export const MeetTemplate: FC<AgentTemplateProps> = ({ title }) => {
  useTitle(title || document.title || "Google Meet");
  useFavicon('https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-24dp/logo_meet_2020q4_color_1x_web_24dp.png');
  return <>Meet Template</>;
}
