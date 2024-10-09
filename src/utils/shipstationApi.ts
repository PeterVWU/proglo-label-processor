const SHIPSTATION_PROXY = "https://shipstation-proxy.info-ba2.workers.dev";

export async function fetchOrder(orderNumber: string): Promise<string | null> {
    const response = await fetch(`${SHIPSTATION_PROXY}/orders?orderNumber=${orderNumber}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: any = await response.json();
    if (data.orders && data.orders.length > 0) {
        const firstUnfulfilled = data.orders.find((order: any) => order.orderStatus === "awaiting_shipment");
        return firstUnfulfilled ? firstUnfulfilled.orderId : null;
    }

    return null;
}

export async function markAsShipped(SSorderId: string, trackingNumber: string): Promise<void> {
    const body = JSON.stringify({
        orderId: SSorderId,
        carrierCode: 'usps',
        trackingNumber: trackingNumber,
        notifyCustomer: true,
        notifySalesChannel: true
    });

    const response = await fetch(`${SHIPSTATION_PROXY}/orders/markasshipped`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    await assignUserToOrder(SSorderId);
}

async function assignUserToOrder(SSorderId: string): Promise<void> {
    const response = await fetch(`${SHIPSTATION_PROXY}/orders/assignuser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orderIds: [SSorderId],
            userId: "1f021469-eff0-4cf3-a9ab-e6edccdc84f7"
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Assign user to order successfully:', data);
}