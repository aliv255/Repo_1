"""
Order processing module - Example of overly complex code that needs refactoring.
"""

def process_order(user_data, items, coupon_code, shipping_type, payment_info, notify, db, logger, email_service, inventory_service):
    """
    Process a customer order - THIS FUNCTION IS INTENTIONALLY COMPLEX FOR REFACTORING DEMO.

    Issues present:
    - Too many parameters (10!)
    - Multiple responsibilities (validation, pricing, inventory, payment, notifications)
    - Deep nesting
    - Magic numbers
    - Poor variable naming
    - Long function (violates single responsibility)
    """
    result = {"success": False, "error": None, "order_id": None}

    # Validate user
    if user_data is not None:
        if "email" in user_data and user_data["email"] is not None:
            if "@" in user_data["email"] and "." in user_data["email"]:
                if "name" in user_data and user_data["name"] is not None:
                    if len(user_data["name"]) >= 2:
                        user_valid = True
                    else:
                        result["error"] = "Name too short"
                        logger.error("Name too short")
                        return result
                else:
                    result["error"] = "Name required"
                    logger.error("Name required")
                    return result
            else:
                result["error"] = "Invalid email format"
                logger.error("Invalid email format")
                return result
        else:
            result["error"] = "Email required"
            logger.error("Email required")
            return result
    else:
        result["error"] = "User data required"
        logger.error("User data required")
        return result

    # Calculate total with deeply nested discount logic
    t = 0  # Poor variable name
    for i in items:
        if i is not None:
            if "price" in i and "quantity" in i:
                if i["price"] > 0 and i["quantity"] > 0:
                    p = i["price"] * i["quantity"]  # Poor variable name
                    # Apply item-level discounts
                    if "category" in i:
                        if i["category"] == "electronics":
                            if i["price"] > 100:
                                p = p * 0.95  # Magic number: 5% off electronics over $100
                            elif i["price"] > 50:
                                p = p * 0.97  # Magic number: 3% off electronics over $50
                        elif i["category"] == "clothing":
                            if i["quantity"] >= 3:
                                p = p * 0.9  # Magic number: 10% off when buying 3+ clothing items
                        elif i["category"] == "books":
                            if i["quantity"] >= 5:
                                p = p * 0.85  # Magic number: 15% off when buying 5+ books
                    t = t + p
                else:
                    result["error"] = "Invalid item price or quantity"
                    return result
            else:
                result["error"] = "Item missing price or quantity"
                return result

    # Apply coupon with complex conditions
    if coupon_code is not None and coupon_code != "":
        c = db.get_coupon(coupon_code)  # Poor variable name
        if c is not None:
            if c["active"] == True:
                if c["min_purchase"] <= t:
                    if c["type"] == "percent":
                        if c["value"] <= 50:  # Magic number: max 50% off
                            t = t * (1 - c["value"] / 100)
                        else:
                            t = t * 0.5  # Cap at 50%
                    elif c["type"] == "fixed":
                        if c["value"] <= t:
                            t = t - c["value"]
                        else:
                            t = 0
                    # Mark coupon as used
                    db.use_coupon(coupon_code, user_data["email"])

    # Add shipping with nested conditions
    s = 0  # Poor variable name
    if shipping_type == "standard":
        if t < 50:  # Magic number
            s = 5.99  # Magic number
        elif t < 100:  # Magic number
            s = 3.99  # Magic number
        else:
            s = 0  # Free shipping over $100
    elif shipping_type == "express":
        if t < 50:
            s = 15.99  # Magic number
        elif t < 100:
            s = 12.99  # Magic number
        else:
            s = 9.99  # Magic number
    elif shipping_type == "overnight":
        s = 29.99  # Magic number
    else:
        result["error"] = "Invalid shipping type"
        return result

    t = t + s

    # Apply tax (magic number)
    tax = t * 0.08  # 8% tax
    t = t + tax

    # Check inventory with nested loops
    for i in items:
        inv = inventory_service.check(i["sku"])
        if inv is not None:
            if inv["available"] >= i["quantity"]:
                pass  # Has stock
            else:
                if inv["backorder_allowed"] == True:
                    if inv["backorder_date"] is not None:
                        # Allow backorder
                        pass
                    else:
                        result["error"] = f"Item {i['sku']} not available"
                        return result
                else:
                    result["error"] = f"Item {i['sku']} out of stock"
                    return result
        else:
            result["error"] = f"Item {i['sku']} not found"
            return result

    # Process payment with nested error handling
    if payment_info is not None:
        if "card_number" in payment_info:
            if len(payment_info["card_number"]) >= 15 and len(payment_info["card_number"]) <= 16:
                if "expiry" in payment_info:
                    if "cvv" in payment_info:
                        if len(payment_info["cvv"]) >= 3 and len(payment_info["cvv"]) <= 4:
                            # Process payment
                            try:
                                payment_result = db.process_payment(payment_info, t)
                                if payment_result["success"] == False:
                                    result["error"] = "Payment failed: " + payment_result.get("message", "Unknown error")
                                    logger.error(f"Payment failed for {user_data['email']}")
                                    return result
                            except Exception as e:
                                result["error"] = "Payment processing error"
                                logger.error(f"Payment exception: {str(e)}")
                                return result
                        else:
                            result["error"] = "Invalid CVV"
                            return result
                    else:
                        result["error"] = "CVV required"
                        return result
                else:
                    result["error"] = "Expiry required"
                    return result
            else:
                result["error"] = "Invalid card number"
                return result
        else:
            result["error"] = "Card number required"
            return result
    else:
        result["error"] = "Payment info required"
        return result

    # Reserve inventory
    for i in items:
        inventory_service.reserve(i["sku"], i["quantity"])

    # Create order in database
    order_id = db.create_order({
        "user_email": user_data["email"],
        "user_name": user_data["name"],
        "items": items,
        "subtotal": t - tax - s,
        "shipping": s,
        "tax": tax,
        "total": t,
        "shipping_type": shipping_type,
        "coupon_code": coupon_code,
        "status": "confirmed"
    })

    # Send notifications with nested conditions
    if notify == True:
        if email_service is not None:
            try:
                email_service.send(
                    to=user_data["email"],
                    subject="Order Confirmation #" + str(order_id),
                    body=f"Thank you {user_data['name']}! Your order total is ${t:.2f}"
                )
            except Exception as e:
                logger.warning(f"Failed to send email: {str(e)}")
                # Don't fail the order if email fails

    result["success"] = True
    result["order_id"] = order_id
    result["total"] = t
    logger.info(f"Order {order_id} created for {user_data['email']}, total: ${t:.2f}")
    return result
