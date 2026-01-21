"""
Order processing module - Refactored for clarity.

Changes made:
1. Extracted constants to replace magic numbers
2. Created small, focused validation functions
3. Separated pricing logic into its own module
4. Used early returns to reduce nesting
5. Improved variable naming
6. Single responsibility per function
7. Created a dataclass for order results
"""

from dataclasses import dataclass
from typing import Optional, List, Dict, Any


# =============================================================================
# CONSTANTS - Replace magic numbers with named values
# =============================================================================

class DiscountRates:
    """Category-based discount rates."""
    ELECTRONICS_HIGH_VALUE = 0.05      # 5% off electronics over $100
    ELECTRONICS_MID_VALUE = 0.03       # 3% off electronics over $50
    CLOTHING_BULK = 0.10               # 10% off 3+ clothing items
    BOOKS_BULK = 0.15                  # 15% off 5+ books
    MAX_COUPON_PERCENT = 50            # Maximum percentage discount from coupons


class DiscountThresholds:
    """Price/quantity thresholds for discounts."""
    ELECTRONICS_HIGH = 100
    ELECTRONICS_MID = 50
    CLOTHING_MIN_QUANTITY = 3
    BOOKS_MIN_QUANTITY = 5


class ShippingRates:
    """Shipping costs by type and order value."""
    STANDARD_LOW = 5.99       # Orders under $50
    STANDARD_MID = 3.99       # Orders $50-$100
    STANDARD_HIGH = 0.00      # Orders over $100 (free)

    EXPRESS_LOW = 15.99
    EXPRESS_MID = 12.99
    EXPRESS_HIGH = 9.99

    OVERNIGHT = 29.99

    FREE_THRESHOLD_LOW = 50
    FREE_THRESHOLD_HIGH = 100


class TaxRates:
    """Tax configuration."""
    SALES_TAX = 0.08  # 8% sales tax


# =============================================================================
# DATA STRUCTURES
# =============================================================================

@dataclass
class OrderResult:
    """Result of an order processing attempt."""
    success: bool
    order_id: Optional[str] = None
    total: Optional[float] = None
    error: Optional[str] = None


# =============================================================================
# VALIDATION FUNCTIONS - Each validates one thing
# =============================================================================

def validate_user_data(user_data: Optional[Dict]) -> Optional[str]:
    """
    Validate user data and return error message if invalid.
    Returns None if valid.
    """
    if user_data is None:
        return "User data required"

    email = user_data.get("email")
    if not email:
        return "Email required"

    if "@" not in email or "." not in email:
        return "Invalid email format"

    name = user_data.get("name")
    if not name:
        return "Name required"

    if len(name) < 2:
        return "Name too short"

    return None


def validate_item(item: Optional[Dict]) -> Optional[str]:
    """
    Validate a single order item.
    Returns error message if invalid, None if valid.
    """
    if item is None:
        return "Item is null"

    if "price" not in item or "quantity" not in item:
        return "Item missing price or quantity"

    if item["price"] <= 0 or item["quantity"] <= 0:
        return "Invalid item price or quantity"

    return None


def validate_payment_info(payment_info: Optional[Dict]) -> Optional[str]:
    """
    Validate payment information.
    Returns error message if invalid, None if valid.
    """
    if payment_info is None:
        return "Payment info required"

    card_number = payment_info.get("card_number")
    if not card_number:
        return "Card number required"

    if not (15 <= len(card_number) <= 16):
        return "Invalid card number"

    if "expiry" not in payment_info:
        return "Expiry required"

    cvv = payment_info.get("cvv")
    if not cvv:
        return "CVV required"

    if not (3 <= len(cvv) <= 4):
        return "Invalid CVV"

    return None


# =============================================================================
# PRICING FUNCTIONS - Calculate costs
# =============================================================================

