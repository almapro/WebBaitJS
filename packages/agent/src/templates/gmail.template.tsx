import { FC } from "react";
import { useFavicon, useTitle } from "react-use";
import { AgentTemplateProps } from "../types";

export const GmailTemplate: FC<AgentTemplateProps> = ({ title }) => {
  useTitle(title || document.title || "Gmail");
  useFavicon('https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico');
  return <>Gmail Template</>;
}
