const ApiError = require("../utils/ApiError");

const EXCHANGE_RATE_API_BASE_URL = "https://v6.exchangerate-api.com/v6";

const REQUEST_TIMEOUT_MS = 10000;

const fetchExchangeRateData = async (url) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    let responseData = null;

    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new ApiError(
          502,
          "Currency service authentication failed. Check the ExchangeRate API key.",
        );
      }

      if (response.status === 429) {
        throw new ApiError(
          429,
          "Currency service rate limit reached. Please try again later.",
        );
      }

      throw new ApiError(
        502,
        "The currency service returned an unexpected error.",
      );
    }

    if (responseData?.result === "error") {
      throw new ApiError(
        502,
        responseData["error-type"] || "The currency service returned an error.",
      );
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new ApiError(504, "The currency service request timed out.");
    }

    throw new ApiError(502, "Unable to connect to the currency service.");
  } finally {
    clearTimeout(timeout);
  }
};

const convertCurrency = async ({ fromCurrency, toCurrency, amount }) => {
  const apiKey = process.env.EXCHANGERATE_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      500,
      "EXCHANGERATE_API_KEY is missing from the environment variables.",
    );
  }

  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  const numericAmount = Number(amount);

  if (!from || from.length !== 3) {
    throw new ApiError(400, "Source currency must be a 3-letter code.");
  }

  if (!to || to.length !== 3) {
    throw new ApiError(400, "Target currency must be a 3-letter code.");
  }

  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    throw new ApiError(400, "Amount must be a valid positive number.");
  }

  const url = `${EXCHANGE_RATE_API_BASE_URL}/${apiKey}/pair/${from}/${to}/${numericAmount}`;

  const conversionData = await fetchExchangeRateData(url);

  return {
    from,
    to,
    originalAmount: numericAmount,
    convertedAmount: conversionData.conversion_result,
    conversionRate: conversionData.conversion_rate,
    lastUpdatedUtc: conversionData.time_last_update_utc || null,
    nextUpdateUtc: conversionData.time_next_update_utc || null,
  };
};

module.exports = {
  convertCurrency,
};
