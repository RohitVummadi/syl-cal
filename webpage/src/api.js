import { auth } from './firebase';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function authorizedFetch(path, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Your session has ended. Please sign in again.');
  }

  const token = await user.getIdToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error('Your sign-in session has expired. Please sign in again.');
  }
  return response;
}

async function readError(response, fallback) {
  try {
    const body = await response.json();
    const fileErrors = body.fileErrors?.map(({ filename, error }) => `${filename}: ${error}`).join(' ');
    return fileErrors || body.error || fallback;
  } catch {
    return fallback;
  }
}

export async function processSyllabi(files) {
  const formData = new FormData();
  files.forEach((file, index) => formData.append(`file${index}`, file));
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timeZone) formData.append('timeZone', timeZone);
  const response = await authorizedFetch('/api/process-syllabi', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'We could not create your calendar.'));
  }
  return response.json();
}

export async function downloadCalendar(calendarId) {
  const response = await authorizedFetch(`/api/download/${calendarId}`);
  if (!response.ok) {
    throw new Error(await readError(response, 'We could not download your calendar.'));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'syl-cal-calendar.ics';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
