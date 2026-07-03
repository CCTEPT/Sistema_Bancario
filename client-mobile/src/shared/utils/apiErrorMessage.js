export const getApiErrorMessage = (error, defaultMessage = 'Ocurrió un error. Intenta de nuevo más tarde.') => {
  if (!error) return defaultMessage;

  const response = error.response || error?.response;
  const responseData = response?.data;

  if (responseData) {
    if (typeof responseData === 'string') {
      return responseData;
    }

    const message = responseData.message || responseData.error || responseData.errors?.[0]?.message;
    if (message) return message;
  }

  if (error.message?.includes('Network Error')) {
    return 'No se pudo conectar con el servidor. Verifica tu red o el servicio.';
  }

  if (response?.status === 404) {
    return 'No se encontró el servicio solicitado. Intenta de nuevo más tarde.';
  }

  if (response?.status === 401) {
    return 'No autorizado. Por favor inicia sesión de nuevo.';
  }

  return error.message || defaultMessage;
};