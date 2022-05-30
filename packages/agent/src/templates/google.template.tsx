import { FC } from "react";
import { useFavicon, useTitle } from "react-use";
import { AgentTemplateProps } from "../types";

export const GoogleTemplate: FC<AgentTemplateProps> = ({ title }) => {
  useTitle(title || document.title || "Google");
  useFavicon('https://www.google.com/favicon.ico');
  return <>Google Template</>;
}
