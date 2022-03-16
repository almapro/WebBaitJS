import { AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import { Button, Grid } from "@mui/material";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { useTitle } from "react-use";

export type HomeViewProps = {};

export const HomeView: FC<HomeViewProps> = () => {
  const { t } = useTranslation();
  useTitle(`WebBait - ${t('titles.home')}`);
  return (
    <Grid container spacing={2} p={2}>
      <Grid item xs={12}>
        <Button variant='contained' startIcon={<AutoAwesomeIcon />}>Home</Button>
      </Grid>
    </Grid>
  );
};
