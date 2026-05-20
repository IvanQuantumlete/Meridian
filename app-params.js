const isNode = typeof window === 'undefined';

const getAppParams = () => {
  if (isNode) {
    return {
      appId: import.meta.env.VITE_APP_ID || null,
      apiUrl: import.meta.env.VITE_API_URL || '',
    };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  if (accessToken) {
    window.localStorage.setItem('token', accessToken);
    urlParams.delete('access_token');
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }

  return {
    appId: import.meta.env.VITE_APP_ID || null,
    apiUrl: import.meta.env.VITE_API_URL || '',
    token: window.localStorage.getItem('token') || null,
  };
};

export const appParams = { ...getAppParams() };