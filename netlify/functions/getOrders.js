const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    // Query parameters from frontend (optional)
    const { created_from, limit, offset } = event.queryStringParameters;

    // Construct URL with optional query params
    const url = new URL('https://greatfollows.com/adminapi/v2/orders');
    if (created_from) url.searchParams.append('created_from', created_from);
    if (limit) url.searchParams.append('limit', limit);
    if (offset) url.searchParams.append('offset', offset);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.API_KEY // set this securely in Netlify env variables
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
