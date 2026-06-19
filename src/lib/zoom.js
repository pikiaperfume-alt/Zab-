export async function createZoomMeeting({ tutorId, tutorName, slot, isTutor }) {
  const zoomApiUrl = import.meta.env.VITE_ZOOM_API_URL || 'https://api.zoom.us/v2';
  const zoomJwt = import.meta.env.VITE_ZOOM_JWT;

  if (!zoomJwt) {
    throw new Error('Zoom JWT not configured. Add VITE_ZOOM_JWT.');
  }

  const response = await fetch(`${zoomApiUrl}/users/me/meetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${zoomJwt}`,
    },
    body: JSON.stringify({
      topic: isTutor ? `ZAB instructor session · ${tutorName}` : `ZAB tutoring session · ${tutorName}`,
      type: 2,
      start_time: new Date().toISOString(),
      duration: 45,
      timezone: 'UTC',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        approval_type: 2,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Zoom API error: ${errorBody}`);
  }

  return await response.json();
}