def calculate_item_discount(item: Dict) -> float:
    """
    Calculate the discount multiplier for a single item based on category rules.
    Returns a value between 0 and 1 to multiply against the price.
    """
    category = item.get("category")
    price = item["price"]
    quantity = item["quantity"]

    if category == "electronics":
        if price > DiscountThresholds.ELECTRONICS_HIGH:
            return 1 - DiscountRates.ELECTRONICS_HIGH_VALUE
        elif price > DiscountThresholds.ELECTRONICS_MID:
            return 1 - DiscountRates.ELECTRONICS_MID_VALUE

    elif category == "clothing":
        if quantity >= DiscountThresholds.CLOTHING_MIN_QUANTITY:
            return 1 - DiscountRates.CLOTHING_BULK

    elif category == "books":
        if quantity >= DiscountThresholds.BOOKS_MIN_QUANTITY:
            return 1 - DiscountRates.BOOKS_BULK

    return 1.0  # No discount


def calculate_items_subtotal(items: List[Dict]) -> float:
    """Calculate the subtotal for all items including item-level discounts."""
    subtotal = 0.0

    for item in items:
        base_price = item["price"] * item["quantity"]
        discount_multiplier = calculate_item_discount(item)
        subtotal += base_price * discount_multiplier

    return subtotal


def apply_coupon(subtotal: float, coupon_code: Optional[str], db) -> float:
    """
    Apply coupon discount to subtotal.
    Returns the new subtotal after discount.
    """
    if not coupon_code:
        return subtotal

    coupon = db.get_coupon(coupon_code)
    if not coupon or not coupon.get("active"):
        return subtotal

    if coupon.get("min_purchase", 0) > subtotal:
        return subtotal

    if coupon["type"] == "percent":
        discount_percent = min(coupon["value"], DiscountRates.MAX_COUPON_PERCENT)
        return subtotal * (1 - discount_percent / 100)

    elif coupon["type"] == "fixed":
        return max(0, subtotal - coupon["value"])

    return subtotal


def calculate_shipping(subtotal: float, shipping_type: str) -> Optional[float]:
    """
    Calculate shipping cost based on type and order value.
    Returns None if shipping type is invalid.
    """
    shipping_costs = {
        "standard": _get_standard_shipping(subtotal),
        "express": _get_express_shipping(subtotal),
        "overnight": ShippingRates.OVERNIGHT,
    }

    return shipping_costs.get(shipping_type)


def _get_standard_shipping(subtotal: float) -> float:
    """Calculate standard shipping rate based on subtotal."""
    if subtotal < ShippingRates.FREE_THRESHOLD_LOW:
        return ShippingRates.STANDARD_LOW
    elif subtotal < ShippingRates.FREE_THRESHOLD_HIGH:
        return ShippingRates.STANDARD_MID
    return ShippingRates.STANDARD_HIGH


def _get_express_shipping(subtotal: float) -> float:
    """Calculate express shipping rate based on subtotal."""
    if subtotal < ShippingRates.FREE_THRESHOLD_LOW:
        return ShippingRates.EXPRESS_LOW
    elif subtotal < ShippingRates.FREE_THRESHOLD_HIGH:
        return ShippingRates.EXPRESS_MID
    return ShippingRates.EXPRESS_HIGH


def calculate_tax(amount: float) -> float:
    """Calculate sales tax on the given amount."""
    return amount * TaxRates.SALES_TAX


# =============================================================================
# INVENTORY FUNCTIONS
# =============================================================================

def check_inventory_availability(items: List[Dict], inventory_service) -> Optional[str]:
    """
    Check if all items are available in inventory.
    Returns error message if any item is unavailable, None if all available.
    """
    for item in items:
        sku = item["sku"]
        inventory = inventory_service.check(sku)

        if inventory is None:
            return f"Item {sku} not found"

        if inventory["available"] >= item["quantity"]:
            continue  # Item is available

        # Check backorder possibility
        if not inventory.get("backorder_allowed"):
            return f"Item {sku} out of stock"

        if inventory.get("backorder_date") is None:
            return f"Item {sku} not available"

    return None


