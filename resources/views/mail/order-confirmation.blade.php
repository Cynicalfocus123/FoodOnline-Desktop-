<!doctype html>
<html lang="en">
<body style="font-family:Arial,sans-serif;color:#171717">
<h1>Order received</h1>
<p>Your FoodOnlines order <strong>{{ $order->order_number }}</strong> has been placed.</p>
<p>Total: {{ $order->currency_code }} {{ \App\Support\Money::decimal($order->total_minor) }}</p>
<p>Payment: Cash on Delivery — pending collection.</p>
</body>
</html>
