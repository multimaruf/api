const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const {
      service, // ✅ নতুন query parameter
      created_from = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000),
      limit = "1000",
      offset = "0",
      sort = "date-desc"
    } = event.queryStringParameters || {};

    // মূল API URL
    const url = new URL('https://greatfollows.com/adminapi/v2/orders');
    url.searchParams.append('order_status', 'completed');
    url.searchParams.append('created_from', created_from);
    url.searchParams.append('limit', limit);
    url.searchParams.append('offset', offset);
    url.searchParams.append('sort', sort);

    const res = await fetch(url.toString(), {
      headers: { 'X-Api-Key': process.env.API_KEY }
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();

    // যদি service parameter থাকে, তাহলে ফিল্টার করো
    let filteredData = data.data || [];
    if (service) {
      filteredData = filteredData.filter(order => String(order.service) === String(service));
    }

    // সর্বশেষ ৫টি order নাও (frontend-এ badge দেখানোর সুবিধার জন্য)
    const last5 = filteredData
      .sort((a, b) => new Date(b.order_updated) - new Date(a.order_updated))
      .slice(0, 5);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: last5 }) // শুধু দরকারি অংশ পাঠাও
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: err.message })
    };
  }
};
