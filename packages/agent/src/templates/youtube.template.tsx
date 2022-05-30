import { FC } from "react";
import { useFavicon, useTitle } from "react-use"
import { AgentTemplateProps } from "../types"

export const YouTubeTemplate: FC<AgentTemplateProps> = ({ title }) => {
  useTitle(title || document.title || 'YouTube')
  useFavicon('https://www.youtube.com/s/desktop/fc7b0168/img/favicon.ico');
  return <>YouTube Template</>;
}
