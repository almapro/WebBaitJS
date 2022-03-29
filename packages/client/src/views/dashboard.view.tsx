import { Box, Paper, Slider, Typography, useTheme } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTitle } from "react-use";
import { ChoroplethTooltip, ResponsiveChoropleth } from "@nivo/geo";
import countries from '../world_countries.json';
import { ResponsiveSunburst, ComputedDatum } from "@nivo/sunburst";
import { ResponsiveLine, PointTooltip } from "@nivo/line";
import { AgentsByCountry, AgentsBySite, RootState, FETCH_AGENTS_BY_COUNTRY_ACTION, FETCH_AGENTS_BY_SITE_ACTION, FETCH_AGENTS_PER_MONTH_ACTION } from "../redux";
import { useDispatch, useSelector } from "react-redux";

const CustomLineTooltip: PointTooltip = ({ point }) => {
  return (
    <Paper elevation={1} sx={{ p: 1 }}>
      <Typography variant='caption'>{point.data.y}</Typography>
    </Paper>
  );
}

const CustomChoroplethTooptip: ChoroplethTooltip = ({
  feature
}) => {
  if (!!!feature.value) return null;
  return (
    <Paper elevation={1} sx={{ p: 1 }}>
      <Typography variant='caption'>{feature.label}: {feature.value}</Typography>
    </Paper>
  );
};

const CustomSunburstTooptip: FC<ComputedDatum<AgentsBySite>> = ({
  data
}) => {
  if (!!!data.loc) return <Paper elevation={1} sx={{ p: 1 }}>
    <Typography variant='caption'>{data.name}</Typography>
  </Paper>
  return (
    <Paper elevation={1} sx={{ p: 1 }}>
      <Typography variant='caption'>{data.name}: {data.loc}</Typography>
    </Paper>
  );
};

export const DashboardView = () => {
  const { t } = useTranslation();
  useTitle(`WebBait - ${t('titles.dashboard')}`);
  const theme = useTheme();
  const dispatch = useDispatch();
  const [
    lineChartData,
    geoChartData,
    sunburstChartData,
  ] = useSelector<RootState, [
    number[],
    AgentsByCountry[],
    AgentsBySite[]
  ]>(state => [
    state.statistics.agents_per_month,
    state.statistics.agents_by_country,
    state.statistics.agents_by_site
  ]);
  const [geoChartRotation, setGeoChartRotation] = useState(0);
  useEffect(() => {
    dispatch(FETCH_AGENTS_PER_MONTH_ACTION());
    dispatch(FETCH_AGENTS_BY_COUNTRY_ACTION());
    dispatch(FETCH_AGENTS_BY_SITE_ACTION());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Box p={2} sx={{
      height: `calc(100% - (${theme.mixins.toolbar.minHeight}px + ${theme.spacing(2)}))`,
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 1,
      gridTemplateRows: 'repaet(2, 5fr)',
      gridTemplateAreas: `"lineChart sunburstChart" "geoChart geoChart"`,
    }}>
      <Box sx={{ gridArea: 'lineChart', height: '49vh' }}>
        <Paper elevation={3} sx={{ height: '100%', color: 'inherit' }}>
          <Typography variant='subtitle1' textAlign='center'>{t('titles.charts.agents_per_month')}</Typography>
          <ResponsiveLine
            data={[{ id: 'agents', color: theme.palette.success.main, data: lineChartData.map((d, i) => ({ x: i + 1, y: d })) }]}
            margin={{ top: 10, right: 50, bottom: 70, left: 50 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 'auto',
              max: 'auto',
              stacked: true,
              reverse: false,
            }}
            yFormat=" >-.2f"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 1,
              tickPadding: 1,
              tickRotation: 0,
            }}
            pointLabelYOffset={-12}
            pointSize={10}
            colors={[theme.palette.success.main]}
            pointBorderWidth={2}
            theme={{ axis: { ticks: { text: { fill: theme.palette.text.primary } } }, crosshair: { line: { stroke: theme.palette.text.primary } } }}
            useMesh={true}
            legends={[]}
            tooltip={CustomLineTooltip}
          />
        </Paper>
      </Box>
      <Box sx={{ gridArea: 'sunburstChart', height: '49vh' }}>
        <Paper elevation={3} sx={{ height: '100%' }}>
          <Typography variant='subtitle1' textAlign='center'>{t('titles.charts.agents_by_site')}</Typography>
          <ResponsiveSunburst
            data={{ name: '', color: '', children: sunburstChartData }}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            id="name"
            value="loc"
            cornerRadius={2}
            borderColor={{ theme: 'background' }}
            colors={{ scheme: 'nivo' }}
            childColor={{
              from: 'color',
              modifiers: [
                [
                  'brighter',
                  0.1
                ]
              ]
            }}
            tooltip={(props) => <CustomSunburstTooptip {...props} />}
          />
        </Paper>
      </Box>
      <Box sx={{ gridArea: 'geoChart' }}>
        <Paper elevation={3}>
          <Box sx={{
            height: '50vh',
            width: `calc(100% - ${theme.spacing(1)})`,
            gap: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gridTemplateAreas: `"title title" "chart chart"`,
          }}>
            <Box sx={{ gridArea: 'title', justifyContent: 'center', display: 'grid' }}>
              <Typography variant='subtitle1' textAlign='center'>{t('titles.charts.agents_by_country')}</Typography>
              <Box sx={{ width: '80%' }}>
                <Slider value={geoChartRotation} onChange={(__, value) => setGeoChartRotation(typeof value === 'number' ? value : value[0])} min={-360} max={360} valueLabelDisplay='auto' />
              </Box>
            </Box>
            <Box sx={{ height: '100%', maxHeight: '40vh', gridArea: 'chart' }}>
              <ResponsiveChoropleth
                data={geoChartData}
                features={countries.features}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                colors="greens"
                domain={[0, 1000000]}
                unknownColor="#666666"
                label="properties.name"
                valueFormat=".2s"
                projectionType="orthographic"
                projectionScale={175}
                projectionTranslation={[0.5, 0.5]}
                projectionRotation={[geoChartRotation, 0, 0]}
                enableGraticule={true}
                graticuleLineColor="#dddddd"
                borderWidth={0.5}
                borderColor="#152538"
                legends={[]}
                tooltip={CustomChoroplethTooptip}
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
