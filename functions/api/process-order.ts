import { fetchOrder, markAsShipped } from '../../src/utils/shipstationApi';

export async function onRequestPost(context: any) {
  try {
    const { orderNumber, trackingNumber } = await context.request.json();

    if (!orderNumber || !trackingNumber) {
      return new Response(JSON.stringify({ error: 'Both order number and tracking number are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const SSOrderId = await fetchOrder(orderNumber);

    if (!SSOrderId) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await markAsShipped(SSOrderId, trackingNumber);

    return new Response(JSON.stringify({ message: 'Order processed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}