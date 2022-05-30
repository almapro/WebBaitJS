import { FC } from "react";
import { useFavicon, useTitle } from "react-use";
import { AgentTemplateProps } from "../types";

export const ZoomTemplate: FC<AgentTemplateProps> = ({ title }) => {
  useTitle(title || document.title || 'Zoom');
  useFavicon('https://st1.zoom.us/zoom.ico')
  return <>Zoom Template</>;
}
