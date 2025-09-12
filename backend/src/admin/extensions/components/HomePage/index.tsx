import React from 'react';
import { Box, Flex, Typography, Grid } from '@strapi/design-system';
import { Link } from '@strapi/design-system/v2';
import { ContentBox, useTracking } from '@strapi/helper-plugin';
import { ArrowRight, Plus, Puzzle } from '@strapi/icons';

const HomePage = () => {
  const { trackUsage } = useTracking();

  return (
    <Box padding={8} background="neutral100">
      <Box paddingBottom={8}>
        <Typography variant="alpha" as="h1">
          Welcome to Smart Park Admin
        </Typography>
        <Typography variant="epsilon" textColor="neutral600">
          Manage your parking locations, slots, and bookings
        </Typography>
      </Box>

      <Grid gap={6}>
        <Flex gap={4}>
          <ContentBox
            title="Create your first location"
            subtitle="Add parking locations with available slots"
            icon={<Plus />}
            iconBackground="primary100"
            onClick={() => {
              trackUsage('didClickOnCreateLocation');
              window.location.href = '/admin/content-manager/collectionType/api::location.location/create';
            }}
          />

          <ContentBox
            title="Manage bookings"
            subtitle="View and manage parking slot bookings"
            icon={<ArrowRight />}
            iconBackground="primary100"
            onClick={() => {
              trackUsage('didClickOnManageBookings');
              window.location.href = '/admin/content-manager/collectionType/api::booking.booking';
            }}
          />

          <ContentBox
            title="Configure settings"
            subtitle="Set up your application preferences"
            icon={<Puzzle />}
            iconBackground="primary100"
            onClick={() => {
              trackUsage('didClickOnSettings');
              window.location.href = '/admin/settings';
            }}
          />
        </Flex>

        <Box shadow="tableShadow" background="neutral0" padding={6} borderRadius="borderRadius">
          <Typography variant="delta" as="h2">
            Documentation & Resources
          </Typography>
          <Box paddingTop={4}>
            <Flex gap={4}>
              <Link href="https://docs.strapi.io" target="_blank">
                Official Documentation
              </Link>
              <Link href="https://github.com/yourusername/smart-park" target="_blank">
                GitHub Repository
              </Link>
              <Link href="mailto:support@example.com">
                Contact Support
              </Link>
            </Flex>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};

export default HomePage; 