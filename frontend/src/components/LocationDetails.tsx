import React, { useEffect, useState } from 'react';
import { Location, Slot, locationService, slotService } from '../services/api';
import { socketService } from '../services/socket';
import { Box, Typography, Grid, Card, CardContent, Chip, Button } from '@mui/material';
import { formatTime } from '../utils/dateUtils';

interface LocationDetailsProps {
  locationId: number;
  onSlotSelect?: (slot: Slot) => void;
}

export default function LocationDetails({ locationId, onSlotSelect }: LocationDetailsProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        setLoading(true);
        const locationData = await locationService.getById(locationId.toString());
        const slotsData = await slotService.getByLocation(locationId.toString());
        console.log("Slots Data:", slotsData);
        setLocation(locationData);
        setSlots(slotsData);
        setError(null);
      } catch (err) {
        setError('Failed to load location details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationDetails();

    // Subscribe to real-time updates
    const unsubscribeSlot = socketService.onSlotStatusUpdate(({ slotId, status }) => {
      setSlots(prevSlots =>
        prevSlots.map(slot =>
          slot.documentId === slotId ? { ...slot, status } : slot
        )
      );
    });

    const unsubscribeLocation = socketService.onLocationUpdate(({ locationId: updatedLocationId, availableSlots }) => {
      if (locationId === updatedLocationId && location) {
        setLocation(prev => prev ? { ...prev, availableSlots } : null);
      }
    });

    return () => {
      unsubscribeSlot();
      unsubscribeLocation();
    };
  }, [locationId]);

  if (loading) return <Box>Loading...</Box>;
  if (error) return <Box color="error.main">{error}</Box>;
  if (!location) return null;

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'reserved':
        return 'warning';
      case 'maintenance':
        return 'default';
      default:
        return 'default';
    }
  };

  const getCurrentOpeningHours = () => {
    const today = new Date().toLocaleLowerCase().slice(0, 3);
    const todayHours = location.openingHours.find(h => h.day.startsWith(today));
    if (!todayHours || todayHours.isClosed) return 'Closed Today';
    return `${formatTime(todayHours.openTime)} - ${formatTime(todayHours.closeTime)}`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {location.name}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {location.address}
      </Typography>

      <Box my={2}>
        <Typography variant="body2">
          Opening Hours: {getCurrentOpeningHours()}
        </Typography>
        <Typography variant="body2">
          Available Slots: {location.availableSlots} / {location.totalSlots}
        </Typography>
      </Box>

      {location.description && (
        <Typography variant="body1" paragraph>
          {location.description}
        </Typography>
      )}

      <Grid container spacing={2}>
        {slots.map((slot) => (
          <Grid item xs={12} sm={6} md={4} key={slot.documentId}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {slot.name}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Chip
                    label={slot.slotStatus}
                    color={getSlotStatusColor(slot.slotStatus) as any}
                    size="small"
                  />
                  <Typography variant="body2">
                    ${slot.price}/hour
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Chip
                    label={slot.type}
                    variant="outlined"
                    size="small"
                  />
                  {onSlotSelect && slot.slotStatus === 'available' && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => onSlotSelect(slot)}
                    >
                      Select
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 