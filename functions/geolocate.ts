import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const GMAPS_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, lat, lng, city, radius_km, items } = await req.json();

    if (action === 'geocode_city') {
      // Convert city name to coordinates
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${GMAPS_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results?.[0]) {
        const loc = data.results[0].geometry.location;
        return Response.json({ success: true, lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address });
      }
      return Response.json({ success: false, error: 'City not found' });
    }

    if (action === 'reverse_geocode') {
      // Convert coordinates to city name
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAPS_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results?.[0]) {
        const components = data.results[0].address_components;
        const city = components.find(c => c.types.includes('locality'))?.long_name || '';
        const country = components.find(c => c.types.includes('country'))?.long_name || '';
        return Response.json({ success: true, city, country, formatted: data.results[0].formatted_address });
      }
      return Response.json({ success: false, error: 'Location not found' });
    }

    if (action === 'filter_nearby') {
      // Filter items by distance from user location
      const R = 6371; // Earth radius km
      const nearby = (items || []).filter(item => {
        if (!item.latitude || !item.longitude) return false;
        const dLat = (item.latitude - lat) * Math.PI / 180;
        const dLng = (item.longitude - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(lat * Math.PI/180) * Math.cos(item.latitude * Math.PI/180) * Math.sin(dLng/2)**2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        item._distance_km = Math.round(dist * 10) / 10;
        return dist <= (radius_km || 50);
      }).sort((a, b) => a._distance_km - b._distance_km);
      return Response.json({ success: true, items: nearby });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});