import { AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import { Button, Grid } from "@mui/material";
import React from "react";

export type HomeViewProps = {};

export const HomeView = () => {
  return (
    <Grid container spacing={2} p={2}>
      <Grid item xs={12}>
        <Button variant='contained' startIcon={<AutoAwesomeIcon />}>Home</Button>
      </Grid>
    </Grid>
  );
};