def reserve_inventory(items: List[Dict], inventory_service) -> None:
    """Reserve inventory for all items in the order."""
    for item in items:
        inventory_service.reserve(item["sku"], item["quantity"])


# =============================================================================
# PAYMENT FUNCTIONS
# =============================================================================

def process_payment(payment_info: Dict, total: float, db, logger) -> Optional[str]:
    """
    Process payment for the order.
    Returns error message if payment fails, None if successful.
    """
    try:
        payment_result = db.process_payment(payment_info, total)
        if not payment_result.get("success"):
            error_msg = payment_result.get("message", "Unknown error")
            return f"Payment failed: {error_msg}"
        return None
    except Exception as e:
        logger.error(f"Payment exception: {str(e)}")
        return "Payment processing error"


# =============================================================================
# NOTIFICATION FUNCTIONS
# =============================================================================

def send_order_confirmation(
    user_data: Dict,
    order_id: str,
    total: float,
    email_service,
    logger
) -> None:
    """Send order confirmation email. Failures are logged but don't fail the order."""
    try:
        email_service.send(
            to=user_data["email"],
            subject=f"Order Confirmation #{order_id}",
            body=f"Thank you {user_data['name']}! Your order total is ${total:.2f}"
        )
    except Exception as e:
        logger.warning(f"Failed to send email: {str(e)}")


# =============================================================================
# MAIN ORCHESTRATOR - Coordinates the order processing flow
# =============================================================================

def process_order(
    user_data: Dict,
    items: List[Dict],
    coupon_code: Optional[str],
    shipping_type: str,
    payment_info: Dict,
    notify: bool,
    db,
    logger,
    email_service,
    inventory_service
) -> OrderResult:
    """
    Process a customer order.

    This function orchestrates the order processing workflow by delegating
    to specialized functions for each step.
    """
    # Step 1: Validate user data
    user_error = validate_user_data(user_data)
    if user_error:
        logger.error(user_error)
        return OrderResult(success=False, error=user_error)

    # Step 2: Validate and calculate item totals
    for item in items:
        item_error = validate_item(item)
        if item_error:
            return OrderResult(success=False, error=item_error)

    subtotal = calculate_items_subtotal(items)

    # Step 3: Apply coupon if provided
    subtotal = apply_coupon(subtotal, coupon_code, db)
    if coupon_code:
        db.use_coupon(coupon_code, user_data["email"])

    # Step 4: Calculate shipping
    shipping = calculate_shipping(subtotal, shipping_type)
    if shipping is None:
        return OrderResult(success=False, error="Invalid shipping type")

    # Step 5: Calculate tax and total
    tax = calculate_tax(subtotal + shipping)
    total = subtotal + shipping + tax

    # Step 6: Check inventory availability
    inventory_error = check_inventory_availability(items, inventory_service)
    if inventory_error:
        return OrderResult(success=False, error=inventory_error)

    # Step 7: Validate and process payment
    payment_error = validate_payment_info(payment_info)
    if payment_error:
        return OrderResult(success=False, error=payment_error)

    payment_error = process_payment(payment_info, total, db, logger)
    if payment_error:
        logger.error(f"Payment failed for {user_data['email']}")
        return OrderResult(success=False, error=payment_error)

    # Step 8: Reserve inventory
    reserve_inventory(items, inventory_service)

    # Step 9: Create order record
    order_id = db.create_order({
        "user_email": user_data["email"],
        "user_name": user_data["name"],
        "items": items,
        "subtotal": subtotal,
        "shipping": shipping,
        "tax": tax,
        "total": total,
        "shipping_type": shipping_type,
        "coupon_code": coupon_code,
        "status": "confirmed"
    })

    # Step 10: Send confirmation (optional)
    if notify and email_service:
        send_order_confirmation(user_data, order_id, total, email_service, logger)

    logger.info(f"Order {order_id} created for {user_data['email']}, total: ${total:.2f}")
    return OrderResult(success=True, order_id=order_id, total=total)
