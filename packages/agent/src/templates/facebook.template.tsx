import { FC } from "react";
import { useFavicon, useTitle } from "react-use";
import { AgentTemplateProps } from "../types";

export const FacebookTemplate: FC<AgentTemplateProps> = ({ title }) => {
  useTitle(title || document.title || "Facebook");
  useFavicon('https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico');
  return <>Facebook Template</>;
}
